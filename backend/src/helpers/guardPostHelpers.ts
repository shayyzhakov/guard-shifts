import { GuardPost, GuardPostOccupation, ScoreRange } from '../interfaces/guardPost.interface';
import { Team } from '../interfaces/team.interface';
import { GuardTime, addDays, GUARD_PERIODS_PER_DAY } from './periodHelpers';

export function getTeamsForGuardPost(guardPostId: string, teams: Team[]): Team[] {
  return teams.filter((team) => team.guardPosts.includes(guardPostId));
}

export function getSoldierIdsForGuardPost(guardPostId: string, teams: Team[]): string[] {
  return getTeamsForGuardPost(guardPostId, teams).reduce(
    (acc, team) => acc.concat(team.people),
    [] as string[]
  );
}

export function getGuardPostSoldiersAmount(guardPost: GuardPost, period: number): number {
  const shouldGuardPostBeOccupied = !!occupationByPeriod(guardPost, period);
  return shouldGuardPostBeOccupied ? guardPost.numOfSoldiers : 0;
}

export function getShiftDuration(guardPost: GuardPost, period: number): number {
  const occupation = occupationByPeriod(guardPost, period);
  return occupation?.duration ?? 1;
}

export function getShiftScore(guardPost: GuardPost, period: number): number {
  const scoresRange = scoreRangeByPeriod(guardPost, period);
  return scoresRange?.score ?? 1; // default score is 1
}

function occupationByPeriod(guardPost: GuardPost, period: number): GuardPostOccupation | undefined {
  return guardPost.occupation.find((occupation) =>
    isPeriodInRange(period, occupation.from, occupation.to)
  );
}

function scoreRangeByPeriod(guardPost: GuardPost, period: number): ScoreRange | undefined {
  if ('scores' in guardPost.config && Array.isArray(guardPost.config.scores)) {
    return guardPost.config.scores.find((scoreRange) =>
      isPeriodInRange(period, scoreRange.from, scoreRange.to)
    );
  }
}

function isPeriodInRange(period: number, from: number, to: number): boolean {
  if (from < to) {
    // same day
    return period >= from && period < to;
  } else {
    // overnight
    return period >= from || period < to;
  }
}

export function getUpcomingGuardTimeForGuardPost(
  guardPost: GuardPost,
  fromGuardTime: GuardTime
): GuardTime {
  const upcomingPeriod = getUpcomingPeriodForGuardPost(guardPost, fromGuardTime.period);
  const upcomingDate =
    fromGuardTime.period <= upcomingPeriod ? fromGuardTime.date : addDays(fromGuardTime.date, 1);

  return {
    period: upcomingPeriod,
    date: upcomingDate,
  };
}

function getUpcomingPeriodForGuardPost(guardPost: GuardPost, fromPeriod: number): number {
  const occupation = occupationByPeriod(guardPost, fromPeriod);
  if (occupation) {
    let i = 0;
    if (fromPeriod >= occupation.from) {
      while (occupation.from + occupation.duration * i < fromPeriod) {
        i++;
      }
    } else {
      // fromPeriod < occupation.from
      // iterate until modulu applies
      while (
        (occupation.from + occupation.duration * i) % GUARD_PERIODS_PER_DAY >=
        occupation.from
      ) {
        i++;
      }

      while ((occupation.from + occupation.duration * i) % GUARD_PERIODS_PER_DAY < fromPeriod) {
        i++;
      }
    }
    return (occupation.from + occupation.duration * i) % GUARD_PERIODS_PER_DAY;
  } else {
    let currentPeriod = fromPeriod;
    const occupationsStartingTimes = guardPost.occupation.map((o) => o.from);
    while (!occupationsStartingTimes.includes(currentPeriod)) {
      currentPeriod = (currentPeriod + 1) % GUARD_PERIODS_PER_DAY;
    }

    return currentPeriod;
  }
}
