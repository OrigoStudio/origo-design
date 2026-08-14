---
baseline_commit: HEAD
---

# Story 4.5: Behavior Validation Suite

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Core Developer,
I want 100% test coverage on the expanded validation engine,
So that invalid capability/contract setups are guaranteed to be caught at runtime.

## Acceptance Criteria

1. **Given** the expanded validation engine
   **When** the unit and integration test suite runs via `npx nx test core --coverage`
   **Then** coverage is 100% (branch, statement, function, line) for the behavior validation logic in `packages/core/src/validator/**/*.ts` (FR-TEST-002).
2. **And** the tests include validation against the complex real-world target page JSON fixture from Epic 3, augmented with Epic 4 capability, contract, and permission behaviors.
3. **And** integration-level negative test fixtures are created and validated to ensure error aggregation formats diagnostics accurately.
4. **And** all negative tests assert specific error codes, paths, and diagnostic messages rather than just verifying `isValid: false`.

## Tasks / Subtasks

- [ ] Task 1: Analyze Current Coverage
  - [ ] Run coverage report for `packages/core/src/validator/` via `npx nx test core --coverage`.
  - [ ] Identify gaps in coverage for capabilities, contracts, permissions, and extensions validation.
- [ ] Task 2: Implement Behavior Validation Tests
  - [ ] Add unit tests for Capability definitions (valid and invalid CRUD+L verbs).
  - [ ] Add unit tests for Contract implementations and cross-boundary verification.
  - [ ] Add unit tests for Security and Permissions (Role-based, fail-closed enforcement).
  - [ ] Add unit tests for Extension manifest and Plugin semantic version validation.
  - [ ] Ensure all negative tests assert specific error codes, paths, and messages.
- [ ] Task 3: Integration Testing with Real-World Fixtures
  - [ ] Load the complex real-world target page JSON fixture from Epic 3.
  - [ ] Augment the fixture with Epic 4 capability, contract, and permission behaviors.
  - [ ] Create integration-level negative test fixtures (e.g., broken contract references, permission violations).
  - [ ] Setup mocking for local extension manifests to test validation against local lockfiles.
  - [ ] Run the validation engine against all fixtures and verify it passes or fails with correct aggregated diagnostics.
- [ ] Task 4: Ensure 100% Coverage & Enforce Thresholds
  - [ ] Verify `packages/core/src/validator/` reaches 100% coverage (branch, statement, function, line).
  - [ ] Update Jest configuration for `@origo/core` to enforce 100% coverage thresholds in CI.
- [ ] Task 5: Fix Discovered Bugs
  - [ ] Fix any edge case bugs discovered in `packages/core/src/validator/ast-validator.ts` during testing (in-place).

## File List
- `packages/core/src/validator/ast-validator.spec.ts` (Modified)
- `packages/core/src/validator/ast-validator.ts` (Modified to fix uncovered edge cases/bugs)
- `packages/core/test/fixtures/target-page.json` (Modified)
- `packages/core/test/fixtures/target-page-invalid.json` (Added)
- `packages/core/jest.config.ts` (Modified)

## Dev Agent Guardrails

### Technical Requirements
- 100% branch, statement, function, and line test coverage on `packages/core/src/validator/` behavior validation logic.
- Tests MUST include validation against the complex real-world target page JSON fixture augmented with Epic 4 behaviors.
- Negative tests MUST assert specific error codes and paths.

### Architecture Compliance
- **FR-TEST-002**: Validation logic must be fully tested.
- **AD-3 (@origo/core)**: All changes remain in `@origo/core`. No runtime framework dependencies.

### File Structure Requirements
- Validation logic and tests belong in `packages/core/src/validator/`.
- Test fixtures should reside in `packages/core/test/fixtures/` or adjacent test utility folders.

### Testing Requirements
- 100% test coverage for behavior validation logic.
- Must include both positive (valid) and negative (invalid) test cases for capabilities, contracts, permissions, and extensions.
- Use `npx nx test core --coverage` to execute tests.

## Previous Story Intelligence (From Story 4.4)
- **Dev Notes:** `ast-validator.ts` received semantic version checks. Ensure these paths are also fully covered.
- **Review Finding:** Defensive null/undefined checks were added in previous PRs. Ensure tests explicitly cover null/undefined inputs for capabilities, contracts and extensions.

## Project Context Reference
- **Project**: origo-design
- **Epic**: Epic 4 - Core Behaviors & Extensibility (@origo/core)

### Review Findings
- [x] [Review][Decision] Vacuous integration test criterion for target-page.json — Augment the Epic 3 fixture with Epic 4 behaviors.
- [x] [Review][Decision] Uncontrolled scope creep in File List — Fix bugs in this story.
- [x] [Review][Patch] Contradictory story status in header vs. footer completion notes
- [x] [Review][Patch] Ambiguous definition of "Behavior Validation Logic" scope
- [x] [Review][Patch] Unspecified coverage metric dimensions (requires branch coverage)
- [x] [Review][Patch] Omission of Story 4.4 Extension and Plugin validation from test tasks
- [x] [Review][Patch] Lack of diagnostic and error code assertion requirements
- [x] [Review][Patch] Misapplied architectural guideline (AD-12)
- [x] [Review][Patch] Technical inaccuracy in the User Story value statement (runtime vs compile-time)
- [x] [Review][Patch] Missing execution command and CI threshold enforcement
- [x] [Review][Patch] No integration-level negative test fixtures
- [x] [Review][Patch] Missing local manifest configuration for integration tests
- [x] [Review][Defer] Explicit edge cases found in ast-validator.ts (e.g. Domain id missing, null elements) — deferred, pre-existing known edge cases
