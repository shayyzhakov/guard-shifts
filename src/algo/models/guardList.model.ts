import type { GuardList } from '../interfaces/guardList.interface';
import { type GuardTime } from '../../common/helpers/periodHelpers';

export function isTeamBusy(
  guardList: GuardList[],
  guardTime: GuardTime,
  teamName: string,
): boolean {
  return guardList.some((guardPostList) => {
    const guardPeriod = guardPostList.guardList.find(
      (gp) =>
        gp.guardTime.period === guardTime.period &&
        gp.guardTime.date.toDateString() === guardTime.date.toDateString(),
    );

    return guardPeriod && guardPeriod.team === teamName;
  });
}

export function isSoldierBusy(
  guardList: GuardList[],
  guardTime: GuardTime,
  soldierName: string,
): boolean {
  return guardList.some((guardPostList) => {
    const guardPeriod = guardPostList.guardList.find(
      (gp) =>
        gp.guardTime.period === guardTime.period &&
        gp.guardTime.date.toDateString() === guardTime.date.toDateString(),
    );

    return guardPeriod?.soldiers.includes(soldierName);
  });
}
