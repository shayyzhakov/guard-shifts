import type { OAuth2Token } from '@badgateway/oauth2-client';
import type { GuardTime } from './helpers/periodHelpers';

export interface Soldier {
  id: string;
  first_name: string;
  last_name: string;
  personal_number: number;
  phone_number: string;
  capabilities: string[];
}

export class AuthorizedFetch {
  private accessToken?: string;
  private expiresAt?: number | null;
  private refreshToken?: string | null;
  private baseUrl?: string;

  init(baseUrl: string, tokens: OAuth2Token) {
    this.baseUrl = baseUrl;
    this.accessToken = tokens.accessToken;
    this.expiresAt = tokens.expiresAt;
    this.refreshToken = tokens.refreshToken;
  }

  get isInitialized() {
    return !!this.baseUrl;
  }

  async fetch(...args: Parameters<typeof fetch>): Promise<any> {
    // add authorization header to request
    args[1] = {
      ...args[1],
      headers: {
        ...args[1]?.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    };

    const url = `${this.baseUrl}${args[0]}`;

    const response = await fetch(url, args[1]);
    if (response.status >= 400) {
      throw new Error(`[client] error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
}

const fetcher = new AuthorizedFetch();

export function initFetcher(baseUrl: string, tokens: OAuth2Token): void {
  fetcher.init(baseUrl, tokens);
}

export async function getSoldiers(): Promise<Soldier[]> {
  const response = await fetcher.fetch('/soldiers');
  return response.soldiers;
}

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
  const response = await fetcher.fetch('/guard-list/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.guardLists;
}

export interface CommitGuardListParams {
  guardLists: GuardList[];
  startPeriod: number;
}

export async function commitGuardList(params: CommitGuardListParams): Promise<void> {
  const response = await fetcher.fetch('/guard-list/commit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.guardLists;
}

export async function getGuardLists(): Promise<GuardList[]> {
  const response = await fetcher.fetch('/guard-list');
  return response.guardLists;
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
  const response = await fetcher.fetch('/guard-posts');
  return response.guardPosts;
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

export interface CreateSoldierParams {
  first_name: string;
  last_name: string;
  personal_number: string;
  phone_number: string;
  capabilities: string[];
}

export async function createSoldier(params: CreateSoldierParams): Promise<void> {
  await fetcher.fetch('/soldiers', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function deleteSoldier(soldierId: string): Promise<void> {
  await fetcher.fetch(`/soldiers/${soldierId}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
  });
}
