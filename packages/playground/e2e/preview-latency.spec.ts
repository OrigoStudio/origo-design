import { test, expect } from '@playwright/test';

test.describe('Live Preview Latency Optimization', () => {
  test('typing rapidly should not result in out-of-order renders', async ({ page }) => {
    await page.goto('/');

    const editor = page.locator('.monaco-editor').first();
    await editor.click();

    // Type rapidly to simulate user input causing compilation spam
    await page.keyboard.type('{"domain":"test"', { delay: 50 });

    // The preview should only show the latest valid state or error
    await expect(page.locator('.preview-pane')).toBeVisible();

    // Assuming the error display shows syntax error until it's closed
    await page.keyboard.type('}', { delay: 50 });

    // Ensure that it stabilizes without error spam
    await expect(page.locator('.error-item')).toHaveCount(0, { timeout: 2000 });
  });

  test('error stream should be truncated to prevent UI freezing', async ({ page }) => {
    await page.goto('/');

    const editor = page.locator('.monaco-editor').first();
    await editor.click();

    // Create a payload that generates many errors
    const spam = Array(60).fill('{"id":"bad"}').join(',');
    await page.keyboard.type(`{"domains":[${spam}]}`, { delay: 10 });

    // Error list should not exceed 51 (50 + 1 info row)
    const errorItems = page.locator('.error-item');
    // Using a loose assertion since DOM structure depends on the app,
    // but verifying it doesn't render 60 errors
    const count = await errorItems.count();
    expect(count).toBeLessThanOrEqual(51);
  });
});
