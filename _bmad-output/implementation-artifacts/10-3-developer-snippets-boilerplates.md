---
baseline_commit: a3af3e1
---
# Story 10.3: Developer Snippets & Boilerplates

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a New Developer,
I want editor snippets and ready-made templates for common patterns,
so that I don't have to start from a blank screen.

## Acceptance Criteria

1. **Given** my IDE (VS Code)
   **When** I type a snippet prefix (e.g. `origo-entity`, `origo-list-detail`, `origo-login`)
   **Then** a VS Code snippet expands into best-practice BADL boilerplate at `.vscode/origo-badl.code-snippets` (FR-DX-006)
2. **And** the snippet file uses the standard VS Code `.code-snippets` JSON format (`scope`, `prefix`, `body` array, `description`) — not raw BADL JSON.
3. **Given** an initialized Origo project
   **When** I run `origo generate page --template list-detail` or `origo generate page --template login`
   **Then** it generates a BADL `.json` boilerplate file in `./schemas/` using templates from `packages/cli/src/templates/` (FR-DX-006, ADR-002: zero-config + eject pattern)
4. **And** the Login template contains zero hardcoded secrets, API keys, default credentials, or permissive CORS defaults — a strict security audit is required before merge.
5. **And** the `--eject` flag on `origo generate` already copies `*.json` templates to `.origo/templates/`; the two new page templates (`list-detail.json`, `login.json`) MUST be automatically included in that eject set with zero additional command changes.
6. **And** the existing `guides/cli-templates.md` in the Starlight docs site is updated to document the new `origo generate page` subcommand, the VS Code snippets file, and the new templates (no new sidebar entry required — the page is already wired at `/guides/cli-templates/`).

## Tasks / Subtasks

- [ ] Task 1: Add page-level BADL templates (AC: 3, 4, 5)
  - [ ] Create `packages/cli/src/templates/list-detail.json` — NEW: BADL boilerplate for a list+detail page pattern (two entities: a list view and a detail view with fields, capabilities, interaction contracts)
  - [ ] Create `packages/cli/src/templates/login.json` — NEW: BADL boilerplate for a login flow; zero hardcoded secrets, zero permissive defaults; must pass security audit before merge
  - [ ] Update `packages/cli/src/templates/index.ts` — UPDATE: export `generateListDetailTemplate(options)` and `generateLoginTemplate(options)` following the exact same pattern as `generateEntityTemplate()` (spread template object, override `id`/`name`, `JSON.stringify` + `'\n'`)
  - [ ] Update `packages/cli/src/templates/index.spec.ts` — UPDATE: add unit tests for both new template functions covering default output, identifier validation, and secure-by-default assertions (no secrets in output)
- [ ] Task 2: Add `origo generate page` subcommand (AC: 3, 5)
  - [ ] Create `packages/cli/src/commands/generate/page.ts` — NEW: `page` subcommand with `--template <name>` option and `--force`/`--json` flags; validates `--template` is one of the known values (`list-detail`, `login`); delegates to `lib/generator.ts`
  - [ ] Create `packages/cli/src/commands/generate/page.spec.ts` — NEW: unit tests for the `page` command wrapper including invalid template name rejection and both known templates
  - [ ] Update `packages/cli/src/commands/generate/index.ts` — UPDATE: add `cmd.addCommand(pageCommand())` alongside the existing `cmd.addCommand(entityCommand())` line (line 9); import from `./page`
  - [ ] Update `packages/cli/src/lib/generator.ts` — UPDATE: add `generatePage(templateName, name, options)` function following the same async fs.promises pattern, user override path `.origo/templates/<templateName>.json`, and plugin hooks as `generateEntity()`
  - [ ] Update `packages/cli/src/lib/generator.spec.ts` — UPDATE: add tests for `generatePage()` for both templates, `--force`, ENOENT user template path, and invalid template name
- [ ] Task 3: Add VS Code snippets file (AC: 1, 2)
  - [ ] Create `.vscode/origo-badl.code-snippets` — NEW: VS Code snippet file in standard format (see Dev Notes for format); add snippets for `origo-entity`, `origo-list-detail`, `origo-login` at minimum
- [ ] Task 4: Update Starlight docs (AC: 6)
  - [ ] Update `docs/src/content/docs/guides/cli-templates.md` — UPDATE: add a new section "Page Templates" documenting `origo generate page --template list-detail` and `origo generate page --template login`; add a new section "VS Code Snippets" documenting the `.vscode/origo-badl.code-snippets` file and its available prefixes; use Starlight Aside syntax (`:::note`, `:::tip`, `:::caution`) — never plain `>` blockquotes
- [ ] Task 5: DoD compliance — Central Test Registry (AC: all)
  - [ ] Open `tools/test-registry/test-registry.yaml` and append Story 10.3 test scenarios for: snippet file existence check, `origo generate page --template list-detail` happy path, `origo generate page --template login` happy path, invalid template name rejection, and login template security audit (no secrets in output)

## Dev Notes

### ⚠️ Pre-existing Template System — DO NOT Reinvent

**Story 6.3 already built the complete template infrastructure.** The following files exist and are fully tested:

- `packages/cli/src/templates/entity.json` — raw entity JSON template (spread pattern)
- `packages/cli/src/templates/extension.json` — raw extension JSON template
- `packages/cli/src/templates/origo.json` — raw origo config JSON template
- `packages/cli/src/templates/index.ts` — exports `generateEntityTemplate()`, `generateExtensionTemplate()`, `generateOrigoConfig()` with `validateIdentifier()` guard
- `packages/cli/src/lib/generator.ts` — exports `generateEntity()` and `ejectTemplates()`; eject logic at line 121 uses `fs.readdir(srcDir)` and filters `*.json` — **the two new templates will be picked up by eject automatically** with zero changes to `ejectTemplates()`

**❌ DO NOT create a new template rendering system.**
**❌ DO NOT create new eject logic.** The existing `ejectTemplates()` auto-includes all `*.json` files in `packages/cli/src/templates/` — adding the new `.json` files is sufficient.
**❌ DO NOT modify `generateEntityTemplate()` or `ejectTemplates()` — extend only.**

### Template Function Pattern (copy exactly from `index.ts`)

```typescript
// packages/cli/src/templates/index.ts — add these two exports
export function generateListDetailTemplate(options: EntityOptions = {}): string {
  const id = options.id || 'default-list-detail';
  const name = options.name || 'DefaultListDetail';
  validateIdentifier(id);
  return JSON.stringify({ ...listDetailTemplate, id, name }, null, 2) + '\n';
}

export function generateLoginTemplate(options: EntityOptions = {}): string {
  const id = options.id || 'default-login';
  const name = options.name || 'DefaultLogin';
  validateIdentifier(id);
  return JSON.stringify({ ...loginTemplate, id, name }, null, 2) + '\n';
}
```

### `origo generate page` — Compound Subcommand Pattern (from Story 6.3)

`page` is a **subcommand of `generate`**, not a flat top-level command. Mount via `cmd.addCommand(pageCommand())` in `generate/index.ts` line 9 area — exactly as `entityCommand()` is mounted:

```typescript
// packages/cli/src/commands/generate/page.ts
export function pageCommand(): Command {
  const cmd = new Command('page');
  cmd
    .description('Generate a BADL page boilerplate from a named template')
    .requiredOption('--template <name>', 'Template name: list-detail | login')
    .argument('<name>', 'Output schema name (PascalCase, e.g. UserListDetail)')
    .option('--force', 'Overwrite existing file if it exists')
    .option('--json', 'Output machine-readable JSON format')
    .action(async (name: string, options: { template: string; force?: boolean; json?: boolean }) => {
      try {
        await generatePage(options.template, name, { force: options.force, json: options.json });
      } catch (error: unknown) {
        handleError(error, { json: options.json });
      }
    });
  return cmd;
}
```

### `generatePage()` in `lib/generator.ts` — Key Rules

Follow the **exact same pattern** as `generateEntity()` (lines 16–119 in `generator.ts`):
- Validate `name` is non-empty and has no path separators
- Validate `templateName` is one of `['list-detail', 'login']`; throw `CliError({ code: 'ERR_UNKNOWN_TEMPLATE', ... })` otherwise
- Output path: `path.join(process.cwd(), 'schemas', name.toLowerCase() + '.json')`
- User override path: `path.join(process.cwd(), '.origo', 'templates', templateName + '.json')`
- Plugin hook chain (FR-AI-005): call existing `plugins` array's `resolveTemplate` hooks
- Use `fs.promises` throughout; ❌ no `fs.existsSync`, ❌ no `process.exit()` in lib layer
- JSON output format (consistent with `generateEntity()`):
  ```json
  { "status": "success", "data": { "file": "./schemas/user-list-detail.json", "templateName": "list-detail" } }
  ```

### Error Handling (mandatory — from Story 6.2/6.3 review findings)

Always use `CliError` from `../utils/errors`. Never create a new error class. Never call `process.exit()` in `lib/generator.ts`. Always rethrow non-ENOENT errors from `fs.access` catch blocks.

### VS Code `.code-snippets` Format

`.vscode/origo-badl.code-snippets` uses VS Code's JSON snippet format — **this is NOT a BADL template**:

```json
{
  "Origo Entity": {
    "scope": "json",
    "prefix": "origo-entity",
    "body": [
      "{",
      "  \"id\": \"${1:entity-id}\",",
      "  \"name\": \"${2:EntityName}\",",
      "  \"implements\": [],",
      "  \"fields\": [",
      "    { \"name\": \"${3:fieldName}\", \"type\": \"${4:String}\" }",
      "  ]",
      "}"
    ],
    "description": "Origo BADL Entity boilerplate"
  },
  "Origo List-Detail Page": { ... },
  "Origo Login Page": { ... }
}
```

Tab-stop placeholders use `${N:defaultValue}` syntax. The `scope` is `"json"` since BADL files are `.json`.

### Login Template — Security Audit Requirements (AC: 4)

The `login.json` template is the highest-risk deliverable. It MUST be verified before merge:
- ❌ No `password`, `secret`, `token`, `apiKey` fields with default values
- ❌ No `"admin"` default usernames or roles
- ❌ No CORS or network configuration of any kind (BADL is schema-only)
- ✅ Authentication fields must use `"type": "String"` with validation annotations only
- ✅ Include a `"_secure_by_default": true` metadata comment in the template JSON as documentation

### Docs Update — Starlight Aside Syntax (mandatory — from Stories 10.1, 10.2)

`docs/src/content/docs/guides/cli-templates.md` already exists and is already wired into the sidebar at `/guides/cli-templates/` in `docs/astro.config.mjs` line 31. **No sidebar changes needed.** The file uses standard Markdown (not MDX), so do not add Astro component imports. Use fenced Aside-style callouts compatible with the existing file format (`:::note`, `:::tip`, `:::caution` are supported by Starlight in `.md` files too).

### ⚠️ Cross-Story Context: Quickstart Step 4 Bug (from Story 10.1)

`docs/src/content/docs/getting-started/quickstart.mdx` Step 4 (line 95) still incorrectly instructs the reader to navigate to `http://localhost:3000` — this is a known unfixed bug. **Do not cross-link to or reference quickstart Step 4** in any docs changes in this story.

### File Structure — [NEW] / [UPDATE] Map

| Status | Path |
|--------|------|
| NEW | `packages/cli/src/templates/list-detail.json` |
| NEW | `packages/cli/src/templates/login.json` |
| UPDATE | `packages/cli/src/templates/index.ts` |
| UPDATE | `packages/cli/src/templates/index.spec.ts` |
| NEW | `packages/cli/src/commands/generate/page.ts` |
| NEW | `packages/cli/src/commands/generate/page.spec.ts` |
| UPDATE | `packages/cli/src/commands/generate/index.ts` |
| UPDATE | `packages/cli/src/lib/generator.ts` |
| UPDATE | `packages/cli/src/lib/generator.spec.ts` |
| NEW | `.vscode/origo-badl.code-snippets` |
| UPDATE | `docs/src/content/docs/guides/cli-templates.md` |
| UPDATE | `tools/test-registry/test-registry.yaml` |

### Testing Requirements

- **Co-location:** `*.spec.ts` files MUST be co-located alongside `*.ts` in the same directory — no `__tests__/` folders
- **Mocking:** Mock `fs.promises` for all `lib/generator.spec.ts` tests; mock template functions in command spec files to isolate the command layer
- **Coverage:** 100% branch coverage on `generatePage()` and `pageCommand()`
- **Negative cases:** Invalid template name, ENOENT user override path, `--force` overwrite, non-ENOENT `fs.access` error propagation

### DoD Compliance

Per `docs/definition-of-done.md`:
- **ADR references:** AC #3 and #5 reference ADR-002 (CLI Template Generation Strategy — zero-config + eject). AC #4 constitutes the security requirement mandated by FR-PREP5-005.
- **Test Registry:** Task 5 mandates updating `tools/test-registry/test-registry.yaml` at story conclusion.

### References

- FR-DX-006: Developer MUST produce a working rendered page within 10 minutes of first install
- FR-PREP5-005: Secure-by-default boilerplate templates for CLI generators
- FR-AI-005: All authoring surfaces (CLI) MUST produce BADL only; generator architecture designed for plugin/LLM integration
- ADR-002: CLI Template Generation Strategy (zero-config + eject) — `docs/src/content/docs/architecture-decisions/002-cli-template-generation-strategy.md`
- Story 5.5.5: Define Secure-by-Default Boilerplate Templates (template foundation)
- Story 6.3: Entity Generator Boilerplate (compound Commander.js pattern, existing template infrastructure)
- Story 10.1: 10-Minute Quickstart Guide (quickstart Step 4 bug — do not cross-link)
- Story 10.2: Legacy Migration Strategy Guide (Starlight aside syntax, DoD pattern)
- Story 10.4: Benchmark Validation Execution (downstream — uses quickstart, not this story directly)
- `packages/cli/src/templates/index.ts` — existing template export surface
- `packages/cli/src/lib/generator.ts` — existing `generateEntity()` / `ejectTemplates()` logic
- `packages/cli/src/commands/generate/index.ts` — existing generate command (line 9: `cmd.addCommand(entityCommand())`)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (Thinking)

### Debug Log References

N/A

### Completion Notes List

Story rebuilt from scratch by :validate pass. All critical issues resolved: standard story format applied, Tasks/Subtasks with concrete file paths added, wheel-reinvention prevention notes added (existing template system documented), DoD compliance tasks added (test registry + ADR references in ACs), VS Code snippet format documented, Commander.js compound subcommand pattern from Story 6.3 applied, cross-story quickstart Step 4 bug warning carried forward, ADR-002 referenced in ACs.

### File List

_To be filled by dev agent on completion._

### Review Findings

_To be filled by code-review agent._
