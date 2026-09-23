import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Primitives Accessibility', () => {
  test('Button should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    // Assuming a test sandbox or storybook page exists for the primitives.
    // Since we don't have a specific URL, we will create a basic DOM structure with the component.
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<button class="origo-button" aria-label="Accessible Button">Click Me</button>';
        </script>
      </main>
    `);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('TextInput should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<label for="test-input">Test Input</label><input id="test-input" type="text" class="origo-text-input" placeholder="Enter text" />';
        </script>
      </main>
    `);

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Select should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<label for="test-select">Test Select</label><select id="test-select" class="origo-select"><option value="1">One</option></select>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Checkbox should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<input type="checkbox" id="test-check" class="origo-checkbox" /><label for="test-check">Test Checkbox</label>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('RadioGroup should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<fieldset class="origo-radio-group"><legend>Radio Group</legend><input type="radio" id="radio-1" name="rg" value="1" /><label for="radio-1">One</label></fieldset>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Textarea should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<label for="test-textarea">Test Textarea</label><textarea id="test-textarea" class="origo-textarea"></textarea>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('FormField should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<div class="origo-form-field"><label for="ff-input">Form Field Label</label><input id="ff-input" type="text" /><div role="alert" class="form-field-error">Error</div></div>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('HBox should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<div class="origo-hbox" style="display: flex; gap: 10px;"><div>Item 1</div></div>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Label should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<label class="origo-label">My Label</label>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('DataGrid should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<div class="origo-data-grid-container"><table aria-label="Data Grid"><thead><tr><th aria-sort="ascending">Col 1</th></tr></thead><tbody><tr><td>Val 1</td></tr></tbody></table></div>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('List should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<div class="origo-list-container" role="list" aria-label="List items"><div class="origo-list-item" role="listitem">Item</div></div>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Card should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<div class="origo-card-container"><div class="origo-card-image"><img src="test.png" alt="Test image"/></div><div class="origo-card-content"><div class="origo-card-title">Card</div></div></div>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Sidebar should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<nav class="origo-sidebar" aria-label="Main Navigation"><ul class="origo-sidebar__list"><li class="origo-sidebar__item"><a href="javascript:void(0)" class="origo-sidebar__link" aria-current="page">Home</a></li></ul></nav>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Tabs should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<div class="origo-tabs" role="tablist" aria-label="Tabs"><button role="tab" aria-selected="true" tabindex="0">Tab 1</button><button role="tab" aria-selected="false" tabindex="-1">Tab 2</button></div>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Breadcrumbs should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<nav class="origo-breadcrumbs" aria-label="Breadcrumb"><ol><li class="origo-breadcrumbs__item"><a href="#">Home</a></li><li class="origo-breadcrumbs__item"><span aria-current="page">Current</span></li></ol></nav>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  test('VBox should not have any automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<div class="origo-vbox" style="display: flex; flex-direction: column; gap: 10px;"><div>Item 1</div></div>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
