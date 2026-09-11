# Retro Action Item — Epic 7: Resolve Tech Debt

Status: ready-for-dev

## Story

As a developer on the Origo team,
I want to fix deferred reactive signal updates and builder alignment issues in `@origo/playground`,
so that the foundation is solid for Epic 8 (Diagnostics & DevTools) before any tracing or DevTools work begins.

## Context

This is a **retrospective action item**, not a sprint story. It has no epic-scoped story number. It must be completed before Epic 8 is started — the retro explicitly stated: "Tracing AST state in DevTools will be fragile if the underlying editor state and reactivity are broken."

There are **two discrete debts** to address:

1. **Reactive signal updates for `theme` and `readOnly` inputs** in `BadlEditorComponent` — these inputs are set once at creation time and passed into `monaco.editor.create()`; they are never re-applied if the parent changes the input after the editor mounts.
2. **Builder alignment** — `packages/playground/project.json` uses `@angular/build:application` as its executor; this choice was deferred pending proof that it correctly emits standalone worker `.js` files satisfying the `worker-src 'self'` CSP. This must be verified and documented.

## Acceptance Criteria

1. **[AC-1 — Reactive `theme` input]** Given `BadlEditorComponent` is mounted and the parent changes the `theme` input after `ngAfterViewInit`, the Monaco editor reflects the new theme within the same change detection cycle via `this.editor.updateOptions({ theme })`. A new Vitest unit test verifies this behaviour using the existing mock infrastructure in `badl-editor.component.spec.ts`.

2. **[AC-2 — Reactive `readOnly` input]** Given `BadlEditorComponent` is mounted and the parent changes the `readOnly` input after `ngAfterViewInit`, the Monaco editor reflects the new value via `this.editor.updateOptions({ readOnly })`. A new Vitest unit test verifies this using the existing mock.

3. **[AC-3 — Builder alignment verified]** Running `nx build playground --configuration=production` succeeds and the output in `dist/packages/playground/browser/` contains at least one physically bundled worker `.js` file (not a `blob:` URL reference), confirming `worker-src 'self'` CSP compliance. The verification result is documented in a code comment in `project.json` or a brief note appended to `adr-epic7-web-worker-csp.md`.

4. **[AC-4 — No regressions]** All pre-existing Vitest tests in `packages/playground` pass: `nx run playground:test`.

## Tasks / Subtasks

- [ ] **Task 1: Fix reactive `theme` signal (AC-1)**
  - [ ] Open `packages/playground/src/editor/badl-editor.component.ts`
  - [ ] Add an `effect()` in the constructor body (after the existing `editorContent` persistence effect) that reads `this.theme()` and `this.readOnly()`, then calls `this.editor?.updateOptions({ theme, readOnly })` using optional chaining — **not** the non-null assertion `!`
  - [ ] Do NOT wrap in an `if (this.editor)` guard — use `?.` directly; `zone.runOutsideAngular` should always be called but `updateOptions` only fires when `editor` is non-null
  - [ ] Add a unit test in `badl-editor.component.spec.ts`: set `theme` input via `componentRef.setInput('theme', 'vs')` after `fixture.detectChanges()`, call `TestBed.flushEffects()`, assert `mockUpdateOptions` was called with `expect.objectContaining({ theme: 'vs' })`

- [ ] **Task 2: Fix reactive `readOnly` signal (AC-2)**
  - [ ] In the same `effect()` block (or a separate one — see guardrail below), also call `this.editor?.updateOptions({ readOnly: this.readOnly() })`
  - [ ] Add a unit test: set `readOnly` input to `true` after mount, flush effects, assert `updateOptions` called with `{ readOnly: true }`

- [ ] **Task 3: Verify builder alignment (AC-3)**
  - [ ] Run `nx build playground --configuration=production` locally
  - [ ] Inspect `dist/packages/playground/browser/` — confirm presence of physical worker `.js` files (look for filenames matching `*worker*.js`)
  - [ ] If worker files are present: append the verification result (date + outcome) to `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` under a `#### Verification — Epic 7 Retro` heading (JSON does not support comments, so `project.json` cannot be annotated)
  - [ ] If worker files are absent: **do not change the executor**. First open `packages/playground/src/editor/monaco-environment.ts` — this is the `MonacoEnvironment.getWorker` configuration file that controls how Monaco resolves its workers. The fix is almost certainly here (e.g. a `blob:` URL being returned instead of a physical file URL). Then check `packages/playground/vite.config.ts` if it exists. Only escalate to executor changes as a last resort after understanding both files.
  - [ ] Append finding summary to `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` under a `#### Verification — Epic 7 Retro` heading

- [ ] **Task 4: Regression check (AC-4)**
  - [ ] Run `nx run playground:test` and confirm all existing tests pass
  - [ ] Pay particular attention to `badl-editor.component.spec.ts` — the new `effect()` must not interfere with the existing `editorContent` signal persistence effect

## Dev Notes

### CRITICAL GUARDRAILS — Read Before Touching `badl-editor.component.ts`

**DO NOT make `initialValue` reactive.** The comment on line ~30 of the file reads:
```
// Note: initialValue() signal read outside Angular zone in ngAfterViewInit is intentionally non-reactive
// as it is only used for the initial model creation.
```
This is correct. `initialValue` seeds the Monaco model once. Making it reactive would recreate the Monaco model on every parent re-render, destroying editor history and user input. Do not touch this.

**The `editorContent` persistence effect must be preserved.** The constructor already contains one `effect()` that debounces `localStorage.setItem` with a 500ms timer. The new `theme`/`readOnly` effects are additive — they do not replace or merge with the persistence effect. Angular allows multiple independent `effect()` calls in a constructor.

**Run `updateOptions` outside Angular zone using optional chaining, not non-null assertion.** All Monaco API calls are `zone.runOutsideAngular`-wrapped in this component. Use `?.` (optional chaining) — never `!` (non-null assertion) — on `this.editor` inside effects, because `ngOnDestroy` can set `this.editor = null` while an effect is still scheduled:
```ts
effect(() => {
  const theme = this.theme();
  const readOnly = this.readOnly();
  this.zone.runOutsideAngular(() => {
    this.editor?.updateOptions({ theme, readOnly });
  });
});
```

**Do NOT use `if (this.editor)` as a wrapper guard — use `?.` instead.** The `if` guard is not wrong, but it is redundant when `?.` is used and introduces the temptation to write `this.editor!` inside the block. The `zone.runOutsideAngular` wrapper is always safe to call regardless of editor state. Angular's `effect()` always runs once on first execution (before `ngAfterViewInit`); at that point `this.editor` is `null` and `?.` silently no-ops. After `ngAfterViewInit` sets `this.editor`, subsequent signal changes trigger correctly.

### Files Being Modified

- **`packages/playground/src/editor/badl-editor.component.ts`** ← PRIMARY CHANGE
  - **Current state:** ~170 lines. One `effect()` in constructor (persistence). `theme` and `readOnly` read once in `ngAfterViewInit` inside `monaco.editor.create({ theme: this.theme(), readOnly: this.readOnly() })`. No post-mount reactivity.
  - **Change:** Add one new `effect()` in constructor that calls `this.editor?.updateOptions({ theme, readOnly })` whenever either signal changes.
  - **Preserve:** `initialValue` intentional non-reactivity. Existing persistence effect. `ngOnDestroy` dispose pattern. `loadSample()` method. All `onDidChangeModelContent` handler logic.

- **`packages/playground/src/editor/badl-editor.component.spec.ts`** ← TEST ADDITIONS
  - **Current state:** ~135 lines. Mock infrastructure for `monaco-editor` and `schema-registry`. Tests for creation, zone usage, dispose, and state persistence.
  - **Change:** Add 2 new tests inside a new `describe('Reactive Inputs')` block verifying `theme` and `readOnly` reactivity via `componentRef.setInput` + `TestBed.flushEffects()`.
  - **Preserve:** All existing mocks and tests. The Monaco mock already exposes `updateOptions` — add `const mockUpdateOptions = vi.fn()` to the mock object.

- **`packages/playground/project.json`** ← COMMENT ONLY (or config fix if builder broken)
  - **Current state:** `"executor": "@angular/build:application"` — this was deferred from Story 7.1 review pending CSP worker emission verification.
  - **Change:** Add inline comment after verification (JSON doesn't support comments — add to the ADR instead).
  - **Preserve:** All build targets, budget configs, serve config, and test runner config. Do NOT change executor unless worker files are absent in build output.

- **`_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`** ← APPEND ONLY
  - **Change:** Append a `#### Verification — Epic 7 Retro` section with the build verification result date and outcome.

### Architectural Context: Why Builder Alignment Matters (AD-9)

From `adr-epic7-web-worker-csp.md`: the playground operates under strict CSP (`worker-src 'self'`). Monaco's default worker setup uses `blob:` URLs — a CSP violation. The fix requires Angular/Vite to emit physical bundled `.js` worker files via `new Worker(new URL('...', import.meta.url))` syntax. `@angular/build:application` was adopted because it was expected to satisfy this, but the verification was explicitly deferred. This task closes that loop.

If `nx build playground --configuration=production` shows no physical worker `.js` files, the `MonacoEnvironment.getWorker` configuration in `packages/playground/src/editor/monaco-environment.ts` likely needs a Vite-compatible worker URL strategy. Do not change the executor without understanding this file first.

### Previous Story Intelligence (retro-7-state-persistence)

Story `retro-7-state-persistence` (just completed) added:
- localStorage persistence via `effect()` in `BadlEditorComponent`
- Tests in `badl-editor.component.spec.ts` covering draft restore and debounced save

One deferred item from that story's code review (in `deferred-work.md` line 160): "Add comment explaining intentional non-reactivity of `initialValue()` signal read outside Angular zone." **This comment is already present in the live source file** (`badl-editor.component.ts` line ~30). No code change is required. Simply confirm the comment exists and close the deferred item — do not add a duplicate comment or hunt for a wording mismatch.

### Test Infrastructure Reference

The mock setup in `badl-editor.component.spec.ts` needs `updateOptions` added to the mock editor object:

```ts
const mockUpdateOptions = vi.fn();
const mockCreate = vi.fn().mockReturnValue({
  dispose: mockDispose,
  onDidChangeModelContent: mockOnDidChangeModelContent,
  setValue: mockSetValue,
  getValue: mockGetValue,
  getModel: mockGetModel,
  updateOptions: mockUpdateOptions,   // ← ADD THIS
});
```

New test structure:
```ts
describe('Reactive Inputs', () => {
  it('should call updateOptions when theme input changes after mount', () => {
    fixture.detectChanges(); // triggers ngAfterViewInit — editor is created, effect may fire once here
    vi.clearAllMocks(); // clear any initial effect calls so the assertion is isolated to the input change below

    componentRef.setInput('theme', 'vs');
    TestBed.flushEffects();

    expect(mockUpdateOptions).toHaveBeenCalledWith(expect.objectContaining({ theme: 'vs' }));
  });

  it('should call updateOptions when readOnly input changes after mount', () => {
    fixture.detectChanges(); // same pattern — editor created, then clear mocks before the isolated assertion
    vi.clearAllMocks();

    componentRef.setInput('readOnly', true);
    TestBed.flushEffects();

    expect(mockUpdateOptions).toHaveBeenCalledWith(expect.objectContaining({ readOnly: true }));
  });
});
```

> **Note on `vi.clearAllMocks()` timing:** Angular schedules `effect()` execution after `ngAfterViewInit`. Depending on test zone flushing, `mockUpdateOptions` may or may not have been called by the time `detectChanges()` returns. The `vi.clearAllMocks()` call after `detectChanges()` eliminates this ambiguity — the assertion only captures calls triggered by the explicit `setInput` + `flushEffects()` sequence.

### References

- [Source: _bmad-output/implementation-artifacts/deferred-work.md#L148-L152] — exact deferred items (builder alignment, reactive signals)
- [Source: _bmad-output/implementation-artifacts/epic-7-retro-2026-09-11.md#Section-1.2] — retro challenge summary
- [Source: _bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md#AD-9] — CSP worker strategy and contracts
- [Source: packages/playground/src/editor/badl-editor.component.ts] — live source being modified
- [Source: packages/playground/src/editor/badl-editor.component.spec.ts] — existing test suite to extend
- [Source: packages/playground/project.json] — builder config to verify

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (Thinking) — create + validate pass

### Debug Log References

### Completion Notes List

- Story created from Epic 7 retrospective action item `retro-7-resolve-debt`
- Validated and improved: added precise file targets, concrete testable ACs, CSP architectural context, previous story intelligence, test scaffolding, and Angular `effect()` guardrails

### File List
