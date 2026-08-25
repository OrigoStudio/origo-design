---
baseline_commit: dfee4c7
---

# Story 6.1: CLI Initialization and Scaffolding

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want an `origo new` command,
So that I can quickly scaffold a new BADL project with the correct file structure.

## Acceptance Criteria

1. **Given** the installed Origo CLI
   **When** I run `origo new my-project`
   **Then** it generates a base project directory with a standard `origo.json` config and a `/schemas` folder ready for BADL files
2. **And** the generated boilerplate is secure-by-default, containing zero hardcoded secrets or permissive CORS defaults, sourced directly from templates built in Story 5.5.5.

## Tasks / Subtasks

- [x] Task 1: Initialize CLI package
  - [x] Generate `@origo/cli` package in the monorepo workspace using Nx (e.g. `@nx/js:lib --directory=packages/cli --tags=scope:cli`).
  - [x] Configure `package.json` with a `bin` entry for `origo`.
- [x] Task 2: Implement CLI entry point and argument parsing using Commander.js
  - [x] Set up the argument parser for the `origo` command.
  - [x] Define the `new` command structure: `origo new [project-name]`
  - [x] Add guard: `if (!projectName) { console.error('Usage: origo new <project-name>'); process.exit(1); }`
- [x] Task 3: Implement Scaffolding logic
  - [x] Create the target directory (`[project-name]`).
  - [x] Import the secure-by-default templates created in Story 5.5.5 using the standard monorepo JSON imports (Story 3.5.2). DO NOT create new templates.
  - [x] Generate the `origo.json` file referencing the grammar version established in Epic 3 (AD-10).
  - [x] Create the `/schemas` directory.
- [x] Task 4: Testing
  - [x] Write tests for command parsing.
  - [x] Write integration tests verifying directory structure and file contents generated.
  - [x] Mock the file system in tests to avoid writing to real disk.
  - [x] Ensure 100% test coverage for the CLI scaffolding logic.

### Review Findings

- [x] [Review][Patch] Missing Shebang Line in CLI Binary Entry Point [packages/cli/src/main.ts:1]
- [x] [Review][Patch] Dual Command Divergence (initCommand vs newCommand) [packages/cli/src/main.ts:11-12]
- [x] [Review][Patch] Bypassing Commander Argument Enforcement & Non-Structured Error Handling [packages/cli/src/commands/new.ts:9-15]
- [x] [Review][Patch] Path Traversal Security Vulnerability in Scaffolding [packages/cli/src/lib/scaffolding.ts:7]
- [x] [Review][Patch] Deviation from Centralized Secure Template Utilities (generateOrigoConfig) [packages/cli/src/lib/scaffolding.ts:22-25]
- [x] [Review][Patch] Synchronous I/O Blocking Event Loop in Async Scaffolding API [packages/cli/src/lib/scaffolding.ts:6-30]
- [x] [Review][Patch] Destructive Error Swallowing in scaffoldProject Catch Block [packages/cli/src/lib/scaffolding.ts:33-38]
- [x] [Review][Patch] Missing Machine-Readable (JSON) Output Mode in CLI Scaffolding [packages/cli/src/lib/scaffolding.ts:32]
- [x] [Review][Patch] Missing Nx Scope Boundary Tag in project.json [packages/cli/project.json:6]
- [x] [Review][Patch] Empty / Broken Public Export Surface in Package Entry Point [packages/cli/src/index.ts:1]
- [x] [Review][Patch] Fragile Runtime Template Loading and Fragile Template String Substitutions [packages/cli/src/templates/index.ts:32]
- [x] [Review][Patch] Superficial Security & Error Handling Verification in Unit Tests [packages/cli/src/lib/scaffolding.spec.ts:1]
- [x] [Review][Defer] Missing strict-mode filter for aria-/data- attributes in Web Adapter [packages/angular-renderer/src/adapters/web/adapter.ts] — deferred, pre-existing
- [x] [Review][Defer] Unchecked Infinity handling in Web Adapter numeric coercion [packages/angular-renderer/src/adapters/web/adapter.ts] — deferred, pre-existing
- [x] [Review][Defer] Unhandled whitespace trimming in Web Adapter boolean coercion (' 0 ', ' false ') [packages/angular-renderer/src/adapters/web/adapter.ts] — deferred, pre-existing
- [x] [Review][Defer] Null value coerced to empty object in Web Adapter object branch [packages/angular-renderer/src/adapters/web/adapter.ts] — deferred, pre-existing
- [x] [Review][Defer] Non-plain object types (Date/Map/Set) stripped during deepClone in Web Adapter [packages/angular-renderer/src/adapters/web/adapter.ts] — deferred, pre-existing
- [x] [Review][Defer] Null value rendered as string 'null' in TextInput component effect [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Numeric input '0' converted to empty string in TextInput component [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Event target null-check missing in TextInput onInput handler [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Button component missing ID guard before capability dispatch [packages/angular-renderer/src/components/primitives/button/button.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Potential circular reference error in ExperienceAdapterService debug logging [packages/angular-renderer/src/adapters/web/experience-adapter.service.ts] — deferred, pre-existing
- [x] [Review][Defer] Duplicate emission risk on Button component action output [packages/angular-renderer/src/components/primitives/button/button.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Negative CSS gap/padding handling missing in VBox component [packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts] — deferred, pre-existing
- [x] [Review][Defer] Race condition between TextInput local model and external contract updates [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — deferred, pre-existing

## Dev Agent Guardrails

### Technical Requirements
- **Command:** `origo <verb> [<noun>] [options]`
- **Library:** MUST use Commander.js.
- **Robustness:** Gracefully handle existing directories or permission denied errors.
- **Error Shape:** ALL errors MUST follow `{ code: string, message: string, context?: object }`.
- **Output:** JSON for machine consumers; colored human-readable for interactive terminals.
- **Environment:** Target Node.js >= 22.0.0.

### Architecture Compliance
- **Epic 6:** Developer CLI (@origo/cli) - FR-DX-003.
- **AD-8:** All authoring surfaces MUST produce BADL only.
- **Package Location:** `packages/cli/`.
- **Nx Tags:** Must include appropriate scope tags for boundary enforcement.
- **Template Reuse:** MUST reuse templates from 5.5.5.

### File Structure & Testing Requirements
- **Entry:** `packages/cli/package.json` with `bin` entry for `origo`.
- **Command:** `packages/cli/src/commands/new.ts`.
- **Tests:** `*.spec.ts` MUST be co-located alongside `*.ts` in the same directory (NO `__tests__/` folders).
- **Coverage:** 100% test coverage required.
- **Validation:** Verify generated `origo.json` payload content for security standards in tests.

## Project Context Reference
- **Project**: origo-design
- **Epic**: Epic 6 - Developer CLI (@origo/cli)
- **Previous Learnings (5.5.5):** Secure templates exist. Use them.


## Dev Agent Record

### Completion Notes
- Scaffolded @origo/cli workspace structure (previously completed/verified).
- Integrated commander.js properly for argument parsing and the `origo new` command in `src/main.ts` and `src/commands/new.ts`.
- Implemented file system logic in `src/lib/scaffolding.ts` to generate directories and read from local JSON templates.
- Renamed `.template` files to `.json` and updated imports to use monorepo standard imports.
- Wrote 100% covered unit tests for `newCommand` and `scaffoldProject` logic using Jest and mocking `fs`.

### File List
- [MODIFY] `packages/cli/src/main.ts`
- [NEW] `packages/cli/src/commands/new.ts`
- [NEW] `packages/cli/src/commands/new.spec.ts`
- [NEW] `packages/cli/src/lib/scaffolding.ts`
- [NEW] `packages/cli/src/lib/scaffolding.spec.ts`
- [MODIFY] `packages/cli/src/templates/index.ts`
- [MODIFY] `packages/cli/src/templates/origo.json.template` -> `origo.json`
- [MODIFY] `packages/cli/src/templates/entity.json.template` -> `entity.json`
- [MODIFY] `packages/cli/src/templates/extension.json.template` -> `extension.json`

### Change Log
- Initial implementation of the `origo new` command for project scaffolding (Date: 2026-08-24)
