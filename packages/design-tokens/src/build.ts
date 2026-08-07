export function parseTokens(
  tokens: Record<string, unknown>,
  prefix: string
): Record<string, string> {
  const result: Record<string, string> = {};

  function traverse(obj: unknown, currentPath: string[]) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('$value' in value) {
          const sanitizedPath = currentPath.concat(key).map(k => k.replace(/[^a-zA-Z0-9-]/g, '-'));
          const varName = `--${prefix}-${sanitizedPath.join('-')}`;

          const tokenObj = value as Record<string, unknown>;
          const val = tokenObj['$value'];
          let valStr: string;

          if (Array.isArray(val)) {
            valStr = val.join(', ');
          } else if (typeof val === 'object' && val !== null) {
            valStr = JSON.stringify(val);
          } else {
            valStr = String(val);
          }

          result[varName] = valStr;
        } else {
          traverse(value, currentPath.concat(key));
        }
      }
    }
  }

  traverse(tokens, []);

  let changed = true;
  let iterations = 0;
  const maxIterations = 10;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    for (const [key, val] of Object.entries(result)) {
      if (typeof val === 'string' && val.includes('{')) {
        const newVal = val.replace(/\{([^}]+)\}/g, (match, refPath) => {
          if (!refPath.trim()) throw new Error('Empty reference in token');
          const sanitizedRefPath = refPath
            .split('.')
            .map((k: string) => k.replace(/[^a-zA-Z0-9-]/g, '-'))
            .join('-');
          const refVarName = `--${prefix}-${sanitizedRefPath}`;
          if (refVarName === key) throw new Error(`Circular reference detected: ${key}`);
          return `var(${refVarName})`;
        });
        if (newVal !== val) {
          result[key] = newVal;
          changed = true;
        }
      }
    }
  }

  return result;
}

export function generateCssVariables(
  baseTokensMap: Record<string, string>,
  semanticTokensMap?: Record<string, string>
): string {
  let css = ':root{';

  const usedBaseTokens = new Set<string>();
  if (semanticTokensMap) {
    for (const val of Object.values(semanticTokensMap)) {
      const matches = val.match(/var\((--[^)]+)\)/g);
      if (matches) {
        matches.forEach(m => usedBaseTokens.add(m.slice(4, -1)));
      }
    }
  }

  for (const [key, value] of Object.entries(baseTokensMap)) {
    if (!semanticTokensMap || usedBaseTokens.has(key)) {
      css += `${key}:${value};`;
    }
  }

  if (semanticTokensMap) {
    for (const [key, value] of Object.entries(semanticTokensMap)) {
      css += `${key}:${value};`;
    }
  }

  css += '}';
  return css;
}
