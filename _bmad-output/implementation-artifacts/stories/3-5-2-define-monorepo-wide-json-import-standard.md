---
epic: 3
story: "5-2"
title: Define Monorepo-Wide JSON Import Standard
status: done
baseline_commit: 5e7a25e74757edb1350ba72f31e077518bc79a56
---

# Story 3.5.2: Define Monorepo-Wide JSON Import Standard

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story Foundation

**User Story:**
As a Monorepo Developer,
I want a standardized configuration for importing JSON files across all packages,
So that CI pipelines do not fail with TypeScript TS2732 errors when core packages import schema fixtures.

**Acceptance Criteria:**
1. **Given** the Origo monorepo and Nx tooling
   **When** a developer runs the `nx run core:build` or `core:lint` commands
   **Then** the TypeScript configuration allows for `resolveJsonModule` standard imports natively (FR-PREP-001)
   **And** the monorepo CI checks enforce this pattern without throwing type errors (NFR-PREP-001)
   **And** ESLint rules or architectural guidelines are enforced to prevent directly importing massive JSON fixtures that would cause TypeScript compiler OOM crashes (NFR-PREP-008).

**Business Context:**
This is part of the Tech Debt & Retro Prep Chores (Epic 3) and must be completed to stabilize the build environment for the Origo design system, specifically prior to implementing complex AST validation logic which relies on JSON test fixtures.

## Tasks / Subtasks
- [x] Task 1: Update root and package-level `tsconfig.json` / `tsconfig.base.json` files to enable `resolveJsonModule` and `esModuleInterop` if not already present.
- [x] Task 2: Validate `nx run @origo/core:build` and `@origo/core:lint` (or `core:build` / `core:lint` as defined in Nx) commands succeed when importing JSON files.
- [x] Task 3: Add ESLint rules (e.g., using `no-restricted-imports` or a custom rule) or architectural guidelines to warn/prevent importing massive JSON files to prevent OOM errors.
- [x] Task 4: Add an Architecture Decision Record (ADR) documenting the JSON import standard.

### Review Findings
- [x] [Review][Decision] Pattern matching for massive JSON is too narrow. (Blind Hunter 3 / Edge Case Hunter 14) — Relying only on `.fixture.json` and `.mock.json` ignores `.large.json`, `.data.json`, etc. Is this suffix-based restriction enough or should we block all large JSON via a different mechanism (e.g. size plugin)?
- [x] [Review][Patch] Redundant `resolveJsonModule` in `packages/design-tokens/tsconfig.json` and `packages/core/tsconfig.spec.json`.
- [x] [Review][Patch] `no-restricted-imports` only catches ESM `import`, misses `require()` (and missing for `.js`/`.jsx` block).
- [x] [Review][Patch] No automated test proves the ESLint rule fires (Violates AC1 testing requirements).
- [x] [Review][Patch] ADR is missing standard metadata fields (Date, Status, Author).
- [x] [Review][Patch] ADR does not mention `esModuleInterop` consequences.
- [x] [Review][Patch] `ast-validator.md` import path in code sample (`@origo/core/validator/ast-validator`) might not resolve.
- [x] [Review][Patch] `astro.config.mjs` sidebar has inconsistent indentation.
- [x] [Review][Patch] No `eslint-disable` guidance provided in ADR.
- [x] [Review][Defer] `astro.config.mjs` docs site title is still `'My Docs'` and GitHub URL is default. — deferred, pre-existing
- [x] [Review][Defer] ADR recommendation for `fs.readFileSync` has no helper/utility. — deferred, out of scope for this spec
- [x] [Review][Defer] `docs/astro.config.mjs` Guides sidebar uses hardcoded links instead of autogenerate. — deferred, out of scope
- [x] [Review][Defer] `sprint-status.yaml` no `story_file` field. — deferred, framework issue

## Dev Agent Guardrails

### Technical Requirements
- MUST configure TypeScript to natively allow importing JSON (`resolveJsonModule: true`).
- MUST configure ESLint or provide CI-level tooling to restrict importing massive JSON files.
- MUST create an ADR describing the standard for importing JSON.

### Architecture Compliance
- **FR-PREP-001**: Define monorepo-wide ESM/TypeScript JSON import standard and ADR.
- **NFR-PREP-001**: Enforce JSON import pattern via monorepo-wide CI check.
- **NFR-PREP-008**: JSON import standardization must include guidance or lint rules against directly importing massive JSON fixtures that cause TypeScript compiler OOM errors.

### Library/Framework Requirements
- TypeScript configuration (`tsconfig.json`, `tsconfig.base.json`)
- ESLint configuration (`.eslintrc.json` or `eslint.config.js`)
- Nx CLI (`nx run core:build`, `nx run core:lint`)

### File Structure Requirements
- `tsconfig.base.json` or package-level `tsconfig.json` for compiler options.
- ESLint configs in the monorepo root or package level.
- `docs/ADR` or similar folder for the Architecture Decision Record.

### Testing Requirements
- Ensure `nx run core:build` and `core:lint` execute successfully.
- Verify ESLint successfully catches an import of a deliberately massive JSON file if the rule is enforced.

## Previous Story Intelligence
- Story 3.5.1 established semantic versioning for `@origo/core`. 
- The repository uses `nx release` with `commitlint` and standard conventional commits.
- This story continues addressing the technical debt and environment stabilization chores required before further feature work.

## Git Intelligence Summary
- Recent commits introduced `commitlint.config.js`, `.husky/commit-msg`, and updated `package.json` for versioning.
- Changes should respect the established monorepo structure and not break the CI flow configured in `.github/workflows/`.

## Latest Tech Information
- TypeScript supports `resolveJsonModule` but generally requires `esModuleInterop` for seamless ESM compatibility when importing JSON.
- For ESLint, there might be specific plugins like `eslint-plugin-import` or custom local rules needed to check file sizes or restrict JSON imports to specific directories/patterns. Alternatively, an architectural guideline might be sufficient if enforced via code review.

## Project Context Reference
- Strict Nx boundary enforcement: packages must version independently.
- The monorepo heavily relies on JSON schemas (BADL schemas). Importing test fixtures for `core:build` and `core:lint` is fundamental to testing the AST validation engine.

## Completion Notes
Ultimate context engine analysis completed - comprehensive developer guide created.
Tasks completed:
- `tsconfig.base.json` updated with `resolveJsonModule: true` and `esModuleInterop: true`.
- Removed redundant `resolveJsonModule` from `packages/core/tsconfig.json`.
- Validated that `core:build` and `core:lint` execute successfully.
- Added `@typescript-eslint/no-restricted-imports` (via base ESLint `no-restricted-imports`) to `eslint.config.js` restricting `**/*.fixture.json` and `**/*.mock.json`.
- Created ADR 001 at `docs/src/content/docs/architecture-decisions/001-json-import-standard.md`.

## File List
- `tsconfig.base.json` (modified)
- `packages/core/tsconfig.json` (modified)
- `eslint.config.js` (modified)
- `docs/src/content/docs/architecture-decisions/001-json-import-standard.md` (new)

## Change Log
- Defined Monorepo-Wide JSON Import Standard (Date: 2026-08-11)
