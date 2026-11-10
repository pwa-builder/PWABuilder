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
