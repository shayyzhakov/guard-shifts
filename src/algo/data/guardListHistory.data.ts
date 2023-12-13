export interface DbGuardTime {
  period: number;
  date: string;
}

export interface DbGuardListPeriod {
  soldiers: string[];
  guardTime: DbGuardTime;
  team?: string;
  error?: string;
}

export interface DbGuardList {
  guardPostName: string;
  guardList: DbGuardListPeriod[];
}

export const guardListHistory: DbGuardList[] = [
  {
    guardPostName: 'konenut-morning',
    guardList: [
      {
        soldiers: ['1ba', '1bb', '1bc', '1bd', '1be'],
        team: '1B',
        guardTime: {
          period: 11,
          date: 'Wed Dec 13 2023',
        },
        error: undefined,
      },
      {
        soldiers: ['1ba', '1bb', '1bc', '1bd', '1be'],
        team: '1B',
        guardTime: {
          period: 11,
          date: 'Thu Dec 14 2023',
        },
        error: undefined,
      },
      {
        soldiers: ['1ba', '1bb', '1bc', '1bd', '1be'],
        team: '1B',
        guardTime: {
          period: 11,
          date: 'Fri Dec 15 2023',
        },
        error: undefined,
      },
    ],
  },
];
