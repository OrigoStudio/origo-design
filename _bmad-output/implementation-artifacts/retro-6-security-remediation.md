---
baseline_commit: 0854f78c2ecbbfc48bc83bbea3d49e7f72b01ce2
---

# Story retro-6: Security & Path Traversal Remediation

Status: review

## Story

As a Platform Engineer,
I want to fix path traversal vulnerabilities, remove `process.exit()` from library layers, and stop error swallowing in the `@origo/cli` library,
so that the CLI is secure, can be safely consumed programmatically, and provides transparent error reporting.

## Acceptance Criteria

1. [AC-1] **Path Traversal Guard**: `validateDirectory` in `lib/validation.ts` MUST reject any resolved `targetDir` path that escapes the process working directory — i.e. if `path.resolve(process.cwd(), directory)` produces a path NOT prefixed by `process.cwd()`, throw `CliError({ code: 'ERR_PATH_TRAVERSAL' })`.
2. [AC-2] **Remove `process.exit()` from library/command layer**: All 4 `process.exit(1)` calls in `utils/errors.ts` and both calls in `commands/validate.ts` MUST be removed. The library layer MUST only print and return (or throw). Only `main()` in `main.ts` calls `process.exit(1)`.
3. [AC-3] **Error cause preservation**: `CliError` constructor MUST pass the original error as the native `cause` option: `super(error.message, { cause: error.originalCause })`. All catch blocks in `lib/validation.ts` and `lib/scaffolding.ts` that construct a new `CliError` from a caught error MUST pass the original as `cause`.
4. [AC-4] **Deceptive `process.exit` spy removal**: Remove `jest.spyOn(process, 'exit')` from `validate.spec.ts` and `validation.spec.ts`. Tests MUST assert thrown errors/promise rejections instead of intercepting `process.exit`.
5. [AC-5] **Negative path traversal tests**: Add tests in `validation.spec.ts` that pass `'../../../etc/passwd'` and `'../../sensitive'` as the `directory` argument and verify a `CliError` with code `ERR_PATH_TRAVERSAL` is thrown.
6. [AC-6] **No process termination during unit tests**: All tests in `validate.spec.ts`, `validation.spec.ts`, and `new.spec.ts` MUST complete without triggering `process.exit()`. A spy on `process.exit` that fires = test failure (i.e., do not mock it away — detect it as a test failure).

## Tasks / Subtasks

- [x] Task 1: Add Path Traversal Guard to `validation.ts` (AC: 1, 5)
  - [x] After `const targetDir = path.resolve(process.cwd(), directory)`, add:
    ```ts
    const cwd = process.cwd();
    if (!targetDir.startsWith(cwd + path.sep) && targetDir !== cwd) {
      throw new CliError({
        code: 'ERR_PATH_TRAVERSAL',
        message: `Access denied: path "${directory}" resolves outside the working directory.`,
        context: { directory, resolvedPath: targetDir, cwd },
      });
    }
    ```
  - [x] This guard MUST run BEFORE the `fs.promises.stat()` call — never touch the filesystem on a traversal attempt

- [x] Task 2: Add `cause` to `CliError` constructor (AC: 3)
  - [x] In `utils/errors.ts`, update `CliError`:
    ```ts
    constructor(error: OrigoCliError & { cause?: unknown } = {}) {
      super(error.message, { cause: error.cause });
      ...
    }
    ```
  - [x] In `lib/validation.ts` catch blocks (lines ~53–56): pass `cause: error` when wrapping fs errors in `CliError`
  - [x] In `lib/scaffolding.ts` catch blocks (lines ~96–100): pass `cause: error` when wrapping scaffold errors in `CliError`

- [x] Task 3: Refactor `handleError` — remove all `process.exit()` calls (AC: 2)
  - [x] In `utils/errors.ts`: remove all 4 `process.exit(1)` calls. `handleError` MUST only print and return `void`.
  - [x] Update `main.ts` → `program.parseAsync(process.argv).catch(err => { handleError(err); process.exit(1); })` so only the top-level entry point exits
  - [x] `handleError` signature stays the same: `(error: unknown, options?: ErrorOptions): void` — no return type change needed

- [x] Task 4: Refactor `validate.ts` command action — remove `process.exit()` calls (AC: 2)
  - [x] **Line 15–16 (success path):** Replace `process.exit(1)` with `process.exitCode = 1`. Commander will exit naturally after the action resolves. This is the safest approach for programmatic consumption — the caller gets a chance to clean up.
  - [x] **Line 37–38 (JSON error path in catch):** Replace `process.exit(1)` with `process.exitCode = 1` (same approach)
  - [x] Do NOT throw from the command action catch block — Commander already wraps unhandled promise rejections. Setting `process.exitCode` is the correct library-layer pattern.

- [x] Task 5: Update `validate.spec.ts` — replace `process.exit` spy with error-driven assertions (AC: 4, 6)
  - [x] Remove `processExitSpy` declaration, `jest.spyOn(process, 'exit').mockImplementation(...)`, and `afterEach` restore
  - [x] Rename test at line 54: `'sets process.exitCode to 1 if validateDirectory returns > 0'`
    - Assert: `await program.parseAsync(...)` resolves without rejection AND `process.exitCode === 1`
    - Reset `process.exitCode` in `beforeEach`: `process.exitCode = 0`
  - [x] Rename test at line 62: `'sets process.exitCode to 1 and prints unified JSON if validateDirectory throws with --json'`
    - Same pattern: assert `process.exitCode === 1` after `parseAsync`

- [x] Task 6: Update `validation.spec.ts` — remove spy, add traversal tests (AC: 4, 5, 6)
  - [x] Remove `processExitSpy` setup (lines 27–34) and `afterEach` restore — `validation.ts` never called `process.exit()`; the spy was dead code
  - [x] Add new `describe` block: `'path traversal guard'`:
    - Test 1: `'rejects ../../../etc/passwd with ERR_PATH_TRAVERSAL'` — mock `fs.promises.stat` to NOT be called (assert it was never called after the guard fires)
    - Test 2: `'rejects relative path escaping cwd with ERR_PATH_TRAVERSAL'` — e.g., `'../../sensitive'`
    - Test 3: `'accepts a path within cwd'` — e.g., `'./schemas'` resolves within `process.cwd()` → guard passes, `stat` is called

- [x] Task 7: Verify `new.spec.ts` compliance (AC: 6)
  - [x] `new.spec.ts` line 24: Remove `exitSpy = jest.spyOn(process, 'exit').mockImplementation(...)` and the `afterEach` restore
  - [x] Since `newCommand` calls `handleError` in the catch block, and `handleError` no longer exits, verify the existing test at line 49–55 (`'should invoke handleError when scaffoldProject throws'`) still passes — it should, since `handleError` is still mocked

## Dev Notes

### CRITICAL: Exact Vulnerability in `validation.ts`

Reading the **actual current code** (`line 14`):
```ts
const targetDir = path.resolve(process.cwd(), directory);
```
`path.resolve('/app', '../../../etc/passwd')` → `/etc/passwd` — this is a valid resolved path that escapes the CWD. The fix (Task 1) MUST check `targetDir.startsWith(cwd + path.sep)` — the `+ path.sep` prevents a false negative where `cwd = '/app'` and `targetDir = '/app-other'` would incorrectly pass a `startsWith('/app')` check.

### CRITICAL: `scaffolding.ts` Already Has a Valid Guard

Inspection of the actual code shows `scaffolding.ts` **already has a `projectName` regex guard** (`/^[a-zA-Z0-9_.-]+$/` + `path.basename` check) at lines 16–26. Do NOT add a second traversal guard to `scaffolding.ts` — the existing guard already prevents traversal via `projectName`. The only change needed there is adding `cause:` to the `CliError` constructors in the `catch` blocks (Task 2).

### CRITICAL: `main.ts` Refactor Pattern

Current `main.ts` line 25:
```ts
program.parseAsync(process.argv).catch(handleError);
```
After refactoring `handleError` to not exit, this becomes a silent no-op on error. The correct fix:
```ts
program.parseAsync(process.argv).catch(err => {
  handleError(err);
  process.exit(1);
});
```
This is the ONLY place in the entire CLI where `process.exit()` is permitted (per AC-2).

### CRITICAL: `validate.ts` — Use `process.exitCode`, Not `throw`

Do NOT throw from the `.action(...)` callback when `totalErrors > 0`. Commander 12.x wraps unhandled action rejections and calls its own error handler, which may log an additional "error" line. The correct pattern is `process.exitCode = 1` — the process exits with code 1 naturally after the event loop drains, without terminating synchronously.

### CRITICAL: Test Framework is Jest (NOT Vitest)

All `.spec.ts` files in `packages/cli/src/` use **Jest** (`jest.mock`, `jest.fn()`, `jest.spyOn`). Do NOT use Vitest APIs (`vi.mock`, `vi.fn()`). The CLI package is configured with Jest (check `packages/cli/jest.config.ts` or root `jest.config.ts`).

### Files Being Modified — Current State Summary

| File | Current Problem | Required Fix |
|---|---|---|
| `lib/validation.ts:14` | No CWD boundary check after `path.resolve` | Add traversal guard before `fs.promises.stat` |
| `lib/validation.ts:53–56` | `CliError` wraps fs error without `cause` | Pass `cause: error` to `CliError` constructor |
| `lib/scaffolding.ts:96–100` | `CliError` wraps error without `cause` | Pass `cause: error` to `CliError` constructor |
| `utils/errors.ts:66,75,78,81` | 4× `process.exit(1)` calls | Remove all; print-only |
| `utils/errors.ts:11–16` | `CliError` ignores `cause` | Add `{ cause }` to `super()` |
| `commands/validate.ts:16,38` | 2× `process.exit(1)` | Replace with `process.exitCode = 1` |
| `main.ts:25` | `catch(handleError)` won't exit anymore | Wrap: `catch(err => { handleError(err); process.exit(1); })` |
| `commands/validate.spec.ts:27–29` | Mocks `process.exit` — masks real bug | Remove spy; assert `process.exitCode` |
| `commands/validate.spec.ts:54,62` | Test title/assertion wrong after refactor | Update assertions |
| `lib/validation.spec.ts:27–34` | Dead `process.exit` spy (never fired) | Remove spy; add traversal tests |
| `commands/new.spec.ts:24` | Live `process.exit` spy | Remove spy |

### `CliError` Type Extension for `cause`

Update `OrigoCliError` interface to optionally accept `cause`:
```ts
export interface OrigoCliError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  cause?: unknown; // add this
}
```
Then in `CliError` constructor:
```ts
constructor(error: OrigoCliError) {
  super(error.message, { cause: error.cause }); // ES2022 cause chaining
  this.name = 'CliError';
  this.code = error.code;
  this.context = error.context;
}
```

### Path Traversal Test Setup

In `validation.spec.ts`, the path traversal tests do **not** need to mock `fs.promises.stat` to throw — the guard fires BEFORE the `stat` call. Use `jest.spyOn(fs.promises, 'stat')` to assert it was **not called**:
```ts
it('rejects ../../../etc/passwd with ERR_PATH_TRAVERSAL', async () => {
  const statSpy = jest.spyOn(fs.promises, 'stat');
  await expect(validateDirectory('../../../etc/passwd')).rejects.toMatchObject({
    code: 'ERR_PATH_TRAVERSAL',
  });
  expect(statSpy).not.toHaveBeenCalled();
});
```

### References

- [Source: packages/cli/src/lib/validation.ts#L14] — Vulnerable `path.resolve` without boundary check
- [Source: packages/cli/src/utils/errors.ts#L66,75,78,81] — All 4 `process.exit` sites
- [Source: packages/cli/src/commands/validate.ts#L16,38] — 2 `process.exit` sites in command
- [Source: packages/cli/src/main.ts#L25] — Top-level catch; needs explicit exit after `handleError`
- [Source: packages/cli/src/lib/scaffolding.ts#L16–26] — Existing projectName guard (do NOT duplicate)
- [Source: _bmad-output/implementation-artifacts/retro-6-e2e-npm-verification.md] — Companion retro story for context
- [Source: _bmad-output/planning-artifacts/epics.md#FR-DX-003] — CLI security requirements
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml] — `retro-6-security-remediation: ready-for-dev`

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (High)

### Debug Log References

### Completion Notes List

- ✅ Added path traversal guard to validation.ts to prevent `../../` directory escapes.
- ✅ Added `cause` property to `CliError` constructor and passed caught errors as `cause` in `validation.ts` and `scaffolding.ts`.
- ✅ Removed all `process.exit(1)` calls from `errors.ts`, changing `handleError` to return cleanly.
- ✅ Removed `process.exit(1)` from `validate.ts` command action, replacing it with `process.exitCode = 1`.
- ✅ Updated `main.ts` top-level error catch to call `process.exit(1)` explicitly.
- ✅ Removed deceptive `process.exit` spies from `validate.spec.ts`, `validation.spec.ts`, and `new.spec.ts`.
- ✅ Added negative path traversal test cases to `validation.spec.ts`.
- ✅ Updated existing unit tests to assert `process.exitCode === 1` instead of `process.exit`.
- ✅ Fixed existing absolute path assertions in `validation.spec.ts` to use relative paths (`./schemas`) so they fall inside `cwd`.
- ✅ All 54 tests pass.

### File List

- packages/cli/src/lib/validation.ts
- packages/cli/src/utils/errors.ts
- packages/cli/src/lib/scaffolding.ts
- packages/cli/src/main.ts
- packages/cli/src/commands/validate.ts
- packages/cli/src/commands/validate.spec.ts
- packages/cli/src/lib/validation.spec.ts
- packages/cli/src/commands/new.spec.ts
