import {
  DeleteItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { getDbClient } from '../helpers/dbClient';
import { Soldier } from '../interfaces/soldier.interface';
import { v4 as uuidv4 } from 'uuid';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export async function getAllSoldiers(): Promise<Soldier[]> {
  const res = await getDbClient().send(new ScanCommand({ TableName: 'Soldiers' }));

  return (res.Items?.map((item) => unmarshall(item)) ?? []) as Soldier[];
}

export async function deleteSoldier(soldierId: string): Promise<void> {
  await getDbClient().send(
    new DeleteItemCommand({ TableName: 'Soldiers', Key: marshall({ id: soldierId }) })
  );
}

export async function createNewSoldier(soldierParams: Omit<Soldier, 'id'>): Promise<void> {
  const soldier: Soldier = {
    id: uuidv4(),
    ...soldierParams,
  };

  await getDbClient().send(new PutItemCommand({ TableName: 'Soldiers', Item: marshall(soldier) }));
}

export async function updateSoldier(
  soldierId: string,
  soldierParams: Omit<Soldier, 'id'>
): Promise<void> {
  await getDbClient().send(
    new UpdateItemCommand({
      TableName: 'Soldiers',
      Key: { id: { S: soldierId } },
      UpdateExpression:
        'SET first_name = :first_name, last_name = :last_name, personal_number = :personal_number, phone_number = :phone_number, capabilities = :capabilities',
      ExpressionAttributeValues: {
        ':first_name': { S: soldierParams.first_name },
        ':last_name': { S: soldierParams.last_name },
        ':personal_number': { S: soldierParams.personal_number },
        ':phone_number': { S: soldierParams.phone_number },
        ':capabilities': { L: soldierParams.capabilities.map((capability) => ({ S: capability })) },
      },
    })
  );
}
