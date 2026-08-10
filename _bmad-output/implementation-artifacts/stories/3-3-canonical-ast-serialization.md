---
epic: 3
story: 3
title: Canonical AST Serialization
status: done
baseline_commit: 1fb39249f1d14f8b96bcb099e0c754c88d6f7adf
---

# Story 3.3: Canonical AST Serialization

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story Foundation

**User Story:**
As a Core Developer,
I want the compiler to serialize the parsed memory model into a canonical JSON AST,
So that downstream tools can consume a standardized format.

**Acceptance Criteria:**
1. **Given** a parsed BADL memory model
   **When** I run the serialization step
   **Then** the output is a strict JSON AST (FR-M-008)
   **And** it embeds an explicit `schemaVersion` in the root payload
   **And** it conforms exactly to the canonical on-disk format rules (FR-M-006).

**Business Context:**
This creates the definitive, stable format that all downstream components (CLI, Playground, IDE tools, Renderers) will depend on. It ensures minimal merge conflicts and format consistency across the platform.

## Tasks / Subtasks
- [x] Task 1: Define the TypeScript interfaces for the Canonical AST format, ensuring it enforces the presence of `schemaVersion`.
- [x] Task 2: Implement a `serializeAST` (or similar) serialization function in `@origo/core`. Since P1-AD-4 restricts internal modules, place this inside `packages/core/src/validator/` (e.g. `packages/core/src/validator/serializer.ts`) and export it via `packages/core/src/index.ts`.
- [x] Task 3: Implement canonical serialization rules (FR-M-006): stable IDs, array ordering insignificance (meaning arrays should be sorted predictably by an ID or name), and deterministic object key ordering.
- [x] Task 4: Write comprehensive unit tests that guarantee identical memory models output byte-for-byte identical JSON ASTs regardless of the initial creation order.

## Dev Agent Guardrails

### Technical Requirements
- MUST serialize the parsed and validated schema into a JSON AST string (or object ready for `JSON.stringify`).
- MUST conform to canonical rules: deterministic ordering for array items (since array ordering is semantically insignificant, sort them deterministically by identifier like `id` or `name` to ensure stable output).
- MUST embed an explicit `schemaVersion` in the root payload.
- MUST fail compilation/validation gracefully if serialization encounters an un-serializable state.

### Architecture Compliance
- **P1-AD-4**: `@origo/core` MUST NOT create a new module. Place the serialization logic inside `packages/core/src/validator/` or `packages/core/src/types/`.
- **FR-M-006**: Canonical on-disk format rules (stable IDs across renames, array ordering semantically insignificant, minimal merge conflicts). Deterministic output is non-negotiable.
- **FR-M-008**: Output is strictly JSON.

### Library/Framework Requirements
- Consider adding a dependency like `fast-json-stable-stringify` (or similar) to handle deterministic key sorting during serialization. If added, it MUST be properly documented in `packages/core/package.json`.
- Be mindful of avoiding circular references during serialization (though Story 3.2 already handles detecting them).

### File Structure Requirements
- `packages/core/src/validator/serializer.ts` (or similar) [NEW]
- `packages/core/src/validator/serializer.spec.ts` (or similar) [NEW]
- `packages/core/package.json` [UPDATE] (If adding dependencies)
- `packages/core/src/index.ts` [UPDATE] (Export the new serializer)

### Testing Requirements
- Unit tests MUST assert that two functionally identical ASTs with different object key orderings serialize to the exact same JSON string.
- Array sorting logic MUST be tested for determinism (e.g. arrays of fields or entities output in the same order regardless of input order).
- **100% Test Coverage** for the serialization logic is expected.

## Previous Story Intelligence
- Story 3.2 implemented `domain.schema.json` and `entity.schema.json` parsing and validation.
- The parser/validator uses Ajv 8.
- **Dev Note from 3.2**: "JSON import anomaly caused by TS `import * as` putting JSON inside `.default`". Be cautious of default export behaviors in TS when reading/importing JSON files if you need to inject schemas or configs.
- **Review Findings from 3.2**: Be sure to declare any new dependencies correctly in `package.json` under `dependencies` (not `devDependencies` if they are required at runtime by `@origo/core`).

## Latest Tech Information
- A stable JSON stringifier (like `fast-json-stable-stringify`) might be the easiest way to guarantee object key ordering, but it will not automatically sort arrays semantically. You MUST implement a custom recursive pre-sort step for arrays of objects (sorting by `id` or `name`) before passing to the stable stringifier.

## Project Context Reference
- **Constraint AD-8**: All authoring surfaces output BADL only. This AST is the output form.
- Strict Nx boundary enforcement: `@origo/core` MUST NOT have framework dependencies (e.g., no Angular or React dependencies).

## Completion Notes
Ultimate context engine analysis completed - comprehensive developer guide created.

## Dev Agent Record

### Implementation Plan
- Implemented recursive \canonicalize\ function that sorts object keys alphabetically and sorts array elements by \id\ or \
ame\ if available.
- Added \serializeAST\ function that uses \JSON.stringify\ internally with a 2-space indent on the canonicalized AST payload.
- Added 100% test coverage using Jest for testing determinism across object key orderings and array semantic equivalents.

### File List
- packages/core/src/types/ast.ts
- packages/core/src/index.ts
- packages/core/src/validator/index.ts
- packages/core/src/validator/serializer.ts
- packages/core/src/validator/serializer.spec.ts

### Change Log
- Defined Canonical AST format interface
- Added \serializeAST\ to \@origo/core\
- Ensured deterministic output

### Completion Notes
? Canonical AST Serialization has been fully implemented with tests passing!

### Review Findings

- [x] [Review][Decision] 2-Space Indent Format — Output format (2-space indent) hardcoded with uncertainty comment. Should it be minified or kept 2-space?
- [x] [Review][Patch] Flawed Array Sorting Logic [packages/core/src/validator/serializer.ts:17]
- [x] [Review][Patch] localeCompare Locale Dependence [packages/core/src/validator/serializer.ts:24]
- [x] [Review][Patch] Shallow Validation Missing domains Check [packages/core/src/validator/serializer.ts:55]
- [x] [Review][Patch] Circular Reference Stack Overflow [packages/core/src/validator/serializer.ts:6]
- [x] [Review][Patch] Incomplete Unit Test Suite [packages/core/src/validator/serializer.spec.ts:1]
- [x] [Review][Defer] undefined Values Silently Dropped [packages/core/src/validator/serializer.ts:7] — deferred, pre-existing

