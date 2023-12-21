import { GuardTime } from '../../helpers/periodHelpers';
import { GuardList } from '../../interfaces/guardList.interface';
import { Soldier } from '../../interfaces/soldier.interface';
import { isSoldierBusy } from '../../models/guardList.model';
import { getPeopleForGuardPost } from '../../models/team.model';

export class SoldiersQueue {
  private soldiersForGuardPost: Soldier[];

  constructor(guardPostName: string, private guardLists: GuardList[]) {
    this.soldiersForGuardPost = getPeopleForGuardPost(guardPostName);

    // TODO: sort soldiers by their last guard time
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
