import { soldiers } from '../data/soldiers.data';
import { teams } from '../data/teams.data';
import { Soldier } from '../interfaces/soldier.interface';
import type { Team } from '../interfaces/team.interface';
import { v4 as uuidv4 } from 'uuid';

export function getSoldierTeam(soldierId: string): Team | undefined {
  const soldierTeam = teams.find((team) => team.people.includes(soldierId));
  if (!soldierTeam) {
    console.error('soldier was not found in any of the teams');
  }

  return soldierTeam;
}

export function getAllSoldiers(): Soldier[] {
  return JSON.parse(JSON.stringify(soldiers));
}

export function getSoldierById(soldierId: string): Soldier | undefined {
  return soldiers.find((soldier) => soldier.id === soldierId);
}

export function removeSoldier(soldierId: string): void {
  const soldierIndex = soldiers.findIndex((soldier) => soldier.id === soldierId);
  if (soldierIndex === -1) {
    console.error(`soldier ${soldierId} not found`);
    return;
  }

  soldiers.splice(soldierIndex, 1);
}

export interface SoldierAddParams {
  first_name: string;
  last_name: string;
  personal_number: number;
  capabilities: string[];
}

export function addNewSoldier(soldierParams: SoldierAddParams): void {
  const soldier: Soldier = {
    id: uuidv4(),
    ...soldierParams,
  };

  soldiers.push(soldier);
}

export interface SoldierUpdateParams {
  first_name: string;
  last_name: string;
  personal_number: number;
  capabilities: string[];
}

export function updateSoldier(soldierId: string, updateParams: SoldierUpdateParams): void {
  const soldier = soldiers.find((soldier) => soldier.id === soldierId);
  if (!soldier) {
    console.error(`soldier ${soldierId} not found`);
    return;
  }

  // merge updateParams into soldier
  Object.assign(soldier, updateParams);
}
