export const GUARD_PERIODS_PER_DAY = 48; // 1 period = 30min

export const GUARD_PERIODS_FOR_CALCULATION = GUARD_PERIODS_PER_DAY * 3; // 3 days

export interface GuardTime {
  period: number;
  date: Date;
}

export function getUpcomingGuardTime(): GuardTime {
  const now = new Date();
  const totalMinutesInDay = 24 * 60; // 24 hours in a day, 60 minutes in an hour
  const minutesPerPeriod = totalMinutesInDay / GUARD_PERIODS_PER_DAY;

  // Calculate the total minutes passed since midnight
  const totalMinutesPassed = now.getHours() * 60 + now.getMinutes();

  // Calculate the index of the current timespan
  return {
    period: Math.ceil(totalMinutesPassed / minutesPerPeriod),
    date: now,
  };
}

export function getNextPeriodGuardTime(guardTime: GuardTime): GuardTime {
  const nextPeriod = (guardTime.period + 1) % GUARD_PERIODS_PER_DAY;
  const nextDate = nextPeriod === 0 ? getNextDate(guardTime.date) : new Date(guardTime.date);

  return {
    period: nextPeriod,
    date: nextDate,
  };
}

export function getNextDate(date: Date): Date {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + 1);
  return nextDate;
}

export function isGuardTimeEqual(gt1: GuardTime, gt2: GuardTime): boolean {
  return gt1.period === gt2.period && gt1.date.toDateString() === gt2.date.toDateString();
}

export function compareGuardTime(gt1: GuardTime, gt2: GuardTime): number {
  const date1 = new Date(gt1.date.toDateString());
  const date2 = new Date(gt2.date.toDateString());

  if (date1 > date2) return -1;
  if (date1 < date2) return 1;
  if (gt1.period > gt2.period) return -1;
  if (gt1.period < gt2.period) return 1;

  return 0;
}
