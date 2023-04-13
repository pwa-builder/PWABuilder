const { test, expect } = require('@playwright/test');

test('known not-a-pwa base_package generation test', async ({ page }) => {
  // this test can run long
  test.slow();

  // open PWABuilder and enter MSN (not a PWA) into the start input
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  const input = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#input-block > fast-text-field").shadowRoot.querySelector("#control")`
  );
  await input.focus();
  await input.type('https://www.example.com');

  // click the start button
  const start_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#start-button")`
  );
  await start_button.click();

  // waiting for the report-card page which is where
  // we should end up with not a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('reportcard'),
  });

  // checking that we ended up on the reportcard page
  // with the needs work badge / prompt
  expect(
    await page.isVisible(
      'text=Your PWA needs more work, look above for details.'
    )
  ).toBeTruthy();

  // click next button on the report-card page
  const next_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#overview-panel > report-card").shadowRoot.querySelector("#package-block > app-button").shadowRoot.querySelector("fast-button")`
  );
  await next_button.click();

  // waiting for the base_package page which is where
  // we should end up with not a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('basepackage'),
  });

  // checking were on the base_package page
  expect(await page.isVisible('text=Make your app a PWA')).toBeTruthy();

  // click generate button for the base_package platform
  const generate_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-basepack").shadowRoot.querySelector("#download-actions > loading-button").shadowRoot.querySelector("app-button").shadowRoot.querySelector("fast-button")`
  );
  await generate_button.click();

  // waiting on reponse from the base_package generator
  const response = await page.waitForResponse(
    response =>
      response.url() ===
        'https://pwabuilder-web-platform.azurewebsites.net/form?siteUrl=https://www.example.com&hasServiceWorker=true' &&
      response.status() === 200
  );

  // we generated a package if this is truthy
  expect(response !== undefined).toBeTruthy();
});

test('choosing a SW base_package generation test', async ({ page }) => {
  // this test can run long
  test.slow();

  // open PWABuilder and enter MSN (not a PWA) into the start input
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  const input = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#input-block > fast-text-field").shadowRoot.querySelector("#control")`
  );
  await input.focus();
  await input.type('https://www.example.com');

  // click the start button
  const start_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#start-button")`
  );
  await start_button.click();

  // waiting for the report-card page which is where
  // we should end up with not a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('reportcard'),
  });

  // checking that we ended up on the reportcard page
  // with the needs work badge / prompt
  expect(
    await page.isVisible(
      'text=Your PWA needs more work, look above for details.'
    )
  ).toBeTruthy();

  const sw_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#sw")`
  );
  await sw_button.click();

  // checking that we opened our SW picker tab
  expect(
    await page.isVisible('text=Secret Ingredient: A Service Worker')
  ).toBeTruthy();

  // Pick a SW
  const sw_picked_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#swPanel > sw-picker").shadowRoot.querySelector("#select-button").shadowRoot.querySelector("fast-button").shadowRoot.querySelector("button")`
  );
  await sw_picked_button.click();

  // Click done on the SW tab
  const sw_done_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#swPanel > sw-picker").shadowRoot.querySelector("#header-actions > app-button").shadowRoot.querySelector("fast-button").shadowRoot.querySelector("button")`
  );
  await sw_done_button.click();

  // click next button on the report-card page
  const next_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#overview-panel > report-card").shadowRoot.querySelector("#package-block > app-button").shadowRoot.querySelector("fast-button")`
  );
  await next_button.click();

  // waiting for the base_package page which is where
  // we should end up with not a PWA
  await page.waitForNavigation({
    url: url => url.href.includes('basepackage'),
  });

  // checking were on the publish page
  expect(await page.isVisible('text=Make your app a PWA')).toBeTruthy();

  // click generate button for the base_package platform
  const generate_button = await page.evaluateHandle(
    `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-basepack").shadowRoot.querySelector("#download-actions > loading-button").shadowRoot.querySelector("app-button").shadowRoot.querySelector("fast-button")`
  );
  await generate_button.click();

  const response = await page.waitForResponse(response => {
    return (
      response.url() ===
        'https://pwabuilder-web-platform.azurewebsites.net/form?siteUrl=https://www.example.com&swId=1&hasServiceWorker=false' &&
      response.status() === 200
    );
  });

  expect(response !== undefined).toBeTruthy();
});
