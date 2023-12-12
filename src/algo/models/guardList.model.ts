import type { GuardList } from '../interfaces/guardList.interface';
import { compareGuardTime, type GuardTime } from '../../common/helpers/periodHelpers';

export function isTeamBusy(
  guardList: GuardList[],
  guardTime: GuardTime,
  teamName: string,
): boolean {
  return guardList.some((guardPostList) => {
    const guardPeriod = guardPostList.guardList.find((gp) =>
      compareGuardTime(gp.guardTime, guardTime),
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
    const guardPeriod = guardPostList.guardList.find((glp) =>
      compareGuardTime(glp.guardTime, guardTime),
    );

    return guardPeriod?.soldiers.includes(soldierName);
  });
}
