import { fetcher } from '@/helpers/fetcherHelper';

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

export interface CreateGuardPostParams {
  displayName: string;
  strategy: string;
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  constraints: string[];
}

export async function createGuardPost(params: CreateGuardPostParams): Promise<void> {
  await fetcher.fetch('/guard-posts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
}
