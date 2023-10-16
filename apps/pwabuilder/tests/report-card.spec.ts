import { test, expect, Page } from '@playwright/test';

let currentPage: Page | undefined;

const url = 'https://preview.pwabuilder.com';
// before each test
test.beforeEach(async ({ page }) => {
    currentPage = page;
    await page.goto(url);
});


test('ensure demo app is testable', async ({ page }) => {
    // find the button with the text "Login"
    const demoButton = page.locator('id=demo-action');

    // click demo button to start new test
    await demoButton.click();

    // wait for network to be done
    await page.waitForLoadState('networkidle');

    // ensure we are on report-card page

    // our url should contain /reportcard
    await expect(page.url()).toContain('/reportcard');

    // wait for tests to end
    await page.waitForLoadState('networkidle');

    const reportCardAppTitle = page.locator('id=site-name');

    // expect reportCardAppTitle to exist and be visible
    await expect(reportCardAppTitle).toBeVisible();

    // // expect reportCardAppTitle to contain text "Webboard"
    await expect(reportCardAppTitle).toHaveText('Webboard');
});

test('ensure Package For Stores button is not disabled for demo app', async ({ page }) => {
    // find the button with the text "Login"
    const demoButton = page.locator('id=demo-action');

    // click demo button to start new test
    await demoButton.click();

    // wait for network to be done
    await page.waitForLoadState('networkidle');

    // our url should contain /reportcard
    await expect(page.url()).toContain('/reportcard');

    // wait for tests to end
    await page.waitForLoadState('networkidle');

    // test manifest score
    const packageForStoresButton = page.locator('text=Package For Stores');
    await expect(await packageForStoresButton.isDisabled()).toBe(false);
})