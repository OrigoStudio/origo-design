import { test, expect } from '@playwright/experimental-ct-angular';
import { TextInputComponent } from './text-input.component';
import AxeBuilder from '@axe-core/playwright';

test.describe('TextInputComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(TextInputComponent, {
      props: {
        contract: {
          id: '2',
          type: 'textInput',
          props: { placeholder: 'Enter name', value: 'Jane' },
        } as any,
      },
    });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
