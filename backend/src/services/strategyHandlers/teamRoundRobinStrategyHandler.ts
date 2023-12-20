import {
  type GuardTime,
  getNextPeriodGuardTime,
  compareGuardTime,
} from '../../helpers/periodHelpers';
import { getTeamsForGuardPost } from '../../models/team.model';
import { isTeamBusy, isSoldierBusy, mergeGuardLists } from '../../models/guardList.model';
import type { GuardList, GuardListPeriod } from '../../interfaces/guardList.interface';
import {
  getGuardPostGuardPeriodDuration,
  getGuardPostSoldiersAmount,
} from '../../models/guardPost.model';
import type { GuardPost } from '../../interfaces/guardPost.interface';
import type { StrategyHandler } from '../../interfaces/strategyHandler.interface';
import { Team } from '../../interfaces/team.interface';

export const teamRoundRobinStrategyHandler: StrategyHandler = (
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime
): GuardListPeriod[] => {
  const guardListPerPeriod: GuardListPeriod[] = [];
  let currentGuardTime = startingGuardTime;
  let currentTeamIndex = 0;
  const mergedGuardLists = mergeGuardLists(guardListHistory, guardList);

  // TODO: take and merge all guard posts that have team-roundrobin strategy
  const guardPostMergedGuardPeriods =
    mergedGuardLists.find((gl) => gl.guardPostName === guardPost.name)?.guardList ?? [];
  const relevantTeams = getNextTeamsQueue(guardPost.name, guardPostMergedGuardPeriods);

  const biggestTeamSize = Math.max(...relevantTeams.map((team) => team.people.length));

  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost.name,
      currentGuardTime.period
    );
    const periodsPerGuard = getGuardPostGuardPeriodDuration(
      guardPost.name,
      currentGuardTime.period
    );

    const currentTeam = relevantTeams[currentTeamIndex];
    const isCurrentTeamBusy = isTeamBusy(guardList, currentGuardTime, currentTeam.name);
    const freeTeamMembers = currentTeam.people.filter(
      (soldier) => !isSoldierBusy(guardList, currentGuardTime, soldier)
    );

    if (isCurrentTeamBusy) {
      // current team is busy this day
      console.info(`team ${currentTeam.name} is busy this day. moving on to the next team`);

      // TODO: when a team is skipped, it should not be moved to the end of the queue
      currentTeamIndex = (currentTeamIndex + 1) % relevantTeams.length;
    } else if (biggestTeamSize < numOfSoldiersForCurrentPeriod) {
      // all teams are too small for this guard post
      console.error(
        `no teams has enough members for guard post that requires ${numOfSoldiersForCurrentPeriod}`
      );

      guardListPerPeriod.push({
        soldiers: [],
        team: undefined,
        error: 'relevant team not found',
        guardTime: currentGuardTime,
        duration: 1,
      });
      currentGuardTime = getNextPeriodGuardTime(currentGuardTime);
    } else if (freeTeamMembers.length < numOfSoldiersForCurrentPeriod) {
      // current team has too few members for this guard post
      console.info(
        `team ${currentTeam.name} has only ${freeTeamMembers.length} free members but guard post requires ${numOfSoldiersForCurrentPeriod}`
      );

      currentTeamIndex = (currentTeamIndex + 1) % relevantTeams.length;
    } else if (numOfSoldiersForCurrentPeriod === 0) {
      // skip this period
      guardListPerPeriod.push({
        soldiers: [],
        team: undefined,
        guardTime: currentGuardTime,
        duration: 1,
      });
      currentGuardTime = getNextPeriodGuardTime(currentGuardTime);
    } else {
      // TODO: this method always selects the same team members
      const soldiers = freeTeamMembers.slice(0, numOfSoldiersForCurrentPeriod);

      // insert the final guard period to the list
      for (let i = 0; i < periodsPerGuard; i++) {
        guardListPerPeriod.push({
          soldiers,
          team: currentTeam.name,
          guardTime: currentGuardTime,
          duration: 1,
        });
        currentGuardTime = getNextPeriodGuardTime(currentGuardTime);
      }

      if (numOfSoldiersForCurrentPeriod > 0) {
        currentTeamIndex = (currentTeamIndex + 1) % relevantTeams.length;
      }
    }
  }

  return guardListPerPeriod;
};

/**
 * based on the guard list history, get a sorted list of teams that should be used next
 * @returns sorted list of teams (lower index should be used first)
 */
function getNextTeamsQueue(
  guardPostName: string,
  historyGuardListPeriods: GuardListPeriod[]
): Team[] {
  const teamsQueue: Team[] = [];
  const relevantTeams = getTeamsForGuardPost(guardPostName);

  // insert teams that already appeared in the guard list, from the older to the newer
  for (const guardListPeriod of historyGuardListPeriods.reverse()) {
    if (
      guardListPeriod.team &&
      teamsQueue.every((team) => team.name !== guardListPeriod.team) // should be unique in the queue
    ) {
      const team = relevantTeams.find((team) => team.name === guardListPeriod.team);
      if (team) {
        teamsQueue.unshift(team);
      }
    }
  }

  // insert teams that didnt appear beforehand
  const newTeams = relevantTeams.filter((team) =>
    teamsQueue.every((team2) => team.name !== team2.name)
  );
  teamsQueue.unshift(...newTeams);

  return teamsQueue;
}
