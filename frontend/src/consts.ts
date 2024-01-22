interface Strategy {
  name: string;
  description: string;
}

export enum StrategyType {
  ScoredScheduling = 'scored-scheduling',
  RoundRobin = 'roundrobin',
  TeamRoundRobin = 'team-roundrobin',
}

export const strategies: Record<StrategyType, Strategy> = {
  'scored-scheduling': {
    name: 'Scored Scheduling',
    description:
      'Each guard period is assigned a score, and soldiers with the least accumulated score are allocated to higher score guard duties. Optimal for fair distribution.',
  },
  roundrobin: {
    name: 'Round-Robin',
    description:
      'Each soldier guards in turn, one after the other. Optimal for routine guard duties, ensuring consistent distribution, e.g 4-8.',
  },
  'team-roundrobin': {
    name: 'Team Round-Robin',
    description:
      'Each team guards in turn, one after the other. Optimal for routine team tasks, e.g daily Konenut.',
  },
};
