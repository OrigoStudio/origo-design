import { test, expect } from '@playwright/experimental-ct-angular';
import { HBoxComponent, HBoxProps } from './hbox.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('HBoxComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(HBoxComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'hbox',
          props: {},
        } as InteractionContract<HBoxProps>,
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
