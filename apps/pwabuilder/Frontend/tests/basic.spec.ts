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

test('carousel pause and play button keeps keyboard focus after activation', async ({ page }) => {
    const carouselButton = page.getByRole('button', { name: 'Click here to pause carousel' });
    await expect(carouselButton).toBeVisible();

    await carouselButton.focus();
    await expect(carouselButton).toBeFocused();

    await page.keyboard.press('Enter');

    const toggledButton = page.getByRole('button', { name: 'Click here to play carousel' });
    await expect(toggledButton).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(toggledButton).not.toBeFocused();
});
