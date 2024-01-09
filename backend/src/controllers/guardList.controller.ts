import {
  addDurationToGuardTime,
  getUpcomingGuardTime,
  type GuardTime,
} from '../helpers/periodHelpers';
import {
  getAllGuardPosts,
  getUpcomingGuardTimeForGuardPost,
  getGuardPostOrder,
  getGuardPostDisplayName,
} from '../models/guardPost.model';
import {
  roundRobinStrategyHandler,
  teamRoundRobinStrategyHandler,
} from '../services/strategyHandlers';
import type { GuardList, GuardListPeriod } from '../interfaces/guardList.interface';
import type { GuardPost } from '../interfaces/guardPost.interface';
import type { StrategyHandler } from '../interfaces/strategyHandler.interface';
import {
  deserializeGuardList,
  getFullGuardListHistory,
  saveGuardLists,
  truncateGuardListFromGuardTime,
} from '../models/guardList.model';
import { DbGuardList } from '../mocks/guardListHistory.data';

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

  // handle higher priority strategies first
  guardPosts.sort((a, b) => {
    return getGuardPostOrder(a.id) - getGuardPostOrder(b.id);
  });

  // truncate history at the start of the upcoming guard time, since we are going to build the guard list from this point
  const guardListHistory = getFullGuardListHistory();
  truncateGuardListFromGuardTime(guardListHistory, upcomingGuardTime);

  for (let i = 0; i < guardPosts.length; i++) {
    const guardListForGuardPost = await buildGuardListForGuardPost(
      guardPosts[i],
      fullGuardList,
      guardListHistory,
      upcomingGuardTime,
      endGuardTime
    );
    fullGuardList.push(guardListForGuardPost);
  }

  const guardListResponse: GuardListResponse = fullGuardList.map((guardList) => {
    return {
      ...guardList,
      guardPostDisplayName: getGuardPostDisplayName(guardList.guardPostId),
    };
  });

  return guardListResponse;
}

// TODO: add input: history, currently built guard list
async function buildGuardListForGuardPost(
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime
): Promise<GuardList> {
  const upcomingGuardTime = await getUpcomingGuardTimeForGuardPost(guardPost.id, startingGuardTime);

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
    endingGuardTime
  );

  const guardListForGuardPost = simplifyGuardList(guardListPerPeriod);
  return {
    guardPostId: guardPost.id,
    guardList: guardListForGuardPost,
  };
}

function simplifyGuardList(guardListForGuardPost: GuardListPeriod[]): GuardListPeriod[] {
  // remove empty periods
  const simplifiedGuardListForGuardPost = guardListForGuardPost.filter(
    (guardPeriod) => guardPeriod.soldiers.length > 0 || guardPeriod.error
  );

  return simplifiedGuardListForGuardPost;
}

export function getGuardListHistory(): GuardListResponse {
  return getFullGuardListHistory().map((guardList) => {
    return {
      ...guardList,
      guardPostDisplayName: getGuardPostDisplayName(guardList.guardPostId),
    };
  });
}

interface CommitGuardListParams {
  guardLists: GuardList[];
  startPeriod: number;
}

export function commitGuardLists({ guardLists, startPeriod }: CommitGuardListParams): void {
  const upcomingGuardTime = getUpcomingGuardTime(startPeriod);

  saveGuardLists(guardLists, upcomingGuardTime);
}

export function parseGuardLists(guardLists: DbGuardList[]): GuardList[] {
  return guardLists.map((guardList) => deserializeGuardList(guardList));
}
