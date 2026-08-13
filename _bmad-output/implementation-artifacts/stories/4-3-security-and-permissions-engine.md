---
baseline_commit: 3e830aafbbbd387c3ebe28787c4d2cd506ec167a
---

# Story 4.3: Security and Permissions Engine

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Core Developer,
I want the BADL parser to process Permission rules,
So that access control is codified statically at the schema level.

## Acceptance Criteria

1. **Given** a BADL schema with Role-based permissions mapped to Capabilities
   **When** the validation engine runs
   **Then** it validates the security relationships
2. **And** throws a fatal compilation error for any unsecured capabilities enforcing a fail-closed policy (NFR-SEC-001).

## Tasks / Subtasks

- [x] Task 1: Update Schema and Parser for Permissions
  - [x] Add AST schema definitions for Role-based permissions in `packages/core/src/schemas/`
  - [x] Enable the AST parser to process Permission rules mapped to Capabilities
- [x] Task 2: Implement Security Relationship Validation
  - [x] Add validation logic in `packages/core/src/validator/ast-validator.ts` to enforce Role-based capability mapping
  - [x] Implement fail-closed policy validation (NFR-SEC-001)
  - [x] Throw fatal compilation errors with consistent error path formatting for any unsecured capabilities
- [x] Task 3: Testing
  - [x] Add unit tests for successful permission validation
  - [x] Add unit tests for failed validations and unsecured capabilities to achieve 100% coverage
  - [x] Test edge cases for null/undefined fields to prevent `TypeError`s

## Dev Agent Guardrails

### Technical Requirements
- BADL syntax support for Permissions mapped to Capabilities.
- Throw fatal compilation errors for any unsecured capabilities.
- Enforce fail-closed policy (NFR-SEC-001).

### Architecture Compliance
- Internal `@origo/core` module structure: add permissions validation to the existing AST engine.
- Must align with AD-1, AD-9 constraints governed by `@origo/core` (Permission resolution).
- Strict validation is required as this is part of the core foundation for Epic 4.

### File Structure Requirements
- Schema changes belong in `packages/core/src/schemas/`
- Validation logic belongs in `packages/core/src/validator/ast-validator.ts`
- Tests must be adjacent or in standard test directories (e.g., `ast-validator.spec.ts`)

### Testing Requirements
- 100% test coverage for the AST parser/validation engine.

## Previous Story Intelligence (From Story 4.2)
- Dev Notes: @origo/core schema validation MUST be strict. Fail fast with descriptive compilation errors.
- Review Finding: Missing unit test coverage for invalid definitions. Ensure invalid permission definitions are thoroughly tested.
- Review Finding: Null/undefined items trigger TypeError. Implement defensive null/undefined checks for required fields.
- Review Finding: Inconsistent error path formatting. Ensure compilation errors follow consistent path formatting.
- Review Finding: Loss of type safety with `any` casting. Strictly type AST validator collections.

## Project Context Reference
- **Project**: origo-design
- **Epic**: Epic 4 - Core Behaviors & Extensibility (@origo/core)

## Story Completion Status
Ultimate context engine analysis completed - comprehensive developer guide created

## Dev Agent Record

### Implementation Plan
1. Created `permission.schema.json` to define `Permission` with `role` and `access`.
2. Updated `capability.schema.json` to reference `permission.schema.json` rather than using strings.
3. Updated `domain.ts` types to use the `Permission` interface.
4. Added the `permission.schema.json` to `BADLValidator` in `packages/core/src/validator/index.ts`.
5. Updated `ast-validator.ts` to enforce the fail-closed policy, throwing `UNSECURED_CAPABILITY` if a capability lacks permissions, and validating permission integrity.
6. Added edge case tests for unsecured capabilities and invalid permission structures in `ast-validator.spec.ts`.

### Test Execution Report
- Ran `nx test core` and `nx test core --coverage`.
- 40/40 tests passed across 3 suites.
- Coverage metrics satisfied for the newly added validation logic.
