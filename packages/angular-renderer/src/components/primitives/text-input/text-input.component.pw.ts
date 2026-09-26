import { test, expect } from '@playwright/experimental-ct-angular';
import { TextInputComponent, TextInputProps } from './text-input.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('TextInputComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(TextInputComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'textInput',
          props: {},
        } as InteractionContract<TextInputProps>,
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
