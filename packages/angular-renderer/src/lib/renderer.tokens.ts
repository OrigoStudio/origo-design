import { InjectionToken, Type } from '@angular/core';

export const RENDERER_REGISTRY = new InjectionToken<Map<string, Type<unknown>>>(
  'RENDERER_REGISTRY',
  {
    providedIn: 'root',
    factory: () => new Map(),
  }
);
