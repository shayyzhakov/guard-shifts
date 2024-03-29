import {
  type GuardTime,
  compareGuardTime,
  addDurationToGuardTime,
} from '../../helpers/periodHelpers';
import type { GuardList, GuardListShift } from '../../interfaces/guardList.interface';
import {
  getShiftDuration,
  getGuardPostSoldiersAmount,
  getTeamsForGuardPost,
} from '../../helpers/guardPostHelpers';
import type { GuardPost } from '../../interfaces/guardPost.interface';
import type { StrategyHandler } from '../../interfaces/strategyHandler.interface';
import { Team } from '../../interfaces/team.interface';
import { NextTeamAndSoldiers, TeamsQueue } from '../queues/teamsQueue';

export const teamRoundRobinStrategyHandler: StrategyHandler = (
  guardPost: GuardPost,
  guardLists: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime,
  teams: Team[]
): GuardListShift[] => {
  const shifts: GuardListShift[] = [];
  let currentGuardTime = startingGuardTime;

  // TODO: take and merge all guard posts that have team-roundrobin strategy
  const relevantTeams = getTeamsForGuardPost(guardPost.id, teams);
  const relevantTeamsQueue = new TeamsQueue(guardPost.id, relevantTeams, guardLists, shifts);

  while (compareGuardTime(currentGuardTime, endingGuardTime) >= 0) {
    const numOfSoldiersForCurrentPeriod = getGuardPostSoldiersAmount(
      guardPost,
      currentGuardTime.period
    );
    const shiftDuration = getShiftDuration(guardPost, currentGuardTime.period);

    if (numOfSoldiersForCurrentPeriod !== 0) {
      // find the next team
      let teamAndSoldiers: NextTeamAndSoldiers | undefined = undefined;
      let error: string | undefined;
      try {
        teamAndSoldiers = relevantTeamsQueue.next(
          currentGuardTime,
          numOfSoldiersForCurrentPeriod,
          shiftDuration
        );
      } catch (err) {
        error = err instanceof Error ? err.message : 'unknown error';
      }

      shifts.push({
        soldiers: teamAndSoldiers?.soldiers ?? [],
        team: teamAndSoldiers?.id,
        guardTime: currentGuardTime,
        duration: shiftDuration,
        error,
      });
    }

    currentGuardTime = addDurationToGuardTime(currentGuardTime, shiftDuration);
  }

  return shifts;
};
