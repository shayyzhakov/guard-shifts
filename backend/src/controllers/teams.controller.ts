import { Soldier } from '../interfaces/soldier.interface';
import type { Team } from '../interfaces/team.interface';
import { getAllTeams, updateTeamById } from '../models/team.model';

export function getTeams(): Team[] {
  return getAllTeams();
}

interface UpdateTeamUpdatedParams {
  name: string;
  people: Soldier[];
  guardPosts: string[];
}

export function updateTeam(teamId: string, updateParams: UpdateTeamUpdatedParams): void {
  return updateTeamById(teamId, updateParams);
}
