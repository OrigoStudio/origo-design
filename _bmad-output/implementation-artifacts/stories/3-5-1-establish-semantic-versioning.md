---
epic: 3
story: "5-1"
title: Establish Semantic Versioning for @origo/core
status: done
---

# Story 3.5.1: Establish Semantic Versioning for @origo/core

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story Foundation

**User Story:**
As a Core Maintainer,
I want to establish an automated semantic versioning pipeline for the `@origo/core` package,
So that all AST logic changes and bug fixes made during this sprint are tracked, properly versioned, and safely released to downstream consumers.

**Acceptance Criteria:**
1. **Given** the Origo monorepo and CI pipeline
   **When** a pull request containing conventional commits is merged into the `main` branch
   **Then** the `@origo/core` package version is automatically bumped according to semantic rules (FR-PREP-004)
   **And** the CI versioning job exits cleanly (code 0) if no releasable commits are detected, preventing false-positive pipeline failures (NFR-PREP-007).

**Business Context:**
This is required before any downstream consumption starts. Proper semantic versioning ensures that API changes, schema additions, or bug fixes are safely communicated to consumers via deterministic version increments.

## Tasks / Subtasks

- [x] Task 1: Initialize semantic versioning strategy for the Nx monorepo (e.g., using Nx release, Changesets, or standard-version)
  - [x] Subtask 1.1: Configure versioning tool at the monorepo root to target `@origo/core` and other packages
  - [x] Subtask 1.2: Ensure conventional commit parsing is enforced
- [x] Task 2: Configure CI pipeline for automated versioning
  - [x] Subtask 2.1: Add a CI workflow/job that runs the versioning tool on pushes to the `main` branch
  - [x] Subtask 2.2: Ensure the CI job exits cleanly (code 0) when no releasable commits are detected (NFR-PREP-007)
- [x] Task 3: Document the versioning process for developers
  - [x] Subtask 3.1: Add a section in `README.md` or a `CONTRIBUTING.md` describing how conventional commits affect versioning
### Review Findings
- [x] [Review][Patch] `nx release` scope is monorepo-wide [nx.json:79] — The release configuration includes `docs` and `apps/*` instead of just `@origo/core`. Update it to target only packages.
- [x] [Review][Patch] Husky hook uses deprecated v4 bootstrap syntax [.husky/commit-msg:2]
- [x] [Review][Patch] Husky hook script lacks executable permissions [.husky/commit-msg]
- [x] [Review][Patch] Release workflow lacks concurrency control [.github/workflows/release.yml:34-38]
- [x] [Review][Patch] `npm run release` script omits `--skip-publish` [package.json:14]
- [x] [Review][Patch] Documentation inaccurately describes trigger condition [docs/src/content/docs/guides/publishing.mdx:27]
- [x] [Review][Patch] Stale retro action item status [_bmad-output/implementation-artifacts/sprint-status.yaml:131-142]
- [x] [Review][Patch] `epic-2-5: done` removed from sprint status [_bmad-output/implementation-artifacts/sprint-status.yaml:62]
- [x] [Review][Defer] Release workflow pushes directly to main without branch protection awareness [.github/workflows/release.yml:1-38] — deferred, pre-existing repo setup dependency

## Dev Agent Guardrails

### Technical Requirements
- MUST implement semantic versioning strategy (e.g. Nx release or Changesets)
- CI job MUST NOT fail if there are no releasable commits (exit 0)
- Changes MUST follow conventional commits standard

### Architecture Compliance
- **FR-PREP-004**: Establish semantic versioning for `@origo/core` package
- **NFR-PREP-007**: Semantic versioning CI jobs must exit cleanly (code 0) if no releasable commits are detected, preventing false-positive CI failures.

### Library/Framework Requirements
- Use standard ecosystem tools suitable for Nx monorepos (e.g., `nx release`, Changesets)
- Follow existing CI pipeline conventions (e.g. GitHub Actions)

### File Structure Requirements
- Update CI configuration files (e.g., `.github/workflows/ci.yml` or similar)
- Add or update versioning tool configuration files (e.g., `nx.json`, `.changeset/config.json`)

### Testing Requirements
- Test the versioning tool locally to verify it parses conventional commits and suggests the correct semantic version bump.

## Previous Story Intelligence
- Story 3.4 completed the AST validation engine with DAG circular dependency resolution.
- It was crucial to have deterministic execution and high test coverage. The versioning system must now safely release these features.

## Latest Tech Information
- Nx 19+ has built-in `nx release` capabilities which may be the preferred approach for Nx monorepos. Verify current Nx version and `nx release` configuration practices.

## Project Context Reference
- Strict Nx boundary enforcement: packages must version independently or coherently depending on the selected strategy.

## Completion Notes
Ultimate context engine analysis completed - comprehensive developer guide created

## Dev Agent Record

### Agent Model Used
Gemini 3.1 Pro (High)

### Debug Log References

### Completion Notes List
- Verified `nx release` configuration is in `nx.json`.
- Installed `commitlint` and configured `.husky/commit-msg` to enforce conventional commits.
- Added `.github/workflows/release.yml` with `npx nx release --skip-publish` to handle versioning cleanly in CI without failing on no commits.
- Documented semantic versioning process in `README.md`.

### File List
- `package.json` [UPDATE]
- `commitlint.config.js` [NEW]
- `.husky/commit-msg` [NEW]
- `.github/workflows/release.yml` [NEW]
- `README.md` [UPDATE]
