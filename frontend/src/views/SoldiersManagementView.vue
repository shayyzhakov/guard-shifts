<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { type Team, type UpdateTeamParams } from '@/apis/teams.api';
import { useTeamsStore } from '@/stores/teams.store';
import { useSoldiersStore } from '@/stores/soldiers.store';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import { type CreateSoldierParams, type Soldier } from '@/apis/soldiers.api';
import EditTeamModal from '@/components/modals/EditTeamModal.vue';
import CreateTeamModal from '@/components/modals/CreateTeamModal.vue';
import EditSoldierModal from '@/components/modals/EditSoldierModal.vue';
import CreateSoldierModal from '@/components/modals/CreateSoldierModal.vue';

const teamsStore = useTeamsStore();
const soldiersStore = useSoldiersStore();
const guardPostsStore = useGuardPostsStore();

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

const noTeams = computed<boolean>(() => !!(teamsStore.teams && !teamsStore.teams.length));
const noSoldiers = computed<boolean>(
  () => !!(soldiersStore.soldiers && !soldiersStore.soldiers.length),
);
</script>

<template>
  <div class="content">
    <h1>Soldiers Management</h1>

    <el-tabs v-model="activeTab" type="card">
      <!-- TEAMS -->
      <el-tab-pane label="Teams" name="teams">
        <section v-if="teamsStore.teams" class="tab-section">
          <div class="header-container">
            <div class="card-actions">
              <el-button v-if="!noTeams" type="primary" @click="showCreateTeamModal = true">
                New Team
              </el-button>
            </div>
          </div>

          <div v-if="noTeams" class="empty-state-container">
            <el-empty description="Create your first team">
              <el-button type="primary" @click="showCreateTeamModal = true"> New Team </el-button>
            </el-empty>
          </div>

          <template v-else>
            <el-card v-for="team in teamsStore.teams" :key="team.id">
              <template #header>
                <div class="header-container">
                  <h3>Team {{ team.name }}</h3>
                  <el-tag
                    v-for="guardPost in team.guardPosts"
                    :key="guardPost"
                    class="mx-1"
                    effect="light"
                  >
                    {{ guardPostsStore.guardPostNameById(guardPost) }}
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
                <div class="header-container">
                  <h3><i>No Team</i></h3>
                </div>
              </template>
              <div v-for="soldier in teamsStore.unteamedSoldiers" :key="soldier.id">
                {{ soldier.first_name }} {{ soldier.last_name }}
              </div>
            </el-card>
          </template>
        </section>

        <div v-else v-loading="true" style="height: 200px" />
      </el-tab-pane>

      <!-- SOLDIERS -->
      <el-tab-pane label="Soldiers" name="soldiers">
        <section v-if="soldiersStore.soldiers" class="tab-section">
          <div class="header-container">
            <div class="card-actions">
              <el-button v-if="!noSoldiers" type="primary" @click="showCreateSoldierModal = true">
                New Soldier
              </el-button>
            </div>
          </div>

          <div v-if="noSoldiers" class="empty-state-container">
            <el-empty description="Create your first soldier">
              <el-button type="primary" @click="showCreateSoldierModal = true">
                New Soldier
              </el-button>
            </el-empty>
          </div>

          <el-card v-else>
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

        <div v-else v-loading="true" style="height: 200px" />
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
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

h3 {
  margin-right: 6px;
}

.tab-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-container {
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
  margin-bottom: 30px;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 80%;
  margin-top: 60px;
}
</style>
