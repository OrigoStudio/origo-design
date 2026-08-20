import { test, expect } from '@playwright/experimental-ct-angular';
import { ButtonComponent } from './button.component';
import AxeBuilder from '@axe-core/playwright';

test.describe('ButtonComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(ButtonComponent, {
      props: {
        contract: { id: '3', type: 'button', props: { label: 'Submit' } } as never,
      },
    });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
