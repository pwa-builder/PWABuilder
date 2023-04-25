import { test, expect, Page } from '@playwright/test';

const url = 'http://localhost:3000';

let currentPage: Page | null = null;

// before each test
test.beforeEach(async ({ page }) => {
    currentPage = page;
    await page.goto(url);
});

test('ensure application loads', async ({ page }) => {
    // find the button with the text "Login"
    const loginButton = page.locator('id=start-button');

    // expect loginButton to exist and be visible
    await expect(loginButton).toBeVisible();
});

