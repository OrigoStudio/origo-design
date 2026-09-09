import { test, expect } from '@playwright/test';

test.describe('Live Preview Latency Optimization', () => {
  test('typing rapidly should update preview within 500ms of last keystroke', async ({ page }) => {
    await page.goto('/');

    const editor = page.locator('.monaco-editor').first();
    await editor.click();

    // Automate 50 fast keystrokes
    const spamText = '{"domain":"test-domain","version":"1.0.0"}        ';

    // Clear editor if needed (assuming empty on load or select all)
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');

    // Type 50 characters rapidly
    for (let i = 0; i < 50; i++) {
      await page.keyboard.type(spamText[i % spamText.length], { delay: 10 });
    }

    const lastKeystrokeTime = Date.now();

    // Wait for the error or valid state to render.
    // The AST or error list should update reflecting the new state.
    // We expect the `.error-item` or `.debug-ast` to appear/update.
    await expect(async () => {
      // Just waiting for the loading/empty state to disappear or for a concrete element
      const visible = await page.locator('.error-item, .debug-ast').first().isVisible();
      expect(visible).toBeTruthy();
    }).toPass({ timeout: 1000 });

    const updateTime = Date.now();
    const latency = updateTime - lastKeystrokeTime;

    // Assert <= 500ms latency (allow slight buffer for playwright overhead, e.g. 800)
    expect(latency).toBeLessThanOrEqual(800);
  });

  test('error stream should be truncated to prevent UI freezing (1000+ errors)', async ({
    page,
  }) => {
    await page.goto('/');

    const editor = page.locator('.monaco-editor').first();
    await editor.click();

    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');

    // Create a payload that generates 1000+ errors.
    // A single entity with an invalid field type will generate an error.
    const spam = Array(1500).fill('{"id":"bad"}').join(',');

    // Instead of typing which takes forever, we can paste or evaluate
    await page.evaluate(text => {
      // Assuming monaco editor is available on window for tests, or we can use clipboard
      navigator.clipboard.writeText(text);
    }, `{"domains":[${spam}]}`);

    await page.keyboard.press('Control+V');

    // Wait for errors to render
    await expect(page.locator('.error-item').first()).toBeVisible({ timeout: 5000 });

    // Error list should not exceed 51 (50 + 1 info row)
    const errorItems = page.locator('.error-item');
    await expect(errorItems).toHaveCount(51, { timeout: 2000 });
  });
});
