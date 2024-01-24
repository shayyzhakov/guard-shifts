export const GUARD_PERIODS_PER_DAY = 48; // 1 period = 30min

export interface GuardTime {
  period: number;
  date: Date;
}

/**
 * Returns the next guard time period.
 * Example: if current time is 10:15, the upcoming period would be 21, which is 10:30.
 */
export function getUpcomingPeriod(): number {
  const now = new Date();
  const totalMinutesInDay = 24 * 60; // 24 hours in a day, 60 minutes in an hour
  const minutesPerPeriod = totalMinutesInDay / GUARD_PERIODS_PER_DAY;

  // calculate the total minutes passed since midnight
  const totalMinutesPassed = now.getHours() * 60 + now.getMinutes();
  return Math.ceil(totalMinutesPassed / minutesPerPeriod);
}

/**
 * Returns a guard time object for the specified period, with the date set to the next date that this period occurs.
 */
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

/**
 * Adds the specified duration (periods) to the given guard time.
 * @returns A new guard time after adding the specified duration to the given guard time.
 */
export function addDurationToGuardTime(guardTime: GuardTime, duration: number): GuardTime {
  const newPeriod = (guardTime.period + duration) % GUARD_PERIODS_PER_DAY;
  const daysPassed = Math.floor((guardTime.period + duration) / GUARD_PERIODS_PER_DAY);
  const newDate = addDays(guardTime.date, daysPassed);

  return {
    period: newPeriod,
    date: newDate,
  };
}

/**
 * Subtracts the specified duration (periods) from the given guard time.
 * @returns A new guard time after subtracting the specified duration from the given guard time.
 */
export function subtractDurationFromGuardTime(guardTime: GuardTime, duration: number): GuardTime {
  const daysSubtraction = Math.floor((guardTime.period - duration) / GUARD_PERIODS_PER_DAY);
  const newPeriod =
    (-1 * daysSubtraction * GUARD_PERIODS_PER_DAY + guardTime.period - duration) %
    GUARD_PERIODS_PER_DAY;
  const newDate = addDays(guardTime.date, daysSubtraction);

  return {
    period: newPeriod,
    date: newDate,
  };
}

/**
 * Adds the specified number of days to the given date.
 * @returns A new date after adding the specified number of days to the given date.
 */
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
