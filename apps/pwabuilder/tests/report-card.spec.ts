import { test, expect, Page } from '@playwright/test';

const v8toIstanbul = require('v8-to-istanbul');

let currentPage: Page | undefined;

const url = 'http://localhost:3000';
// before each test
test.beforeEach(async ({ page }) => {
    currentPage = page;

    await page.coverage.startJSCoverage();
    await page.goto(url);
});

test.afterEach(async () => {
    const coverage = await currentPage?.coverage.stopJSCoverage();
    if (coverage) {
        for (const entry of coverage) {
            const converter = v8toIstanbul('', 0, { source: entry.source });
            try {
                await converter.load();
                converter.applyCoverage(entry.functions);
                const coverageData = converter.toIstanbul();


                // write the coverage data to a json file
                const { writeFile, mkdir } = await import("fs/promises");

                // make coverage folder if it doesn't exist
                await mkdir('coverage', { recursive: true })

                await writeFile(`coverage/coverage-${entry.url.split('/').pop()}.json`, JSON.stringify(coverageData, null, 2));

            }
            catch (err) {

            }
        }
    }
})


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