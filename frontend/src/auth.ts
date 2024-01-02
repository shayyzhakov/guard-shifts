import { OAuth2Client, generateCodeVerifier, type OAuth2Token } from '@badgateway/oauth2-client';

const client = new OAuth2Client({
  server: import.meta.env.VITE_OAUTH_SERVER_URI,
  clientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,
  tokenEndpoint: '/oauth2/token',
  authorizationEndpoint: '/login',
});

// export const fetchWrapper = new OAuth2Fetch({
//   client,

//   getNewToken: async () => {
//     const codeVerifier = localStorage.getItem('oauth2_code_verifier') ?? '';

//     return await client.authorizationCode.getToken({
//       redirectUri: window.location.origin + '/',
//       codeVerifier,
//       code: 'abc',
//     });
//   },

//   storeToken: (token) => {
//     localStorage.setItem('oauth2_token', JSON.stringify(token));
//   },

//   getStoredToken: () => {
//     const token = localStorage.getItem('oauth2_token');
//     if (token) return JSON.parse(token);
//     return null;
//   },
// });

export async function redirectToAuthServer(): Promise<void> {
  const codeVerifier = await generateCodeVerifier();
  localStorage.setItem('oauth2_code_verifier', codeVerifier);

  const authServerUrl = await client.authorizationCode.getAuthorizeUri({
    redirectUri: window.location.origin + '/',
    codeVerifier,
    scope: ['openid'],
  });
  document.location = authServerUrl;
}

export async function exchangeCodeForToken(): Promise<OAuth2Token> {
  const codeVerifier = localStorage.getItem('oauth2_code_verifier') ?? '';
  localStorage.removeItem('oauth2_code_verifier');

  const oauth2Token = await client.authorizationCode.getTokenFromCodeRedirect(
    document.location.href,
    {
      redirectUri: window.location.origin + '/',
      codeVerifier,
    },
  );
  localStorage.setItem('oauth2_token', JSON.stringify(oauth2Token));

  return oauth2Token;
}

export async function logout() {
  const url = new URL(import.meta.env.VITE_OAUTH_SERVER_URI + '/logout');
  url.searchParams.append('client_id', import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID);
  url.searchParams.append('redirect_uri', window.location.origin + '/');
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', 'openid');

  localStorage.removeItem('oauth2_token');
  location.href = url.toString();
}

export interface UserInfo {
  email: string;
  email_verified: string;
  family_name: string;
  given_name: string;
  phone_number: string;
  phone_number_verified: string;
  sub: string;
  username: string;
}

export async function getUserInfo(): Promise<UserInfo | undefined> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return;
  }
  const response = await fetch(import.meta.env.VITE_OAUTH_SERVER_URI + '/oauth2/userInfo', {
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
  });

  if (response.ok) {
    const userData = await response.json();
    return userData;
  } else {
    console.error('Failed to get user data:', response.status, response.statusText);
  }
}

export function getAccessToken(): string | undefined {
  const token = localStorage.getItem('oauth2_token') ?? '{}';
  return JSON.parse(token).accessToken;
}
