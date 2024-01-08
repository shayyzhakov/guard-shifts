<script setup lang="ts">
import { reactive } from 'vue';
import { type CreateSoldierParams, createSoldier } from '@/apis/soldiers.api';
import { ElNotification } from 'element-plus';
import { useSoldiersStore } from '@/stores/soldiers.store';

const showCreateSoldierModal = defineModel('showModal');

const soldiersStore = useSoldiersStore();

const newSoldierParams = reactive<CreateSoldierParams>({
  first_name: '',
  last_name: '',
  personal_number: '',
  phone_number: '',
  capabilities: [],
});

function resetNewSoldierParams() {
  newSoldierParams.first_name = '';
  newSoldierParams.last_name = '';
  newSoldierParams.personal_number = '';
  newSoldierParams.phone_number = '';
  newSoldierParams.capabilities = [];
}

async function saveNewSoldier() {
  try {
    await createSoldier(newSoldierParams);

    ElNotification({
      message: 'Soldier created successfully',
      type: 'success',
    });
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to create a new soldier',
      type: 'error',
    });
  } finally {
    showCreateSoldierModal.value = false;
    resetNewSoldierParams();
    soldiersStore.refreshSoldiers();
  }
}
</script>

<template>
  <el-dialog v-model="showCreateSoldierModal" title="New Soldier" width="500px">
    <el-form :model="newSoldierParams" label-width="180px" label-position="left">
      <el-form-item label="Soldier First Name">
        <el-input v-model="newSoldierParams.first_name" />
      </el-form-item>

      <el-form-item label="Soldier Last Name">
        <el-input v-model="newSoldierParams.last_name" />
      </el-form-item>

      <el-form-item label="Soldier Personal Number">
        <el-input v-model="newSoldierParams.personal_number" />
      </el-form-item>

      <el-form-item label="Soldier Phone Number">
        <el-input v-model="newSoldierParams.phone_number" />
      </el-form-item>

      <!-- TODO: capabilities -->
    </el-form>

    <template #footer>
      <el-button @click="showCreateSoldierModal = false">Cancel</el-button>
      <el-button type="primary" @click="saveNewSoldier">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
