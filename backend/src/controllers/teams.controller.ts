import { Soldier } from '../interfaces/soldier.interface';
import type { Team } from '../interfaces/team.interface';
import { getAllSoldiers } from '../models/soldier.model';
import { createTeam, deleteTeamById, getAllTeams, updateTeamById } from '../models/team.model';
import { v4 as uuidv4 } from 'uuid';

type TeamWithSoldiers = Omit<Team, 'people'> & { people: Soldier[] };

export async function getTeams(): Promise<TeamWithSoldiers[]> {
  const teams = await getAllTeams();
  const soldiers = await getAllSoldiers();

  const teamsWithSoldiers = teams.map((team) => ({
    ...team,
    people: team.people
      .map((soldierId) => soldiers.find((soldier) => soldier.id === soldierId))
      .filter((soldier): soldier is Soldier => soldier !== undefined),
  }));

  return teamsWithSoldiers;
}

interface UpdateTeamParams {
  name: string;
  people: string[];
  guardPosts: string[];
}

export async function updateTeam(teamId: string, updateParams: UpdateTeamParams): Promise<void> {
  await updateTeamById(teamId, updateParams);
}

export async function createNewTeam(createParams: UpdateTeamParams): Promise<void> {
  const id = uuidv4();

  await createTeam({
    id,
    ...createParams,
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await deleteTeamById(teamId);
}
