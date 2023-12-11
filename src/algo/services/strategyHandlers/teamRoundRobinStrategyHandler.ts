import {
  GUARD_PERIODS_FOR_CALCULATION,
  type GuardTime,
  getNextPeriodGuardDate,
} from '../../../common/helpers/periodHelpers';
import { getTeamsForGuardPost } from '../../models/team.model';
import { isTeamBusy, isSoldierBusy } from '../../models/guardList.model';
import type { GuardList } from '@/algo/interfaces/guardList.interface';
import {
  getGuardPostGuardPeriodDuration,
  getGuardPostSoldiersAmount,
} from '@/algo/models/guardPost.model';
import type { GuardPost } from '@/algo/interfaces/guardPost.interface';

// TODO: implement StrategyHandler
export function teamRoundRobinStrategyHandler(
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory,
  startingGuardTime: GuardTime,
) {
  const guardListPerPeriod = [];
  let currentGuardTime = startingGuardTime;
  let currentTeamIndex = 0;
  const relevantTeams = getTeamsForGuardPost(guardPost.name);

  const biggestTeamSize = Math.max(...relevantTeams.map((team) => team.people.length));

  while (guardListPerPeriod.length < GUARD_PERIODS_FOR_CALCULATION) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost.name,
      currentGuardTime.period,
    );
    const periodsPerGuard = getGuardPostGuardPeriodDuration(
      guardPost.name,
      currentGuardTime.period,
    );

    const currentTeam = relevantTeams[currentTeamIndex];
    const isCurrentTeamBusy = isTeamBusy(guardList, currentGuardTime, currentTeam.name);
    const freeTeamMembers = currentTeam.people.filter(
      (soldier) => !isSoldierBusy(guardList, currentGuardTime, soldier),
    );

    if (isCurrentTeamBusy) {
      console.info(`team ${currentTeam.name} is busy this day. moving on to the next team`);

      currentTeamIndex = (currentTeamIndex + 1) % relevantTeams.length;
    } else if (biggestTeamSize < numOfSoldiersForCurrentPeriod) {
      console.error(
        `no teams has enough members for guard post that requires ${numOfSoldiersForCurrentPeriod}`,
      );

      guardListPerPeriod.push({
        soldiers: [],
        team: undefined,
        error: 'relevant team not found',
        guardTime: currentGuardTime,
      });
      currentGuardTime = getNextPeriodGuardDate(currentGuardTime);
    } else if (freeTeamMembers.length < numOfSoldiersForCurrentPeriod) {
      console.info(
        `team ${currentTeam.name} has only ${freeTeamMembers.length} free members but guard post requires ${numOfSoldiersForCurrentPeriod}`,
      );

      currentTeamIndex = (currentTeamIndex + 1) % relevantTeams.length;
    } else {
      // TODO: this method always selects the same team members
      const soldiers = freeTeamMembers.slice(0, numOfSoldiersForCurrentPeriod);

      // insert the next soldier to the list
      for (let i = 0; i < periodsPerGuard; i++) {
        guardListPerPeriod.push({
          soldiers,
          team: currentTeam.name,
          guardTime: currentGuardTime,
        });
        currentGuardTime = getNextPeriodGuardDate(currentGuardTime);
      }

      if (numOfSoldiersForCurrentPeriod > 0) {
        currentTeamIndex = (currentTeamIndex + 1) % relevantTeams.length;
      }
    }
  }

  return guardListPerPeriod;
}
