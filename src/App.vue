<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const router = useRouter();

onBeforeMount(() => {
  router.push('home');
});
</script>

<template>
  <el-container class="main">
    <el-aside width="200px">
      <el-menu router active-text-color="#ffd04b" background-color="#545c64" class="sidebar" default-active="home"
        text-color="#fff">
        <el-menu-item index="home">
          <template #title>Home</template>
        </el-menu-item>
        <el-menu-item index="soldiers-management">
          <template #title>Soldiers Management</template>
        </el-menu-item>
        <el-menu-item index="guard-posts">
          <template #title>Guard Posts</template>
        </el-menu-item>
        <el-menu-item index="shifts-history">
          <template #title>Shifts History</template>
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
}

.sidebar {
  height: 100%;
  padding-top: 10px;
}

.el-menu-item.is-active {
  background: var(--el-color-info-dark-2);
}
</style>
