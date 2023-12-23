<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { commitGuardList, generateGuardList, type GuardList } from '../apis';
import { useRouter } from 'vue-router';
import {
  GUARD_PERIODS_PER_DAY,
  getUpcomingTime,
  stringifyPeriod,
  timeToPeriod,
} from '@/helpers/periodHelpers';
import { ElNotification } from 'element-plus';

const now = new Date().toDateString();

const router = useRouter();

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

async function generateShifts() {
  isLoading.value = true;

  shiftsDraft.value = await generateGuardList({
    startPeriod: timeToPeriod(configForm.startTime),
    duration: configForm.duration * 2,
  });

  showShiftsDialog.value = true;

  isLoading.value = false;
}

async function submitShifts() {
  try {
    await commitGuardList({
      guardLists: shiftsDraft.value,
      startPeriod: timeToPeriod(configForm.startTime),
    });

    ElNotification({
      title: 'Commition Succeeded',
      message: 'Shifts were commited successfully',
      type: 'success',
    });

    router.push('shifts');
  } catch (e) {
    ElNotification({
      title: 'Action Failed',
      message: 'Failed to commit shifts',
      type: 'error',
    });
  } finally {
    showShiftsDialog.value = false;
  }
}

const showShiftsDialog = ref<boolean>(false);

('.el-main');
</script>

<template>
  <div>
    <h1>Generate Shifts</h1>

    <section v-loading.fullscreen.lock="isLoading" class="config-cards">
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

    <el-dialog v-model="showShiftsDialog" title="Shifts Draft" align-center class="centered-modal">
      <section class="shifts-cards">
        <el-card v-for="guardPostShifts in shiftsDraft" :key="guardPostShifts.guardPostName">
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

      <template #footer>
        <el-button @click="showShiftsDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitShifts">Commit</el-button>
      </template>
    </el-dialog>
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

:deep(.centered-modal) {
  max-height: 90%;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__body) {
  overflow: auto;
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
</style>
