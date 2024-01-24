<script setup lang="ts">
import { computed, ref } from 'vue';
import { commitGuardList, type GuardList } from '@/apis/guardLists.api';
import { useRouter } from 'vue-router';
import { GUARD_PERIODS_PER_DAY, stringifyPeriod, timeToPeriod } from '@/helpers/periodHelpers';
import { ElNotification } from 'element-plus';
import { useTeamsStore } from '@/stores/teams.store';
import { useShiftsStore } from '@/stores/shifts.store';

const showModal = defineModel('showModal');

const props = defineProps<{
  shiftsDraft: GuardList[];
  startTime?: string;
}>();

const router = useRouter();
const teamsStore = useTeamsStore();
const shiftsStore = useShiftsStore();

const loading = ref(false);
const now = new Date().toDateString();

async function submitShifts() {
  try {
    loading.value = true;

    await commitGuardList({
      guardLists: props.shiftsDraft,
      startPeriod: props.startTime ? timeToPeriod(props.startTime) : undefined,
    });

    ElNotification({
      title: 'Commition succeeded',
      message: 'Shifts were commited successfully',
      type: 'success',
    });

    await shiftsStore.refreshShifts();
    router.push('shifts');
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to commit shifts',
      type: 'error',
    });
  } finally {
    showModal.value = false;
    loading.value = false;
  }
}

const rowToEditId = ref<string>();

function startEditRow(guardPostId: string, index: number) {
  rowToEditId.value = `${guardPostId}-${index}`;
}

function endEditRow() {
  rowToEditId.value = '';
}

const teamSoldiersOptions = computed<
  {
    label: string;
    options: {
      value: string;
      label: string;
    }[];
  }[]
>(() => {
  return (
    teamsStore.teams?.map((team) => ({
      label: team.name,
      options: team.people.map((soldier) => ({
        value: soldier.id,
        label: `${soldier.first_name} ${soldier.last_name}`,
      })),
    })) ?? []
  );
});
</script>

<template>
  <div>
    <el-dialog v-model="showModal" title="Shifts Draft" align-center class="centered-modal">
      <section class="shifts-cards">
        <el-card v-for="guardPostShifts in shiftsDraft" :key="guardPostShifts.guardPostId">
          <template #header>
            <div class="card-header">
              <h3>{{ guardPostShifts.guardPostDisplayName }}</h3>
            </div>
          </template>

          <el-table :data="guardPostShifts.shifts" stripe style="width: 100%">
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
              v-if="guardPostShifts.shifts.some((shift) => shift.team)"
              prop="team"
              label="Team"
              width="120"
            >
              <template #default="{ row }">
                {{ teamsStore.getTeamName(row.team) }}
              </template>
            </el-table-column>
            <el-table-column prop="soldiers" label="Soldiers">
              <template #default="{ row, $index }">
                <el-select
                  v-if="rowToEditId === `${guardPostShifts.guardPostId}-${$index}`"
                  v-model="row.soldiers"
                  multiple
                  filterable
                  placeholder="Select"
                  class="table-select"
                  default-first-option
                >
                  <el-option-group
                    v-for="team in teamSoldiersOptions"
                    :key="team.label"
                    :label="team.label"
                  >
                    <el-option
                      v-for="soldier in team.options"
                      :key="soldier.value"
                      :label="soldier.label"
                      :value="soldier.value"
                    />
                  </el-option-group>
                </el-select>

                <span v-else-if="teamsStore.soldierNamesBySoldierIds(row.soldiers).length > 0">{{
                  teamsStore.soldierNamesBySoldierIds(row.soldiers).join(', ')
                }}</span>
                <span v-else class="no-soldiers"
                  >No soldiers assigned {{ row.error ? `(${row.error})` : '' }}</span
                >
              </template>
            </el-table-column>
            <el-table-column label="Actions" width="120">
              <template #default="{ $index }">
                <el-button
                  v-if="rowToEditId !== `${guardPostShifts.guardPostId}-${$index}`"
                  :disabled="loading"
                  link
                  type="primary"
                  size="small"
                  @click="() => startEditRow(guardPostShifts.guardPostId, $index)"
                >
                  Edit
                </el-button>
                <el-button
                  v-else
                  :disabled="loading"
                  link
                  type="primary"
                  size="small"
                  @click="() => endEditRow()"
                >
                  Close
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </section>

      <template #footer>
        <el-button :disabled="loading" @click="showModal = false">Cancel</el-button>
        <el-button type="primary" :disabled="loading" @click="submitShifts">Commit</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
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

.no-soldiers {
  color: #c0c4cc;
  font-style: italic;
}

.table-select {
  width: 100%;
}
</style>
