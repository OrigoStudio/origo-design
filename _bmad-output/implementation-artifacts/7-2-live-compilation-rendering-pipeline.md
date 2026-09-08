---
baseline_commit: a46ef37b41639c99f854d299db96ba47164843c4
---
# Story 7.2: Live Compilation & Rendering Pipeline

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want the playground editor to instantly render the BADL I type,
So that I can see immediate visual feedback for my schema changes.

## Acceptance Criteria

1. [AC-1] Given the Playground editor, When I type valid BADL syntax, Then the browser runs the core compiler (from `@origo/core`) to generate an AST **inside a Web Worker** (off the main thread).
2. [AC-2] And the resolved AST is passed to the Angular rendering pipeline (from `@origo/angular-renderer`) to update the live preview pane.
3. [AC-3] And the rendered preview pane executes inside a **strictly sandboxed iframe** with a restrictive CSP (`sandbox="allow-scripts allow-same-origin"`, `default-src 'self'; script-src 'self'; worker-src 'self'; connect-src 'self'`) to prevent self-XSS attacks (FR-DX-004).
4. [AC-4] And if the BADL is invalid, compiler errors from the worker are displayed gracefully in the UI (an error panel below or beside the preview) instead of crashing the app — zero unhandled promise rejections.
5. [AC-5] And the compilation pipeline is debounced (300–500 ms after last keystroke) so rapid typing does not spam the worker with compilation requests.

## Tasks / Subtasks

- [ ] Task 1: Implement the Compiler Web Worker (AC: 1, 4)
  - [ ] Create `packages/playground/src/workers/compiler.worker.ts`
  - [ ] Expose a `CompilerWorker` class via **Comlink** (`comlink.expose`) with a single async method: `compile(badlJson: string): Promise<{ ast?: BADLDocument; errors?: CompilerError[] }>`
  - [ ] Import `validateAST` and `BADLValidator` from `@origo/core` directly (zero polyfills needed in Worker context per AD-9 spike findings)
  - [ ] Bundle the worker using Vite's native worker syntax: `new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' })` — NEVER use `blob:` URL approach
  - [ ] Ensure the worker properly handles and serializes validation errors into structured `CompilerError[]` objects

- [ ] Task 2: Wire Up Debounced Compilation in the Preview Service (AC: 1, 4, 5)
  - [ ] Create `packages/playground/src/preview/preview.service.ts` as an Angular injectable service
  - [ ] Create a Comlink proxy to the compiler worker using `comlink.wrap<CompilerWorker>(worker)`
  - [ ] Implement debounce: accept editor content change events, debounce 400ms using native `setTimeout` / `clearTimeout` closure inside an Angular `effect()` or service method (DO NOT use `rxjs`), then call `workerProxy.compile(content)`
  - [ ] Expose compilation results via Angular Signals: `compiledAst = signal<BADLDocument | null>(null)` and `compilationErrors = signal<CompilerError[]>([])`
  - [ ] Handle worker errors: on unrecoverable crash, call `worker.terminate()` and re-instantiate both `new Worker(...)` and `comlink.wrap()` to prevent memory leaks and zombie proxies

- [ ] Task 3: Integrate with Preview Pane Component (AC: 2, 3)
  - [ ] Create `packages/playground/src/preview/preview-pane.component.ts` as Angular 18 Standalone Component with `origo-playground-preview` selector
  - [ ] The preview pane renders `@origo/angular-renderer` primitives driven by `compiledAst` signal — NOT a mock renderer
  - [ ] Wrap the rendered preview output in a sandboxed `<iframe sandbox="allow-scripts allow-same-origin">` whose content is served from a self-hosted static asset (e.g., `/assets/preview.html` provided by the workspace dev server) which bootstraps the renderer
  - [ ] On `compiledAst` change (via `effect()`), post the resolved AST into the iframe via simple structured clone (`postMessage` default)
  - [ ] Implement iframe resize / responsive layout so preview fills the right-hand split pane

- [ ] Task 4: Error Display Component (AC: 4)
  - [ ] Create `packages/playground/src/preview/error-display.component.ts` as Standalone Component with `origo-playground-error-display` selector
  - [ ] Display `compilationErrors` signal: show file path, line/column, message in a scrollable list beneath or beside the preview
  - [ ] When errors is empty array, hide completely (no visual noise)
  - [ ] Show a distinct "Syntax Error" vs "Semantic Error" badge per `CompilerError.type` using semantic design tokens from `@origo/design-tokens` (e.g., `var(--origo-color-danger)` and `var(--origo-color-warning)`)

- [ ] Task 5: Connect Editor to Pipeline (AC: 1, 5)
  - [ ] In the `origo-playground-editor` component (from Story 7.1), emit an `editorContentChange` output event on every Monaco `onDidChangeModelContent`
  - [ ] In `PlaygroundComponent` (root shell), subscribe to `editorContentChange` and pipe into `PreviewService.onContentChange(value)`

- [ ] Task 6: Testing (AC: 1, 2, 3, 4, 5)
  - [ ] Vitest unit test for `compiler.worker.ts` logic (non-worker context): valid BADL → returns AST; invalid BADL → returns errors; empty string → returns empty-document error
  - [ ] Playwright E2E test: load playground, type a valid BADL snippet, assert preview pane renders a recognizable element
  - [ ] Playwright E2E test: type invalid JSON, assert error panel appears with at least one error message; assert no unhandled promise rejections in console
  - [ ] Playwright E2E test: verify iframe `sandbox` attribute is set and `allow-scripts allow-same-origin` are the only tokens (CSP compliance)
  - [ ] axe-core Playwright test on preview + error panel (WCAG 2.1 AA, per P1-AD-6)

### Review Findings

- [ ] [Review][Decision] ESLint Tag Relaxation — `eslint.config.js` adds `'type:lib'` to the allowed tags list silently. Should this be reverted, or is there a valid reason?
- [ ] [Review][Patch] Iframe renders full app instead of isolated renderer / Double Worker [packages/playground/src/preview/preview-pane.component.html:8]
- [ ] [Review][Patch] Broken Comlink expose in module worker [packages/playground/src/workers/compiler.worker.ts:61]
- [ ] [Review][Patch] Missing postMessage origin check [packages/playground/src/preview/preview-root.component.ts]
- [ ] [Review][Patch] Missing CSP meta tag in iframe [packages/playground/public/preview.html]
- [ ] [Review][Patch] Missing @origo/angular-renderer integration [packages/playground/src/preview/preview-root.component.ts]
- [ ] [Review][Patch] BadlEditorComponent bypasses output event [packages/playground/src/editor/badl-editor.component.ts]
- [ ] [Review][Patch] Missing E2E and Component Tests [packages/playground/src]
- [ ] [Review][Patch] Hardcoded Colors in Editor Header [packages/playground/src/editor/badl-editor.component.scss]
- [ ] [Review][Patch] Iframe readiness race conditions [packages/playground/src/preview/preview-pane.component.ts]
- [ ] [Review][Patch] Signals antipattern (ChangeDetectorRef) [packages/playground/src/preview/preview-root.component.ts]
- [ ] [Review][Patch] Empty Document UX and Type Mismatch [packages/playground/src/workers/compiler.worker.ts]
- [ ] [Review][Patch] Signal Naming Convention Violations [packages/playground/src/preview/preview.service.ts]
- [ ] [Review][Patch] Worker Error Handling and Re-init Races [packages/playground/src/preview/preview.service.ts]
- [ ] [Review][Patch] Double JSON Parsing [packages/playground/src/workers/compiler.worker.ts]
- [x] [Review][Defer] loadSample called before ngAfterViewInit [packages/playground/src/editor/badl-editor.component.ts] — deferred, pre-existing (acceptable but surprising)

## Dev Notes

### CRITICAL IMPLEMENTATION GUARDRAILS (PREVENT DISASTERS)

- **Off-main-thread compilation (AD-9):** ALL `@origo/core` compilation/validation MUST run inside the Web Worker thread. **NEVER call `validateAST` or `BADLValidator` directly on the main Angular thread.** The Web Worker spike (epic-7 ADR) confirmed `@origo/core` is CSP-safe in Worker context.
- **Strict CSP Guardrails (AD-9 & AC-3):** 
  - **Worker Instantiation:** MUST use `new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' })` so Vite/Rollup emits a bundled physical `.js` file fetched from `src 'self'`. **NEVER use `URL.createObjectURL(new Blob([...]))` or inline worker blobs** — these violate `worker-src 'self'`.
  - **Iframe Sandbox:** The preview `<iframe>` MUST have the `sandbox="allow-scripts allow-same-origin"` attribute. **Do NOT set `allow-same-origin` alone without `allow-scripts` or the renderer won't function.**
  - **Angular Renderer in iframe:** The `@origo/angular-renderer` runs inside the iframe as a standalone Angular application bootstrapped with `bootstrapApplication()`. The iframe's `src` points to a self-hosted static asset (e.g., `/assets/preview.html`). Do NOT attempt to render Angular outside the iframe directly into the parent page DOM — this bypasses the CSP sandbox.
- **Comlink for RPC (AD-9 rule #2):** Use `comlink` for typed RPC between main thread and worker. Do NOT hand-roll `postMessage/onmessage` for the compiler API. Wrap with `comlink.wrap<CompilerWorker>()` on the main side and `comlink.expose(new CompilerWorker())` on the worker side.
- **Debounce tuning:** 400ms debounce recommended. Too low (< 100ms) → worker spam on fast typing. Too high (> 700ms) → feels sluggish for the user. Make the debounce delay a configurable constant (`COMPILATION_DEBOUNCE_MS = 400`) so Story 7.3 can tune it easily.
- **Framework Constraint (P1-AD-1):** All Angular components MUST be Standalone (`standalone: true`) using Signals. Use `signal()` for reactive AST/error state, `effect()` for iframe message dispatch. No `zone.js` peer dependency.
- **Angular Renderer Wire-up:** `@origo/angular-renderer` in the iframe receives the AST as a typed `BADLDocument` object. Pass it to the root `OrigoRendererComponent` via its `@Input() document: BADLDocument`. The iframe app MUST import `@origo/angular-renderer` primitives, NOT re-implement any rendering logic.
- **AST transfer cost (for Story 7.3 continuity):** For now, simple `structuredClone` (the `postMessage` default) is sufficient to transfer the AST from worker to main thread. Do NOT implement `Transferable` ArrayBuffer encoding yet; it will be investigated in Story 7.3 if AST payloads exceed ~500KB.
- **Dependency budget:** Before adding any new npm package, check if it's already used in the monorepo. Comlink is approved per ADR. Do NOT add `rxjs` for debounce — use native browser `setTimeout`/`clearTimeout` in the service (Signals-first architecture).
- **Strict Design Token Enforcement (FR-THEME-002):** All colors and typography in `error-display.component.scss` and `preview-pane.component.scss` MUST use semantic design tokens from `@origo/design-tokens`. DO NOT hardcode colors for error badges.

### File Structure — NEW Files This Story Creates

```
packages/playground/
  src/
    workers/
      compiler.worker.ts           # NEW — Comlink-exposed CompilerWorker class
    preview/
      preview.service.ts           # NEW — Angular service: debounce, worker proxy, signals
      preview-pane.component.ts    # NEW — Standalone Angular component (iframe wrapper)
      preview-pane.component.html  # NEW
      preview-pane.component.scss  # NEW
      preview-pane.component.spec.ts # NEW
      error-display.component.ts   # NEW — Standalone Angular component (error list)
      error-display.component.html # NEW
      error-display.component.scss # NEW
      error-display.component.spec.ts # NEW
```

### Files Modified This Story (from Story 7.1 baseline)

```
packages/playground/
  src/editor/editor.component.ts   # ADD editorContentChange output event
  src/playground.component.ts      # WIRE UP editorContentChange → PreviewService
  vite.config.ts (or angular.json) # ENSURE worker bundling configured
```

### Project Structure Notes

- Package lives at `packages/playground/` — no `apps/playground/` (Nx lib, not app)
- Nx project tag: `scope:playground`, `type:feature`
- All imports from `@origo/core` and `@origo/angular-renderer` must use package root only (no internal paths per P1-AD-4)
- Angular component selector prefix: `origo-playground-*` (e.g., `origo-playground-preview`)
- Component file structure: `name.component.ts + .html + .scss + .spec.ts` co-located (P1 convention)
- Vitest for unit tests, Playwright for E2E/component tests (project-standard)
- Signal naming convention: `compiledAstSignal`, `compilationErrorsSignal` for exposed signals; `computedHasErrors` for derived

### Dependencies Required

- `comlink` — already referenced in ADR; add to the workspace root `package.json` (Nx monorepo standard) if not present from 7.1 setup
- `@origo/core` — already in monorepo; import via package root only
- `@origo/angular-renderer` — already in monorepo; import via package root

### Intelligence From Story 7.1

- Monaco Editor was set up in Story 7.1 using `new Worker(new URL('...', import.meta.url))` native Vite syntax — the same pattern MUST be used for the compiler worker
- `badl.schema.json` is pre-registered with Monaco for live in-editor validation (Story 7.1 AC-2). This means the editor already shows real-time schema errors. Story 7.2's compiler pipeline provides the **compilation + rendering** trigger on top of that — these are complementary, not duplicate
- The `@origo/playground` package scaffolding already exists from Story 7.1 — do NOT re-scaffold
- Starlight iframe constraints (P1-AD-8): playground runs inside `<iframe sandbox="allow-scripts allow-same-origin">` in the docs site. Story 7.2's inner preview iframe is a **nested** iframe inside the playground. Ensure the nested iframe's `postMessage` target origin is `window.location.origin` (same-origin), not `*`

### Latest Tech Information

- **Comlink 4.x** — stable, widely used for typed Web Worker RPC. `comlink.expose()` in worker, `comlink.wrap<T>()` on main thread. Handles proxy lifetime automatically. No breaking changes in recent 4.x releases.
- **Angular 18 + Vite workers** — Use `{ type: 'module' }` in `new Worker(...)`. Vite's `@vitejs/plugin-angular` correctly handles TS worker files with this syntax, emitting a bundled IIFE/ESM worker file satisfying CSP.
- **`structuredClone()`** — Available in Node 17+ and all modern browsers. Use instead of `JSON.parse(JSON.stringify(...))` for AST deep clone transfer. More performant for large objects.
- **Angular `bootstrapApplication()` in iframe** — Use Standalone API. Import `provideRouter([])`, `provideAnimations()`, and the renderer's providers. The iframe's entry point is a separate Angular bootstrap file, not the playground's main `main.ts`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.2 — Live Compilation & Rendering Pipeline]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.3 — Live Preview Latency Optimization] — Story 7.3 depends on debounce constant and AST transfer patterns established here
- [Source: _bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md] — AD-9 CSP/Worker Architecture Decision Record
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md#P1-AD-1] — Angular 18 Signals/Standalone mandate
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md#P1-AD-7] — Monaco Editor & playground live preview MUST use production @origo/core and @origo/angular-renderer
- [Source: _bmad-output/planning-artifacts/epics.md#NFR-PERF-003] — 500ms hot-reload threshold (applies to Story 7.3; but pipeline latency budget starts here)
- [Source: _bmad-output/implementation-artifacts/7-1-web-based-editor-component.md] — Story 7.1 dev notes (Monaco worker pattern, CSP guardrails, package structure)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (Thinking)

### Debug Log References

### Completion Notes List

### File List
