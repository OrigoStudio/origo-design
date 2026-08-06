import { generateCssVariables, parseTokens } from './build';

describe('Token Compilation Pipeline', () => {
  it('should parse base tokens to flat map', () => {
    const baseTokens = {
      color: {
        base: {
          blue: {
            100: { $value: '#E6F0FF', $type: 'color' },
            500: { $value: '#0066FF', $type: 'color' },
          },
        },
      },
      spacing: {
        base: {
          1: { $value: '4px', $type: 'dimension' },
        },
      },
    };

    const parsed = parseTokens(baseTokens, 'origo');
    expect(parsed).toEqual({
      '--origo-color-base-blue-100': '#E6F0FF',
      '--origo-color-base-blue-500': '#0066FF',
      '--origo-spacing-base-1': '4px',
    });
  });

  it('should parse semantic tokens to flat map with var references', () => {
    const semanticTokens = {
      color: {
        surface: {
          primary: { $value: '{color.base.blue.500}', $type: 'color' },
        },
      },
    };

    const parsed = parseTokens(semanticTokens, 'origo');
    expect(parsed).toEqual({
      '--origo-color-surface-primary': 'var(--origo-color-base-blue-500)',
    });
  });

  it('should generate minified CSS string', () => {
    const parsed = {
      '--origo-color-base-blue-500': '#0066FF',
      '--origo-color-surface-primary': 'var(--origo-color-base-blue-500)',
    };

    const css = generateCssVariables(parsed);
    expect(css).toBe(
      ':root{--origo-color-base-blue-500:#0066FF;--origo-color-surface-primary:var(--origo-color-base-blue-500);}'
    );
  });
});
