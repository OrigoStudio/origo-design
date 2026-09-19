---
baseline_commit: NO_VCS
---

# Story retro-8: sync-versioning

Status: done

## Story

As a developer,
I want to synchronize the versioning of the DevTools extension and Playground with the main core packages,
so that they strictly match and can be reliably inspected as new primitives are rolled out in Epic 9.

## Acceptance Criteria

1. Identify the version of the main core packages (e.g., `@origo/core`, `@origo/design-tokens`).
2. Update the version in `packages/devtools/package.json` to match the core packages.
3. Verify that `packages/playground/package.json` also matches the core packages.

## Developer Context

- **Previous Story Learnings:** Epic 9 will deliver a large batch of foundational primitive components (Form & Layout). The primary preparation requirement is to ensure the DevTools and Playground versioning strategy is tightly coupled with the core packages, guaranteeing these new primitives can be reliably inspected.
- **Current State:** The core packages are at version `0.0.30`, but the newly created `devtools` package is at version `0.0.1`.

## Technical Requirements & Architecture Compliance

- **Target Files:** `packages/devtools/package.json`, `packages/playground/package.json`.
- **DoD Compliance:** Ensure that the version fields strictly match `0.0.30`.

## Tasks

- [x] **1. Sync DevTools Version:** Update `packages/devtools/package.json` version to match core (`0.0.30`).
- [x] **2. Verify Playground Version:** Confirm `packages/playground/package.json` version matches core.

## Dev Agent Record

### Debug Log
- Verified `packages/playground/package.json` is at version `0.0.30`.
- Updated `packages/devtools/package.json` from `0.0.1` to `0.0.30`.

### Completion Notes
✅ Version synchronized across packages.

## File List
- `packages/devtools/package.json`

## Change Log
- Updated `@origo/devtools` package version to `0.0.30`.
