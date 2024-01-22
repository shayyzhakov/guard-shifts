<script setup lang="ts">
import { type CreateGuardPostParams } from '@/apis/guardPosts.api';
import { strategies } from '@/consts';
import { stringifyPeriod, timeToPeriod } from '@/helpers/periodHelpers';
import { reactive, watch } from 'vue';

const formData = defineModel<CreateGuardPostParams>({
  required: true,
});

// OCCUPATIONS
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

function addGuardTime() {
  occupations.push({
    from: '00:00',
    to: '00:00',
    duration: 4,
  });
}

function removeGuardTime(index: number) {
  occupations.splice(index, 1);
}
// END OCCUPATIONS

const strategyOptions: Array<{ value: string; label: string; description: string }> =
  Object.entries(strategies).map(([strategyId, strategy]) => {
    return {
      value: strategyId,
      label: strategy.name,
      description: strategy.description,
    };
  });

// TODO: scores is the exact same as occupations, maybe we can refactor it to a single function
// SCORES
const scoreRanges = reactive(
  Array.isArray(formData.value.config.scores)
    ? formData.value.config.scores.map((scoreRange) => {
        return {
          from: stringifyPeriod(scoreRange.from),
          to: stringifyPeriod(scoreRange.to),
          score: scoreRange.score,
        };
      })
    : [],
);

// when score ranges change, update parent component
watch(scoreRanges, (newVal) => {
  const adaptedScoreRanges = newVal.map((scoreRange) => {
    return {
      from: timeToPeriod(scoreRange.from),
      to: timeToPeriod(scoreRange.to),
      score: scoreRange.score,
    };
  });
  formData.value.config.scores = adaptedScoreRanges;
});

// when parent component changes score ranges, update accordingly
watch(
  () => formData.value.config.scores,
  (newScoreRanges, oldScoreRanges) => {
    // a hack to prevent infinite loop when updating score ranges
    if (JSON.stringify(newScoreRanges) === JSON.stringify(oldScoreRanges)) return;

    // clear the array and replace it with the new score ranges (keep reactivity intact)
    scoreRanges.splice(0, scoreRanges.length);
    if (Array.isArray(newScoreRanges)) {
      scoreRanges.push(
        ...newScoreRanges.map((scoreRange) => {
          return {
            from: stringifyPeriod(scoreRange.from),
            to: stringifyPeriod(scoreRange.to),
            score: scoreRange.score,
          };
        }),
      );
    }
  },
  {},
);

function addScoreRange() {
  scoreRanges.push({
    from: '00:00',
    to: '00:00',
    score: 1,
  });
}

function removeScoreRange(index: number) {
  scoreRanges.splice(index, 1);
}
// END SCORES
</script>

<template>
  <el-form :model="formData" label-width="160px" label-position="left">
    <el-form-item label="Name">
      <el-input v-model="formData.displayName" />
    </el-form-item>

    <el-form-item label="Amount of Soldiers">
      <el-input-number v-model="formData.numOfSoldiers" :min="1" />
    </el-form-item>

    <el-form-item label="Guard Time">
      <div
        v-for="(occupation, i) in occupations"
        :key="`${occupation.from}-${occupation.to}-${occupation.duration}`"
        class="time-range-container"
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

    <el-form-item label="Assignment Strategy">
      <el-select v-model="formData.strategy" class="form-select">
        <el-option
          v-for="item in strategyOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          style="height: unset; width: 500px"
        >
          <div class="strategy-content">
            <span class="strategy-name">{{ item.label }}</span>
            <span class="strategy-description">{{ item.description }}</span>
          </div>
        </el-option>
      </el-select>
    </el-form-item>

    <!-- scored scheduling strategy settings -->
    <template v-if="formData.strategy === 'scored-scheduling'">
      <el-form-item label="Scores">
        <div
          v-for="(scoreRange, i) in scoreRanges"
          :key="`${scoreRange.from}-${scoreRange.to}-${scoreRange.score}`"
          class="time-range-container"
        >
          <el-col :span="5">
            <el-time-select
              v-model="scoreRange.from"
              start="00:00"
              end="23:30"
              step="00:30"
              :clearable="false"
            />
          </el-col>

          to

          <el-col :span="5">
            <el-time-select
              v-model="scoreRange.to"
              start="00:00"
              end="23:30"
              step="00:30"
              :clearable="false"
            />
          </el-col>

          Score:

          <el-input-number
            v-model="scoreRange.score"
            :min="1"
            :max="100"
            controls-position="right"
            style="flex: 1"
          />

          <el-button text @click="() => removeScoreRange(i)">
            <i class="fa-solid fa-trash" />
          </el-button>
        </div>

        <el-button text bg @click="addScoreRange"> + Add </el-button>
      </el-form-item>
    </template>
  </el-form>
</template>

<style scoped>
.form-select {
  flex: 1;
}

.time-range-container {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.strategy-content {
  display: flex;
  flex-direction: column;
  padding: 4px 0 6px 0;
}

.strategy-content .strategy-name {
  line-height: 22px;
}

.strategy-content .strategy-description {
  font-size: var(--el-font-size-extra-small);
  line-height: 16px;
  color: var(--el-color-info);
  white-space: normal;
}
</style>
