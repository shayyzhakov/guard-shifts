import { buildGuardList } from '../controllers/guardList.controller';

export function generateGuardListApi() {
  try {
    return buildGuardList();
  } catch (err) {
    console.error(err);
    return [];
  }
}
