import { teams } from '../data/teams.data';
import type { Soldier } from '../interfaces/soldier.interface';
import type { Team } from '../interfaces/team.interface';

export function getSoldierTeam(soldierName: string): Team | undefined {
  const soldierTeam = teams.find((team) => team.people.includes(soldierName));
  if (!soldierTeam) {
    console.error('soldier was not found in any of the teams');
  }

  return soldierTeam;
}

// works as long as Soldier is a string
export function compareSoldiers(soldier1: Soldier, soldier2: Soldier): boolean {
  return soldier1 === soldier2;
}
