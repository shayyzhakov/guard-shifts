import type { Team } from '../interfaces/team.interface';
import { getAllTeams } from '../models/team.model';

export function getTeams(): Team[] {
  return getAllTeams();
}
