<script setup lang="ts">
import { getGuardListHistory, type GuardList } from '@/apis';
import { stringifyPeriod } from '@/helpers/periodHelpers';
import { computed, onMounted, ref } from 'vue';

const guardListHistory = ref<GuardList[]>();

const noHistory = computed<boolean>(
  () => !!(guardListHistory.value && !guardListHistory.value.length),
);

onMounted(async () => {
  guardListHistory.value = await getGuardListHistory();
});
</script>

<template>
  <div class="content">
    <h1>Shifts History</h1>

    <section class="shifts-cards">
      <div v-if="noHistory" class="empty-state-container">
        <el-empty description="Generate shifts to display shifts data" />
      </div>

      <!-- TODO: extract to table component and merge with HomeView.vue -->
      <el-card
        v-else
        v-for="guardPostShifts in guardListHistory"
        :key="guardPostShifts.guardPostName"
      >
        <template #header>
          <div class="card-header">
            <!-- TODO: convert to displayName -->
            <h3>{{ guardPostShifts.guardPostName }}</h3>
          </div>
        </template>

        <el-table :data="guardPostShifts.guardList" stripe style="width: 100%">
          <el-table-column prop="guardTime" label="Time" width="220">
            <template #default="{ row }">
              {{ stringifyPeriod(row.guardTime.period) }} ({{
                new Date(row.guardTime.date).toLocaleDateString('en-GB')
              }})
            </template>
          </el-table-column>
          <el-table-column
            v-if="guardPostShifts.guardList[0]?.team"
            prop="team"
            label="Team"
            width="120"
          />
          <el-table-column prop="soldiers" label="Soldiers">
            <template #default="{ row }">
              {{ row.soldiers.join(', ') }}
            </template>
          </el-table-column>
          <!-- <el-table-column prop="error" label="Error" width="180" /> -->
        </el-table>
      </el-card>
    </section>
  </div>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.shifts-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-header {
  display: flex;
  gap: 6px;
  align-items: center;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 80%;
}
</style>
