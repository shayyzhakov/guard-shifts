export interface DbGuardTime {
  period: number;
  date: string;
}

export interface DbGuardListPeriod {
  soldiers: string[];
  guardTime: DbGuardTime;
  duration: number;
  team?: string;
  error?: string;
}

export interface DbGuardList {
  guardPostId: string;
  guardPostDisplayName: string;
  guardList: DbGuardListPeriod[];
}
