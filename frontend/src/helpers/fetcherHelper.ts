import type { OAuth2Token } from '@badgateway/oauth2-client';

class AuthorizedFetch {
  private accessToken?: string;
  private expiresAt?: number | null;
  private refreshToken?: string | null;
  private baseUrl?: string;

  init(baseUrl: string, tokens: OAuth2Token) {
    this.baseUrl = baseUrl;
    this.accessToken = tokens.accessToken;
    this.expiresAt = tokens.expiresAt;
    this.refreshToken = tokens.refreshToken;
  }

  get isInitialized() {
    return !!this.baseUrl;
  }

  async fetch(...args: Parameters<typeof fetch>): Promise<any> {
    // add authorization header to request
    args[1] = {
      ...args[1],
      headers: {
        ...args[1]?.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    };

    const url = `${this.baseUrl}${args[0]}`;

    const response = await fetch(url, args[1]);
    if (response.status >= 400) {
      throw new Error(`[client] error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
}

export const fetcher = new AuthorizedFetch();

export function initFetcher(baseUrl: string, tokens: OAuth2Token): void {
  fetcher.init(baseUrl, tokens);
}
