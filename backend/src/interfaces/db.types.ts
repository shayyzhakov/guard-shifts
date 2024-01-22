export interface DbGuardTime {
  period: number;
  date: string;
}

export interface DbGuardListShift {
  soldiers: string[];
  guardTime: DbGuardTime;
  duration: number;
  team?: string;
  error?: string;
}

export interface DbGuardList {
  guardPostId: string;
  guardPostDisplayName: string;
  shifts: DbGuardListShift[];
}
