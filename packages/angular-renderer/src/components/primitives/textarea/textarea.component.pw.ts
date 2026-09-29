import { test, expect } from '@jscutlery/playwright-ct-angular';
import { TextareaComponent, TextareaProps } from './textarea.component';
import { InteractionContract } from '@origostudio/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('TextareaComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(TextareaComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'textarea',
          props: {
            label: 'Test Label',
            placeholder: 'Test',
            'aria-label': 'Test',
            options: [{ label: 'Option 1', value: '1' }],
            items: [{ label: 'Item 1' }],
          },
        } as InteractionContract<TextareaProps>,
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
