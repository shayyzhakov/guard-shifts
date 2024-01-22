import { GuardTime } from '../../helpers/periodHelpers';
import { GuardList } from '../../interfaces/guardList.interface';
import { isSoldierBusy } from '../../helpers/guardListHelpers';
import { getSoldiersWithScoreFromGuardList } from '../statistics/soldiers.statistics';
import { GuardPost } from '../../interfaces/guardPost.interface';

interface SoldierWithScore {
  soldier: string;
  score: number;
}

/**
 * A scored queue of soldiers to be used, while lower-to-higher score order is the top priority.
 */
export class SoldiersScoredQueue {
  private orderedSoldiersAndScore: SoldierWithScore[] = [];
  private usedSoldiers: SoldierWithScore[] = []; // helps ensuring that soldiers will be used the same amount of times

  constructor(guardPost: GuardPost, soldiers: string[], private guardLists: GuardList[]) {
    // get score for soldiers that already appeared in the guard list
    // TODO: what if a new sodier is created? he wont have a score and will be over-used
    const soldiersWithScore = getSoldiersWithScoreFromGuardList(guardPost, guardLists).filter(
      (soldier) => soldiers.includes(soldier.soldier)
    );

    // get score for soldiers that didnt appear beforehand
    const unusedSoldiersWithScore = soldiers
      .filter((soldier) => !soldiersWithScore.some((s) => s.soldier === soldier))
      .map((soldier) => ({ soldier, score: 0 }));

    // add soldiers sorted by score to the queue
    this.enqueue([...soldiersWithScore, ...unusedSoldiersWithScore]);
  }

  /**
   * Get an array of soldiers to be used in the specified guard time.
   * @param guardTime Used to check that the soldiers are not busy at the specified guard time.
   * @param amount Amount of soldiers to retrieve.
   * @param score The score to be added to the soldiers.
   * @returns An array with the requested amount of soldiers to be used next for the specified guard post.
   */
  next(guardTime: GuardTime, amount: number, score: number): string[] {
    const nextSoldiers: SoldierWithScore[] = [];
    const busySoldiers: SoldierWithScore[] = [];

    while (nextSoldiers.length < amount) {
      const nextSoldier = this.dequeue();

      if (!nextSoldier) {
        this.enqueue(busySoldiers); // add all the busy soldiers back to the queue

        throw new Error('not enough soldiers were found');
      }

      const isBusy = isSoldierBusy(this.guardLists, guardTime, nextSoldier.soldier);
      if (isBusy) {
        busySoldiers.push(nextSoldier);
      } else {
        nextSoldiers.push(nextSoldier);
      }
    }

    // add score to the used soldiers
    nextSoldiers.forEach((soldier) => {
      soldier.score += score;
    });

    // add all soldiers back to the queues
    this.usedSoldiers.push(...nextSoldiers);
    this.enqueue(busySoldiers);

    return nextSoldiers.map((soldier) => soldier.soldier);
  }

  private enqueue(soldiersWithScore: SoldierWithScore[]): void {
    this.orderedSoldiersAndScore.push(...soldiersWithScore);
    this.orderedSoldiersAndScore.sort((a, b) => a.score - b.score);
  }

  private dequeue(): SoldierWithScore | undefined {
    // if the queue is empty, add the used soldiers back to the queue
    if (this.orderedSoldiersAndScore.length === 0) {
      this.enqueue(this.usedSoldiers);
      this.usedSoldiers = [];
    }

    return this.orderedSoldiersAndScore.shift();
  }
}
