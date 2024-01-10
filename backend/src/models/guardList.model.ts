import type { GuardList } from '../interfaces/guardList.interface';
import { type GuardTime, compareGuardTime } from '../helpers/periodHelpers';
import { guardListHistory } from '../mocks/guardListHistory.data';
import type { DbGuardList, DbGuardTime } from '../mocks/guardListHistory.data';

export async function saveGuardLists(
  guardLists: GuardList[],
  startingFromGuardTime: GuardTime
): Promise<void> {
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

export async function getFullGuardListHistory(): Promise<GuardList[]> {
  return guardListHistory.map(deserializeGuardList);
}
