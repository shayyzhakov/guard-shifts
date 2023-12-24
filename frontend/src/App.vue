<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useTeamsStore } from './stores/teams.store';

const route = useRoute();

const activeRoute = ref<string>('shifts');

watch(
  () => route.path,
  (newValue) => {
    activeRoute.value = newValue.split('/')[1] ?? 'shifts';
  },
  {
    immediate: true,
  },
);

const teamsStore = useTeamsStore();

onMounted(async () => {
  await teamsStore.refreshTeams();
});
</script>

<template>
  <el-container class="main">
    <el-aside width="200px">
      <el-menu
        router
        active-text-color="#ffd04b"
        background-color="#545c64"
        class="sidebar"
        :default-active="activeRoute"
        text-color="#fff"
      >
        <el-menu-item index="shifts">
          <template #title>Shifts</template>
        </el-menu-item>
        <el-menu-item index="soldiers-management">
          <template #title>Soldiers Management</template>
        </el-menu-item>
        <el-menu-item index="guard-posts">
          <template #title>Guard Posts</template>
        </el-menu-item>
        <el-menu-item index="generate-shifts">
          <template #title>Generate Shifts</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.main {
  height: 100%;
  user-select: none;
  background: white;
}

.sidebar {
  height: 100%;
  padding-top: 10px;
}

.el-menu-item.is-active {
  background: var(--el-color-info-dark-2);
}
</style>
