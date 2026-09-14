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
  getRenderingPath: (elementId: string) => RenderingPath | null;
  getErrorTelemetry: () => ErrorContext[];
  __injectTestState: (state: unknown) => void;
}

declare global {
  interface Window {
    __ORIGO_DEVTOOLS__?: OrigoDevToolsAPI;
  }
}

// Sensitive keys to redact
const SENSITIVE_KEYS = new Set(['password', 'ssn', 'apikey', 'token', 'secret']);

function redactSensitiveData(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase()) || key.toLowerCase().includes('password')) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

// In-memory mock state for dev tools (to be replaced by actual AST bindings in future epics)
let _internalState: unknown = {
  entities: [],
};

const _errorTelemetry: ErrorContext[] = [];

export function getDevToolsAPI(): OrigoDevToolsAPI {
  return {
    getActiveState: () => redactSensitiveData(_internalState),
    getRenderingPath: (elementId: string) => {
      // Mock BADL semantic path
      return { path: `root.components.${elementId}` };
    },
    getErrorTelemetry: () => _errorTelemetry,
    __injectTestState: (state: unknown) => {
      _internalState = state;
    },
  };
}

export function initDevToolsBridge(): void {
  if (!isDevMode()) {
    return;
  }

  if (typeof window !== 'undefined') {
    window.__ORIGO_DEVTOOLS__ = getDevToolsAPI();
  }
}
