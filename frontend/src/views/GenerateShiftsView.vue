<script setup lang="ts">
import { ref } from 'vue';
import { generateGuardList } from '../apis';
import { useShiftsStore } from '../stores/shifts.store';
import { useRouter } from 'vue-router';
import { timeToPeriod } from '@/helpers/periodHelpers';

const shiftsStore = useShiftsStore();
const router = useRouter();

const isLoading = ref<boolean>();

async function generateShifts() {
  isLoading.value = true;

  const period = timeToPeriod(startTime.value);
  console.log(period);

  const shifts = await generateGuardList();

  shiftsStore.setShiftsPerGuardPost(shifts);
  router.push('home');
  isLoading.value = false;
}

const startTime = ref();
</script>

<template>
  <div class="content">
    <h1>Generate Shifts</h1>

    <section class="config-cards">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>Configuration</h3>
          </div>
        </template>

        <el-time-select
          v-model="startTime"
          start="00:00"
          step="00:30"
          end="23:30"
          placeholder="Select time"
        />
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
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.config-cards {
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

.buttons {
  margin-top: 16px;
}
</style>
