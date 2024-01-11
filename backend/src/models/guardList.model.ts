import type { GuardList, GuardListPeriod } from '../interfaces/guardList.interface';
import { type GuardTime, compareGuardTime } from '../helpers/periodHelpers';
import type { DbGuardList, DbGuardListPeriod, DbGuardTime } from '../interfaces/db.types';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { PutItemCommand, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { getDbClient } from '../helpers/dbClient';

export async function saveGuardLists(
  guardLists: GuardList[],
  startingFromGuardTime: GuardTime
): Promise<void> {
  const guardListHistory = await getFullGuardListHistoryDeserialized();
  const promises = guardLists.map(async (gl) => {
    const historyGl = guardListHistory.find((glh) => glh.guardPostId === gl.guardPostId);
    const serializedGuardList = serializeGuardList(gl);
    if (historyGl) {
      // guard list history exist for this guard post. merge lists

      // remove overlapping items from the history
      await removeHistoryGuardListPeriodsFromGuardTime(historyGl, startingFromGuardTime);

      // add the new guard list to the history
      addGuardPostShifts(historyGl.guardPostId, serializedGuardList.guardList);
    } else {
      // guard list history does not exist for this guard post
      await createGuardList(serializedGuardList);
    }
  });

  await Promise.all(promises);
}

export async function createGuardList(createParams: DbGuardList) {
  await getDbClient().send(
    new PutItemCommand({ TableName: 'GuardShifts', Item: marshall(createParams) })
  );
}

async function removeHistoryGuardListPeriodsFromGuardTime(
  guardList: DbGuardList,
  fromGuardTime: GuardTime
): Promise<void> {
  const glOldOverrideIndex = guardList.guardList.findIndex(
    (glp) => compareGuardTime(deserializeGuardTime(glp.guardTime), fromGuardTime) <= 0
  );
  if (glOldOverrideIndex > -1) {
    await setGuardPostShifts(
      guardList.guardPostId,
      guardList.guardList.slice(0, glOldOverrideIndex)
    );
  }
}

async function setGuardPostShifts(
  guardPostId: string,
  guardListPeriods: DbGuardListPeriod[]
): Promise<void> {
  await getDbClient().send(
    new UpdateItemCommand({
      TableName: 'GuardShifts',
      Key: { guardPostId: { S: guardPostId } },
      UpdateExpression: 'SET guardList = :guardList',
      ExpressionAttributeValues: {
        ':guardList': { L: guardListPeriods.map((x) => ({ M: marshall(x) })) },
      },
    })
  );
}

async function addGuardPostShifts(
  guardPostId: string,
  guardListPeriods: DbGuardListPeriod[]
): Promise<void> {
  await getDbClient().send(
    new UpdateItemCommand({
      TableName: 'GuardShifts',
      Key: { guardPostId: { S: guardPostId } },
      UpdateExpression: 'SET guardList = list_append(guardList, :guardList)',
      ExpressionAttributeValues: {
        ':guardList': { L: guardListPeriods.map((x) => ({ M: marshall(x) })) },
      },
    })
  );
}

function serizlizeGuardListPeriod(guardListPeriod: GuardListPeriod[]): DbGuardListPeriod[] {
  return guardListPeriod.map((glp) => ({
    ...glp,
    guardTime: serializeGuardTime(glp.guardTime),
  }));
}

function serializeGuardList(guardList: GuardList): DbGuardList {
  return {
    ...guardList,
    guardList: serizlizeGuardListPeriod(guardList.guardList),
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

async function getFullGuardListHistoryDeserialized(): Promise<DbGuardList[]> {
  const res = await getDbClient().send(new ScanCommand({ TableName: 'GuardShifts' }));

  return (res.Items?.map((item) => unmarshall(item)) ?? []) as DbGuardList[];
}

export async function getFullGuardListHistory(): Promise<GuardList[]> {
  return (await getFullGuardListHistoryDeserialized()).map((gl) => deserializeGuardList(gl));
}
