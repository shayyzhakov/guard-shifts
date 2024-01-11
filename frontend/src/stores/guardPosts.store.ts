import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getGuardPosts, type GuardPost } from '@/apis/guardPosts.api';

export const useGuardPostsStore = defineStore('guardPosts', () => {
  const guardPosts = ref<GuardPost[]>();

  async function refreshGuardPosts() {
    guardPosts.value = await getGuardPosts();
  }

  const isGuardPostDeleted = computed(() => (guardPostId: string) => {
    return guardPosts.value && !guardPosts.value.find((guardPost) => guardPost.id === guardPostId);
  });

  const guardPostNameById = computed(() => (guardPostId: string) => {
    return guardPosts.value?.find((guardPost) => guardPost.id === guardPostId)?.displayName;
  });

  return { guardPosts, refreshGuardPosts, isGuardPostDeleted, guardPostNameById };
});
