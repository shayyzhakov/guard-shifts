import { GuardList } from '../interfaces/guardList.interface';
import { GuardPost } from '../interfaces/guardPost.interface';
import { StrategyHandler } from '../interfaces/strategyHandler.interface';
import { Team } from '../interfaces/team.interface';
import {
  truncateGuardListFromGuardTime,
  getGuardPostOrder,
  simplifyShifts,
  mergeGuardLists,
} from '../helpers/guardListHelpers';
import { getUpcomingGuardTimeForGuardPost } from '../helpers/guardPostHelpers';
import { getUpcomingGuardTime, addDurationToGuardTime, GuardTime } from '../helpers/periodHelpers';
import { roundRobinStrategyHandler, teamRoundRobinStrategyHandler } from './strategyHandlers';
import { scoredSchedulingStrategyHandler } from './strategyHandlers/scoredSchedulingStrategyHandler';

interface GenerateShiftsInput {
  guardPosts: GuardPost[];
  teams: Team[];
  guardListHistory: GuardList[];
  startPeriod: number;
  duration: number;
}

export function generateShifts({
  guardPosts,
  teams,
  guardListHistory,
  startPeriod,
  duration,
}: GenerateShiftsInput): GuardList[] {
  const fullGuardList: GuardList[] = [];

  const upcomingGuardTime = getUpcomingGuardTime(startPeriod);
  const endGuardTime = addDurationToGuardTime(upcomingGuardTime, duration);

  // truncate history at the start of the upcoming guard time, since we are going to build the guard list from this point
  truncateGuardListFromGuardTime(guardListHistory, upcomingGuardTime);

  // handle higher priority strategies first
  guardPosts.sort((a, b) => {
    return getGuardPostOrder(a) - getGuardPostOrder(b);
  });

  for (let i = 0; i < guardPosts.length; i++) {
    const mergedGuardLists = mergeGuardLists(guardListHistory, fullGuardList);

    const guardListForGuardPost = buildGuardListForGuardPost(
      guardPosts[i],
      mergedGuardLists,
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
  guardLists: GuardList[],
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

    case 'scored-scheduling':
      strategyHandler = scoredSchedulingStrategyHandler;
      break;

    default:
      console.error(`Unknown strategy ${guardPost.strategy} for guard post ${guardPost.id}`);
      strategyHandler = roundRobinStrategyHandler;
      break;
  }

  const shifts = strategyHandler(guardPost, guardLists, upcomingGuardTime, endingGuardTime, teams);

  const simplifiedShifts = simplifyShifts(shifts);
  return {
    guardPostId: guardPost.id,
    guardPostDisplayName: guardPost.displayName,
    shifts: simplifiedShifts,
  };
}
