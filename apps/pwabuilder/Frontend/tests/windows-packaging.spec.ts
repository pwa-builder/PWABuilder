import { test, expect } from '@playwright/test';

for (const hasWidgets of [false, true]) {
  test(`Windows packaging omits deprecated Actions and preserves options (widgets: ${hasWidgets})`, async ({ page }) => {
    await page.route(url => url.pathname === '/', route =>
      route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body></body></html>' })
    );
    await page.goto('/');

    await page.evaluate(async hasWidgets => {
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
        screenshots: [],
        share_target: {
          action: '/share',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: { text: 'text' }
        },
        protocol_handlers: [{ protocol: 'web+example', url: '/open?url=%s' }],
        ...(hasWidgets ? { widgets: [] } : {})
      };
      const { setManifestContext } = await import('/src/script/services/app-info.ts');
      setManifestContext({
        siteUrl: 'https://example.com',
        manifestUrl: 'https://example.com/manifest.webmanifest',
        manifest,
        initialManifest: manifest,
        isGenerated: false,
        isEdited: false
      });
      const { WindowsForm } = await import('/src/script/components/windows-form.ts');
      const form = new WindowsForm();
      document.body.append(form);
      await form.updateComplete;
    }, hasWidgets);

    const form = page.locator('windows-form');
    await expect(form.locator('#package-id-input')).toHaveCount(1);
    await expect(form.locator('#actions-picker')).toHaveCount(0);
    await expect(form.locator('input[type="file"]')).toHaveCount(0);
    await expect(form.locator('#widget-checkbox')).toHaveJSProperty('checked', hasWidgets);
    await expect(form.locator('#widget-checkbox')).toHaveJSProperty('disabled', !hasWidgets);

    await form.locator('wa-details').evaluate(details => {
      details.setAttribute('open', '');
    });
    await form.locator('#app-uri-handler-checkbox').click();
    await form.locator('#device-family-input-team').click();

    const options = await page.evaluate(async () => {
      const { WindowsForm } = await import('/src/script/components/windows-form.ts');
      const form = document.querySelector('windows-form');
      if (!(form instanceof WindowsForm)) {
        throw new Error('Windows packaging form was not initialized');
      }
      return form.getPackageOptions();
    });
    expect(options).not.toHaveProperty('windowsActions');
    expect(options).toMatchObject({
      name: 'Example',
      packageId: 'MyCompany.ExampleApp',
      enableWebAppWidgets: hasWidgets,
      targetDeviceFamilies: ['Desktop', 'Holographic', 'Team']
    });
    expect(options).not.toHaveProperty('extensions', 'appurihandler');
  });
}
