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
import { isSoldiersEqual } from '../models/soldier.model';
import {
  getFullGuardListHistory,
  removeHistoryGuardListPeriodsFrom,
  saveGuardLists,
} from '../models/guardList.model';

interface BuildGuardListParams {
  startPeriod: number;
  duration: number;
}

type GuardListResponse = Array<GuardList & { guardPostDisplayName: string }>;

export function buildGuardList({ startPeriod, duration }: BuildGuardListParams): GuardListResponse {
  const upcomingGuardTime = getUpcomingGuardTime(startPeriod);
  const endGuardTime = addDurationToGuardTime(upcomingGuardTime, duration);

  const guardPosts = getAllGuardPosts();
  guardPosts.sort((a, b) => {
    return getGuardPostOrder(a.name) - getGuardPostOrder(b.name);
  });

  const fullGuardList: GuardList[] = [];

  // truncate history at the start of the upcoming guard time, since we are going to build the guard list from this point
  removeHistoryGuardListPeriodsFrom(upcomingGuardTime);
  const guardListHistory = getFullGuardListHistory();

  for (let i = 0; i < guardPosts.length; i++) {
    const guardListForGuardPost = buildGuardListForGuardPost(
      guardPosts[i],
      fullGuardList,
      guardListHistory,
      upcomingGuardTime,
      endGuardTime
    );
    fullGuardList.push(guardListForGuardPost);
  }

  saveGuardLists(fullGuardList, upcomingGuardTime);

  const guardListResponse: GuardListResponse = fullGuardList.map((guardList) => {
    return {
      ...guardList,
      guardPostDisplayName: getGuardPostDisplayName(guardList.guardPostName),
    };
  });

  return guardListResponse;
}

// TODO: add input: history, currently built guard list
function buildGuardListForGuardPost(
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime
): GuardList {
  const upcomingGuardTime = getUpcomingGuardTimeForGuardPost(guardPost.name, startingGuardTime);

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
    guardPostName: guardPost.name,
    guardList: guardListForGuardPost,
  };
}

function simplifyGuardList(guardListForGuardPost: GuardListPeriod[]): GuardListPeriod[] {
  // remove empty periods
  let simplifiedGuardListForGuardPost = guardListForGuardPost.filter(
    (guardPeriod) => guardPeriod.soldiers.length > 0
  );

  // merge consequetive guard periods
  simplifiedGuardListForGuardPost = simplifiedGuardListForGuardPost.reduce(
    (acc, guardListPeriod) => {
      if (acc.length > 0 && isGuardListPeriodsEqual(guardListPeriod, acc[acc.length - 1])) {
        acc[acc.length - 1].error ||= guardListPeriod.error;
        acc[acc.length - 1].duration += guardListPeriod.duration;
      } else {
        acc.push(guardListPeriod);
      }

      return acc;
    },
    [] as GuardListPeriod[]
  );
  return simplifiedGuardListForGuardPost;
}

function isGuardListPeriodsEqual(glp1: GuardListPeriod, glp2: GuardListPeriod): boolean {
  const equalTeams = glp1.team === glp2.team;

  const equalSoldiers = glp1.soldiers.every((soldier1) =>
    glp2.soldiers.some((soldier2) => isSoldiersEqual(soldier1, soldier2))
  );
  return equalTeams && equalSoldiers;
}

export function getGuardListHistory(): GuardListResponse {
  return getFullGuardListHistory().map((guardList) => {
    return {
      ...guardList,
      guardPostDisplayName: getGuardPostDisplayName(guardList.guardPostName),
    };
  });
}
