import { isDevMode } from '@angular/core';
import { initDevToolsBridge, getDevToolsAPI, RenderingPath, ErrorContext } from './devtools-bridge';

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
      const api = getDevToolsAPI();
      const state = api.getActiveState() as any;

      expect(state).toBeDefined();
      expect(state.entities).toBeDefined();
    });

    it('should use BADL semantic paths for telemetry identifiers', () => {
      const api = getDevToolsAPI();
      const path: RenderingPath | null = api.getRenderingPath('mock-element-id');

      // Should return a BADL semantic path format, not a DOM selector
      expect(path).toBeDefined();
      expect(path?.path).toMatch(/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/); // Basic BADL path validation
    });

    it('should return valid ErrorContext shape', () => {
      const api = getDevToolsAPI();
      const errorCtx: ErrorContext[] = api.getErrorTelemetry();

      expect(errorCtx).toBeDefined();
      expect(Array.isArray(errorCtx)).toBe(true);
    });
  });

  describe('Data Redaction', () => {
    beforeEach(() => {
      devModeMock.mockReturnValue(true);
      initDevToolsBridge();
    });

    it('should redact sensitive fields (passwords, PII) from state', () => {
      const api = getDevToolsAPI();

      // Assuming we have a way to inject mock state into the bridge for testing
      api.__injectTestState({
        user: {
          name: 'John Doe',
          password: 'supersecret',
          ssn: '123-45-6789',
          apiKey: 'xyz123',
        },
      });

      const state = api.getActiveState() as any;

      expect(state.user.name).toBe('John Doe'); // Normal field kept
      expect(state.user.password).toBe('[REDACTED]');
      expect(state.user.ssn).toBe('[REDACTED]');
      expect(state.user.apiKey).toBe('[REDACTED]');
    });
  });
});
