<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { generateGuardList, type GuardList } from '@/apis/guardLists.api';
import {
  GUARD_PERIODS_PER_DAY,
  getUpcomingTime,
  stringifyPeriod,
  timeToPeriod,
} from '@/helpers/periodHelpers';
import { useTeamsStore } from '@/stores/teams.store';
import { useSoldiersStore } from '@/stores/soldiers.store';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import ShiftsDraftModal from '@/components/modals/ShiftsDraftModal.vue';
import { ElNotification } from 'element-plus';

const teamsStore = useTeamsStore();
const soldiersStore = useSoldiersStore();
const guardPostsStore = useGuardPostsStore();

const configForm = reactive({
  startTime: getUpcomingTime(),
  duration: 24,
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
const shiftsDraft = ref<GuardList[]>([]);
const showShiftsDialog = ref<boolean>(false);

async function generateShifts() {
  isLoading.value = true;
  try {
    shiftsDraft.value = await generateGuardList({
      startPeriod: timeToPeriod(configForm.startTime),
      duration: configForm.duration * 2,
    });
    showShiftsDialog.value = true;
  } catch (err) {
    isLoading.value = false;
    ElNotification({
      title: 'Action failed',
      message: 'Failed to generate shifts',
      type: 'error',
    });
  }
}

const warningText = computed(() => {
  if (!soldiersStore.soldiers?.length) {
    return 'No soldiers were found. Please create soldiers before generating shifts.';
  }
  if (!teamsStore.teams?.length) {
    return 'No teams were found. Please create teams before generating shifts.';
  }
  if (!guardPostsStore.guardPosts?.length) {
    return 'No guard posts were found. Please create guard posts before generating shifts.';
  }

  return undefined;
});
</script>

<template>
  <div>
    <h1>Generate Shifts</h1>

    <section v-loading.fullscreen.lock="isLoading" class="config-cards">
      <el-alert
        v-if="warningText"
        :title="warningText"
        type="warning"
        show-icon
        :closable="false"
      />

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
              :clearable="false"
              placeholder="Select time"
            />
          </el-form-item>

          <el-form-item label="Duration (hours)">
            <el-input-number v-model="configForm.duration" :min="1" :max="168" />
          </el-form-item>

          <el-form-item label="End Time">
            <el-time-select v-model="endTime" disabled />
          </el-form-item>
        </el-form>
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
        <el-button type="primary" @click="generateShifts" :disabled="warningText"
          >Generate Shifts</el-button
        >
      </div>
    </section>

    <ShiftsDraftModal
      v-model:showModal="showShiftsDialog"
      :shiftsDraft="shiftsDraft"
      :startTime="configForm.startTime"
    />
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
