import { test, expect } from '@jscutlery/playwright-ct-angular';
import { FormFieldComponent, FormFieldProps } from './form-field.component';
import { InteractionContract } from '@origostudio/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('FormFieldComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(FormFieldComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'formField',
          props: {
            label: 'Test Label',
            placeholder: 'Test',
            'aria-label': 'Test',
            options: [{ label: 'Option 1', value: '1' }],
            items: [{ label: 'Item 1' }],
          },
        } as InteractionContract<FormFieldProps>,
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
