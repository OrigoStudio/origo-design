---
baseline_commit: dfee4c7
---

# Story 6.1: CLI Initialization and Scaffolding

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want an `origo init` command,
So that I can quickly scaffold a new BADL project with the correct file structure.

## Acceptance Criteria

1. **Given** the installed Origo CLI
   **When** I run `origo init my-project`
   **Then** it generates a base project directory with a standard `origo.json` config and a `/schemas` folder ready for BADL files
2. **And** the generated boilerplate is secure-by-default, containing zero hardcoded secrets or permissive CORS defaults.

## Tasks / Subtasks

- [ ] Task 1: Initialize CLI package
  - [ ] Generate `@origo/cli` package in the monorepo workspace using Nx (e.g. `@nx/js:lib --directory=packages/cli`).
  - [ ] Configure `package.json` with a `bin` entry for `origo`.
- [ ] Task 2: Implement CLI entry point and argument parsing
  - [ ] Set up an argument parser for the `origo` command.
  - [ ] Define the `init` command structure: `origo init [project-name]`
  - [ ] Add guard: `if (!projectName) { console.error('Usage: origo init <project-name>'); process.exit(1); }`
- [ ] Task 3: Implement Scaffolding logic
  - [ ] Create the target directory (`[project-name]`).
  - [ ] Generate the `origo.json` file with secure-by-default configurations.
  - [ ] Create the `/schemas` directory.
- [ ] Task 4: Testing
  - [ ] Write tests for command parsing.
  - [ ] Write integration/e2e tests verifying directory structure and file contents generated.
  - [ ] Mock the file system in tests to avoid writing to real disk.
  - [ ] Ensure 100% test coverage for the CLI scaffolding logic.

## Dev Agent Guardrails

### Technical Requirements
- The CLI command structure must follow the format `origo <verb> [<noun>] [options]`.
- Output must be robust and error-handled. Gracefully handle cases where the directory already exists or permissions are denied.
- The `origo.json` boilerplate must not include any hardcoded secrets or permissive CORS defaults.
  - Expected `origo.json` schema: `{ "version": "1.0", "build": { "outDir": "./dist" }, "schemas": "./schemas" }`
- The CLI should be authored in TypeScript and compiled properly for Node.js execution.
- If additional CLI libraries (e.g. `commander`, `yargs`) are needed, explicitly add them to dependencies.

### Architecture Compliance
- **Epic 6: Developer CLI (@origo/cli)**: FR-DX-003.
- **FR-PREP5-005**: Define secure-by-default boilerplate templates for CLI generators.
- **AD-8**: All authoring surfaces MUST produce BADL only.
- The authority chain places CLI at the start: `CLI → VS Code Ext → AI Generator → Visual Builder → Import Wizards → BADL Files → @origo/core`.
- The CLI is in Phase 1 (Foundation) and must rely on standard node capabilities and `@origo/core` if needed.
- Package location should be `packages/cli/`.
- Error shapes MUST follow `{ code: string, message: string, context?: object }`.

### Library / Framework Requirements
- The repository uses Nx. Utilize it to generate the CLI project properly if it hasn't been generated yet.
- Target a modern Node.js execution environment (>= 22.0.0).

### File Structure Requirements
- `packages/cli/package.json` with appropriate `bin` entry for `origo`.
- `packages/cli/src/main.ts` or `index.ts` as the entry point.
- `packages/cli/src/commands/init.ts` for the command implementation.
- Testing files in `packages/cli/src/__tests__/` or alongside source.

### Testing Requirements
- 100% test coverage expected for the command logic.
- Verify generated `origo.json` payload content for security standards in tests.

## Project Context Reference
- **Project**: origo-design
- **Epic**: Epic 6 - Developer CLI (@origo/cli)

