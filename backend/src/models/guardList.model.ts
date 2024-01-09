import type { GuardList } from '../interfaces/guardList.interface';
import {
  type GuardTime,
  compareGuardTime,
  isGuardTimeGreaterThanOrEqual,
  isGuardTimeBefore,
  addDurationToGuardTime,
} from '../helpers/periodHelpers';
import { guardListHistory } from '../mocks/guardListHistory.data';
import type { DbGuardList, DbGuardTime } from '../mocks/guardListHistory.data';

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
  soldierName: string
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

    return guardPeriod?.soldiers.includes(soldierName);
  });
}

export function saveGuardLists(guardLists: GuardList[], startingFromGuardTime: GuardTime): void {
  guardLists.forEach((gl) => {
    const historyGl = guardListHistory.find((glh) => glh.guardPostId === gl.guardPostId);
    const serializedGuardList = serializeGuardList(gl);
    if (historyGl) {
      // guard list history exist for this guard post. merge lists

      // remove overlapping items from the history
      removeHistoryGuardListPeriodsFromGuardTime(gl.guardPostId, startingFromGuardTime);

      // add the new guard list to the history
      historyGl.guardList.push(...serializedGuardList.guardList);
    } else {
      // guard list history does not exist for this guard post
      guardListHistory.push(serializedGuardList);
    }
  });
}

function removeHistoryGuardListPeriodsFromGuardTime(
  guardPostId: string,
  fromGuardTime: GuardTime
): void {
  const guardList = guardListHistory.find((gl) => gl.guardPostId === guardPostId);
  if (!guardList) {
    return;
  }

  const glOldOverrideIndex = guardList.guardList.findIndex(
    (glp) => compareGuardTime(deserializeGuardTime(glp.guardTime), fromGuardTime) <= 0
  );
  if (glOldOverrideIndex > -1) {
    guardList.guardList.splice(glOldOverrideIndex);
  }
}

/**
 * Removes all guard list periods that start after the specified guard time.
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

function serializeGuardList(guardList: GuardList): DbGuardList {
  return {
    ...guardList,
    guardList: guardList.guardList.map((glp) => ({
      ...glp,
      guardTime: serializeGuardTime(glp.guardTime),
    })),
  };
}

export function deserializeGuardList(dbGuardList: DbGuardList): GuardList {
  return {
    ...dbGuardList,
    guardList: dbGuardList.guardList.map((glp) => ({
      ...glp,
      guardTime: deserializeGuardTime(glp.guardTime),
    })),
  };
}

function serializeGuardTime(guardTime: GuardTime): DbGuardTime {
  return {
    ...guardTime,
    date: guardTime.date.toDateString(),
  };
}

function deserializeGuardTime(dbGuardTime: DbGuardTime): GuardTime {
  return {
    ...dbGuardTime,
    date: new Date(dbGuardTime.date),
  };
}

export function getFullGuardListHistory(): GuardList[] {
  return guardListHistory.map(deserializeGuardList);
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
