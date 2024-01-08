import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getGuardPosts, type GuardPost } from '@/apis';

export const useGuardPostsStore = defineStore('guardPosts', () => {
  const guardPosts = ref<GuardPost[]>();

  async function refreshGuardPosts() {
    guardPosts.value = await getGuardPosts();
  }

  return { guardPosts, refreshGuardPosts };
});
