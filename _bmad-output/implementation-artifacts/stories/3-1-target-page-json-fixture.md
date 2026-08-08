---
status: ready-for-dev
---

# Story 3.1: Target Page JSON Fixture

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Core Developer,
I want to define a static JSON representation of a complex real-world Origo page,
so that I have a tangible target for the BADL schema to compile against.

## Acceptance Criteria

1. **Given** the Origo repository
   **When** I examine the test fixtures
   **Then** there is a complete JSON AST representing a full CRUD screen with multiple nested entities and relationships
   **And** this fixture serves as the ultimate integration test for the compiler.

## Tasks / Subtasks

- [ ] Task 1: Create Target Page JSON Fixture (AC: 1)
  - [ ] Scaffold a JSON file within `@origo/core/src/schemas/__fixtures__` (or equivalent test fixtures folder) that represents a complete JSON AST.
  - [ ] Ensure the fixture represents a full CRUD screen, including multiple nested entities and relationships.
  - [ ] Include core capabilities (e.g. CRUD+L) to represent what an actual page would look like.
  - [ ] Add `metadata_path` values using the dot notation format (`EntityName.FieldName`).
  - [ ] Ensure the fixture strictly conforms to canonical JSON formatting rules.

## Dev Notes

- **Architectural Constraints:**
  - P1-AD-3: The format will eventually be validated against JSON Schema Draft 2020-12 (to be built in 3.2). The fixture needs to be realistic and accurate.
  - P1-AD-4: `@origo/core` has strict internal module structure. The fixture should be placed appropriately for tests to consume, e.g., `packages/core/src/schemas/__fixtures__/target-page.json` or `packages/core/tests/fixtures/target-page.json`.
  - AD-7: Must be JSON.
  - AD-12: Test Selectors Use BADL `metadata_path` Values (`metadata_path: "EntityName.FieldName"`).
- **Testing Standards:**
  - This fixture serves as the primary dataset for unit and integration testing of the parser and validation engine in subsequent stories (3.2, 3.3, 3.4).

### Project Structure Notes

- Alignment with unified project structure: Needs to be within `packages/core`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3-BADL-Domain-Validation-Engine-origo-core]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md#P1-AD-3]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md#AD-7]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md#AD-12]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
