const { test, expect } = require('@playwright/test');

const known_pwas = ['https://webboard.app', 'https://twitter.com'];

const not_pwas = ['https://example.com', 'https://cnn.com'];

test('Should end up on publish page', async ({ browser }) => {
  // this test can run long
  test.slow();

  known_pwas.forEach(async url => {
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('http://localhost:8000/', { waitUntil: 'networkidle' });

    // open PWABuilder and enter a PWA into the start input
    const input = await newPage.evaluateHandle(
      `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#input-block > fast-text-field").shadowRoot.querySelector("#control")`
    );
    await input.focus();
    await input.type(url);

    // click the start button
    const start_button = await newPage.evaluateHandle(
      `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#start-button")`
    );
    await start_button.click();

    // waiting for the report-card page which is where
    // we should end up with a PWA
    await newPage.waitForNavigation({
      url: url => url.href.includes('reportcard'),
    });

    // checking that we ended up on the reportcard page
    // with the PWA badge
    expect(await newPage.isVisible('text=You have a great PWA!')).toBeTruthy();

    // click next button on the report-card page
    const next_button = await newPage.evaluateHandle(
      `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-report").shadowRoot.querySelector("#overview-panel > report-card").shadowRoot.querySelector("#package-block > app-button").shadowRoot.querySelector("fast-button")`
    );
    await next_button.click();

    // waiting for the publish page which is where
    // we should end up with a PWA
    await newPage.waitForNavigation({
      url: url => url.href.includes('publish'),
    });

    // checking were on the publish page
    expect(
      await newPage.isVisible('text=Publish your PWA to stores')
    ).toBeTruthy();
  });
});

test('Should end up on base_package page', async ({ browser }) => {
  // this test can run long
  test.slow();

  not_pwas.forEach(async url => {
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto('http://localhost:8000/', { waitUntil: 'networkidle' });

    // open PWABuilder and enter a PWA into the start input
    const input = await newPage.evaluateHandle(
      `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#input-block > fast-text-field").shadowRoot.querySelector("#control")`
    );
    await input.focus();
    await input.type(url);

    // click the start button
    const start_button = await newPage.evaluateHandle(
      `document.querySelector("body > fast-design-system-provider > app-index").shadowRoot.querySelector("#router-outlet > app-home").shadowRoot.querySelector("#start-button")`
    );
    await start_button.click();

    // waiting for the report-card page which is where
    // we should end up with a PWA
    await newPage.waitForNavigation({
      url: url => url.href.includes('reportcard'),
    });

    // checking that we ended up on the reportcard page
    // with the not a PWA badge
    expect(
      await page.isVisible(
        'text=Your PWA needs more work, look above for details.'
      )
    ).toBeTruthy();

    // click next button on the report-card page
    const next_button = await newPage.evaluateHandle(
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
  });
});
