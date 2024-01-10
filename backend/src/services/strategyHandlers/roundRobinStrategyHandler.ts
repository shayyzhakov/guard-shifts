import {
  type GuardTime,
  compareGuardTime,
  addDurationToGuardTime,
} from '../../helpers/periodHelpers';
import { mergeGuardLists } from '../../helpers/guardListHelpers';
import type { GuardList, GuardListPeriod } from '../../interfaces/guardList.interface';
import {
  getGuardPostGuardPeriodDuration,
  getGuardPostSoldiersAmount,
} from '../../models/guardPost.model';
import type { GuardPost } from '../../interfaces/guardPost.interface';
import type { StrategyHandler } from '../../interfaces/strategyHandler.interface';
import { SoldiersQueue } from '../queues/soldiersQueue';
import { Team } from '../../interfaces/team.interface';

export const roundRobinStrategyHandler: StrategyHandler = (
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime,
  teams: Team[]
): GuardListPeriod[] => {
  const guardListPerPeriod: GuardListPeriod[] = [];
  let currentGuardTime = startingGuardTime;

  const mergedGuardLists = mergeGuardLists(guardListHistory, guardList);

  const relevantSoldiersQueue = new SoldiersQueue(guardPost.id, teams, mergedGuardLists);

  // TODO: calculate 3 times the duration, then submit just the requested duration
  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost,
      currentGuardTime.period
    );
    const periodsPerGuard = getGuardPostGuardPeriodDuration(guardPost, currentGuardTime.period);

    // find the next soldiers to guard
    let soldierIds: string[] = [];
    let error: string | undefined;
    try {
      soldierIds = relevantSoldiersQueue.next(currentGuardTime, numOfSoldiersForCurrentPeriod);
    } catch (err) {
      error = err instanceof Error ? err.message : 'unknown error';
    }

    guardListPerPeriod.push({
      soldiers: soldierIds,
      guardTime: currentGuardTime,
      duration: periodsPerGuard,
      error,
    });

    currentGuardTime = addDurationToGuardTime(currentGuardTime, periodsPerGuard);
  }

  return guardListPerPeriod;
};
