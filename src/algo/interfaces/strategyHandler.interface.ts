import type { GuardTime } from '@/common/helpers/periodHelpers';
import type { GuardList, GuardListContent } from './guardList.interface';
import type { GuardPost } from './guardPost.interface';

export type StrategyHandler = (
  guardPost: GuardPost,
  guardList: GuardList[],
  guardListHistory: any,
  startingGuardTime: GuardTime,
) => GuardListContent[];
