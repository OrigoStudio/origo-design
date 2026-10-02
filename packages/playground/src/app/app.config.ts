import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideOrigo9Primitives } from '@origostudio/angular-renderer';

export const ORIGO_DOCS_URL = new InjectionToken<string>('ORIGO_DOCS_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideOrigo9Primitives(),
    { provide: ORIGO_DOCS_URL, useValue: 'https://origo-design-docs.netlify.app' },
  ],
};
