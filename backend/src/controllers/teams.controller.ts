import { Soldier } from '../interfaces/soldier.interface';
import type { Team } from '../interfaces/team.interface';
import { getAllSoldiers } from '../models/soldier.model';
import { getAllTeams, updateTeamById } from '../models/team.model';

type TeamWithSoldiers = Omit<Team, 'people'> & { people: Soldier[] };

export async function getTeams(): Promise<TeamWithSoldiers[]> {
  const teams = getAllTeams();
  const soldiers = await getAllSoldiers();

  const teamsWithSoldiers = teams.map((team) => ({
    ...team,
    people: team.people
      .map((soldierId) => soldiers.find((soldier) => soldier.id === soldierId))
      .filter((soldier): soldier is Soldier => soldier !== undefined),
  }));

  return teamsWithSoldiers;
}

interface UpdateTeamUpdatedParams {
  name: string;
  people: string[];
  guardPosts: string[];
}

export function updateTeam(teamId: string, updateParams: UpdateTeamUpdatedParams): void {
  return updateTeamById(teamId, updateParams);
}
