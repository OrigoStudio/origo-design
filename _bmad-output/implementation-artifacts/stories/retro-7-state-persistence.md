---
baseline_commit: fe3f1212bf2860bccfd8176943da07bad7948cc0
---

# Story retro.7: state-persistence

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer using the Playground,
I want the Monaco editor value to survive hot reloads via local storage,
so that I do not lose my BADL schemas during development and testing before Epic 8 begins.

## Acceptance Criteria

1. Implement local storage persistence for the Monaco editor value using the key `origo_playground_draft`. URL-based sync is explicitly rejected due to URL length limits causing routing disasters with large ASTs.
2. The state persistence mechanism MUST use Angular 18 Signals (`signal()`, `effect()`) for reactivity. RxJS is strictly forbidden for this use case (P1-AD-1).
3. The editor state must survive hot reloads gracefully, accounting for iframe cross-origin constraints (P1-AD-8).
4. Implement a robust fallback: if corrupted or invalid JSON is loaded from local storage on initialization, it must gracefully fall back to the default empty/base schema to prevent unrecoverable crash loops.
5. Debouncing must be implemented using an Angular `effect()` with cleanup functions (no RxJS).

## Tasks / Subtasks

- [x] Implement robust `localStorage` sync mechanism (AC: 1, 4)
  - [x] Add logic to save the Monaco (v0.50.x) editor value to `localStorage` under `origo_playground_draft` using `editor.getModel().getValue()`.
  - [x] Apply the loaded state via `editor.getModel().setValue(value)`.
  - [x] Implement parsing with a `try/catch` block on initialization; fallback to a default valid schema if parsing fails.

- [x] Wire up Angular Signals for state reactivity (AC: 2, 5)
  - [x] Implement debouncing using an Angular `effect()` with an `onCleanup` hook.
  - [x] Verify `localStorage` writes occur only after the debounce interval.

- [x] Address Edge Cases (Iframe constraints & Quotas) (AC: 3)
  - [x] Wrap `localStorage` writes in a `try/catch` to handle potential `QuotaExceededError` for schemas >5MB.
  - [x] Ensure local storage access is safely wrapped to handle potential `SecurityError` exceptions from iframe cross-origin policies.

- [x] Add explicit regression test fixtures
  - [x] Write component tests verifying state recovery and corrupted-state fallback behavior using Vitest 2.x and Playwright 1.45.x.

## Dev Notes

- **Angular Signals Mandate (P1-AD-1)**: You must use `signal()` and `effect()` for this implementation. RxJS is restricted to HTTP/Router use cases. Handle debouncing manually within an effect cleanup function.
- **Iframe Sandboxing (P1-AD-8)**: The Playground runs as an iframe island inside a Starlight docs site. Ensure `localStorage` access accounts for restricted environments and falls back gracefully if access is denied.
- **Monaco API**: The Phase 1 stack specifies Monaco Editor 0.50.x. Use standard `.getModel().getValue()` interactions rather than raw DOM values.
- **Source tree components to touch**: The implementation must reside in `packages/playground/src/editor/` as per the Phase 1 Structural Seed.
- **Crash Loop Prevention**: Never trust the payload in `localStorage`. Always validate it before attempting to render it into the editor to prevent crash loops upon hot reloads.

### Project Structure Notes

- Target directory: `packages/playground/src/editor/`

### References

- [sprint-status.yaml](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/implementation-artifacts/sprint-status.yaml) (Action item: retro-7-state-persistence)
- [Epic 7: Browser-Based BADL Playground](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/epics.md#L768)

## Dev Agent Record

### Agent Model Used
Antigravity (IDE)

### Debug Log References
- `task-164.log` / `task-185.log` / `task-205.log`: Failing and succeeding `nx test playground` runs showing local storage persistence behaviour under `Vitest` mocked configurations.
- Modified tests to use `vi.useFakeTimers()` to accurately capture debounced `localStorage` `setItem` calls within Angular Signals `effect()` context which proved unstable under standard `fakeAsync`.
- Verified UI compilation through `nx build playground` (task-208).

### Completion Notes List
- Implemented robust `localStorage` sync under the key `origo_playground_draft`.
- Initial load leverages `try/catch` wrapping and explicit `JSON.parse` validation to prevent crash loops when hot-reloading with corrupted data.
- Enforced Angular Signals constraint via an `effect()` hook tracking editor content state, coupled with `onCleanup` for debouncing (`500ms`) the local storage saves.
- Wrapped `setItem` in `try/catch` to elegantly ignore `QuotaExceededError` or `SecurityError` triggered by iframe sandboxing limitations per architectural mandates.
- Configured component unit tests covering all fallbacks (Invalid JSON, SecurityError) and successful state recovery scenarios.

### File List
- `packages/playground/src/editor/badl-editor.component.ts`
- `packages/playground/src/editor/badl-editor.component.spec.ts`
- `packages/playground/src/app/app.component.spec.ts`

### Review Findings

- [x] [Review][Patch] Add Playwright 1.45.x Regression Test Fixture for state persistence [packages/playground/e2e/]
- [x] [Review][Patch] Fix empty string guard in ffect() to allow saving cleared editor state [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Wrap signal update 	his.editorContent.set(val) inside 	his.zone.run() [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Validate parsed JSON is a plain object, not primitive/array [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Make debounce test robust against multiple onDidChangeModelContent calls [packages/playground/src/editor/badl-editor.component.spec.ts]
- [x] [Review][Patch] Reset i.useFakeTimers() in fterEach or 	ry/finally [packages/playground/src/editor/badl-editor.component.spec.ts]
- [x] [Review][Patch] Use localStorage.removeItem instead of clear() in tests [packages/playground/src/editor/badl-editor.component.spec.ts]
- [x] [Review][Patch] Add test coverage for setItem throwing QuotaExceededError and SecurityError [packages/playground/src/editor/badl-editor.component.spec.ts]
- [x] [Review][Patch] Re-stringify parsed JSON to discard trailing whitespace/BOM [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Fix ditorContentChange.emit logic on first render to prevent double-init/stale props [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Add guard against calling getValue on disposed editor instance [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Use ditor.getModel().setValue(value) instead of createModel(savedState) [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Use ditor.getModel().getValue() instead of ditor.getValue() [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Provide a guaranteed valid empty BADL JSON object {} as ultimate fallback [packages/playground/src/editor/badl-editor.component.ts]
- [x] [Review][Patch] Remove unused akeAsync and 	ick testing imports [packages/playground/src/editor/badl-editor.component.spec.ts]
- [x] [Review][Defer] Deduplicate Monaco editor mocks between spec files [packages/playground/src/app/app.component.spec.ts] — deferred, pre-existing
- [x] [Review][Defer] Add comment explaining intentional non-reactivity of initialValue() signal read outside Angular zone [packages/playground/src/editor/badl-editor.component.ts] — deferred, pre-existing
