You are an Acceptance Auditor. Review the provided diff against _bmad-output/implementation-artifacts/retro-6-e2e-npm-verification.md and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Diff:
diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index 743c5af..7d57ace 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -53,6 +53,9 @@ jobs:
       - name: Run Nx Build (Affected)
         run: npx nx affected -t build --base=${{ env.NX_BASE }} --head=${{ env.NX_HEAD }}
 
+      - name: Verify CLI npm pack
+        run: bash tools/scripts/verify-npm-pack.sh
+
       - name: Run Performance Benchmark Harness (NFR-PERF-002)
         run: npm run perf:benchmark
 
diff --git a/.github/workflows/release.yml b/.github/workflows/release.yml
index 4385e90..3a41e63 100644
--- a/.github/workflows/release.yml
+++ b/.github/workflows/release.yml
@@ -35,6 +35,9 @@ jobs:
           git config --global user.name "github-actions[bot]"
           git config --global user.email "github-actions[bot]@users.noreply.github.com"
 
+      - name: Verify CLI npm pack
+        run: bash tools/scripts/verify-npm-pack.sh
+
       - name: Run Nx Release
         # nx release will exit 0 if there are no releasable commits
         run: npx nx release --skip-publish
diff --git a/_bmad-output/diff.txt b/_bmad-output/diff.txt
index b0ab03a..e69de29 100644
--- a/_bmad-output/diff.txt
+++ b/_bmad-output/diff.txt
@@ -1,699 +0,0 @@
-diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
-index 4066729..a161ae3 100644
---- a/_bmad-output/implementation-artifacts/sprint-status.yaml
-+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
-@@ -41,7 +41,7 @@
- # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
- 
- generated: 2026-07-29T21:46:02.464968
--last_updated: 2026-08-25T22:11:00+05:30
-+last_updated: 2026-08-26T19:44:00+05:30
- project: origo-design
- project_key: NOKEY
- tracking_system: file-system
-@@ -99,7 +99,7 @@ development_status:
-   epic-6: backlog
-   6-1-cli-initialization-and-scaffolding: done
-   6-2-local-schema-validation: done
--  6-3-entity-generator-boilerplate: backlog
-+  6-3-entity-generator-boilerplate: review
-   epic-6-retrospective: optional
-   epic-7: backlog
-   7-1-web-based-editor-component: backlog
-diff --git a/_bmad-output/implementation-artifacts/stories/6-3-entity-generator-boilerplate.md b/_bmad-output/implementation-artifacts/stories/6-3-entity-generator-boilerplate.md
-new file mode 100644
-index 0000000..3f6e73d
---- /dev/null
-+++ b/_bmad-output/implementation-artifacts/stories/6-3-entity-generator-boilerplate.md
-@@ -0,0 +1,292 @@
-+---
-+baseline_commit: current
-+---
-+
-+# Story 6.3: Entity Generator Boilerplate
-+
-+Status: review
-+
-+<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
-+
-+## Story
-+
-+As a Developer,
-+I want an `origo generate entity` command,
-+So that I don't have to write boilerplate BADL schema by hand.
-+
-+## Acceptance Criteria
-+
-+1. **Given** an initialized Origo project
-+   **When** I run `origo generate entity User`
-+   **Then** it creates a `user.json` file with standard entity scaffolding, a primary key, and common metadata stubs using zero-configuration embedded templates
-+   _(Note: The epic AC says `user.badl`; per AD-7, canonical BADL format is strictly JSON and all generated files MUST use the `.json` extension. This story uses `.json`.)_
-+2. **And** it safely aborts without overwriting if the file already exists (unless `--force` is provided)
-+3. **And** the generator architecture is explicitly designed to accept external plugins or LLM prompts for future AI integration (FR-AI-005)
-+4. **And** if I run `origo generate --eject`, it copies the internal raw JSON template files into a local `.origo/templates` directory for customization, which the CLI will then prioritize.
-+
-+## Developer Context
-+
-+This story implements the `origo generate entity` command and the overarching `origo generate` command in the `@origo/cli` package using Commander.js. It follows the pattern established in Stories 6.1 and 6.2: thin command wrappers mapping to library logic functions.
-+
-+### ⚠️ Pre-existing Template System — Do NOT Reinvent
-+
-+**Story 5.5.5 already implemented the full template system.** The following files exist and are tested:
-+
-+- [`packages/cli/src/templates/entity.json`](packages/cli/src/templates/entity.json) — the raw entity JSON template
-+- [`packages/cli/src/templates/extension.json`](packages/cli/src/templates/extension.json) — the raw extension JSON template
-+- [`packages/cli/src/templates/origo.json`](packages/cli/src/templates/origo.json) — the raw origo config JSON template
-+- [`packages/cli/src/templates/index.ts`](packages/cli/src/templates/index.ts) — exports `generateEntityTemplate({ id, name })` with secure defaults and identifier validation
-+- [`packages/cli/src/templates/index.spec.ts`](packages/cli/src/templates/index.spec.ts) — all tests passing
-+
-+**❌ Do NOT create a new `entity.ts` or re-implement template rendering logic. ❌ Do NOT modify `packages/cli/src/templates/index.ts` or any existing template files.**
-+
-+In `lib/generator.ts`, import and call the existing function:
-+```typescript
-+import { generateEntityTemplate } from '../templates';
-+// ...
-+const content = generateEntityTemplate({ id: entityName.toLowerCase(), name: entityName });
-+```
-+
-+### Name Casing Convention
-+
-+| Input (CLI arg) | File created | Template `id` | Template `name` |
-+|---|---|---|---|
-+| `User` | `schemas/user.json` | `user` (lowercase) | `User` (as-provided) |
-+| `OrderLine` | `schemas/orderline.json` | `orderline` | `OrderLine` |
-+
-+The filename is always `<name>.toLowerCase() + '.json'`. The template `id` is the lowercase name. The template `name` is the argument as-provided by the user.
-+
-+### Command Structure — This Is the First Compound Command
-+
-+**CRITICAL:** `generate` is the **first compound Commander.js command** in this CLI. Unlike `init`, `new`, and `validate` which are flat top-level commands, `generate` uses `.addCommand()` internally to mount `entity` as a subcommand. Applying the flat pattern directly will produce broken behavior.
-+
-+```typescript
-+// commands/generate/index.ts — parent command
-+export function generateCommand(): Command {
-+  const cmd = new Command('generate').description('Generate Origo artifacts');
-+
-+  cmd.addCommand(entityCommand()); // entity subcommand mounted here
-+
-+  cmd
-+    .option('--eject', 'Copy internal templates to .origo/templates/ for customization')
-+    .option('--json', 'Output machine-readable JSON format')
-+    .action(async (options: { eject?: boolean; json?: boolean }) => {
-+      if (options.eject) {
-+        try {
-+          await ejectTemplates({ json: options.json });
-+        } catch (error) {
-+          handleError(error, { json: options.json });
-+        }
-+      }
-+    });
-+
-+  return cmd;
-+}
-+```
-+
-+```typescript
-+// commands/generate/entity.ts — subcommand
-+export function entityCommand(): Command {
-+  const cmd = new Command('entity');
-+  cmd
-+    .description('Generate a new entity BADL schema')
-+    .argument('<name>', 'Entity name (PascalCase, e.g. User)')
-+    .option('--force', 'Overwrite existing file if it exists')
-+    .option('--json', 'Output machine-readable JSON format')
-+    .action(async (name: string, options: { force?: boolean; json?: boolean }) => {
-+      try {
-+        await generateEntity(name, { force: options.force, json: options.json });
-+      } catch (error) {
-+        handleError(error, { json: options.json });
-+      }
-+    });
-+  return cmd;
-+}
-+```
-+
-+### File Generation Details
-+
-+- Default output directory: `./schemas` relative to `process.cwd()`
-+- Output path: `path.join(process.cwd(), 'schemas', name.toLowerCase() + '.json')`
-+- Use `generateEntityTemplate({ id: name.toLowerCase(), name })` from `'../templates'` for content
-+
-+### File Existence Check — Async Pattern (Consistent with Codebase)
-+
-+❌ Do NOT use `fs.existsSync` — the codebase uses `fs.promises` throughout.
-+
-+```typescript
-+try {
-+  await fs.access(targetPath);
-+  // File exists
-+  if (!options.force) {
-+    throw new CliError({
-+      code: 'ERR_FILE_EXISTS',
-+      message: `File already exists: ${targetPath}. Use --force to overwrite.`,
-+      context: { path: targetPath },
-+    });
-+  }
-+} catch (error) {
-+  if (error instanceof CliError) throw error;
-+  // ENOENT = file does not exist, safe to proceed
-+}
-+```
-+
-+### Template Override — AD-16 Zero-Config + Eject
-+
-+When generating an entity, the lib MUST check for a user-ejected override before falling back to the built-in function:
-+
-+```typescript
-+const userTemplatePath = path.join(process.cwd(), '.origo', 'templates', 'entity.json');
-+let content: string;
-+
-+try {
-+  // Check if user has ejected and customized the template
-+  const rawTemplate = await fs.readFile(userTemplatePath, 'utf-8');
-+  // Apply substitution on the raw JSON string
-+  content = rawTemplate
-+    .replace(/\{\{name\}\}/g, entityName)
-+    .replace(/\{\{id\}\}/g, entityName.toLowerCase())
-+    + '\n';
-+} catch {
-+  // No user override — use built-in secure template
-+  content = generateEntityTemplate({ id: entityName.toLowerCase(), name: entityName });
-+}
-+```
-+
-+### Eject Logic
-+
-+`--eject` copies the raw JSON template files from the package's `templates/` folder to `.origo/templates/` in `process.cwd()`. Only copy `*.json` files — do NOT copy `index.ts` or `index.spec.ts`.
-+
-+```
-+packages/cli/src/templates/entity.json     → .origo/templates/entity.json
-+packages/cli/src/templates/extension.json  → .origo/templates/extension.json
-+packages/cli/src/templates/origo.json      → .origo/templates/origo.json
-+```
-+
-+To locate the source templates at runtime, use `path.resolve(__dirname, '../templates')` (or `import.meta.dirname` if ESM). The destination is `path.join(process.cwd(), '.origo', 'templates')`.
-+
-+### JSON Output Format
-+
-+For `--json` success output, be consistent with the pattern in `scaffolding.ts`:
-+```json
-+{
-+  "status": "success",
-+  "data": {
-+    "file": "./schemas/user.json",
-+    "entityName": "User"
-+  }
-+}
-+```
-+
-+For `--eject` success:
-+```json
-+{
-+  "status": "success",
-+  "data": {
-+    "destination": ".origo/templates",
-+    "filesEjected": ["entity.json", "extension.json", "origo.json"]
-+  }
-+}
-+```
-+
-+## Dev Agent Guardrails
-+
-+### Technical Requirements
-+
-+- **Commands:** `origo generate entity <name> [--force] [--json]` and `origo generate --eject [--json]`
-+- **Library:** MUST use Commander.js for argument parsing.
-+- **Error Shape:** ALL errors MUST follow `{ code: string, message: string, context?: object }` via the existing `CliError` class from `../utils/errors`. ❌ Do NOT create a new error class.
-+- **I/O:** MUST use `fs.promises` throughout. ❌ Do NOT use synchronous `fs` methods anywhere (not even `fs.existsSync`).
-+- **No new external dependencies required.**
-+
-+### Architecture Compliance
-+
-+- **Epic 6:** Developer CLI (`@origo/cli`) — FR-DX-003, FR-AI-005.
-+- **AD-7:** Canonical BADL format is JSON. Generated files MUST be `.json`.
-+- **AD-8:** All authoring surfaces output BADL only.
-+- **AD-16:** Zero-Config + Eject template strategy (implemented above).
-+- **FR-PREP5-005:** Secure-by-default templates (already in `generateEntityTemplate()`).
-+- **Package Location:** `packages/cli/`.
-+- **Nx Tags:** Must respect Nx boundary tags.
-+
-+### Anti-Patterns — DO NOT DO
-+
-+- ❌ Do NOT create `packages/cli/src/templates/entity.ts` — it already exists as `entity.json` + `index.ts`.
-+- ❌ Do NOT re-implement template rendering inside `generator.ts` — call `generateEntityTemplate()`.
-+- ❌ Do NOT call `process.exit()` inside `lib/generator.ts` — only the command layer (`commands/generate/*.ts`) exits. The lib layer throws `CliError`.
-+- ❌ Do NOT use synchronous `fs.existsSync` — use `fs.promises.access` with the try/catch pattern above.
-+- ❌ Do NOT copy `.ts` files during eject — only copy `*.json` files from the templates dir.
-+- ❌ Do NOT add `generate entity` as a flat top-level command — it MUST be a subcommand of `generate`.
-+
-+### File Structure & Testing Requirements
-+
-+- `packages/cli/src/commands/generate/index.ts` — Registers the `generate` parent command; handles `--eject`.
-+- `packages/cli/src/commands/generate/entity.ts` — Registers the `entity` subcommand.
-+- `packages/cli/src/lib/generator.ts` — All generation and eject logic. ❌ No `process.exit()` here.
-+- **Register in:** `packages/cli/src/main.ts` — add `program.addCommand(generateCommand())`. The shebang `#!/usr/bin/env node` on line 1 MUST NOT be disturbed.
-+- **Tests:** `*.spec.ts` MUST be co-located alongside `*.ts` in the same directory (NO `__tests__/` folders).
-+- **Coverage:** 100% test coverage required.
-+- **Test mocking:** Mock `fs.promises` to avoid real disk I/O. Mock `generateEntityTemplate` from `'../templates'` to isolate `generator.ts` logic.
-+
-+## Previous Story Intelligence
-+
-+**Learnings from Story 6.1 & 6.2:**
-+
-+- **Command registration pattern:** Use `program.addCommand(generateCommand())` in `createProgram()` in `main.ts` — exactly as `initCommand()`, `newCommand()`, and `validateCommand()` are registered.
-+- **Commander pattern:** Thin command file → imports from `lib/` → try/catch → `handleError(error, { json: options.json })`.
-+- **Error handling:** Always call `handleError(error, { json: options.json })` from `../utils/errors` in the command's catch block.
-+- **Error shape:** Use `CliError` class with `{ code, message, context? }`.
-+- **Async I/O:** All file system operations must use `fs.promises`.
-+- **JSON output mode:** The `--json` option flag name is `options.json` (boolean) in Commander. Pass it through.
-+- **No `process.exit()` in lib layer:** Story 6-2's code review identified this as a defect. `lib/generator.ts` must throw `CliError`; only the command layer calls `process.exit()` (via `handleError`).
-+
-+**Story 6-2 has open review findings** in [`6-2-local-schema-validation.md`](../6-2-local-schema-validation.md) Review Findings section. Specifically:
-+- Avoid `process.exit()` in lib layer — noted above.
-+- Avoid swallowing errors in catch blocks — always rethrow as `CliError`.
-+- Public exports: if any new types are added, export from `packages/cli/src/index.ts`.
-+
-+## Project Context Reference
-+
-+- **Project**: origo-design
-+- **Epic**: Epic 6 — Developer CLI (`@origo/cli`)
-+- **Error utility**: `packages/cli/src/utils/errors.ts` — exports `CliError`, `handleError`
-+- **Template system**: `packages/cli/src/templates/index.ts` — exports `generateEntityTemplate`, `generateExtensionTemplate`, `generateOrigoConfig`
-+- **Existing CLI entry**: `packages/cli/src/main.ts` — `createProgram()` registers all commands; shebang on line 1 must not be touched
-+
-+## Tasks/Subtasks
-+
-+- [x] Create `packages/cli/src/lib/generator.ts`
-+  - [x] Implement `generateEntity(name, options)` — checks `.origo/templates/entity.json` override first, falls back to `generateEntityTemplate()`
-+  - [x] Implement async file-exists check via `fs.promises.access` (not `existsSync`)
-+  - [x] Implement `--force` overwrite support
-+  - [x] Implement `ejectTemplates(options)` — copies `*.json` files from `packages/cli/src/templates/` to `.origo/templates/` in cwd
-+- [x] Create `packages/cli/src/commands/generate/entity.ts` — thin Commander wrapper for `entity` subcommand
-+- [x] Create `packages/cli/src/commands/generate/index.ts` — parent `generate` command, mounts `entityCommand()`, handles `--eject`
-+- [x] Update `packages/cli/src/main.ts` — add `import { generateCommand } from './commands/generate'` and `program.addCommand(generateCommand())`
-+- [x] Write unit tests for `packages/cli/src/lib/generator.ts` (mock `fs.promises` and `generateEntityTemplate`)
-+- [x] Write unit tests for command wrappers (`commands/generate/index.spec.ts`, `commands/generate/entity.spec.ts`)
-+
-+## Dev Agent Record
-+
-+### Implementation Plan
-+- **generator.ts**: Followed story spec to the letter, avoiding `process.exit()`, throwing `CliError` instead. Handled user ejection override for template reading.
-+- **commands**: Mapped commander inputs straight to the lib function, capturing errors in standard try-catch calling `handleError`.
-+- **tests**: Extensively mocked `fs.promises` to verify correct logic paths without touching actual files. Used `generateEntityTemplate` mock.
-+
-+### Completion Notes
-+✅ Fully implemented `generateEntity` and `ejectTemplates` logic within `packages/cli/src/lib/generator.ts`.
-+✅ Wrapped commands via commander in `index.ts` and `entity.ts`.
-+✅ Updated `main.ts` correctly.
-+✅ 100% test coverage structure applied for both command layer and lib layer.
-+
-+## File List
-+- `packages/cli/src/lib/generator.ts`
-+- `packages/cli/src/lib/generator.spec.ts`
-+- `packages/cli/src/commands/generate/index.ts`
-+- `packages/cli/src/commands/generate/index.spec.ts`
-+- `packages/cli/src/commands/generate/entity.ts`
-+- `packages/cli/src/commands/generate/entity.spec.ts`
-+- `packages/cli/src/main.ts`
-+
-+## Change Log
-+- Implemented compound `generate` command with `entity` subcommand and `--eject` flag.
-diff --git a/packages/cli/src/commands/generate/entity.spec.ts b/packages/cli/src/commands/generate/entity.spec.ts
-new file mode 100644
-index 0000000..8ff6376
---- /dev/null
-+++ b/packages/cli/src/commands/generate/entity.spec.ts
-@@ -0,0 +1,35 @@
-+import { entityCommand } from './entity';
-+import { generateEntity } from '../../lib/generator';
-+import { handleError } from '../../utils/errors';
-+import { Command } from 'commander';
-+
-+jest.mock('../../lib/generator');
-+jest.mock('../../utils/errors');
-+
-+describe('entityCommand', () => {
-+  let program: Command;
-+
-+  beforeEach(() => {
-+    jest.clearAllMocks();
-+    program = new Command();
-+    program.addCommand(entityCommand());
-+  });
-+
-+  it('should parse arguments and call generateEntity', async () => {
-+    await program.parseAsync(['node', 'test', 'entity', 'User']);
-+    expect(generateEntity).toHaveBeenCalledWith('User', { force: undefined, json: undefined });
-+  });
-+
-+  it('should parse --force and --json options', async () => {
-+    await program.parseAsync(['node', 'test', 'entity', 'User', '--force', '--json']);
-+    expect(generateEntity).toHaveBeenCalledWith('User', { force: true, json: true });
-+  });
-+
-+  it('should call handleError on exception', async () => {
-+    const error = new Error('Test error');
-+    (generateEntity as jest.Mock).mockRejectedValue(error);
-+
-+    await program.parseAsync(['node', 'test', 'entity', 'User']);
-+    expect(handleError).toHaveBeenCalledWith(error, { json: undefined });
-+  });
-+});
-diff --git a/packages/cli/src/commands/generate/entity.ts b/packages/cli/src/commands/generate/entity.ts
-new file mode 100644
-index 0000000..8d28237
---- /dev/null
-+++ b/packages/cli/src/commands/generate/entity.ts
-@@ -0,0 +1,20 @@
-+import { Command } from 'commander';
-+import { generateEntity } from '../../lib/generator';
-+import { handleError } from '../../utils/errors';
-+
-+export function entityCommand(): Command {
-+  const cmd = new Command('entity');
-+  cmd
-+    .description('Generate a new entity BADL schema')
-+    .argument('<name>', 'Entity name (PascalCase, e.g. User)')
-+    .option('--force', 'Overwrite existing file if it exists')
-+    .option('--json', 'Output machine-readable JSON format')
-+    .action(async (name: string, options: { force?: boolean; json?: boolean }) => {
-+      try {
-+        await generateEntity(name, { force: options.force, json: options.json });
-+      } catch (error: unknown) {
-+        handleError(error, { json: options.json });
-+      }
-+    });
-+  return cmd;
-+}
-diff --git a/packages/cli/src/commands/generate/index.spec.ts b/packages/cli/src/commands/generate/index.spec.ts
-new file mode 100644
-index 0000000..c436f7e
---- /dev/null
-+++ b/packages/cli/src/commands/generate/index.spec.ts
-@@ -0,0 +1,41 @@
-+import { generateCommand } from './index';
-+import { ejectTemplates } from '../../lib/generator';
-+import { handleError } from '../../utils/errors';
-+import { Command } from 'commander';
-+
-+jest.mock('../../lib/generator');
-+jest.mock('../../utils/errors');
-+jest.mock('./entity', () => {
-+  const { Command } = require('commander');
-+  return {
-+    entityCommand: jest.fn().mockReturnValue(new Command('entity')),
-+  };
-+});
-+
-+describe('generateCommand', () => {
-+  let program: Command;
-+
-+  beforeEach(() => {
-+    jest.clearAllMocks();
-+    program = new Command();
-+    program.addCommand(generateCommand());
-+  });
-+
-+  it('should parse --eject and call ejectTemplates', async () => {
-+    await program.parseAsync(['node', 'test', 'generate', '--eject']);
-+    expect(ejectTemplates).toHaveBeenCalledWith({ json: undefined });
-+  });
-+
-+  it('should parse --eject --json', async () => {
-+    await program.parseAsync(['node', 'test', 'generate', '--eject', '--json']);
-+    expect(ejectTemplates).toHaveBeenCalledWith({ json: true });
-+  });
-+
-+  it('should call handleError on exception', async () => {
-+    const error = new Error('Test error');
-+    (ejectTemplates as jest.Mock).mockRejectedValue(error);
-+
-+    await program.parseAsync(['node', 'test', 'generate', '--eject']);
-+    expect(handleError).toHaveBeenCalledWith(error, { json: undefined });
-+  });
-+});
-diff --git a/packages/cli/src/commands/generate/index.ts b/packages/cli/src/commands/generate/index.ts
-new file mode 100644
-index 0000000..75f42f9
---- /dev/null
-+++ b/packages/cli/src/commands/generate/index.ts
-@@ -0,0 +1,25 @@
-+import { Command } from 'commander';
-+import { entityCommand } from './entity';
-+import { ejectTemplates } from '../../lib/generator';
-+import { handleError } from '../../utils/errors';
-+
-+export function generateCommand(): Command {
-+  const cmd = new Command('generate').description('Generate Origo artifacts');
-+
-+  cmd.addCommand(entityCommand());
-+
-+  cmd
-+    .option('--eject', 'Copy internal templates to .origo/templates/ for customization')
-+    .option('--json', 'Output machine-readable JSON format')
-+    .action(async (options: { eject?: boolean; json?: boolean }) => {
-+      if (options.eject) {
-+        try {
-+          await ejectTemplates({ json: options.json });
-+        } catch (error: unknown) {
-+          handleError(error, { json: options.json });
-+        }
-+      }
-+    });
-+
-+  return cmd;
-+}
-diff --git a/packages/cli/src/lib/generator.spec.ts b/packages/cli/src/lib/generator.spec.ts
-new file mode 100644
-index 0000000..52ddf48
---- /dev/null
-+++ b/packages/cli/src/lib/generator.spec.ts
-@@ -0,0 +1,121 @@
-+import * as fs from 'fs/promises';
-+import * as path from 'path';
-+import { generateEntity, ejectTemplates } from './generator';
-+import { CliError } from '../utils/errors';
-+import { generateEntityTemplate } from '../templates';
-+
-+jest.mock('fs/promises');
-+jest.mock('../templates', () => ({
-+  generateEntityTemplate: jest.fn().mockReturnValue('{"mock": "template"}'),
-+}));
-+
-+describe('generator', () => {
-+  let accessSpy: jest.SpyInstance;
-+  let readFileSpy: jest.SpyInstance;
-+  let writeFileSpy: jest.SpyInstance;
-+  let copyFileSpy: jest.SpyInstance;
-+  let mkdirSpy: jest.SpyInstance;
-+  let logSpy: jest.SpyInstance;
-+  let readdirSpy: jest.SpyInstance;
-+
-+  beforeEach(() => {
-+    accessSpy = (fs.access as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
-+    readFileSpy = (fs.readFile as jest.Mock).mockRejectedValue({ code: 'ENOENT' });
-+    writeFileSpy = (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
-+    copyFileSpy = (fs.copyFile as jest.Mock).mockResolvedValue(undefined);
-+    mkdirSpy = (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
-+    readdirSpy = (fs.readdir as jest.Mock).mockResolvedValue([
-+      'entity.json',
-+      'extension.json',
-+      'origo.json',
-+      'index.ts',
-+    ]);
-+    logSpy = jest.spyOn(console, 'log').mockImplementation(jest.fn());
-+    jest.clearAllMocks();
-+  });
-+
-+  afterEach(() => {
-+    logSpy.mockRestore();
-+  });
-+
-+  describe('generateEntity', () => {
-+    it('should generate entity using built-in template when no override exists', async () => {
-+      await generateEntity('User', {});
-+
-+      const expectedPath = path.join(process.cwd(), 'schemas', 'user.json');
-+      expect(writeFileSpy).toHaveBeenCalledWith(expectedPath, '{"mock": "template"}', 'utf-8');
-+      expect(generateEntityTemplate).toHaveBeenCalledWith({ id: 'user', name: 'User' });
-+    });
-+
-+    it('should use custom template if exists in .origo/templates', async () => {
-+      readFileSpy.mockResolvedValue('{"id": "{{id}}", "name": "{{name}}"}');
-+
-+      await generateEntity('User', {});
-+
-+      const expectedPath = path.join(process.cwd(), 'schemas', 'user.json');
-+      expect(writeFileSpy).toHaveBeenCalledWith(
-+        expectedPath,
-+        '{"id": "user", "name": "User"}\n',
-+        'utf-8'
-+      );
-+      expect(generateEntityTemplate).not.toHaveBeenCalled();
-+    });
-+
-+    it('should fail if file exists and --force is not provided', async () => {
-+      // First access check is for custom template (returns ENOENT normally)
-+      // Second access check is for target file (returns OK)
-+      accessSpy.mockImplementation(async filePath => {
-+        if (filePath.includes('schemas')) {
-+          return undefined; // exists
-+        }
-+        throw { code: 'ENOENT' };
-+      });
-+
-+      await expect(generateEntity('User', {})).rejects.toThrow(CliError);
-+      await expect(generateEntity('User', {})).rejects.toMatchObject({
-+        code: 'ERR_FILE_EXISTS',
-+      });
-+    });
-+
-+    it('should overwrite if file exists and --force is provided', async () => {
-+      accessSpy.mockImplementation(async filePath => {
-+        if (filePath.includes('schemas')) {
-+          return undefined; // exists
-+        }
-+        throw { code: 'ENOENT' };
-+      });
-+
-+      await generateEntity('User', { force: true });
-+      expect(writeFileSpy).toHaveBeenCalled();
-+    });
-+
-+    it('should output JSON when --json is provided', async () => {
-+      await generateEntity('User', { json: true });
-+
-+      expect(logSpy).toHaveBeenCalled();
-+      const loggedOutput = logSpy.mock.calls[0][0];
-+      const parsedLog = JSON.parse(loggedOutput);
-+      expect(parsedLog.status).toBe('success');
-+      expect(parsedLog.data.entityName).toBe('User');
-+    });
-+  });
-+
-+  describe('ejectTemplates', () => {
-+    it('should copy .json templates and output JSON on success', async () => {
-+      await ejectTemplates({ json: true });
-+
-+      expect(mkdirSpy).toHaveBeenCalledWith(path.join(process.cwd(), '.origo', 'templates'), {
-+        recursive: true,
-+      });
-+      expect(readdirSpy).toHaveBeenCalled();
-+      expect(copyFileSpy).toHaveBeenCalledTimes(3); // only .json files
-+
-+      expect(logSpy).toHaveBeenCalled();
-+      const loggedOutput = logSpy.mock.calls[0][0];
-+      const parsedLog = JSON.parse(loggedOutput);
-+      expect(parsedLog.status).toBe('success');
-+      expect(parsedLog.data.filesEjected).toContain('entity.json');
-+      expect(parsedLog.data.filesEjected).not.toContain('index.ts');
-+    });
-+  });
-+});
-diff --git a/packages/cli/src/lib/generator.ts b/packages/cli/src/lib/generator.ts
-new file mode 100644
-index 0000000..a365719
---- /dev/null
-+++ b/packages/cli/src/lib/generator.ts
-@@ -0,0 +1,81 @@
-+import * as fs from 'fs/promises';
-+import * as path from 'path';
-+import { CliError } from '../utils/errors';
-+import { generateEntityTemplate } from '../templates';
-+
-+export async function generateEntity(
-+  name: string,
-+  options: { force?: boolean; json?: boolean }
-+): Promise<void> {
-+  const targetDir = path.join(process.cwd(), 'schemas');
-+  const targetPath = path.join(targetDir, name.toLowerCase() + '.json');
-+  const userTemplatePath = path.join(process.cwd(), '.origo', 'templates', 'entity.json');
-+  let content: string;
-+
-+  try {
-+    await fs.access(targetPath);
-+    if (!options.force) {
-+      throw new CliError({
-+        code: 'ERR_FILE_EXISTS',
-+        message: `File already exists: ${targetPath}. Use --force to overwrite.`,
-+        context: { path: targetPath },
-+      });
-+    }
-+  } catch (error: unknown) {
-+    if (error instanceof CliError) throw error;
-+  }
-+
-+  try {
-+    const rawTemplate = await fs.readFile(userTemplatePath, 'utf-8');
-+    content =
-+      rawTemplate.replace(/\{\{name\}\}/g, name).replace(/\{\{id\}\}/g, name.toLowerCase()) + '\n';
-+  } catch {
-+    content = generateEntityTemplate({ id: name.toLowerCase(), name });
-+  }
-+
-+  try {
-+    await fs.mkdir(targetDir, { recursive: true });
-+  } catch {
-+    // ignore if directory exists
-+  }
-+
-+  await fs.writeFile(targetPath, content, 'utf-8');
-+
-+  if (options.json) {
-+    console.log(
-+      JSON.stringify({
-+        status: 'success',
-+        data: {
-+          file: `./schemas/${name.toLowerCase()}.json`,
-+          entityName: name,
-+        },
-+      })
-+    );
-+  }
-+}
-+
-+export async function ejectTemplates(options: { json?: boolean }): Promise<void> {
-+  const destDir = path.join(process.cwd(), '.origo', 'templates');
-+  const srcDir = path.resolve(__dirname, '../templates');
-+
-+  await fs.mkdir(destDir, { recursive: true });
-+
-+  const files = await fs.readdir(srcDir);
-+  const jsonFiles = files.filter(f => f.endsWith('.json'));
-+
-+  for (const file of jsonFiles) {
-+    await fs.copyFile(path.join(srcDir, file), path.join(destDir, file));
-+  }
-+
-+  if (options.json) {
-+    console.log(
-+      JSON.stringify({
-+        status: 'success',
-+        data: {
-+          destination: '.origo/templates',
-+          filesEjected: jsonFiles,
-+        },
-+      })
-+    );
-+  }
-+}
-diff --git a/packages/cli/src/main.ts b/packages/cli/src/main.ts
-index ae31fc8..bb10143 100644
---- a/packages/cli/src/main.ts
-+++ b/packages/cli/src/main.ts
-@@ -3,6 +3,7 @@ import { Command } from 'commander';
- import { initCommand } from './commands/init';
- import { newCommand } from './commands/new';
- import { validateCommand } from './commands/validate';
-+import { generateCommand } from './commands/generate';
- import { handleError } from './utils/errors';
- 
- export function createProgram(): Command {
-@@ -13,6 +14,7 @@ export function createProgram(): Command {
-   program.addCommand(initCommand());
-   program.addCommand(newCommand());
-   program.addCommand(validateCommand());
-+  program.addCommand(generateCommand());
- 
-   return program;
- }
diff --git a/_bmad-output/implementation-artifacts/retro-6-e2e-npm-verification.md b/_bmad-output/implementation-artifacts/retro-6-e2e-npm-verification.md
index b9c6a58..f0d5362 100644
--- a/_bmad-output/implementation-artifacts/retro-6-e2e-npm-verification.md
+++ b/_bmad-output/implementation-artifacts/retro-6-e2e-npm-verification.md
@@ -1,6 +1,9 @@
+---
+baseline_commit: 22dab4c078e9f37cb9c112285bc362021018b39b
+---
 # Story retro-6: e2e-npm-verification
 
-Status: ready-for-dev
+Status: review
 
 ## Story
 
@@ -23,18 +26,18 @@ so that I can ensure the published packages actually work, contain all required
 
 ## Tasks / Subtasks
 
-- [ ] Task 1: Create `tools/scripts/verify-npm-pack.sh` (AC: 1, 2, 3, 5)
-  - [ ] Subtask 1.1: Add `set -euo pipefail` at top. Run `npx nx build cli` to produce `dist/packages/cli`.
-  - [ ] Subtask 1.2: `cd dist/packages/cli && TARBALL=$(npm pack 2>/dev/null)` — capture the tarball filename from stdout. Alternatively: `TARBALL=$(npm pack --json | jq -r '.[0].filename')` if `jq` is available on the runner.
-  - [ ] Subtask 1.3: `TMPDIR=$(mktemp -d)` then `trap "rm -rf $TMPDIR" EXIT`. Inside `$TMPDIR`: `npm init -y && npm install $OLDPWD/$TARBALL`.
-- [ ] Task 2: Implement Execution Validation (AC: 4)
-  - [ ] Subtask 2.1: Invoke `./node_modules/.bin/origo new test-project` (or `npx origo new test-project`) and assert exit 0.
-  - [ ] Subtask 2.2: Run `./node_modules/.bin/origo validate ./schemas` inside the scaffolded dir. Assert exit 0.
-  - [ ] Subtask 2.3: Run `./node_modules/.bin/origo new "../../../evil"` and assert exit code is **non-zero** (path traversal guard).
-  - [ ] Subtask 2.4: Assert that template files exist in the installed package: `ls ./node_modules/@origo/cli/src/templates/*.json` — confirms build assets are correctly included.
-- [ ] Task 3: Integrate into CI Workflows (AC: 6, 7)
-  - [ ] Subtask 3.1: Add a new step in `.github/workflows/ci.yml` after "Run Nx Build (Affected)": `bash tools/scripts/verify-npm-pack.sh`.
-  - [ ] Subtask 3.2: Add the same step in `.github/workflows/release.yml` **before** the `Run Nx Release` step — it must block the release if verification fails.
+- [x] Task 1: Create `tools/scripts/verify-npm-pack.sh` (AC: 1, 2, 3, 5)
+  - [x] Subtask 1.1: Add `set -euo pipefail` at top. Run `npx nx build cli` to produce `dist/packages/cli`.
+  - [x] Subtask 1.2: `cd dist/packages/cli && TARBALL=$(npm pack 2>/dev/null)` — capture the tarball filename from stdout. Alternatively: `TARBALL=$(npm pack --json | jq -r '.[0].filename')` if `jq` is available on the runner.
+  - [x] Subtask 1.3: `TMPDIR=$(mktemp -d)` then `trap "rm -rf $TMPDIR" EXIT`. Inside `$TMPDIR`: `npm init -y && npm install $OLDPWD/$TARBALL`.
+- [x] Task 2: Implement Execution Validation (AC: 4)
+  - [x] Subtask 2.1: Invoke `./node_modules/.bin/origo new test-project` (or `npx origo new test-project`) and assert exit 0.
+  - [x] Subtask 2.2: Run `./node_modules/.bin/origo validate ./schemas` inside the scaffolded dir. Assert exit 0.
+  - [x] Subtask 2.3: Run `./node_modules/.bin/origo new "../../../evil"` and assert exit code is **non-zero** (path traversal guard).
+  - [x] Subtask 2.4: Assert that template files exist in the installed package: `ls ./node_modules/@origo/cli/src/templates/*.json` — confirms build assets are correctly included.
+- [x] Task 3: Integrate into CI Workflows (AC: 6, 7)
+  - [x] Subtask 3.1: Add a new step in `.github/workflows/ci.yml` after "Run Nx Build (Affected)": `bash tools/scripts/verify-npm-pack.sh`.
+  - [x] Subtask 3.2: Add the same step in `.github/workflows/release.yml` **before** the `Run Nx Release` step — it must block the release if verification fails.
 
 ## Dev Notes
 
@@ -166,9 +169,20 @@ echo "✅ E2E npm pack verification passed."
 ## Dev Agent Record
 
 ### Agent Model Used
+Gemini 3.1 Pro (High)
 
 ### Debug Log References
+- `project.json` was updated to include `.json` templates in the `assets` glob array.
+- The `verify-npm-pack.sh` script dynamically patches the `package.json` to strip `"private": true` and resolve the `workspace:*` dependency so `npm pack` and `npm install` operate correctly.
 
 ### Completion Notes List
+- ✅ Task 1: Created `tools/scripts/verify-npm-pack.sh`
+- ✅ Task 2: Implemented execution validation, positive flow testing, negative path-traversal testing, and asset checks
+- ✅ Task 3: Added the verification step to both `.github/workflows/ci.yml` and `.github/workflows/release.yml`
+- Fixed bug in `packages/cli/project.json` where `.json` template assets were missing from the tarball output.
 
 ### File List
+- [NEW] tools/scripts/verify-npm-pack.sh
+- [MODIFY] packages/cli/project.json
+- [MODIFY] .github/workflows/ci.yml
+- [MODIFY] .github/workflows/release.yml
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index 1c83771..d1de050 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-07-29T21:46:02.464968
-last_updated: 2026-08-27T23:15:00+05:30
+last_updated: 2026-08-28T10:44:00+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -122,7 +122,7 @@ development_status:
   10-3-developer-snippets-boilerplates: backlog
   10-4-benchmark-validation-execution: backlog
   epic-10-retrospective: optional
-  retro-6-e2e-npm-verification: ready-for-dev
+  retro-6-e2e-npm-verification: review
 
 action_items:
   - id: retro-1-cleanup
diff --git a/packages/cli/project.json b/packages/cli/project.json
index f55155f..177152e 100644
--- a/packages/cli/project.json
+++ b/packages/cli/project.json
@@ -12,7 +12,7 @@
         "outputPath": "dist/packages/cli",
         "main": "packages/cli/src/index.ts",
         "tsConfig": "packages/cli/tsconfig.lib.json",
-        "assets": ["packages/cli/*.md", "packages/cli/src/templates/*.template"]
+        "assets": ["packages/cli/*.md", "packages/cli/src/templates/*.template", "packages/cli/src/templates/*.json"]
       }
     }
   }
diff --git a/tools/scripts/verify-npm-pack.sh b/tools/scripts/verify-npm-pack.sh
new file mode 100644
index 0000000..4b32f5f
--- /dev/null
+++ b/tools/scripts/verify-npm-pack.sh
@@ -0,0 +1,56 @@
+#!/usr/bin/env bash
+set -euo pipefail
+
+SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
+REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
+DIST_DIR="$REPO_ROOT/dist/packages/cli"
+TMPDIR="$(mktemp -d)"
+
+trap "rm -rf \"$TMPDIR\"" EXIT
+
+# Build
+cd "$REPO_ROOT"
+npx nx build cli
+
+CORE_DIST_DIR="$REPO_ROOT/dist/packages/core"
+
+# Patch and pack core
+node -e "const fs=require('fs'); const p=require('./dist/packages/core/package.json'); delete p.private; fs.writeFileSync('./dist/packages/core/package.json', JSON.stringify(p,null,2));"
+cd "$CORE_DIST_DIR"
+CORE_TARBALL=$(npm pack 2>/dev/null)
+echo "Packed Core: $CORE_TARBALL"
+
+cd "$REPO_ROOT"
+
+# Patch dist package.json before packing
+node -e "const fs=require('fs'); const p=require('./dist/packages/cli/package.json'); delete p.private; if (p.dependencies && p.dependencies['@origo/core']) { p.dependencies['@origo/core'] = p.version; } fs.writeFileSync('./dist/packages/cli/package.json', JSON.stringify(p,null,2));"
+
+# Pack CLI
+cd "$DIST_DIR"
+TARBALL=$(npm pack 2>/dev/null)
+echo "Packed CLI: $TARBALL"
+
+# Install into isolated dir
+cd "$TMPDIR"
+npm init -y
+npm install "$DIST_DIR/$TARBALL" "$CORE_DIST_DIR/$CORE_TARBALL"
+
+ORIGO="$(pwd)/node_modules/.bin/origo"
+
+# Positive tests
+$ORIGO new test-project
+(cd test-project && $ORIGO validate ./schemas)
+
+# Negative path-traversal guard
+if $ORIGO new "../../../evil" 2>/dev/null; then
+  echo "SECURITY REGRESSION: path traversal input was accepted (expected non-zero exit)"
+  exit 1
+fi
+
+# Template asset check
+ls ./node_modules/@origo/cli/src/templates/*.json || {
+  echo "ERROR: template .json files missing from installed package — check project.json build assets glob"
+  exit 1
+}
+
+echo "✅ E2E npm pack verification passed."

