import type { GuardList } from '../interfaces/guardList.interface';
import { isGuardTimeEqual, type GuardTime, compareGuardTime } from '../helpers/periodHelpers';
import { guardListHistory } from '../data/guardListHistory.data';
import type { DbGuardList, DbGuardTime } from '../data/guardListHistory.data';
import { Soldier } from '../interfaces/soldier.interface';

export function isTeamBusy(
  guardList: GuardList[],
  guardTime: GuardTime,
  teamName: string
): boolean {
  return guardList.some((guardPostList) => {
    const guardPeriod = guardPostList.guardList.find((gp) =>
      isGuardTimeEqual(gp.guardTime, guardTime)
    );

    return guardPeriod && guardPeriod.team === teamName;
  });
}

/**
 * returns true if the soldier is busy in the specified guard time, given a guard list
 */
export function isSoldierBusy(
  guardList: GuardList[],
  guardTime: GuardTime,
  soldierName: string
): boolean {
  return guardList.some((guardPostList) => {
    const guardPeriod = guardPostList.guardList.find((glp) =>
      isGuardTimeEqual(glp.guardTime, guardTime)
    );

    return guardPeriod?.soldiers.includes(soldierName);
  });
}

export function saveGuardLists(guardLists: GuardList[], overrideFromGuardTime: GuardTime): void {
  guardLists.forEach((gl) => {
    const historyGl = guardListHistory.find((glh) => glh.guardPostName === gl.guardPostName);
    const serializedGuardList = serializeGuardList(gl);
    if (historyGl) {
      // guard list history exist for this guard post. merge lists

      // remove overlapping items before index overrideFromGuardTime (should do nothing as the list was created starting from overrideFromGuardTime)
      const glNewOverrideIndex = gl.guardList.findIndex(
        (glp) => compareGuardTime(glp.guardTime, overrideFromGuardTime) <= 0
      );
      const finalGuardListToAdd = serializedGuardList.guardList.slice(glNewOverrideIndex);

      // add the new guard list to the history
      historyGl.guardList.push(...finalGuardListToAdd);
    } else {
      // guard list history does not exist for this guard post
      guardListHistory.push(serializedGuardList);
    }
  });
}

/**
 * removes all guard list periods that start after the specified guard time
 * @param fromGuardTime remove all guard list periods that start after this guard time
 */
export function removeHistoryGuardListPeriodsFrom(fromGuardTime: GuardTime): void {
  guardListHistory.forEach((glh) => {
    const glOldOverrideIndex = glh.guardList.findIndex(
      (glp) => compareGuardTime(deserializeGuardTime(glp.guardTime), fromGuardTime) <= 0
    );
    if (glOldOverrideIndex > -1) {
      glh.guardList.splice(glOldOverrideIndex);
    }
  });
}

/**
 * merges two guard lists
 * @returns merged guard list array
 */
export function mergeGuardLists(guardLists1: GuardList[], guardLists2: GuardList[]): GuardList[] {
  const mergedGuardLists = [...guardLists1];

  guardLists2.forEach((gl) => {
    const mergedGuardList = mergedGuardLists.find((gl1) => gl1.guardPostName === gl.guardPostName);
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

function deserializeGuardList(dbGuardList: DbGuardList): GuardList {
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

export function getSoldiersByLatestGuardOrder(guardLists: GuardList[]): Soldier[] {
  const soldiers: Soldier[] = [];

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
