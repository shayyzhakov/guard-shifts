import type { GuardTime } from '../helpers/periodHelpers';

export interface GuardListPeriod {
  soldiers: string[];
  guardTime: GuardTime;
  duration: number;
  team?: string;
  error?: string;
}

export interface GuardList {
  guardPostName: string;
  guardList: GuardListPeriod[];
}
