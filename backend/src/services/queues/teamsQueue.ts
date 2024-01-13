import { GuardTime } from '../../helpers/periodHelpers';
import { GuardList, GuardListPeriod } from '../../interfaces/guardList.interface';
import { isTeamBusy } from '../../helpers/guardListHelpers';
import { Team } from '../../interfaces/team.interface';
import { SoldiersQueue } from './soldiersQueue';

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

  constructor(guardPostId: string, teams: Team[], private guardLists: GuardList[]) {
    // order teams by last guard time
    const guardPostGuardList =
      guardLists.find((gl) => gl.guardPostId === guardPostId)?.guardList ?? [];

    const orderedTeams = orderTeamsByLastTeamGuard(teams, guardPostGuardList);

    // TODO: create soldiers queue based on soldiers appearance in team roundrobin guard lists only
    // const teamRoundrobinGuardLists = guardLists.filter((gl) => 'team' in gl.guardList[0]);

    // for each ordered team, create an ordered soldiers queue
    this.orderedTeamsAndSoldiers = orderedTeams.map((team) => ({
      id: team.id,
      name: team.name,
      soldiersQueue: new SoldiersQueue(team.people, guardLists),
    }));
  }

  /**
   * Get the team and soldiers to be used in the specified guard time.
   * @param guardTime Used to check that the soldiers are not busy at the specified guard time.
   * @param soldiersAmount Amount of soldiers to retrieve. Soldiers will be taken from the same team.
   * @returns A team along with an array of the requested amount of soldiers to be used next for the specified guard post.
   */
  next(guardTime: GuardTime, soldiersAmount: number): NextTeamAndSoldiers {
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
          const selectedSoldiers = nextTeam.soldiersQueue.next(guardTime, soldiersAmount);

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

/**
 * based on the guard post shifts, get a sorted list of teams that should be used next in the guard post.
 * @returns sorted list of teams (lower index should be used next)
 */
function orderTeamsByLastTeamGuard(teams: Team[], guardPostShifts: GuardListPeriod[]): Team[] {
  const orderedTeams: Team[] = [];

  // insert teams that already appeared in the guard list, from the older to the newer
  for (const guardListPeriod of guardPostShifts.reverse()) {
    if (
      guardListPeriod.team &&
      orderedTeams.every((team) => team.id !== guardListPeriod.team) // should be unique in the queue
    ) {
      const team = teams.find((team) => team.id === guardListPeriod.team);
      if (team) {
        orderedTeams.unshift(team);
      }
    }
  }

  // insert teams that didnt appear beforehand
  const newTeams = teams.filter((team) => orderedTeams.every((team2) => team.id !== team2.id));
  orderedTeams.unshift(...newTeams);

  return orderedTeams;
}

// function orderSoldiersByLastTeamGuard(soldiers: string[], guardList: GuardList[]): string[] {
//   const soldiersLastGuardTime = soldiers.reduce((acc, soldier) => {
//     // find the last soldier guard time for each guard post
//     const soldierLastGuardTimePerGuardPost = guardList
//       .filter((gl) => 'team' in gl.guardList[0]) // filter out when guard post is not relevant for a team
//       .map((gl) => {
//         // find the last guard list period for the current soldier
//         return [...gl.guardList].reverse().find((glp) => glp.soldiers.includes(soldier));
//       })
//       .filter((glp): glp is GuardListPeriod => glp !== undefined) // filter out when soldier never guarded in the guard post
//       .map((glp) => glp.guardTime);

//     // find the last soldier guard time in any of the guard posts
//     const soldierLastGuardTime = soldierLastGuardTimePerGuardPost.reduce(
//       (acc, glp) => {
//         return compareGuardTime(acc, glp) > 0 ? glp : acc;
//       },
//       { period: 0, date: new Date(0) } // default value is the earliest possible guard time, relevant if soldier was never in a guard list
//     );

//     acc[soldier] = soldierLastGuardTime;

//     return acc;
//   }, {} as Record<string, GuardTime>);

//   const orderedTeamSoldiers = [...soldiers].sort((a, b) =>
//     compareGuardTime(soldiersLastGuardTime[b], soldiersLastGuardTime[a])
//   );

//   return orderedTeamSoldiers;
// }
