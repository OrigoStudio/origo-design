---
epic: 3
story: "5-3"
title: Defensive AST Traversal
status: ready-for-dev
---

# Story 3.5.3: Defensive AST Traversal

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story Foundation

**User Story:**
As a Core Engine Developer,
I want to refactor the AST recursive traversal to include depth limits, circular reference checks, and deferred edge case handling,
So that maliciously nested JSON payloads or missing references do not crash the Node process and cause a Denial of Service (DoS).

**Acceptance Criteria:**
1. **Given** the AST engine's recursive parsing logic
   **When** it encounters an excessively nested payload (e.g., depth > MAX_AST_DEPTH) or a cyclic reference (e.g., Entity A -> Entity B -> Entity A)
   **Then** it gracefully returns a validation error array instead of crashing the Node process (NFR-PREP-005)
   **And** it detects circular entity references immediately via a visited-node tracker, rather than waiting for the maximum depth limit to trigger (NFR-PREP-006)
   **And** AST traversal performance remains within benchmark limits after these defensive checks are added (NFR-PREP-002)
   **And** all deferred edge cases (e.g., missing dependencies) are covered by explicit regression test fixtures (NFR-PREP-003, FR-PREP-002)
   **And** the changes maintain 100% backwards compatibility with existing valid JSON structures (NFR-PREP-004, FR-PREP-003).

**Business Context:**
This is the final tech debt and stabilization chore for Epic 3. The AST logic currently throws Node.js `Error` objects and uses recursion in `validateAST` (DFS) and `canonicalize` that can cause stack overflows if limits aren't enforced. It must be refactored to return an array of validation errors gracefully.

## Developer Context

### Current State Analysis
- `packages/core/src/validator/ast-validator.ts` currently uses a `dfs` function that detects cycles using a `visiting` Set, but it `throw new Error(...)` rather than accumulating and returning an array of errors. It also lacks a depth limit.
- `packages/core/src/validator/serializer.ts` uses `canonicalize()` which also does recursive deep cloning with a `WeakSet` to prevent infinite loops on circular object references, but it also throws directly and doesn't limit depth.
- The return signature of `validateAST` is currently `void`, throwing errors. It will need to be refactored to return `ValidationError[]` (or similar) or we must introduce a new structured result format.
- `serializeAST` currently calls `validateAST(ast)` and expects it to throw. This contract might need adjusting to return errors cleanly or throw an aggregated error object.

### Dev Agent Guardrails

#### Technical Requirements
- MUST refactor `validateAST` and any recursive traversal functions (e.g. `canonicalize`) to track recursion depth and abort gracefully if `MAX_AST_DEPTH` (e.g., 100) is exceeded.
- MUST accumulate errors into an array and return them gracefully, rather than allowing `throw new Error(...)` to crash the process or leave errors unhandled.
- MUST maintain the visited-node cycle detection for entity references (`dfs` in `ast-validator.ts`).
- MUST NOT significantly impact traversal performance (keep within benchmark limits).

#### Architecture Compliance
- **FR-PREP-002**: Fix AST parser deeply nested chain limit.
- **FR-PREP-003**: Prevent deferred edge case crashes in AST engine.
- **NFR-PREP-002**: AST traversal performance must remain within benchmark limits.
- **NFR-PREP-003**: Deferred edge cases covered by explicit regression test fixtures.
- **NFR-PREP-004**: 100% backwards compatibility with existing valid JSON structures.
- **NFR-PREP-005**: Fail gracefully (return validation error array) instead of crashing the Node process.
- **NFR-PREP-006**: Detect and reject circular entity references immediately via visited-node tracker.

#### Library/Framework Requirements
- Node.js 22 LTS, TypeScript 5.x.
- Core packages have zero framework dependencies.

#### File Structure Requirements
- Changes isolated to `packages/core/src/validator/ast-validator.ts`, `serializer.ts`, and their respective `.spec.ts` files.
- Regression test fixtures should be added in `packages/core/src/validator/__fixtures__/` or `packages/core/tests/` matching existing patterns.

#### Testing Requirements
- Provide an explicit regression test for an excessively deep AST structure.
- Provide an explicit regression test for circular entity references.
- Provide an explicit regression test for missing dependencies / unresolvable references.
- All existing tests in `ast-validator.spec.ts` and `serializer.spec.ts` MUST continue to pass.

### Previous Story Intelligence
- Story 3.5.2 established a JSON import standard and we learned that importing massive JSON files can cause TS memory issues. Testing with deep/large ASTs should generate payloads dynamically in tests or use appropriately sized fixtures to avoid `.fixture.json` typechecking bloat.
- The `ast-validator.ts` path was referenced in documentation updates during 3.5.2.

### Git Intelligence Summary
- The `core` package uses `nx` and strict typescript configurations. Recent commits resolved ESM/TS import standardizations.

### Latest Tech Information
- For Node.js call stacks, recursion depth > 1000 typically causes `Maximum call stack size exceeded`. A safe `MAX_AST_DEPTH` might be around 100-250 to ensure we fail gracefully before the V8 engine throws a stack overflow.

### Project Context Reference
- Epic 3's core deliverable is the Canonical AST validation engine. This stability fix is required before Epic 4 begins heavily extending the schemas with Capabilities, Contracts, and Extensions, which will add further tree complexity.

## Completion Status
Status: ready-for-dev
Completion Note: Ultimate context engine analysis completed - comprehensive developer guide created.
