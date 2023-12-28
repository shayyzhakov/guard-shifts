<script setup lang="ts">
import { getGuardLists, type GuardList, type GuardListPeriod } from '@/apis';
import { GUARD_PERIODS_PER_DAY, guardTimeToDate, stringifyPeriod } from '@/helpers/periodHelpers';
import { useTeamsStore } from '@/stores/teams.store';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const teamsStore = useTeamsStore();

const now = new Date().toDateString();

const allShifts = ref<GuardList[]>();

const noShifts = computed<boolean>(() => !!(allShifts.value && !allShifts.value.length));

onMounted(async () => {
  allShifts.value = await getGuardLists();
});

const filteredShifts = computed<GuardList[]>(() => {
  if (!allShifts.value) return [];

  return allShifts.value.map((guardPostShifts) => {
    const firstIndex = guardPostShifts.guardList.findIndex(
      (guardPeriod) => guardTimeToDate(guardPeriod.guardTime) > filterFromDate.value,
    );

    let guardList: GuardListPeriod[] = [];
    if (firstIndex === 0) {
      guardList = guardPostShifts.guardList;
    } else if (firstIndex > 0) {
      guardList = guardPostShifts.guardList.slice(firstIndex ? firstIndex - 1 : 0);
    }
    // for firstIndex === -1, leave guardList empty

    return {
      ...guardPostShifts,
      guardList,
    };
  });
});

async function goToGenerateShifts() {
  router.push('generate-shifts');
}

const filterFromDate = ref<Date>(new Date());

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

      <div v-else class="shifts-cards">
        <div class="actions">
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

        <el-card v-for="guardPostShifts in filteredShifts" :key="guardPostShifts.guardPostId">
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
            >
              <template #default="{ row }">
                {{ teamsStore.getTeamName(row.team) }}
              </template>
            </el-table-column>
            <el-table-column prop="soldiers" label="Soldiers">
              <template #default="{ row }">
                {{ teamsStore.soldierNamesBySoldierIds(row.soldiers).join(', ') }}
              </template>
            </el-table-column>
            <!-- <el-table-column prop="error" label="Error" width="180" /> -->
          </el-table>
        </el-card>
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

.main-content {
  flex: 1;
}

.shifts-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
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
</style>
