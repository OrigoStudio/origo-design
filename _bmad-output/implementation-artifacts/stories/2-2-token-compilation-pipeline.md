---
status: done
baseline_commit: 20b8f44fa7ed14fcdb9fc746428d49c53baf0ca5
story_id: 2.2
story_key: 2-2-token-compilation-pipeline
epic: 2
---

# Story 2.2: Token Compilation Pipeline

Status: done

## Story

As a UX Engineer,
I want a pipeline that compiles JSON tokens into CSS variables,
So that the web renderer can consume them natively without heavy JS parsing.

## Acceptance Criteria

1. **Given** a valid token JSON schema from Story 2.1
   **When** the build pipeline executes (via Nx executor)
   **Then** it generates CSS files mapping semantic tokens to base variables (e.g., `--origo-color-surface: var(--origo-color-gray-100)`)
   **And** it applies aggressive minification and tree-shaking to the CSS payload to optimize for minimal network transfer.

## Dev Agent Guardrails

### Technical Requirements
- Create a script or executor in `@origo/design-tokens` that processes the JSON schema created in Story 2.1.
- Output CSS variables strictly mapped from the token definitions.
- Ensure the pipeline can be invoked via standard Nx targets (e.g., `nx build design-tokens`).

### Architecture Compliance
- **AD-2**: The pipeline must exist within the `packages/design-tokens` package boundary.
- **FR-THEME-002, 003**: The generated CSS is the primary contract for theming. Ensure zero-code theming overrides are possible using standard CSS variable overriding.
- **NFR-PERF-005**: Must generate minimal, minified output.

### Library/Framework Requirements
- Consider standard tooling like Style Dictionary if applicable, or a custom script in TypeScript if simpler for the current JSON format.
- Do not introduce heavy runtime dependencies for what should be a build-time process.

### File Structure Requirements
- `packages/design-tokens/src/build.ts` (or similar build script)
- `packages/design-tokens/project.json` (update build target)
- `packages/design-tokens/dist/` (output directory for the generated `.css`)

### Testing Requirements
- Unit tests verifying that valid token JSON transforms into the expected CSS output.
- Nx `build` target must complete successfully and produce minified CSS.

## Tasks/Subtasks

- [x] Task 1: Setup build script to parse JSON tokens
  - [x] Implement `packages/design-tokens/src/build.ts`
  - [x] Read token files (base and semantic)
- [x] Task 2: Implement CSS Variable Generation
  - [x] Generate CSS for base tokens
  - [x] Generate CSS for semantic tokens mapping to base tokens
- [x] Task 3: Minification and Nx integration
  - [x] Configure `project.json` build target to run the build script
  - [x] Ensure output is minified for minimal network transfer
- [x] Task 4: Testing and Validation
  - [x] Write unit tests to verify JSON transforms correctly to CSS
  - [x] Verify `nx build design-tokens` completes successfully

## Previous Story Intelligence
### Learnings from Story 2.1:
- `packages/design-tokens` package was initialized but had some config and main entrypoint issues (e.g., `package.json` pointing to `.js` instead of `.ts` or dist). Ensure build outputs correctly map to the package exports.
- A strict separation between base/primitive values and semantic/role-based values was established.

## Project Context Reference
- Epic 2 focuses on the Design Token Pipeline (@origo/design-tokens).
- This pipeline will unblock Epic 5 (Renderer), which depends heavily on consuming these CSS variables natively.

## Change Log
- Created `build.ts` containing `parseTokens` and `generateCssVariables`.
- Created `compile.ts` execution script.
- Configured `project.json` to execute `compile-css` as part of `build`.
- Updated `package.json` to map correct exports (`./index.js` and `./tokens.css`).
- Added tests in `build.spec.ts`.

## File List
- packages/design-tokens/src/build.ts
- packages/design-tokens/src/build.spec.ts
- packages/design-tokens/src/compile.ts
- packages/design-tokens/src/index.ts
- packages/design-tokens/package.json
- packages/design-tokens/project.json

## Dev Agent Record
### Debug Log
- N/A

### Completion Notes
- The compilation pipeline runs via `nx build design-tokens` and successfully generates minified CSS mapping semantic variables to base ones.
- CSS is appropriately output to `dist/packages/design-tokens/tokens.css` and mapped in `package.json` exports.

---
*Completion Note: Ultimate context engine analysis completed - comprehensive developer guide created*
