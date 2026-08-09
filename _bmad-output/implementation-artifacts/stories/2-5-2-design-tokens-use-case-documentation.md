---
story_id: 2.5.2
title: Design Tokens Use Case Documentation
epic: 2.5
status: review
---

# Story 2.5.2: Design Tokens Use Case Documentation

## 📖 Story Requirements

As a UX Engineer,
I want documentation detailing how and by whom `@origo/design-tokens` should be used,
So that consumers understand the token lifecycle and overrides.

### Acceptance Criteria:

- **Given** the Starlight docs site,
- **When** a developer navigates to the Design Tokens section,
- **Then** they can read a comprehensive use case guide explaining token structures, consumption, and white-labeling.

---

## 🔬 Developer Context & Guardrails

### Technical Requirements
- The documentation must be added to the Starlight documentation site located in `docs/`.
- Create a new MDX page under `docs/src/content/docs/guides/design-tokens.mdx`.
- Cover the following key topics:
  - **Token Structure:** Base vs. Semantic vs. Component tokens (as defined in `base-tokens.schema.json` and Epic 2 tokens).
  - **Consumption:** How to use the API (e.g., `resolveTheme`) and Angular renderer `ThemeProvider` to inject tokens.
  - **White-labeling & Overrides:** How clients can provide overriding dictionaries at runtime.
- Update `docs/astro.config.mjs` (or sidebar configuration) to link to the new guide, if necessary.

### Architecture Compliance
- Follow the documentation site architecture created in Epic 1 (Starlight).
- Ensure documentation is accurate based on the implementations of `packages/design-tokens` from Stories 2.1 through 2.4.

### File Structure Requirements
- `[NEW] docs/src/content/docs/guides/design-tokens.mdx`

### Testing Requirements
- The documentation site must build successfully without broken links.
- Run `nx build docs` to verify the Astro site builds correctly.

### Git Intelligence
- Epic 2 was focused heavily on tokens and theme resolution. Review `theme-fetcher.ts` and `theme.provider.ts` for exact consumption examples to include in the docs.
- Recent changes from 2.5.1 introduced `nx release`. Docs should mention how packages are versioned and imported.

---

## 📚 Project Context Reference
- **Project:** Origo Design
- **Architecture Spine:** Phase 1 Foundation
- **Tokens/Theme Engine:** This completes the Epic 2 documentation debt by solidifying consumer understanding.

---

## 📋 Tasks/Subtasks

### Review Findings
- [x] [Review][Patch] Incorrect error handling in JS example — `loadAndInjectTheme` does not throw; it catches internally.
- [x] [Review][Patch] Missing `resolveTheme` API usage example (mandated by AC).
- [x] [Review][Patch] Token structure syntax is invalid (uses dots instead of hyphens) & base overrides are silently blocked.
- [x] [Review][Patch] Missing `injectTheme` and `fetchTheme` code examples.
- [x] [Review][Patch] Angular guide terminology (`ThemeProvider`) and teardown/CORS considerations missing.
- [x] [Review][Patch] Target element override is missing a code example.
- [x] [Review][Patch] SSR safe-handling and partial override merge strategy are undocumented.
- [x] [Review][Defer] Concurrent `loadAndInjectTheme` calls produce undefined behavior (API tech debt) — deferred, pre-existing.

---

## ✅ Completion Status
- **Status**: `done`
- **Completion Note**: ✅ Story complete. Added `design-tokens.mdx` Starlight documentation covering token structure, vanilla JS/TS consumption, Angular Renderer consumption, and white-labeling. Sidebar updated. `nx build docs` executed and passed successfully.

### File List
- `[NEW] docs/src/content/docs/guides/design-tokens.mdx`
- `[MODIFIED] docs/astro.config.mjs`

### Change Log
- Created comprehensive guide on design tokens `design-tokens.mdx`.
- Hooked up guide into the Starlight configuration in `docs/astro.config.mjs`.
