import {
  type GuardTime,
  getNextPeriodGuardTime,
  compareGuardTime,
  addDurationToGuardTime,
} from '../../helpers/periodHelpers';
import { getTeamsForGuardPost } from '../../models/team.model';
import { isTeamBusy, isSoldierBusy } from '../../helpers/guardListHelpers';
import { mergeGuardLists } from '../../helpers/guardListHelpers';
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
  endingGuardTime: GuardTime,
  teams: Team[]
): GuardListPeriod[] => {
  const guardListPerPeriod: GuardListPeriod[] = [];
  let currentGuardTime = startingGuardTime;
  let currentTeamIndex = 0;
  const mergedGuardLists = mergeGuardLists(guardListHistory, guardList);

  // TODO: take and merge all guard posts that have team-roundrobin strategy
  const guardPostMergedGuardPeriods =
    mergedGuardLists.find((gl) => gl.guardPostId === guardPost.id)?.guardList ?? [];
  const relevantTeams = getNextTeamsQueue(guardPost.id, teams, guardPostMergedGuardPeriods);

  let firstFailingTryTeamIndex;

  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost,
      currentGuardTime.period
    );
    const periodsPerGuard = getGuardPostGuardPeriodDuration(guardPost, currentGuardTime.period);

    const currentTeam = relevantTeams[currentTeamIndex];
    const isCurrentTeamBusy = isTeamBusy(guardList, currentGuardTime, currentTeam.id);
    const freeTeamMembers = currentTeam.people.filter(
      (soldier) => !isSoldierBusy(guardList, currentGuardTime, soldier)
    );

    if (firstFailingTryTeamIndex === currentTeamIndex) {
      // we failed to use any of the teams for the current guard time
      console.error(
        `no teams was able to be used for guard post ${guardPost.displayName} at ${currentGuardTime.date} period ${currentGuardTime.period}`
      );

      guardListPerPeriod.push({
        soldiers: [],
        team: undefined,
        error: 'relevant team not found',
        guardTime: currentGuardTime,
        duration: 1,
      });
      currentGuardTime = getNextPeriodGuardTime(currentGuardTime);
      firstFailingTryTeamIndex = undefined;
    } else if (isCurrentTeamBusy || freeTeamMembers.length < numOfSoldiersForCurrentPeriod) {
      // current team is busy this day or has too few members for this guard post
      console.info(
        `team ${currentTeam.name} can't be used at this guard time. it is either busy or doesn't have enough members (${freeTeamMembers.length}/${numOfSoldiersForCurrentPeriod})`
      );

      // TODO: when a team is skipped, it should not be moved to the end of the queue
      firstFailingTryTeamIndex ||= currentTeamIndex;
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
      firstFailingTryTeamIndex = undefined;
    } else {
      // TODO: this method always selects the same team members
      const soldiers = freeTeamMembers.slice(0, numOfSoldiersForCurrentPeriod);

      // insert the final guard period to the list
      guardListPerPeriod.push({
        soldiers,
        team: currentTeam.id,
        guardTime: currentGuardTime,
        duration: periodsPerGuard,
      });
      currentGuardTime = addDurationToGuardTime(currentGuardTime, periodsPerGuard);

      if (numOfSoldiersForCurrentPeriod > 0) {
        currentTeamIndex = (currentTeamIndex + 1) % relevantTeams.length;
      }
      firstFailingTryTeamIndex = undefined;
    }
  }

  return guardListPerPeriod;
};

/**
 * based on the guard list history, get a sorted list of teams that should be used next
 * @returns sorted list of teams (lower index should be used first)
 */
function getNextTeamsQueue(
  guardPostId: string,
  teams: Team[],
  historyGuardListPeriods: GuardListPeriod[]
): Team[] {
  const teamsQueue: Team[] = [];
  const relevantTeams = getTeamsForGuardPost(guardPostId, teams);

  // insert teams that already appeared in the guard list, from the older to the newer
  for (const guardListPeriod of historyGuardListPeriods.reverse()) {
    if (
      guardListPeriod.team &&
      teamsQueue.every((team) => team.id !== guardListPeriod.team) // should be unique in the queue
    ) {
      const team = relevantTeams.find((team) => team.id === guardListPeriod.team);
      if (team) {
        teamsQueue.unshift(team);
      }
    }
  }

  // insert teams that didnt appear beforehand
  const newTeams = relevantTeams.filter((team) =>
    teamsQueue.every((team2) => team.id !== team2.id)
  );
  teamsQueue.unshift(...newTeams);

  return teamsQueue;
}
