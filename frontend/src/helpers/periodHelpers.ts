export const GUARD_PERIODS_PER_DAY = 48; // 1 period = 30min

export const GUARD_PERIODS_FOR_CALCULATION = GUARD_PERIODS_PER_DAY * 3; // 3 days

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
