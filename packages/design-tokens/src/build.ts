export function parseTokens(tokens: any, prefix: string): Record<string, string> {
  const result: Record<string, string> = {};

  function traverse(obj: any, currentPath: string[]) {
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('$value' in value) {
          const varName = `--${prefix}-${currentPath.concat(key).join('-')}`;
          const val = String((value as any).$value);

          if (val.startsWith('{') && val.endsWith('}')) {
            const refPath = val.slice(1, -1).split('.').join('-');
            result[varName] = `var(--${prefix}-${refPath})`;
          } else {
            result[varName] = val;
          }
        } else {
          traverse(value, currentPath.concat(key));
        }
      }
    }
  }

  traverse(tokens, []);
  return result;
}

export function generateCssVariables(tokensMap: Record<string, string>): string {
  let css = ':root{';
  for (const [key, value] of Object.entries(tokensMap)) {
    css += `${key}:${value};`;
  }
  css += '}';
  return css;
}
