### AD-9 — Web Worker CSP Strategy for @origo/playground

- **Binds:** @origo/playground live-preview compilation pipeline
- **Prevents:** CSP violations in the documentation iframe that would block the Monaco editor or live compiler from executing
- **Rule:** Use Vite's native worker plugin with `worker.format: 'es'` (or default `iife` which emits a separate file) and load Monaco editor workers by returning `new Worker(new URL('...', import.meta.url), { type: 'module' })` in the `getWorker` environment setup. This satisfies `worker-src 'self'` and avoids blob URL generation.

#### Findings
- **@origo/core CSP compatibility:** **Pass**. A comprehensive search of `packages/core/src/` confirms there are no usages of `eval`, `new Function`, `window`, `document`, `XMLHttpRequest`, or dynamic `import()`. The AST validation and compiler functions (`BADLValidator`, `validateAST`) were executed in both a Node `worker_threads` context and a browser web worker context with strict CSP headers (`default-src 'self'; script-src 'self'; worker-src 'self'`), successfully compiling the real-world fixture `target-page.json` without throwing any runtime errors or CSP violations.
- **Monaco worker CSP compatibility:** **Pass**. By default, Monaco creates web workers using `URL.createObjectURL(new Blob([...]))`, which violates `worker-src 'self'` by requiring `blob:`. However, when using Vite (the project bundler) and explicitly providing a `getWorker` function that instantiates workers using standard `new Worker(new URL('...', import.meta.url))`, Vite's worker plugin automatically bundles the worker into a standalone `.js` file. The browser then fetches this file via `src 'self'`, fully complying with the strict CSP requirements.
- **Recommended mitigation for Epic 7:**
  1. Do not use `@monaco-editor/loader`'s default CDN approach as it requires external scripts and blobs.
  2. Instantiate Monaco workers explicitly in the `@origo/playground` entry point using the Vite native worker syntax.
  3. The `validateAST` and `BADLValidator` functions from `@origo/core` can be imported directly and run in the web worker without any modifications or polyfills.
