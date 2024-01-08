<script setup lang="ts">
import { type CreateSoldierParams } from '@/apis/soldiers.api';

const formData = defineModel<CreateSoldierParams>({
  required: true,
});
</script>

<template>
  <el-form :model="formData" label-width="180px" label-position="left">
    <el-form-item label="Soldier First Name">
      <el-input v-model="formData.first_name" />
    </el-form-item>

    <el-form-item label="Soldier Last Name">
      <el-input v-model="formData.last_name" />
    </el-form-item>

    <el-form-item label="Soldier Personal Number">
      <el-input v-model="formData.personal_number" />
    </el-form-item>

    <el-form-item label="Soldier Phone Number">
      <el-input v-model="formData.phone_number" />
    </el-form-item>

    <!-- TODO: capabilities -->
  </el-form>
</template>

<style scoped></style>
