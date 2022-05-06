const { test, expect } = require('@playwright/test');

test('known good pwa Windows package generation test', async ({ page }) => {
  // this test can run long
  test.slow();

  // open PWABuilder and enter a PWA into the start input
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  const input = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#input-block > fast-text-field").shadowRoot.querySelector("#control")`
  );
  await input.focus();
  await input.type('https://webboard.app');

  // click the start button
  const start_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#start-button")`
  );
  await start_button.click();

  // waiting for the report-card page which is where
  // we should end up with a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('reportcard'),
  });

  // checking that we ended up on the reportcard page
  // with the PWA badge
  expect(await page.isVisible('text=You have a great PWA!')).toBeTruthy();

  // click next button on the report-card page
  const next_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#overview-panel > report-card").shadowRoot.querySelector("#package-block > app-button").shadowRoot.querySelector("fast-button")`
  );
  await next_button.click();

  // waiting for the publish page which is where
  // we should end up with a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('publish'),
  });

  // checking were on the publish page
  expect(await page.isVisible('text=Publish your PWA to stores')).toBeTruthy();

  // click generate button for the Windows platform
  const generate_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-publish").shadowRoot.querySelector("#test-package-button").shadowRoot.querySelector("app-button").shadowRoot.querySelector("fast-button").shadowRoot.querySelector("button")`
  );
  await generate_button.click();

  // waiting on reponse from the Windows generator
  const response = await page.waitForResponse(
    response =>
      response.url() ===
        'https://pwabuilder-win-chromium-platform.centralus.cloudapp.azure.com/msix/generatezip' &&
      response.status() === 200
  );

  // we generated a package if this is truthy
  expect(response !== undefined).toBeTruthy();
});

// same test as above, but with Twitter this time to ensure
// that the flow works on a partner PWA
test('public pwa Windows package generation test', async ({ page }) => {
  // this test can run long
  test.slow();

  // open PWABuilder and enter a PWA into the start input
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  const input = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#input-block > fast-text-field").shadowRoot.querySelector("#control")`
  );
  await input.focus();
  await input.type('https://twitter.com');

  // click the start button
  const start_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#start-button")`
  );
  await start_button.click();

  // waiting for the report-card page which is where
  // we should end up with a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('reportcard'),
  });

  // checking that we ended up on the reportcard page
  // with the PWA badge
  expect(await page.isVisible('text=You have a great PWA!')).toBeTruthy();

  // click next button on the report-card page
  const next_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#overview-panel > report-card").shadowRoot.querySelector("#package-block > app-button").shadowRoot.querySelector("fast-button")`
  );
  await next_button.click();

  // waiting for the publish page which is where
  // we should end up with a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('publish'),
  });

  // checking were on the publish page
  expect(await page.isVisible('text=Publish your PWA to stores')).toBeTruthy();

  // click generate button for the Windows platform
  const generate_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-publish").shadowRoot.querySelector("#test-package-button").shadowRoot.querySelector("app-button").shadowRoot.querySelector("fast-button").shadowRoot.querySelector("button")`
  );
  await generate_button.click();

  // waiting on reponse from the Windows generator
  const response = await page.waitForResponse(
    response =>
      response.url() ===
        'https://pwabuilder-win-chromium-platform.centralus.cloudapp.azure.com/msix/generatezip' &&
      response.status() === 200
  );

  // we generated a package if this is truthy
  expect(response !== undefined).toBeTruthy();
});
