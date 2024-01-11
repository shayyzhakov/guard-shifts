import { Team } from '../interfaces/team.interface';

export const teams: Team[] = [
  {
    id: '1b',
    name: '1B',
    people: ['1b-a', '1b-b', '1b-c', '1b-d', '1b-e', '1b-f', '1b-g'],
    guardPosts: ['taltal', 'konenut-morning', 'konenut-evening'],
  },
  {
    id: '1c',
    name: '1C',
    people: ['1c-a', '1c-b', '1c-c'],
    guardPosts: ['taltal', 'konenut-morning', 'konenut-evening'],
  },
  {
    id: '1a',
    name: '2A',
    people: ['2a-a', '2a-b', '2a-c'],
    guardPosts: ['ofek', 'konenut-morning', 'konenut-evening'],
  },
  {
    id: '2b',
    name: '2B',
    people: ['2b-a', '2b-b'],
    guardPosts: ['ofek', 'konenut-morning', 'konenut-evening'],
  },
  {
    id: '2c',
    name: '2C',
    people: ['2c-a', '2c-b', '2c-c', '2c-d', '2c-e'],
    guardPosts: ['ofek', 'konenut-morning', 'konenut-evening'],
  },
];
