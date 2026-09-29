import { test, expect } from '@jscutlery/playwright-ct-angular';
import { BreadcrumbsComponent, BreadcrumbsProps } from './breadcrumbs.component';
import { InteractionContract } from '@origostudio/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('BreadcrumbsComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(BreadcrumbsComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'breadcrumbs',
          props: {
            columns: [{ key: 'name', label: 'Name' }],
            rows: [{ name: 'Test' }],
            items: [{ label: 'Item 1', id: '1', href: '/' }],
            tabs: [{ label: 'Tab 1', id: 'tab-1' }],
          },
        } as InteractionContract<BreadcrumbsProps>,
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
