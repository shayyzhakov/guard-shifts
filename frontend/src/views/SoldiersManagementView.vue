<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { type Team, type UpdateTeamParams } from '@/apis/teams.api';
import { ElNotification } from 'element-plus';
import { useTeamsStore } from '@/stores/teams.store';
import { useSoldiersStore } from '@/stores/soldiers.store';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import { deleteSoldier, type CreateSoldierParams, type Soldier } from '@/apis/soldiers.api';
import EditTeamModal from '@/components/modals/EditTeamModal.vue';
import CreateTeamModal from '@/components/modals/CreateTeamModal.vue';
import EditSoldierModal from '@/components/modals/EditSoldierModal.vue';
import CreateSoldierModal from '@/components/modals/CreateSoldierModal.vue';

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

const activeTab = ref('teams');

const showCreateTeamModal = ref<boolean>(false);
const showEditTeamModal = ref<boolean>(false);
const showCreateSoldierModal = ref<boolean>(false);
const showEditSoldierModal = ref<boolean>(false);

const selectedTeamId = ref<string>();

const selectedTeamParams = reactive<UpdateTeamParams>({
  name: '',
  people: [],
  guardPosts: [],
});

function editTeam(team: Team) {
  selectedTeamId.value = team.id;
  selectedTeamParams.name = team.name;
  selectedTeamParams.people = team.people.map((soldier) => soldier.id);
  selectedTeamParams.guardPosts = JSON.parse(JSON.stringify(team.guardPosts));

  showEditTeamModal.value = true;
}

const selectedSoldierId = ref<string>();

const selectedSoldierParams = reactive<CreateSoldierParams>({
  first_name: '',
  last_name: '',
  personal_number: '',
  phone_number: '',
  capabilities: [],
});

function editSoldier(soldier: Soldier) {
  selectedSoldierId.value = soldier.id;
  selectedSoldierParams.first_name = soldier.first_name;
  selectedSoldierParams.last_name = soldier.last_name;
  selectedSoldierParams.personal_number = soldier.personal_number;
  selectedSoldierParams.phone_number = soldier.phone_number;
  selectedSoldierParams.capabilities = JSON.parse(JSON.stringify(soldier.capabilities));

  showEditSoldierModal.value = true;
}
</script>

<template>
  <div>
    <h1>Soldiers Management</h1>

    <el-tabs v-model="activeTab" type="card">
      <!-- TEAMS -->
      <el-tab-pane label="Teams" name="teams">
        <section v-if="teamsStore.teams" class="tab-section">
          <div class="card-header">
            <div class="card-actions">
              <el-button type="primary" @click="showCreateTeamModal = true">New Team</el-button>
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

      <!-- SOLDIERS -->
      <el-tab-pane label="Soldiers" name="soldiers">
        <section v-if="soldiersStore.soldiers" class="tab-section">
          <div class="card-header">
            <div class="card-actions">
              <el-button type="primary" @click="showCreateSoldierModal = true">
                New Soldier
              </el-button>
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
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="() => editSoldier(row)">
                    Edit
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </section>

        <div v-else>loading...</div>
      </el-tab-pane>
    </el-tabs>

    <CreateTeamModal v-model:showModal="showCreateTeamModal" />
    <EditTeamModal
      v-model:showModal="showEditTeamModal"
      :selectedTeamId="selectedTeamId"
      :team="selectedTeamParams"
    />
    <CreateSoldierModal v-model:showModal="showCreateSoldierModal" />
    <EditSoldierModal
      v-model:showModal="showEditSoldierModal"
      :selectedSoldierId="selectedSoldierId"
      :soldier="selectedSoldierParams"
    />
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

:deep(.el-tabs__content) {
  overflow: inherit;
}
</style>
