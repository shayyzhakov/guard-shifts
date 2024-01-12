export const GUARD_PERIODS_PER_DAY = 48; // 1 period = 30min

export interface GuardTime {
  period: number;
  date: Date;
}

export function getUpcomingPeriod(): number {
  const now = new Date();
  const totalMinutesInDay = 24 * 60; // 24 hours in a day, 60 minutes in an hour
  const minutesPerPeriod = totalMinutesInDay / GUARD_PERIODS_PER_DAY;

  // calculate the total minutes passed since midnight
  const totalMinutesPassed = now.getHours() * 60 + now.getMinutes();
  return Math.ceil(totalMinutesPassed / minutesPerPeriod);
}

export function getUpcomingGuardTime(fromPeriod: number): GuardTime {
  const now = new Date();
  const upcomingPeriod = getUpcomingPeriod();

  // date would be tomorrow if fromPeriod is lower than current period
  const date = fromPeriod < upcomingPeriod ? addDays(now, 1) : now;

  return {
    period: fromPeriod,
    date,
  };
}

export function addDurationToGuardTime(guardTime: GuardTime, duration: number): GuardTime {
  const newPeriod = (guardTime.period + duration) % GUARD_PERIODS_PER_DAY;
  const daysPassed = Math.floor((guardTime.period + duration) / GUARD_PERIODS_PER_DAY);
  const newDate = addDays(guardTime.date, daysPassed);

  return {
    period: newPeriod,
    date: newDate,
  };
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

export function isGuardTimeEqual(gt1: GuardTime, gt2: GuardTime): boolean {
  return gt1.period === gt2.period && gt1.date.toDateString() === gt2.date.toDateString();
}

export function isGuardTimeGreaterThanOrEqual(gt1: GuardTime, gt2: GuardTime): boolean {
  return compareGuardTime(gt1, gt2) <= 0 ? true : false;
}

export function isGuardTimeBefore(gt1: GuardTime, gt2: GuardTime): boolean {
  return compareGuardTime(gt1, gt2) > 0 ? true : false;
}

/**
 * Compare two guard times.
 * @returns Returns -1 if gt1 is greater than gt2, 1 if gt1 is smaller than gt2, and 0 if they are equal.
 */
export function compareGuardTime(gt1: GuardTime, gt2: GuardTime): number {
  const date1 = new Date(gt1.date.toDateString());
  const date2 = new Date(gt2.date.toDateString());

  if (date1 > date2) return -1;
  if (date1 < date2) return 1;
  if (gt1.period > gt2.period) return -1;
  if (gt1.period < gt2.period) return 1;

  return 0;
}
