<script setup lang="ts">
import { createTeam, type UpdateTeamParams } from '@/apis/teams.api';
import { useTeamsStore } from '@/stores/teams.store';
import { ElNotification } from 'element-plus';
import { reactive } from 'vue';
import TeamForm from '@/components/forms/TeamForm.vue';

const showModal = defineModel('showModal');

const teamsStore = useTeamsStore();

const newTeamParams = reactive<UpdateTeamParams>({
  name: '',
  people: [],
  guardPosts: [],
});

async function saveNewTeam() {
  try {
    await createTeam({
      name: newTeamParams.name,
      people: newTeamParams.people,
      guardPosts: newTeamParams.guardPosts,
    });

    ElNotification({
      message: 'Team created successfully',
      type: 'success',
    });

    teamsStore.refreshTeams();
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to create a new team',
      type: 'error',
    });
  } finally {
    showModal.value = false;

    // reset form data
    newTeamParams.name = '';
    newTeamParams.people = [];
    newTeamParams.guardPosts = [];
  }
}
</script>

<template>
  <el-dialog v-model="showModal" title="New Team" width="600px">
    <TeamForm v-model="newTeamParams" />

    <template #footer>
      <el-button @click="showModal = false">Cancel</el-button>
      <el-button type="primary" @click="saveNewTeam">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-select {
  flex: 1;
}
</style>
