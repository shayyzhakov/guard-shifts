import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getGuardLists, type GuardList } from '@/apis/guardLists.api';

export const useShiftsStore = defineStore('shifts', () => {
  const shifts = ref<GuardList[]>();

  async function refreshShifts() {
    shifts.value = await getGuardLists();
  }

  return { shifts, refreshShifts };
});
