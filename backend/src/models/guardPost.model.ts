import { GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { addDays, GUARD_PERIODS_PER_DAY, type GuardTime } from '../helpers/periodHelpers';
import type { GuardPost, GuardPostOccupation } from '../interfaces/guardPost.interface';
import { getDbClient } from '../helpers/dbClient';
import { unmarshall } from '@aws-sdk/util-dynamodb';

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

export async function getAllGuardPosts(): Promise<GuardPost[]> {
  const res = await getDbClient().send(new ScanCommand({ TableName: 'GuardPosts' }));

  return (res.Items?.map((item) => unmarshall(item)) ?? []) as GuardPost[];
}

export async function getGuardPostById(guarPostId: string): Promise<GuardPost | undefined> {
  const res = await getDbClient().send(
    new GetItemCommand({
      TableName: 'GuardPosts',
      Key: {
        primaryKey: { S: guarPostId },
      },
    })
  );

  const resItem = res.Item;
  if (!resItem) {
    console.log(`could not find guard post with id ${guarPostId}`);
    return;
  }

  return unmarshall(resItem) as GuardPost;
}

export async function getGuardPostOrder(guardPostId: string): Promise<number> {
  const relevantGuardPost: GuardPost | undefined = await getGuardPostById(guardPostId);
  if (!relevantGuardPost) {
    console.error(`could not find guard post with id ${guardPostId}`);
    return 999;
  }

  const strategy = strategies.find((s) => s.id === relevantGuardPost.strategy);
  if (!strategy) {
    console.error(`could not find strategy named ${relevantGuardPost.strategy}`);
    return 999;
  }

  return strategy.order;
}

export async function getUpcomingGuardTimeForGuardPost(
  guardPostId: string,
  fromGuardTime: GuardTime
): Promise<GuardTime> {
  const relevantGuardPost = await getGuardPostById(guardPostId);

  if (!relevantGuardPost) {
    console.error(`could not find guard post with id ${guardPostId}`);
    return fromGuardTime;
  }

  const upcomingPeriod = getUpcomingPeriodForGuardPost(relevantGuardPost, fromGuardTime.period);
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

export async function getGuardPostSoldiersAmount(
  guardPostId: string,
  period: number
): Promise<number> {
  const relevantGuardPost = await getGuardPostById(guardPostId);

  if (!relevantGuardPost) {
    console.error(`could not find guard post with id ${guardPostId}`);
    return 0;
  }

  const shouldGuardPostBeOccupied = !!occupationByPeriod(relevantGuardPost, period);
  return shouldGuardPostBeOccupied ? relevantGuardPost.numOfSoldiers : 0;
}

export async function getGuardPostGuardPeriodDuration(
  guardPostId: string,
  period: number
): Promise<number> {
  const relevantGuardPost = await getGuardPostById(guardPostId);

  if (!relevantGuardPost) {
    console.error(`could not find guard post with id ${guardPostId}`);
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

export async function getGuardPostDisplayName(guardPostId: string): Promise<string> {
  const relevantGuardPost = await getGuardPostById(guardPostId);

  if (!relevantGuardPost) {
    console.error(`could not find guard post with id ${guardPostId}`);
    return '';
  }

  return relevantGuardPost.displayName;
}
