interface Strategy {
  name: string;
  description: string;
}

export enum StrategyType {
  RoundRobin = 'roundrobin',
  TeamRoundRobin = 'team-roundrobin',
}

export const strategies: Record<StrategyType, Strategy> = {
  roundrobin: {
    name: 'Round-Robin',
    description: 'Each soldier guards in turn, one after the other',
  },
  'team-roundrobin': {
    name: 'Team Round-Robin',
    description: 'Each team guards in turn, one after the other',
  },
};
