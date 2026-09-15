Invoke the `bmad-review-adversarial-general` skill on this diff:

```diff
diff --git a/apps/docs/src/content/docs/reference/diagnostics-api.mdx b/apps/docs/src/content/docs/reference/diagnostics-api.mdx
index b1112d7..4ad7cd7 100644
--- a/apps/docs/src/content/docs/reference/diagnostics-api.mdx
+++ b/apps/docs/src/content/docs/reference/diagnostics-api.mdx
@@ -21,12 +21,12 @@ const api = window.__ORIGO_DEVTOOLS__;
 
 Retrieves the current evaluated AST state of the renderer, simulating the payload Origo Studio would receive.
 
-- **Returns**: `Object` - The full canonical state object.
+- **Returns**: `unknown` - The full canonical state object, with sensitive fields redacted.
 - **Security Note**: This method applies automatic redaction. Fields matching standard sensitive patterns (e.g., `password`, `ssn`, `apiKey`, `token`, `secret`) will be replaced with `"[REDACTED]"`.
 
 ### `getRenderingPath(elementId: string)`
 
-Resolves a DOM element ID back to its semantic rendering path within the Origo BADL AST.
+Resolves a DOM element ID back to its semantic rendering path within the Origo BADL AST. Note: this accepts a BADL semantic path, not a literal DOM ID.
 
 - **Parameters**:
   - `elementId` (string): The ID of the DOM element.
@@ -37,6 +37,30 @@ Resolves a DOM element ID back to its semantic rendering path within the Origo B
   const path = window.__ORIGO_DEVTOOLS__.getRenderingPath('user-profile-card');
   ```
 
+### `getMetadataSource(path: string)`
+
+Retrieves the source file and line number mapping for a given BADL path.
+
+- **Parameters**:
+  - `path` (string): The BADL semantic path.
+- **Returns**: `MetadataSource | null` - The metadata source object or null if not found.
+- **Example**:
+  ```typescript
+  const source = window.__ORIGO_DEVTOOLS__.getMetadataSource('root.components.header-nav');
+  ```
+
+### `getResolutionChain(path: string)`
+
+Retrieves the resolution steps (e.g., for properties or themes) for a given BADL path.
+
+- **Parameters**:
+  - `path` (string): The BADL semantic path.
+- **Returns**: `ResolutionChain | null` - The resolution chain object or null if not found.
+- **Example**:
+  ```typescript
+  const chain = window.__ORIGO_DEVTOOLS__.getResolutionChain('root.components.header-nav');
+  ```
+
 ### `getErrorTelemetry()`
 
 Retrieves detailed error boundary telemetry, including recent errors and their context.
diff --git a/packages/angular-renderer/src/devtools/devtools-bridge.spec.ts b/packages/angular-renderer/src/devtools/devtools-bridge.spec.ts
index 58f041b..4066e53 100644
--- a/packages/angular-renderer/src/devtools/devtools-bridge.spec.ts
+++ b/packages/angular-renderer/src/devtools/devtools-bridge.spec.ts
@@ -1,5 +1,5 @@
 import { isDevMode } from '@angular/core';
-import { initDevToolsBridge, getDevToolsAPI, RenderingPath, ErrorContext } from './devtools-bridge';
+import { initDevToolsBridge, getDevToolsAPI, RenderingPath, ErrorContext, _injectTestState, _resetTestState, appendErrorTelemetry } from './devtools-bridge';
 
 // Mock Angular's isDevMode
 jest.mock('@angular/core', () => ({
@@ -13,6 +13,7 @@ describe('DevTools Bridge', () => {
     // Clear the global hook before each test
     delete window.__ORIGO_DEVTOOLS__;
     devModeMock = isDevMode as jest.Mock;
+    _resetTestState();
   });
 
   describe('Initialization (Production Guard)', () => {
@@ -36,7 +37,7 @@ describe('DevTools Bridge', () => {
     });
 
     it('should expose getActiveState() returning current AST state', () => {
-      const api = getDevToolsAPI();
+      const api = getDevToolsAPI()!;
       const state = api.getActiveState() as any;
 
       expect(state).toBeDefined();
@@ -44,7 +45,7 @@ describe('DevTools Bridge', () => {
     });
 
     it('should use BADL semantic paths for telemetry identifiers', () => {
-      const api = getDevToolsAPI();
+      const api = getDevToolsAPI()!;
       const path: RenderingPath | null = api.getRenderingPath('mock-element-id');
 
       // Should return a BADL semantic path format, not a DOM selector
@@ -53,11 +54,13 @@ describe('DevTools Bridge', () => {
     });
 
     it('should return valid ErrorContext shape', () => {
-      const api = getDevToolsAPI();
+      const api = getDevToolsAPI()!;
+      appendErrorTelemetry({ message: 'test', stack: 'stack', badlPath: 'test' });
       const errorCtx: ErrorContext[] = api.getErrorTelemetry();
 
       expect(errorCtx).toBeDefined();
       expect(Array.isArray(errorCtx)).toBe(true);
+      expect(errorCtx.length).toBe(1);
     });
   });
 
@@ -67,16 +70,21 @@ describe('DevTools Bridge', () => {
       initDevToolsBridge();
     });
 
-    it('should redact sensitive fields (passwords, PII) from state', () => {
-      const api = getDevToolsAPI();
+    it('should redact sensitive fields (passwords, PII, tokens) from state', () => {
+      const api = getDevToolsAPI()!;
 
-      // Assuming we have a way to inject mock state into the bridge for testing
-      api.__injectTestState({
+      _injectTestState({
         user: {
           name: 'John Doe',
           password: 'supersecret',
           ssn: '123-45-6789',
           apiKey: 'xyz123',
+          token: 'jwt-123',
+          secret: 'shh',
+          nested: {
+            appPassword: 'pwd'
+          },
+          nullField: null
         },
       });
 
@@ -86,6 +94,23 @@ describe('DevTools Bridge', () => {
       expect(state.user.password).toBe('[REDACTED]');
       expect(state.user.ssn).toBe('[REDACTED]');
       expect(state.user.apiKey).toBe('[REDACTED]');
+      expect(state.user.token).toBe('[REDACTED]');
+      expect(state.user.secret).toBe('[REDACTED]');
+      expect(state.user.nested.appPassword).toBe('[REDACTED]');
+      expect(state.user.nullField).toBeNull();
+    });
+
+    it('should handle circular references without stack overflow', () => {
+      const api = getDevToolsAPI()!;
+      
+      const circularState: any = { root: true };
+      circularState.self = circularState;
+      
+      _injectTestState(circularState);
+      
+      const state = api.getActiveState() as any;
+      expect(state.root).toBe(true);
+      expect(state.self).toBe('[CIRCULAR]');
     });
   });
 });
diff --git a/packages/angular-renderer/src/devtools/devtools-bridge.ts b/packages/angular-renderer/src/devtools/devtools-bridge.ts
index fedfeb2..6208c16 100644
--- a/packages/angular-renderer/src/devtools/devtools-bridge.ts
+++ b/packages/angular-renderer/src/devtools/devtools-bridge.ts
@@ -22,8 +22,9 @@ export interface ErrorContext {
 export interface OrigoDevToolsAPI {
   getActiveState: () => unknown;
   getRenderingPath: (elementId: string) => RenderingPath | null;
+  getMetadataSource: (path: string) => MetadataSource | null;
+  getResolutionChain: (path: string) => ResolutionChain | null;
   getErrorTelemetry: () => ErrorContext[];
-  __injectTestState: (state: unknown) => void;
 }
 
 declare global {
@@ -35,21 +36,26 @@ declare global {
 // Sensitive keys to redact
 const SENSITIVE_KEYS = new Set(['password', 'ssn', 'apikey', 'token', 'secret']);
 
-function redactSensitiveData(obj: unknown): unknown {
-  if (!obj || typeof obj !== 'object') {
+function redactSensitiveData(obj: unknown, seen = new WeakSet()): unknown {
+  if (obj === null || typeof obj !== 'object') {
     return obj;
   }
 
+  if (seen.has(obj)) {
+    return '[CIRCULAR]';
+  }
+  seen.add(obj);
+
   if (Array.isArray(obj)) {
-    return obj.map(item => redactSensitiveData(item));
+    return obj.map(item => redactSensitiveData(item, seen));
   }
 
   const redacted: Record<string, unknown> = {};
   for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
     if (SENSITIVE_KEYS.has(key.toLowerCase()) || key.toLowerCase().includes('password')) {
       redacted[key] = '[REDACTED]';
-    } else if (typeof value === 'object') {
-      redacted[key] = redactSensitiveData(value);
+    } else if (value !== null && typeof value === 'object') {
+      redacted[key] = redactSensitiveData(value, seen);
     } else {
       redacted[key] = value;
     }
@@ -62,19 +68,39 @@ let _internalState: unknown = {
   entities: [],
 };
 
-const _errorTelemetry: ErrorContext[] = [];
+let _errorTelemetry: ErrorContext[] = [];
+
+export function _injectTestState(state: unknown): void {
+  _internalState = state;
+}
+
+export function _resetTestState(): void {
+  _internalState = { entities: [] };
+  _errorTelemetry = [];
+}
+
+export function appendErrorTelemetry(error: ErrorContext): void {
+  _errorTelemetry.push(error);
+}
+
+export function getDevToolsAPI(): OrigoDevToolsAPI | null {
+  if (!isDevMode()) {
+    return null;
+  }
 
-export function getDevToolsAPI(): OrigoDevToolsAPI {
   return {
     getActiveState: () => redactSensitiveData(_internalState),
     getRenderingPath: (elementId: string) => {
       // Mock BADL semantic path
       return { path: `root.components.${elementId}` };
     },
-    getErrorTelemetry: () => _errorTelemetry,
-    __injectTestState: (state: unknown) => {
-      _internalState = state;
+    getMetadataSource: (path: string) => {
+      return { file: 'mock.ts', line: 1 };
+    },
+    getResolutionChain: (path: string) => {
+      return { steps: ['mock_step'] };
     },
+    getErrorTelemetry: () => _errorTelemetry,
   };
 }
 
@@ -83,7 +109,8 @@ export function initDevToolsBridge(): void {
     return;
   }
 
-  if (typeof window !== 'undefined') {
-    window.__ORIGO_DEVTOOLS__ = getDevToolsAPI();
+  const api = getDevToolsAPI();
+  if (api && typeof window !== 'undefined') {
+    window.__ORIGO_DEVTOOLS__ = api;
   }
 }
```
