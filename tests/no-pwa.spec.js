const { test, expect } = require('@playwright/test');

test('known not-a-pwa base_package generation test', async ({ page }) => {
  // this test can run long
  test.slow();

  // open PWABuilder and enter MSN (not a PWA) into the start input
  await page.goto('https://www.pwabuilder.com', {waitUntil: 'networkidle'});
  const input = await page.evaluateHandle(`document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#input-block > fast-text-field").shadowRoot.querySelector("#control")`);
  await input.focus();
  await input.type("https://www.example.com");

  // click the start button
  const start_button = await page.evaluateHandle(`document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#start-button")`);
  await start_button.click();

  // waiting for the report-card page which is where 
  // we should end up with a PWA
  await page.waitForNavigation({
    url: (url) => url.href.includes("reportcard")
  });
 
  // checking that we ended up on the reportcard page
  // with the needs work badge / prompt
  expect(await page.isVisible('text=Your PWA needs more work, look above for details.')).toBeTruthy();

  // click next button on the report-card page
  const next_button = await page.evaluateHandle(`document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#overview-panel > report-card").shadowRoot.querySelector("#package-block > app-button").shadowRoot.querySelector("fast-button")`);
  await next_button.click();

  // waiting for the base_package page which is where
  // we should end up with not a PWA
  await page.waitForNavigation({
    url: (url) => url.href.includes("basepackage")
  });

  // checking were on the publish page
  expect(await page.isVisible('text=Make your app a PWA')).toBeTruthy();

  // click generate button for the base_package platform
  const generate_button = await page.evaluateHandle(`document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-basepack").shadowRoot.querySelector("#download-actions > loading-button").shadowRoot.querySelector("app-button").shadowRoot.querySelector("fast-button")`);
  await generate_button.click();

  // waiting on reponse from the base_package generator
  const response = await page.waitForResponse(response => response.url() === 'https://pwabuilder-web-platform.azurewebsites.net/form?siteUrl=https://www.example.com&hasServiceWorker=true' && response.status() === 200);

  // we generated a package if this is truthy
  expect(response !== undefined).toBeTruthy();
});
