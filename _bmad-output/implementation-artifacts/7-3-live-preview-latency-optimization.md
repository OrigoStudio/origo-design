---
baseline_commit: cc72f3b
---
# Story 7.3: Live Preview Latency Optimization

Status: in-progress

## Story

As a Developer,
I want the live preview to update smoothly without lagging,
So that my typing experience is not degraded by heavy compilations.

## Acceptance Criteria

1. [AC-1] Given the Playground editor with a complex real-world schema loaded, When I type continuously, Then the preview updates within the required latency threshold (NFR-PERF-003: 500ms end-to-end, keystroke → visible preview update).
2. [AC-2] And the debouncing mechanism explicitly absorbs burst inputs (e.g. deleting the whole file) safely — stale compilation results are discarded, never rendered.
3. [AC-3] And mass error streams (e.g. 10,000+ compiler errors from a single missing root bracket) are truncated before reaching the DOM to prevent thrashing or browser tab crash.
4. [AC-4] And AST payloads exceeding ~500KB are transferred efficiently from the worker to the main thread without locking the main thread (Transferable ArrayBuffer encoding if profiling shows `structuredClone` is the bottleneck).
5. [AC-5] And the preview-root iframe component uses only design token CSS custom properties — zero hardcoded hex/px values — matching FR-THEME-002.

## Tasks / Subtasks

- [ ] Task 1: Stale Compilation Guard in PreviewService (AC-1, AC-2)
  - [ ] Modify `packages/playground/src/preview/preview.service.ts`
  - [ ] Add `private _compilationId = 0` counter to the service
  - [ ] Before each `workerProxy.compile()` call: increment the counter and capture the current ID as `const requestId = ++this._compilationId`
  - [ ] After the worker returns: check `if (requestId !== this._compilationId) return;` — discard stale results silently
  - [ ] Keep `COMPILATION_DEBOUNCE_MS` exported from this file (already at 400ms — tune to 300ms if profiling shows headroom, document the chosen value with a comment)

- [ ] Task 2: Error Stream Truncation (AC-3)
  - [ ] Modify `packages/playground/src/preview/preview.service.ts` — before calling `this.compilationErrorsSignal.set(result.errors)`, apply: `const MAX_DISPLAYED_ERRORS = 50; const truncated = result.errors.length > MAX_DISPLAYED_ERRORS ? [...result.errors.slice(0, MAX_DISPLAYED_ERRORS), { type: 'Info', message: `...and ${result.errors.length - MAX_DISPLAYED_ERRORS} more errors` }] : result.errors`
  - [ ] This is a fix for an existing DOM-thrash bug — the error display currently renders ALL errors with no cap
  - [ ] Export `MAX_DISPLAYED_ERRORS = 50` as a named constant (not magic number)

- [ ] Task 3: AST Transferable Investigation & Implementation (AC-1, AC-4)
  - [ ] Profile with Chrome DevTools: load a complex real-world BADL fixture (~500+ entities), time `structuredClone` cost in `postMessage` from worker → main thread
  - [ ] If `structuredClone` cost exceeds ~50ms: implement Transferable encoding
    - [ ] In `compiler.worker.ts`: serialize `ast` to JSON string, encode via `TextEncoder` → `Uint8Array`, call `comlink.transfer({ buffer: unit8Array.buffer }, [unit8Array.buffer])` as return value
    - [ ] In `preview.service.ts`: receive the buffer, decode via `new TextDecoder().decode(buffer)`, `JSON.parse()` to reconstruct the AST
  - [ ] If `structuredClone` cost is negligible: document the profiling result in a code comment and skip encoding
  - [ ] ⚠️ Do NOT change the Comlink expose guard in `compiler.worker.ts` (lines 60–62): `if (typeof window === 'undefined')` — this is correct for module workers AND happens to also protect against Vitest JSDOM context. Understand before touching.

- [ ] Task 4: Iframe postMessage AST Transfer Optimization (AC-1)
  - [ ] Modify `packages/playground/src/preview/preview-pane.component.ts`
  - [ ] Verify the `effect()` only fires when `compiledAstSignal()` actually changes (Angular Signals already handle this — confirm no redundant postMessages are sent when errors update but AST is unchanged)
  - [ ] If AST Transferable encoding was implemented in Task 3, pass the pre-encoded buffer via `postMessage(..., [buffer])` to the iframe instead of re-cloning the object
  - [ ] Preserve: `window.location.origin` target origin check and `sandbox="allow-scripts allow-same-origin"` attribute

- [ ] Task 5: Fix preview-root.component.ts Design Token Violations (AC-5)
  - [ ] Modify `packages/playground/src/preview/preview-root.component.ts`
  - [ ] Replace ALL inline hardcoded style values with design tokens:
    - `background: #fafafa` → `var(--origo-color-surface-secondary)`
    - `color: #6b7280` → `var(--origo-color-text-muted)`
    - `text-transform: uppercase; letter-spacing: 0.05em` → keep as layout (not a token violation)
    - `background: #ffffff` → `var(--origo-color-surface)`
    - `border: 1px solid #eaeaea` → `var(--origo-color-border)`
    - `color: #111827` → `var(--origo-color-text-primary)`
    - `font-family: 'Consolas', 'Monaco', monospace` → `var(--origo-typography-family-mono)` if token exists, else leave as-is
    - `color: #666` → `var(--origo-color-text-muted)` in empty-state
  - [ ] Move inline `styles: [...]` to `preview-root.component.scss` (co-located file, P1 convention)
  - [ ] Note: `uiNode` computed signal currently returns a hardcoded stub `{ id: 'root-vbox', type: 'vbox', children: [] }` — this is intentional (Epic 9 wires up real primitives). Do NOT change this computed logic.

- [ ] Task 6: Testing (AC-1, AC-2, AC-3)
  - [ ] **Vitest bench** — Create `packages/playground/src/preview/preview.service.bench.ts` using Vitest's `bench()` API:
    - Benchmark: simulate `onContentChange()` called 100 times in 1 second with varying content lengths; assert median latency stays within budget
  - [ ] **Unit test** — In `packages/playground/src/workers/compiler.worker.spec.ts` (existing file), add:
    - Burst input test: call `compile('')` (empty file), assert returns `{ errors: [] }`, no throw
    - Error count test: mock `validateAST` to return 10,000 error objects; call via `PreviewService`; assert `compilationErrorsSignal()` length is ≤ 51 (50 + truncation message)
  - [ ] **Existing unit tests in `preview.service.spec.ts` must still pass** — do not break the 3 existing tests
  - [ ] **Playwright E2E** — Add to `packages/playground/e2e/` (or wherever Story 7.2 placed its E2E tests):
    - Rapid-typing test: automate 50 fast keystrokes, measure time from last keystroke to preview update, assert ≤ 500ms
    - Error truncation test: inject content that produces 1000+ errors; assert DOM error list item count ≤ 51

## Dev Notes

### CRITICAL IMPLEMENTATION GUARDRAILS

- **No RxJS:** Debounce MUST use native `setTimeout`/`clearTimeout` — Signals-first architecture (P1-AD-1). `rxjs` is not in the playground's allowed dependencies.
- **Comlink proxy lifecycle is fragile:** The stale-request guard (Task 1) uses a counter to discard results — it does NOT cancel the in-flight worker call. With Comlink, there is no cancellation API. Never call `workerProxy[comlink.releaseProxy]()` except in `ngOnDestroy` or worker crash recovery.
- **Comlink expose guard — DO NOT CHANGE WITHOUT READING THIS:** `compiler.worker.ts` line 60 reads `if (typeof window === 'undefined')`. In a `type: 'module'` Web Worker, `window` is undefined → Comlink is exposed correctly. In Vitest (JSDOM), `window` is also undefined → this would cause Comlink to crash test setup. The guard is inverted intentionally to protect both contexts. If you remove it, Vitest unit tests will fail with "cannot expose on main thread" errors.
- **Design Token enforcement (FR-THEME-002 / AD-6):** All colors, spacing, and typography in `.ts` inline styles AND `.scss` files MUST use `var(--origo-*)` tokens. Hardcoded hex values anywhere in the playground package are CI violations.
- **Angular Standalone + Signals (P1-AD-1):** All components must be `standalone: true`. Use `signal()`, `computed()`, `effect()` — no `BehaviorSubject`, no `ChangeDetectorRef.markForCheck()`.
- **CSP Guardrails:** `postMessage` to the iframe MUST use `window.location.origin` as target origin (never `*`). The iframe `sandbox` attribute MUST remain `"allow-scripts allow-same-origin"` — do not add tokens.

### Files Being Modified

- **`packages/playground/src/preview/preview.service.ts`** ← PRIMARY CHANGES
  - **Current state:** 89 lines. `COMPILATION_DEBOUNCE_MS = 400` exported. `initWorker()` + `onContentChange()` + `ngOnDestroy()`. No stale-result guard. No error truncation. Signals: `compiledAstSignal`, `compilationErrorsSignal`.
  - **Changes:** Add `_compilationId` counter for stale guard. Add error truncation with `MAX_DISPLAYED_ERRORS = 50` before signal set. Optionally decode Transferable buffer if Task 3 implements encoding.
  - **Preserve:** Comlink proxy lifecycle (`initWorker` pattern, `onerror` → `initWorker()` crash recovery, `ngOnDestroy` cleanup). Signal names. `COMPILATION_DEBOUNCE_MS` export.

- **`packages/playground/src/preview/preview-pane.component.ts`** ← MINOR CHANGE
  - **Current state:** 35 lines. `effect()` reads `compiledAstSignal()` + `isIframeLoaded()`, posts `{ type: 'RENDER_AST', ast }` to iframe.
  - **Changes:** Potentially pass pre-encoded Transferable buffer instead of plain AST object (only if Task 3 implements encoding).
  - **Preserve:** `window.location.origin` origin check. `onIframeLoad()` handler. `isIframeLoaded` signal guard.

- **`packages/playground/src/workers/compiler.worker.ts`** ← CONDITIONAL CHANGE
  - **Current state:** 63 lines. `CompilerWorker.compile()` → JSON parse → `BADLValidator.validateDomain()` → `validateAST()` → returns `{ ast } | { errors }`. Comlink exposed under `if (typeof window === 'undefined')`.
  - **Changes:** Only if Transferable encoding is implemented in Task 3: wrap return value in `comlink.transfer()`. Otherwise, no changes to this file.
  - **Preserve:** Comlink expose guard (lines 60–62). `CompilerError` interface (imported by `preview.service.ts`). Error mapping logic.

- **`packages/playground/src/preview/preview-root.component.ts`** ← DESIGN TOKEN FIX
  - **Current state:** 86 lines. Inline `styles: [...]` with hardcoded hex colors. `uiNode` computed returns hardcoded stub (intentional — Epic 9 wires real primitives). `@HostListener` receives `RENDER_AST` postMessage.
  - **Changes:** Extract inline styles to `preview-root.component.scss`. Replace hardcoded hex values with design tokens.
  - **Preserve:** `uiNode` computed stub — do NOT attempt to map AST domains to real components (that's Epic 9 scope). `@HostListener` message handler. Origin check.

- **`packages/playground/src/preview/error-display.component.html`** ← NO CHANGE NEEDED
  - The template already uses `@for (error of previewService.compilationErrorsSignal(); ...)` — once the signal itself is truncated at source (Task 2), this template naturally renders only ≤ 51 items. Do NOT add truncation logic here.

### Open 7.2 Review Items — Explicitly In Scope for 7.3

These deferred items from Story 7.2's review are within the scope of this story's file changes:

- **In scope:** `[Review][Patch] Hardcoded Colors in Editor Header` — the preview-root inline styles (Task 5 above)
- **In scope:** `[Review][Patch] Iframe readiness race conditions [preview-pane.component.ts]` — verify the `isIframeLoaded` signal correctly gates postMessage; add a `load` event timeout to prevent silent hang if iframe never fires `load`
- **Explicitly deferred to Epic 9:** `[Review][Patch] Missing @origo/angular-renderer integration [preview-root.component.ts]` — the `uiNode` stub is intentional until Epic 9
- **Explicitly deferred:** `[Review][Patch] Missing postMessage origin check [preview-root.component.ts]` — origin IS checked at line 78 (`if (event.origin !== window.location.origin)`); confirm this finding is already resolved

### Intelligence From Story 7.2

- `COMPILATION_DEBOUNCE_MS = 400` was deliberately made a named constant for this story to tune — evaluate whether 300ms is viable after implementing the stale guard (since stale results are now discarded, a lower debounce is safer).
- Story 7.2 confirmed `@origo/core` is CSP-safe in Worker context — no polyfills needed.
- Worker bundling: `new Worker(new URL('../workers/compiler.worker.ts', import.meta.url), { type: 'module' })` — do NOT change this syntax (required for Vite to emit a physical bundled `.js` file satisfying `worker-src 'self'` CSP).
- Iframe `src="/?preview=true"` routes to `PreviewRootComponent` bootstrap (the Angular app inside the iframe). This is not a file path — it's a Vite dev server route.
- AST passes through two `postMessage` hops: Worker → Main Thread (via Comlink), then Main Thread → Iframe (via `iframeEl.contentWindow.postMessage`). Transferable optimization applies to the **second** hop (main → iframe). The first hop (Comlink) handles its own serialization.

### Latest Tech Information

- **Vitest `bench()` API:** Available since Vitest 1.x. Use `import { bench, describe } from 'vitest'` — no extra install needed. Runs via `nx run playground:test --reporter=verbose`.
- **Comlink Transferables:** `comlink.transfer(value, transferables)` wraps a return value to pass transferables. Example: `return comlink.transfer({ buffer: buf }, [buf])`. Receiver gets the buffer; the sender's reference is neutered (ArrayBuffer transferred, not copied).
- **TextEncoder/TextDecoder:** Available in all modern browsers and Web Workers natively. `new TextEncoder().encode(jsonString)` returns `Uint8Array`. Its `.buffer` is the `ArrayBuffer` to transfer. `new TextDecoder().decode(buffer)` reconstructs the string.
- **Angular `effect()` and glitch-free scheduling:** Angular Signals are glitch-free — if both `compiledAstSignal` and `compilationErrorsSignal` update in the same microtask, `effect()` runs only once. No double-render risk.

### References

- [Source: epics.md#Story 7.3] — NFR-PERF-003: 500ms hot-reload threshold
- [Source: 7-2-live-compilation-rendering-pipeline.md] — Dev notes, open review items, architecture decisions
- [Source: architecture/ARCHITECTURE-SPINE.md#AD-6] — Design tokens are the only visual source
- [Source: architecture/phase1-foundation/ARCHITECTURE-SPINE.md#P1-AD-1] — Angular 18 Signals/Standalone mandate
- [Source: adr-epic7-web-worker-csp.md] — Worker CSP decisions

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4.6 (Thinking) — validation pass

### Completion Notes
Validation applied. All critical issues and enhancements incorporated.
