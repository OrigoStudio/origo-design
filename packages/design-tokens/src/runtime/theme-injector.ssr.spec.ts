/**
 * @jest-environment node
 */
import { injectTheme } from './theme-injector';

describe('theme-injector (SSR Environment)', () => {
  it('should return a no-op teardown and do nothing in SSR environments (document is undefined)', () => {
    // In @jest-environment node, document is natively undefined.
    expect(typeof document).toBe('undefined');

    const teardown = injectTheme({ 'color-primary': '#ff0000' });

    expect(typeof teardown).toBe('function');
    expect(() => teardown()).not.toThrow();
  });
});
