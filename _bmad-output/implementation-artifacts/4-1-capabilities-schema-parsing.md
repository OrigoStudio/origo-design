---
baseline_commit: bf01a90d1ab88f169b2ffce3775dcbde5128c65b
---
# Story 4.1: Capabilities Schema Parsing

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Core Developer,
I want the BADL parser to understand Capabilities,
so that developers can define what actions (e.g., `Create`, `Update`, `Publish`) are allowed on Entities.

## Acceptance Criteria

1. **Given** a BADL schema with `Capability` definitions
2. **When** the compiler parses it
3. **Then** it successfully maps the capabilities to their target entities
4. **And** it enforces a strict vocabulary of core capability verbs (CRUD+L) to prevent naming fragmentation
5. **And** includes these relationships in the canonical JSON AST.

*(Additional Context from FR-C-001)*: Each Capability MUST declare: id, name, description, type (Command|Query), outcome_ref[], preconditions[], postconditions[], permissions[], risk_level, interaction_contract_ref, async.

## Tasks / Subtasks

- [x] Task 1: Update JSON Schema for Capabilities (AC: 1, 4, FR-C-001)
  - [x] Create `capability.schema.json` or deeply define capabilities within `domain.schema.json` to include all required fields: id, name, description, type (Command|Query), outcome_ref, preconditions, postconditions, permissions, risk_level, interaction_contract_ref, async.
  - [x] Add strict validation rules (enum or regex pattern) to enforce CRUD+L core verbs.
  - [x] Ensure JSON schema continues to follow Draft 2020-12 format.
- [x] Task 2: Generate TypeScript Types (AC: 1)
  - [x] Run the `json-schema-to-typescript` build step to generate the corresponding interfaces in `packages/core/src/types/`. (Do NOT hand-author these).
- [x] Task 3: Update AST Validation Engine (AC: 3, 5)
  - [x] Update Ajv validation logic in `packages/core/src/validator/` to ensure capabilities correctly reference their target entities.
  - [x] Validate the structural inclusion of Capabilities in the canonical JSON AST output.
- [x] Task 4: Testing (AC: 1-5)
  - [x] Add unit and integration tests to achieve 100% test coverage for the capabilities schema parsing.
  - [x] Verify validation fails properly on missing required fields or non-CRUD+L naming fragmentation.

## Dev Notes

- **Architecture Rules to follow:**
  - **P1-AD-3**: JSON Schema Draft 2020-12 + Ajv 8. Types MUST be generated using `json-schema-to-typescript`, never hand-authored.
  - **P1-AD-4**: Strict internal modules inside `@origo/core`. Exports only via `src/index.ts`.
  - **AD-9**: Capability type MUST be `Command` or `Query`.
  - **FR-C-001**: Defines the exact fields required for a capability.

### Project Structure Notes

- **Modifications expected in:**
  - `packages/core/src/schemas/domain.schema.json` (currently has a basic `capabilities` stub which needs expansion or refactoring to a separate file like `capability.schema.json`).
  - `packages/core/src/validator/` (Ajv setup and test files).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-4]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (High)

### Debug Log References

### Completion Notes List

- Added capability.schema.json and linked it in domain.schema.json
- Generated capability type via json-schema-to-typescript
- Updated AST validator engine (index.ts & ast-validator.ts) to enforce entityId reference
- Added unit tests for Capability validation logic

### File List

- packages/core/src/schemas/capability.schema.json
- packages/core/src/schemas/domain.schema.json
- packages/core/src/types/capability.ts
- packages/core/src/types/domain.ts
- packages/core/src/validator/index.ts
- packages/core/src/validator/index.spec.ts
- packages/core/src/validator/ast-validator.ts
- packages/core/src/validator/ast-validator.spec.ts
- packages/core/scripts/generate-types.ts
