import { Soldier } from '../interfaces/soldier.interface';
import {
  createSoldier,
  deleteSoldierById,
  getAllSoldiers,
  updateSoldierById,
} from '../models/soldier.model';
import { v4 as uuidv4 } from 'uuid';
import { getAllTeams, removeSoldiersFromTeams } from '../models/team.model';

export async function getSoldiers(): Promise<Soldier[]> {
  return await getAllSoldiers();
}

export async function createNewSoldier(soldierParams: Omit<Soldier, 'id'>): Promise<void> {
  const soldier: Soldier = {
    id: uuidv4(),
    ...soldierParams,
  };

  await createSoldier(soldier);
}

export async function updateSoldier(
  soldierId: string,
  updateParams: Omit<Soldier, 'id'>
): Promise<void> {
  await updateSoldierById(soldierId, updateParams);
}

export async function deleteSoldier(soldierId: string): Promise<void> {
  // remove soldier from team
  const teams = await getAllTeams();
  await removeSoldiersFromTeams(teams, [soldierId]);

  await deleteSoldierById(soldierId);
}
