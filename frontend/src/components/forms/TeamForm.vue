<script setup lang="ts">
import { type UpdateTeamParams } from '@/apis/teams.api';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import { useSoldiersStore } from '@/stores/soldiers.store';
import { computed } from 'vue';

const formData = defineModel<UpdateTeamParams>({
  required: true,
});

const guardPostsStore = useGuardPostsStore();
const soldiersStore = useSoldiersStore();

const guardPostsOptions = computed<{ value: string; label: string }[]>(() => {
  if (!guardPostsStore.guardPosts) return [];

  return guardPostsStore.guardPosts.map((guardPost) => ({
    value: guardPost.id,
    label: guardPost.displayName,
  }));
});

const soldiersOptions = computed<{ value: string; label: string }[]>(() => {
  return (
    soldiersStore.soldiers?.map((soldier) => ({
      value: soldier.id,
      label: `${soldier.first_name} ${soldier.last_name}`,
    })) ?? []
  );
});
</script>

<template>
  <el-form :model="formData" label-width="120px" label-position="left">
    <el-form-item label="Team Name">
      <el-input v-model="formData.name" />
    </el-form-item>

    <el-form-item label="Guard Posts">
      <el-select v-model="formData.guardPosts" multiple placeholder="Select" class="form-select">
        <el-option
          v-for="item in guardPostsOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Soldiers">
      <el-select
        v-model="formData.people"
        multiple
        placeholder="Select"
        class="form-select"
        default-first-option
      >
        <el-option
          v-for="item in soldiersOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.form-select {
  flex: 1;
}
</style>
