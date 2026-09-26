const fs = require('fs');
const primitives = [
  'breadcrumbs',
  'button',
  'card',
  'checkbox',
  'chip',
  'data-grid',
  'form-field',
  'hbox',
  'label',
  'list',
  'radio-group',
  'select',
  'sidebar',
  'switch',
  'tabs',
  'text-input',
  'textarea',
  'vbox',
];

const entries = primitives
  .map(
    p => `  - id: renderer-primitive-${p}-ct
    description: 'Verifies ${p} primitive accessibility via Playwright CT'
    package: '@origo/angular-renderer'
    spec_file: packages/angular-renderer/src/components/primitives/${p}/${p}.component.pw.ts
    type: e2e
    affected_stories:
      - retro-9-playwright-component-testing
    last_result: unknown
    results: {}`
  )
  .join('\n');

fs.writeFileSync('generated-entries.yaml', entries);
console.log('Done!');
