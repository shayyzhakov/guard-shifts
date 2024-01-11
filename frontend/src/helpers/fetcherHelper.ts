type RefreshTokenCallback = () => Promise<string | undefined>;

class AuthorizedFetch {
  private accessToken?: string;
  private baseUrl?: string;
  private refreshTokenCallback?: RefreshTokenCallback;

  init(baseUrl: string, accessToken: string, refreshTokenCallback: RefreshTokenCallback) {
    this.baseUrl = baseUrl;
    this.accessToken = accessToken;
    this.refreshTokenCallback = refreshTokenCallback;
  }

  get isInitialized() {
    return !!this.baseUrl;
  }

  async fetch(...args: Parameters<typeof fetch>): Promise<any> {
    let response = await this.innerFetch(...args);

    // if unauthorized, refresh token and retry request
    if (response.status === 401) {
      this.accessToken = await this.refreshTokenCallback?.();
      response = await this.innerFetch(...args);
    }

    if (response.status >= 400) {
      throw new Error(`[client] error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }

  async innerFetch(...args: Parameters<typeof fetch>): Promise<any> {
    // add authorization header to request
    args[1] = {
      ...args[1],
      headers: {
        ...args[1]?.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    };

    const url = `${this.baseUrl}${args[0]}`;

    return await fetch(url, args[1]);
  }
}

export const fetcher = new AuthorizedFetch();

export function initFetcher(
  baseUrl: string,
  accessToken: string,
  refreshTokenCallback: RefreshTokenCallback,
): void {
  fetcher.init(baseUrl, accessToken, refreshTokenCallback);
}
