import {
  addDurationToGuardTime,
  getUpcomingGuardTime,
  type GuardTime,
} from '../helpers/periodHelpers';
import { getAllGuardPosts, getUpcomingGuardTimeForGuardPost } from '../models/guardPost.model';
import { getGuardPostOrder } from '../helpers/guardListHelpers';
import { getGuardPostDisplayName } from '../helpers/guardListHelpers';
import {
  roundRobinStrategyHandler,
  teamRoundRobinStrategyHandler,
} from '../services/strategyHandlers';
import type { GuardList } from '../interfaces/guardList.interface';
import type { GuardPost } from '../interfaces/guardPost.interface';
import type { StrategyHandler } from '../interfaces/strategyHandler.interface';
import {
  deserializeGuardList,
  getFullGuardListHistory,
  saveGuardLists,
} from '../models/guardList.model';
import { truncateGuardListFromGuardTime } from '../helpers/guardListHelpers';
import { DbGuardList } from '../interfaces/db.types';
import { simplifyGuardList } from '../helpers/guardListHelpers';
import { getAllTeams } from '../models/team.model';
import { Team } from '../interfaces/team.interface';

interface BuildGuardListParams {
  startPeriod: number;
  duration: number;
}

type GuardListResponse = Array<GuardList & { guardPostDisplayName: string }>;

export async function buildGuardList({
  startPeriod,
  duration,
}: BuildGuardListParams): Promise<GuardListResponse> {
  const fullGuardList: GuardList[] = [];

  const upcomingGuardTime = getUpcomingGuardTime(startPeriod);
  const endGuardTime = addDurationToGuardTime(upcomingGuardTime, duration);

  const guardPosts = await getAllGuardPosts();
  const teams = await getAllTeams();

  // handle higher priority strategies first
  guardPosts.sort((a, b) => {
    return getGuardPostOrder(guardPosts, a.id) - getGuardPostOrder(guardPosts, b.id);
  });

  // truncate history at the start of the upcoming guard time, since we are going to build the guard list from this point
  const guardListHistory = await getFullGuardListHistory();
  truncateGuardListFromGuardTime(guardListHistory, upcomingGuardTime);

  for (let i = 0; i < guardPosts.length; i++) {
    const guardListForGuardPost = await buildGuardListForGuardPost(
      guardPosts[i],
      fullGuardList,
      guardListHistory,
      upcomingGuardTime,
      endGuardTime,
      teams
    );
    fullGuardList.push(guardListForGuardPost);
  }

  const guardListResponse: GuardListResponse = fullGuardList.map((guardList) => {
    return {
      ...guardList,
      guardPostDisplayName: getGuardPostDisplayName(guardPosts, guardList.guardPostId), // TODO: not needed, the ui can get the name from the guard post id
    };
  });

  return guardListResponse;
}

async function buildGuardListForGuardPost(
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime,
  teams: Team[]
): Promise<GuardList> {
  const upcomingGuardTime = getUpcomingGuardTimeForGuardPost(guardPost, startingGuardTime);

  let strategyHandler: StrategyHandler;
  switch (guardPost.strategy) {
    case 'roundrobin':
      strategyHandler = roundRobinStrategyHandler;
      break;

    case 'team-roundrobin':
      strategyHandler = teamRoundRobinStrategyHandler;
      break;

    default:
      strategyHandler = roundRobinStrategyHandler;
      break;
  }

  const guardListPerPeriod = strategyHandler(
    guardPost,
    guardList,
    guardListHistory,
    upcomingGuardTime,
    endingGuardTime,
    teams
  );

  const guardListForGuardPost = simplifyGuardList(guardListPerPeriod);
  return {
    guardPostId: guardPost.id,
    guardPostDisplayName: guardPost.displayName,
    guardList: guardListForGuardPost,
  };
}

export async function getGuardListHistory(): Promise<GuardListResponse> {
  const guardPosts = await getAllGuardPosts();
  const guardListHistory = await getFullGuardListHistory();

  return guardListHistory.map((guardList) => {
    return {
      ...guardList,
      guardPostDisplayName: getGuardPostDisplayName(guardPosts, guardList.guardPostId), // TODO: not needed, the ui can get the name from the guard post id
    };
  });
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
