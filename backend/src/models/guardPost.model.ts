import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import type { GuardPost } from '../interfaces/guardPost.interface';
import { getDbClient } from '../helpers/dbClient';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { occupationByPeriod } from '../helpers/guardPostHelpers';

export async function getAllGuardPosts(): Promise<GuardPost[]> {
  const res = await getDbClient().send(new ScanCommand({ TableName: 'GuardPosts' }));

  return (res.Items?.map((item) => unmarshall(item)) ?? []) as GuardPost[];
}

export async function getGuardPostById(guarPostId: string): Promise<GuardPost | undefined> {
  const res = await getDbClient().send(
    new GetItemCommand({
      TableName: 'GuardPosts',
      Key: {
        primaryKey: { S: guarPostId },
      },
    })
  );

  const resItem = res.Item;
  if (!resItem) {
    console.log(`could not find guard post with id ${guarPostId}`);
    return;
  }

  return unmarshall(resItem) as GuardPost;
}

export async function createGuardPost(createParams: GuardPost) {
  await getDbClient().send(
    new PutItemCommand({ TableName: 'GuardPosts', Item: marshall(createParams) })
  );
}

export async function deleteGuardPostById(guardPostId: string): Promise<void> {
  await getDbClient().send(
    new DeleteItemCommand({
      TableName: 'GuardPosts',
      Key: { id: { S: guardPostId } },
    })
  );
}

export async function updateGuardPostById(
  guardPostId: string,
  updateParams: Omit<GuardPost, 'id'>
): Promise<void> {
  await getDbClient().send(
    new UpdateItemCommand({
      TableName: 'GuardPosts',
      Key: { id: { S: guardPostId } },
      UpdateExpression:
        'SET displayName = :displayName, strategy = :strategy, numOfSoldiers = :numOfSoldiers, occupation = :occupation',
      ExpressionAttributeValues: {
        ':displayName': { S: updateParams.displayName },
        ':strategy': { S: updateParams.strategy },
        ':numOfSoldiers': { N: `${updateParams.numOfSoldiers}` },
        ':occupation': {
          L: updateParams.occupation.map((o) => ({
            M: marshall(o),
          })),
        },
        // TODO: constraints
      },
    })
  );
}

export function getGuardPostSoldiersAmount(guardPost: GuardPost, period: number): number {
  const shouldGuardPostBeOccupied = !!occupationByPeriod(guardPost, period);
  return shouldGuardPostBeOccupied ? guardPost.numOfSoldiers : 0;
}

export function getGuardPostGuardPeriodDuration(guardPost: GuardPost, period: number): number {
  const occupation = occupationByPeriod(guardPost, period);
  return occupation?.duration ?? 1;
}
