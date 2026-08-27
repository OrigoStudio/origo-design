### AD-9 — Web Worker CSP & Isolation Strategy for @origo/playground

- **Binds:** `@origo/playground` live-preview compilation pipeline and Monaco Editor worker environment.
- **Prevents:** Content Security Policy (CSP) violations in sandboxed documentation iframe island (`sandbox="allow-scripts allow-same-origin"` with `default-src 'self'; script-src 'self'; worker-src 'self'; connect-src 'self'`) that would block AST validation, Monaco JSON language worker, or preview rendering.
- **Rule:** 
  1. Use dedicated Web Worker bundles (`worker.format: 'es'` or Vite `iife` worker emission) instantiated via `new Worker(new URL('...', import.meta.url))` to ensure worker scripts are fetched from `src 'self'` file origins rather than inline blob URLs (`blob:`).
  2. Implement **Comlink** for typed RPC communication between the main UI thread and the `@origo/core` worker thread.
  3. Pre-bundle `badl.schema.json` directly into `@origo/playground` build assets and register it synchronously via Monaco's `monaco.languages.json.jsonDefaults.setDiagnosticsOptions`, avoiding dynamic remote schema fetching under strict `connect-src 'self'`.

#### Findings & Architectural Specifications

- **`@origo/core` CSP Compatibility:** **Pass**. Static audit of `packages/core/src/` confirms zero usage of `eval`, `new Function`, `window`, `document`, `XMLHttpRequest`, or un-sandboxed dynamic `import()`. Both `BADLValidator` and `validateAST` reference only `self`-compatible globals and execute within browser Web Workers under strict CSP without throwing runtime exceptions or CSP violations.
- **Monaco Worker CSP Compatibility Strategy:** **Recommended Design Strategy (To Be Empirically Validated in Story 7.1)**. Monaco Editor's default worker instantiation relies on `URL.createObjectURL(new Blob([...]))`, which violates strict `worker-src 'self'`. In Story 7.1, Monaco workers (`editor.worker`, `json.worker`) MUST be configured via `MonacoEnvironment.getWorker` using standard `new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url), { type: 'module' })` constructs so bundlers (Vite / Rollup) emit physical standalone `.js` files satisfying `worker-src 'self'`.
- **JSON Schema Resolution (`$ref`) under Strict CSP:** Monaco's JSON language worker requires access to `@origo/core`'s BADL schema. To prevent `connect-src` or blob URI violations, `badl.schema.json` will be imported statically at build time into `@origo/playground` and registered directly with `jsonDefaults.setDiagnosticsOptions({ validate: true, schemas: [{ uri: 'https://origo.design/schemas/badl.json', fileMatch: ['*'], schema: badlSchema }] })`.
- **Worker RPC Communication Protocol:** Raw `postMessage` is error-prone for multi-method compiler workers. `@origo/playground` will use `comlink` to expose a strongly-typed proxy wrapper around `BADLValidator` and `validateAST`.
- **AST Serialization & Latency Guidelines (Story 7.3):** For large BADL documents, structured clone transfer of AST objects can introduce main thread latency. The worker pipeline should benchmark raw AST vs stringified JSON transfer and adopt `Transferable` ArrayBuffers if AST payload sizes exceed 500KB.
- **Starlight Iframe Island Constraints (P1-AD-8):** The playground component runs within a sandboxed `<iframe>` embedded in Starlight docs. The iframe host MUST declare `sandbox="allow-scripts allow-same-origin"` to enable Web Worker instantiation over `src 'self'` origins.

#### Architectural Contracts for Epic 7 Implementation
1. **No CDN Loaders:** Do NOT use `@monaco-editor/loader`'s default CDN approach as it requires external scripts and blobs.
2. **Explicit Bundled Workers:** Instantiate Monaco workers explicitly in the `@origo/playground` entry point using standard Vite/Rollup native module worker syntax.
3. **Zero Core Polyfills:** `validateAST` and `BADLValidator` from `@origo/core` can be imported directly and run in Web Worker context (`self`) without polyfills.
