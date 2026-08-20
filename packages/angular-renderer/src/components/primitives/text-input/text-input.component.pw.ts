import { test, expect } from '@playwright/experimental-ct-angular';
import { TextInputComponent, TextInputProps } from './text-input.component';
import { InteractionContract } from '@origo/core';
import AxeBuilder from '@axe-core/playwright';

test.describe('TextInputComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(TextInputComponent, {
      props: {
        contract: {
          id: '2',
          type: 'textInput',
          props: {
            placeholder: 'Enter name',
            value: 'Jane',
            'aria-label': 'Name input',
            'aria-describedby': 'name-hint',
          },
        } as InteractionContract<TextInputProps>,
      },
    });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
