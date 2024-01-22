import { getGuardPostScoreForGuardPeriod } from '../../helpers/guardPostHelpers';
import { GuardList } from '../../interfaces/guardList.interface';
import { GuardPost } from '../../interfaces/guardPost.interface';

interface SoldierWithScore {
  soldier: string;
  score: number;
}

export function getSoldiersWithScoreFromGuardList(
  guardPost: GuardPost,
  guardLists: GuardList[]
): SoldierWithScore[] {
  const soldiersWithScoreMap: Record<string, number> = {};

  // TODO: truncate guardList to show only last 7 days (should be configurable)
  guardLists.forEach((guardList) => {
    guardList.guardList.forEach((shift) => {
      const shiftScore = getGuardPostScoreForGuardPeriod(guardPost, shift.guardTime.period);

      shift.soldiers.forEach((soldier) => {
        if (!soldiersWithScoreMap[soldier]) soldiersWithScoreMap[soldier] = 0;
        soldiersWithScoreMap[soldier] += shiftScore;
      });
    });
  });

  return Object.entries(soldiersWithScoreMap).map(([soldier, score]) => ({ soldier, score }));
}
