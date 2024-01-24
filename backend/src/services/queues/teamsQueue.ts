import { GuardTime } from '../../helpers/periodHelpers';
import { GuardList, GuardListShift } from '../../interfaces/guardList.interface';
import { isTeamBusy } from '../../helpers/guardListHelpers';
import { Team } from '../../interfaces/team.interface';
import { SoldiersQueue } from './soldiersQueue';
import { orderTeamsByLastTeamGuard } from '../../helpers/teamHelpers';

interface OrderedTeam {
  id: string;
  name: string;
  soldiersQueue: SoldiersQueue;
}

export interface NextTeamAndSoldiers {
  id: string;
  soldiers: string[];
}

/**
 * A round robin queue of teams, while chronological order is the top priority.
 */
export class TeamsQueue {
  /**
   * Teams queue, from the oldest to the newest (such that the first element is the next one to be used).
   * Each team has an ordered list of soldiers, from the oldest to the newest (such that the first element is the next one to be used).
   */
  private orderedTeamsAndSoldiers: OrderedTeam[] = [];

  constructor(
    guardPostId: string,
    teams: Team[],
    private guardLists: GuardList[],
    private uncommitedShifts: GuardListShift[]
  ) {
    // order teams by last guard time
    const guardPostGuardList =
      guardLists.find((gl) => gl.guardPostId === guardPostId)?.shifts ?? [];

    const orderedTeams = orderTeamsByLastTeamGuard(teams, guardPostGuardList);

    // TODO: create soldiers queue based on soldiers appearance in team roundrobin guard lists only
    // const teamRoundrobinGuardLists = guardLists.filter((gl) => 'team' in gl.shifts[0]);

    // for each ordered team, create an ordered soldiers queue
    this.orderedTeamsAndSoldiers = orderedTeams.map((team) => ({
      id: team.id,
      name: team.name,
      soldiersQueue: new SoldiersQueue(team.people, guardLists, uncommitedShifts),
    }));
  }

  /**
   * Get the team and soldiers to be used in the specified guard time.
   * @param guardTime Used to check that the soldiers are not busy at the specified guard time.
   * @param soldiersAmount Amount of soldiers to retrieve. Soldiers will be taken from the same team.
   * @returns A team along with an array of the requested amount of soldiers to be used next for the specified guard post.
   */
  next(guardTime: GuardTime, soldiersAmount: number, shiftDuration: number): NextTeamAndSoldiers {
    const busyTeams: OrderedTeam[] = [];
    let selectedTeamAndSoldiers: NextTeamAndSoldiers | undefined;

    // find the next team to use (or throw an error if no team was found)
    while (!selectedTeamAndSoldiers) {
      const nextTeam = this.orderedTeamsAndSoldiers.shift();
      if (!nextTeam) {
        // either there are no relevant teams or all teams are busy
        this.orderedTeamsAndSoldiers.unshift(...busyTeams); // add all the busy teams back to the queue
        throw new Error('relevant team not found');
      }

      const isBusy = isTeamBusy(this.guardLists, guardTime, nextTeam.id);
      if (isBusy) {
        busyTeams.push(nextTeam);
      } else {
        try {
          // find the next soldiers to use from the selected team
          const selectedSoldiers = nextTeam.soldiersQueue.next(
            guardTime,
            soldiersAmount,
            shiftDuration
          );

          // if soldiers are found, return the team and soldiers
          this.orderedTeamsAndSoldiers.push(nextTeam); // add the team to the end of the queue
          this.orderedTeamsAndSoldiers.unshift(...busyTeams); // add the busy teams to the top of the queue so they will be the ones to use next
          selectedTeamAndSoldiers = {
            id: nextTeam.id,
            soldiers: selectedSoldiers,
          };
        } catch (err) {
          // if couldn't find soldiers for the selected team, add the team to the busy teams and try the next team
          busyTeams.push(nextTeam);
        }
      }
    }

    return selectedTeamAndSoldiers;
  }
}
