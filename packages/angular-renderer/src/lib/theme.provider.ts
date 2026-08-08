import { APP_INITIALIZER, Provider, PLATFORM_ID, Optional } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

import { loadAndInjectTheme } from '@origo/design-tokens/runtime';

export function themeInitializerFactory(
  url: string,
  platformId: object,
  document: Document | null
) {
  return () => {
    if (isPlatformBrowser(platformId)) {
      const target = document ? document.documentElement : undefined;
      return loadAndInjectTheme(url, target);
    }
    return Promise.resolve();
  };
}

/**
 * Provides the Origo Design theme initialization for the Angular Web Adapter.
 *
 * @param themeUrl URL to the theme.json file to fetch and apply at runtime.
 */
export function provideOrigoTheme(themeUrl: string): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: (platformId: object, document: Document | null) =>
        themeInitializerFactory(themeUrl, platformId, document),
      deps: [PLATFORM_ID, [new Optional(), DOCUMENT]],
      multi: true,
    },
  ];
}
