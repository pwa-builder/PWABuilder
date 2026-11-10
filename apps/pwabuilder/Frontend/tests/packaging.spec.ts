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

test('Package for Stores dialog locks scrolling and closes on backdrop click', async ({ page }) => {
  const demoButton = page.locator('id=demo-action');

  await demoButton.click();
  await page.waitForLoadState('networkidle');
  await expect(page.url()).toContain('/reportcard');
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => window.scrollTo(0, 500));
  const initialScrollPosition = await page.evaluate(() => window.scrollY);

  await page.evaluate(() => {
    const appReport = document.querySelector('app-index')?.shadowRoot?.querySelector('app-report') as {
      openPublishModal?: () => void;
    } | null;

    appReport?.openPublishModal?.();
  });

  await expect.poll(async () => {
    return page.evaluate(() => {
      const appReport = document.querySelector('app-index')?.shadowRoot?.querySelector('app-report');
      const dialog = appReport?.shadowRoot
        ?.querySelector('publish-pane')
        ?.shadowRoot
        ?.querySelector('.dialog') as { open?: boolean } | null;

      return dialog?.open ?? false;
    });
  }).toBe(true);

  await expect.poll(async () => {
    return page.evaluate(() => document.documentElement.classList.contains('wa-scroll-lock'));
  }).toBe(true);

  await page.mouse.wheel(0, 500);
  await expect.poll(async () => {
    const currentScrollY = await page.evaluate(() => window.scrollY);
    return Math.abs(currentScrollY - initialScrollPosition);
  }).toBeLessThan(2);
  await page.mouse.click(20, 20);

  await expect.poll(async () => {
    return page.evaluate(() => {
      const appReport = document.querySelector('app-index')?.shadowRoot?.querySelector('app-report');
      const dialog = appReport?.shadowRoot
        ?.querySelector('publish-pane')
        ?.shadowRoot
        ?.querySelector('.dialog') as { open?: boolean } | null;

      return dialog?.open ?? false;
    });
  }).toBe(false);

  await expect.poll(async () => {
    return page.evaluate(() => document.documentElement.classList.contains('wa-scroll-lock'));
  }).toBe(false);
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

test('App URI Handler is disabled by default for URLs containing double hyphens', async ({ page }) => {
  const appUriHandlerEnabled = await page.evaluate(async () => {
    const siteUrl = 'https://studio--studio-2987697784-ae82f.us-central1.hosted.app';
    const manifestContext = {
      siteUrl,
      manifestUrl: `${siteUrl}/manifest.webmanifest`,
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
    };

    sessionStorage.setItem('current_url', siteUrl);
    sessionStorage.setItem('PWABuilderManifest', JSON.stringify(manifestContext));
    await import('/src/script/components/windows-form.ts');
    await customElements.whenDefined('windows-form');

    document.body.innerHTML = '<windows-form></windows-form>';
    const windowsForm = document.querySelector('windows-form') as HTMLElement & {
      updateComplete: Promise<void>;
      shadowRoot: ShadowRoot;
    } | null;

    if (!windowsForm) {
      return null;
    }

    await windowsForm.updateComplete;
    const checkbox = windowsForm.shadowRoot?.querySelector('#app-uri-handler-checkbox') as {
      checked: boolean;
    } | null;

    return checkbox?.checked ?? null;
  });

  expect(appUriHandlerEnabled).toBe(false);
});

test('Google Play packaging status shows host blocking help for 403 analysis failures', async ({ page }) => {
  const hostBlockingState = await page.evaluate(async () => {
    document.body.innerHTML = '<google-play-packaging-status></google-play-packaging-status>';
    await import('/src/script/pages/google-play-packaging-status.ts');
    await customElements.whenDefined('google-play-packaging-status');

    const statusPage = document.querySelector('google-play-packaging-status') as HTMLElement & {
      hasFailed: boolean;
      logs: string[];
      updateComplete: Promise<void>;
      shadowRoot: ShadowRoot;
    } | null;

    if (!statusPage) {
      return null;
    }

    statusPage.hasFailed = true;
    statusPage.logs = [
      '[warn]: For more help, see https://docs.pwabuilder.com/#/builder/faq?id=error-403-forbidden-during-analysis-or-packaging'
    ];
    (statusPage as any).appendForbiddenAnalysisFailureLog();
    await statusPage.updateComplete;

    const pageTitle = statusPage.shadowRoot?.querySelector('.page-title')?.textContent?.trim() ?? '';
    const footerButtons = Array.from(statusPage.shadowRoot?.querySelectorAll('.card-footer wa-button') ?? []);
    const reportBugButtonExists = footerButtons.some(button => button.textContent?.trim() === 'Report a bug');
    const helpButton = footerButtons.find(button => button.textContent?.trim() === 'Show me how to fix this');

    return {
      pageTitle,
      reportBugButtonExists,
      helpButtonHref: helpButton?.getAttribute('href') ?? '',
      hasBlockingErrorLog: statusPage.logs.some(log => log.includes("Your web app is blocking PWABuilder from accessing your app's images"))
    };
  });

  expect(hostBlockingState).not.toBeNull();
  expect(hostBlockingState?.pageTitle).toBe('Your web host is blocking PWABuilder');
  expect(hostBlockingState?.reportBugButtonExists).toBe(false);
  expect(hostBlockingState?.helpButtonHref).toBe(
    'https://docs.pwabuilder.com/#/builder/faq?id=error-403-forbidden-during-analysis-or-packaging'
  );
  expect(hostBlockingState?.hasBlockingErrorLog).toBe(true);
});

async function runGooglePlayDownloadScenario(page: Page, failedAttempts: number) {
  const jobId = 'googleplaypackagejob:example.com:retry-test';
  let downloadAttempts = 0;
  await page.route('**/api/packaging/config', route => route.fulfill({
    json: { androidPackageGeneratorUrl: 'https://pwabuilder-cloudapk.azurewebsites.net' }
  }));
  await page.route('https://pwabuilder-cloudapk.azurewebsites.net/downloadPackageZip**', route => {
    downloadAttempts++;
    return downloadAttempts <= failedAttempts
      ? route.abort('connectionreset')
      : route.fulfill({
        status: 200,
        contentType: 'application/zip',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: 'zip'
      });
  });

  const states = await page.evaluate(async (id) => {
    localStorage.setItem(`package-owner:${id}`, 'a'.repeat(43));
    document.body.innerHTML = '<google-play-packaging-status></google-play-packaging-status>';
    await import('/src/script/pages/google-play-packaging-status.ts');
    await customElements.whenDefined('google-play-packaging-status');

    const statusPage = document.querySelector('google-play-packaging-status') as any;
    const job = {
      id,
      supportReference: null,
      pwaUrl: 'https://example.com',
      analysisId: null,
      status: 'Completed',
      createdAt: new Date().toISOString(),
      retryCount: 0,
      name: 'Example',
      logs: [],
      errors: [],
      downloadAvailable: true
    };
    statusPage.job = job;
    statusPage.autoDownloadRetryDelayMs = 0;
    statusPage.downloadBlob = () => { };

    const snapshot = async () => {
      await statusPage.updateComplete;
      const buttons = Array.from(statusPage.shadowRoot.querySelectorAll('.card-footer wa-button')) as HTMLElement[];
      return {
        title: statusPage.shadowRoot.querySelector('.page-title')?.textContent?.trim() ?? '',
        hasRetryButton: buttons.some(b => b.textContent?.trim() === 'Retry download'),
        lastLog: statusPage.logs[statusPage.logs.length - 1] as string
      };
    };

    await statusPage.jobCompleted(job);
    const afterCompletion = await snapshot();
    let afterManualRetry = null;
    if (afterCompletion.hasRetryButton) {
      await statusPage.retryDownload();
      afterManualRetry = await snapshot();
    }
    return { afterCompletion, afterManualRetry };
  }, jobId);

  return { downloadAttempts, ...states };
}

test('Google Play packaging status automatically retries a failed package download', async ({ page }) => {
  const result = await runGooglePlayDownloadScenario(page, 1);

  expect(result.downloadAttempts).toBe(2);
  expect(result.afterCompletion.title).toBe('Package created successfully');
  expect(result.afterCompletion.hasRetryButton).toBe(false);
  expect(result.afterCompletion.lastLog).toBe('Package created successfully. Download has begun.');
});

test('Google Play packaging status shows Retry download after the automatic retry fails', async ({ page }) => {
  const result = await runGooglePlayDownloadScenario(page, 2);

  expect(result.afterCompletion.title).toBe('Package created, but the download failed');
  expect(result.afterCompletion.hasRetryButton).toBe(true);
  expect(result.downloadAttempts).toBe(3);
  expect(result.afterManualRetry?.title).toBe('Package created successfully');
  expect(result.afterManualRetry?.hasRetryButton).toBe(false);
  expect(result.afterManualRetry?.lastLog).toBe('Package created successfully. Download has begun.');
});

test('Windows, Android, and iOS app names allow ampersands and colons', async ({ page }) => {
  const validationResults = await page.evaluate(async () => {
    const siteUrl = 'https://example.com';
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
      icons: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }
      ],
      screenshots: []
    };

    const manifestContext = {
      siteUrl,
      manifestUrl: `${siteUrl}/manifest.webmanifest`,
      manifest,
      initialManifest: manifest,
      isGenerated: false,
      isEdited: false
    };
    const { setManifestContext } = await import('/src/script/services/app-info.ts');
    setManifestContext(manifestContext);

    const formDefinitions = [
      {
        store: 'Windows',
        tagName: 'windows-form',
        modulePath: '/src/script/components/windows-form.ts',
        inputId: 'app-name-input'
      },
      {
        store: 'Android',
        tagName: 'android-form',
        modulePath: '/src/script/components/android-form.ts',
        inputId: 'app-name-input'
      },
      {
        store: 'iOS',
        tagName: 'ios-form',
        modulePath: '/src/script/components/ios-form.ts',
        inputId: 'appNameInput'
      }
    ] as const;

    const results: Array<{
      store: string;
      acceptsCustomerName: boolean;
      rejectsBlacklistedName: boolean;
    }> = [];

    for (const definition of formDefinitions) {
      await import(definition.modulePath);
      await customElements.whenDefined(definition.tagName);
      document.body.innerHTML = `<${definition.tagName}></${definition.tagName}>`;

      const form = document.querySelector(definition.tagName) as HTMLElement & {
        updateComplete: Promise<void>;
        shadowRoot: ShadowRoot;
      } | null;

      if (!form) {
        throw new Error(`Unable to render the ${definition.store} packaging form.`);
      }

      await form.updateComplete;
      await new Promise((resolve) => setTimeout(resolve, 50));

      const input = form.shadowRoot.getElementById(definition.inputId) as HTMLElement & {
        value: string;
        checkValidity(): boolean;
        updateComplete: Promise<void>;
      } | null;

      if (!input) {
        throw new Error(`Unable to find the ${definition.store} app-name input.`);
      }

      input.value = 'Fandango: Movies & Series';
      await input.updateComplete;
      const acceptsCustomerName = input.checkValidity();

      input.value = 'Fandango | Movies';
      await input.updateComplete;
      const rejectsBlacklistedName = !input.checkValidity();

      results.push({
        store: definition.store,
        acceptsCustomerName,
        rejectsBlacklistedName
      });
    }

    return results;
  });

  expect(validationResults).toEqual([
    {
      store: 'Windows',
      acceptsCustomerName: true,
      rejectsBlacklistedName: true
    },
    {
      store: 'Android',
      acceptsCustomerName: true,
      rejectsBlacklistedName: true
    },
    {
      store: 'iOS',
      acceptsCustomerName: true,
      rejectsBlacklistedName: true
    }
  ]);
});
