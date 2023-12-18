<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getTeams, type Team } from '../apis';

const teams = ref<Team[]>();

onMounted(async () => {
  teams.value = await getTeams();
});
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
          </div>
        </template>
        <div v-for="soldier in team.people" :key="soldier">{{ soldier }}</div>
      </el-card>
    </section>

    <div v-else>loading...</div>
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
</style>
