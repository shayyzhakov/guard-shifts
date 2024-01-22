import type { GuardList, GuardListShift } from '../interfaces/guardList.interface';
import { type GuardTime, compareGuardTime } from '../helpers/periodHelpers';
import type { DbGuardList, DbGuardListShift, DbGuardTime } from '../interfaces/db.types';
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
      await removeHistoryShiftsFromGuardTime(historyGl, startingFromGuardTime);

      // add the new guard list to the history
      addGuardPostShifts(historyGl.guardPostId, serializedGuardList.shifts);
    } else {
      // guard list history does not exist for this guard post
      await createGuardList(serializedGuardList);
    }
  });

  await Promise.all(promises);
}

async function createGuardList(createParams: DbGuardList) {
  await getDbClient().send(
    new PutItemCommand({ TableName: 'GuardShifts', Item: marshall(createParams) })
  );
}

async function removeHistoryShiftsFromGuardTime(
  guardList: DbGuardList,
  fromGuardTime: GuardTime
): Promise<void> {
  const glOldOverrideIndex = guardList.shifts.findIndex(
    (shift) => compareGuardTime(deserializeGuardTime(shift.guardTime), fromGuardTime) <= 0
  );
  if (glOldOverrideIndex > -1) {
    await setGuardPostShifts(guardList.guardPostId, guardList.shifts.slice(0, glOldOverrideIndex));
  }
}

async function setGuardPostShifts(guardPostId: string, shifts: DbGuardListShift[]): Promise<void> {
  await getDbClient().send(
    new UpdateItemCommand({
      TableName: 'GuardShifts',
      Key: { guardPostId: { S: guardPostId } },
      UpdateExpression: 'SET shifts = :shifts',
      ExpressionAttributeValues: {
        ':shifts': { L: shifts.map((shift) => ({ M: marshall(shift) })) },
      },
    })
  );
}

async function addGuardPostShifts(guardPostId: string, shifts: DbGuardListShift[]): Promise<void> {
  await getDbClient().send(
    new UpdateItemCommand({
      TableName: 'GuardShifts',
      Key: { guardPostId: { S: guardPostId } },
      UpdateExpression: 'SET shifts = list_append(shifts, :shifts)',
      ExpressionAttributeValues: {
        ':shifts': { L: shifts.map((shift) => ({ M: marshall(shift) })) },
      },
    })
  );
}

function serizlizeGuardListShifts(shifts: GuardListShift[]): DbGuardListShift[] {
  return shifts.map((shift) => ({
    ...shift,
    guardTime: serializeGuardTime(shift.guardTime),
  }));
}

function serializeGuardList(guardList: GuardList): DbGuardList {
  return {
    ...guardList,
    shifts: serizlizeGuardListShifts(guardList.shifts),
  };
}

export function deserializeGuardList(dbGuardList: DbGuardList): GuardList {
  return {
    ...dbGuardList,
    shifts: dbGuardList.shifts.map((shift) => ({
      ...shift,
      guardTime: deserializeGuardTime(shift.guardTime),
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
