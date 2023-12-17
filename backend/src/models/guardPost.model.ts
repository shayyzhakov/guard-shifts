import { getNextDate, GUARD_PERIODS_PER_DAY, type GuardTime } from '../helpers/periodHelpers';
import { guardPosts } from '../data/guardPosts.data';
import type { GuardPost, GuardPostOccupation } from '../interfaces/guardPost.interface';

// lower order is being handled first
export const strategies = [
  {
    id: 'roundrobin',
    order: 2,
  },
  {
    id: 'team-roundrobin',
    order: 1,
  },
];

export function getGuardPostOrder(guardPostName: string): number {
  const relevantGuardPost: GuardPost | undefined = guardPosts.find(
    (guardPost) => guardPost.name === guardPostName
  );
  if (!relevantGuardPost) {
    console.error(`could not find guard post named ${guardPostName}`);
    return 999;
  }

  const strategy = strategies.find((s) => s.id === relevantGuardPost.strategy);
  if (!strategy) {
    console.error(`could not find strategy named ${relevantGuardPost.strategy}`);
    return 999;
  }

  return strategy.order;
}

export function getAllGuardPosts(): GuardPost[] {
  return guardPosts;
}

export function getUpcomingGuardTimeForGuardPost(
  guardPostName: string,
  fromGuardTime: GuardTime
): GuardTime {
  const relevantGuardPost: GuardPost | undefined = guardPosts.find(
    (guardPost) => guardPost.name === guardPostName
  );
  if (!relevantGuardPost) {
    console.error(`could not find guard post named ${guardPostName}`);
    return fromGuardTime;
  }

  const upcomingPeriod = getUpcomingPeriodForGuardPost(relevantGuardPost, fromGuardTime.period);
  const upcomingDate =
    fromGuardTime.period <= upcomingPeriod ? fromGuardTime.date : getNextDate(fromGuardTime.date);

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

export function getGuardPostSoldiersAmount(guardPostName: string, period: number): number {
  const relevantGuardPost: GuardPost | undefined = guardPosts.find(
    (guardPost) => guardPost.name === guardPostName
  );
  if (!relevantGuardPost) {
    console.error(`could not find guard post named ${guardPostName}`);
    return 0;
  }

  const shouldGuardPostBeOccupied = !!occupationByPeriod(relevantGuardPost, period);
  return shouldGuardPostBeOccupied ? relevantGuardPost.numOfSoldiers : 0;
}

export function getGuardPostGuardPeriodDuration(guardPostName: string, period: number): number {
  const relevantGuardPost: GuardPost | undefined = guardPosts.find(
    (guardPost) => guardPost.name === guardPostName
  );
  if (!relevantGuardPost) {
    console.error(`could not find guard post named ${guardPostName}`);
    return 1;
  }

  const occupation = occupationByPeriod(relevantGuardPost, period);
  return occupation?.duration ?? 1;
}

export function occupationByPeriod(
  guardPost: GuardPost,
  period: number
): GuardPostOccupation | undefined {
  return guardPost.occupation.find((occupation) => {
    if (occupation.from < occupation.to) {
      if (period >= occupation.from && period < occupation.to) return occupation;
    } else if (period >= occupation.from || period < occupation.to) {
      return occupation;
    }
  });
}

export function getGuardPostDisplayName(guardPostName: string): string {
  const relevantGuardPost: GuardPost | undefined = guardPosts.find(
    (guardPost) => guardPost.name === guardPostName
  );
  if (!relevantGuardPost) {
    console.error(`could not find guard post named ${guardPostName}`);
    return '';
  }

  return relevantGuardPost.displayName;
}
