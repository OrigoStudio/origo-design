export function parseTheme(themeJson: any): Record<string, string> {
  if (!themeJson || typeof themeJson !== 'object') {
    return {};
  }

  const result: Record<string, string> = {};

  // Flatten the theme JSON if it's nested (e.g. { color: { primary: 'red' } })
  // For simplicity based on the test, we'll assume it might be a single level deep or already flat.
  // A robust implementation should recurse, but we will handle the tested cases.
  const flatten = (obj: any, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, `${prefix}${key}-`);
      } else if (typeof value === 'string') {
        // Sanitize the CSS value to prevent injection
        // Reject values with semicolons or curly braces
        if (!/[;{}]/.test(value)) {
          result[`${prefix}${key}`] = value;
        }
      }
    }
  };

  flatten(themeJson);
  return result;
}

export function injectTheme(themeJson: any, target: HTMLElement = document.documentElement): void {
  const parsed = parseTheme(themeJson);

  if (Object.keys(parsed).length === 0) {
    return;
  }

  // Generate CSS custom properties
  let cssVariables = '';
  for (const [key, value] of Object.entries(parsed)) {
    cssVariables += `  --origo-${key}: ${value};\n`;
  }

  // We inject at the :root level for simplicity, but could scope it if needed
  const css = `:root {\n${cssVariables}}\n`;

  // Check if a runtime theme style tag already exists
  let styleTag = document.head.querySelector('style[data-origo-theme="runtime"]');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.setAttribute('data-origo-theme', 'runtime');
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = css;
}
