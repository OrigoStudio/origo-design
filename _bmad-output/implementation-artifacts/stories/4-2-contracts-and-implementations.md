---
baseline_commit: 4b37c59b01283611900a5bb837a7e99a38037267
---

# Story 4.2: Contracts and Implementations

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Core Developer,
I want the BADL parser to support Contracts,
So that developers can define abstract interfaces that multiple Entities or Plugins must fulfill.

## Acceptance Criteria

1. **Given** a BADL schema defining a `Contract` and an `Entity` implementing it
   **When** the validation engine runs
   **Then** it verifies that the Entity provides all required fields and capabilities defined by the Contract
2. **And** performs cross-boundary capability verification to ensure the Entity can fulfill behavioral requirements
3. **And** throws a compilation error if the contract is breached.

## Tasks / Subtasks

- [x] Task 1: Parse `Contract` definitions (AC: #1)
  - [x] Add AST support for Contracts in `@origo/core` schema parsing
  - [x] Support `Entity` implementing a `Contract`
- [x] Task 2: Validation Engine Implementation (AC: #1, #2, #3)
  - [x] Validate that an entity implements all required fields from the Contract
  - [x] Validate cross-boundary capabilities to fulfill behavioral requirements
  - [x] Throw descriptive compilation errors on contract breach
- [x] Task 3: Testing (AC: #1, #2, #3)
  - [x] Add unit tests for successful contract implementations
  - [x] Add unit tests for failed contract validations

## Dev Notes

- Relevant architecture patterns and constraints:
  - @origo/core schema validation MUST be strict.
  - Fail fast with descriptive compilation errors.
- Source tree components to touch:
  - `@origo/core` AST engine (parsers and validators)
- Testing standards summary:
  - 100% test coverage for the AST parser/validation engine.

### Project Structure Notes

- Alignment with unified project structure: `@origo/core` package.

### References

- Cite all technical details with source paths and sections, e.g. [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2: Contracts and Implementations]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (Low)

### Debug Log References

### Completion Notes List

### File List

### Review Findings
- [x] [Review][Patch] Missing unit test coverage for invalid contract definitions (missing refs, duplicate IDs, cross-boundary) [packages/core/src/validator/ast-validator.spec.ts]
- [x] [Review][Patch] Null/undefined requiredFields/requiredCapabilities items trigger TypeError [packages/core/src/validator/ast-validator.ts:438]
- [x] [Review][Patch] Unconstrained capability verb vocabulary in contract schema [packages/core/src/schemas/contract.schema.json:88]
- [x] [Review][Patch] Null contracts skipped without INVALID_FORMAT error [packages/core/src/validator/ast-validator.ts:408]
- [x] [Review][Patch] Capabilities with duplicate IDs are still registered [packages/core/src/validator/ast-validator.ts:397]
- [x] [Review][Patch] Inconsistent error path formatting for contract breach [packages/core/src/validator/ast-validator.ts:444]
- [x] [Review][Patch] Loss of type safety with `any` casting in validator collections [packages/core/src/validator/ast-validator.ts:384]
- [x] [Review][Defer] Incomplete schema constraints for contract field types [packages/core/src/schemas/contract.schema.json] — deferred, pre-existing
- [x] [Review][Defer] Overly restrictive top-level schema requirement [packages/core/src/schemas/contract.schema.json] — deferred, pre-existing
- [x] [Review][Defer] Unoptimized quadratic lookup in contract field validation [packages/core/src/validator/ast-validator.ts] — deferred, pre-existing
- [x] [Review][Defer] Unchecked cross-domain contract references [packages/core/src/validator/ast-validator.ts] — deferred, pre-existing
