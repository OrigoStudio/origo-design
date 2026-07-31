---
status: done
baseline_commit: a582b08a240cf57a682cf17d2bd2671fcc042258
story_id: 1.2
story_key: 1-2-ci-pipeline-git-hooks-nfr-git-001
epic: 1
---

# Story 1.2: CI Pipeline & Git Hooks (NFR-GIT-001)

## 1. Story Foundation

**User Story Statement:**
As a Platform Engineer,
I want a CI pipeline and git hooks configured,
So that code boundaries, formatting, and stable ID rules are enforced automatically.

**Acceptance Criteria:**
**Given** a developer is committing code or opening a PR
**When** the Git hooks or GitHub Actions pipeline runs
**Then** linting, unit tests, and build targets execute
**And** standard formatting (Prettier) is enforced to ensure Git diff stability (NFR-GIT-001)
**And** branch protection rules are explicitly required on the main branch to prevent bypassing CI checks.

## 2. Developer Context

**Technical Requirements:**

- Implement GitHub Actions workflow for PRs and pushes to main.
- Implement Git hooks (e.g., using Husky) to run `lint` and `format` before commits.
- Git diff stability is crucial (NFR-GIT-001); ensure Prettier enforces formatting.
- Ensure the Nx workspace commands (`nx affected -t lint test build`) are integrated into the CI pipeline.

**Architecture Compliance:**

- **AD-2 (Nx Boundary Enforcement):** Ensure the CI pipeline strictly fails if linting fails, guaranteeing that package boundary rules are respected.
- **P1-AD-3 (Schema/Type Divergence):** The CI must include a step to verify that generated TypeScript types match the JSON Schemas, failing if they diverge. (This can be a placeholder script or check if the generator isn't fully built yet, but the mechanism must exist).

**Library/Framework Requirements:**

- **Git Hooks:** `husky` and `lint-staged`.
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`).
- **Scripts:** Add necessary run scripts to `package.json` for easy CI execution.

**File Structure Requirements:**
The workspace should include:

```text
origo-design/
  .github/
    workflows/
      ci.yml
  .husky/
    pre-commit
  package.json (updated with husky/lint-staged config)
```

**Testing Requirements:**

- Test the pre-commit hook locally to ensure it blocks poorly formatted code.
- Provide documentation in the story completion on how to set up the GitHub branch protection rules (since this is an infrastructure setting, not code).

## 3. Previous Story Intelligence

**Dev Notes from 1.1:**

- `npx` and `npm install` operations were hanging extensively on the Windows environment during workspace bootstrap.
- **Actionable Insight:** When installing Husky or other dev dependencies, be aware that standard npm installs might be slow or hang. You may need to manually update `package.json` and run the install, or use specific flags. When configuring the Husky init script, ensure it is compatible with the environment.
- ESLint and Prettier base configurations were already established and hardened in 1.1. Rely on the existing `.prettierrc` and `eslint.config.js`.

## 4. Project Context Reference

- **Project Name:** origo-design
- **Architecture SPINE:** Layered Hexagonal with Versioned Language Contract

## 5. Tasks/Subtasks

- [x] 1. Set up Git Hooks with Husky and lint-staged
  - [x] Update `package.json` with `husky` and `lint-staged` dependencies.
  - [x] Configure `lint-staged` to run `prettier --write` and `eslint --fix` on staged files.
  - [x] Initialize husky and create `pre-commit` hook to run `lint-staged`.
- [x] 2. Create GitHub Actions CI Pipeline
  - [x] Create `.github/workflows/ci.yml`.
  - [x] Configure triggers (push to main, pull request).
  - [x] Add steps: Checkout, Setup Node, Install Dependencies.
  - [x] Add steps: Nx build, lint, and test affected projects.
  - [x] Add step: Verify TypeScript types match JSON schemas (placeholder script).
- [x] 3. Document Branch Protection Rules
  - [x] Create a documentation file or add instructions on configuring main branch protection.

### Review Findings

- [x] [Review][Decision→Done] Pre-commit Linter Bypasses Nx Executor — `lint-staged` updated to use `nx lint --fix`.
- [x] [Review][Patch→Done] Missing Executable Permissions on Git Hook [.husky/pre-commit:1] — executable bit set.
- [x] [Review][Patch→Done] Legacy Husky v8 Header in v9 Setup [.husky/pre-commit:2] — header simplified.
- [x] [Review][Defer] Lockfile Native Binary Resolution [package-lock.json] — deferred, pre-existing
- [x] [Review][Defer] Schema Verification Script Placeholder [.github/workflows/ci.yml:34] — deferred, placeholder until generator built
- [x] [Review][Defer→Done] Path Resolution in GUI Clients [.husky/pre-commit:1] — resolved
- [x] [Review][Defer→Done] Legacy Peer Deps in CI vs No-Audit [.github/workflows/ci.yml:30] — resolved

## 6. File List

- `package.json` (modified)
- `.husky/pre-commit` (new)
- `.github/workflows/ci.yml` (new)
- `BRANCH-PROTECTION.md` (new)

## 7. Change Log

- Added `husky` and `lint-staged` to enforce Git diff stability locally.
- Created GitHub Actions CI pipeline mapping Nx affected boundaries for PR checks.
- Documented manual configuration steps for GitHub branch protection.

## 8. Dev Agent Record

**Debug Log:**

- `npm install` on Windows sometimes hangs. Configured the package dependencies manually and ran `npm install` with `--no-audit` and `--legacy-peer-deps` successfully.

**Completion Notes:**

- ✅ All story ACs are met and tasks are completed.
- Git hooks and CI pipelines are now configured following the strict architecture guidelines.

## 9. Final Status Update

- Ultimate context engine analysis completed - comprehensive developer guide created.
