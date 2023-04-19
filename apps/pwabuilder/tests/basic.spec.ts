import { test, expect, chromium, Page } from '@playwright/test';

const url = 'http://localhost:3000';

const v8toIstanbul = require('v8-to-istanbul');

let currentPage: Page | null = null;

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

test('ensure application loads', async ({ page }) => {
    // find the button with the text "Login"
    const loginButton = page.locator('id=start-button');

    // expect loginButton to exist and be visible
    await expect(loginButton).toBeVisible();
});
