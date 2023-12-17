const NIGHT_PERIOD_START = 42;
const NIGHT_PERIOD_END = 14;

const KONENUT_MORNING_PERIOD_START = 11;
const KONENUT_MORNING_PERIOD_END = 15;

export const guardPosts = [
  {
    name: 'taltal',
    displayName: 'Taltal',
    strategy: 'roundrobin',
    numOfSoldiers: 2,
    occupation: [
      {
        from: NIGHT_PERIOD_START,
        to: NIGHT_PERIOD_END,
        duration: 4,
      },
      {
        from: NIGHT_PERIOD_END,
        to: NIGHT_PERIOD_START,
        duration: 2,
      },
    ],
    constraints: [],
  },
  {
    name: 'ofek',
    displayName: 'Ofek',
    strategy: 'roundrobin',
    numOfSoldiers: 2,
    occupation: [
      {
        from: NIGHT_PERIOD_START + 1,
        to: NIGHT_PERIOD_END + 1,
        duration: 4,
      },
      {
        from: NIGHT_PERIOD_END + 1,
        to: NIGHT_PERIOD_START + 1,
        duration: 2,
      },
    ],
    constraints: [],
  },
  {
    name: 'konenut-morning',
    displayName: 'Konenut Morning',
    strategy: 'team-roundrobin',
    numOfSoldiers: 5,
    occupation: [
      {
        from: KONENUT_MORNING_PERIOD_START,
        to: KONENUT_MORNING_PERIOD_END,
        duration: 4,
      },
    ],
    constraints: [],
  },
  {
    name: 'konenut-evening',
    displayName: 'Konenut',
    strategy: 'team-roundrobin',
    numOfSoldiers: 5,
    occupation: [
      {
        from: KONENUT_MORNING_PERIOD_START,
        to: KONENUT_MORNING_PERIOD_END,
        duration: 4,
      },
    ],
    constraints: [],
  },
];
