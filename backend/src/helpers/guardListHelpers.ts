import { strategies } from '../consts';
import { GuardList, GuardListShift } from '../interfaces/guardList.interface';
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
  const shifts = guardLists.flatMap((gl) => gl.shifts);

  // sort guard periods by guard time from latest to oldest
  const sortedShifts = shifts.sort((a, b) =>
    compareGuardTime(a.guardTime, b.guardTime) > 0 ? 1 : -1
  );

  // add soldiers to the list, from the oldest to the newest
  sortedShifts.forEach((gp) => {
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
      mergedGuardList.shifts.push(...gl.shifts);
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
    const glOldOverrideIndex = gl.shifts.findIndex(
      (shift) => compareGuardTime(shift.guardTime, fromGuardTime) <= 0
    );
    if (glOldOverrideIndex > -1) {
      gl.shifts.splice(glOldOverrideIndex);
    }

    return gl;
  });
}

/**
 * Returns true if the team is busy in the specified guard time, given a guard list.
 */
export function isTeamBusy(guardList: GuardList[], guardTime: GuardTime, teamId: string): boolean {
  return guardList.some((guardPostList) => {
    const shift = guardPostList.shifts.find((gp) => {
      const isLater = isGuardTimeGreaterThanOrEqual(guardTime, gp.guardTime);
      const isBefore = isGuardTimeBefore(
        guardTime,
        addDurationToGuardTime(gp.guardTime, gp.duration)
      );
      return isLater && isBefore;
    });

    return shift && shift.team === teamId;
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
    const shift = guardPostList.shifts.find((shift) => {
      const isLater = isGuardTimeGreaterThanOrEqual(guardTime, shift.guardTime);
      const isBefore = isGuardTimeBefore(
        guardTime,
        addDurationToGuardTime(shift.guardTime, shift.duration)
      );
      return isLater && isBefore;
    });

    return shift?.soldiers.includes(soldierId);
  });
}

export function simplifyShifts(shifts: GuardListShift[]): GuardListShift[] {
  // remove empty periods
  const simplifiedGuardListForGuardPost = shifts.filter(
    (shift) => shift.soldiers.length > 0 || shift.error
  );

  return simplifiedGuardListForGuardPost;
}
