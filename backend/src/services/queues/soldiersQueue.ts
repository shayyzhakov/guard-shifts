import { GuardTime } from '../../helpers/periodHelpers';
import { GuardList } from '../../interfaces/guardList.interface';
import { isSoldierBusy } from '../../helpers/guardListHelpers';
import { getSoldierIdsByLatestGuardOrder } from '../../helpers/guardListHelpers';

/**
 * A round robin queue of soldiers to be used, while chronological order is the top priority.
 */
export class SoldiersQueue {
  private orderedSoldiers: string[] = [];

  constructor(soldiers: string[], private guardLists: GuardList[]) {
    // insert soldiers that already appeared in the guard list, from the older to the newer
    this.orderedSoldiers.push(
      ...getSoldierIdsByLatestGuardOrder(guardLists).filter((soldier) => soldiers.includes(soldier))
    );

    // insert soldiers that didnt appear beforehand
    const unusedSoldiers = soldiers.filter((soldier) => !this.orderedSoldiers.includes(soldier));

    this.orderedSoldiers.unshift(...unusedSoldiers);
  }

  /**
   * Get an array of soldiers to be used in the specified guard time.
   * @param guardTime Used to check that the soldiers are not busy at the specified guard time.
   * @param amount Amount of soldiers to retrieve. default is 1.
   * @returns An array with the requested amount of soldiers to be used next for the specified guard post.
   */
  next(guardTime: GuardTime, amount: number = 1): string[] {
    const nextSoldiers: string[] = [];
    const busySoldiers: string[] = [];

    while (nextSoldiers.length < amount) {
      const nextSoldier = this.orderedSoldiers.shift();

      if (!nextSoldier) {
        this.orderedSoldiers.unshift(...busySoldiers); // add all the busy soldiers back to the queue

        throw new Error('not enough soldiers were found');
      }

      const isBusy = isSoldierBusy(this.guardLists, guardTime, nextSoldier);
      if (isBusy) {
        busySoldiers.push(nextSoldier);
      } else {
        nextSoldiers.push(nextSoldier);
      }
    }

    this.orderedSoldiers.push(...nextSoldiers); // add the soldiers to the end of the queue
    this.orderedSoldiers.unshift(...busySoldiers); // add the busy soldiers to the top of the queue so they will be the ones to use next

    return nextSoldiers;
  }
}
