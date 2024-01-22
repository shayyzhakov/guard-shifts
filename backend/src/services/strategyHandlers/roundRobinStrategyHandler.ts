import {
  type GuardTime,
  compareGuardTime,
  addDurationToGuardTime,
} from '../../helpers/periodHelpers';
import type { GuardList, GuardListShift } from '../../interfaces/guardList.interface';
import {
  getShiftDuration,
  getGuardPostSoldiersAmount,
  getSoldierIdsForGuardPost,
} from '../../helpers/guardPostHelpers';
import type { GuardPost } from '../../interfaces/guardPost.interface';
import type { StrategyHandler } from '../../interfaces/strategyHandler.interface';
import { SoldiersQueue } from '../queues/soldiersQueue';
import { Team } from '../../interfaces/team.interface';

export const roundRobinStrategyHandler: StrategyHandler = (
  guardPost: GuardPost,
  guardLists: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime,
  teams: Team[]
): GuardListShift[] => {
  const shifts: GuardListShift[] = [];
  let currentGuardTime = startingGuardTime;

  const relevantSoldiers = getSoldierIdsForGuardPost(guardPost.id, teams);
  const relevantSoldiersQueue = new SoldiersQueue(relevantSoldiers, guardLists);

  // TODO: calculate 3 times the duration, then submit just the requested duration
  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost,
      currentGuardTime.period
    );
    const periodsPerGuard = getShiftDuration(guardPost, currentGuardTime.period);

    // find the next soldiers to guard
    let soldierIds: string[] = [];
    let error: string | undefined;
    try {
      soldierIds = relevantSoldiersQueue.next(currentGuardTime, numOfSoldiersForCurrentPeriod);
    } catch (err) {
      error = err instanceof Error ? err.message : 'unknown error';
    }

    shifts.push({
      soldiers: soldierIds,
      guardTime: currentGuardTime,
      duration: periodsPerGuard,
      error,
    });

    currentGuardTime = addDurationToGuardTime(currentGuardTime, periodsPerGuard);
  }

  return shifts;
};
