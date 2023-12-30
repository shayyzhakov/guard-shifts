import type { GuardTime } from './helpers/periodHelpers';

export interface Soldier {
  id: string;
  first_name: string;
  last_name: string;
  personal_number: number;
  phone_number: string;
  capabilities: string[];
}

export async function getSoldiers(): Promise<Soldier[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/soldiers`);
  const responseJson = await response.json();
  return responseJson.soldiers;
}

export interface Team {
  id: string;
  name: string;
  people: Soldier[];
  guardPosts: string[];
}

export async function getTeams(): Promise<Team[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/teams`);
  const responseJson = await response.json();
  return responseJson.teams;
}

export interface GuardListPeriod {
  soldiers: string[];
  guardTime: GuardTime;
  duration: number;
  team?: string;
  error?: string;
}

export interface GuardList {
  guardPostId: string;
  guardPostDisplayName: string;
  guardList: GuardListPeriod[];
}

export interface GenerateGuardListParams {
  startPeriod: number;
  duration: number;
}

export async function generateGuardList(params: GenerateGuardListParams): Promise<GuardList[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/guard-list/generate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const responseJson = await response.json();
  return responseJson.guardLists;
}

export interface CommitGuardListParams {
  guardLists: GuardList[];
  startPeriod: number;
}

export async function commitGuardList(params: CommitGuardListParams): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/guard-list/commit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const responseJson = await response.json();
  return responseJson.guardLists;
}

export async function getGuardLists(): Promise<GuardList[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/guard-list`);
  const responseJson = await response.json();
  return responseJson.guardLists;
}

export interface GuardPostOccupation {
  from: number; // included
  to: number; // excluded
  duration: number;
}

export interface GuardPost {
  id: string;
  displayName: string;
  strategy: string; // TODO: change to enum
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  constraints: string[]; // TODO: implement
}

export async function getGuardPosts(): Promise<GuardPost[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/guard-posts`);
  const responseJson = await response.json();
  return responseJson.guardPosts;
}

export interface UpdateTeamParams {
  name: string;
  people: string[];
  guardPosts: string[];
}

export async function updateTeam(teamId: string, params: UpdateTeamParams): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/teams/${teamId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const responseJson = await response.json();
  return responseJson.guardLists;
}
