import type { StrategyType } from '@/consts';
import { fetcher } from '@/helpers/fetcherHelper';

export interface GuardPostOccupation {
  from: number; // included
  to: number; // excluded
  duration: number;
}

export interface GuardPost {
  id: string;
  displayName: string;
  strategy: StrategyType;
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  config: Record<string, unknown>;
}

export async function getGuardPosts(): Promise<GuardPost[]> {
  const response = await fetcher.fetch('/guard-posts');
  return response.guardPosts;
}

export interface CreateGuardPostParams {
  displayName: string;
  strategy: string;
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  config: Record<string, unknown>;
}

export async function createGuardPost(params: CreateGuardPostParams): Promise<void> {
  await fetcher.fetch('/guard-posts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function updateGuardPost(
  guardPostId: string,
  params: CreateGuardPostParams,
): Promise<void> {
  await fetcher.fetch(`/guard-posts/${guardPostId}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function deleteGuardPost(guardPostId: string): Promise<void> {
  await fetcher.fetch(`/guard-posts/${guardPostId}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
  });
}
