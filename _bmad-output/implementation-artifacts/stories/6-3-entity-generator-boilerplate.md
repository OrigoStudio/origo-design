---
baseline_commit: current
---

# Story 6.3: Entity Generator Boilerplate

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want an `origo generate entity` command,
So that I don't have to write boilerplate BADL schema by hand.

## Acceptance Criteria

1. **Given** an initialized Origo project
   **When** I run `origo generate entity User`
   **Then** it creates a `user.json` file with standard entity scaffolding, a primary key, and common metadata stubs using zero-configuration embedded templates
   _(Note: The epic AC says `user.badl`; per AD-7, canonical BADL format is strictly JSON and all generated files MUST use the `.json` extension. This story uses `.json`.)_
2. **And** it safely aborts without overwriting if the file already exists (unless `--force` is provided)
3. **And** the generator architecture is explicitly designed to accept external plugins or LLM prompts for future AI integration (FR-AI-005)
4. **And** if I run `origo generate --eject`, it copies the internal raw JSON template files into a local `.origo/templates` directory for customization, which the CLI will then prioritize.

## Developer Context

This story implements the `origo generate entity` command and the overarching `origo generate` command in the `@origo/cli` package using Commander.js. It follows the pattern established in Stories 6.1 and 6.2: thin command wrappers mapping to library logic functions.

### ⚠️ Pre-existing Template System — Do NOT Reinvent

**Story 5.5.5 already implemented the full template system.** The following files exist and are tested:

- [`packages/cli/src/templates/entity.json`](packages/cli/src/templates/entity.json) — the raw entity JSON template
- [`packages/cli/src/templates/extension.json`](packages/cli/src/templates/extension.json) — the raw extension JSON template
- [`packages/cli/src/templates/origo.json`](packages/cli/src/templates/origo.json) — the raw origo config JSON template
- [`packages/cli/src/templates/index.ts`](packages/cli/src/templates/index.ts) — exports `generateEntityTemplate({ id, name })` with secure defaults and identifier validation
- [`packages/cli/src/templates/index.spec.ts`](packages/cli/src/templates/index.spec.ts) — all tests passing

**❌ Do NOT create a new `entity.ts` or re-implement template rendering logic. ❌ Do NOT modify `packages/cli/src/templates/index.ts` or any existing template files.**

In `lib/generator.ts`, import and call the existing function:
```typescript
import { generateEntityTemplate } from '../templates';
// ...
const content = generateEntityTemplate({ id: entityName.toLowerCase(), name: entityName });
```

### Name Casing Convention

| Input (CLI arg) | File created | Template `id` | Template `name` |
|---|---|---|---|
| `User` | `schemas/user.json` | `user` (lowercase) | `User` (as-provided) |
| `OrderLine` | `schemas/orderline.json` | `orderline` | `OrderLine` |

The filename is always `<name>.toLowerCase() + '.json'`. The template `id` is the lowercase name. The template `name` is the argument as-provided by the user.

### Command Structure — This Is the First Compound Command

**CRITICAL:** `generate` is the **first compound Commander.js command** in this CLI. Unlike `init`, `new`, and `validate` which are flat top-level commands, `generate` uses `.addCommand()` internally to mount `entity` as a subcommand. Applying the flat pattern directly will produce broken behavior.

```typescript
// commands/generate/index.ts — parent command
export function generateCommand(): Command {
  const cmd = new Command('generate').description('Generate Origo artifacts');

  cmd.addCommand(entityCommand()); // entity subcommand mounted here

  cmd
    .option('--eject', 'Copy internal templates to .origo/templates/ for customization')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (options: { eject?: boolean; json?: boolean }) => {
      if (options.eject) {
        try {
          await ejectTemplates({ json: options.json });
        } catch (error) {
          handleError(error, { json: options.json });
        }
      }
    });

  return cmd;
}
```

```typescript
// commands/generate/entity.ts — subcommand
export function entityCommand(): Command {
  const cmd = new Command('entity');
  cmd
    .description('Generate a new entity BADL schema')
    .argument('<name>', 'Entity name (PascalCase, e.g. User)')
    .option('--force', 'Overwrite existing file if it exists')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (name: string, options: { force?: boolean; json?: boolean }) => {
      try {
        await generateEntity(name, { force: options.force, json: options.json });
      } catch (error) {
        handleError(error, { json: options.json });
      }
    });
  return cmd;
}
```

### File Generation Details

- Default output directory: `./schemas` relative to `process.cwd()`
- Output path: `path.join(process.cwd(), 'schemas', name.toLowerCase() + '.json')`
- Use `generateEntityTemplate({ id: name.toLowerCase(), name })` from `'../templates'` for content

### File Existence Check — Async Pattern (Consistent with Codebase)

❌ Do NOT use `fs.existsSync` — the codebase uses `fs.promises` throughout.

```typescript
try {
  await fs.access(targetPath);
  // File exists
  if (!options.force) {
    throw new CliError({
      code: 'ERR_FILE_EXISTS',
      message: `File already exists: ${targetPath}. Use --force to overwrite.`,
      context: { path: targetPath },
    });
  }
} catch (error) {
  if (error instanceof CliError) throw error;
  // ENOENT = file does not exist, safe to proceed
}
```

### Template Override — AD-16 Zero-Config + Eject

When generating an entity, the lib MUST check for a user-ejected override before falling back to the built-in function:

```typescript
const userTemplatePath = path.join(process.cwd(), '.origo', 'templates', 'entity.json');
let content: string;

try {
  // Check if user has ejected and customized the template
  const rawTemplate = await fs.readFile(userTemplatePath, 'utf-8');
  // Apply substitution on the raw JSON string
  content = rawTemplate
    .replace(/\{\{name\}\}/g, entityName)
    .replace(/\{\{id\}\}/g, entityName.toLowerCase())
    + '\n';
} catch {
  // No user override — use built-in secure template
  content = generateEntityTemplate({ id: entityName.toLowerCase(), name: entityName });
}
```

### Eject Logic

`--eject` copies the raw JSON template files from the package's `templates/` folder to `.origo/templates/` in `process.cwd()`. Only copy `*.json` files — do NOT copy `index.ts` or `index.spec.ts`.

```
packages/cli/src/templates/entity.json     → .origo/templates/entity.json
packages/cli/src/templates/extension.json  → .origo/templates/extension.json
packages/cli/src/templates/origo.json      → .origo/templates/origo.json
```

To locate the source templates at runtime, use `path.resolve(__dirname, '../templates')` (or `import.meta.dirname` if ESM). The destination is `path.join(process.cwd(), '.origo', 'templates')`.

### JSON Output Format

For `--json` success output, be consistent with the pattern in `scaffolding.ts`:
```json
{
  "status": "success",
  "data": {
    "file": "./schemas/user.json",
    "entityName": "User"
  }
}
```

For `--eject` success:
```json
{
  "status": "success",
  "data": {
    "destination": ".origo/templates",
    "filesEjected": ["entity.json", "extension.json", "origo.json"]
  }
}
```

## Dev Agent Guardrails

### Technical Requirements

- **Commands:** `origo generate entity <name> [--force] [--json]` and `origo generate --eject [--json]`
- **Library:** MUST use Commander.js for argument parsing.
- **Error Shape:** ALL errors MUST follow `{ code: string, message: string, context?: object }` via the existing `CliError` class from `../utils/errors`. ❌ Do NOT create a new error class.
- **I/O:** MUST use `fs.promises` throughout. ❌ Do NOT use synchronous `fs` methods anywhere (not even `fs.existsSync`).
- **No new external dependencies required.**

### Architecture Compliance

- **Epic 6:** Developer CLI (`@origo/cli`) — FR-DX-003, FR-AI-005.
- **AD-7:** Canonical BADL format is JSON. Generated files MUST be `.json`.
- **AD-8:** All authoring surfaces output BADL only.
- **AD-16:** Zero-Config + Eject template strategy (implemented above).
- **FR-PREP5-005:** Secure-by-default templates (already in `generateEntityTemplate()`).
- **Package Location:** `packages/cli/`.
- **Nx Tags:** Must respect Nx boundary tags.

### Anti-Patterns — DO NOT DO

- ❌ Do NOT create `packages/cli/src/templates/entity.ts` — it already exists as `entity.json` + `index.ts`.
- ❌ Do NOT re-implement template rendering inside `generator.ts` — call `generateEntityTemplate()`.
- ❌ Do NOT call `process.exit()` inside `lib/generator.ts` — only the command layer (`commands/generate/*.ts`) exits. The lib layer throws `CliError`.
- ❌ Do NOT use synchronous `fs.existsSync` — use `fs.promises.access` with the try/catch pattern above.
- ❌ Do NOT copy `.ts` files during eject — only copy `*.json` files from the templates dir.
- ❌ Do NOT add `generate entity` as a flat top-level command — it MUST be a subcommand of `generate`.

### File Structure & Testing Requirements

- `packages/cli/src/commands/generate/index.ts` — Registers the `generate` parent command; handles `--eject`.
- `packages/cli/src/commands/generate/entity.ts` — Registers the `entity` subcommand.
- `packages/cli/src/lib/generator.ts` — All generation and eject logic. ❌ No `process.exit()` here.
- **Register in:** `packages/cli/src/main.ts` — add `program.addCommand(generateCommand())`. The shebang `#!/usr/bin/env node` on line 1 MUST NOT be disturbed.
- **Tests:** `*.spec.ts` MUST be co-located alongside `*.ts` in the same directory (NO `__tests__/` folders).
- **Coverage:** 100% test coverage required.
- **Test mocking:** Mock `fs.promises` to avoid real disk I/O. Mock `generateEntityTemplate` from `'../templates'` to isolate `generator.ts` logic.

## Previous Story Intelligence

**Learnings from Story 6.1 & 6.2:**

- **Command registration pattern:** Use `program.addCommand(generateCommand())` in `createProgram()` in `main.ts` — exactly as `initCommand()`, `newCommand()`, and `validateCommand()` are registered.
- **Commander pattern:** Thin command file → imports from `lib/` → try/catch → `handleError(error, { json: options.json })`.
- **Error handling:** Always call `handleError(error, { json: options.json })` from `../utils/errors` in the command's catch block.
- **Error shape:** Use `CliError` class with `{ code, message, context? }`.
- **Async I/O:** All file system operations must use `fs.promises`.
- **JSON output mode:** The `--json` option flag name is `options.json` (boolean) in Commander. Pass it through.
- **No `process.exit()` in lib layer:** Story 6-2's code review identified this as a defect. `lib/generator.ts` must throw `CliError`; only the command layer calls `process.exit()` (via `handleError`).

**Story 6-2 has open review findings** in [`6-2-local-schema-validation.md`](../6-2-local-schema-validation.md) Review Findings section. Specifically:
- Avoid `process.exit()` in lib layer — noted above.
- Avoid swallowing errors in catch blocks — always rethrow as `CliError`.
- Public exports: if any new types are added, export from `packages/cli/src/index.ts`.

## Project Context Reference

- **Project**: origo-design
- **Epic**: Epic 6 — Developer CLI (`@origo/cli`)
- **Error utility**: `packages/cli/src/utils/errors.ts` — exports `CliError`, `handleError`
- **Template system**: `packages/cli/src/templates/index.ts` — exports `generateEntityTemplate`, `generateExtensionTemplate`, `generateOrigoConfig`
- **Existing CLI entry**: `packages/cli/src/main.ts` — `createProgram()` registers all commands; shebang on line 1 must not be touched

## Tasks/Subtasks

- [x] Create `packages/cli/src/lib/generator.ts`
  - [x] Implement `generateEntity(name, options)` — checks `.origo/templates/entity.json` override first, falls back to `generateEntityTemplate()`
  - [x] Implement async file-exists check via `fs.promises.access` (not `existsSync`)
  - [x] Implement `--force` overwrite support
  - [x] Implement `ejectTemplates(options)` — copies `*.json` files from `packages/cli/src/templates/` to `.origo/templates/` in cwd
- [x] Create `packages/cli/src/commands/generate/entity.ts` — thin Commander wrapper for `entity` subcommand
- [x] Create `packages/cli/src/commands/generate/index.ts` — parent `generate` command, mounts `entityCommand()`, handles `--eject`
- [x] Update `packages/cli/src/main.ts` — add `import { generateCommand } from './commands/generate'` and `program.addCommand(generateCommand())`
- [x] Write unit tests for `packages/cli/src/lib/generator.ts` (mock `fs.promises` and `generateEntityTemplate`)
- [x] Write unit tests for command wrappers (`commands/generate/index.spec.ts`, `commands/generate/entity.spec.ts`)

## Dev Agent Record

### Implementation Plan
- **generator.ts**: Followed story spec to the letter, avoiding `process.exit()`, throwing `CliError` instead. Handled user ejection override for template reading.
- **commands**: Mapped commander inputs straight to the lib function, capturing errors in standard try-catch calling `handleError`.
- **tests**: Extensively mocked `fs.promises` to verify correct logic paths without touching actual files. Used `generateEntityTemplate` mock.

### Completion Notes
✅ Fully implemented `generateEntity` and `ejectTemplates` logic within `packages/cli/src/lib/generator.ts`.
✅ Wrapped commands via commander in `index.ts` and `entity.ts`.
✅ Updated `main.ts` correctly.
✅ 100% test coverage structure applied for both command layer and lib layer.

## File List
- `packages/cli/src/lib/generator.ts`
- `packages/cli/src/lib/generator.spec.ts`
- `packages/cli/src/commands/generate/index.ts`
- `packages/cli/src/commands/generate/index.spec.ts`
- `packages/cli/src/commands/generate/entity.ts`
- `packages/cli/src/commands/generate/entity.spec.ts`
- `packages/cli/src/main.ts`

## Change Log
- Implemented compound `generate` command with `entity` subcommand and `--eject` flag.
