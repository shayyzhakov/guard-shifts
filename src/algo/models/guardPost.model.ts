import type { GuardTime } from '@/common/helpers/periodHelpers';
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
    (guardPost) => guardPost.name === guardPostName,
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

export function getUpcomingPeriod(guardPostName: string, fromGuardTime: GuardTime): GuardTime {
  const relevantGuardPost: GuardPost | undefined = guardPosts.find(
    (guardPost) => guardPost.name === guardPostName,
  );
  if (!relevantGuardPost) {
    console.error(`could not find guard post named ${guardPostName}`);
    return fromGuardTime;
  }

  // TODO: what about doing modulu to period?
  if (
    (relevantGuardPost.hasPeriodOffset && fromGuardTime.period % 2 === 0) || // starting period should take into account the period offset of the current guard post
    (!relevantGuardPost.hasPeriodOffset && fromGuardTime.period % 2 === 1)
  ) {
    return { period: fromGuardTime.period + 1, date: fromGuardTime.date };
  }

  return fromGuardTime;
}

export function getGuardPostSoldiersAmount(guardPostName: string, period: number): number {
  const relevantGuardPost: GuardPost | undefined = guardPosts.find(
    (guardPost) => guardPost.name === guardPostName,
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
    (guardPost) => guardPost.name === guardPostName,
  );
  if (!relevantGuardPost) {
    console.error(`could not find guard post named ${guardPostName}`);
    return 1;
  }

  const occupation = occupationByPeriod(relevantGuardPost, period);
  return occupation?.duration ?? 1;
}

function occupationByPeriod(guardPost: GuardPost, period: number): GuardPostOccupation | undefined {
  return guardPost.occupation.find((occupation) => {
    if (occupation.from < occupation.to) {
      if (period >= occupation.from && period < occupation.to) return occupation;
    } else if (period >= occupation.from || period < occupation.to) {
      return occupation;
    }
  });
}
