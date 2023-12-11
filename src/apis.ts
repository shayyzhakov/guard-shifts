import { getTeamsApi } from './algo/apis/teams.api';
import { generateGuardListApi } from './algo/apis/guardList.api';
import { getGuardPostsApi } from './algo/apis/guardPosts.api';
import type { GuardTime } from './common/helpers/periodHelpers';

export interface Team {
  name: string;
  people: string[];
  guardPosts: string[];
}

export function getTeams(): Team[] {
  return getTeamsApi();
}

export interface GuardListContent {
  soldiers: string[];
  guardTime: GuardTime;
  team?: string;
  error?: string;
}

export interface GuardList {
  guardPostName: string;
  guardList: GuardListContent[];
}

export function generateGuardList(): GuardList[] {
  return generateGuardListApi();
}

export interface GuardPostOccupation {
  from: number; // included
  to: number; // excluded
  duration: number;
}

export interface GuardPost {
  name: string;
  displayName: string;
  hasPeriodOffset: boolean;
  strategy: string; // TODO: change to enum
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  constraints: string[]; // TODO: implement
}

export function getGuardPosts(): GuardPost[] {
  return getGuardPostsApi();
}
