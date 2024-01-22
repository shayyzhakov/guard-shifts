export interface ScoreRange {
  from: number; // included
  to: number; // excluded
  score: number;
}

export interface GuardPostOccupation {
  from: number; // included
  to: number; // excluded
  duration: number;
}

export interface GuardPost {
  id: string;
  displayName: string;
  strategy: string; // TODO: change to enum
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  config: Record<string, unknown>;
}
