import { teams } from '../data/teams.data';
import type { Soldier } from '../interfaces/soldier.interface';
import type { Team } from '../interfaces/team.interface';

export function getAllTeams(): Team[] {
  return teams;
}

export function changeTeam(teamName: string, newPeople: Soldier[]): void {
  const team = teams.find((team) => team.name === teamName);
  if (!team) {
    console.error(`team ${teamName} not found`);
    return;
  }

  team.people = newPeople;
}

export function getPeopleForGuardPost(guardPostName: string): Soldier[] {
  return teams
    .filter((team) => team.guardPosts.includes(guardPostName))
    .reduce((acc, team) => acc.concat(team.people), [] as Soldier[]);
}

export function getTeamsForGuardPost(guardPostName: string): Team[] {
  return teams.filter((team) => team.guardPosts.includes(guardPostName));
}
