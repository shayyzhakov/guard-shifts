import type { GuardTime } from '../helpers/periodHelpers';

export interface GuardListShift {
  soldiers: string[];
  guardTime: GuardTime;
  duration: number;
  team?: string;
  error?: string;
}

export interface GuardList {
  guardPostId: string;
  guardPostDisplayName: string;
  shifts: GuardListShift[];
}
