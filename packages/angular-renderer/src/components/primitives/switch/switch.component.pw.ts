import { test, expect } from '@playwright/experimental-ct-angular';
import { SwitchComponent, SwitchProps } from './switch.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('SwitchComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(SwitchComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'switch',
          props: {},
        } as InteractionContract<SwitchProps>,
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
