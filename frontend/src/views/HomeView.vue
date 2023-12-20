<script setup lang="ts">
import { useShiftsStore } from '../stores/shifts.store';
import { GUARD_PERIODS_PER_DAY, stringifyPeriod } from '@/helpers/periodHelpers';
import { useRouter } from 'vue-router';

const shiftsStore = useShiftsStore();

const now = new Date().toDateString();
const router = useRouter();

async function goTogenerateShifts() {
  router.push('generate-shifts');
}
</script>

<template>
  <div class="content">
    <h1>Home</h1>

    <section class="shifts-cards">
      <div v-if="!shiftsStore.shiftsPerGuardPost" class="empty-state-container">
        <el-empty description="Generate shifts to display shifts data">
          <el-button type="primary" @click="goTogenerateShifts">Generate Shifts</el-button>
        </el-empty>
      </div>

      <el-card
        v-else
        v-for="guardPostShifts in shiftsStore.shiftsPerGuardPost"
        :key="guardPostShifts.guardPostName"
      >
        <template #header>
          <div class="card-header">
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
  gap: 16px;
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
  gap: 16px;
  height: 80%;
}
</style>
