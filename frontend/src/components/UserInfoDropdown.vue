<script setup lang="ts">
defineProps<{
  userInfo: {
    username: string;
    email: string;
    phone_number: string;
    given_name: string;
    family_name: string;
  };
}>();

const emit = defineEmits(['logout']);
</script>

<template>
  <el-dropdown trigger="click">
    <el-avatar class="avatar">
      <i class="fa-solid fa-user" />
    </el-avatar>

    <template #dropdown>
      <div class="content">
        <div class="row">
          <i class="fa-solid fa-address-card" />
          {{ userInfo.username }}
        </div>
        <div class="row">
          <i class="fa-solid fa-envelope" />
          {{ userInfo.email }}
        </div>
        <div class="row">
          <i class="fa-solid fa-phone" />
          {{ userInfo.phone_number }}
        </div>
        <el-button size="small" type="danger" class="logout-button" @click="() => emit('logout')">
          Logout
        </el-button>
      </div>
    </template>
  </el-dropdown>
</template>

<style scoped>
.avatar {
  cursor: pointer;
}

.content {
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.content .row {
  padding: 10px 5px;
  border-bottom: 1px solid #ebeef5;
}

.content .row i {
  width: 14px;
  margin-right: 2px;
}

.logout-button {
  margin-top: 10px;
}
</style>
