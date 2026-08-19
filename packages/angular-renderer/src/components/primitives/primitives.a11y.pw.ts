import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Primitives Accessibility', () => {
  test('Button should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    // Assuming a test sandbox or storybook page exists for the primitives.
    // Since we don't have a specific URL, we will create a basic DOM structure with the component.
    await page.setContent(`
      <main>
        <button class="origo-button" aria-label="Accessible Button">Click Me</button>
      </main>
    `);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('TextInput should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <label for="test-input">Test Input</label>
        <input id="test-input" type="text" class="origo-text-input" placeholder="Enter text" />
      </main>
    `);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
