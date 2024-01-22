<script setup lang="ts">
import { reactive, watchEffect } from 'vue';
import { type CreateSoldierParams, updateSoldier, deleteSoldier } from '@/apis/soldiers.api';
import { ElNotification } from 'element-plus';
import { useSoldiersStore } from '@/stores/soldiers.store';
import SoldierForm from '@/components/forms/SoldierForm.vue';

const showModal = defineModel('showModal');

const props = defineProps<{
  selectedSoldierId?: string;
  soldier?: CreateSoldierParams;
}>();

const soldiersStore = useSoldiersStore();

const selectedSoldierParams = reactive<CreateSoldierParams>({
  first_name: '',
  last_name: '',
  personal_number: '',
  phone_number: '',
  capabilities: [],
});

watchEffect(() => {
  selectedSoldierParams.first_name = props.soldier?.first_name ?? '';
  selectedSoldierParams.last_name = props.soldier?.last_name ?? '';
  selectedSoldierParams.personal_number = props.soldier?.personal_number ?? '';
  selectedSoldierParams.phone_number = props.soldier?.phone_number ?? '';
  selectedSoldierParams.capabilities = props.soldier?.capabilities ?? [];
});

async function saveSoldierChanges() {
  try {
    if (!props.selectedSoldierId) throw new Error('No soldier was selected');

    await updateSoldier(props.selectedSoldierId, selectedSoldierParams);

    ElNotification({
      title: 'Soldier changed successfully',
      message: 'Soldier changes were saved',
      type: 'success',
    });

    soldiersStore.refreshSoldiers();
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to save soldier changes',
      type: 'error',
    });
  } finally {
    showModal.value = false;
  }
}

async function deleteExistingSoldier() {
  try {
    if (!props.selectedSoldierId) throw new Error('No soldier was selected');

    await deleteSoldier(props.selectedSoldierId);

    ElNotification({
      message: 'Soldier deleted successfully',
      type: 'success',
    });

    soldiersStore.refreshSoldiers();
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to delete soldier',
      type: 'error',
    });
  } finally {
    showModal.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="showModal" title="Edit Soldier" width="500px">
    <SoldierForm v-model="selectedSoldierParams" />

    <template #footer>
      <el-button type="danger" @click="deleteExistingSoldier">Delete</el-button>
      <el-button @click="showModal = false">Cancel</el-button>
      <el-button type="primary" @click="saveSoldierChanges">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
