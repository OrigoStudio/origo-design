---
baseline_commit: HEAD
---

# Story 4.4: Extensibility and Plugin Schema

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Core Developer,
I want the BADL parser to support Extension and Plugin definitions,
So that the system knows which external plugins are allowed to implement which contracts.

## Acceptance Criteria

1. **Given** an `Extension` definition mapping a plugin to a Contract
   **When** the parser runs
   **Then** it adds the extension metadata to the AST
2. **And** the engine validates any semantic versioning requirements purely against a local manifest or lockfile with zero network calls (NFR-VER-001).

## Tasks / Subtasks

- [x] Task 1: Update BADL Schema for Extensions
  - [x] Add schema definitions (e.g., `extension.schema.json`) for Extension metadata and plugin mappings.
  - [x] Ensure schema handles semantic versioning requirements for extensions.
- [x] Task 2: Implement Extension Validation Logic
  - [x] Update the AST parser in `@origo/core` to process Extension definitions and add them to the AST.
  - [x] Implement logic to validate semantic versioning requirements strictly against a local manifest/lockfile, ensuring zero network calls (NFR-VER-001).
- [x] Task 3: Testing
  - [x] Add unit tests for successful Extension validation.
  - [x] Add unit tests for failed validations (e.g., mismatched versions, missing local manifest) to achieve 100% coverage.
  - [x] Test edge cases for null/undefined fields to prevent `TypeError`s.

## Dev Agent Record
### Debug Log
- N/A
### Completion Notes
- Added `extension.schema.json` and updated `domain.schema.json` to include `extensions`.
- Added semantic versioning check to `ast-validator.ts` via the `semver` library and a new `localManifest` parameter.
- Full unit test coverage added in `ast-validator.spec.ts`.

## File List
- `packages/core/src/schemas/extension.schema.json` (New)
- `packages/core/src/schemas/domain.schema.json` (Modified)
- `packages/core/src/types/domain.ts` (Modified)
- `packages/core/src/types/validation.ts` (Modified)
- `packages/core/src/validator/index.ts` (Modified)
- `packages/core/src/validator/ast-validator.ts` (Modified)
- `packages/core/src/validator/ast-validator.spec.ts` (Modified)
- `packages/core/package.json` (Modified)

## Dev Agent Guardrails

### Technical Requirements
- Support Extension and Plugin definitions mapped to Contracts.
- Validate semantic versioning requirements purely against a local manifest or lockfile with zero network calls (NFR-VER-001).

### Architecture Compliance
- **AD-5 (Extension Contract)**: The Extension Contract is the only third-party boundary. Ensure extensions provide required manifest data (id, version, extension_type).
- **AD-3 (@origo/core)**: All changes must reside within `@origo/core` with no runtime framework dependencies.
- **AD-10 (Semantic Versioning)**: Strict semantic versioning must be applied to grammar compatibility and extension resolution.

### File Structure Requirements
- Schema changes belong in `packages/core/src/schemas/`.
- Validation logic belongs in `packages/core/src/validator/` (e.g., `ast-validator.ts`).
- Tests must be adjacent or in standard test directories.

### Testing Requirements
- 100% test coverage for the AST parser/validation engine.
- Must include fixtures for semantic versioning validation (both valid and invalid).

## Previous Story Intelligence (From Story 4.3)
- **Dev Notes:** `@origo/core` schema validation MUST be strict. Fail fast with descriptive compilation errors.
- **Review Finding:** Missing unit test coverage for invalid definitions. Ensure invalid permission (and now extension) definitions are thoroughly tested.
- **Review Finding:** Null/undefined items trigger `TypeError`. Implement defensive null/undefined checks for required fields.
- **Review Finding:** Inconsistent error path formatting. Ensure compilation errors follow consistent path formatting.
- **Review Finding:** Loss of type safety with `any` casting. Strictly type AST validator collections.

## Project Context Reference
- **Project**: origo-design
- **Epic**: Epic 4 - Core Behaviors & Extensibility (@origo/core)

## Story Completion Status
Ultimate context engine analysis completed - comprehensive developer guide created

### Review Findings
- [x] [Review][Decision] Restrictive \implements\ Field Type — Extension \implements\ field is a single string instead of an array, preventing implementation of multiple contracts. Should it be an array?
- [x] [Review][Patch] Missing Semantic/AST-level Validation of Extension Definitions [packages/core/src/validator/ast-validator.ts:15]
- [x] [Review][Patch] Inconsistent Field Naming in Extension Schema [packages/core/src/schemas/extension.schema.json:23]
- [x] [Review][Patch] Missing Format Constraints in Extension Schema [packages/core/src/schemas/extension.schema.json:8]
- [x] [Review][Defer] Unchecked Mutability in AST Parameter [packages/core/src/validator/ast-validator.ts:100] — deferred, pre-existing
