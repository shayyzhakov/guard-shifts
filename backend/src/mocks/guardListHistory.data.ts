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
  guardList: DbGuardListPeriod[];
}

export const guardListHistory: DbGuardList[] = [
  // {
  //   guardPostId: 'konenut-morning',
  //   guardList: [
  //     {
  //       soldiers: ['1ba', '1bb', '1bc', '1bd', '1be'],
  //       team: '1B',
  //       guardTime: {
  //         period: 11,
  //         date: 'Fri Dec 15 2023',
  //       },
  //       duration: 4,
  //       error: undefined,
  //     },
  //   ],
  // },
];
