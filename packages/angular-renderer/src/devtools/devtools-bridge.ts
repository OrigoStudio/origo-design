import { isDevMode } from '@angular/core';

export interface MetadataSource {
  file: string;
  line: number;
}

export interface ResolutionChain {
  steps: string[];
}

export interface RenderingPath {
  name: string;
  badlPath: string;
  children?: RenderingPath[];
}

export interface ErrorContext {
  message: string;
  stack: string;
  badlPath: string;
}

export interface OrigoDevToolsAPI {
  getActiveState: () => unknown;
  getRenderingPath: (path: string) => RenderingPath | null;
  getMetadataSource: (path: string) => MetadataSource | null;
  getResolutionChain: (path: string) => ResolutionChain | null;
  getErrorTelemetry: () => ErrorContext[];
}

declare global {
  interface Window {
    __ORIGO_DEVTOOLS__?: OrigoDevToolsAPI;
  }
}

// Sensitive keys to redact
const SENSITIVE_KEYS = new Set(['password', 'ssn', 'apikey', 'token', 'secret']);

function redactSensitiveData(obj: unknown, seen = new WeakSet()): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (seen.has(obj)) {
    return '[CIRCULAR]';
  }
  seen.add(obj);

  let result: unknown;
  if (Array.isArray(obj)) {
    result = obj.map(item => redactSensitiveData(item, seen));
  } else {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase()) || key.toLowerCase().includes('password')) {
        redacted[key] = '[REDACTED]';
      } else if (value !== null && typeof value === 'object') {
        redacted[key] = redactSensitiveData(value, seen);
      } else {
        redacted[key] = value;
      }
    }
    result = redacted;
  }

  seen.delete(obj);
  return result;
}

// In-memory mock state for dev tools (to be replaced by actual AST bindings in future epics)
let _internalState: unknown = {
  entities: [],
};

let _errorTelemetry: ErrorContext[] = [];

export function _injectTestState(state: unknown): void {
  _internalState = state;
}

export function _resetTestState(): void {
  _internalState = { entities: [] };
  _errorTelemetry = [];
}

export function appendErrorTelemetry(error: ErrorContext): void {
  _errorTelemetry.push(error);
}

export function getDevToolsAPI(): OrigoDevToolsAPI | null {
  if (!isDevMode()) {
    return null;
  }

  return {
    getActiveState: () => redactSensitiveData(_internalState),
    getRenderingPath: (path: string) => {
      // Build a tree from _internalState
      const state: any = _internalState;

      if (state && state.id === 'dom-identity') {
        // Map the provided JSON to a tree
        const root: RenderingPath = {
          name: state.name || 'Root',
          badlPath: `/${state.domain || 'core'}/${state.id}`,
          children: (state.entities || []).map((ent: any) => ({
            name: ent.name,
            badlPath: `/${state.domain || 'core'}/${state.id}/${ent.id}`,
            children: (ent.fields || []).map((fld: any) => ({
              name: fld.name,
              badlPath: fld.metadata_path || `/${ent.id}/${fld.id}`,
            })),
          })),
        };
        return root;
      }

      // Default fallback
      return {
        name: 'Root Application',
        badlPath: '/',
        children: [],
      };
    },
    getMetadataSource: (path: string) => {
      // Find the object in _internalState that matches the path
      const state: any = _internalState;
      if (state && state.id === 'dom-identity') {
        // Return the whole state for root, or specific parts based on path
        if (path === `/${state.domain || 'core'}/${state.id}`) return state as any;

        for (const ent of state.entities || []) {
          if (path === `/${state.domain || 'core'}/${state.id}/${ent.id}`) return ent;
          for (const fld of ent.fields || []) {
            if (path === (fld.metadata_path || `/${ent.id}/${fld.id}`)) return fld;
          }
        }
      }
      return { file: 'mock.json', line: 1 } as any;
    },
    getResolutionChain: (path: string) => {
      return null;
    },
    getErrorTelemetry: () => _errorTelemetry,
  };
}

export function initDevToolsBridge(): void {
  if (!isDevMode()) {
    return;
  }

  const api = getDevToolsAPI();
  if (api && typeof window !== 'undefined') {
    window.__ORIGO_DEVTOOLS__ = api;
  }
}
