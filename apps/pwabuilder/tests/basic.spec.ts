import { test, expect } from '@playwright/test';

// before each test
test.beforeEach(async ({ page }) => {
    await page.goto('/');
});

test('ensure application loads home page', async ({ page }) => {
    // find the button with the text "Login"
    const loginButton = page.locator('id=start-button');

    // expect loginButton to exist and be visible
    await expect(loginButton).toBeVisible();
});
