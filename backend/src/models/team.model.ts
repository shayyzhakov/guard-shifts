import { teams } from '../data/teams.data';
import type { Soldier } from '../interfaces/soldier.interface';
import type { Team } from '../interfaces/team.interface';

export function getAllTeams(): Team[] {
  return teams;
}

// export function changeTeamById(teamId: string, newPeople: Soldier[]): void {
//   const team = teams.find((team) => team.id === teamId);
//   if (!team) {
//     console.error(`team ${teamId} not found`);
//     return;
//   }

//   team.people = newPeople;
// }

export function getPeopleForGuardPost(guardPostId: string): Soldier[] {
  return teams
    .filter((team) => team.guardPosts.includes(guardPostId))
    .reduce((acc, team) => acc.concat(team.people), [] as Soldier[]);
}

export function getTeamsForGuardPost(guardPostId: string): Team[] {
  return teams.filter((team) => team.guardPosts.includes(guardPostId));
}

export function updateTeamById(teamId: string, updateParams: Partial<Team>): void {
  const team = teams.find((team) => team.id === teamId);
  if (!team) {
    console.error(`team ${teamId} not found`);
    return;
  }

  // remove people that already appeared in a team from their old teams
  if (updateParams.people) {
    const newPeople = updateParams.people;

    // remove people from their old teams
    teams.forEach((team) => {
      team.people = team.people.filter((person) => !newPeople.includes(person));
    });

    // TODO: what about people that were removed and are not part of a team anymore?
  }

  // merge updateParams into team
  Object.assign(team, updateParams);
}
