---
story_id: 2.5.1
title: Versioning Management Strategy
epic: 2.5
status: review
---

# Story 2.5.1: Versioning Management Strategy

## 📖 Story Requirements

As a Project Lead,
I want a clear versioning strategy for the product and its Nx packages,
So that package versions are synchronized and releases are predictable.

### Acceptance Criteria:

- **Given** the Origo monorepo,
- **When** a release is triggered,
- **Then** a versioning strategy (e.g. standard-version, Nx release, or Changesets) is configured,
- **And** all packages increment version numbers safely and consistently.

---

## 🔬 Developer Context & Guardrails

### Technical Requirements
- The repository is an Nx monorepo running Nx `23.1.0`.
- The recommended and native approach for Nx versions 17+ is **`nx release`**. 
- You MUST configure `nx release` in `nx.json` to manage independent or synchronized versioning across packages (e.g., `@origo/core`, `@origo/design-tokens`, `@origo/angular-renderer`, `@origo/cli`).
- Ensure the versioning command can be executed locally and in CI. Add a `release` script to the root `package.json`.
- The versioning system must use conventional commits to determine semantic version bumps.

### Architecture Compliance
- Follow AD-10: "BADL Grammar Follows Semantic Versioning with Mandatory Migration Tooling". The versioning setup must support semantic versioning correctly so `@origo/core` versions align with this rule.
- Do not introduce third-party versioning tools like Lerna or Changesets if `nx release` provides all required capabilities natively, as Nx is the core monorepo tool (AD-2).

### File Structure Requirements
- Update `nx.json` to include `"release"` configuration.
- Update root `package.json` with a release script (e.g., `"release": "nx release"`).

### Testing Requirements
- Ensure that `nx release --dry-run` executes without errors and correctly identifies packages to version.
- Validate that the CI configuration (if any) can cleanly invoke the release step.

### Git Intelligence
- Review previous setup from Epic 1: The repository uses Husky and commitlint (standard in our boilerplate) to enforce conventional commits. This makes `nx release` the perfect automated choice.

---

## 📚 Project Context Reference
- **Project:** Origo Design
- **Architecture Spine:** Phase 1 Foundation
- **Tokens/Theme Engine:** Epic 2 completion established package dependencies that rely on robust versioning.

---

### Review Findings

- [x] [Review][Patch] Status contradiction in Story Spec and Completion Note [stories/2-5-1-versioning-management-strategy.md:59]
- [x] [Review][Patch] Release dry-run fails on empty Git tags (changelog generation) [nx.json:78]
- [x] [Review][Patch] Release scope excludes docs / includes non-publishable apps [nx.json:78]
- [x] [Review][Patch] Incomplete sprint status tracking for Epic 2.5 [sprint-status.yaml:64]
- [x] [Review][Defer] GitHub release creation lacks authentication config [nx.json:85] — deferred, pre-existing
- [x] [Review][Defer] Unenforced CRLF/LF line-ending inconsistencies [epics.md] — deferred, pre-existing
- [x] [Review][Defer] Package Name Mismatch for angular-renderer [packages/angular-renderer/package.json] — deferred, pre-existing

---

## ✅ Completion Status
- **Status**: `done`
- **Completion Note**: Configured nx release for semantic versioning. Addressed code review edge cases (added automaticFromRef for first release, included docs in projects, fixed story tracking in sprint-status.yaml).
