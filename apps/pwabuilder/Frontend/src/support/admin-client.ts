import {
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from '@azure/msal-browser';
import type { Configuration, IPublicClientApplication } from '@azure/msal-browser';
import { adminRoute, callbackPath, isUuid, returnPathKey, takeReturnPath } from './admin-route.ts';

export class AdminError extends Error {
  readonly interactionRequired: boolean;

  constructor(message: string, interactionRequired = false) {
    super(message);
    this.interactionRequired = interactionRequired;
  }
}

interface AdminConfig {
  tenantId: string;
  clientId: string;
  scope: string;
}

type AuthClient = Pick<IPublicClientApplication,
  'handleRedirectPromise' | 'getActiveAccount' | 'getAllAccounts' | 'setActiveAccount' |
  'acquireTokenSilent' | 'acquireTokenRedirect' | 'loginRedirect' | 'logoutRedirect'>;

export type AuthFactory = (config: Configuration) => AuthClient;

export function safeError(error: unknown): AdminError {
  if (error instanceof AdminError) {
    return error;
  }
  if (error instanceof InteractionRequiredAuthError) {
    return new AdminError('Sign in again to grant access or renew your support session.', true);
  }
  return new AdminError('The support request could not be completed. Retry, or sign in again.');
}

function checkResponse(response: Response): void {
  if (response.ok) {
    return;
  }
  const messages: Record<number, string> = {
    401: 'Your support session was not accepted. Sign in again.',
    403: 'Access denied. Your account is not authorized for support diagnostics.',
    404: 'Support diagnostics are unavailable or this record was not found.',
  };
  throw new AdminError(messages[response.status] || 'Support diagnostics are temporarily unavailable. Retry later.', response.status === 401);
}

function parseConfig(value: unknown): AdminConfig {
  if (typeof value !== 'object' || value === null) {
    throw new AdminError('Support authentication is not configured.');
  }
  const config = value as Record<string, unknown>;
  if (typeof config.tenantId !== 'string' || !isUuid(config.tenantId) ||
    typeof config.clientId !== 'string' || !isUuid(config.clientId) ||
    config.scope !== `api://${config.clientId}/Support.Read`) {
    throw new AdminError('Support authentication is not configured.');
  }
  return { tenantId: config.tenantId, clientId: config.clientId, scope: config.scope as string };
}

/** Owns only authentication and same-origin bearer requests, never diagnostic storage. */
export class AdminClient {
  private auth?: AuthClient;
  private scope = '';
  private ready = false;
  private signedOut = false;
  private initialization?: Promise<void>;
  private readonly browser: Pick<Window, 'location' | 'history' | 'sessionStorage'>;
  private readonly request: typeof fetch;
  private readonly createAuth: AuthFactory;

  constructor(
    browser: Pick<Window, 'location' | 'history' | 'sessionStorage'> = window,
    request: typeof fetch = (input, init) => fetch(input, init),
    createAuth: AuthFactory = config => new PublicClientApplication(config),
  ) {
    this.browser = browser;
    this.request = request;
    this.createAuth = createAuth;
  }

  get signedIn(): boolean {
    return !this.signedOut && !!this.auth?.getActiveAccount();
  }

  async initialize(): Promise<void> {
    if (this.ready) {
      return;
    }
    this.initialization ??= this.initializeCore().finally((): void => {
      this.initialization = undefined;
    });
    return this.initialization;
  }

  private async initializeCore(): Promise<void> {
    const response = await this.request('/api/admin/config', {
      cache: 'no-store', credentials: 'omit', redirect: 'error',
    });
    checkResponse(response);
    const config = parseConfig(await response.json());
    this.scope = config.scope;
    const redirectUri = this.browser.location.origin + callbackPath;
    this.auth = this.createAuth({
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        redirectUri,
        postLogoutRedirectUri: redirectUri,
        navigateToLoginRequestUrl: false,
      },
      cache: {
        cacheLocation: BrowserCacheLocation.SessionStorage,
        temporaryCacheLocation: BrowserCacheLocation.SessionStorage,
        storeAuthStateInCookie: false,
      },
      system: {
        // MSAL owns PKCE and protocol validation. No auth error/token logging.
        loggerOptions: { loggerCallback: (): void => {}, piiLoggingEnabled: false },
      },
    });
    try {
      const result = await this.auth.handleRedirectPromise();
      const accounts = this.auth.getAllAccounts();
      const account = result?.account || this.auth.getActiveAccount() ||
        (accounts.length === 1 ? accounts[0] : null);
      this.auth.setActiveAccount(account);
      this.ready = true;
    } finally {
      // Remove protocol parameters even on failure; never replay arbitrary return URLs.
      const pathname = this.browser.location.pathname;
      const destination = pathname === callbackPath
        ? takeReturnPath(this.browser.sessionStorage)
        : adminRoute(pathname)?.pathname || '/admin';
      this.browser.history.replaceState(null, '', destination);
    }
  }

  async signIn(pathname: string): Promise<void> {
    if (!this.ready || !this.auth) {
      await this.initialize();
    }
    const auth = this.auth!;
    this.browser.sessionStorage.setItem(returnPathKey, adminRoute(pathname)?.pathname || '/admin');
    const account = this.signedOut ? null : auth.getActiveAccount();
    if (account) {
      await auth.acquireTokenRedirect({ scopes: [this.scope], account });
    } else {
      await auth.loginRedirect({ scopes: [this.scope], prompt: 'select_account' });
    }
  }

  async signOut(): Promise<void> {
    this.signedOut = true;
    this.browser.sessionStorage.removeItem(returnPathKey);
    if (this.auth) {
      const account = this.auth.getActiveAccount();
      this.auth.setActiveAccount(null);
      await this.auth.logoutRedirect({
        account,
        postLogoutRedirectUri: this.browser.location.origin + callbackPath,
      });
    }
  }

  async get(pathname: string, signal?: AbortSignal): Promise<unknown> {
    const route = adminRoute(pathname);
    if (!route) {
      throw new AdminError('This support link is not valid.');
    }
    if (!this.ready || !this.auth || !this.signedIn) {
      throw new AdminError('Sign in to view private support diagnostics.', true);
    }
    const account = this.auth.getActiveAccount()!;
    const token = await this.auth.acquireTokenSilent({ scopes: [this.scope], account });
    if (!token.accessToken || this.signedOut || signal?.aborted) {
      throw new AdminError('The support request was cancelled.');
    }
    const response = await this.request(route.apiPath, {
      headers: { Authorization: `Bearer ${token.accessToken}` },
      cache: 'no-store', credentials: 'omit', redirect: 'error', signal,
    });
    checkResponse(response);
    return response.json();
  }
}
