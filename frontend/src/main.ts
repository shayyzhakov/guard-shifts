import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/fontawesome/css/all.css';

import App from './App.vue';
import router from './router';
import * as authService from './auth';
import type { OAuth2Token } from '@badgateway/oauth2-client';
import { initFetcher } from './apis';

async function main() {
  try {
    const authCode = new URLSearchParams(window.location.search).get('code');
    const authTokenString = localStorage.getItem('oauth2_token');
    let authToken: OAuth2Token | undefined;

    if (authTokenString) {
      authToken = JSON.parse(authTokenString);
    }

    if (!authCode && !authToken) {
      await authService.redirectToAuthServer();
    } else {
      if (authCode) {
        authToken = await authService.exchangeCodeForToken();
      }

      if (!authToken?.expiresAt || authToken.expiresAt < Date.now()) {
        // TODO: refresh token instead?
        await authService.redirectToAuthServer();
      } else {
        initFetcher(import.meta.env.VITE_API_URL, authToken);

        // mount Vue app
        const app = createApp(App);

        app.use(createPinia());
        app.use(router);
        app.use(ElementPlus);

        app.mount('#app');
      }
    }
  } catch (err) {
    console.log('FATAL ERROR: ', err);
    authService.logout();
  }
}

main();
