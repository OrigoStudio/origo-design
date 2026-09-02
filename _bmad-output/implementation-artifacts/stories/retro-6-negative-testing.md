---
baseline_commit: bbe5fdc3ee0361153eac61ff7d7cc65e176af8b7
---
# Story: Negative Testing & Mock Cleanup (retro-6-negative-testing)

Status: done

## Story

As a CLI Library Maintainer,
I want to update `@origo/cli` unit tests to explicitly test negative scenarios (malformed inputs, path traversals, unsupported schemas, invalid file types) and harden mocks against false positives,
So that the test suite honestly validates the library's defensive behaviour without false-positive passes or silent error swallowing.

## Acceptance Criteria

1. **Given** calls to `validateDirectory` with path-traversal strings (`../../../etc/passwd`, `../../sensitive`, absolute `/etc/passwd`, Windows `C:\\Windows\\System32`)
   **When** the traversal guard runs before any filesystem access
   **Then** the function throws a `CliError` with code `ERR_PATH_TRAVERSAL` **and** `fs.promises.stat` is **never called** — verified via `expect(statSpy).not.toHaveBeenCalled()` in every traversal test

2. **Given** a call to `validateDirectory` with an empty string (`''`) or whitespace-only string (`'   '`)
   **When** the empty-guard runs before any filesystem access
   **Then** the function throws `CliError` with code `ERR_INVALID_DIRECTORY` **and** `fs.promises.stat` is **never called** — verified via `expect(statSpy).not.toHaveBeenCalled()`

3. **Given** a schema JSON file containing an unsupported or missing `$schema` field (missing `$schema`, `$schema: null`, `$schema: ""`, or an unrecognized URL like `"https://example.com/other.schema.json"`)
   **When** `validateDirectory` reads and processes the file
   **Then** the result includes an error entry with code `UNSUPPORTED_SCHEMA`, `isValid: false`, and overall status `error` — NOT a silent pass
   *(Note: Malformed JSON syntax or non-string `$schema` primitives produce `ERR_JSON_PARSE` per production code catch logic)*

4. **Given** `validateDirectory` receives a single-file path pointing to a non-`.json` extension (e.g. `./schemas/single.txt`, `./schemas/notes.json.bak`)
   **When** the file-type guard fires
   **Then** the function throws `CliError` with structured code `ERR_INVALID_FILE_TYPE` — verified using `.rejects.toMatchObject({ code: 'ERR_INVALID_FILE_TYPE' })`

5. **Given** the `@origo/core` mock in `validation.spec.ts`
   **When** any test configures validation failure (e.g. `validateDomain` or `validateEntity` returning `false`)
   **Then** the mock automatically returns a non-null error array (e.g. `[{ code: 'SCHEMA_ERROR', message: 'Schema validation failed' }]`), preventing deceptive passes where the code silently skips errors because `errors` was `null`

6. **Given** schema files targeting `entity.schema.json`
   **When** `validateDirectory` runs against them
   **Then** the `entity.schema.json` branch in `validation.ts` is exercised for both valid entities (`validateEntity` returns `true`) and invalid entities (`validateEntity` returns `false` with errors reported)

7. **Given** calls to `scaffoldProject` with invalid project names (traversals `../evil-project`, `./nested/name`, `name/../escape`, Windows backslash `nested\\name`, empty `''`, whitespace `'   '`, illegal characters `evil*project`)
   **When** the guard runs
   **Then** a `CliError` with code `ERR_INVALID_PROJECT_NAME` is thrown **and** no filesystem mutations occur — verified via `expect(mkdirSpy).not.toHaveBeenCalled()`, `expect(writeFileSpy).not.toHaveBeenCalled()`, and `expect(accessSpy).not.toHaveBeenCalled()`

8. **Given** calls to `generateEntity` with invalid names (traversals `../User`, `sub/User`, Windows backslash `..\\User`, `sub\\User`, empty `''`, whitespace `'   '`)
   **When** the guard runs
   **Then** a `CliError` with code `ERR_INVALID_NAME` is thrown **and** no filesystem mutations occur — verified via `expect(writeFileSpy).not.toHaveBeenCalled()` and `expect(mkdirSpy).not.toHaveBeenCalled()`

9. **Given** all updated test files
   **When** the test and lint suites run (`npx nx test cli --coverage` and `npx nx lint cli`)
   **Then** all tests pass (0 failures), ESLint reports 0 errors, branch coverage for `validation.ts` and `scaffolding.ts` is ≥ 85%, and overall branch coverage for `packages/cli/src/lib/` is ≥ 75%

## Developer Context

### Background

The `retro-6-security-remediation` story (PR #43, merged) established real path-traversal guards and removed `process.exit()` from the library layer. The guards **work correctly in production** — the negative scenarios are handled. What is missing is honest, comprehensive test coverage of those guards.

The current spec files have three specific categories of quality defects:

**1. Deceptive Mocks**: In `validation.spec.ts`, the `@origo/core` mock initializes `errors: null` globally. If a test forgets to explicitly mock `errors`, `validation.ts` evaluates `if (validator.errors)` to `false`, leaving `schemaErrorsList` empty and allowing a failing validation to silently report 0 errors. The mock must be hardened so that validation returning `false` automatically supplies a non-empty error list.

**2. Incomplete Guard & Mutation Assertions**: 
- In `validation.spec.ts`, the existing traversal tests (L39–53, L68–78) already assert `statSpy.not.toHaveBeenCalled()`, but the empty directory test (L62) does not spy on `stat`, and whitespace-only directory input is completely untested.
- The single-file non-JSON test at L124 only asserts `.rejects.toThrow(CliError)` without asserting the code `ERR_INVALID_FILE_TYPE`.
- In `scaffolding.spec.ts` (L52) and `generator.spec.ts` (L92–98), guard tests assert that errors are thrown but never assert that `fs.mkdir`, `fs.writeFile`, or `fs.access` were not called.
- In `generator.spec.ts`, empty and traversal tests only check `.rejects.toThrow(CliError)` without verifying the structured error code `ERR_INVALID_NAME`.

**3. Untested Production Branches**:
- `validation.ts` lines 135–138 (`entity.schema.json` branch calling `validator.validateEntity`) have zero unit tests.
- `validation.ts` lines 138–143 (`UNSUPPORTED_SCHEMA` branch) have zero unit tests.

### Current Test State Audit

**`packages/cli/src/lib/validation.spec.ts`** (260 lines):
- L39–53: `rejects ../../../etc/passwd` and `rejects relative path escaping cwd` — both already assert `expect(statSpy).not.toHaveBeenCalled()`.
- L62–66: `rejects an empty directory string with ERR_INVALID_DIRECTORY` — currently lacks `statSpy` assertion. Whitespace-only string `'   '` is missing.
- L68–78: `rejects an absolute path that escapes cwd` — already asserts `expect(statSpy).not.toHaveBeenCalled()`.
- L81–100: Uses legacy `try/catch` blocks to inspect `code` instead of idiomatic `expect(...).rejects.toMatchObject({ code: '...' })`.
- L124–133: `throws CliError if single file is not .json` — already exists, but only asserts `rejects.toThrow(CliError)`. Needs `.toMatchObject({ code: 'ERR_INVALID_FILE_TYPE' })`.
- `UNSUPPORTED_SCHEMA` suite is absent.
- `entity.schema.json` validation tests are absent.
- `@origo/core` mock default `errors: null` is deceptive.

**`packages/cli/src/lib/scaffolding.spec.ts`** (82 lines):
- L52–57: `should reject path traversal in project name` — asserts `ERR_INVALID_PROJECT_NAME`, but lacks `mkdirSpy`, `writeFileSpy`, and `accessSpy` non-call assertions.
- Empty string `''`, whitespace `'   '`, nested paths `foo/bar`, and illegal characters `bad*name` are not tested.

**`packages/cli/src/lib/generator.spec.ts`** (154 lines):
- L92–94: `should fail on empty name` — only checks `.rejects.toThrow(CliError)`. Needs code assertion and mutation assertions.
- L96–98: `should fail on path traversal in name` — only checks `.rejects.toThrow(CliError)`. Needs code assertion, mutation assertions, and Windows backslash traversal test (`..\\User`).

### Files to Modify (UPDATES ONLY — no new files)

| File | Changes |
|---|---|
| [`packages/cli/src/lib/validation.spec.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/cli/src/lib/validation.spec.ts) | Harden `@origo/core` mock; add `statSpy` to empty/whitespace tests; add `UNSUPPORTED_SCHEMA` tests; add `entity.schema.json` tests; harden L124 `.txt` test; modernize `try/catch` blocks |
| [`packages/cli/src/lib/scaffolding.spec.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/cli/src/lib/scaffolding.spec.ts) | Add no-mutation assertions (`mkdirSpy`, `writeFileSpy`, `accessSpy`); add boundary name tests (empty, whitespace, nested, illegal chars) |
| [`packages/cli/src/lib/generator.spec.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/cli/src/lib/generator.spec.ts) | Add no-mutation assertions (`writeFileSpy`, `mkdirSpy`); assert `ERR_INVALID_NAME` code; add Windows backslash traversal tests |

> ⚠️ **DO NOT touch** `validation.ts`, `scaffolding.ts`, or `generator.ts` — the production code is correct. This story is test-layer only.

### Current Production Guard Contracts (Preserve Exactly)

From [`validation.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/cli/src/lib/validation.ts):
- **Empty guard** (L14–19): `if (!directory || directory.trim() === '')` → `ERR_INVALID_DIRECTORY` (fires before stat)
- **Traversal guard** (L20–29): `path.resolve` + `path.relative` check for `..` prefix or isAbsolute → `ERR_PATH_TRAVERSAL` (fires before stat)
- **Non-JSON single file** (L39–44): `!files[0].endsWith('.json')` → `ERR_INVALID_FILE_TYPE`
- **Schema dispatch** (L128–143):
  - `domain.schema.json` → calls `validator.validateDomain(rawContent)`
  - `entity.schema.json` → calls `validator.validateEntity(rawContent)`
  - fallback → pushes `UNSUPPORTED_SCHEMA` error with message `Schema type is unsupported or missing $schema. Cannot validate: ${schemaType}`

From [`scaffolding.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/cli/src/lib/scaffolding.ts):
- **Invalid name guard** (L16–26): `!projectName || path.basename(projectName) !== projectName || !/^[a-zA-Z0-9_.-]+$/.test(projectName)` → `ERR_INVALID_PROJECT_NAME` (fires before `fs.access`)

From [`generator.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/cli/src/lib/generator.ts):
- **Empty guard** (L20–22): `!name || !name.trim()` → `ERR_INVALID_NAME` (fires before `fs.access`)
- **Path separator guard** (L23–28): `/[/\\]/.test(name)` → `ERR_INVALID_NAME` (fires before `fs.access`)

## Dev Agent Guardrails

### Technical Requirements

- **Test framework**: Jest (configured via `packages/cli/jest.config.cts`). Run with `npx nx test cli`.
- **Lint tool**: ESLint v9 Flat Config. Run with `npx nx lint cli`.
- **Mock idiom**: Use existing module mocks and `jest.spyOn` per-test overrides. Do not introduce new third-party libraries or mock packages.
- **Assertion style**: Always assert structured error codes using `.toMatchObject({ code: '...' })` rather than inspecting raw error messages or strings.
- **No production code changes**: All changes must be contained within `*.spec.ts` files.

### Architecture Compliance

- The architecture spine mandates that the library layer (`packages/cli/src/lib/`) throws `CliError` structured exceptions and never terminates the process. Tests must assert that structured `CliError` instances are thrown with the expected `code` property.
- Mock contracts must remain honest: negative scenarios must produce real error objects in validator results to guarantee that reporting logic is exercised.

### Anti-Patterns — DO NOT DO

- ❌ Do NOT modify any `.ts` production source file.
- ❌ Do NOT add duplicate `it('throws CliError if single file is not .json')` blocks — update the existing one at L124.
- ❌ Do NOT add duplicate `statSpy` declarations to tests that already have them.
- ❌ Do NOT use manual `try/catch` in tests when `await expect(...).rejects.toMatchObject(...)` is available.
- ❌ Do NOT pass non-string values (numbers/booleans) to `$schema` expecting `UNSUPPORTED_SCHEMA` — production code throws `ERR_JSON_PARSE` on non-strings.

### Hardened Mock Pattern for `validation.spec.ts`

Replace the static `{ errors: null }` mock in `validation.spec.ts` (L14–23) with dynamic validation error handling:

```typescript
jest.mock('@origo/core', () => {
  return {
    BADLValidator: jest.fn().mockImplementation(() => {
      let domainErrors: Array<{ code: string; message: string }> | null = null;
      let entityErrors: Array<{ code: string; message: string }> | null = null;
      return {
        validateDomain: jest.fn().mockImplementation(() => {
          return domainErrors === null;
        }),
        validateEntity: jest.fn().mockImplementation(() => {
          return entityErrors === null;
        }),
        get errors() {
          return domainErrors || entityErrors;
        },
        setErrors(errs: Array<{ code: string; message: string }> | null) {
          domainErrors = errs;
          entityErrors = errs;
        },
      };
    }),
    validateAST: jest.fn().mockReturnValue([]),
  };
});
```

*(Note: Per-test overrides can continue using `(BADLValidator as jest.Mock).mockImplementation(...)` when specific custom mock behaviors are required, but ensure any negative override sets `errors` to a non-empty array).*

### Concrete Test Patterns

#### 1. Empty & Whitespace Guard in `validation.spec.ts`

```typescript
it('rejects an empty directory string with ERR_INVALID_DIRECTORY', async () => {
  const statSpy = jest.spyOn(fs.promises, 'stat');
  await expect(validateDirectory('')).rejects.toMatchObject({
    code: 'ERR_INVALID_DIRECTORY',
  });
  expect(statSpy).not.toHaveBeenCalled();
});

it('rejects whitespace-only directory string with ERR_INVALID_DIRECTORY', async () => {
  const statSpy = jest.spyOn(fs.promises, 'stat');
  await expect(validateDirectory('   ')).rejects.toMatchObject({
    code: 'ERR_INVALID_DIRECTORY',
  });
  expect(statSpy).not.toHaveBeenCalled();
});
```

#### 2. Non-JSON Single File Hardening (Update L124)

```typescript
it('throws CliError if single file is not .json', async () => {
  (fs.promises.stat as jest.Mock).mockResolvedValue({
    isFile: () => true,
    isDirectory: () => false,
  });

  await expect(validateDirectory('./schemas/single.txt', { json: false })).rejects.toMatchObject({
    code: 'ERR_INVALID_FILE_TYPE',
  });

  await expect(validateDirectory('./schemas/notes.json.bak', { json: false })).rejects.toMatchObject({
    code: 'ERR_INVALID_FILE_TYPE',
  });
});
```

#### 3. Unsupported Schema Tests in `validation.spec.ts`

```typescript
describe('unsupported schema handling', () => {
  beforeEach(() => {
    (fs.promises.stat as jest.Mock).mockResolvedValue({
      isFile: () => false,
      isDirectory: () => true,
    });
    (BADLValidator as jest.Mock).mockImplementation(() => ({
      validateDomain: jest.fn(),
      validateEntity: jest.fn(),
      errors: null,
    }));
  });

  it('reports UNSUPPORTED_SCHEMA when $schema field is missing', async () => {
    (fs.promises.readdir as jest.Mock).mockResolvedValue([
      { isFile: () => true, name: 'no-schema.json', parentPath: '/schemas', path: '/schemas' },
    ]);
    (fs.promises.readFile as jest.Mock).mockResolvedValue('{"id": "test"}');

    const totalErrors = await validateDirectory('./schemas', { json: true });
    expect(totalErrors).toBe(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('UNSUPPORTED_SCHEMA'));
  });

  it('reports UNSUPPORTED_SCHEMA when $schema is empty or unrecognized URI', async () => {
    (fs.promises.readdir as jest.Mock).mockResolvedValue([
      { isFile: () => true, name: 'other.json', parentPath: '/schemas', path: '/schemas' },
    ]);
    (fs.promises.readFile as jest.Mock).mockResolvedValue(
      '{"$schema": "https://example.com/unsupported.schema.json"}'
    );

    const totalErrors = await validateDirectory('./schemas', { json: true });
    expect(totalErrors).toBe(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('UNSUPPORTED_SCHEMA'));
  });
});
```

#### 4. `entity.schema.json` Validation Tests in `validation.spec.ts`

```typescript
describe('entity schema validation', () => {
  it('validates entity schema successfully', async () => {
    (fs.promises.stat as jest.Mock).mockResolvedValue({ isFile: () => false, isDirectory: () => true });
    (fs.promises.readdir as jest.Mock).mockResolvedValue([
      { isFile: () => true, name: 'user.entity.json', parentPath: '/schemas', path: '/schemas' },
    ]);
    (fs.promises.readFile as jest.Mock).mockResolvedValue(
      '{"$schema": "https://origo.design/schemas/v1/entity.schema.json"}'
    );

    const mockValidateEntity = jest.fn().mockReturnValue(true);
    (BADLValidator as jest.Mock).mockImplementation(() => ({
      validateDomain: jest.fn(),
      validateEntity: mockValidateEntity,
      errors: null,
    }));

    const totalErrors = await validateDirectory('./schemas', { json: true });
    expect(totalErrors).toBe(0);
    expect(mockValidateEntity).toHaveBeenCalled();
  });

  it('reports errors when entity validation fails', async () => {
    (fs.promises.stat as jest.Mock).mockResolvedValue({ isFile: () => false, isDirectory: () => true });
    (fs.promises.readdir as jest.Mock).mockResolvedValue([
      { isFile: () => true, name: 'user.entity.json', parentPath: '/schemas', path: '/schemas' },
    ]);
    (fs.promises.readFile as jest.Mock).mockResolvedValue(
      '{"$schema": "https://origo.design/schemas/v1/entity.schema.json"}'
    );

    const mockValidateEntity = jest.fn().mockReturnValue(false);
    (BADLValidator as jest.Mock).mockImplementation(() => ({
      validateDomain: jest.fn(),
      validateEntity: mockValidateEntity,
      errors: [{ code: 'ENTITY_SCHEMA_ERROR', message: 'invalid entity' }],
    }));

    const totalErrors = await validateDirectory('./schemas', { json: true });
    expect(totalErrors).toBe(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('ENTITY_SCHEMA_ERROR'));
  });
});
```

#### 5. No-Mutation & Boundary Assertions in `scaffolding.spec.ts`

```typescript
it('should reject invalid project names without filesystem mutations', async () => {
  const invalidNames = [
    '../evil-project',
    './nested/name',
    'nested/project',
    'nested\\project',
    'bad*name',
    'bad?name',
    '',
    '   ',
  ];

  for (const name of invalidNames) {
    jest.clearAllMocks();
    await expect(scaffoldProject(name)).rejects.toMatchObject({
      code: 'ERR_INVALID_PROJECT_NAME',
    });
    expect(mkdirSpy).not.toHaveBeenCalled();
    expect(writeFileSpy).not.toHaveBeenCalled();
    expect(accessSpy).not.toHaveBeenCalled();
  }
});
```

#### 6. No-Mutation & Code Assertions in `generator.spec.ts`

```typescript
it('should fail on empty or whitespace name without filesystem mutations', async () => {
  for (const name of ['', '   ']) {
    jest.clearAllMocks();
    await expect(generateEntity(name, {})).rejects.toMatchObject({
      code: 'ERR_INVALID_NAME',
    });
    expect(writeFileSpy).not.toHaveBeenCalled();
    expect(mkdirSpy).not.toHaveBeenCalled();
    expect(accessSpy).not.toHaveBeenCalled();
  }
});

it('should fail on path traversal in name without filesystem mutations', async () => {
  const traversalNames = ['../User', 'sub/User', '..\\User', 'sub\\User'];
  for (const name of traversalNames) {
    jest.clearAllMocks();
    await expect(generateEntity(name, {})).rejects.toMatchObject({
      code: 'ERR_INVALID_NAME',
    });
    expect(writeFileSpy).not.toHaveBeenCalled();
    expect(mkdirSpy).not.toHaveBeenCalled();
    expect(accessSpy).not.toHaveBeenCalled();
  }
});
```

## Tasks / Subtasks

- [x] **Task 1: Harden Empty/Whitespace & Traversal Assertions in `validation.spec.ts`** (AC: #1, #2)
  - [x] Add `const statSpy = jest.spyOn(fs.promises, 'stat')` and `expect(statSpy).not.toHaveBeenCalled()` to the empty string test (L62)
  - [x] Add a new test for whitespace-only directory string (`'   '`) and assert `statSpy` not called
  - [x] Verify existing traversal tests (L39, L47, L68) continue asserting `statSpy.not.toHaveBeenCalled()`

- [x] **Task 2: Harden Non-JSON Single File Type Test in `validation.spec.ts`** (AC: #4)
  - [x] In the existing test at L124, update `rejects.toThrow(CliError)` to `rejects.toMatchObject({ code: 'ERR_INVALID_FILE_TYPE' })`
  - [x] Add a case for multi-dot non-json file (e.g. `./schemas/notes.json.bak`) and assert `ERR_INVALID_FILE_TYPE`

- [x] **Task 3: Add `UNSUPPORTED_SCHEMA` Tests in `validation.spec.ts`** (AC: #3)
  - [x] Add describe block for unsupported schema handling
  - [x] Add test for file with no `$schema` field → produces `UNSUPPORTED_SCHEMA`
  - [x] Add test for file with unrecognized `$schema` URI string → produces `UNSUPPORTED_SCHEMA`
  - [x] Add test for `$schema: ""` or `$schema: null` → produces `UNSUPPORTED_SCHEMA`

- [x] **Task 4: Add `entity.schema.json` Tests & Harden Mock in `validation.spec.ts`** (AC: #5, #6)
  - [x] Update top-level `@origo/core` mock so failing validations automatically return non-null errors
  - [x] Add test for valid entity schema exercising `validator.validateEntity`
  - [x] Add test for invalid entity schema reporting `ENTITY_SCHEMA_ERROR`

- [x] **Task 5: Modernize Legacy `try/catch` Assertions in `validation.spec.ts`**
  - [x] Refactor L81–90 (ENOENT test) to use `await expect(...).rejects.toMatchObject({ code: 'ERR_DIRECTORY_NOT_FOUND' })`
  - [x] Refactor L92–100 (other stat error test) to use `await expect(...).rejects.toMatchObject({ code: 'ERR_DIRECTORY_READ' })`

- [x] **Task 6: Add Boundary & Mutation Assertions to `scaffolding.spec.ts`** (AC: #7)
  - [x] In `should reject path traversal in project name`, add assertions that `mkdirSpy`, `writeFileSpy`, and `accessSpy` were not called
  - [x] Add parameterized tests for empty string, whitespace string, forward/backward slashes, and illegal characters (`bad*name`) verifying `ERR_INVALID_PROJECT_NAME` and zero mutations

- [x] **Task 7: Add Boundary, Error Code & Mutation Assertions to `generator.spec.ts`** (AC: #8)
  - [x] Update empty name tests to assert `.toMatchObject({ code: 'ERR_INVALID_NAME' })` and zero mutations (`writeFileSpy`, `mkdirSpy`, `accessSpy`)
  - [x] Update traversal tests to assert `.toMatchObject({ code: 'ERR_INVALID_NAME' })`, include Windows backslash traversal (`..\\User`), and assert zero mutations

- [x] **Task 8: Verification, Coverage & Linting** (AC: #9)
  - [x] Run `npx nx test cli --coverage` and verify 0 failures
  - [x] Verify branch coverage for `validation.ts` and `scaffolding.ts` is ≥ 85%, and `lib/` overall is ≥ 75%
  - [x] Run `npx nx lint cli` and verify 0 lint errors

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (Thinking)

### Debug Log References

- Task validation run: `56beac32-bf64-421e-9f8a-6d1f67561547/task-47` (exit code 0)
- Baseline coverage snapshot: `coverage/packages/cli/lib/index.html` (Overall branches: 67.16%, validation.ts: 68.18%, scaffolding.ts: 79.16%, generator.ts: 59.09%)

### Completion Notes List

- ✅ Resolved all negative test coverage for CLI by asserting no-mutation boundaries in validation, generator and scaffolding specs.
- ✅ Validated that missing/invalid `$schema` fails appropriately.
- ✅ Replaced all static mock initializations that caused false test passes.
- ✅ Tested boundary project generation names with `mkdirSpy.not.toHaveBeenCalled()`.

### File List

- `packages/cli/src/lib/validation.spec.ts`
- `packages/cli/src/lib/scaffolding.spec.ts`
- `packages/cli/src/lib/generator.spec.ts`
