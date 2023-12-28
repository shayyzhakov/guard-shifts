import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getTeams, type Soldier, type Team } from '@/apis';
import { useSoldiersStore } from './soldiers.store';

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>();

  const soldiersStore = useSoldiersStore();

  async function refreshTeams() {
    teams.value = await getTeams();
  }

  function getTeamName(teamId: string) {
    return teams.value?.find((team) => team.id === teamId)?.name ?? 'Unknown';
  }

  const soldierByIdMap = computed<Map<string, Soldier>>(() => {
    return (
      teams.value?.reduce((acc, team) => {
        team.people.forEach((soldier) => acc.set(soldier.id, soldier));

        return acc;
      }, new Map<string, Soldier>()) ?? new Map()
    );
  });

  const soldierNamesBySoldierIds = computed(
    () => (soldierIds: string[]) =>
      soldierIds.map((id) => {
        const soldier = soldierByIdMap.value.get(id);
        return soldier ? `${soldier?.first_name} ${soldier?.last_name}` : 'unknown';
      }),
  );

  const unteamedSoldiers = computed<Soldier[]>(() => {
    return soldiersStore.soldiers?.filter((soldier) => !soldierByIdMap.value.has(soldier.id)) ?? [];
  });

  return {
    teams,
    getTeamName,
    refreshTeams,
    soldierByIdMap,
    soldierNamesBySoldierIds,
    unteamedSoldiers,
  };
});
