import { GuardTime } from '../../helpers/periodHelpers';
import { GuardList } from '../../interfaces/guardList.interface';
import { isSoldierBusy } from '../../helpers/guardListHelpers';
import { getSoldierIdsByLatestGuardOrder } from '../../helpers/guardListHelpers';
import { getSoldierIdsForGuardPost } from '../../helpers/guardPostHelpers';
import { Team } from '../../interfaces/team.interface';

/**
 * A round robin queue of soldiers to be used, while chronological order is the top priority.
 */
export class SoldiersQueue {
  /**
   * Soldiers queue, from the oldest to the newest (such that the first element is the next one to be used).
   */
  private soldiersForGuardPost: string[] = [];

  constructor(guardPostId: string, teams: Team[], private guardLists: GuardList[]) {
    const orderedSoldiers: string[] = [];
    const relevantSoldiers = getSoldierIdsForGuardPost(guardPostId, teams);
    const orderedSoldiersFromGuardList = getSoldierIdsByLatestGuardOrder(this.guardLists).filter(
      (soldier) => relevantSoldiers.includes(soldier)
    );

    // TODO: sort soldiers by their last guard time
    // insert soldiers that already appeared in the guard list, from the older to the newer
    orderedSoldiers.unshift(...orderedSoldiersFromGuardList);

    // insert soldiers that didnt appear beforehand
    const unusedSoldiers = relevantSoldiers.filter((soldier) => !orderedSoldiers.includes(soldier));
    orderedSoldiers.unshift(...unusedSoldiers);

    this.soldiersForGuardPost = orderedSoldiers;
  }

  /**
   * Get an array of soldiers to be used in the specified guard time.
   * @param guardTime Used to check that the soldiers are not busy at the specified guard time.
   * @param amount Amount of soldiers to retrieve. default is 1.
   * @returns An array with the requested amount of soldiers to be used next for the specified guard post.
   */
  next(guardTime: GuardTime, amount: number = 1): string[] {
    const soldierIds: string[] = [];
    const busySoldierIds: string[] = [];

    while (soldierIds.length < amount) {
      const nextSoldier = this.soldiersForGuardPost.shift();

      if (!nextSoldier) {
        throw new Error('no soldiers were found');
      }

      const isBusy = isSoldierBusy(this.guardLists, guardTime, nextSoldier);
      if (isBusy) {
        busySoldierIds.push(nextSoldier);
      } else {
        soldierIds.push(nextSoldier);
      }
    }

    this.soldiersForGuardPost.push(...soldierIds); // add the soldiers to the end of the queue
    this.soldiersForGuardPost.unshift(...busySoldierIds); // add the busy soldiers to the top of the queue so they will be the ones to use next

    return soldierIds;
  }
}
