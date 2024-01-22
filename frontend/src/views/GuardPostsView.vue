<script setup lang="ts">
import { stringifyPeriod } from '@/helpers/periodHelpers';
import { computed, reactive, ref } from 'vue';
import { useGuardPostsStore } from '@/stores/guardPosts.store';
import CreateGuardPostModal from '@/components/modals/CreateGuardPostModal.vue';
import EditGuardPostModal from '@/components/modals/EditGuardPostModal.vue';
import type { CreateGuardPostParams, GuardPost } from '@/apis/guardPosts.api';
import { strategies } from '@/consts';

const guardPostsStore = useGuardPostsStore();

const showCreateGuardPostModal = ref<boolean>(false);
const showEditGuardPostModal = ref<boolean>(false);

const selectedGuardPostId = ref<string>();

const selectedGuardPostParams = reactive<CreateGuardPostParams>({
  displayName: '',
  strategy: '',
  numOfSoldiers: 1,
  occupation: [],
  config: {},
});

function editGuardPost(guardPost: GuardPost) {
  selectedGuardPostId.value = guardPost.id;
  selectedGuardPostParams.displayName = guardPost.displayName;
  selectedGuardPostParams.strategy = guardPost.strategy;
  selectedGuardPostParams.numOfSoldiers = guardPost.numOfSoldiers;
  selectedGuardPostParams.occupation = JSON.parse(JSON.stringify(guardPost.occupation));
  selectedGuardPostParams.config = JSON.parse(JSON.stringify(guardPost.config));

  showEditGuardPostModal.value = true;
}

const loading = computed<boolean>(() => !guardPostsStore.guardPosts);
const noGuardPosts = computed<boolean>(
  () => !!(guardPostsStore.guardPosts && !guardPostsStore.guardPosts.length),
);
</script>

<template>
  <div class="content">
    <h1>Guard Posts</h1>

    <div v-if="!noGuardPosts" class="action-buttons">
      <el-button type="primary" @click="showCreateGuardPostModal = true">New Guard Post</el-button>
    </div>

    <section v-loading="loading" class="guard-post-cards">
      <div v-if="noGuardPosts" class="empty-state-container">
        <el-empty description="Create your first guard post">
          <el-button type="primary" @click="showCreateGuardPostModal = true">
            New Guard Post
          </el-button>
        </el-empty>
      </div>

      <el-card v-for="guardPost in guardPostsStore.guardPosts" :key="guardPost.id">
        <template #header>
          <div class="card-header">
            <h3>{{ guardPost.displayName }}</h3>

            <div class="card-actions">
              <el-button circle text @click="() => editGuardPost(guardPost)">
                <i class="fa-solid fa-gear fa-lg" />
              </el-button>
            </div>
          </div>
        </template>

        <div class="card-body">
          <div class="card-body-section">
            <h4>Soldiers</h4>
            <p>{{ guardPost.numOfSoldiers }}</p>
          </div>

          <div class="card-body-section">
            <h4>Strategy</h4>
            <p>{{ strategies[guardPost.strategy].name }}</p>
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
    <EditGuardPostModal
      v-model:showModal="showEditGuardPostModal"
      :selectedGuardPostId="selectedGuardPostId"
      :guardPost="selectedGuardPostParams"
    />
  </div>
</template>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

h3 {
  margin-right: 6px;
}

.guard-post-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  padding-bottom: 30px;
}

.card-header {
  display: flex;
  gap: 6px;
  align-items: center;
}

.card-actions {
  margin-left: auto;
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

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 80%;
}
</style>
