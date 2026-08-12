Invoke the mad-review-edge-case-hunter skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index 3a9034f..03fa508 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -71,7 +71,7 @@ development_status:
   3-4-ast-validation-engine: done
   epic-3-retrospective: done
   3-5-1-establish-semantic-versioning: done
-  3-5-2-define-monorepo-wide-json-import-standard: backlog
+  3-5-2-define-monorepo-wide-json-import-standard: review
   3-5-3-defensive-ast-traversal: backlog
   epic-4: backlog
   4-1-capabilities-schema-parsing: backlog
diff --git a/docs/astro.config.mjs b/docs/astro.config.mjs
index bbc3d7e..6906bab 100644
--- a/docs/astro.config.mjs
+++ b/docs/astro.config.mjs
@@ -22,8 +22,13 @@ export default defineConfig({
             { label: 'Example Guide', link: '/guides/example/' },
             { label: 'Design Tokens', link: '/guides/design-tokens/' },
             { label: 'Publishing & Versioning', link: '/guides/publishing/' },
+            { label: 'AST JSON Validation', link: '/guides/ast-validator/' },
           ],
         },
+        {
+          label: 'Architecture Decisions',
+          autogenerate: { directory: 'architecture-decisions' },
+        },
         {
           label: 'Reference',
           autogenerate: { directory: 'reference' },
diff --git a/eslint.config.js b/eslint.config.js
index c7d613f..b95f207 100644
--- a/eslint.config.js
+++ b/eslint.config.js
@@ -65,7 +65,19 @@ module.exports = [
   {
     files: ['**/*.ts', '**/*.tsx'],
     // Override or add rules here
-    rules: {},
+    rules: {
+      'no-restricted-imports': [
+        'error',
+        {
+          patterns: [
+            {
+              group: ['**/*.fixture.json', '**/*.mock.json'],
+              message: 'Importing massive JSON fixtures directly can cause TypeScript compiler OOM crashes (NFR-PREP-008). Use fs.readFile at runtime or stream parsing instead.'
+            }
+          ]
+        }
+      ]
+    },
   },
   {
     files: ['**/*.js', '**/*.jsx'],
diff --git a/packages/core/tsconfig.json b/packages/core/tsconfig.json
index 36201d1..ea98558 100644
--- a/packages/core/tsconfig.json
+++ b/packages/core/tsconfig.json
@@ -8,8 +8,7 @@
     "noImplicitOverride": true,
     "noImplicitReturns": true,
     "noFallthroughCasesInSwitch": true,
-    "noPropertyAccessFromIndexSignature": true,
-    "resolveJsonModule": true
+    "noPropertyAccessFromIndexSignature": true
   },
   "files": [],
   "include": [],
diff --git a/tsconfig.base.json b/tsconfig.base.json
index 2665d2b..d325853 100644
--- a/tsconfig.base.json
+++ b/tsconfig.base.json
@@ -14,6 +14,8 @@
     "types": ["node"],
     "skipLibCheck": true,
     "skipDefaultLibCheck": true,
+    "resolveJsonModule": true,
+    "esModuleInterop": true,
     "baseUrl": ".",
     "paths": {
       "@origo/design-tokens": ["./packages/design-tokens/src/index.ts"],
diff --git a/_bmad-output/implementation-artifacts/stories/3-5-2-define-monorepo-wide-json-import-standard.md b/_bmad-output/implementation-artifacts/stories/3-5-2-define-monorepo-wide-json-import-standard.md
new file mode 100644
index 0000000..753d0c5
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/stories/3-5-2-define-monorepo-wide-json-import-standard.md
@@ -0,0 +1,95 @@
+---
+epic: 3
+story: "5-2"
+title: Define Monorepo-Wide JSON Import Standard
+status: review
+baseline_commit: 5e7a25e74757edb1350ba72f31e077518bc79a56
+---
+
+# Story 3.5.2: Define Monorepo-Wide JSON Import Standard
+
+<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
+
+## Story Foundation
+
+**User Story:**
+As a Monorepo Developer,
+I want a standardized configuration for importing JSON files across all packages,
+So that CI pipelines do not fail with TypeScript TS2732 errors when core packages import schema fixtures.
+
+**Acceptance Criteria:**
+1. **Given** the Origo monorepo and Nx tooling
+   **When** a developer runs the `nx run core:build` or `core:lint` commands
+   **Then** the TypeScript configuration allows for `resolveJsonModule` standard imports natively (FR-PREP-001)
+   **And** the monorepo CI checks enforce this pattern without throwing type errors (NFR-PREP-001)
+   **And** ESLint rules or architectural guidelines are enforced to prevent directly importing massive JSON fixtures that would cause TypeScript compiler OOM crashes (NFR-PREP-008).
+
+**Business Context:**
+This is part of the Tech Debt & Retro Prep Chores (Epic 3) and must be completed to stabilize the build environment for the Origo design system, specifically prior to implementing complex AST validation logic which relies on JSON test fixtures.
+
+## Tasks / Subtasks
+- [x] Task 1: Update root and package-level `tsconfig.json` / `tsconfig.base.json` files to enable `resolveJsonModule` and `esModuleInterop` if not already present.
+- [x] Task 2: Validate `nx run @origo/core:build` and `@origo/core:lint` (or `core:build` / `core:lint` as defined in Nx) commands succeed when importing JSON files.
+- [x] Task 3: Add ESLint rules (e.g., using `no-restricted-imports` or a custom rule) or architectural guidelines to warn/prevent importing massive JSON files to prevent OOM errors.
+- [x] Task 4: Add an Architecture Decision Record (ADR) documenting the JSON import standard.
+
+## Dev Agent Guardrails
+
+### Technical Requirements
+- MUST configure TypeScript to natively allow importing JSON (`resolveJsonModule: true`).
+- MUST configure ESLint or provide CI-level tooling to restrict importing massive JSON files.
+- MUST create an ADR describing the standard for importing JSON.
+
+### Architecture Compliance
+- **FR-PREP-001**: Define monorepo-wide ESM/TypeScript JSON import standard and ADR.
+- **NFR-PREP-001**: Enforce JSON import pattern via monorepo-wide CI check.
+- **NFR-PREP-008**: JSON import standardization must include guidance or lint rules against directly importing massive JSON fixtures that cause TypeScript compiler OOM errors.
+
+### Library/Framework Requirements
+- TypeScript configuration (`tsconfig.json`, `tsconfig.base.json`)
+- ESLint configuration (`.eslintrc.json` or `eslint.config.js`)
+- Nx CLI (`nx run core:build`, `nx run core:lint`)
+
+### File Structure Requirements
+- `tsconfig.base.json` or package-level `tsconfig.json` for compiler options.
+- ESLint configs in the monorepo root or package level.
+- `docs/ADR` or similar folder for the Architecture Decision Record.
+
+### Testing Requirements
+- Ensure `nx run core:build` and `core:lint` execute successfully.
+- Verify ESLint successfully catches an import of a deliberately massive JSON file if the rule is enforced.
+
+## Previous Story Intelligence
+- Story 3.5.1 established semantic versioning for `@origo/core`. 
+- The repository uses `nx release` with `commitlint` and standard conventional commits.
+- This story continues addressing the technical debt and environment stabilization chores required before further feature work.
+
+## Git Intelligence Summary
+- Recent commits introduced `commitlint.config.js`, `.husky/commit-msg`, and updated `package.json` for versioning.
+- Changes should respect the established monorepo structure and not break the CI flow configured in `.github/workflows/`.
+
+## Latest Tech Information
+- TypeScript supports `resolveJsonModule` but generally requires `esModuleInterop` for seamless ESM compatibility when importing JSON.
+- For ESLint, there might be specific plugins like `eslint-plugin-import` or custom local rules needed to check file sizes or restrict JSON imports to specific directories/patterns. Alternatively, an architectural guideline might be sufficient if enforced via code review.
+
+## Project Context Reference
+- Strict Nx boundary enforcement: packages must version independently.
+- The monorepo heavily relies on JSON schemas (BADL schemas). Importing test fixtures for `core:build` and `core:lint` is fundamental to testing the AST validation engine.
+
+## Completion Notes
+Ultimate context engine analysis completed - comprehensive developer guide created.
+Tasks completed:
+- `tsconfig.base.json` updated with `resolveJsonModule: true` and `esModuleInterop: true`.
+- Removed redundant `resolveJsonModule` from `packages/core/tsconfig.json`.
+- Validated that `core:build` and `core:lint` execute successfully.
+- Added `@typescript-eslint/no-restricted-imports` (via base ESLint `no-restricted-imports`) to `eslint.config.js` restricting `**/*.fixture.json` and `**/*.mock.json`.
+- Created ADR 001 at `docs/src/content/docs/architecture-decisions/001-json-import-standard.md`.
+
+## File List
+- `tsconfig.base.json` (modified)
+- `packages/core/tsconfig.json` (modified)
+- `eslint.config.js` (modified)
+- `docs/src/content/docs/architecture-decisions/001-json-import-standard.md` (new)
+
+## Change Log
+- Defined Monorepo-Wide JSON Import Standard (Date: 2026-08-11)
diff --git a/docs/src/content/docs/architecture-decisions/001-json-import-standard.md b/docs/src/content/docs/architecture-decisions/001-json-import-standard.md
new file mode 100644
index 0000000..142325d
--- /dev/null
+++ b/docs/src/content/docs/architecture-decisions/001-json-import-standard.md
@@ -0,0 +1,33 @@
+---
+title: JSON Import Standard
+description: Architectural Decision Record defining the standard for importing JSON files across the Origo monorepo.
+---
+
+# ADR 001: JSON Import Standard
+
+## Context
+
+Within the Origo monorepo, many packages (such as `@origo/core`) need to read JSON schemas and fixtures for validation and testing purposes. Historically, differing TypeScript configurations resulted in errors like `TS2732: Cannot find module '...'` or required awkward workarounds when importing JSON files. 
+
+Furthermore, importing massive JSON fixtures directly as ECMAScript modules causes the TypeScript compiler to parse and retain the entire JSON object in memory as a type, which has frequently led to Out-Of-Memory (OOM) crashes in the build process (NFR-PREP-008).
+
+## Decision
+
+We have established the following monorepo-wide standards for importing JSON files:
+
+1. **Compiler Configuration**: All projects must use `resolveJsonModule: true` and `esModuleInterop: true` in their TypeScript compiler options. This has been globally enforced via the root `tsconfig.base.json`.
+2. **Safe Importing**: Small JSON files (e.g. configuration files, small localized schemas) may be imported directly using standard ES6 syntax: `import data from './data.json'`.
+3. **Massive Fixture Restriction**: Importing massive JSON fixtures directly is strictly forbidden to prevent TypeScript compiler OOM crashes. 
+   - A custom ESLint rule `no-restricted-imports` is configured at the monorepo root to block the import of `**/*.fixture.json` and `**/*.mock.json` files.
+   - For these files, developers must load the data at runtime using Node.js `fs.readFileSync` or stream parsing instead of the TypeScript import syntax.
+
+## Consequences
+
+- **Positive**: Consistent handling of JSON across the monorepo.
+- **Positive**: Elimination of TS2732 build and linting errors for valid JSON imports.
+- **Positive**: Protection against build-time OOM crashes due to the TypeScript compiler over-analyzing massive JSON test fixtures.
+- **Negative**: Extra boilerplate (`fs.readFileSync` and `JSON.parse`) is required when loading large mock or fixture files in tests.
+
+## Compliance
+
+This decision complies with the requirements defined in **FR-PREP-001**, **NFR-PREP-001**, and **NFR-PREP-008**.
diff --git a/docs/src/content/docs/guides/ast-validator.md b/docs/src/content/docs/guides/ast-validator.md
new file mode 100644
index 0000000..edf3253
--- /dev/null
+++ b/docs/src/content/docs/guides/ast-validator.md
@@ -0,0 +1,53 @@
+---
+title: AST JSON Validator
+description: Documentation for the Canonical AST Validation Engine used in the Origo monorepo.
+---
+
+# AST Validation Engine
+
+The AST Validation Engine (`@origo/core`) is a critical component in the Origo monorepo responsible for performing deep semantic validation on the Canonical AST before downstream code generation takes place.
+
+## Why is it needed?
+
+When defining architectures and designs, the generated JSON (Canonical AST) represents the fundamental structures, models, and relationships of the application. However, manual updates or generator glitches can introduce invalid states.
+
+The AST Validator prevents corrupted definitions from propagating into code generation by enforcing strict structural and semantic rules.
+
+## Validation Checks
+
+The `validateAST` function performs multiple passes over the AST to ensure correctness:
+
+1. **Global Uniqueness (Pass 1)**
+   It scans all domains and entities to ensure that every `entity.id` is globally unique across the entire AST. Duplicate IDs will throw a validation error.
+
+2. **Reference Integrity (Pass 2)**
+   It checks every field that acts as a relationship (`references` property) and guarantees that the referenced entity ID actually exists within the parsed AST.
+
+3. **Circular Dependency Detection (DFS)**
+   It constructs an adjacency list of entity dependencies and runs a Depth-First Search (DFS) algorithm to detect cycles. If an entity references another entity that eventually references back to the original entity, a `Circular dependency detected` error is thrown indicating the exact loop path.
+
+## Usage
+
+The validator is heavily utilized in CI pipelines and before invoking downstream builders. It is typically imported from `@origo/core`:
+
+```typescript
+import { validateAST } from '@origo/core/validator/ast-validator';
+import { CanonicalAST } from '@origo/core/types/ast';
+
+const myAst: CanonicalAST = {
+  domains: [
+    /* ... */
+  ]
+};
+
+try {
+  validateAST(myAst);
+  console.log("AST is semantically valid and ready for code generation!");
+} catch (error) {
+  console.error("AST Validation failed:", error.message);
+}
+```
+
+## Related Standards
+
+The validator works hand-in-hand with the [JSON Import Standard](/architecture-decisions/001-json-import-standard/) which ensures that massive AST JSON fixtures do not cause TypeScript compiler Out-Of-Memory (OOM) crashes during development and linting.

