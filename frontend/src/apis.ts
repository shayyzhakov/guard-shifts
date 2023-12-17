import { getTeamsApi } from './algo/apis/teams.api';
import { generateGuardListApi, getGuardListHistoryApi } from './algo/apis/guardList.api';
import { getGuardPostsApi } from './algo/apis/guardPosts.api';
import type { GuardTime } from './common/helpers/periodHelpers';

export interface Team {
  name: string;
  people: string[];
  guardPosts: string[];
}

export function getTeams(): Team[] {
  // const a = await fetch('http://localhost:3000/teams');
  return getTeamsApi();
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
  guardList: GuardListPeriod[];
}

export function generateGuardList(): GuardList[] {
  return generateGuardListApi();
}

export function getGuardListHistory(): GuardList[] {
  return getGuardListHistoryApi();
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

export function getGuardPosts(): GuardPost[] {
  return getGuardPostsApi();
}
