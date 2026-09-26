import { test, expect } from '@playwright/experimental-ct-angular';
import { RadioGroupComponent, RadioGroupProps } from './radio-group.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('RadioGroupComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(RadioGroupComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'radioGroup',
          props: {},
        } as InteractionContract<RadioGroupProps>,
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
