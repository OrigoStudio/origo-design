---
baseline_commit: db07bc81f13559140a9b3781dfaa61e6db47599a
status: done
---

# Story 3.1: Target Page JSON Fixture

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

- [x] Task 1: Create Target Page JSON Fixture (AC: 1)
  - [x] Scaffold the fixture file exactly at `packages/core/src/schemas/__fixtures__/target-page.json`.
  - [x] Model a concrete **User Management** domain, including `User`, `Role`, and `Department` entities to ensure realistic complexity.
  - [x] Include core capabilities (CRUD+L: `CreateUser`, `ReadUser`, `UpdateUser`, `DeleteUser`, `ListUsers`).
  - [x] For every Entity field, include mandatory properties: `type`, `label`, `validation[]`, and `metadata_path` (FR-E-002).
  - [x] Add `metadata_path` values using the strict dot notation format (`EntityName.FieldName`).
  - [x] Ensure array ordering is semantically insignificant and IDs are stable across entities (FR-M-006).
  - [x] Ensure the fixture strictly conforms to canonical JSON formatting rules (FR-M-008) — no trailing commas, no comments.
- [x] Task 2: Syntactic Validation
  - [x] Run a JSON parser or quick node script (e.g., `node -e "require('./packages/core/src/schemas/__fixtures__/target-page.json')"`) to guarantee the file is valid JSON before completing the story.

### Review Findings
- [x] [Review][Patch] Add item type schema to array field `Role.permissions` [target-page.json]
- [x] [Review][Patch] Add relationship/references metadata to foreign key fields [target-page.json]
- [x] [Review][Patch] Add top-level `id` and `name` properties to root AST [target-page.json]
- [x] [Review][Patch] Add capabilities for `Role` and `Department` entities [target-page.json]
- [x] [Review][Patch] Add boolean/date fields to test diverse primitive parsing [target-page.json]
- [x] [Review][Patch] Add `uuid` validation rule to `departmentId` foreign key [target-page.json]
- [x] [Review][Patch] Fix sprint-status timestamp format consistency [sprint-status.yaml]
- [x] [Review][Patch] Remove redundant `Status:` line in story body [3-1-target-page-json-fixture.md]

## Dev Notes

- **Architectural Constraints:**
  - P1-AD-3: The format will eventually be validated against JSON Schema Draft 2020-12 (to be built in 3.2). The fixture needs to be realistic and accurate.
  - P1-AD-4: `@origo/core` has strict internal module structure. The fixture must be placed at `packages/core/src/schemas/__fixtures__/target-page.json` for validation tests to consume.
  - AD-7 / AD-12: Test Selectors Use BADL `metadata_path` Values (`metadata_path: "EntityName.FieldName"`). Must be strict JSON.
- **Testing Standards:**
  - This fixture serves as the primary dataset for unit and integration testing of the parser and validation engine in subsequent stories (3.2, 3.3, 3.4).

### Project Structure Notes

- Alignment with unified project structure: Needs to be within `packages/core/src/schemas/__fixtures__`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3-BADL-Domain-Validation-Engine-origo-core]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md#P1-AD-3]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md#AD-7]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md#AD-12]

## Dev Agent Record

### Agent Model Used
Gemini 3.1 Pro

### Debug Log References
- JSON syntactic validation succeeded via node module loader.

### Completion Notes List
- Created valid JSON fixture at `packages/core/src/schemas/__fixtures__/target-page.json` modeling User Management domain.
- Strictly followed FR-E-002, FR-M-006, and FR-M-008 constraints.

### File List
- `packages/core/src/schemas/__fixtures__/target-page.json` (NEW)
