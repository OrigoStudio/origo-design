---
baseline_commit: 00a1fe1fa423e478a7e806aee26a66fdf9608e9a
status: done
story_id: 2.4
story_key: 2-4-token-resolution-consumption-contract
epic: 2
---

# Story 2.4: Token Resolution & Consumption Contract

Status: ready-for-dev

## Story

As a Platform Engineer,
I want the token injection mechanism to resolve efficiently,
So that theme switching and initial rendering do not cause UI jank.

## Acceptance Criteria

1. **Given** the Origo web adapter
   **When** the generated CSS variables are applied to the DOM root
   **Then** tokens are available for consumption by the renderer (FR-THEME-005)
   **And** resolution timing passes the performance benchmark limits defined in NFR-PERF-005.

## Dev Agent Guardrails

### Technical Requirements
- Implement the mechanism to fetch/load a `theme.json` file at runtime (deferred from Story 2.3).
- Integrate the `theme.json` fetch mechanism with the `injectTheme` utility from Story 2.3.
- Ensure the fetch and injection process resolves efficiently to prevent UI jank during initial rendering and theme switching.
- Validate that the resolution timing meets the performance benchmark limits defined in NFR-PERF-005.
- Connect this to the Origo web adapter so that tokens are available for consumption by the Angular renderer.

### Architecture Compliance
- **FR-THEME-005**: Token consumption by renderers MUST be supported. The tokens must be available as CSS Custom Properties in the DOM for the Web Adapter.
- **NFR-PERF-005**: Design tokens must be resolved efficiently. (Note: AD-6 states tokens are resolved at build time, but theme overrides are runtime. The runtime application of overrides must be highly performant).
- **P1-AD-1**: If writing any Angular integration, ensure it uses Standalone components and Signals, no Zone.js dependencies.
- **AD-15**: Experience Adapter is a stateless interaction translator. The web adapter should consume the tokens without maintaining stateful theme logic itself.

### Library/Framework Requirements
- Use native browser capabilities (e.g., `fetch` API) for retrieving `theme.json`.
- Continue using the native CSS Custom Properties mechanism implemented in Story 2.3.
- Do not introduce heavy third-party libraries for fetching or applying the theme.
- Ensure compatibility with Angular 18 (standalone, zoneless) for the consumption contract.

### File Structure Requirements
- Update `packages/design-tokens/src/runtime/theme-injector.ts` (or add a new fetch utility `theme-fetcher.ts` in the same directory).
- Tests: `packages/design-tokens/src/runtime/theme-fetcher.spec.ts`.
- Ensure exports in `packages/design-tokens/package.json` are updated if new entry points are added.
- Add integration point in `@origo/angular-renderer` web adapter to trigger the theme initialization (e.g. an APP_INITIALIZER or similar token provider in Angular).

### Testing Requirements
- Unit tests for the `theme.json` fetch wrapper (mocking `fetch`).
- Integration tests ensuring the fetched theme is correctly passed to `injectTheme` and applied to the DOM.
- Performance benchmark test to validate compliance with NFR-PERF-005 (e.g., measuring the time taken from fetch to DOM injection).

## Previous Story Intelligence
### Learnings from Story 2.3:
- The `theme-injector` uses a stable ID generator and strict DOM updates. Be sure to preserve the cleanup mechanism (teardown function) returned by `injectTheme`.
- Sanitization in `parseTheme` handles CSS injection prevention. Ensure the fetched JSON is directly passed to `parseTheme` without bypassing sanitization.
- SSR guard (`typeof document === 'undefined'`) is already in place. The fetch mechanism should also gracefully handle SSR environments (e.g., bypassing fetch or providing a no-op).

## Git Intelligence Summary
Recent commits implemented the `theme-injector` and its strict testing. Ensure that the new fetch wrapper builds upon this without regressing the security fixes (e.g., prototype pollution blocks, scoped style tag memory leaks).

## Project Context Reference
- Epic 2 focuses on the Design Token Pipeline (`@origo/design-tokens`).
- This story completes the pipeline by connecting the runtime theme override utility to a fetch mechanism and the Web Adapter.
- Ensuring performance (NFR-PERF-005) is a critical requirement for this final token pipeline piece before moving to Epic 3.

## Tasks/Subtasks
- [x] 1. Implement `theme.json` fetch mechanism
  - [x] 1.1 Create `src/runtime/theme-fetcher.ts` using native `fetch`
  - [x] 1.2 Handle SSR and network error edge cases
  - [x] 1.3 Write unit tests mocking the fetch API
- [x] 2. Integrate fetch with `injectTheme`
  - [x] 2.1 Create a seamless `loadAndInjectTheme` utility
  - [x] 2.2 Add performance timing marks around the fetch and injection process
  - [x] 2.3 Write tests verifying the integration
- [x] 3. Web Adapter Integration
  - [x] 3.1 Expose the initialization hook for the Angular web adapter
  - [x] 3.2 Ensure the tokens are available for the Angular renderer before initial paint
- [x] 4. Benchmark Validation
  - [x] 4.1 Write a benchmark test ensuring the entire resolution timing meets NFR-PERF-005

### Completion Notes
- Ultimate context engine analysis completed - comprehensive developer guide created.
