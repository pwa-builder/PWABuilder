import { test, expect } from '@playwright/test';

test.describe('Portals Dialog Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to portals page with test site
    await page.goto('/portals?site=https://webboard.app');
  });

  test('back button should be keyboard accessible', async ({ page }) => {
    // Wait for the publish pane to be available
    await page.waitForSelector('publish-pane');
    
    // Open the dialog by clicking Generate Package button
    const generateButton = page.locator('button:has-text("Generate Package")').first();
    await generateButton.click();
    
    // Wait for dialog to open and form to show
    await page.waitForSelector('#pp-form-header', { state: 'visible' });
    
    // Find the back button in the form header
    const backButton = page.locator('#pp-form-header > button').first();
    
    // Verify button is visible and accessible
    await expect(backButton).toBeVisible();
    
    // Test keyboard navigation - tab to the button
    await backButton.focus();
    
    // Verify button has focus
    await expect(backButton).toBeFocused();
    
    // Test that pressing Enter activates the button
    await backButton.press('Enter');
    
    // Verify that we're back to the cards view (form header should not be visible)
    await expect(page.locator('#pp-form-header')).not.toBeVisible();
    await expect(page.locator('#store-cards')).toBeVisible();
  });

  test('back button should have proper focus styling', async ({ page }) => {
    // Navigate to portals page
    await page.goto('/portals?site=https://webboard.app');
    
    // Wait for the publish pane
    await page.waitForSelector('publish-pane');
    
    // Open dialog
    const generateButton = page.locator('button:has-text("Generate Package")').first();
    await generateButton.click();
    
    // Wait for form to show
    await page.waitForSelector('#pp-form-header', { state: 'visible' });
    
    // Focus the back button
    const backButton = page.locator('#pp-form-header > button').first();
    await backButton.focus();
    
    // Check that focus styles are applied
    const outlineStyle = await backButton.evaluate((el) => {
      return window.getComputedStyle(el).outline;
    });
    
    // Verify that the button has an outline when focused
    expect(outlineStyle).toContain('solid');
  });
});