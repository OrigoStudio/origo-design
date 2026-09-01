---
story_id: retro-6
story_key: retro-6-security-remediation
status: ready-for-dev
---

# Story retro-6: security-remediation

Status: ready-for-dev

## Story

As a Platform Engineer,
I want to fix path traversal vulnerabilities, remove `process.exit()`, and stop error swallowing in the `@origo/cli` library layer,
so that the CLI is secure, can be safely consumed programmatically, and provides transparent error reporting.

## Acceptance Criteria

1. **Path Traversal Remediation**: Fix path traversal vulnerabilities in `packages/cli/src/lib/validation.ts` and `packages/cli/src/lib/scaffolding.ts` to ensure user-provided paths stay within intended boundaries or are safely resolved.
2. **Remove `process.exit()` from Library Layer**: Remove all instances of `process.exit()` from the library and command logic (e.g., `utils/errors.ts`, `commands/validate.ts`). The library functions and command actions must `throw` errors or return failure codes. Only the topmost executable entry point (`main.ts` or similar) should call `process.exit()`.
3. **Stop Error Swallowing**: Ensure `CliError` and other error constructors correctly preserve original stack traces and context. Refactor `lib/validation.ts` and `lib/scaffolding.ts` to stop masking original errors behind generic ones without attaching the original cause.
4. **Negative Testing & Mock Cleanup**: Update CLI unit tests (e.g. `validate.spec.ts`, `new.spec.ts`, `validation.spec.ts`) to explicitly test negative scenarios (malformed inputs, path traversals). Remove deceptive mocks that might hide actual failures.

## Developer Context

### Architecture & Standards Compliance
- **Library vs. Executable Boundary**: Functions exposed in `src/lib/` and `src/commands/` are library code. They MUST NOT call `process.exit()`. If they encounter a fatal state, they should throw a strongly typed error (e.g., `CliError`). 
- **Error Propagation**: Use the `Error.cause` property or `CliError`'s `context` to preserve the original wrapped error. Swallowing an error means catching an error and throwing a new one without passing the original error context along.

### Files Being Modified & Their Current State
- **`packages/cli/src/lib/validation.ts`**: Currently resolves paths using `path.resolve(process.cwd(), directory)` without checking if it escapes the intended directory structure. It also masks errors in the `catch` blocks.
- **`packages/cli/src/utils/errors.ts`**: `handleError` directly calls `process.exit(1)`. This forces the process to terminate, preventing programmatic consumption.
- **`packages/cli/src/commands/validate.ts`**: Calls `process.exit(1)` upon finding validation errors.
- **`packages/cli/src/lib/scaffolding.ts`**: Already has a regex guard for `projectName`, but it uses `path.resolve(options.cwd)`. Ensure error handling is not swallowing the original file system errors.
- **`packages/cli/src/commands/validate.spec.ts` & `new.spec.ts`**: Currently lack negative path traversal tests and might use `process.exit` mocks. You need to update them.

### Expected Implementation Details
1. **Validation Path Guard**: In `validateDirectory`, add a check to ensure the resolved `targetDir` path makes sense. However, since the user can validate *any* directory, consider what the exact vulnerability is. If the issue is that it shouldn't traverse beyond intended workspace roots, implement a secure boundary check.
2. **Error Handling**: 
   - Modify `handleError` in `errors.ts` to NOT exit. It should just format and print the error. Or better, let the top-level `main.ts` call `handleError` and then exit.
   - For `validate.ts`, instead of calling `process.exit(1)`, return a rejected promise or throw an error, so the commander action rejects.
3. **Mocks Cleanup**: Search for `jest.spyOn(process, 'exit')` in the `.spec.ts` files. Remove them. The tests should now expect errors to be thrown, which is the correct pattern.

## Testing Requirements
- **Negative Scenarios**: Add tests that attempt to pass `../../../etc/passwd` to the CLI commands. Verify that the CLI rejects these gracefully.
- **Error Propagation**: Add tests to ensure that file system errors are wrapped but their messages are preserved.
- **No `process.exit`**: Verify that calling the command functions directly does not terminate the test runner.

## Completion Notes
Ultimate context engine analysis completed - comprehensive developer guide created.
