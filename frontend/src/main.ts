import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/fontawesome/css/all.css';

import App from './App.vue';
import router from './router';
import * as authService from './auth';
import { initFetcher } from './helpers/fetcherHelper';
import { getStoredOauth2Token } from './auth';

async function main() {
  try {
    const authCode = new URLSearchParams(window.location.search).get('code');
    if (authCode) {
      await authService.exchangeCodeForToken();
    }

    let authToken = getStoredOauth2Token();
    if (authToken && (!authToken.expiresAt || authToken.expiresAt < Date.now())) {
      await authService.refreshAccessToken();
      authToken = getStoredOauth2Token();
    }

    if (!authToken?.expiresAt || authToken.expiresAt < Date.now()) {
      await authService.redirectToAuthServer();
      return;
    }

    initFetcher(
      import.meta.env.VITE_API_URL,
      authToken.accessToken,
      authService.refreshAccessToken,
    );

    // mount Vue app
    const app = createApp(App);

    app.use(createPinia());
    app.use(router);
    app.use(ElementPlus);

    app.mount('#app');
  } catch (err) {
    console.log('FATAL ERROR: ', err);
    authService.logout();
  }
}

main();
