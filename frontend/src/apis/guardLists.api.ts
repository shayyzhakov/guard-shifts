import { fetcher } from '@/helpers/fetcherHelper';
import type { GuardTime } from '../helpers/periodHelpers';

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
