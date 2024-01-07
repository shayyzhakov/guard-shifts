import { DeleteItemCommand, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
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

export interface SoldierAddParams {
  first_name: string;
  last_name: string;
  personal_number: number;
  phone_number: string;
  capabilities: string[];
}

export async function createNewSoldier(soldierParams: SoldierAddParams): Promise<void> {
  const soldier: Soldier = {
    id: uuidv4(),
    ...soldierParams,
  };

  await getDbClient().send(new PutItemCommand({ TableName: 'Soldiers', Item: marshall(soldier) }));
}

// export interface SoldierUpdateParams {
//   first_name: string;
//   last_name: string;
//   personal_number: number;
//   phone_number: string;
//   capabilities: string[];
// }

// export function updateSoldier(soldierId: string, updateParams: SoldierUpdateParams): void {
//   const soldier = soldiers.find((soldier) => soldier.id === soldierId);
//   if (!soldier) {
//     console.error(`soldier ${soldierId} not found`);
//     return;
//   }

//   // merge updateParams into soldier
//   Object.assign(soldier, updateParams);
// }
