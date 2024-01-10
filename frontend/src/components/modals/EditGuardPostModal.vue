<script setup lang="ts">
import { reactive, watchEffect } from 'vue';
import {
  type CreateGuardPostParams,
  updateGuardPost,
  deleteGuardPost,
} from '@/apis/guardPosts.api';
import { ElNotification } from 'element-plus';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import GuardPostForm from '@/components/forms/GuardPostForm.vue';

const showModal = defineModel('showModal');

const props = defineProps<{
  selectedGuardPostId?: string;
  guardPost?: CreateGuardPostParams;
}>();

const guardPostsStore = useGuardPostsStore();

const selectedGuardPostParams = reactive<CreateGuardPostParams>({
  displayName: '',
  strategy: '',
  numOfSoldiers: 1,
  occupation: [],
  constraints: [],
});

watchEffect(() => {
  selectedGuardPostParams.displayName = props.guardPost?.displayName ?? '';
  selectedGuardPostParams.strategy = props.guardPost?.strategy ?? '';
  selectedGuardPostParams.numOfSoldiers = props.guardPost?.numOfSoldiers ?? 1;
  selectedGuardPostParams.occupation = props.guardPost?.occupation ?? [];
  selectedGuardPostParams.constraints = props.guardPost?.constraints ?? [];
});

async function saveGuardPostChanges() {
  try {
    if (!props.selectedGuardPostId) throw new Error('No guard post was selected');

    await updateGuardPost(props.selectedGuardPostId, selectedGuardPostParams);

    ElNotification({
      message: 'Guard post changed successfully',
      type: 'success',
    });

    guardPostsStore.refreshGuardPosts();
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to save guard post changes',
      type: 'error',
    });
  } finally {
    showModal.value = false;
  }
}

async function deleteExistingGuardPost() {
  try {
    if (!props.selectedGuardPostId) throw new Error('No guard post was selected');

    await deleteGuardPost(props.selectedGuardPostId);

    ElNotification({
      message: 'Guard post deleted successfully',
      type: 'success',
    });

    guardPostsStore.refreshGuardPosts();
  } catch (e) {
    ElNotification({
      title: 'Action failed',
      message: 'Failed to delete guard post',
      type: 'error',
    });
  } finally {
    showModal.value = false;
  }
}
</script>

<template>
  <el-dialog v-model="showModal" title="Edit Guard Post" width="700px">
    <GuardPostForm v-model="selectedGuardPostParams" />

    <template #footer>
      <el-button type="danger" @click="deleteExistingGuardPost">Delete</el-button>
      <el-button @click="showModal = false">Cancel</el-button>
      <el-button type="primary" @click="saveGuardPostChanges">Save</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
