import { test, expect } from '@jscutlery/playwright-ct-angular';
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
          props: {
            columns: [{ key: 'name', label: 'Name' }],
            rows: [{ name: 'Test' }],
            items: [{ label: 'Item 1', id: '1', href: '/' }],
            tabs: [{ label: 'Tab 1', id: 'tab-1' }],
          },
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
      ])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
