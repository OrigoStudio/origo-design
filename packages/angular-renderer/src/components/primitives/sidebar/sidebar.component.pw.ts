import { test, expect } from '@playwright/experimental-ct-angular';
import { SidebarComponent, SidebarProps } from './sidebar.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('SidebarComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(SidebarComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'sidebar',
          props: {
            columns: [{ key: 'name', label: 'Name' }],
            rows: [{ name: 'Test' }],
            items: [{ label: 'Item 1', id: '1', href: '/' }],
            tabs: [{ label: 'Tab 1', id: 'tab-1' }],
          },
        } as InteractionContract<SidebarProps>,
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
