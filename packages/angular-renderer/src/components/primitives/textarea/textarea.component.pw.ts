import { test, expect } from '@playwright/experimental-ct-angular';
import { TextareaComponent, TextareaProps } from './textarea.component';
import { InteractionContract } from '@origo/core';
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
          props: {},
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
        'label',
        'button-name',
        'select-name',
      ])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
