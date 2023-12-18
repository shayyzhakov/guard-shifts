<script setup lang="ts">
import { ref } from 'vue';
import { generateGuardList } from '../apis';
import { useShiftsStore } from '../stores/shifts.store';
import { GUARD_PERIODS_PER_DAY, stringifyPeriod } from '@/helpers/periodHelpers';

const shiftsStore = useShiftsStore();

const isLoading = ref<boolean>();
let now = new Date().toDateString();

async function generateShifts() {
  isLoading.value = true;
  setTimeout(async () => {
    const shifts = await generateGuardList();
    shiftsStore.setShiftsPerGuardPost(shifts);
    now = new Date().toDateString();
    isLoading.value = false;
  }, 1);
}
</script>

<template>
  <div class="content">
    <h1>Generate Shifts</h1>

    <section class="shifts-cards">
      <div v-if="isLoading" class="empty-state-container">loading...</div>
      <div v-else-if="!shiftsStore.shiftsPerGuardPost" class="empty-state-container">
        <el-empty description="Generate shifts to display shifts data">
          <el-button type="primary" @click="generateShifts">Generate Shifts</el-button>
        </el-empty>
      </div>

      <el-card
        v-else
        v-for="guardPostShifts in shiftsStore.shiftsPerGuardPost"
        :key="guardPostShifts.guardPostName"
      >
        <template #header>
          <div class="card-header">
            <!-- TODO: convert to displayName -->
            <h3>{{ guardPostShifts.guardPostDisplayName }}</h3>
          </div>
        </template>

        <el-table :data="guardPostShifts.guardList" stripe style="width: 100%">
          <el-table-column prop="guardTime" label="Time" width="220">
            <template #default="{ row }">
              {{ stringifyPeriod(row.guardTime.period) }}-{{
                stringifyPeriod((row.guardTime.period + row.duration) % GUARD_PERIODS_PER_DAY)
              }}
              {{
                new Date(row.guardTime.date).toDateString() === now
                  ? ''
                  : `(${new Date(row.guardTime.date).toLocaleDateString('en-GB')})`
              }}
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
