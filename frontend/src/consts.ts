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
    description:
      'Each soldier guards in turn, one after the other. Best fits routine guards, e.g 4-8',
  },
  'team-roundrobin': {
    name: 'Team Round-Robin',
    description:
      'Each team guards in turn, one after the other. Best fits routine team tasks, e.g daily Konenut',
  },
};
