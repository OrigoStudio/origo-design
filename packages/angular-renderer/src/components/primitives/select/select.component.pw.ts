import { test, expect } from '@jscutlery/playwright-ct-angular';
import { SelectComponent, SelectProps } from './select.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('SelectComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(SelectComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'select',
          props: { options: [{ label: 'Opt 1', value: '1' }] },
        } as InteractionContract<SelectProps>,
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
