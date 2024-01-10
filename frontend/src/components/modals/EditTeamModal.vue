<script setup lang="ts">
import { deleteTeam, updateTeam, type UpdateTeamParams } from '@/apis/teams.api';
import { useTeamsStore } from '@/stores/teams.store';
import { ElNotification } from 'element-plus';
import { reactive, watchEffect } from 'vue';
import TeamForm from '@/components/forms/TeamForm.vue';

const showModal = defineModel('showModal');

const props = defineProps<{
  selectedTeamId?: string;
  team?: UpdateTeamParams;
}>();

const teamsStore = useTeamsStore();

const selectedTeamParams = reactive<UpdateTeamParams>({
  name: '',
  people: [],
  guardPosts: [],
});

watchEffect(() => {
  selectedTeamParams.name = props.team?.name ?? '';
  selectedTeamParams.people = props.team?.people ?? [];
  selectedTeamParams.guardPosts = props.team?.guardPosts ?? [];
});

async function saveTeamChanges() {
  try {
    if (!props.selectedTeamId) throw new Error('No team was selected');

    await updateTeam(props.selectedTeamId, selectedTeamParams);

    ElNotification({
      title: 'Team changed successfully',
      message: 'Team changes were saved',
      type: 'success',
    });

    teamsStore.refreshTeams();
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to save team changes',
      type: 'error',
    });
  } finally {
    showModal.value = false;
  }
}

async function deleteExistingTeam() {
  try {
    if (!props.selectedTeamId) throw new Error('No team was selected');

    await deleteTeam(props.selectedTeamId);

    ElNotification({
      message: 'Team deleted successfully',
      type: 'success',
    });

    teamsStore.refreshTeams();
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to delete team',
      type: 'error',
    });
  } finally {
    showModal.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="showModal" title="Edit Team" width="600px">
    <TeamForm v-model="selectedTeamParams" />

    <template #footer>
      <el-button type="danger" @click="deleteExistingTeam">Delete</el-button>
      <el-button @click="showModal = false">Cancel</el-button>
      <el-button type="primary" @click="saveTeamChanges">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-select {
  flex: 1;
}
</style>
