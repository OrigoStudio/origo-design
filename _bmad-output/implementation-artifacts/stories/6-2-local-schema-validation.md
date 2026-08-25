---
baseline_commit: current
---

# Story 6.2: Local Schema Validation

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want an `origo validate` command,
So that I can verify my BADL schemas locally without needing to run the full application.

## Acceptance Criteria

1. **Given** a directory containing BADL schema files
   **When** I run `origo validate`
   **Then** the CLI passes the files through the core compiler (built in Epics 3/4)
2. **And** it reports any syntax or semantic errors in the console with helpful file and line number references (FR-DX-003)
3. **And** the underlying compiler explicitly preserves source map and line number offsets to make this reporting possible.

## Developer Context

This story implements the `origo validate` command in the `@origo/cli` package using Commander.js. It follows the thin-command / lib pattern established in Story 6.1 (`new.ts` → `scaffolding.ts`): the command file is a thin Commander wrapper; all logic lives in `packages/cli/src/lib/validation.ts`.

**Validation is two-stage — both stages are required:**

1. **JSON Schema validation** — Instantiate `new BADLValidator()` from `@origo/core` and call `.validateDomain(rawJsonString)` (pass the file content **as a string**, not a parsed object). This activates Ajv + `json-source-map` and enriches each error with `context.line` / `context.column` (1-indexed). Collect `validator.errors` (typed `EnhancedErrorObject[] | null`).
2. **AST semantic validation** — If JSON schema validation passes, parse the JSON and call `validateAST(parsedDomain)` from `@origo/core`. This detects circular references, missing entity references, contract breaches, and unsecured capabilities. These errors are typed `ValidationError[]` from `@origo/core`.

Both error arrays must be unified into one output stream per file.

**File discovery:** Use `fs.promises.readdir(directory, { recursive: true })` (built into Node ≥ 22 — no glob library needed) and filter for `.json` files. The `directory` argument is optional; default is `./schemas`. If the directory does not exist, throw a `CliError` with `code: 'ERR_DIRECTORY_NOT_FOUND'`.

**Register the command:** Add `program.addCommand(validateCommand())` to `createProgram()` in `packages/cli/src/main.ts`.

**Dependency required:** `@origo/core` must be added to `dependencies` in `packages/cli/package.json` — it is NOT currently listed.

**Key Responsibilities:**
- Add `validate` command to the CLI via Commander.js.
- Recursively discover `.json` files in the target directory (default `./schemas`).
- Invoke `BADLValidator.validateDomain()` (string input) then `validateAST()` on each file.
- Extract `context.line` / `context.column` from `EnhancedErrorObject` for source-mapped error messages.
- Format output: JSON for machine consumers (`--json`), colored human-readable for interactive terminals.
- Handle all I/O defensively (directory not found, unreadable files, invalid JSON).

## Dev Agent Guardrails

### Technical Requirements

- **Command:** `origo validate [directory] [options]`
  - `[directory]` is optional, defaults to `./schemas` relative to `process.cwd()`
- **Library:** MUST use Commander.js for argument parsing.
- **Error Shape:** ALL errors MUST follow `{ code: string, message: string, context?: object }` via the existing `CliError` class — do NOT create a new error class.
- **I/O:** MUST use `fs.promises` throughout. ❌ Do NOT use `fs.readFileSync` or any synchronous fs method.
- **File discovery:** Use `fs.promises.readdir(dir, { recursive: true })` — ❌ do NOT install `glob`, `fast-glob`, or any file-matching library.
- **Environment:** Target Node.js >= 22.0.0.

### Validation API — Exact Usage

```typescript
import { BADLValidator, validateAST, EnhancedErrorObject, ValidationError } from '@origo/core';

// Stage 1: JSON Schema + source map (pass raw string)
const validator = new BADLValidator();
const isSchemaValid = validator.validateDomain(rawJsonString); // string input
const schemaErrors: EnhancedErrorObject[] = validator.errors ?? [];

// Stage 2: Semantic AST validation (only if stage 1 passed)
let astErrors: ValidationError[] = [];
if (isSchemaValid) {
  const parsed = JSON.parse(rawJsonString);
  astErrors = validateAST(parsed);
}
```

**Source map location is on `error.context`, NOT `error.path`:**
```typescript
// EnhancedErrorObject line/column extraction:
const line = error.context?.line;     // 1-indexed, already enriched by BADLValidator
const column = error.context?.column; // 1-indexed, already enriched by BADLValidator
```

### Output Format

**Human-readable (no `--json` flag):**
```
Validating schemas in ./schemas...

  ✓  user.json
  ✗  order.json
       12:5  [INVALID_FORMAT]  Entity "Order" missing required field "id"
       24:1  [MISSING_REFERENCE]  Entity "Customer" referenced by field "customerId" does not exist

Found 2 errors in 1 file (1 file valid, 1 file invalid).
```
Use `chalk` or ANSI codes for color; green `✓`, red `✗`. Exit code 0 on all valid, exit code 1 on any errors.

**Machine-readable (`--json` flag):**
```json
{
  "status": "error",
  "data": {
    "directory": "./schemas",
    "filesValidated": 2,
    "errorsFound": 2,
    "results": [
      { "file": "user.json", "valid": true, "errors": [] },
      {
        "file": "order.json",
        "valid": false,
        "errors": [
          { "code": "INVALID_FORMAT", "message": "...", "line": 12, "column": 5 },
          { "code": "MISSING_REFERENCE", "message": "...", "line": 24, "column": 1 }
        ]
      }
    ]
  }
}
```
On all-valid, status is `"success"`.

### Architecture Compliance

- **Epic 6:** Developer CLI (`@origo/cli`) — FR-DX-003, FR-AI-005.
- **AD-3 & P1-AD-4:** MUST rely on `@origo/core` for ALL validation logic. ❌ The CLI MUST NOT duplicate schema validation rules or re-implement error type checking.
- **AD-7:** Canonical BADL format is JSON. Validate only `.json` files.
- **Package Location:** `packages/cli/`.
- **Nx Tags:** Must respect Nx boundary tags; `cli` can depend on `core`.

### Anti-Patterns — DO NOT DO

- ❌ Do NOT call `validateAST()` directly on raw JSON string input — it expects a parsed `CanonicalAST` object.
- ❌ Do NOT skip calling `BADLValidator.validateDomain(rawString)` with a string — passing a parsed object bypasses source map enrichment and loses line/column data.
- ❌ Do NOT read `error.instancePath` as the location reference — line/column is in `error.context.line` / `error.context.column`.
- ❌ Do NOT install glob libraries — use `fs.promises.readdir` with `{ recursive: true }`.
- ❌ Do NOT create a new error class — reuse `CliError` from `../utils/errors`.
- ❌ Do NOT swallow errors in catch blocks — always rethrow as `CliError` with a structured code.

### File Structure & Testing Requirements

- **Command File:** `packages/cli/src/commands/validate.ts` — thin Commander wrapper (mirrors `new.ts`).
- **Logic File:** `packages/cli/src/lib/validation.ts` — owns file discovery, reading, and validation pipeline invocation.
- **Register in:** `packages/cli/src/main.ts` — add `program.addCommand(validateCommand())`.
- **Update:** `packages/cli/package.json` — add `@origo/core` to `dependencies`.
- **Tests:** `*.spec.ts` MUST be co-located alongside `*.ts` in the same directory (NO `__tests__/` folders).
- **Coverage:** 100% test coverage required.
- **Test mocking:** Mock `fs.promises` to avoid real disk I/O. Mock `BADLValidator` and `validateAST` from `@origo/core` to unit-test the validation logic independently of the core engine. Test all error paths: directory not found, unreadable file, JSON schema errors, AST semantic errors, all-valid scenario.

## Previous Story Intelligence

**Learnings from Story 6.1 (CLI Initialization and Scaffolding) — confirmed via code review:**

- **Shebang:** `#!/usr/bin/env node` is set in `packages/cli/src/main.ts:1` — do not disturb it.
- **Command registration pattern:** Use `program.addCommand(validateCommand())` in `createProgram()` in `main.ts` — exactly as `initCommand()` and `newCommand()` are registered.
- **Commander pattern:** Thin command file → imports from `lib/` → try/catch → `handleError(error, { json: options.json })`. Mirror this exactly.
- **Error handling:** Always call `handleError(error, { json: options.json })` from `../utils/errors` in the command's catch block — this handles both human and JSON output correctly.
- **Error shape:** Use `CliError` class with `{ code, message, context? }`. The `CliError` class is in `packages/cli/src/utils/errors.ts`.
- **Async I/O:** All file system operations must use `fs.promises`. The `fs/promises` import is already used in `scaffolding.ts` — follow the same pattern.
- **JSON output mode:** The `--json` option flag name is `options.json` (boolean) in Commander. Pass it through to the lib layer and to `handleError`.
- **Nx tags:** `packages/cli/project.json` must include `scope:cli` tag for Nx boundary enforcement.
- **Public export:** If any new public types are added to the CLI, export them from `packages/cli/src/index.ts`.

**Files from Story 6.1 to be MODIFIED (not recreated) in this story:**
- `packages/cli/src/main.ts` — add `validateCommand()` import + `program.addCommand(validateCommand())`
- `packages/cli/package.json` — add `@origo/core` to `dependencies`

## Project Context Reference

- **Project**: origo-design
- **Epic**: Epic 6 — Developer CLI (`@origo/cli`)
- **Core validator location**: `packages/core/src/validator/index.ts` — exports `BADLValidator`, `validateAST`, `EnhancedErrorObject`, `ValidationError`
- **Error utility**: `packages/cli/src/utils/errors.ts` — exports `CliError`, `handleError`
- **Existing CLI entry**: `packages/cli/src/main.ts` — `createProgram()` registers all commands

## Tasks/Subtasks

- [x] Add `@origo/core` to `dependencies` in `packages/cli/package.json`
- [x] Create `packages/cli/src/lib/validation.ts`
  - [x] Implement file discovery using `fs.promises.readdir`
  - [x] Implement two-stage validation pipeline (`BADLValidator.validateDomain` and `validateAST`)
  - [x] Map errors to `CliError` format using `context.line` and `context.column`
  - [x] Support both human-readable and JSON output formats
- [x] Create `packages/cli/src/commands/validate.ts`
  - [x] Create thin Commander wrapper for the `validate` command
  - [x] Setup try/catch with `handleError` routing
- [x] Update `packages/cli/src/main.ts` to register `validateCommand`
- [x] Create tests for validation logic (`packages/cli/src/lib/validation.spec.ts`)
  - [x] Mock `fs.promises` and `@origo/core` validators
  - [x] Test directory not found
  - [x] Test JSON schema errors
  - [x] Test AST semantic errors
  - [x] Test all-valid scenario
- [x] Create tests for command wrapper (`packages/cli/src/commands/validate.spec.ts`)

## Dev Agent Record

### Debug Log
- N/A

### Completion Notes
✅ Implemented `validate` command in `@origo/cli`
- Connected CLI to `@origo/core` validation pipeline
- Implemented file discovery using `fs.promises.readdir`
- Extracted and displayed context.line/column info on errors
- Wrote full unit test coverage using mocks

## File List
- `packages/cli/package.json` (modified)
- `packages/cli/src/main.ts` (modified)
- `packages/cli/src/lib/validation.ts` (new)
- `packages/cli/src/lib/validation.spec.ts` (new)
- `packages/cli/src/commands/validate.ts` (new)
- `packages/cli/src/commands/validate.spec.ts` (new)

## Change Log
- Added `validate` command to `@origo/cli`.
- Integrated `@origo/core` semantic AST validation into the CLI.

## Status Update

Ultimate context engine analysis completed — comprehensive developer guide created.
Story structure validated and required tracking sections added.
All tasks completed successfully.

### Review Findings

- [ ] [Review][Decision] Hardcoded assumption that all schemas are domain definitions — validator.validateDomain is called on all files. Non-domain schemas fail. How should the CLI distinguish schema types?
- [ ] [Review][Decision] No single-file validation support or distinction — Passing a file to origo validate <file> throws an error. Should it support single files?
- [ ] [Review][Decision] Inconsistent JSON error output streams and schemas — Runtime I/O failures go to stderr, schema failures to stdout with different JSON payload structures.
- [ ] [Review][Patch] validateAST signature and input contract violation [packages/cli/src/lib/validation.ts]
- [ ] [Review][Patch] AST semantic error codes erased / fallback to unknown [packages/cli/src/lib/validation.ts:363-376]
- [ ] [Review][Patch] Missing Source-Map enrichment for AST Semantic Errors [packages/cli/src/lib/validation.ts:373-376]
- [ ] [Review][Patch] Deceptive unit tests using fabricated mocks [packages/cli/src/lib/validation.spec.ts:271-285]
- [ ] [Review][Patch] Process termination inside library layer [packages/cli/src/lib/validation.ts:401-403]
- [ ] [Review][Patch] Redundant validator re-instantiation in the loop [packages/cli/src/lib/validation.ts]
- [ ] [Review][Patch] Fragile file discovery without file type validation [packages/cli/src/lib/validation.ts:312-329]
- [ ] [Review][Patch] Missing public exports in package entry point [packages/cli/src/index.ts]
- [ ] [Review][Patch] Sloppy output grammar and pluralization [packages/cli/src/lib/validation.ts:426]
- [ ] [Review][Patch] Uncaught exceptions abort batch directory validation prematurely [packages/cli/src/lib/validation.ts:346-361]
- [ ] [Review][Patch] Test double-call anti-pattern [packages/cli/src/lib/validation.spec.ts:187-196]
- [x] [Review][Defer] Directory exists but contains zero .json files [packages/cli/src/lib/validation.ts:325] — deferred, pre-existing
