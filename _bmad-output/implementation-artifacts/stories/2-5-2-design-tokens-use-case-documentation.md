---
story_id: 2.5.2
title: Design Tokens Use Case Documentation
epic: 2.5
status: ready-for-dev
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

## ✅ Completion Status
- **Status**: `ready-for-dev`
- **Completion Note**: Ultimate context engine analysis completed - comprehensive developer guide created.
