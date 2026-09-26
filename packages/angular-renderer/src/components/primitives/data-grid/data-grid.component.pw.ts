import { test, expect } from '@playwright/experimental-ct-angular';
import { DataGridComponent, DataGridProps } from './data-grid.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('DataGridComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(DataGridComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'dataGrid',
          props: {},
        } as InteractionContract<DataGridProps>,
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
