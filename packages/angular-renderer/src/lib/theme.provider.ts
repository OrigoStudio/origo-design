import { APP_INITIALIZER, Provider, PLATFORM_ID, Optional } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

import { loadAndInjectTheme, injectTheme } from '@origo/design-tokens/runtime';

export interface OrigoThemeOptions {
  url?: string;
  theme?: Record<string, unknown>;
  targetElement?: HTMLElement | string;
}

export function themeInitializerFactory(
  optionsOrUrl: string | OrigoThemeOptions,
  platformId: object,
  document: Document | null
) {
  return () => {
    if (isPlatformBrowser(platformId)) {
      const isString = typeof optionsOrUrl === 'string';
      const url = isString ? optionsOrUrl : optionsOrUrl.url;
      const theme = isString ? undefined : optionsOrUrl.theme;
      // Resolve target element
      let target: HTMLElement | undefined;
      if (!isString && typeof optionsOrUrl.targetElement === 'string') {
        target = document?.querySelector(optionsOrUrl.targetElement) as HTMLElement | undefined;
        if (!target) {
          console.warn(
            `[origo-design] targetElement selector '${optionsOrUrl.targetElement}' matched nothing. Falling back to documentElement.`
          );
          target = document ? document.documentElement : undefined;
        }
      } else if (!isString && optionsOrUrl.targetElement instanceof HTMLElement) {
        target = optionsOrUrl.targetElement;
      } else {
        target = document ? document.documentElement : undefined;
      }

      if (theme && url) {
        const staticTeardown = injectTheme(theme, target);
        return loadAndInjectTheme(url, target)
          .then(fetchTeardown => {
            return () => {
              if (typeof staticTeardown === 'function') staticTeardown();
              fetchTeardown();
            };
          })
          .catch(e => {
            console.error('[origo-design] theme init failed', e);
            return typeof staticTeardown === 'function' ? staticTeardown : () => undefined;
          });
      } else if (theme) {
        const teardown = injectTheme(theme, target);
        return Promise.resolve(typeof teardown === 'function' ? teardown : () => undefined);
      } else if (url) {
        return loadAndInjectTheme(url, target).catch(e => {
          console.error('[origo-design] theme init failed', e);
          return () => undefined;
        });
      } else {
        console.warn('[origo-design] options provided with neither theme nor url');
        return Promise.resolve(() => undefined);
      }
    }
    return Promise.resolve();
  };
}

/**
 * Provides the Origo Design theme initialization for the Angular Web Adapter.
 *
 * @param optionsOrUrl URL string to the theme.json file, or an options object configuring the theme.
 */
export function provideOrigoTheme(optionsOrUrl: string | OrigoThemeOptions): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (platformId: object, document: Document | null) =>
        themeInitializerFactory(optionsOrUrl, platformId, document),
      deps: [PLATFORM_ID, [new Optional(), DOCUMENT]],
      multi: true,
    },
  ];
}
