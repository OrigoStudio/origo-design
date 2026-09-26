import { test, expect } from '@playwright/experimental-ct-angular';
import { ChipComponent, ChipProps } from './chip.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('ChipComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(ChipComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'chip',
          props: { label: 'Submit' },
        } as InteractionContract<ChipProps>,
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
