import { GuardList } from '../interfaces/guardList.interface';
import { GuardPost } from '../interfaces/guardPost.interface';
import { StrategyHandler } from '../interfaces/strategyHandler.interface';
import { Team } from '../interfaces/team.interface';
import {
  truncateGuardListFromGuardTime,
  getGuardPostOrder,
  simplifyGuardList,
} from '../helpers/guardListHelpers';
import { getUpcomingGuardTimeForGuardPost } from '../helpers/guardPostHelpers';
import { getUpcomingGuardTime, addDurationToGuardTime, GuardTime } from '../helpers/periodHelpers';
import { roundRobinStrategyHandler, teamRoundRobinStrategyHandler } from './strategyHandlers';

interface GenerateShiftsInput {
  guardPosts: GuardPost[];
  teams: Team[];
  shiftsHistory: GuardList[];
  startPeriod: number;
  duration: number;
}

export function generateShifts({
  guardPosts,
  teams,
  shiftsHistory,
  startPeriod,
  duration,
}: GenerateShiftsInput): GuardList[] {
  const fullGuardList: GuardList[] = [];

  const upcomingGuardTime = getUpcomingGuardTime(startPeriod);
  const endGuardTime = addDurationToGuardTime(upcomingGuardTime, duration);

  truncateGuardListFromGuardTime(shiftsHistory, upcomingGuardTime);

  // handle higher priority strategies first
  guardPosts.sort((a, b) => {
    return getGuardPostOrder(a) - getGuardPostOrder(b);
  });

  // truncate history at the start of the upcoming guard time, since we are going to build the guard list from this point

  for (let i = 0; i < guardPosts.length; i++) {
    const guardListForGuardPost = buildGuardListForGuardPost(
      guardPosts[i],
      fullGuardList,
      shiftsHistory,
      upcomingGuardTime,
      endGuardTime,
      teams
    );
    fullGuardList.push(guardListForGuardPost);
  }

  return fullGuardList;
}

function buildGuardListForGuardPost(
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime,
  teams: Team[]
): GuardList {
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
