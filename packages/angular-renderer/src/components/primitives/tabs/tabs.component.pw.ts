import { test, expect } from '@jscutlery/playwright-ct-angular';
import { TabsComponent, TabsProps } from './tabs.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('TabsComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(TabsComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'tabs',
          props: {
            columns: [{ key: 'name', label: 'Name' }],
            rows: [{ name: 'Test' }],
            items: [{ label: 'Item 1', id: '1', href: '/' }],
            tabs: [{ label: 'Tab 1', id: 'tab-1' }],
          },
        } as InteractionContract<TabsProps>,
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
