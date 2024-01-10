<script setup lang="ts">
import { reactive, watch } from 'vue';
import { type CreateGuardPostParams, createGuardPost } from '@/apis/guardPosts.api';
import { ElNotification } from 'element-plus';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import GuardPostForm from '@/components/forms/GuardPostForm.vue';

const showModal = defineModel('showModal');

const guardPostsStore = useGuardPostsStore();

const newGuardPostParams = reactive<CreateGuardPostParams>({
  displayName: '',
  strategy: '',
  numOfSoldiers: 1,
  occupation: [],
  constraints: [],
});

function resetNewGuardPostParams() {
  newGuardPostParams.displayName = '';
  newGuardPostParams.strategy = '';
  newGuardPostParams.numOfSoldiers = 1;
  newGuardPostParams.occupation = [];
  newGuardPostParams.constraints = [];
}

async function saveNewGuardPost() {
  try {
    await createGuardPost(newGuardPostParams);

    ElNotification({
      message: 'Guard post created successfully',
      type: 'success',
    });
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to create a new guard post',
      type: 'error',
    });
  } finally {
    showModal.value = false;
    guardPostsStore.refreshGuardPosts();
  }
}

watch(showModal, (newVal) => {
  if (!newVal) {
    resetNewGuardPostParams();
  }
});
</script>

<template>
  <el-dialog v-model="showModal" title="New Guard Post" width="700px">
    <GuardPostForm v-model="newGuardPostParams" />

    <template #footer>
      <el-button @click="showModal = false">Cancel</el-button>
      <el-button type="primary" @click="saveNewGuardPost">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
