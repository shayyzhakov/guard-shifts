import type { GuardList } from '../interfaces/guardList.interface';
import { isGuardTimeEqual, type GuardTime, compareGuardTime } from '../helpers/periodHelpers';
import { guardListHistory } from '../data/guardListHistory.data';
import type { DbGuardList, DbGuardTime } from '../data/guardListHistory.data';

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

      // remove overlapping items before index overrideFromGuardTime
      const glNewOverrideIndex = gl.guardList.findIndex(
        (glp) => compareGuardTime(glp.guardTime, overrideFromGuardTime) <= 0
      );
      const finalGuardListToAdd = serializedGuardList.guardList.slice(glNewOverrideIndex);

      // remove overlapping items starting after index overrideFromGuardTime
      const glOldOverrideIndex = historyGl.guardList.findIndex(
        (glp) => compareGuardTime(deserializeGuardTime(glp.guardTime), overrideFromGuardTime) <= 0
      );
      if (glOldOverrideIndex > -1) {
        historyGl.guardList.splice(glOldOverrideIndex);
      }
      historyGl.guardList.push(...finalGuardListToAdd);
    } else {
      // guard list history does not exist for this guard post
      guardListHistory.push(serializedGuardList);
    }
  });
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

// function deserializeGuardList(dbGuardList: DbGuardList): GuardList {
//   return {
//     ...dbGuardList,
//     guardList: dbGuardList.guardList.map((glp) => ({
//       ...glp,
//       guardTime: deserializeGuardTime(glp.guardTime),
//     })),
//   };
// }

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

export function getFullGuardListHistory(): DbGuardList[] {
  return guardListHistory; //.map(deserializeGuardList);
}
