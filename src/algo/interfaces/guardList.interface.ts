import type { GuardTime } from '@/common/helpers/periodHelpers';

export interface GuardListPeriod {
  soldiers: string[];
  guardTime: GuardTime;
  team?: string;
  error?: string;
}

export interface GuardList {
  guardPostName: string;
  guardList: GuardListPeriod[];
}
