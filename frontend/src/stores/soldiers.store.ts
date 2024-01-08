import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getSoldiers, type Soldier } from '@/apis/soldiers.api';

export const useSoldiersStore = defineStore('soldiers', () => {
  const soldiers = ref<Soldier[]>();

  async function refreshSoldiers() {
    soldiers.value = await getSoldiers();
  }

  return { soldiers, refreshSoldiers };
});
