import { getCurrentPeriod, type GuardTime } from '../../common/helpers/periodHelpers';
import { getAllGuardPosts, getUpcomingPeriod, getGuardPostOrder } from '../models/guardPost.model';
import {
  roundRobinStrategyHandler,
  teamRoundRobinStrategyHandler,
} from '../services/strategyHandlers';
import type { GuardList, GuardListContent } from '../interfaces/guardList.interface';
import type { GuardPost } from '../interfaces/guardPost.interface';
import type { StrategyHandler } from '../interfaces/strategyHandler.interface';

export function buildGuardList(): GuardList[] {
  const currentPeriod = getCurrentPeriod();

  const guardPosts = getAllGuardPosts();
  guardPosts.sort((a, b) => {
    return getGuardPostOrder(a.name) - getGuardPostOrder(b.name);
  });

  const fullGuardList: GuardList[] = [];

  for (let i = 0; i < guardPosts.length; i++) {
    const guardListForGuardPost = buildGuardListForGuardPost(
      guardPosts[i],
      fullGuardList,
      [], // TODO: replace with history
      currentPeriod,
    );
    fullGuardList.push(guardListForGuardPost);
  }

  return fullGuardList;
}

// TODO: add input: history, currently built guard list, remove startingPeriod
function buildGuardListForGuardPost(
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory,
  startingGuardTime: GuardTime,
): GuardList {
  const upcomingGuardTime = getUpcomingPeriod(guardPost.name, startingGuardTime);

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
  );

  const guardListForGuardPost = simplifyGuardList(guardListPerPeriod);
  return {
    guardPostName: guardPost.name,
    guardList: guardListForGuardPost,
  };
}

function simplifyGuardList(guardListForGuardPost: GuardListContent[]): GuardListContent[] {
  // TODO: merge consequetive guard periods
  // remove empty periods
  const simplifiedGuardListForGuardPost = guardListForGuardPost.filter(
    (guardPeriod) => guardPeriod.soldiers.length > 0,
  );

  return simplifiedGuardListForGuardPost;
}
