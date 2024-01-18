<script setup lang="ts">
import { type CreateGuardPostParams } from '@/apis/guardPosts.api';
import { StrategyType, strategies } from '@/consts';
import { stringifyPeriod, timeToPeriod } from '@/helpers/periodHelpers';
import { reactive, watch } from 'vue';

const formData = defineModel<CreateGuardPostParams>({
  required: true,
});

const occupations = reactive(
  formData.value.occupation.map((occupation) => {
    return {
      from: stringifyPeriod(occupation.from),
      to: stringifyPeriod(occupation.to),
      duration: occupation.duration / 2,
    };
  }),
);

// when occupations change, update parent component
watch(occupations, (newVal) => {
  const adaptedOccupations = newVal.map((occupation) => {
    return {
      from: timeToPeriod(occupation.from),
      to: timeToPeriod(occupation.to),
      duration: occupation.duration * 2,
    };
  });
  formData.value.occupation = adaptedOccupations;
});

// when parent component changes occupations, update form occupations
watch(
  () => formData.value.occupation,
  (newOccupations, oldOccupations) => {
    // a hack to prevent infinite loop when updating occupations
    if (JSON.stringify(newOccupations) === JSON.stringify(oldOccupations)) return;

    // clear the array and replace it with the new occupations (keep reactivity intact)
    occupations.splice(0, occupations.length);
    occupations.push(
      ...newOccupations.map((occupation) => {
        return {
          from: stringifyPeriod(occupation.from),
          to: stringifyPeriod(occupation.to),
          duration: occupation.duration / 2,
        };
      }),
    );
  },
  {},
);

const strategyOptions: Array<{ value: StrategyType; label: string }> = [
  {
    value: StrategyType.RoundRobin,
    label: strategies[StrategyType.RoundRobin].name,
  },
  {
    value: StrategyType.TeamRoundRobin,
    label: strategies[StrategyType.TeamRoundRobin].name,
  },
];

function addGuardTime() {
  occupations.push({
    from: '00:00',
    to: '23:30',
    duration: 4,
  });
}

function removeGuardTime(index: number) {
  occupations.splice(index, 1);
}
</script>

<template>
  <el-form :model="formData" label-width="160px" label-position="left">
    <el-form-item label="Name">
      <el-input v-model="formData.displayName" />
    </el-form-item>

    <el-form-item label="Assignment Strategy">
      <el-select v-model="formData.strategy" class="form-select">
        <el-option
          v-for="item in strategyOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          style="height: unset"
        >
          <div class="strategy-content">
            <span class="strategy-name">{{ item.label }}</span>
            <span class="strategy-description">{{ strategies[item.value].description }}</span>
          </div>
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="Amount of Soldiers">
      <el-input-number v-model="formData.numOfSoldiers" :min="1" />
    </el-form-item>

    <el-form-item label="Guard Time">
      <div
        v-for="(occupation, i) in occupations"
        :key="`${occupation.from}-${occupation.to}-${occupation.duration}`"
        class="guard-occupation"
      >
        <el-col :span="5">
          <el-time-select
            v-model="occupation.from"
            start="00:00"
            end="23:30"
            step="00:30"
            :clearable="false"
          />
        </el-col>

        to

        <el-col :span="5">
          <el-time-select
            v-model="occupation.to"
            start="00:00"
            end="23:30"
            step="00:30"
            :clearable="false"
          />
        </el-col>

        duration (hours):

        <el-input-number
          v-model="occupation.duration"
          :min="0.5"
          :max="24"
          :step="0.5"
          controls-position="right"
          style="flex: 1"
        />

        <el-button text @click="() => removeGuardTime(i)">
          <i class="fa-solid fa-trash" />
        </el-button>
      </div>

      <el-button text bg @click="addGuardTime"> + Add </el-button>
    </el-form-item>

    <!-- TODO: constraints -->
  </el-form>
</template>

<style scoped>
.form-select {
  flex: 1;
}

.guard-occupation {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.strategy-content {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.strategy-content .strategy-name {
  line-height: 22px;
}

.strategy-content .strategy-description {
  font-size: var(--el-font-size-extra-small);
  line-height: 20px;
  color: var(--el-color-info);
}
</style>
