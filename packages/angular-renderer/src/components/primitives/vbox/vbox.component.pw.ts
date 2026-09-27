import { test, expect } from '@playwright/experimental-ct-angular';
import { VBoxComponent, VBoxProps } from './vbox.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('VBoxComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(VBoxComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'vbox',
          props: {},
        } as InteractionContract<VBoxProps>,
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
