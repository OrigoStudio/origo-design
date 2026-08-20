import { test, expect } from '@playwright/experimental-ct-angular';
import { VBoxComponent } from './vbox.component';
import AxeBuilder from '@axe-core/playwright';

test.describe('VBoxComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({
    mount,
    page,
  }) => {
    await mount(VBoxComponent, {
      props: {
        contract: { id: '1', type: 'vbox', props: { gap: '10px' } } as never,
      },
    });

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
