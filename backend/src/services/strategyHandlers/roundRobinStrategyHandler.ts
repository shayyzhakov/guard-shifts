import {
  type GuardTime,
  compareGuardTime,
  addDurationToGuardTime,
} from '../../helpers/periodHelpers';
import { mergeGuardLists } from '../../models/guardList.model';
import type { GuardList, GuardListPeriod } from '../../interfaces/guardList.interface';
import {
  getGuardPostGuardPeriodDuration,
  getGuardPostSoldiersAmount,
} from '../../models/guardPost.model';
import type { GuardPost } from '../../interfaces/guardPost.interface';
import type { StrategyHandler } from '../../interfaces/strategyHandler.interface';
import { SoldiersQueue } from '../queues/soldiersQueue';

export const roundRobinStrategyHandler: StrategyHandler = (
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime
): GuardListPeriod[] => {
  const guardListPerPeriod: GuardListPeriod[] = [];
  let currentGuardTime = startingGuardTime;

  const mergedGuardLists = mergeGuardLists(guardListHistory, guardList);

  const relevantSoldiersQueue = new SoldiersQueue(guardPost.id, mergedGuardLists);

  // TODO: calculate 3 times the duration, then submit just the requested duration
  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost.id,
      currentGuardTime.period
    );
    const periodsPerGuard = getGuardPostGuardPeriodDuration(guardPost.id, currentGuardTime.period);

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
