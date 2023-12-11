import type { GuardTime } from '@/common/helpers/periodHelpers';

export interface GuardListContent {
  soldiers: string[];
  guardTime: GuardTime;
  team?: string;
  error?: string;
}

export interface GuardList {
  guardPostName: string;
  guardList: GuardListContent[];
}
