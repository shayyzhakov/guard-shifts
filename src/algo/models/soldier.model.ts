import { teams } from '../data/teams.data';
import type { Team } from '../interfaces/team.interface';

export function getSoldierTeam(soldierName: string): Team | undefined {
  const soldierTeam = teams.find((team) => team.people.includes(soldierName));
  if (!soldierTeam) {
    console.error('soldier was not found in any of the teams');
  }

  return soldierTeam;
}
