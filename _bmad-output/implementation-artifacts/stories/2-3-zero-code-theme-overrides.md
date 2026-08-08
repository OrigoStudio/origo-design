---
status: done
story_id: 2.3
story_key: 2-3-zero-code-theme-overrides
epic: 2
baseline_commit: 1ec3866c74a417eed54f2b2bcbc7daaaee8212c8
---

# Story 2.3: Zero-Code Theme Overrides

Status: done

## Story

As a Platform Consumer,
I want to provide a runtime `theme.json` override file,
So that I can white-label the application dynamically without changing code.

## Acceptance Criteria

1. **Given** a deployed Origo application
   **When** a `theme.json` configuration is provided that overrides specific semantic tokens
   **Then** the application's appearance updates at runtime (FR-THEME-003, 004)
   **And** all inputs are sanitized to prevent CSS injection vulnerabilities
   **And** any missing or invalid tokens safely fall back to the base theme without breaking the UI.

## Dev Agent Guardrails

### Technical Requirements
- Create a mechanism to fetch, parse, and apply a `theme.json` file at runtime.
- Map the JSON structure to the CSS custom properties generated in Story 2.2.
- The `theme.json` should only override semantic tokens (e.g. `surface`, `primary`), not base tokens unless strictly necessary, but fallback gracefully.
- Inject the parsed values as inline styles (e.g., on `:root` or `document.documentElement` or via a `<style>` tag injection) to override the default CSS variables.
- Ensure strict sanitization of the values to prevent CSS injection attacks (e.g. validating color formats, px values).

### Architecture Compliance
- **AD-6**: Theme switching is achieved through token-override files only — no component stylesheet is forked.
- **FR-THEME-003, FR-THEME-004**: The system must apply these variables at runtime without needing a rebuild or deployment code change.
- Must work across all renderers consuming these styles (focusing on web renderer for now, mapping token keys to CSS variables).

### Library/Framework Requirements
- Use native browser capabilities (CSS Custom Properties).
- The parsing and injection logic must be robust and framework agnostic, living in `@origo/design-tokens` as a runtime utility.
- No heavy third-party libraries for applying CSS variables.

### File Structure Requirements
- `packages/design-tokens/src/runtime/theme-injector.ts` (Runtime utility for token injection)
- `packages/design-tokens/src/runtime/theme-injector.spec.ts` (Tests)
- Update `packages/design-tokens/package.json` to correctly export the runtime utility.

### Testing Requirements
- Unit tests to verify that `theme.json` is correctly transformed into CSS variable assignments.
- Unit tests to verify sanitization (e.g. passing a malicious string `red; display: none` should be rejected or sanitized).
- Fallback tests ensuring that invalid formats are ignored and fall back to the base styles.

## Previous Story Intelligence
### Learnings from Story 2.2:
- The token build pipeline generates CSS custom properties (e.g. `--origo-color-surface`). The runtime injector must match this exact prefixing logic.
- Story 2.2 established strict package exports. Any new runtime utility in `design-tokens` must be correctly exported in `package.json` so it can be consumed by renderers.
- Avoid fragile relative paths; ensure proper Nx targets and artifacts.

## Git Intelligence Summary
Recent commits show successful merge of the `2-2-token-compilation-pipeline`. The baseline CSS generation is fully intact. Ensure any updates to `package.json` exports don't break the CSS exports.

## Project Context Reference
- Epic 2 focuses on the Design Token Pipeline (@origo/design-tokens).
- This capability enables white-labeling (FR-THEME-004), allowing a consumer to drop a `theme.json` in their deployment without changing code.
- This runtime utility will be consumed by the Angular renderer (Epic 5).

## Tasks/Subtasks
- [x] 1. Initialize runtime utility package structure in `@origo/design-tokens`
  - [x] 1.1 Create `src/runtime/theme-injector.ts` and `src/runtime/index.ts`
  - [x] 1.2 Update `package.json` to export `./runtime` entry point
  - [x] 1.3 Add basic tests structure `src/runtime/theme-injector.spec.ts`
- [x] 2. Implement `theme.json` parser and sanitization
  - [x] 2.1 Implement robust JSON parsing
  - [x] 2.2 Implement CSS injection sanitization (validating values)
  - [x] 2.3 Write tests for parser and sanitization
- [x] 3. Implement CSS custom properties injection
  - [x] 3.1 Map `theme.json` keys to generated CSS custom property names
  - [x] 3.2 Implement logic to inject `<style>` tag into `document.head`
  - [x] 3.3 Write tests for DOM injection (using JSDOM or similar)

### Review Findings

- [x] [Review][Decision] `target` parameter ignored — resolved: implemented scoped injection via `data-origo-theme-id` attribute selector. Global `:root` used when `target === document.documentElement`.
- [x] [Review][Patch] CSS injection via object keys — resolved: keys validated against `/^[a-zA-Z0-9_-]+$/` allowlist before interpolation. [theme-injector.ts:12-19, 38-40]
- [x] [Review][Patch] Sanitization is too weak — resolved: value validation replaced with explicit format allowlist (hex, rgb/rgba, hsl/hsla, numeric+unit, named colors). [theme-injector.ts:18]
- [x] [Review][Patch] No SSR guard — resolved: `if (typeof document === 'undefined') return;` added at top of `injectTheme`. [theme-injector.ts:29, 46]
- [x] [Review][Patch] Stale theme persists when re-injecting empty/all-invalid theme — resolved: empty `parsed` now removes the existing style tag instead of returning early. [theme-injector.ts:32-34]
- [x] [Review][Patch] Prototype pollution via `__proto__` key — resolved: `Object.create(null)` used for `result`; explicit `BLOCKED_KEYS` set blocks `__proto__`, `constructor`, `prototype`. [theme-injector.ts:6, 19]
- [x] [Review][Defer] Missing `theme.json` fetch mechanism — spec says "Create a mechanism to fetch, parse, and apply a `theme.json` file at runtime." Only parse+inject are implemented; no network/file fetch wrapper exists. — deferred, pre-existing gap in story scope interpretation; can be addressed in story 2.4 or as a follow-on capability

#### Round 2 Findings

- [x] [Review][Patch] Hyper-restrictive sanitization blocks valid CSS features — regex allowlist blocks `var()`, `calc()`, `clamp()`, and gradients, and native JSON numbers are silently ignored. (from Acceptance Auditor & Blind Hunter) — fix: broaden allowlist and cast numbers to strings.
- [x] [Review][Patch] Scoped style tag memory leak — when a scoped element target is removed from DOM, its injected `<style>` tag is orphaned in `<head>`. (from Blind Hunter & Acceptance Auditor) — fix: introduce a cleanup mechanism (e.g. teardown function).
- [x] [Review][Patch] `Math.random()` ID generator and injection hazard — `tagId` is generated using a non-stable/colliding method and injected without `CSS.escape()`, which breaks if existing `data-origo-theme-id` contains special characters. (from Blind Hunter & Edge Case Hunter) — fix: switch to stable ID generator and use `CSS.escape()`.
- [x] [Review][Patch] Filtering semantic vs base tokens — no mechanism enforces that overrides target semantic tokens rather than base tokens. (from Acceptance Auditor) — fix: add configuration check/list to strictly enforce semantic token overrides.
- [x] [Review][Patch] Default parameter SSR guard evaluation — `target = document.documentElement` default is evaluated before the SSR guard, crashing in non-browser environments. Explicitly passing `null` also crashes. (from Blind Hunter & Edge Case Hunter) [packages/design-tokens/src/runtime/theme-injector.ts:75]
- [x] [Review][Patch] Infinite recursion and depth limits — circular object references cause maximum call stack exceeded. Function recurses to arbitrary depth despite JSDoc saying "single-level-nested". (from Blind Hunter & Edge Case Hunter) [packages/design-tokens/src/runtime/theme-injector.ts:41-48]
- [x] [Review][Patch] `document.head` is null hazard — crashes if `document.head` is null in non-standard HTML environments. (from Edge Case Hunter) [packages/design-tokens/src/runtime/theme-injector.ts:98]
- [x] [Review][Patch] Prototype pollution test is invalid — test creates object using `{ __proto__: 'polluted' }` which sets the prototype rather than adding a key, thus passing vacuously. (from Blind Hunter) [packages/design-tokens/src/runtime/theme-injector.spec.ts]
- [x] [Review][Patch] `deferred-work.md` encoding artifacts — contains garbled Windows-1252 mojibake (`ΓÇö` instead of `—`). (from Blind Hunter) [deferred-work.md]
- [x] [Review][Patch] Missing test coverage for SSR guard — `typeof document === 'undefined'` branch has zero test coverage. (from Blind Hunter) [packages/design-tokens/src/runtime/theme-injector.spec.ts]
- [x] [Review][Patch] Fragile test cleanup logic — `afterEach` relies on elements still being in the DOM to clean up attributes. (from Blind Hunter) [packages/design-tokens/src/runtime/theme-injector.spec.ts]
- [x] [Review][Patch] Missing return value — `injectTheme` does not signal if injection succeeded, was suppressed, or failed. (from Blind Hunter) [packages/design-tokens/src/runtime/theme-injector.ts:73]
- [x] [Review][Defer] Missing `theme.json` fetch mechanism — explicitly deferred to Story 2.4. [deferred-work.md] — deferred, pre-existing

## File List
- `packages/design-tokens/src/runtime/theme-injector.ts`
- `packages/design-tokens/src/runtime/theme-injector.spec.ts`
- `packages/design-tokens/src/runtime/index.ts`
- `packages/design-tokens/package.json`

## Change Log
- Initialized runtime package structure inside `design-tokens`.
- Added `./runtime` export to `package.json`.
- Implemented `parseTheme` with CSS custom property mapping and sanitization.
- Implemented `injectTheme` using DOM manipulation to inject CSS into `<style data-origo-theme="runtime">`.
- Added comprehensive unit tests in `theme-injector.spec.ts` using `jsdom`.

## Dev Agent Record
### Implementation Plan
1. Create new entry point `runtime` inside `@origo/design-tokens` package.
2. Ensure flat JSON parsing and strict sanitization of CSS variables.
3. Use native browser DOM APIs to safely inject a `<style>` tag containing custom CSS properties at runtime.
4. Ensure 100% test coverage for the injector and parser logic using Jest with JSDOM.

### Debug Log
- Tests initially failed because `document` was not defined. Added `/** @jest-environment jsdom */` to resolve it.

### Completion Notes
- All tasks have been implemented.
- Robust parsing and injection utilities are ready.
- CSS sanitization rules applied effectively.
- Ultimate context engine analysis completed - comprehensive developer guide created.
