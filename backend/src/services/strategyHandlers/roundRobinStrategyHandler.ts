import {
  type GuardTime,
  getNextPeriodGuardTime,
  compareGuardTime,
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

  const relevantSoldiersQueue = new SoldiersQueue(guardPost.name, mergedGuardLists);

  // TODO: calculate 3 times the duration, then submit just the requested duration
  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost.name,
      currentGuardTime.period
    );
    const periodsPerGuard = getGuardPostGuardPeriodDuration(
      guardPost.name,
      currentGuardTime.period
    );

    // find the next soldiers to guard
    const soldiers = relevantSoldiersQueue.next(currentGuardTime, numOfSoldiersForCurrentPeriod);

    for (let i = 0; i < periodsPerGuard; i++) {
      guardListPerPeriod.push({
        soldiers,
        guardTime: currentGuardTime,
        duration: 1,
      });

      currentGuardTime = getNextPeriodGuardTime(currentGuardTime);
    }
  }

  return guardListPerPeriod;
};
