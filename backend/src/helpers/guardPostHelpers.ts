import { GuardPost, GuardPostOccupation } from '../interfaces/guardPost.interface';

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
