import { InjectionToken, Type } from '@angular/core';

// Batch 1 primitives moved to primitives.provider.ts

export const RENDERER_REGISTRY = new InjectionToken<Map<string, Type<unknown>>>(
  'RENDERER_REGISTRY',
  {
    providedIn: 'root',
    factory: () => new Map(),
  }
);
