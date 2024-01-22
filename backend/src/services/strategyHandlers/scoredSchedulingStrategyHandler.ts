import {
  type GuardTime,
  compareGuardTime,
  addDurationToGuardTime,
} from '../../helpers/periodHelpers';
import type { GuardList, GuardListPeriod } from '../../interfaces/guardList.interface';
import {
  getGuardPostGuardPeriodDuration,
  getGuardPostScoreForGuardPeriod,
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
): GuardListPeriod[] => {
  const guardListPerPeriods: GuardListPeriod[] = [];
  let currentGuardTime = startingGuardTime;

  // fill empty periods (without soldiers) in the guard list
  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const periodsPerGuard = getGuardPostGuardPeriodDuration(guardPost, currentGuardTime.period);

    guardListPerPeriods.push({
      soldiers: [],
      guardTime: currentGuardTime,
      duration: periodsPerGuard,
    });

    currentGuardTime = addDurationToGuardTime(currentGuardTime, periodsPerGuard);
  }

  // sort guard periods by score, highest first, and map to indexes
  const sortedGuardListPeriodsIndexesByScore = guardListPerPeriods
    .map((guardListPeriod, index) => {
      const scoreForGuardPeriod = getGuardPostScoreForGuardPeriod(
        guardPost,
        guardListPeriod.guardTime.period
      );
      return {
        index,
        score: scoreForGuardPeriod,
      };
    })
    .sort((a, b) => b.score - a.score);

  // create a queue of soldiers, sorted by accumulated score (create a class in /queues). every time a soldier is being used, return him to the queue in the right place
  const relevantSoldiers = getSoldierIdsForGuardPost(guardPost.id, teams);
  const scoredSoldiersQueue = new SoldiersScoredQueue(guardPost, relevantSoldiers, guardLists);

  // fill the guard list with soldiers from the queue
  while (sortedGuardListPeriodsIndexesByScore.length > 0) {
    const currentShiftReference = sortedGuardListPeriodsIndexesByScore.shift();
    if (!currentShiftReference) break;

    const currentGuardListPeriod = guardListPerPeriods[currentShiftReference.index];

    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost,
      currentGuardListPeriod.guardTime.period
    );

    // find the next soldiers to guard
    try {
      // TODO: avoid consecutive shifts for soldiers, should be configurable
      currentGuardListPeriod.soldiers = scoredSoldiersQueue.next(
        currentGuardListPeriod.guardTime,
        numOfSoldiersForCurrentPeriod,
        currentShiftReference.score
      );
    } catch (err) {
      currentGuardListPeriod.error = err instanceof Error ? err.message : 'unknown error';
    }
  }

  return guardListPerPeriods;
};
