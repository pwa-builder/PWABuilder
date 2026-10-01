import { test, expect } from '@playwright/test';

test('Android packaging defaults and Meta Quest toggles use minimum SDK 24', async ({ page }) => {
  // Load the real modules without starting site analysis or contacting packaging services.
  await page.route(url => url.pathname === '/', route =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body></body></html>' })
  );
  await page.goto('/');

  const sdkVersions = await page.evaluate(async () => {
    const { emptyAndroidPackageOptions, createAndroidPackageOptionsFromManifest } =
      await import('/src/script/services/publish/android-publish.ts');
    const manifest = {
      dir: 'auto' as const,
      display: 'standalone' as const,
      name: 'Example App',
      short_name: 'Example',
      start_url: '/',
      scope: '/',
      lang: 'en',
      description: 'Example description',
      theme_color: '#000000',
      background_color: '#ffffff',
      icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' }],
      screenshots: []
    };
    const manifestContext = {
      siteUrl: 'https://example.com',
      manifestUrl: 'https://example.com/manifest.webmanifest',
      manifest,
      initialManifest: manifest,
      isGenerated: false,
      isEdited: false
    };
    const { setManifestContext } = await import('/src/script/services/app-info.ts');
    setManifestContext(manifestContext);
    const { AndroidForm } = await import('/src/script/components/android-form.ts');
    const form = new AndroidForm();
    form.packageOptions = createAndroidPackageOptionsFromManifest(manifestContext);

    form.isMetaQuestChanged(true);
    const questEnabled = {
      minSdkVersion: form.packageOptions.minSdkVersion,
      isMetaQuest: form.packageOptions.isMetaQuest
    };
    form.isMetaQuestChanged(false);

    return {
      empty: emptyAndroidPackageOptions().minSdkVersion,
      manifest: createAndroidPackageOptionsFromManifest(manifestContext).minSdkVersion,
      questEnabled,
      questDisabled: {
        minSdkVersion: form.packageOptions.minSdkVersion,
        isMetaQuest: form.packageOptions.isMetaQuest
      }
    };
  });

  expect(sdkVersions).toEqual({
    empty: 24,
    manifest: 24,
    questEnabled: { minSdkVersion: 24, isMetaQuest: true },
    questDisabled: { minSdkVersion: 24, isMetaQuest: false }
  });
});
