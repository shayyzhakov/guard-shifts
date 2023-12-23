<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { getGuardPosts, getTeams, updateTeam, type GuardPost, type Team } from '../apis';
import { ElNotification } from 'element-plus';

const teams = ref<Team[]>();

onMounted(async () => {
  teams.value = await getTeams();
});

const showEditTeamModal = ref<boolean>(false);

const selectedTeamName = ref<string>();
const selectedTeam = reactive<Team>({
  name: '',
  people: [],
  guardPosts: [],
});

const guardPosts = ref<GuardPost[]>();

const guardPostsOptions = computed<{ value: string; label: string }[]>(() => {
  if (!guardPosts.value) return [];

  return guardPosts.value.map((guardPost) => ({
    value: guardPost.name,
    label: guardPost.displayName,
  }));
});

const allSoldiers = computed<string[]>(() => [
  ...new Set(teams.value?.flatMap((team) => team.people) ?? []),
]);

const soldiersOptions = computed<{ value: string; label: string }[]>(() => {
  return allSoldiers.value.map((soldier) => ({
    value: soldier,
    label: soldier,
  }));
});

async function editTeam(team: Team) {
  guardPosts.value = await getGuardPosts();

  selectedTeamName.value = team.name;
  selectedTeam.name = team.name;
  selectedTeam.people = JSON.parse(JSON.stringify(team.people));
  selectedTeam.guardPosts = JSON.parse(JSON.stringify(team.guardPosts));

  showEditTeamModal.value = true;
}

async function saveTeamChanges() {
  try {
    if (!selectedTeamName.value) throw new Error('No team was selected');

    await updateTeam(selectedTeamName.value, {
      name: selectedTeam.name,
      people: selectedTeam.people,
      guardPosts: selectedTeam.guardPosts,
    });

    ElNotification({
      title: 'Team Changed Successfully',
      message: 'Team changes were saved successfully',
      type: 'success',
    });
  } catch (e) {
    ElNotification({
      title: 'Action Failed',
      message: 'Failed to save team changes',
      type: 'error',
    });
  } finally {
    showEditTeamModal.value = false;
  }
}
</script>

<template>
  <div>
    <h1>Soldiers Management</h1>

    <section v-if="teams" class="team-cards">
      <el-card v-for="team in teams" :key="team.name">
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
        <div v-for="soldier in team.people" :key="soldier">{{ soldier }}</div>
      </el-card>
    </section>

    <div v-else>loading...</div>

    <el-dialog v-model="showEditTeamModal" title="Edit Team">
      <el-form :model="selectedTeam" label-width="120px" label-position="left">
        <el-form-item label="Team name">
          <el-input v-model="selectedTeam.name" />
        </el-form-item>

        <el-form-item label="Guard posts">
          <el-select
            v-model="selectedTeam.guardPosts"
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
            v-model="selectedTeam.people"
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
</style>
