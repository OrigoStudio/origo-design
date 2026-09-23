const fs = require('fs');
const path = require('path');

const primitivesDir = 'g:\\OrigoStudio\\Repositories\\Origo-Design\\origo-design\\packages\\angular-renderer\\src\\components\\primitives';
const components = [
  'breadcrumbs', 'button', 'card', 'checkbox', 'data-grid', 'form-field',
  'hbox', 'label', 'list', 'radio-group', 'select', 'sidebar', 'tabs',
  'text-input', 'textarea', 'vbox'
];

const results = {
  ariaMissingProps: [],
  ariaMissingSignals: [],
  ariaMissingTemplate: [],
  rtlPhysicalProps: [],
  missingAxeTests: []
};

for (const comp of components) {
  const dir = path.join(primitivesDir, comp);
  const tsFile = path.join(dir, `${comp}.component.ts`);
  const htmlFile = path.join(dir, `${comp}.component.html`);
  const scssFile = path.join(dir, `${comp}.component.scss`);

  // ARIA check
  if (fs.existsSync(tsFile)) {
    const tsContent = fs.readFileSync(tsFile, 'utf8');
    if (!tsContent.includes("'aria-label'?: string") || !tsContent.includes("'aria-describedby'?: string")) {
      results.ariaMissingProps.push(comp);
    }
    if (!tsContent.includes('computedAriaLabel') || !tsContent.includes('computedAriaDescribedBy')) {
      results.ariaMissingSignals.push(comp);
    }
  }

  // RTL check
  if (fs.existsSync(scssFile)) {
    const scssContent = fs.readFileSync(scssFile, 'utf8');
    if (scssContent.match(/padding-left|padding-right|margin-left|margin-right|text-align:\s*left|text-align:\s*right|border-left/)) {
      results.rtlPhysicalProps.push(comp);
    }
  }
}

// Check Axe tests
const a11yFile = path.join(primitivesDir, 'primitives.a11y.pw.ts');
if (fs.existsSync(a11yFile)) {
  const a11yContent = fs.readFileSync(a11yFile, 'utf8');
  for (const comp of components) {
    if (!a11yContent.includes(`origo-${comp}`)) {
      results.missingAxeTests.push(comp);
    }
  }
}

console.log(JSON.stringify(results, null, 2));
