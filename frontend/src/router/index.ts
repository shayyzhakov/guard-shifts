import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SoldiersManagementView from '../views/SoldiersManagementView.vue';
import GuardPostsView from '../views/GuardPostsView.vue';
import GenerateShiftsView from '../views/GenerateShiftsView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/soldiers-management',
      name: 'soldiers-management',
      component: SoldiersManagementView,
    },
    {
      path: '/guard-posts',
      name: 'guard-posts',
      component: GuardPostsView,
    },

    {
      path: '/generate-shifts',
      name: 'generate-shifts',
      component: GenerateShiftsView,
    },
    // TODO: add empty route
  ],
});

export default router;
