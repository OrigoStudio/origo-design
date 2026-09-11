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
