export const GUARD_PERIODS_PER_DAY = 48; // 1 period = 30min

export const GUARD_PERIODS_FOR_CALCULATION = GUARD_PERIODS_PER_DAY * 3; // 3 days

export interface GuardTime {
  period: number;
  date: Date;
}

export function stringifyPeriod(period: number): string {
  const hour = Math.floor(period * (24 / GUARD_PERIODS_PER_DAY));
  const formattedHours = hour < 10 ? `0${hour}` : hour;

  const min = period % 2 ? '30' : '00';

  return `${formattedHours}:${min}`;
}

export function getCurrentPeriod(): GuardTime {
  const now = new Date();
  const totalMinutesInDay = 24 * 60; // 24 hours in a day, 60 minutes in an hour
  const minutesPerPeriod = totalMinutesInDay / GUARD_PERIODS_PER_DAY;

  // Calculate the total minutes passed since midnight
  const totalMinutesPassed = now.getHours() * 60 + now.getMinutes();

  // Calculate the index of the current timespan
  return {
    period: Math.floor(totalMinutesPassed / minutesPerPeriod),
    date: now,
  };
}

export function getNextPeriodGuardDate(guardTime: GuardTime): GuardTime {
  const nextPeriod = (guardTime.period + 1) % GUARD_PERIODS_PER_DAY;
  const nextDate = new Date(guardTime.date);
  if (nextPeriod === 0) nextDate.setDate(guardTime.date.getDate() + 1);

  return {
    period: nextPeriod,
    date: nextDate,
  };
}
