import { isDevMode } from '@angular/core';
import {
  initDevToolsBridge,
  getDevToolsAPI,
  RenderingPath,
  ErrorContext,
  _injectTestState,
  _resetTestState,
  appendErrorTelemetry,
} from './devtools-bridge';

// Mock Angular's isDevMode
jest.mock('@angular/core', () => ({
  isDevMode: jest.fn(),
}));

describe('DevTools Bridge', () => {
  let devModeMock: jest.Mock;

  beforeEach(() => {
    // Clear the global hook before each test
    delete window.__ORIGO_DEVTOOLS__;
    devModeMock = isDevMode as jest.Mock;
    _resetTestState();
  });

  describe('Initialization (Production Guard)', () => {
    it('should initialize and attach to window in dev mode', () => {
      devModeMock.mockReturnValue(true);
      initDevToolsBridge();
      expect(window.__ORIGO_DEVTOOLS__).toBeDefined();
    });

    it('should NOT initialize or attach to window in production mode', () => {
      devModeMock.mockReturnValue(false);
      initDevToolsBridge();
      expect(window.__ORIGO_DEVTOOLS__).toBeUndefined();
    });
  });

  describe('API Contracts and Data Shapes', () => {
    beforeEach(() => {
      devModeMock.mockReturnValue(true);
      initDevToolsBridge();
    });

    it('should expose getActiveState() returning current AST state', () => {
      const api = getDevToolsAPI()!;
      const state = api.getActiveState() as any;

      expect(state).toBeDefined();
      expect(state.entities).toBeDefined();
    });

    it('should use BADL semantic paths for telemetry identifiers', () => {
      const api = getDevToolsAPI()!;
      const path: RenderingPath | null = api.getRenderingPath('mock-element-id');

      // Should return a BADL semantic path format, not a DOM selector
      expect(path).toBeDefined();
      expect(path?.path).toMatch(/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/); // Basic BADL path validation
    });

    it('should return valid ErrorContext shape', () => {
      const api = getDevToolsAPI()!;
      appendErrorTelemetry({ message: 'test', stack: 'stack', badlPath: 'test' });
      const errorCtx: ErrorContext[] = api.getErrorTelemetry();

      expect(errorCtx).toBeDefined();
      expect(Array.isArray(errorCtx)).toBe(true);
      expect(errorCtx.length).toBe(1);
    });

    it('should return null for getMetadataSource and getResolutionChain', () => {
      const api = getDevToolsAPI()!;
      expect(api.getMetadataSource('any')).toBeNull();
      expect(api.getResolutionChain('any')).toBeNull();
    });
  });

  describe('Data Redaction', () => {
    beforeEach(() => {
      devModeMock.mockReturnValue(true);
      initDevToolsBridge();
    });

    it('should redact sensitive fields (passwords, PII, tokens) from state', () => {
      const api = getDevToolsAPI()!;

      _injectTestState({
        user: {
          name: 'John Doe',
          password: 'supersecret',
          ssn: '123-45-6789',
          apiKey: 'xyz123',
          token: 'jwt-123',
          secret: 'shh',
          nested: {
            appPassword: 'pwd',
          },
          nullField: null,
        },
      });

      const state = api.getActiveState() as any;

      expect(state.user.name).toBe('John Doe'); // Normal field kept
      expect(state.user.password).toBe('[REDACTED]');
      expect(state.user.ssn).toBe('[REDACTED]');
      expect(state.user.apiKey).toBe('[REDACTED]');
      expect(state.user.token).toBe('[REDACTED]');
      expect(state.user.secret).toBe('[REDACTED]');
      expect(state.user.nested.appPassword).toBe('[REDACTED]');
      expect(state.user.nullField).toBeNull();
    });

    it('should handle circular references without stack overflow', () => {
      const api = getDevToolsAPI()!;

      const circularState: any = { root: true };
      circularState.self = circularState;

      _injectTestState(circularState);

      const state = api.getActiveState() as any;
      expect(state.root).toBe(true);
      expect(state.self).toBe('[CIRCULAR]');
    });

    it('should not mark identical sibling references as circular', () => {
      const api = getDevToolsAPI()!;
      const sharedObj = { val: 42 };

      _injectTestState({
        a: sharedObj,
        b: sharedObj,
      });

      const state = api.getActiveState() as any;
      expect(state.a.val).toBe(42);
      expect(state.b.val).toBe(42);
      expect(state.a).not.toBe('[CIRCULAR]');
      expect(state.b).not.toBe('[CIRCULAR]');
    });
  });
});
