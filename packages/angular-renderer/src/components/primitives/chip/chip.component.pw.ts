import { test, expect } from '@playwright/experimental-ct-angular';
import { ChipComponent, ChipProps } from './chip.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('ChipComponent Accessibility', () => {
  test('should be accessible (default)', async ({ mount, page }) => {
    await mount(ChipComponent, {
      props: {
        contract: {
          id: 'test-id',
          type: 'chip',
          props: { label: 'Submit' },
        } as InteractionContract<ChipProps>,
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

test('Chip selected state accessibility', async ({ mount, page }) => {
  await mount(ChipComponent, {
    props: {
      contract: {
        id: 'test-id',
        type: 'chip',
        props: { selected: true, label: 'Test' },
      } as InteractionContract<ChipProps>,
    },
  });
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
test('Chip disabled state accessibility', async ({ mount, page }) => {
  await mount(ChipComponent, {
    props: {
      contract: {
        id: 'test-id',
        type: 'chip',
        props: { disabled: true, label: 'Test' },
      } as InteractionContract<ChipProps>,
    },
  });
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
