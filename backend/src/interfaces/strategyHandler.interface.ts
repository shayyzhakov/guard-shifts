import type { GuardTime } from '../helpers/periodHelpers';
import type { GuardList, GuardListPeriod } from './guardList.interface';
import type { GuardPost } from './guardPost.interface';

export type StrategyHandler = (
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime
) => GuardListPeriod[];
