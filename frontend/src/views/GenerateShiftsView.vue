<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { generateGuardList } from '../apis';
import { useShiftsStore } from '../stores/shifts.store';
import { useRouter } from 'vue-router';
import {
  GUARD_PERIODS_PER_DAY,
  getUpcomingTime,
  stringifyPeriod,
  timeToPeriod,
} from '@/helpers/periodHelpers';

const shiftsStore = useShiftsStore();
const router = useRouter();

const configForm = reactive({
  startTime: getUpcomingTime(),
  duration: 2,
});

const endTime = computed<string>(() => {
  if (!configForm.duration) return '';

  const duration = configForm.duration * 2;
  const startTime = configForm.startTime;
  const startPeriod = timeToPeriod(startTime);
  const endPeriod = (startPeriod + duration) % GUARD_PERIODS_PER_DAY;
  return `${stringifyPeriod(endPeriod)}`;
});

const isLoading = ref<boolean>();

async function generateShifts() {
  isLoading.value = true;

  const shifts = await generateGuardList({
    startPeriod: timeToPeriod(configForm.startTime),
    duration: configForm.duration * 2,
  });

  shiftsStore.setShiftsPerGuardPost(shifts);
  router.push('home');
  isLoading.value = false;
}
</script>

<template>
  <div>
    <h1>Generate Shifts</h1>

    <section class="config-cards">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>Basic Configuration</h3>
          </div>
        </template>

        <el-form :model="configForm" label-width="120px" label-position="left">
          <el-form-item label="Start Time">
            <!-- TODO: extract to PeriodSelector.vue -->
            <el-time-select
              v-model="configForm.startTime"
              start="00:00"
              step="00:30"
              end="23:30"
              placeholder="Select time"
            />
          </el-form-item>

          <el-form-item label="Duration (hours)">
            <el-input-number v-model="configForm.duration" :min="1" :max="168" />
          </el-form-item>

          <el-form-item label="End Time">
            <!-- TODO: extract to PeriodSelector.vue -->
            <el-time-select
              v-model="endTime"
              disabled
              start="00:00"
              step="00:30"
              end="23:30"
              placeholder="Select time"
            />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card>
        <template #header>
          <div class="card-header">
            <h3>Constraints</h3>
          </div>
        </template>

        (here we will define constraints)
      </el-card>

      <el-card>
        <template #header>
          <div class="card-header">
            <h3>Events</h3>
          </div>
        </template>

        (here we will define events like changes in the teams during the upcoming day)
      </el-card>

      <div class="buttons">
        <el-button type="primary" @click="generateShifts">Generate Shifts</el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.config-cards {
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

.buttons {
  margin-top: 8px;
}
</style>
