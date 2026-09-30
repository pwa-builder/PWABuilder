import { test, expect } from '@playwright/test';
import checkNotebook from './notebook.browser.js';

const deployments = [
  { name: 'origin root', url: 'http://127.0.0.1:4177/', base: '/' },
  { name: 'project Pages', url: 'http://127.0.0.1:4176/PWABuilder/', base: '/PWABuilder/' },
];

for (const deployment of deployments) {
  test.describe(deployment.name, () => {
    test('cold deep links return HTTP 200 without a service worker or rewrites', async ({ browser, request }) => {
      expect((await request.get(`${deployment.url}about`)).status()).toBe(404);
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      const failed = [];
      page.on('requestfailed', (event) => failed.push(event.url()));
      try {
        for (const query of ['?view=about', '?note=missing', '?new=photo', '?title=Shared&text=Hello']) {
          const response = await page.goto(`${deployment.url}${query}`);
          expect(response.status()).toBe(200);
          if (query === '?view=about') {
            await expect(page.getByRole('heading', { name: 'About Nimbus' })).toBeVisible();
            await expect(page.locator('app-header a[aria-current="page"]')).toHaveText('About');
          } else {
            await expect(page.getByRole('textbox', { name: 'Note title', exact: true })).toBeVisible();
            await page.waitForFunction(() =>
              document.querySelector('app-index').shadowRoot.querySelector('app-notes').shadowRoot.querySelector('.save-state').textContent === 'Saved on this device');
          }
          if (query === '?new=photo') await page.getByRole('button', { name: 'Cancel', exact: true }).click();
          expect((await page.reload()).status()).toBe(200);
        }
        const assets = await page.evaluate(() => ({
          base: document.querySelector('base').getAttribute('href'),
          manifest: document.querySelector('link[rel=manifest]').href,
          icon: document.querySelector('link[rel=icon]').href,
          images: [...document.querySelector('app-index').shadowRoot.querySelector('app-header').shadowRoot.querySelectorAll('img')].map((image) => image.src),
        }));
        expect(assets.base).toBe(deployment.base);
        for (const url of [assets.manifest, assets.icon, ...assets.images]) {
          expect(url.startsWith(deployment.url)).toBe(true);
          expect((await request.get(url)).status()).toBe(200);
        }
        expect(failed).toEqual([]);
      } finally { await context.close(); }
    });

    for (const nativeNavigation of [true, false]) {
      test(`links, refresh, history, and offline routing (${nativeNavigation ? 'Navigation API' : 'browser fallback'})`, async ({ browser }) => {
        const context = await browser.newContext();
        if (!nativeNavigation) {
          await context.addInitScript(() => Object.defineProperty(window, 'navigation', { value: undefined }));
        }
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        try {
          await page.goto(deployment.url);
          await expect(page.getByRole('textbox', { name: 'Note title', exact: true })).toBeVisible();
          await page.waitForFunction(() =>
            document.querySelector('app-index').shadowRoot.querySelector('app-notes').shadowRoot.querySelector('.save-state').textContent === 'Saved on this device');
          // Let the first install finish before rapid full-document traversals.
          // Cold visits without a worker are covered by the preceding test.
          await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15_000 });
          await page.getByRole('link', { name: 'About', exact: true }).click();
          await expect(page.getByRole('heading', { name: 'About Nimbus' })).toBeVisible();
          expect(page.url()).toBe(`${deployment.url}?view=about`);
          await page.goBack();
          await expect(page.getByRole('textbox', { name: 'Note title', exact: true })).toBeVisible();
          await expect(page.locator('app-header a[aria-current="page"]')).toHaveText('Notes');
          await page.goForward();
          await expect(page.getByRole('heading', { name: 'About Nimbus' })).toBeVisible();
          await page.reload();
          await expect(page.getByRole('heading', { name: 'About Nimbus' })).toBeVisible();
          await page.waitForFunction(() => !!navigator.serviceWorker.controller);
          const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
          expect(scope).toBe(deployment.url);
          const failed = [];
          page.on('requestfailed', (event) => failed.push(event.url()));
          await context.setOffline(true);
          await page.reload();
          await expect(page.getByRole('heading', { name: 'About Nimbus' })).toBeVisible();
          await page.getByRole('link', { name: 'Notes', exact: true }).click();
          await expect(page.getByRole('textbox', { name: 'Note title', exact: true })).toBeVisible();
          await page.getByRole('button', { name: 'Add sketch', exact: true }).click();
          await expect(page.locator('app-sketch canvas')).toBeVisible();
          await page.getByRole('button', { name: 'Cancel', exact: true }).click();
          await page.getByRole('button', { name: 'Add photo', exact: true }).click();
          await expect(page.locator('app-capture')).toBeVisible();
          expect(failed).toEqual([]);
          expect(errors).toEqual([]);
        } finally { await context.close(); }
      });
    }

    test('notebook media, saves, shortcuts, and share targets', async ({ page }) => {
      await page.goto(deployment.url);
      expect((await checkNotebook(page)).passed).toBe(true);
    });

    test('browser manifest identity and note notifications stay in the app scope', async ({ page, context }) => {
      await context.grantPermissions(['notifications'], { origin: new URL(deployment.url).origin });
      await page.goto(deployment.url);
      await expect(page.getByRole('textbox', { name: 'Note title', exact: true })).toBeVisible();
      await page.waitForFunction(() => !!navigator.serviceWorker.controller);
      const cdp = await context.newCDPSession(page);
      const { manifest, errors } = await cdp.send('Page.getAppManifest');
      expect(errors.filter((error) => error.critical)).toEqual([]);
      expect(manifest.id).toBe(deployment.url);
      expect(manifest.startUrl).toBe(deployment.url);
      expect(manifest.scope).toBe(deployment.url);
      await cdp.detach();
      // Capture the payload at the OS-delivery boundary. Headless Chromium can
      // grant page permission without allowing native notification delivery.
      await page.evaluate(() => {
        window.testNotifications = [];
        ServiceWorkerRegistration.prototype.showNotification = async function (title, options) {
          window.testNotifications.push({ title, ...options });
        };
      });
      await page.getByRole('button', { name: 'Note tools', exact: true }).click();
      await page.getByRole('button', { name: 'Notify me now', exact: true }).click();
      await expect(page.getByRole('status').filter({ hasText: 'Notification sent now' })).toBeVisible();
      const notifications = await page.evaluate(() => window.testNotifications);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].data).toMatch(new RegExp(`^${deployment.base}\\?note=`));
      expect(new URL(notifications[0].icon, deployment.url).href).toBe(`${deployment.url}assets/icons/icon_192.png`);
    });
  });
}
