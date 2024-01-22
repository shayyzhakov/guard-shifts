import { GuardListShift } from '../interfaces/guardList.interface';
import { Team } from '../interfaces/team.interface';

/**
 * based on the guard post shifts, get a sorted list of teams that should be used next in the guard post.
 * @returns sorted list of teams (lower index should be used next)
 */
export function orderTeamsByLastTeamGuard(teams: Team[], shifts: GuardListShift[]): Team[] {
  const orderedTeams: Team[] = [];

  // insert teams that already appeared in the guard list, from the older to the newer
  for (const shift of shifts.reverse()) {
    if (
      shift.team &&
      orderedTeams.every((team) => team.id !== shift.team) // should be unique in the queue
    ) {
      const team = teams.find((team) => team.id === shift.team);
      if (team) {
        orderedTeams.unshift(team);
      }
    }
  }

  // insert teams that didnt appear beforehand
  const newTeams = teams.filter((team) => orderedTeams.every((team2) => team.id !== team2.id));
  orderedTeams.unshift(...newTeams);

  return orderedTeams;
}
