import { test, expect } from '@playwright/experimental-ct-angular';
import { ButtonComponent, ButtonProps } from './button.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('ButtonComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(ButtonComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'button',
          props: { label: 'Submit' },
        } as InteractionContract<ButtonProps>,
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
