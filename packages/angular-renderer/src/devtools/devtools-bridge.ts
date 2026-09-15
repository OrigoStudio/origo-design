import { isDevMode } from '@angular/core';

export interface MetadataSource {
  file: string;
  line: number;
}

export interface ResolutionChain {
  steps: string[];
}

export interface RenderingPath {
  path: string; // BADL semantic path
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
      // Mock BADL semantic path
      return { path: `root.components.${path}` };
    },
    getMetadataSource: (path: string) => {
      return null;
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
