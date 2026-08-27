# Story retro-6: e2e-npm-verification

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer releasing packages,
I want a CI step that verifies the built `@origo/cli` npm package tarball using `npm pack`,
so that I can ensure the published packages actually work, contain all required files, and do not fail upon execution.

## Acceptance Criteria

1. **Local E2E Script**: Create a reusable shell script (e.g., `tools/scripts/verify-npm-pack.sh`) that automates the verification process locally and in CI.
2. **Build and Pack**: The script must build the `@origo/cli` package (via `npx nx build cli`) and generate a tarball using `npm pack` in the dist directory.
3. **Isolated Testing**: The script must create an isolated temporary directory (e.g., `mktemp -d`), initialize it (`npm init -y`), and install the generated `.tgz` file.
4. **Execution Validation**: The script must execute specific `@origo/cli` commands (e.g., scaffolding and validation commands) against the installed package to verify it works end-to-end.
5. **Teardown**: The temporary test directory must be cleanly removed upon script completion or failure using a `trap`.
6. **CI Integration**: The script must be integrated into `.github/workflows/ci.yml` (for PRs) and `.github/workflows/release.yml` (blocking release if failed).
7. **OS Matrix Context**: If possible, the CI step should account for or be tested against path traversal issues (Ubuntu/Windows paths) since the CLI has recent remediations.

## Tasks / Subtasks

- [ ] Task 1: Create `tools/scripts/verify-npm-pack.sh` (AC: 1, 2, 3, 5)
  - [ ] Subtask 1.1: Add Nx build and `npm pack` steps. Dynamically extract the generated `.tgz` filename.
  - [ ] Subtask 1.2: Set up isolated test directory (`mktemp -d`), run `npm init -y`, and `npm install` the `.tgz`.
  - [ ] Subtask 1.3: Add cleanup trap for teardown.
- [ ] Task 2: Implement Execution Validation (AC: 4)
  - [ ] Subtask 2.1: Add actual CLI commands to the script (e.g., `npx @origo/cli generate ...`) to ensure the package runs without missing dependencies or path errors.
- [ ] Task 3: Integrate into CI Workflows (AC: 6, 7)
  - [ ] Subtask 3.1: Add the verification step to `.github/workflows/ci.yml`.
  - [ ] Subtask 3.2: Add the verification step to `.github/workflows/release.yml` before the publish step.

## Dev Notes

- **Nx Integration**: You must run the Nx build target (`npx nx build cli`) before packing. The `npm pack` command should target the built output directory (usually `dist/packages/cli`).
- **Dynamic Filename**: `npm pack` outputs the filename of the generated tarball to stdout. Capture this to dynamically target the correct `.tgz` version for installation.
- **Workflow Locations**: Modify `.github/workflows/ci.yml` and `.github/workflows/release.yml` directly. No assumptions needed—we are using GitHub Actions.
- **Path Traversal Reminder**: Keep cross-platform path handling in mind. The CLI recently fixed path traversal bugs. Testing this via the packed tarball ensures regressions aren't packaged.

### Project Structure Notes

- **Scripts Directory**: Place the new script in `tools/scripts/verify-npm-pack.sh`. Make sure to make it executable (`chmod +x`).

### References

- Cite all technical details with source paths and sections: [Source: Sprint Status Action Item retro-6-e2e-npm-verification]

## Dev Agent Record

### Agent Model Used



### Debug Log References

### Completion Notes List

### File List
