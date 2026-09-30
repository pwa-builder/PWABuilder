import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const clientId = '11111111-1111-4111-8111-111111111111';
const analysisPath = '/admin/analyses/analysis%3Aexample.com%3A123456';
const packagePath = '/admin/package-jobs/33333333-3333-4333-8333-333333333333';
const analysis = {
  id: 'analysis:example.com:123456', siteOrigin: 'https://example.com', status: 3,
  createdAt: '2026-09-30T12:00:00Z', updatedAt: '2026-09-30T12:01:00Z',
  failureSummary: 'Analysis failed', checks: [{ id: 0, status: 3 }],
  error: 'A sanitized error', logs: ['<img src=x onerror=alert(1)>'],
  rawCredentials: 'NEVER_RENDER_ME',
};
const packageData = {
  supportReference: '33333333-3333-4333-8333-333333333333', siteOrigin: 'https://example.com',
  status: 'Failed', createdAt: analysis.createdAt, updatedAt: analysis.updatedAt, retryCount: 2,
  configuration: {
    name: 'Example app', packageId: 'com.example.app', appVersion: '1.0', appVersionCode: 1,
    minSdkVersion: 23, signingMode: 'mine', hasUploadedKey: true,
    hasKeyPassword: true, hasStorePassword: false, keyPassword: 'NEVER_RENDER_ME',
  },
  stages: ['Build'], failureSummary: 'Packaging failed', logs: ['Sanitized build log'], errors: ['Sanitized failure'],
  artifactUrl: 'https://example.com/NEVER_RENDER_ME',
};

interface Options {
  signedIn?: boolean;
  interaction?: boolean;
  apiStatus?: number;
  configStatus?: number;
  realMsal?: boolean;
}

async function mockBoundary(page: Page, options: Options = {}): Promise<string[]> {
  const calls: string[] = [];
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== 'http://127.0.0.1:5178') {
      await route.abort();
      throw new Error('An offline admin test attempted an external request.');
    }
    if (url.pathname.includes('@azure_msal-browser') && !options.realMsal) {
      await route.fulfill({ contentType: 'application/javascript', body: `
        export const BrowserCacheLocation = { SessionStorage: 'sessionStorage' };
        export class InteractionRequiredAuthError extends Error {}
        export class PublicClientApplication {
          constructor(config) {
            this.account = ${options.signedIn !== false ? '{}' : 'null'};
            window.__authConfig = config;
          }
          async handleRedirectPromise() { window.__redirectHandled = true; return null; }
          getAllAccounts() { return this.account ? [this.account] : []; }
          getActiveAccount() { return this.account; }
          setActiveAccount(account) { this.account = account; }
          async acquireTokenSilent(request) {
            if (!window.__redirectHandled) throw new Error('redirect not handled');
            window.__scopes = request.scopes;
            ${options.interaction ? "throw new InteractionRequiredAuthError('interaction_required');" : "return { accessToken: 'offline-api-token', idToken: 'never-id-token' };"}
          }
          async loginRedirect() { window.__login = true; }
          async acquireTokenRedirect() { window.__consent = true; }
          async logoutRedirect() { window.__logout = true; }
        }
      ` });
    } else if (url.pathname === '/api/admin/config') {
      await route.fulfill({ status: options.configStatus || 200, json: {
        tenantId: '22222222-2222-4222-8222-222222222222', clientId, scope: 'api://' + clientId + '/Support.Read',
      } });
    } else if (url.pathname.startsWith('/api/admin')) {
      calls.push(url.pathname);
      expect(route.request().headers().authorization).toBe('Bearer offline-api-token');
      expect(route.request().headers().cookie).toBeUndefined();
      const data = url.pathname.includes('/analyses/') ? analysis
        : url.pathname.includes('/package-jobs/') ? packageData
          : { analyses: [analysis], packages: [packageData] };
      await route.fulfill({ status: options.apiStatus || 200, json: data });
    } else if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
      // Emulate the backend's shell mapping, not its auth implementation.
      const response = await route.fetch({ url: 'http://127.0.0.1:5178/admin.html' });
      await route.fulfill({ response });
    } else {
      await route.continue();
    }
  });
  return calls;
}

test('callback restores safe deep link, uses API token, and renders only explicit escaped fields', async ({ page }) => {
  const calls = await mockBoundary(page);
  await page.addInitScript(path => sessionStorage.setItem('pwabuilder.support.return-path', path), analysisPath);
  await page.goto('/admin/signin-oidc?code=never-send-to-telemetry#state=opaque');
  await expect(page).toHaveURL(analysisPath);
  await expect(page.getByRole('heading', { name: 'Checks', exact: true })).toBeVisible();
  await expect(page.getByText('HasManifest: Failed')).toBeVisible();
  await expect(page.getByText('<img src=x onerror=alert(1)>', { exact: true })).toBeVisible();
  await expect(page.locator('support-admin img')).toHaveCount(0);
  await expect(page.locator('support-admin')).not.toContainText('NEVER_RENDER_ME');
  expect(calls).toEqual(['/api' + analysisPath]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(await page.evaluate(() => navigator.serviceWorker.getRegistrations().then(values => values.length))).toBe(0);
});

test('dashboard navigation, browser back and signout clear previous diagnostic data', async ({ page }) => {
  await mockBoundary(page);
  await page.goto('/admin');
  await expect(page.getByText('Recent package failures')).toBeVisible();
  await page.getByRole('link', { name: 'View diagnostics' }).last().click();
  await expect(page).toHaveURL(packagePath);
  await expect(page.getByText('Uploaded key present', { exact: true })).toBeVisible();
  await expect(page.getByText('Sanitized build log')).toBeVisible();
  await expect(page.locator('support-admin')).not.toContainText('NEVER_RENDER_ME');
  await page.goBack();
  await expect(page.getByText('Recent package failures')).toBeVisible();
  await expect(page.getByText('Sanitized build log')).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.locator('support-admin article')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Sign in');
  await expect(page.locator('support-admin article')).toHaveCount(0);
});

test('interaction required offers a user-driven redirect without a loop', async ({ page }) => {
  const calls = await mockBoundary(page, { interaction: true });
  await page.goto(analysisPath);
  await expect(page.getByRole('status')).toContainText('Sign in again');
  expect(calls).toEqual([]);
  expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__consent)).toBeUndefined();
  await page.getByRole('button', { name: 'Sign in again', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__consent)).toBe(true);
});

for (const status of [401, 403, 404]) {
  test(`HTTP ${status} shows a safe error without diagnostics or automatic login`, async ({ page }) => {
    await mockBoundary(page, { apiStatus: status });
    await page.goto('/admin');
    await expect(page.getByRole('status')).toContainText(status === 401 ? 'Sign in again'
      : status === 403 ? 'Access denied' : 'not found');
    await expect(page.locator('support-admin article')).toHaveCount(0);
  });
}

test('signed-out and unknown routes never fetch diagnostics', async ({ page }) => {
  const calls = await mockBoundary(page, { signedIn: false });
  await page.goto(analysisPath);
  await expect(page.getByRole('status')).toContainText('Sign in');
  expect(calls).toEqual([]);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__login)).toBe(true);
  await page.goto('/admin/unknown');
  await expect(page.getByRole('status')).toContainText('not valid');
  expect(calls).toEqual([]);
});

test('missing configuration has no private request or redirect', async ({ page }) => {
  const calls = await mockBoundary(page, { configStatus: 404 });
  await page.goto('/admin');
  await expect(page.getByRole('status')).toContainText('unavailable');
  expect(calls).toEqual([]);
});

test('the installed MSAL client initializes offline without prompting an anonymous visitor', async ({ page }) => {
  const calls = await mockBoundary(page, { realMsal: true });
  const scripts: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'script') {
      scripts.push(request.url());
    }
  });
  await page.goto('/admin/signin-oidc');
  await expect(page).toHaveURL('/admin');
  await expect(page.getByRole('status')).toContainText('Sign in');
  expect(calls).toEqual([]);
  expect(scripts.some(url => /app-index|site-analytics|appinsights|service-worker/.test(url))).toBe(false);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('restoring a page clears diagnostic content until an explicit reload', async ({ page }) => {
  await mockBoundary(page);
  await page.goto(packagePath);
  await expect(page.getByText('Sanitized build log')).toBeVisible();
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await expect(page.locator('support-admin article')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Page restored');
});
