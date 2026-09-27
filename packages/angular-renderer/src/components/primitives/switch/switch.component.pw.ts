import { test, expect } from '@playwright/experimental-ct-angular';
import { SwitchComponent, SwitchProps } from './switch.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('SwitchComponent Accessibility', () => {
  test('should be accessible (default)', async ({ mount, page }) => {
    await mount(SwitchComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'switch',
          props: {
            label: 'Test Label',
            placeholder: 'Test',
            'aria-label': 'Test',
            options: [{ label: 'Option 1', value: '1' }],
            items: [{ label: 'Item 1' }],
          },
        } as InteractionContract<SwitchProps>,
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

test('Switch checked state accessibility', async ({ mount, page }) => {
  await mount(SwitchComponent, {
    props: {
      contract: {
        id: 'test-id',
        type: 'switch',
        props: { checked: true, label: 'Test' },
      } as InteractionContract<SwitchProps>,
    },
  });
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
test('Switch disabled state accessibility', async ({ mount, page }) => {
  await mount(SwitchComponent, {
    props: {
      contract: {
        id: 'test-id',
        type: 'switch',
        props: { disabled: true, label: 'Test' },
      } as InteractionContract<SwitchProps>,
    },
  });
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
