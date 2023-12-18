export const GUARD_PERIODS_PER_DAY = 48; // 1 period = 30min

export interface GuardTime {
  period: number;
  date: string;
}

export function stringifyPeriod(period: number): string {
  const hour = Math.floor(period * (24 / GUARD_PERIODS_PER_DAY));
  const formattedHours = hour < 10 ? `0${hour}` : hour;

  const min = period % 2 ? '30' : '00';

  return `${formattedHours}:${min}`;
}

export function timeToPeriod(time: string): number {
  const [hour, min] = time.split(':').map((n) => parseInt(n, 10));
  return Math.floor((hour + min / 60) * (GUARD_PERIODS_PER_DAY / 24));
}

export function getUpcomingTime(): string {
  const now = new Date();
  const totalMinutesInDay = 24 * 60; // 24 hours in a day, 60 minutes in an hour
  const minutesPerPeriod = totalMinutesInDay / GUARD_PERIODS_PER_DAY;

  // Calculate the total minutes passed since midnight
  const totalMinutesPassed = now.getHours() * 60 + now.getMinutes();

  // Calculate the index of the current timespan
  const currentPeriod = Math.ceil(totalMinutesPassed / minutesPerPeriod);
  return stringifyPeriod(currentPeriod);
}
