import { test, expect } from '@playwright/experimental-ct-angular';
import { BreadcrumbsComponent, BreadcrumbsProps } from './breadcrumbs.component';
import { InteractionContract } from '@origo/core';
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
          props: {},
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
        'label',
        'button-name',
        'select-name',
      ])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
