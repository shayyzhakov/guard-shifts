import { strategies } from '../consts';
import { GuardList, GuardListPeriod } from '../interfaces/guardList.interface';
import { GuardPost } from '../interfaces/guardPost.interface';
import {
  GuardTime,
  addDurationToGuardTime,
  compareGuardTime,
  isGuardTimeBefore,
  isGuardTimeGreaterThanOrEqual,
} from './periodHelpers';

export function getGuardPostOrder(guardPost: GuardPost): number {
  const strategy = strategies.find((s) => s.id === guardPost.strategy);
  if (!strategy) {
    console.error(`could not find strategy named ${guardPost.strategy}`);
    return 999;
  }

  return strategy.order;
}

export function getSoldierIdsByLatestGuardOrder(guardLists: GuardList[]): string[] {
  const soldiers: string[] = [];

  // flatten guard lists to array of guard periods
  const guardPeriods = guardLists.flatMap((gl) => gl.guardList);

  // sort guard periods by guard time from latest to oldest
  const sortedGuardPeriods = guardPeriods.sort((a, b) =>
    compareGuardTime(a.guardTime, b.guardTime) > 0 ? 1 : -1
  );

  // add soldiers to the list, from the oldest to the newest
  sortedGuardPeriods.forEach((gp) => {
    gp.soldiers.forEach((soldier) => {
      if (!soldiers.includes(soldier)) {
        soldiers.unshift(soldier);
      }
    });
  });

  return soldiers;
}

/**
 * Merges two guard lists.
 * @returns Merged guard list array.
 */
export function mergeGuardLists(guardLists1: GuardList[], guardLists2: GuardList[]): GuardList[] {
  const mergedGuardLists = [...guardLists1];

  guardLists2.forEach((gl) => {
    const mergedGuardList = mergedGuardLists.find((gl1) => gl1.guardPostId === gl.guardPostId);
    if (mergedGuardList) {
      // TODO: delete overlapping periods
      mergedGuardList.guardList.push(...gl.guardList);
    } else {
      mergedGuardLists.push(gl);
    }
  });

  return mergedGuardLists;
}

/**
 * Removes all guard list periods that start after the specified guard time. The changes are NOT committed to the database.
 */
export function truncateGuardListFromGuardTime(
  guardLists: GuardList[],
  fromGuardTime: GuardTime
): void {
  guardLists.forEach((gl) => {
    const glOldOverrideIndex = gl.guardList.findIndex(
      (glp) => compareGuardTime(glp.guardTime, fromGuardTime) <= 0
    );
    if (glOldOverrideIndex > -1) {
      gl.guardList.splice(glOldOverrideIndex);
    }

    return gl;
  });
}

/**
 * Returns true if the team is busy in the specified guard time, given a guard list.
 */
export function isTeamBusy(guardList: GuardList[], guardTime: GuardTime, teamId: string): boolean {
  return guardList.some((guardPostList) => {
    const guardPeriod = guardPostList.guardList.find((gp) => {
      const isLater = isGuardTimeGreaterThanOrEqual(guardTime, gp.guardTime);
      const isBefore = isGuardTimeBefore(
        guardTime,
        addDurationToGuardTime(gp.guardTime, gp.duration)
      );
      return isLater && isBefore;
    });

    return guardPeriod && guardPeriod.team === teamId;
  });
}

/**
 * Returns true if the soldier is busy in the specified guard time, given a guard list.
 */
export function isSoldierBusy(
  guardList: GuardList[],
  guardTime: GuardTime,
  soldierId: string
): boolean {
  return guardList.some((guardPostList) => {
    const guardPeriod = guardPostList.guardList.find((glp) => {
      const isLater = isGuardTimeGreaterThanOrEqual(guardTime, glp.guardTime);
      const isBefore = isGuardTimeBefore(
        guardTime,
        addDurationToGuardTime(glp.guardTime, glp.duration)
      );
      return isLater && isBefore;
    });

    return guardPeriod?.soldiers.includes(soldierId);
  });
}

export function simplifyGuardList(guardListForGuardPost: GuardListPeriod[]): GuardListPeriod[] {
  // remove empty periods
  const simplifiedGuardListForGuardPost = guardListForGuardPost.filter(
    (guardPeriod) => guardPeriod.soldiers.length > 0 || guardPeriod.error
  );

  return simplifiedGuardListForGuardPost;
}
