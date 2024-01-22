import {
  type GuardTime,
  compareGuardTime,
  addDurationToGuardTime,
} from '../../helpers/periodHelpers';
import type { GuardList, GuardListShift } from '../../interfaces/guardList.interface';
import {
  getShiftDuration,
  getShiftScore,
  getGuardPostSoldiersAmount,
  getSoldierIdsForGuardPost,
} from '../../helpers/guardPostHelpers';
import type { GuardPost } from '../../interfaces/guardPost.interface';
import type { StrategyHandler } from '../../interfaces/strategyHandler.interface';
import { Team } from '../../interfaces/team.interface';
import { SoldiersScoredQueue } from '../queues/soldiersScoredQueue';

export const scoredSchedulingStrategyHandler: StrategyHandler = (
  guardPost: GuardPost,
  guardLists: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime,
  teams: Team[]
): GuardListShift[] => {
  const shifts: GuardListShift[] = [];
  let currentGuardTime = startingGuardTime;

  // fill empty shifts (without soldiers) in the guard list
  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const periodsPerGuard = getShiftDuration(guardPost, currentGuardTime.period);

    shifts.push({
      soldiers: [],
      guardTime: currentGuardTime,
      duration: periodsPerGuard,
    });

    currentGuardTime = addDurationToGuardTime(currentGuardTime, periodsPerGuard);
  }

  // sort guard periods by score, highest first
  const sortedShiftsIndexesByScore = shifts
    .map((shift, index) => {
      const score = getShiftScore(guardPost, shift.guardTime.period);
      return {
        index,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  // create a queue of soldiers, sorted by accumulated score
  const relevantSoldiers = getSoldierIdsForGuardPost(guardPost.id, teams);
  const scoredSoldiersQueue = new SoldiersScoredQueue(guardPost, relevantSoldiers, guardLists);

  // fill the shifts with soldiers from the queue
  while (sortedShiftsIndexesByScore.length > 0) {
    const currentShiftReference = sortedShiftsIndexesByScore.shift();
    if (!currentShiftReference) break;

    const currentShift = shifts[currentShiftReference.index];

    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost,
      currentShift.guardTime.period
    );

    // find the next soldiers to guard
    try {
      // TODO: avoid consecutive shifts for soldiers, should be configurable
      currentShift.soldiers = scoredSoldiersQueue.next(
        currentShift.guardTime,
        numOfSoldiersForCurrentPeriod,
        currentShiftReference.score
      );
    } catch (err) {
      currentShift.error = err instanceof Error ? err.message : 'unknown error';
    }
  }

  return shifts;
};
