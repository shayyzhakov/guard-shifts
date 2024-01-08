<script setup lang="ts">
import { reactive } from 'vue';
import { type CreateSoldierParams, createSoldier } from '@/apis/soldiers.api';
import { ElNotification } from 'element-plus';
import { useSoldiersStore } from '@/stores/soldiers.store';
import SoldierForm from '@/components/forms/SoldierForm.vue';

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
    <SoldierForm v-model="newSoldierParams" />

    <template #footer>
      <el-button @click="showCreateSoldierModal = false">Cancel</el-button>
      <el-button type="primary" @click="saveNewSoldier">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
