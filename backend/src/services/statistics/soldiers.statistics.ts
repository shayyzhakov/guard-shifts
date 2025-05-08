import { getShiftScore } from '../../helpers/guardPostHelpers';
import { GuardList } from '../../interfaces/guardList.interface';
import { GuardPost } from '../../interfaces/guardPost.interface';

interface SoldierWithScore {
  soldier: string;
  score: number;
}

/**
 * Calculates and returns a list of soldiers with their total scores based on recent guard shifts.
 *
 * Only guard lists with a `time` value within the last 7 milliseconds are considered. Each soldier's score is the sum of shift scores from these filtered guard lists.
 *
 * @returns An array of objects containing each soldier's name and their aggregated score.
 *
 * @remark The time filter uses a 7-millisecond window, which may be narrower than intended.
 */
export function getSoldiersWithScoreFromGuardList(
  guardPost: GuardPost,
  guardLists: GuardList[]
): SoldierWithScore[] {
  const soldiersWithScoreMap: Record<string, number> = {};

  guardLists.filter(g => g.time > Date.now() - 7).forEach((guardList) => {
    guardList.shifts.forEach((shift) => {
      const shiftScore = getShiftScore(guardPost, shift.guardTime.period);

      shift.soldiers.forEach((soldier) => {
        if (!soldiersWithScoreMap[soldier]) soldiersWithScoreMap[soldier] = 0;
        soldiersWithScoreMap[soldier] += shiftScore;
      });
    });
  });

  return Object.entries(soldiersWithScoreMap).map(([soldier, score]) => ({ soldier, score }));
}
