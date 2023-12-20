import {
  type GuardTime,
  getNextPeriodGuardTime,
  compareGuardTime,
} from '../../helpers/periodHelpers';
import { getPeopleForGuardPost } from '../../models/team.model';
import { isSoldierBusy, mergeGuardLists } from '../../models/guardList.model';
import type { GuardList, GuardListPeriod } from '../../interfaces/guardList.interface';
import {
  getGuardPostGuardPeriodDuration,
  getGuardPostSoldiersAmount,
} from '../../models/guardPost.model';
import type { GuardPost } from '../../interfaces/guardPost.interface';
import type { StrategyHandler } from '../../interfaces/strategyHandler.interface';
import { Soldier } from '../../interfaces/soldier.interface';

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

    // find the relevant soldiers
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

class SoldiersQueue {
  private soldiersForGuardPost: Soldier[];

  constructor(guardPostName: string, private guardLists: GuardList[]) {
    this.soldiersForGuardPost = getPeopleForGuardPost(guardPostName);
  }

  next(guardTime: GuardTime, amount: number = 1): Soldier[] {
    const soldiers: Soldier[] = [];
    const busySoldiers: Soldier[] = [];

    while (soldiers.length < amount) {
      const nextSoldier = this.soldiersForGuardPost.shift();

      if (!nextSoldier) {
        throw new Error('no soldiers in queue');
      }

      const isBusy = isSoldierBusy(this.guardLists, guardTime, nextSoldier);
      if (isBusy) {
        busySoldiers.push(nextSoldier);
      } else {
        soldiers.push(nextSoldier);
      }
    }

    this.soldiersForGuardPost.push(...soldiers); // add the soldiers to the end of the queue
    this.soldiersForGuardPost.unshift(...busySoldiers); // add the busy soldiers to the top of the queue so they will be the ones to use next

    return soldiers;
  }
}
