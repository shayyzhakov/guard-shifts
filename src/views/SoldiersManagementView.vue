<script setup lang="ts">
import { getTeams } from '../apis'

const teams = getTeams();
</script>

<template>
  <div>
    <h1>Soldiers Management</h1>

    <section class="team-cards">
      <el-card v-for="team in teams" :key="team.name">
        <template #header>
          <div class="card-header">
            <h3>Team {{ team.name }}</h3>
            <el-tag v-for="guardPost in team.guardPosts" :key="guardPost" class="mx-1" effect="light">
              {{ guardPost }}
            </el-tag>
          </div>
        </template>
        <div v-for="soldier in team.people" :key="soldier">{{ soldier }}</div>
      </el-card>
    </section>
  </div>
</template>

<style scoped>
h3 {
  margin-right: 6px;
}

.team-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  gap: 6px;
  align-items: center;
}
</style>../algo/controllers/teams.controller