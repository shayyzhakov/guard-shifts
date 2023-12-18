import type { GuardTime } from '../helpers/periodHelpers';
import type { GuardList, GuardListPeriod } from './guardList.interface';
import type { GuardPost } from './guardPost.interface';

export type StrategyHandler = (
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: any,
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime
) => GuardListPeriod[];
