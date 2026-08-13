---
baseline_commit: HEAD
---

# Story 4.5: Behavior Validation Suite

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Core Developer,
I want 100% test coverage on the expanded validation engine,
So that invalid capability/contract setups are guaranteed to be caught at compile-time.

## Acceptance Criteria

1. **Given** the expanded validation engine
   **When** the unit and integration test suite runs
   **Then** coverage is 100% for the behavior validation logic (FR-TEST-002)
2. **And** the tests include validation against the complex real-world target page JSON fixture from Epic 3.

## Tasks / Subtasks

- [ ] Task 1: Analyze Current Coverage
  - [ ] Run coverage report for `packages/core/src/validator/`.
  - [ ] Identify gaps in coverage for capabilities, contracts, and permissions validation.
- [ ] Task 2: Implement Behavior Validation Tests
  - [ ] Add unit tests for Capability definitions (valid and invalid CRUD+L verbs).
  - [ ] Add unit tests for Contract implementations and cross-boundary verification.
  - [ ] Add unit tests for Security and Permissions (Role-based, fail-closed enforcement).
- [ ] Task 3: Integration Testing with Real-World Fixture
  - [ ] Load the complex real-world target page JSON fixture from Epic 3.
  - [ ] Run the validation engine against the fixture and verify it passes without errors.
- [ ] Task 4: Ensure 100% Coverage
  - [ ] Verify `packages/core/src/validator/` (specifically `ast-validator.ts` and related) reaches 100% coverage.

## File List
- `packages/core/src/validator/ast-validator.spec.ts` (Modified)
- `packages/core/src/validator/ast-validator.ts` (Modified if required to fix uncovered edge cases)
- `packages/core/test/fixtures/target-page.json` (Modified/Added)

## Dev Agent Guardrails

### Technical Requirements
- 100% test coverage on `packages/core/src/validator/` behavior validation logic.
- Tests MUST include validation against the complex real-world target page JSON fixture.

### Architecture Compliance
- **AD-12 (Test Selectors)**: Tests should use stable `metadata_path` values.
- **FR-TEST-002**: Validation logic must be fully tested.
- **AD-3 (@origo/core)**: All changes remain in `@origo/core`. No runtime framework dependencies.

### File Structure Requirements
- Validation logic and tests belong in `packages/core/src/validator/`.
- Test fixtures should reside in `packages/core/test/fixtures/` or adjacent test utility folders.

### Testing Requirements
- 100% test coverage for behavior validation logic.
- Must include both positive (valid) and negative (invalid) test cases for capabilities, contracts, and permissions.

## Previous Story Intelligence (From Story 4.4)
- **Dev Notes:** `ast-validator.ts` received semantic version checks. Ensure these paths are also fully covered.
- **Review Finding:** Defensive null/undefined checks were added in previous PRs. Ensure tests explicitly cover null/undefined inputs for capabilities, contracts and extensions.

## Project Context Reference
- **Project**: origo-design
- **Epic**: Epic 4 - Core Behaviors & Extensibility (@origo/core)

## Story Completion Status
Ultimate context engine analysis completed - comprehensive developer guide created
