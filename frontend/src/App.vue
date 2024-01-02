<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useTeamsStore } from './stores/teams.store';
import { useSoldiersStore } from './stores/soldiers.store';
import * as authService from './auth';
import UserInfoDropdown from './components/UserInfoDropdown.vue';
import type { UserInfo } from './auth';

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
const soldiersStore = useSoldiersStore();
const userInfo = ref<UserInfo>();

onMounted(async () => {
  await teamsStore.refreshTeams();
  await soldiersStore.refreshSoldiers();

  userInfo.value = await authService.getUserInfo();
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
        <div v-if="userInfo" class="user-row">
          <UserInfoDropdown :userInfo="userInfo" @logout="() => authService.logout()" />

          <span class="user-name">
            {{ userInfo.given_name }}
            {{ userInfo.family_name }}
          </span>
        </div>

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

.user-row {
  display: flex;
  align-items: center;
  padding: 4px 10px 16px 10px;
}

.user-row .user-name {
  margin-left: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}
</style>
