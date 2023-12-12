import {
  GUARD_PERIODS_FOR_CALCULATION,
  type GuardTime,
  getNextPeriodGuardTime,
} from '../../../common/helpers/periodHelpers';
import { getPeopleForGuardPost } from '../../models/team.model';
import { isSoldierBusy } from '../../models/guardList.model';
import type { GuardList } from '@/algo/interfaces/guardList.interface';
import {
  getGuardPostGuardPeriodDuration,
  getGuardPostSoldiersAmount,
} from '@/algo/models/guardPost.model';
import type { GuardPost } from '@/algo/interfaces/guardPost.interface';

// TODO: implement StrategyHandler
export function roundRobinStrategyHandler(
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory,
  startingGuardTime: GuardTime,
) {
  const people = getPeopleForGuardPost(guardPost.name);
  const guardListPerPeriod = [];
  let currentGuardTime = startingGuardTime;
  let currentSoldierIndex = 0;

  while (guardListPerPeriod.length < GUARD_PERIODS_FOR_CALCULATION) {
    const freeSoldiers = people.filter(
      (soldier) => !isSoldierBusy(guardList, currentGuardTime, soldier),
    );
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost.name,
      currentGuardTime.period,
    );
    const periodsPerGuard = getGuardPostGuardPeriodDuration(
      guardPost.name,
      currentGuardTime.period,
    );

    // insert the next soldier to the list
    const soldiers = [];
    for (let g = 0; g < numOfSoldiersForCurrentPeriod; g++) {
      const currentSoldier = freeSoldiers[(currentSoldierIndex + g) % freeSoldiers.length];
      if (!currentSoldier) {
        console.error(
          `could not find soldier for guard post ${guardPost.name}. there are ${
            freeSoldiers.length
          } soldiers and index ${(currentSoldierIndex + g) % freeSoldiers.length} is missing`,
        );
      }
      soldiers.push(currentSoldier);
    }

    for (let i = 0; i < periodsPerGuard; i++) {
      guardListPerPeriod.push({
        soldiers,
        guardTime: currentGuardTime,
      });

      currentGuardTime = getNextPeriodGuardTime(currentGuardTime);
    }

    currentSoldierIndex += numOfSoldiersForCurrentPeriod;
  }

  return guardListPerPeriod;
}
