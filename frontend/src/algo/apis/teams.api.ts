import { getTeams } from '../controllers/teams.controller';

export function getTeamsApi() {
  return getTeams();
}
