import { test, expect } from '@jscutlery/playwright-ct-angular';
import { LabelComponent, LabelProps } from './label.component';
import { InteractionContract } from '@origostudio/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('LabelComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(LabelComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'label',
          props: {},
        } as InteractionContract<LabelProps>,
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
