import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getSoldiers, type Soldier } from '@/apis/soldiers.api';

export const useSoldiersStore = defineStore('soldiers', () => {
  const soldiers = ref<Soldier[]>();

  async function refreshSoldiers() {
    soldiers.value = await getSoldiers();

    // lexical order of soldiers by their full name
    soldiers.value = soldiers.value.sort((a, b) =>
      (a.first_name + ' ' + a.last_name).localeCompare(b.first_name + ' ' + b.last_name),
    );
  }

  return { soldiers, refreshSoldiers };
});
