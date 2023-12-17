export interface GuardPostOccupation {
  from: number; // included
  to: number; // excluded
  duration: number;
}

export interface GuardPost {
  name: string;
  displayName: string;
  strategy: string; // TODO: change to enum
  numOfSoldiers: number;
  occupation: GuardPostOccupation[];
  constraints: string[]; // TODO: implement
}
