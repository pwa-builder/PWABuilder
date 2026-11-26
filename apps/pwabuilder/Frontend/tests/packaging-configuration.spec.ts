import { expect, test } from '@playwright/test';

test('enqueue, polling and download use destination-slot config and share access with a new tab', async ({ page, context }) => {
  const staging = 'https://pwabuilder-cloudapk-staging.azurewebsites.net';
  const production = 'https://pwabuilder-cloudapk.azurewebsites.net';
  let endpoint = staging;
  let unavailable = false;
  let configRequests = 0;
  const packagingRequests: string[] = [];
  const receipt = {
    id: 'googleplaypackagejob:example.com:offline-job',
    supportReference: 'bb16f976-b71c-4658-8d83-1e1a36dc0abc',
    accessToken: 'a'.repeat(43),
  };
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === 'http://127.0.0.1:5180') {
      if (url.pathname === '/packaging-test') {
        await route.fulfill({ contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>' });
      } else if (url.pathname === '/api/packaging/config') {
        configRequests++;
        await route.fulfill({
          status: unavailable ? 503 : 200,
          headers: { 'cache-control': 'no-store' },
          json: { androidPackageGeneratorUrl: endpoint },
        });

      } else {
        await route.continue();
      }
      return;
    }
    if (url.origin !== staging && url.origin !== production) {
      await route.abort();
      throw new Error('Unexpected external request in offline packaging test.');
    }
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    };
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
      return;
    }
    packagingRequests.push(url.origin + url.pathname);
    if (url.pathname === '/enqueuePackageJob') {
      await route.fulfill({ headers, json: receipt });
    } else {
      expect(route.request().headers().authorization).toBe(`Bearer ${receipt.accessToken}`);
      await route.fulfill({
        headers,
        json: url.pathname === '/getPackageJob' ? { id: receipt.id, status: 'Completed' } : { zip: 'synthetic' },
      });
    }
  });
  await page.goto('/packaging-test');
  const exercise = async (): Promise<void> => {
    await page.evaluate(async () => {
      const modulePath = '/src/script/services/publish/android-publish.ts';
      const packaging = await import(/* @vite-ignore */ modulePath);
      const options = {
        ...packaging.emptyAndroidPackageOptions(),
        name: 'Example app', launcherName: 'Example app', packageId: 'com.example.app',
        host: 'example.com', iconUrl: 'https://example.com/icon.png',
        webManifestUrl: 'https://example.com/manifest.json', pwaUrl: 'https://example.com',
        startUrl: '/',
      };
      const id = await packaging.enqueueGooglePlayPackageJob(options);
      await packaging.getGooglePlayPackageJob(id);
      await packaging.downloadGooglePlayPackageZip(id);
    });
  };
  await exercise();
  endpoint = production;
  await exercise();
  expect(configRequests).toBe(6);
  expect(packagingRequests).toEqual([staging, production].flatMap(origin => [
    origin + '/enqueuePackageJob', origin + '/getPackageJob', origin + '/downloadPackageZip',
  ]));
  const newTab = await context.newPage();
  await newTab.goto('/packaging-test');
  await newTab.evaluate(async ({ id, supportReference }) => {
    if (sessionStorage.getItem(`package-owner:${id}`) !== null) {
      throw new Error('A new tab must not depend on inherited session storage.');
    }
    if (localStorage.getItem(`package-support:${id}`) !== supportReference) {
      throw new Error('The support reference must be available across tabs.');
    }
    const modulePath = '/src/script/services/publish/android-publish.ts';
    const packaging = await import(/* @vite-ignore */ modulePath);
    await packaging.getGooglePlayPackageJob(id);
    await packaging.downloadGooglePlayPackageZip(id);
  }, { id: receipt.id, supportReference: receipt.supportReference });
  expect(packagingRequests.slice(-2)).toEqual([
    production + '/getPackageJob', production + '/downloadPackageZip',
  ]);
  await newTab.close();
  unavailable = true;
  await expect(exercise()).rejects.toThrow('configuration is unavailable');
  expect(packagingRequests).toHaveLength(8);
});

for (const failedAttempts of [1, 2]) {
  test(`download diagnostics preserve retries and report browser handoff after ${failedAttempts} failures`, async ({
    page,
  }) => {
    const events: Record<string, unknown>[] = [];
    let downloads = 0;
    await page.route('**/packaging-test', (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>',
      })
    );
    await page.route('**/api/packaging/config', (route) =>
      route.fulfill({
        json: {
          androidPackageGeneratorUrl:
            'https://pwabuilder-cloudapk.azurewebsites.net',
        },
      })
    );
    await page.route(
      'https://pwabuilder-cloudapk.azurewebsites.net/**',
      async (route) => {
        const request = route.request();
        const headers = {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
        };
        if (request.method() === 'OPTIONS') {
          await route.fulfill({ status: 204, headers });
        } else if (
          new URL(request.url()).pathname === '/packageJobDiagnostics'
        ) {
          expect(request.headers().authorization).toBe(
            `Bearer ${'a'.repeat(43)}`
          );
          events.push(...request.postDataJSON());
          await route.fulfill({ status: 204, headers });
        } else {
          downloads++;
          await route.fulfill({
            status: downloads <= failedAttempts ? 503 : 200,
            headers,
            contentType: 'application/zip',
            body: 'zip',
          });
        }
      }
    );
    await page.goto('/packaging-test');
    await page.evaluate(async () => {
      const modulePath = '/src/script/pages/google-play-packaging-status.ts';
      await import(/* @vite-ignore */ modulePath);
      const element = document.createElement('google-play-packaging-status');
      document.body.append(element);
      const id = 'googleplaypackagejob:example.com:diagnostics';
      localStorage.setItem(`package-owner:${id}`, 'a'.repeat(43));
      Reflect.set(element, 'job', {
        id,
        supportReference: 'bb16f976-b71c-4658-8d83-1e1a36dc0abc',
        pwaUrl: 'https://example.com',
        analysisId: null,
        status: 'Completed',
        createdAt: new Date().toISOString(),
        retryCount: 0,
        name: 'Example',
        logs: [],
        errors: [],
        downloadAvailable: true,
      });
      Reflect.set(element, 'autoDownloadRetryDelayMs', 0);
      await Reflect.get(element, 'jobCompleted').call(
        element,
        Reflect.get(element, 'job')
      );
    });
    if (failedAttempts === 2) {
      await page
        .getByRole('button', { name: 'Retry download', exact: true })
        .click();
    }
    await expect
      .poll(() => events.map((event) => event.event))
      .toContain('download-handoff');
    expect(downloads).toBe(failedAttempts + 1);
    expect(
      events.filter((event) => event.event === 'download-retry')
    ).toHaveLength(failedAttempts);
    expect(
      events.some(
        (event) =>
          event.event === 'download-failed' &&
          event.status === 503 &&
          event.phase === 'response'
      )
    ).toBe(true);
    expect(
      events.some(
        (event) => event.event === 'download-body-read' && event.bytes === 3
      )
    ).toBe(true);
    expect(JSON.stringify(events)).not.toContain('a'.repeat(43));
    expect(JSON.stringify(events)).not.toContain('https://');
  });
}

test('polling diagnostics include phase and page lifecycle context before download starts', async ({ page }) => {
  const events: Record<string, unknown>[] = [];
  await page.route('**/packaging-test', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>'
  }));
  await page.route('**/api/packaging/config', route => route.fulfill({
    json: { androidPackageGeneratorUrl: 'https://pwabuilder-cloudapk.azurewebsites.net' }
  }));
  await page.route('https://pwabuilder-cloudapk.azurewebsites.net/**', async route => {
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
    } else if (new URL(route.request().url()).pathname === '/packageJobDiagnostics') {
      events.push(...route.request().postDataJSON());
      await route.fulfill({ status: 204, headers });
    } else {
      await route.fulfill({ status: 503, headers });
    }
  });
  await page.goto('/packaging-test');
  await page.evaluate(async () => {
    const modulePath = '/src/script/pages/google-play-packaging-status.ts';
    await import(/* @vite-ignore */ modulePath);
    const id = 'googleplaypackagejob:example.com:poll-diagnostics';
    localStorage.setItem(`package-owner:${id}`, 'a'.repeat(43));
    const element = document.createElement('google-play-packaging-status');
    document.body.append(element);
    Reflect.set(element, 'jobId', id);
    Reflect.set(element, 'pollQueryErrorCount', 1);
    await Reflect.get(element, 'pollJob').call(element, id);
    window.dispatchEvent(new ErrorEvent('error', { error: new TypeError('secret-marker?accessToken=do-not-log') }));
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('pagehide'));
  });
  await expect.poll(() => events.map(event => event.event)).toContain('page-left');
  expect(events.some(event => event.event === 'poll-failed' && event.status === 503 && event.phase === 'response')).toBe(true);
  expect(events.some(event => event.event === 'poll-stopped')).toBe(true);
  expect(events.some(event => event.event === 'offline')).toBe(true);
  expect(events.some(event => event.event === 'client-error' && event.errorName === 'TypeError')).toBe(true);
  expect(JSON.stringify(events)).not.toContain('secret-marker');
});

test('polling recovers after consecutive configuration network failures', async ({ page }) => {
  let failuresRemaining = 0;
  let statusRequests = 0;
  const events: Record<string, unknown>[] = [];
  await page.route('**/packaging-test', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>'
  }));
  await page.route('**/api/packaging/config', async route => {
    if (failuresRemaining > 0) {
      failuresRemaining--;
      await route.abort('failed');
    } else {
      await route.fulfill({ json: { androidPackageGeneratorUrl: 'https://pwabuilder-cloudapk.azurewebsites.net' } });
    }
  });
  await page.route('https://pwabuilder-cloudapk.azurewebsites.net/**', async route => {
    const request = route.request();
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    const path = new URL(request.url()).pathname;
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
    } else if (path === '/packageJobDiagnostics') {
      events.push(...request.postDataJSON());
      await route.fulfill({ status: 204, headers });
    } else if (path === '/getPackageJob') {
      statusRequests++;
      const status = statusRequests === 1 ? 'InProgress' : 'Completed';
      if (status === 'InProgress') failuresRemaining = 2;
      await route.fulfill({ headers, json: {
        id: 'googleplaypackagejob:example.com:recovery',
        supportReference: 'bb16f976-b71c-4658-8d83-1e1a36dc0abc',
        pwaUrl: 'https://example.com', analysisId: null, status,
        createdAt: new Date().toISOString(), retryCount: 0, name: 'Example',
        logs: [], errors: [], downloadAvailable: true,
      } });
    } else {
      await route.fulfill({ headers, contentType: 'application/zip', body: 'zip' });
    }
  });
  await page.goto('/packaging-test');
  await page.evaluate(async () => {
    const modulePath = '/src/script/pages/google-play-packaging-status.ts';
    await import(/* @vite-ignore */ modulePath);
    const id = 'googleplaypackagejob:example.com:recovery';
    localStorage.setItem(`package-owner:${id}`, 'a'.repeat(43));
    const element = document.createElement('google-play-packaging-status');
    Reflect.set(element, 'pollIntervalMs', 100);
    Reflect.set(element, 'pollQueryRetryDelayMs', 100);
    Reflect.set(element, 'jobId', id);
    document.body.append(element);
  });
  await expect(page.getByText('Package created successfully', { exact: true })).toBeVisible({ timeout: 5000 });
  await expect.poll(() => events.filter(event =>
    event.event === 'poll-failed' && event.phase === 'configuration' && event.errorName === 'TypeError'
  ).length).toBe(2);
  expect(events.some(event => event.event === 'poll-stopped')).toBe(false);
  expect(statusRequests).toBe(2);
});

test('polling stops retrying configuration failures at the deadline', async ({ page }) => {
  let configRequests = 0;
  await page.route('**/packaging-test', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>'
  }));
  await page.route('**/api/packaging/config', async route => {
    configRequests++;
    await route.abort('failed');
  });
  await page.goto('/packaging-test');
  await page.evaluate(async () => {
    const modulePath = '/src/script/pages/google-play-packaging-status.ts';
    await import(/* @vite-ignore */ modulePath);
    const element = document.createElement('google-play-packaging-status');
    Reflect.set(element, 'pollIntervalMs', 10);
    Reflect.set(element, 'pollQueryRetryDelayMs', 50);
    Reflect.set(element, 'maxWaitTimeMs', 300);
    Reflect.set(element, 'jobId', 'googleplaypackagejob:example.com:timeout');
    document.body.append(element);
  });
  await expect(page.getByText('Timed out waiting for Google Play packaging job to complete.', { exact: false })).toBeVisible();
  const requestsAtTimeout = configRequests;
  expect(requestsAtTimeout).toBeGreaterThan(2);
  await page.waitForTimeout(300);
  expect(configRequests).toBe(requestsAtTimeout);
});

test('a late status response cannot complete a timed-out job', async ({ page }) => {
  let downloads = 0;
  await page.route('**/packaging-test', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>'
  }));
  await page.route('**/api/packaging/config', route => route.fulfill({
    json: { androidPackageGeneratorUrl: 'https://pwabuilder-cloudapk.azurewebsites.net' }
  }));
  await page.route('https://pwabuilder-cloudapk.azurewebsites.net/**', async route => {
    const request = route.request();
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    const path = new URL(request.url()).pathname;
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
    } else if (path === '/getPackageJob') {
      await new Promise(resolve => setTimeout(resolve, 600));
      await route.fulfill({ headers, json: {
        id: 'googleplaypackagejob:example.com:late', supportReference: null,
        pwaUrl: 'https://example.com', analysisId: null, status: 'Completed',
        createdAt: new Date().toISOString(), retryCount: 0, name: 'Example',
        logs: [], errors: [], downloadAvailable: true,
      } });
    } else {
      if (path === '/downloadPackageZip') downloads++;
      await route.fulfill({ status: 204, headers });
    }
  });
  await page.goto('/packaging-test');
  await page.evaluate(async () => {
    const modulePath = '/src/script/pages/google-play-packaging-status.ts';
    await import(/* @vite-ignore */ modulePath);
    const id = 'googleplaypackagejob:example.com:late';
    localStorage.setItem(`package-owner:${id}`, 'a'.repeat(43));
    const element = document.createElement('google-play-packaging-status');
    Reflect.set(element, 'pollIntervalMs', 10);
    Reflect.set(element, 'maxWaitTimeMs', 250);
    Reflect.set(element, 'jobId', id);
    document.body.append(element);
  });
  await expect(page.getByText('Timed out waiting for Google Play packaging job to complete.', { exact: false })).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page.getByText('Package created successfully', { exact: true })).toHaveCount(0);
  expect(downloads).toBe(0);
});

test('failed diagnostics retain a bounded queue and flush after reporting resumes', async ({ page }) => {
  const events: Record<string, unknown>[] = [];
  let diagnosticsAvailable = false;
  await page.route('**/packaging-test', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>'
  }));
  await page.route('**/api/packaging/config', route => route.fulfill({
    json: { androidPackageGeneratorUrl: 'https://pwabuilder-cloudapk.azurewebsites.net' }
  }));
  await page.route('https://pwabuilder-cloudapk.azurewebsites.net/**', async route => {
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
    } else if (diagnosticsAvailable) {
      events.push(...route.request().postDataJSON());
      await route.fulfill({ status: 204, headers });
    } else {
      await route.fulfill({ status: 503, headers });
    }
  });
  await page.goto('/packaging-test');
  await page.evaluate(async () => {
    const modulePath = '/src/script/utils/package-delivery-diagnostics.ts';
    const { PackageDeliveryDiagnostics } = await import(/* @vite-ignore */ modulePath);
    const id = 'googleplaypackagejob:example.com:queued-diagnostics';
    localStorage.setItem(`package-owner:${id}`, 'a'.repeat(43));
    const diagnostics = new PackageDeliveryDiagnostics(id);
    Reflect.set(window, 'testDiagnostics', diagnostics);
    for (let count = 0; count < 65; count++) {
      diagnostics.report('download-started', { attempt: count });
    }
  });
  await expect.poll(() => page.evaluate(() => Reflect.get(window, 'testDiagnostics').flushing)).toBe(false);
  diagnosticsAvailable = true;
  await page.evaluate(() => Reflect.get(window, 'testDiagnostics').report('online'));
  await expect.poll(() => events.length).toBe(60);
  expect(events[0].attempt).toBe(0);
  expect(events[59].attempt).toBe(59);
});

test('body-read failures keep their phase and HTTP status without exposing the exception text', async ({ page }) => {
  await page.route('**/packaging-test', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html lang="en"><title>Packaging test</title><body></body></html>'
  }));
  await page.route('**/api/packaging/config', route => route.fulfill({
    json: { androidPackageGeneratorUrl: 'https://pwabuilder-cloudapk.azurewebsites.net' }
  }));
  await page.goto('/packaging-test');
  const details = await page.evaluate(async () => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      if (String(args[0]).includes('/downloadPackageZip')) {
        return new Response(new ReadableStream({
          start(controller) { controller.error(new TypeError('secret-marker?accessToken=do-not-log')); }
        }), { status: 200 });
      }
      return originalFetch(...args);
    };
    try {
      const publishPath = '/src/script/services/publish/android-publish.ts';
      const diagnosticsPath = '/src/script/utils/package-delivery-diagnostics.ts';
      const { downloadGooglePlayPackageZip } = await import(/* @vite-ignore */ publishPath);
      const { packageFailureDetails } = await import(/* @vite-ignore */ diagnosticsPath);
      const id = 'googleplaypackagejob:example.com:body-failure';
      localStorage.setItem(`package-owner:${id}`, 'a'.repeat(43));
      try {
        await downloadGooglePlayPackageZip(id);
        throw new Error('Expected the body read to fail.');
      } catch (error) {
        return packageFailureDetails(error);
      }
    } finally {
      window.fetch = originalFetch;
    }
  });
  expect(details).toEqual({ phase: 'body', status: 200, errorName: 'TypeError' });
});
