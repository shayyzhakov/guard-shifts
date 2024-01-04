<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  getGuardPosts,
  updateTeam,
  type GuardPost,
  type Team,
  type UpdateTeamParams,
} from '@/apis';
import { ElNotification } from 'element-plus';
import { useTeamsStore } from '@/stores/teams.store';
import { useSoldiersStore } from '@/stores/soldiers.store';

const teamsStore = useTeamsStore();
const soldiersStore = useSoldiersStore();

onMounted(async () => {
  // ensures that the teams and soldiers data are up to date
  await Promise.all([teamsStore.refreshTeams(), soldiersStore.refreshSoldiers()]);
});

const showEditTeamModal = ref<boolean>(false);

const selectedTeamId = ref<string>();
const selectedTeamParams = reactive<UpdateTeamParams>({
  name: '',
  people: [],
  guardPosts: [],
});

const guardPosts = ref<GuardPost[]>();

const guardPostsOptions = computed<{ value: string; label: string }[]>(() => {
  if (!guardPosts.value) return [];

  return guardPosts.value.map((guardPost) => ({
    value: guardPost.id,
    label: guardPost.displayName,
  }));
});

const soldiersOptions = computed<{ value: string; label: string }[]>(() => {
  return (
    soldiersStore.soldiers?.map((soldier) => ({
      value: soldier.id,
      label: `${soldier.first_name} ${soldier.last_name}`,
    })) ?? []
  );
});

async function editTeam(team: Team) {
  // TODO: move guard posts to a store
  guardPosts.value = await getGuardPosts();

  selectedTeamId.value = team.id;
  selectedTeamParams.name = team.name;
  selectedTeamParams.people = team.people.map((soldier) => soldier.id);
  selectedTeamParams.guardPosts = JSON.parse(JSON.stringify(team.guardPosts));

  showEditTeamModal.value = true;
}

async function saveTeamChanges() {
  try {
    if (!selectedTeamId.value) throw new Error('No team was selected');

    await updateTeam(selectedTeamId.value, {
      name: selectedTeamParams.name,
      people: selectedTeamParams.people,
      guardPosts: selectedTeamParams.guardPosts,
    });

    ElNotification({
      title: 'Team changed successfully',
      message: 'Team changes were saved',
      type: 'success',
    });
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to save team changes',
      type: 'error',
    });
  } finally {
    showEditTeamModal.value = false;
  }

  teamsStore.refreshTeams();
}

const activeTab = ref('teams');
</script>

<template>
  <div>
    <h1>Soldiers Management</h1>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="Teams" name="teams">
        <section v-if="teamsStore.teams" class="team-cards">
          <el-card v-for="team in teamsStore.teams" :key="team.id">
            <template #header>
              <div class="card-header">
                <h3>Team {{ team.name }}</h3>
                <el-tag
                  v-for="guardPost in team.guardPosts"
                  :key="guardPost"
                  class="mx-1"
                  effect="light"
                >
                  {{ guardPost }}
                </el-tag>

                <div class="card-actions">
                  <el-button circle text @click="() => editTeam(team)">
                    <i class="fa-solid fa-gear fa-lg" />
                  </el-button>
                </div>
              </div>
            </template>
            <div v-for="soldier in team.people" :key="soldier.id">
              {{ soldier.first_name }} {{ soldier.last_name }}
            </div>
          </el-card>

          <el-card v-if="teamsStore.unteamedSoldiers.length">
            <template #header>
              <div class="card-header">
                <h3><i>No Team</i></h3>
              </div>
            </template>
            <div v-for="soldier in teamsStore.unteamedSoldiers" :key="soldier.id">
              {{ soldier.first_name }} {{ soldier.last_name }}
            </div>
          </el-card>
        </section>

        <div v-else>loading...</div>
      </el-tab-pane>

      <el-tab-pane label="Soldiers" name="soldiers">
        <el-table :data="soldiersStore.soldiers" stripe style="width: 100%">
          <el-table-column prop="name" label="Name">
            <template #default="{ row }"> {{ row.first_name }} {{ row.last_name }} </template>
          </el-table-column>
          <el-table-column prop="personal_number" label="Personal Number" />
          <el-table-column prop="phone_number" label="Phone Number" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- TODO: extract to component -->
    <el-dialog v-model="showEditTeamModal" title="Edit Team">
      <el-form :model="selectedTeamParams" label-width="120px" label-position="left">
        <el-form-item label="Team name">
          <el-input v-model="selectedTeamParams.name" />
        </el-form-item>

        <el-form-item label="Guard posts">
          <el-select
            v-model="selectedTeamParams.guardPosts"
            multiple
            placeholder="Select"
            class="form-select"
          >
            <el-option
              v-for="item in guardPostsOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Soldiers">
          <el-select
            v-model="selectedTeamParams.people"
            multiple
            placeholder="Select"
            class="form-select"
            default-first-option
          >
            <el-option
              v-for="item in soldiersOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditTeamModal = false">Cancel</el-button>
        <el-button type="primary" @click="saveTeamChanges">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
h3 {
  margin-right: 6px;
}

.team-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  gap: 6px;
  align-items: center;
}

.card-actions {
  margin-left: auto;
  margin-right: 8px;
}

.form-select {
  flex: 1;
}

:deep(.el-tabs__content) {
  overflow: inherit;
}
</style>
