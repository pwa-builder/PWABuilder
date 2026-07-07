import { test, expect, Page } from '@playwright/test';

let currentPage: Page | undefined;

// before each test
test.beforeEach(async ({ page }) => {
  currentPage = page;
  await page.goto('/');
});

// only run this test once
test('Ensure demo app can be packaged for Windows', async ({ page }) => {
  test.slow();

  const demoButton = page.locator('id=demo-action');

  // click demo button to start new test
  await demoButton.click();

  // wait for network to be done
  await page.waitForLoadState('networkidle');

  // our url should contain /reportcard
  await expect(page.url()).toContain('/reportcard');

  // wait for tests to end
  await page.waitForLoadState('networkidle');

  const packageButton = page.locator('id=pfs');

  // click package button
  await packageButton.click();

  const windowsPackageButton = page.locator('id=windows-package-button');

  // click windows package button
  await windowsPackageButton.click();

  // fill out form
  await page.fill('id=package-id-input', 'com.webboard.pwa');

  await page.fill('id=publisher-display-name-input', 'Contoso Inc.');

  await page.fill('id=publisher-id-input', 'CN=asdfasdfasdflkjlkjhlkjh');

  const generateButton = page.locator('id=generate-submit');
  // await generateButton.click();

  await expect(generateButton).toBeVisible();

  // wait on request to finish
  const pageRequest = page.waitForRequest('https://pwabuilder-windows-docker-dev.azurewebsites.net/msix/generatezip');
  await generateButton.click();
  const request = await pageRequest;

  // wait for response to finish
  const response = await request.response();

  if (response) {
    expect(response.status()).toBe(200);
  } else {
    throw new Error('Response was undefined');
  }
});

test('Ensure demo app can be packaged for Android', async ({ page }) => {
  test.slow();
  test.setTimeout(120000);

  const demoButton = page.locator('id=demo-action');

  // click demo button to start new test
  await demoButton.click();

  // wait for network to be done
  await page.waitForLoadState('networkidle');

  // our url should contain /reportcard
  await expect(page.url()).toContain('/reportcard');

  // wait for tests to end
  await page.waitForLoadState('networkidle');

  const packageButton = page.locator('id=pfs');

  // click package button
  await packageButton.click();

  const androidPackageButton = page.locator('id=android-package-button');

  // click windows package button
  await androidPackageButton.click();

  const generateButton = page.locator('id=generate-submit');

  await expect(generateButton).toBeVisible();

  const pageRequest = page.waitForRequest(
    'https://pwabuilder-cloudapk.azurewebsites.net/generateAppPackage'
  );
  await generateButton.click();
  const request = await pageRequest;

  const response = await request.response();

  if (response) {
    expect(response.status()).toBe(200);
  } else {
    throw new Error('Response was undefined');
  }
});

test('Ensure Windows Download Package button has visible focus indicator', async ({ page }) => {
  const demoButton = page.locator('id=demo-action');

  await demoButton.click();
  await page.waitForLoadState('networkidle');
  await expect(page.url()).toContain('/reportcard');
  await page.waitForLoadState('networkidle');

  await page.locator('id=pfs').click();
  await page.locator('id=windows-package-button').click();

  const generateButton = page.locator('id=generate-submit');
  await expect(generateButton).toBeVisible();
  await generateButton.focus();
  await expect(generateButton).toBeFocused();

  const outlineWidth = await generateButton.evaluate((element) => {
    const baseElement = element.shadowRoot?.querySelector('[part~="base"]');
    if (!baseElement) {
      return '';
    }

    return getComputedStyle(baseElement).outlineWidth;
  });

  expect(outlineWidth).toBe('2px');
});

test('Ensure Windows package dialog back button focus does not span the close button', async ({ page }) => {
  const headerMetrics = await page.evaluate(async () => {
    sessionStorage.setItem('current_url', 'https://example.com');
    sessionStorage.setItem(
      'PWABuilderManifest',
      JSON.stringify({
        siteUrl: 'https://example.com',
        manifestUrl: 'https://example.com/manifest.webmanifest',
        manifest: {
          dir: 'auto',
          display: 'standalone',
          name: 'Example App',
          short_name: 'Example',
          start_url: '/',
          scope: '/',
          lang: 'en',
          description: 'Example description',
          theme_color: '#000000',
          background_color: '#ffffff',
          icons: [],
          screenshots: []
        },
        initialManifest: {
          dir: 'auto',
          display: 'standalone',
          name: 'Example App',
          short_name: 'Example',
          start_url: '/',
          scope: '/',
          lang: 'en',
          description: 'Example description',
          theme_color: '#000000',
          background_color: '#ffffff',
          icons: [],
          screenshots: []
        },
        isGenerated: false,
        isEdited: false
      })
    );

    document.body.innerHTML = '<publish-pane></publish-pane>';
    await import('/src/script/components/publish-pane.ts');
    await customElements.whenDefined('publish-pane');

    const publishPane = document.querySelector('publish-pane') as HTMLElement & {
      selectedStore: string;
      cardsOrForm: boolean;
      updateComplete: Promise<void>;
    } | null;

    if (!publishPane) {
      return null;
    }

    publishPane.selectedStore = 'Windows';
    publishPane.cardsOrForm = false;
    await publishPane.updateComplete;

    const shadowRoot = publishPane.shadowRoot;
    const backButton = shadowRoot?.querySelector('#pp-form-header > button') as HTMLButtonElement | null;
    const dialog = shadowRoot?.querySelector('wa-dialog') as HTMLElement & {
      open: boolean;
      shadowRoot: ShadowRoot;
    } | null;
    const closeButton = dialog?.shadowRoot?.querySelector('[part~="close-button"]') as HTMLElement & {
      shadowRoot: ShadowRoot;
    } | null;
    const closeButtonBase = closeButton?.shadowRoot?.querySelector('[part~="base"]') as HTMLElement | null;

    if (!backButton || !dialog || !closeButtonBase || !shadowRoot) {
      return null;
    }

    dialog.open = true;
    await new Promise((resolve) => setTimeout(resolve, 50));
    backButton.focus();

    const backRect = backButton.getBoundingClientRect();
    const closeRect = closeButtonBase.getBoundingClientRect();

    return {
      backButtonFocused: shadowRoot.activeElement === backButton,
      backRect: {
        left: backRect.left,
        right: backRect.right,
        width: backRect.width
      },
      closeRect: {
        left: closeRect.left
      }
    };
  });

  expect(headerMetrics).not.toBeNull();
  expect(headerMetrics?.backButtonFocused).toBe(true);
  expect(headerMetrics!.backRect.right).toBeLessThan(headerMetrics!.closeRect.left);
  expect(headerMetrics!.backRect.width).toBeLessThan(100);
});

test('Ensure Windows package dialog initially focuses the Package ID field', async ({ page }) => {
  const focusState = await page.evaluate(async () => {
    sessionStorage.setItem('current_url', 'https://example.com');
    sessionStorage.setItem(
      'PWABuilderManifest',
      JSON.stringify({
        siteUrl: 'https://example.com',
        manifestUrl: 'https://example.com/manifest.webmanifest',
        manifest: {
          dir: 'auto',
          display: 'standalone',
          name: 'Example App',
          short_name: 'Example',
          start_url: '/',
          scope: '/',
          lang: 'en',
          description: 'Example description',
          theme_color: '#000000',
          background_color: '#ffffff',
          icons: [],
          screenshots: []
        },
        initialManifest: {
          dir: 'auto',
          display: 'standalone',
          name: 'Example App',
          short_name: 'Example',
          start_url: '/',
          scope: '/',
          lang: 'en',
          description: 'Example description',
          theme_color: '#000000',
          background_color: '#ffffff',
          icons: [],
          screenshots: []
        },
        isGenerated: false,
        isEdited: false
      })
    );

    document.body.innerHTML = '<publish-pane></publish-pane>';
    await import('/src/script/components/publish-pane.ts');
    await customElements.whenDefined('publish-pane');

    const publishPane = document.querySelector('publish-pane') as HTMLElement & {
      selectedStore: string;
      cardsOrForm: boolean;
      updateComplete: Promise<void>;
      shadowRoot: ShadowRoot;
    } | null;

    if (!publishPane) {
      return null;
    }

    const dialog = publishPane.shadowRoot?.querySelector('wa-dialog') as HTMLElement & {
      open: boolean;
    } | null;

    if (!dialog) {
      return null;
    }

    dialog.open = true;
    await new Promise((resolve) => setTimeout(resolve, 50));

    publishPane.selectedStore = 'Windows';
    publishPane.cardsOrForm = false;
    await publishPane.updateComplete;

    const windowsForm = publishPane.shadowRoot?.querySelector('windows-form#packaging-form') as HTMLElement & {
      updateComplete: Promise<void>;
      shadowRoot: ShadowRoot;
    } | null;

    if (!windowsForm) {
      return null;
    }

    await windowsForm.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 50));

    const packageIdInput = windowsForm.shadowRoot?.getElementById('package-id-input') as HTMLElement & {
      shadowRoot?: ShadowRoot;
    } | null;
    const internalInput = packageIdInput?.shadowRoot?.querySelector('input') as HTMLInputElement | null;

    return {
      packageIdFocused: packageIdInput?.matches(':focus') ?? false,
      internalInputFocused: internalInput === packageIdInput?.shadowRoot?.activeElement
    };
  });

  expect(focusState).not.toBeNull();
  expect(focusState?.packageIdFocused || focusState?.internalInputFocused).toBe(true);
});
