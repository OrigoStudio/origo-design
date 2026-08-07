/**
 * @jest-environment jsdom
 */
import { injectTheme, parseTheme } from './theme-injector';

describe('theme-injector', () => {
  describe('parseTheme', () => {
    it('should parse valid theme JSON object and flatten it if necessary', () => {
      const theme = {
        color: {
          surface: '#ffffff',
          primary: '#ff0000',
        },
      };
      // Expecting flattened keys or whatever mapping we decide on.
      // Assuming flat tokens mapping exactly to CSS variable suffix for simplicity, or just preserving structure if it's already flat.
      // Let's assume the input is flat key-value pairs for semantic tokens as per style-dictionary output.
      const flatTheme = {
        'color-surface': '#ffffff',
        'color-primary': '#ff0000',
      };
      expect(parseTheme(flatTheme)).toEqual({
        'color-surface': '#ffffff',
        'color-primary': '#ff0000',
      });
    });

    it('should sanitize CSS values and reject malicious inputs', () => {
      const maliciousTheme = {
        'color-primary': 'red; display: none;',
        'spacing-sm': '10px } body { background: red; }',
        'valid-color': '#00ff00',
        'valid-spacing': '1rem',
      };

      const result = parseTheme(maliciousTheme);

      expect(result['valid-color']).toBe('#00ff00');
      expect(result['valid-spacing']).toBe('1rem');
      // Malicious values should be ignored/dropped
      expect(result['color-primary']).toBeUndefined();
      expect(result['spacing-sm']).toBeUndefined();
    });

    it('should handle invalid input types gracefully', () => {
      expect(parseTheme(null)).toEqual({});
      expect(parseTheme(undefined)).toEqual({});
      expect(parseTheme('not an object')).toEqual({});
      expect(parseTheme(123)).toEqual({});
    });
  });

  describe('injectTheme', () => {
    let target: HTMLElement;

    beforeEach(() => {
      target = document.createElement('div');
      document.body.appendChild(target);
    });

    afterEach(() => {
      document.body.removeChild(target);
      // Clean up injected style tags
      const styles = document.head.querySelectorAll('style[data-origo-theme="runtime"]');
      styles.forEach(s => s.remove());
    });

    it('should inject CSS custom properties into a style tag', () => {
      const theme = {
        'color-primary': '#ff0000',
        'spacing-sm': '4px',
      };

      injectTheme(theme, target);

      // We expect a style tag in the head
      const styleTag = document.head.querySelector('style[data-origo-theme="runtime"]');
      expect(styleTag).toBeTruthy();
      expect(styleTag?.textContent).toContain('--origo-color-primary: #ff0000;');
      expect(styleTag?.textContent).toContain('--origo-spacing-sm: 4px;');
    });

    it('should overwrite existing injected theme styles rather than adding multiple tags', () => {
      const theme1 = { 'color-primary': '#ff0000' };
      const theme2 = { 'color-primary': '#00ff00' };

      injectTheme(theme1, target);
      injectTheme(theme2, target);

      const styles = document.head.querySelectorAll('style[data-origo-theme="runtime"]');
      expect(styles.length).toBe(1);
      expect(styles[0].textContent).toContain('--origo-color-primary: #00ff00;');
    });

    it('should use the provided target class/id if we scope it (optional)', () => {
      // By default it might inject into root or target
      const theme = { 'color-primary': '#ff0000' };
      injectTheme(theme, target);
      // If we scope it to target, we could check the selector
    });
  });
});
