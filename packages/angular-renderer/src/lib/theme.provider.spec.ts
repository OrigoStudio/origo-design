import '@angular/compiler';
import { provideOrigoTheme, themeInitializerFactory, OrigoThemeOptions } from './theme.provider';
import { APP_INITIALIZER, FactoryProvider } from '@angular/core';

import * as runtime from '@origo/design-tokens/runtime';

jest.mock('@origo/design-tokens/runtime', () => ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadAndInjectTheme: jest.fn().mockResolvedValue(() => {}),
  injectTheme: jest.fn(),
}));

describe('theme.provider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('themeInitializerFactory', () => {
    it('should call loadAndInjectTheme when string URL is provided in browser', async () => {
      const mockDocument = { documentElement: {} } as unknown as Document;
      const factory = themeInitializerFactory(
        '/test.json',
        'browser' as unknown as object,
        mockDocument
      );

      await factory();

      expect(runtime.loadAndInjectTheme).toHaveBeenCalledWith(
        '/test.json',
        mockDocument.documentElement
      );
    });

    it('should call loadAndInjectTheme when options.url is provided in browser', async () => {
      const mockDocument = { documentElement: {} } as unknown as Document;
      const options: OrigoThemeOptions = { url: '/options.json' };
      const factory = themeInitializerFactory(
        options,
        'browser' as unknown as object,
        mockDocument
      );

      await factory();

      expect(runtime.loadAndInjectTheme).toHaveBeenCalledWith(
        '/options.json',
        mockDocument.documentElement
      );
    });

    it('should call injectTheme directly when options.theme is provided in browser', async () => {
      const mockDocument = { documentElement: {} } as unknown as Document;
      const theme = { 'color-primary': '#000' };
      const options: OrigoThemeOptions = { theme };
      const factory = themeInitializerFactory(
        options,
        'browser' as unknown as object,
        mockDocument
      );

      await factory();

      expect(runtime.injectTheme).toHaveBeenCalledWith(theme, mockDocument.documentElement);
      expect(runtime.loadAndInjectTheme).not.toHaveBeenCalled();
    });

    it('should not call any injection when not in browser (SSR)', async () => {
      const mockDocument = { documentElement: {} } as unknown as Document;
      const factory = themeInitializerFactory(
        '/test.json',
        'server' as unknown as object,
        mockDocument
      );

      await factory();

      expect(runtime.loadAndInjectTheme).not.toHaveBeenCalled();
      expect(runtime.injectTheme).not.toHaveBeenCalled();
    });
  });

  describe('provideOrigoTheme', () => {
    it('should return a provider array with APP_INITIALIZER', () => {
      const providers = provideOrigoTheme('/test.json');
      expect(providers.length).toBe(1);
      const provider = providers[0] as FactoryProvider;
      expect(provider.provide).toBe(APP_INITIALIZER);
      expect(provider.multi).toBe(true);
    });
  });
});
