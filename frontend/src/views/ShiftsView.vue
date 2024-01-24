<script setup lang="ts">
import { type GuardList, type GuardListShift } from '@/apis/guardLists.api';
import { GUARD_PERIODS_PER_DAY, guardTimeToDate, stringifyPeriod } from '@/helpers/periodHelpers';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import { useShiftsStore } from '@/stores/shifts.store';
import { useTeamsStore } from '@/stores/teams.store';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ShiftsDraftModal from '@/components/modals/ShiftsDraftModal.vue';

const router = useRouter();
const shiftsStore = useShiftsStore();
const teamsStore = useTeamsStore();
const guardPostsStore = useGuardPostsStore();

const now = new Date().toDateString();
const filterFromDate = ref<Date>(new Date());
const loading = computed<boolean>(() => !shiftsStore.guardLists);
const showEditShiftsModal = ref<boolean>(false);

const noShifts = computed<boolean>(
  () => !!(shiftsStore.guardLists && !shiftsStore.guardLists.length),
);

const filteredGuardLists = computed<GuardList[]>(() => {
  if (!shiftsStore.guardLists) return [];

  return shiftsStore.guardLists
    .map((guardList) => {
      // filter out guard periods before the selected date
      const firstIndex = guardList.shifts.findIndex(
        (shift) => guardTimeToDate(shift.guardTime) > filterFromDate.value,
      );

      let shifts: GuardListShift[] = [];
      if (firstIndex >= 0) {
        shifts = guardList.shifts.slice(firstIndex);
      }
      // for firstIndex === -1, leave guardList empty

      return {
        ...guardList,
        shifts,
      };
    })
    .filter((guardPostShifts) => {
      // filter out deleted guard posts with no shifts to show (in the selected time range)
      const isGuardPostDeleted = guardPostsStore.isGuardPostDeleted(guardPostShifts.guardPostId);
      return !isGuardPostDeleted || guardPostShifts.shifts.length > 0;
    });
});

async function goToGenerateShifts() {
  router.push('generate-shifts');
}

const dateShortcuts = [
  {
    text: 'Now',
    value: () => {
      return new Date();
    },
  },
  {
    text: '24 hours ago',
    value: () => {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return start;
    },
  },
  {
    text: '2 days ago',
    value: () => {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 2);
      return start;
    },
  },
  {
    text: '1 week ago',
    value: () => {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return start;
    },
  },
  {
    text: '1 month ago',
    value: () => {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return start;
    },
  },
  {
    text: '1 year ago',
    value: () => {
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
      return start;
    },
  },
];

const guardListsToEdit = ref<GuardList[]>([]);

function editShifts(guardPostShifts: GuardList) {
  guardListsToEdit.value = [guardPostShifts];
  showEditShiftsModal.value = true;
}
</script>

<template>
  <div class="content">
    <h1>Shifts</h1>

    <section class="main-content">
      <div v-if="noShifts" class="empty-state-container">
        <el-empty description="Generate shifts to display shifts data">
          <el-button type="primary" @click="goToGenerateShifts">Generate Shifts</el-button>
        </el-empty>
      </div>

      <div v-else v-loading="loading" class="shifts-content">
        <div v-if="shiftsStore.guardLists?.length" class="actions">
          <span>Show shifts from:</span>
          <el-date-picker
            v-model="filterFromDate"
            type="datetime"
            :shortcuts="dateShortcuts"
            date-format="DD/MM/YYYY"
            time-format="HH:mm"
            format="DD/MM/YYYY HH:mm"
            :clearable="false"
          />
        </div>

        <div class="cards-container">
          <el-card v-for="guardList in filteredGuardLists" :key="guardList.guardPostId">
            <template #header>
              <div class="card-header">
                <h3 v-if="!guardPostsStore.isGuardPostDeleted(guardList.guardPostId)">
                  {{ guardPostsStore.guardPostNameById(guardList.guardPostId) }}
                </h3>
                <h3 v-else>
                  <i>{{ guardList.guardPostDisplayName }} (Deleted)</i>
                </h3>

                <div class="card-actions">
                  <el-button circle text @click="() => editShifts(guardList)">
                    <i class="fa-solid fa-pen-to-square" />
                  </el-button>
                </div>
              </div>
            </template>

            <el-table :data="guardList.shifts" stripe style="width: 100%">
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
                v-if="guardList.shifts.some((shift) => shift.team)"
                prop="team"
                label="Team"
                width="120"
              >
                <template #default="{ row }">
                  {{ teamsStore.getTeamName(row.team) }}
                </template>
              </el-table-column>
              <el-table-column prop="soldiers" label="Soldiers">
                <template #default="{ row }">
                  <span v-if="teamsStore.soldierNamesBySoldierIds(row.soldiers).length > 0">{{
                    teamsStore.soldierNamesBySoldierIds(row.soldiers).join(', ')
                  }}</span>
                  <span v-else class="no-soldiers"
                    >No soldiers assigned {{ row.error ? `(${row.error})` : '' }}</span
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </section>

    <ShiftsDraftModal v-model:showModal="showEditShiftsModal" :shiftsDraft="guardListsToEdit" />
  </div>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.shifts-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: -10px;
  padding: 10px;
}

.cards-container .el-card {
  flex: 1;
  overflow: visible;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
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

.no-soldiers {
  color: #c0c4cc;
  font-style: italic;
}

.card-actions {
  margin-left: auto;
  margin-right: 8px;
}
</style>
