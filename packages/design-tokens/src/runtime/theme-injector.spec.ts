/**
 * @jest-environment jsdom
 */
import { injectTheme, parseTheme } from './theme-injector';

describe('theme-injector', () => {
  beforeAll(() => {
    // JSDOM does not implement CSS.escape
    if (typeof (global as unknown as { CSS?: unknown }).CSS === 'undefined') {
      (global as unknown as { CSS: { escape: (str: string) => string } }).CSS = {
        escape: (str: string) => str,
      };
    }
  });

  describe('parseTheme', () => {
    it('should parse a flat theme JSON object into a CSS variable mapping', () => {
      const flatTheme = {
        'color-surface': '#ffffff',
        'color-primary': '#ff0000',
      };
      expect(parseTheme(flatTheme)).toEqual({
        'color-surface': '#ffffff',
        'color-primary': '#ff0000',
      });
    });

    it('should flatten single-level-nested theme objects using hyphen-joined keys', () => {
      const nested = {
        color: {
          surface: '#ffffff',
          primary: '#ff0000',
        },
      };
      expect(parseTheme(nested)).toEqual({
        'color-surface': '#ffffff',
        'color-primary': '#ff0000',
      });
    });

    it('should accept valid CSS value formats', () => {
      const theme = {
        'hex-short': '#fff',
        'hex-long': '#aabbcc',
        'hex-alpha': '#aabbccdd',
        'rgb-color': 'rgb(255, 0, 0)',
        'rgba-color': 'rgba(255, 0, 0, 0.5)',
        'hsl-color': 'hsl(120, 100%, 50%)',
        'hsla-color': 'hsla(120, 100%, 50%, 0.8)',
        'px-value': '16px',
        'rem-value': '1rem',
        'em-value': '0.5em',
        'percent-value': '100%',
        'named-color': 'red',
        'plain-number': '1.5',
      };
      const result = parseTheme(theme);
      expect(Object.keys(result)).toHaveLength(Object.keys(theme).length);
    });

    it('should reject CSS values with injection payloads', () => {
      const maliciousTheme = {
        'color-primary': 'red; display: none;',
        'spacing-sm': '10px } body { background: red; }',
        'valid-color': '#00ff00',
        'valid-spacing': '1rem',
      };

      const result = parseTheme(maliciousTheme);

      expect(result['valid-color']).toBe('#00ff00');
      expect(result['valid-spacing']).toBe('1rem');
      expect(result['color-primary']).toBeUndefined();
      expect(result['spacing-sm']).toBeUndefined();
    });

    it('should reject keys containing CSS control characters', () => {
      const maliciousKeys = {
        'color; } body { background: red; } /*': 'red',
        'normal-key': '#ff0000',
      };
      const result = parseTheme(maliciousKeys);
      expect(result['normal-key']).toBe('#ff0000');
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should block prototype pollution via __proto__, constructor, and prototype keys', () => {
      const malicious = JSON.parse(
        '{"__proto__": "polluted", "constructor": "replaced", "prototype": "replaced", "safe-key": "#ffffff"}'
      );

      const result = parseTheme(malicious);

      expect(result['safe-key']).toBe('#ffffff');
      // Verify no prototype pollution occurred on a fresh object
      expect(({} as Record<string, unknown>)['__proto__']).not.toBe('polluted');
    });

    it('should handle invalid input types gracefully', () => {
      expect(parseTheme(null)).toEqual({});
      expect(parseTheme(undefined)).toEqual({});
      expect(parseTheme('not an object')).toEqual({});
      expect(parseTheme(123)).toEqual({});
      expect(parseTheme([])).toEqual({});
    });
  });

  describe('injectTheme', () => {
    afterEach(() => {
      // Clean up all injected style tags
      document.head.querySelectorAll('style[data-origo-theme]').forEach(s => s.remove());
      // Remove theme-id attributes globally (including elements removed from body during the test)
      document.documentElement.removeAttribute('data-origo-theme-id');
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => el.removeAttribute('data-origo-theme-id'));
    });

    it('should inject CSS custom properties scoped to :root when no target is given', () => {
      injectTheme({
        'color-primary': '#ff0000',
        'spacing-sm': '4px',
      });

      const styleTag = document.head.querySelector('style[data-origo-theme="runtime"]');
      expect(styleTag).toBeTruthy();
      expect(styleTag?.textContent).toContain(':root');
      expect(styleTag?.textContent).toContain('--origo-color-primary: #ff0000;');
      expect(styleTag?.textContent).toContain('--origo-spacing-sm: 4px;');
    });

    it('should inject CSS scoped to the target element when a non-root target is provided', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);

      injectTheme({ 'color-primary': '#ff0000' }, target);

      const themeId = target.dataset['origoThemeId'];
      expect(themeId).toBeTruthy();

      const styleTag = document.head.querySelector(`style[data-origo-theme="${themeId}"]`);
      expect(styleTag).toBeTruthy();
      expect(styleTag?.textContent).toContain(`[data-origo-theme-id="${themeId}"]`);
      expect(styleTag?.textContent).not.toContain(':root');
      expect(styleTag?.textContent).toContain('--origo-color-primary: #ff0000;');

      document.body.removeChild(target);
    });

    it('should reuse the same data-origo-theme-id on repeated calls to the same target', () => {
      const target = document.createElement('div');
      document.body.appendChild(target);

      injectTheme({ 'color-primary': '#ff0000' }, target);
      const firstId = target.dataset['origoThemeId'];

      injectTheme({ 'color-primary': '#00ff00' }, target);
      const secondId = target.dataset['origoThemeId'];

      expect(firstId).toBe(secondId);
      const styles = document.head.querySelectorAll(`style[data-origo-theme="${firstId}"]`);
      expect(styles.length).toBe(1);
      expect(styles[0].textContent).toContain('--origo-color-primary: #00ff00;');

      document.body.removeChild(target);
    });

    it('should overwrite existing :root theme styles rather than adding multiple tags', () => {
      injectTheme({ 'color-primary': '#ff0000' });
      injectTheme({ 'color-primary': '#00ff00' });

      const styles = document.head.querySelectorAll('style[data-origo-theme="runtime"]');
      expect(styles.length).toBe(1);
      expect(styles[0].textContent).toContain('--origo-color-primary: #00ff00;');
    });

    it('should remove the style tag when an empty theme is injected, preventing stale overrides', () => {
      injectTheme({ 'color-primary': '#ff0000' });
      expect(document.head.querySelector('style[data-origo-theme="runtime"]')).toBeTruthy();

      injectTheme({});
      expect(document.head.querySelector('style[data-origo-theme="runtime"]')).toBeNull();
    });

    it('should not inject a style tag when all values fail sanitization', () => {
      injectTheme({ 'color-primary': 'red; display: none' });
      expect(document.head.querySelector('style[data-origo-theme="runtime"]')).toBeNull();
    });
  });
});
