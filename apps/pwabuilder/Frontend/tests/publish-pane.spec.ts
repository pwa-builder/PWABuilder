import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/publish-pane-test', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><html lang="en"><title>Publish pane test</title><body></body></html>',
  }));
  await page.goto('/publish-pane-test');
  await page.evaluate(async () => {
    const { setManifestContext } = await import('/src/script/services/app-info.ts');
    const manifest = {
      name: 'Example App',
      short_name: 'Example',
      start_url: '/',
      display: 'standalone' as const,
      icons: [],
      screenshots: [],
    };
    setManifestContext({
      siteUrl: 'https://example.com',
      manifestUrl: 'https://example.com/manifest.webmanifest',
      manifest,
      initialManifest: manifest,
      isGenerated: false,
      isEdited: false,
    });
    await import('/src/script/components/publish-pane.ts');
    const pane = document.createElement('publish-pane');
    document.body.append(pane);
    await pane.updateComplete;
    const dialog = pane.shadowRoot?.querySelector('wa-dialog');
    if (!dialog) {
      throw new Error('Publish dialog was not rendered.');
    }
    dialog.open = true;
    await dialog.updateComplete;
  });
});

for (const { store, operatingSystem, buttonId } of [
  { store: 'Microsoft Store', operatingSystem: 'Windows', buttonId: 'windows-package-button' },
  { store: 'Google Play', operatingSystem: 'Android', buttonId: 'android-package-button' },
  { store: 'iOS App Store', operatingSystem: 'iOS', buttonId: 'ios-package-button' },
]) {
  test(`Generate Package button identifies ${store} to screen readers`, async ({ page }) => {
    const button = page.locator(`#${buttonId}`);
    await expect(button).toBeVisible();
    await expect(button).toHaveText('Generate Package');
    await expect(page.getByRole('button', {
      name: `Generate package for ${store}`,
      exact: true,
    })).toHaveCount(1);
    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#form-area')).toHaveAttribute('data-store', operatingSystem);
    await expect(page.locator('#packaging-form')).toBeVisible();
  });
}
