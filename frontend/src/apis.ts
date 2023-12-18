import type { GuardTime } from './helpers/periodHelpers';

export interface Team {
  name: string;
  people: string[];
  guardPosts: string[];
}

export async function getTeams(): Promise<Team[]> {
  const response = await fetch('http://localhost:3000/teams');
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
  guardPostName: string;
  guardPostDisplayName: string;
  guardList: GuardListPeriod[];
}

export interface GenerateGuardListParams {
  startPeriod: number;
  duration: number;
}

export async function generateGuardList(params: GenerateGuardListParams): Promise<GuardList[]> {
  const response = await fetch('http://localhost:3000/guard-list/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  const responseJson = await response.json();
  return responseJson.guardLists;
}

export async function getGuardListHistory(): Promise<GuardList[]> {
  const response = await fetch('http://localhost:3000/guard-list/history');
  const responseJson = await response.json();
  return responseJson.guardLists;
}

export interface GuardPostOccupation {
  from: number; // included
  to: number; // excluded
  duration: number;
}

export interface GuardPost {
  name: string;
  displayName: string;
  strategy: string; // TODO: change to enum
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  constraints: string[]; // TODO: implement
}

export async function getGuardPosts(): Promise<GuardPost[]> {
  const response = await fetch('http://localhost:3000/guard-posts');
  const responseJson = await response.json();
  return responseJson.guardPosts;
}
