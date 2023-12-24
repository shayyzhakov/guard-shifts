import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getTeams, type Team } from '@/apis';

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>();

  async function refreshTeams() {
    teams.value = await getTeams();
  }

  function getTeamName(teamId: string) {
    return teams.value?.find((team) => team.id === teamId)?.name ?? 'Unknown';
  }

  return { teams, getTeamName, refreshTeams };
});
