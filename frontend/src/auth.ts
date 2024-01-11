import { OAuth2Client, generateCodeVerifier, type OAuth2Token } from '@badgateway/oauth2-client';

const client = new OAuth2Client({
  server: import.meta.env.VITE_OAUTH_SERVER_URI,
  clientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID,
  tokenEndpoint: '/oauth2/token',
  authorizationEndpoint: '/login',
});

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

export async function exchangeCodeForToken(): Promise<void> {
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
}

export async function refreshAccessToken(): Promise<string | undefined> {
  const oauth2Token = getStoredOauth2Token();
  if (!oauth2Token) {
    return;
  }
  const newOauth2TokenWithoutRefreshToken = await client.refreshToken(oauth2Token);
  const newOauth2Token = {
    ...newOauth2TokenWithoutRefreshToken,
    refreshToken: oauth2Token.refreshToken,
  };

  localStorage.setItem('oauth2_token', JSON.stringify(newOauth2Token));
  return newOauth2Token.accessToken ?? undefined;
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
  const accessToken = getStoredOauth2Token()?.accessToken;
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

export function getStoredOauth2Token(): OAuth2Token | undefined {
  const oauth2Token = JSON.parse(localStorage.getItem('oauth2_token') ?? '{}');
  if (
    !oauth2Token ||
    !oauth2Token.refreshToken ||
    !oauth2Token.accessToken ||
    !oauth2Token.expiresAt
  ) {
    return;
  }
  return oauth2Token;
}
