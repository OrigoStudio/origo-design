---
story_id: 2.5.3
title: Theme Provider & Composite Token Tech Debt
epic: 2.5
status: done
---

# Story 2.5.3: Theme Provider & Composite Token Tech Debt

## 📖 Story Requirements

As a UX Engineer and Framework Developer,
I want to resolve the technical debt deferred from Epic 2,
So that the Theme Provider API is flexible, concurrent token loading is safe, and composite tokens are properly validated.

### Acceptance Criteria:

- **Given** the Angular `theme.provider.ts`,
- **When** a consumer provides theme configuration,
- **Then** they can supply a static theme dictionary instead of, or in addition to, a URL, and optionally specify a target DOM element.
- **Given** the `loadAndInjectTheme` function in `theme-fetcher.ts`,
- **When** called concurrently multiple times,
- **Then** it must implement a concurrency lock or cancellation mechanism to prevent undefined behavior and race conditions.
- **Given** the `base-tokens.schema.json`,
- **When** a JSON file includes composite tokens (like typography or shadow),
- **Then** the schema must provide validation structures for those token types.

---

## 🔬 Developer Context & Guardrails

### Technical Requirements
- **Angular Renderer:** Update `packages/angular-renderer/src/lib/theme.provider.ts`. The API should allow an options object (e.g., `{ url?: string; theme?: Record<string, unknown>; targetElement?: HTMLElement | string }`) instead of strictly requiring a string URL.
- **Runtime Concurrency:** Update `packages/design-tokens/src/runtime/theme-fetcher.ts`. Introduce a mechanism (e.g., `AbortController` or a simple state tracker) to ensure concurrent calls to `loadAndInjectTheme` do not step on each other or apply styles out of order.
- **Schema Validation:** Update `packages/design-tokens/src/schemas/base-tokens.schema.json`. Add `$defs` for composite types such as `typography`, `shadow`, and `border`. 

### Architecture Compliance
- Keep the `theme-fetcher` lightweight. Avoid adding external libraries for concurrency.
- Ensure backwards compatibility if possible, or update the existing tests to reflect the new `provideOrigoTheme` signature.

### File Structure Requirements
- `[MODIFY] packages/angular-renderer/src/lib/theme.provider.ts`
- `[MODIFY] packages/design-tokens/src/runtime/theme-fetcher.ts`
- `[MODIFY] packages/design-tokens/src/schemas/base-tokens.schema.json`

### Testing Requirements
- Update tests in `packages/angular-renderer/src/lib/theme.provider.spec.ts` for the new options.
- Add tests in `packages/design-tokens/src/runtime/theme-fetcher.spec.ts` that simulate rapid successive calls to `loadAndInjectTheme` to ensure the concurrency lock works.
- Run `npm run test` or `nx test design-tokens` and `nx test angular-renderer` to verify.

### Git Intelligence
- This story resolves tech debt identified in Stories 2.1, 2.4, and 2.5.2.
- Previous work heavily relied on Angular's `APP_INITIALIZER`; ensure changes here don't break the application startup flow.

---

## 📚 Project Context Reference
- **Project:** Origo Design
- **Architecture Spine:** Phase 1 Foundation
- **Tokens/Theme Engine:** Epic 2 Technical Debt resolution.

---

## ✅ Completion Status
- **Status**: `done`
- **Completion Note**: Implementation complete. Angular Provider API updated. Concurrency lock added to fetcher. Schema validated for composite tokens. Tests passing.

### Review Findings

- [x] [Review][Patch] Static theme and remote URL interaction — Both should be injected (static theme first, then fetch URL). Ensure teardown logic handles both.
- [x] [Review][Patch] Module-global concurrency lock breaks SSR/multi-target — `currentLoadId` in `theme-fetcher.ts` aborts concurrent fetches even if they are for different targets or different SSR requests.
- [x] [Review][Patch] Target element resolution lacks fallback — `document.querySelector` returning `null` skips the default fallback, leaving `target` as null.
- [x] [Review][Patch] Silent no-op on invalid options — Empty `{}` options silently resolve with no warning.
- [x] [Review][Patch] Schema `if/then` constraints match absent `$type` — `if` condition allows absent `$type` to trigger composite validation inappropriately.
- [x] [Review][Patch] Group-level `$type` inheritance ignored — Schema doesn't validate composite tokens if `$type` is inherited from a parent group instead of defined on the token itself.
- [x] [Review][Patch] Composite token schemas lack strictness — Missing `additionalProperties: false` and `required` fields for `typographyValue`.
- [x] [Review][Patch] Flawed race-condition test — Test resolves promises synchronously in the same tick and doesn't assert clean resolution of the superseded call.
- [x] [Review][Patch] Uncleaned story artifact — Remove raw template placeholders (`=???`) from the story file.
