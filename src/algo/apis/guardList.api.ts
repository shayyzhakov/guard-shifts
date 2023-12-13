import { buildGuardList, getGuardListHistory } from '../controllers/guardList.controller';

export function generateGuardListApi() {
  try {
    return buildGuardList();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function getGuardListHistoryApi() {
  return getGuardListHistory();
}
