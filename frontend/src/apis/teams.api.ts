import { fetcher } from '@/helpers/fetcherHelper';
import type { Soldier } from './soldiers.api';

export interface Team {
  id: string;
  name: string;
  people: Soldier[];
  guardPosts: string[];
}

export async function getTeams(): Promise<Team[]> {
  const response = await fetcher.fetch('/teams');
  return response.teams;
}

export interface UpdateTeamParams {
  name: string;
  people: string[];
  guardPosts: string[];
}

export async function updateTeam(teamId: string, params: UpdateTeamParams): Promise<void> {
  await fetcher.fetch(`/teams/${teamId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function createTeam(params: UpdateTeamParams): Promise<void> {
  await fetcher.fetch(`/teams`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function deleteTeam(teamId: string): Promise<void> {
  await fetcher.fetch(`/teams/${teamId}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
  });
}
