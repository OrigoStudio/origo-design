import { test, expect } from '@playwright/experimental-ct-angular';
import { CheckboxComponent, CheckboxProps } from './checkbox.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('CheckboxComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(CheckboxComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'checkbox',
          props: {
            label: 'Test Label',
            placeholder: 'Test',
            'aria-label': 'Test',
            options: [{ label: 'Option 1', value: '1' }],
            items: [{ label: 'Item 1' }],
          },
        } as InteractionContract<CheckboxProps>,
      },
    });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules([
        'document-title',
        'html-has-lang',
        'landmark-one-main',
        'page-has-heading-one',
        'region',
      ])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
