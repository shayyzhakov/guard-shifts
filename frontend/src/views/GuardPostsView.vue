<script setup lang="ts">
import { stringifyPeriod } from '@/helpers/periodHelpers';
import { onMounted, ref } from 'vue';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import CreateGuardPostModal from '@/components/modals/CreateGuardPostModal.vue';

const guardPostsStore = useGuardPostsStore();

onMounted(async () => {
  guardPostsStore.refreshGuardPosts();
});

const showCreateGuardPostModal = ref<boolean>(false);
</script>

<template>
  <div>
    <h1>Guard Posts</h1>

    <div class="action-buttons">
      <el-button type="primary" @click="showCreateGuardPostModal = true">New Guard Post</el-button>
    </div>

    <section class="guard-post-cards">
      <el-card v-for="guardPost in guardPostsStore.guardPosts" :key="guardPost.id">
        <template #header>
          <div class="card-header">
            <h3>{{ guardPost.displayName }}</h3>
          </div>
        </template>

        <div class="card-body">
          <div class="card-body-section">
            <h4>Soldiers</h4>
            <p>{{ guardPost.numOfSoldiers }}</p>
          </div>

          <div class="card-body-section">
            <h4>Strategy</h4>
            <p>{{ guardPost.strategy }}</p>
          </div>

          <div class="card-body-section">
            <h4>Guard Time</h4>
            <div
              v-for="occupation in guardPost.occupation"
              :key="`${guardPost.id}-${occupation.from}`"
            >
              {{ stringifyPeriod(occupation.from) }}-{{ stringifyPeriod(occupation.to) }}:
              {{ occupation.duration / 2 }}h
            </div>
          </div>
        </div>
      </el-card>
    </section>

    <CreateGuardPostModal v-model:showModal="showCreateGuardPostModal" />
  </div>
</template>

<style scoped>
h3 {
  margin-right: 6px;
}

.guard-post-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  gap: 6px;
  align-items: center;
}

.card-body {
  display: flex;
}

.card-body-section {
  width: 200px;
}

.card-body-section h4 {
  font-weight: 600;
}

.action-buttons {
  margin-bottom: 16px;
  text-align: right;
}
</style>
