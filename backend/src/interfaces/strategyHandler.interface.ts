import type { GuardTime } from '../helpers/periodHelpers';
import type { GuardList, GuardListPeriod } from './guardList.interface';
import type { GuardPost } from './guardPost.interface';
import { Team } from './team.interface';

export type StrategyHandler = (
  guardPost: GuardPost,
  guardList: GuardList[],
  startingGuardTime: GuardTime,
  endingGuardTime: GuardTime,
  teams: Team[]
) => GuardListPeriod[];
