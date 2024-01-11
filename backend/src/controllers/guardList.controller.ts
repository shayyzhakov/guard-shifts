import { getUpcomingGuardTime } from '../helpers/periodHelpers';
import { getAllGuardPosts } from '../models/guardPost.model';
import type { GuardList } from '../interfaces/guardList.interface';
import {
  deserializeGuardList,
  getFullGuardListHistory,
  saveGuardLists,
} from '../models/guardList.model';
import { DbGuardList } from '../interfaces/db.types';
import { getAllTeams } from '../models/team.model';
import { generateShifts } from '../services/shiftsGenerator.service';

interface BuildGuardListParams {
  startPeriod: number;
  duration: number;
}

export async function buildGuardList({
  startPeriod,
  duration,
}: BuildGuardListParams): Promise<GuardList[]> {
  const guardPosts = await getAllGuardPosts();
  const teams = await getAllTeams();
  const shiftsHistory = await getFullGuardListHistory();

  return generateShifts({
    guardPosts,
    teams,
    shiftsHistory,
    startPeriod,
    duration,
  });
}

export async function getGuardListHistory(): Promise<GuardList[]> {
  return await getFullGuardListHistory();
}

interface CommitGuardListParams {
  guardLists: GuardList[];
  startPeriod: number;
}

export async function commitGuardLists({
  guardLists,
  startPeriod,
}: CommitGuardListParams): Promise<void> {
  const upcomingGuardTime = getUpcomingGuardTime(startPeriod);

  await saveGuardLists(guardLists, upcomingGuardTime);
}

export function parseGuardLists(guardLists: DbGuardList[]): GuardList[] {
  return guardLists.map((guardList) => deserializeGuardList(guardList));
}
