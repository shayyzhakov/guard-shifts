import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getGuardLists, type GuardList } from '@/apis/guardLists.api';

export const useShiftsStore = defineStore('shifts', () => {
  const guardLists = ref<GuardList[]>();

  async function refreshShifts() {
    guardLists.value = await getGuardLists();
  }

  return { guardLists, refreshShifts };
});
