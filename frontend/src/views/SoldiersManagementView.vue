<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  updateTeam,
  type Team,
  type UpdateTeamParams,
  createTeam,
  deleteTeam,
} from '@/apis/teams.api';
import { ElNotification } from 'element-plus';
import { useTeamsStore } from '@/stores/teams.store';
import { useSoldiersStore } from '@/stores/soldiers.store';
import AddSoldierModal from '@/components/modals/AddSoldierModal.vue';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import { deleteSoldier } from '@/apis/soldiers.api';

const teamsStore = useTeamsStore();
const soldiersStore = useSoldiersStore();
const guardPostsStore = useGuardPostsStore();

onMounted(async () => {
  // ensures that the teams and soldiers data are up to date
  await Promise.all([
    teamsStore.refreshTeams(),
    soldiersStore.refreshSoldiers(),
    guardPostsStore.refreshGuardPosts(),
  ]);
});

const showCreateTeamModal = ref<boolean>(false);
const showEditTeamModal = ref<boolean>(false);
const showCreateSoldierModal = ref<boolean>(false);

const selectedTeamId = ref<string>();

const newTeamParams = reactive<UpdateTeamParams>({
  name: '',
  people: [],
  guardPosts: [],
});

const selectedTeamParams = reactive<UpdateTeamParams>({
  name: '',
  people: [],
  guardPosts: [],
});

const guardPostsOptions = computed<{ value: string; label: string }[]>(() => {
  if (!guardPostsStore.guardPosts) return [];

  return guardPostsStore.guardPosts.map((guardPost) => ({
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

function addNewTeam() {
  newTeamParams.name = '';
  newTeamParams.people = [];
  newTeamParams.guardPosts = [];

  showCreateTeamModal.value = true;
}

function editTeam(team: Team) {
  selectedTeamId.value = team.id;
  selectedTeamParams.name = team.name;
  selectedTeamParams.people = team.people.map((soldier) => soldier.id);
  selectedTeamParams.guardPosts = JSON.parse(JSON.stringify(team.guardPosts));

  showEditTeamModal.value = true;
}

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
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to create a new team',
      type: 'error',
    });
  } finally {
    showCreateTeamModal.value = false;
    teamsStore.refreshTeams();
  }
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
    teamsStore.refreshTeams();
  }
}

async function deleteExistingTeam() {
  try {
    if (!selectedTeamId.value) throw new Error('No team was selected');
    await deleteTeam(selectedTeamId.value);

    ElNotification({
      message: 'Team deleted successfully',
      type: 'success',
    });
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to delete team',
      type: 'error',
    });
  } finally {
    showEditTeamModal.value = false;
    teamsStore.refreshTeams();
  }
}

const activeTab = ref('teams');

function addNewSoldier() {
  showCreateSoldierModal.value = true;
}

async function removeSoldierByIndex(index: number) {
  const soldier = soldiersStore.soldiers?.[index];

  if (!soldier) return;

  try {
    await deleteSoldier(soldier.id);

    ElNotification({
      message: 'Soldier removed successfully',
      type: 'success',
    });
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to remove soldier',
      type: 'error',
    });
  } finally {
    soldiersStore.refreshSoldiers();
  }
}
</script>

<template>
  <div>
    <h1>Soldiers Management</h1>

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="Teams" name="teams">
        <section v-if="teamsStore.teams" class="tab-section">
          <div class="card-header">
            <div class="card-actions">
              <el-button type="primary" @click="addNewTeam">New Team</el-button>
            </div>
          </div>

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
        <section v-if="teamsStore.teams" class="tab-section">
          <div class="card-header">
            <div class="card-actions">
              <el-button type="primary" @click="addNewSoldier">New Soldier</el-button>
            </div>
          </div>

          <el-card>
            <el-table :data="soldiersStore.soldiers" stripe style="width: 100%">
              <el-table-column prop="name" label="Name">
                <template #default="{ row }"> {{ row.first_name }} {{ row.last_name }} </template>
              </el-table-column>
              <el-table-column prop="personal_number" label="Personal Number" />
              <el-table-column prop="phone_number" label="Phone Number" />
              <el-table-column label="Actions" width="120">
                <template #default="{ $index }">
                  <el-popconfirm
                    title="Are you sure?"
                    :hide-after="0"
                    @confirm="() => removeSoldierByIndex($index)"
                  >
                    <template #reference>
                      <el-button link type="primary" size="small"> Remove </el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </section>
      </el-tab-pane>
    </el-tabs>

    <!-- CREATE TEAM -->
    <!-- TODO: extract to component -->
    <el-dialog v-model="showCreateTeamModal" title="New Team" width="600px">
      <el-form :model="newTeamParams" label-width="120px" label-position="left">
        <el-form-item label="Team Name">
          <el-input v-model="newTeamParams.name" />
        </el-form-item>

        <el-form-item label="Guard Posts">
          <el-select
            v-model="newTeamParams.guardPosts"
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
            v-model="newTeamParams.people"
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
        <el-button @click="showCreateTeamModal = false">Cancel</el-button>
        <el-button type="primary" @click="saveNewTeam">Save</el-button>
      </template>
    </el-dialog>

    <!-- EDIT TEAM -->
    <!-- TODO: extract to component -->
    <el-dialog v-model="showEditTeamModal" title="Edit Team" width="600px">
      <el-form :model="selectedTeamParams" label-width="120px" label-position="left">
        <el-form-item label="Team Name">
          <el-input v-model="selectedTeamParams.name" />
        </el-form-item>

        <el-form-item label="Guard Posts">
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
        <el-button type="danger" @click="deleteExistingTeam">Delete</el-button>
        <el-button @click="showEditTeamModal = false">Cancel</el-button>
        <el-button type="primary" @click="saveTeamChanges">Save</el-button>
      </template>
    </el-dialog>

    <AddSoldierModal v-model:showModal="showCreateSoldierModal" />
  </div>
</template>

<style scoped>
h3 {
  margin-right: 6px;
}

.tab-section {
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
@/apis/soldiers.api
