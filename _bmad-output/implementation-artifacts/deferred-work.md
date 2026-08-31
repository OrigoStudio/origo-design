## ~~Deferred from: code review (2026-07-30) 1-1-nx-workspace-bootstrap.md~~

- ~~Specify correct app name in generic 'start' script [package.json]~~ — **resolved 2026-07-31**: Updated to `nx serve origo-design`.

## ~~Deferred from: code review (2026-07-30) 1-2-ci-pipeline-git-hooks-nfr-git-001.md~~

- ~~Path Resolution in GUI Clients [.husky/pre-commit:1]~~ — **resolved 2026-07-31**: Added `#!/usr/bin/env sh` + Husky init line so the hook sources the correct PATH in GUI Git clients.
- ~~Legacy Peer Deps in CI vs No-Audit [.github/workflows/ci.yml:30]~~ — **resolved 2026-07-31**: Replaced `--legacy-peer-deps` with `--no-audit`; `npm ci` reads the lockfile verbatim and never needs legacy peer dep resolution.

## Deferred from: code review of 2-2-token-compilation-pipeline.md (2026-08-06)

- Unconstrained Token Group Metadata [packages/design-tokens/src/schemas/base-tokens.schema.json:1] — `base-tokens.schema.json` permits any arbitrary string for `$type` inside a `tokenGroup`, creating schema loopholes.

## Deferred from: code review of 2-3-zero-code-theme-overrides.md (2026-08-08)

- Missing `theme.json` fetch mechanism — spec says "Create a mechanism to fetch, parse, and apply a `theme.json` file at runtime." Only parse+inject are implemented; no network/file fetch wrapper exists. Can be addressed in story 2.4 or as a follow-on fetch utility in `@origo/design-tokens/runtime`.

## Deferred from: code review of 2-4-token-resolution-consumption-contract.md (2026-08-08)

- Static Inflexible Theme Provider API [packages/angular-renderer/src/lib/theme.provider.ts:25] — `provideOrigoTheme` only accepts a static `themeUrl` string argument. Deferred as a dynamic string injection via DI tokens or factory is an enhancement over current requirements.

## Deferred from: code review of 2-5-1-versioning-management-strategy.md (2026-08-08)

- GitHub release creation lacks authentication config [nx.json:85] — deferred, pre-existing
- Unenforced CRLF/LF line-ending inconsistencies [epics.md] — deferred, pre-existing
- Package Name Mismatch for angular-renderer [packages/angular-renderer/package.json] — deferred, pre-existing

## Deferred from: code review of 2-5-2-design-tokens-use-case-documentation.md (2026-08-09)

- Concurrent `loadAndInjectTheme` calls produce undefined behavior (API tech debt) — deferred, pre-existing

## Deferred from: code review of 3-2-domain-entity-schema-parser.md (2026-08-10)

- Circular test uses custom circularRef instead of BADL schema reference [packages/core/src/validator/index.spec.ts] — deferred, pre-existing
- index.ts exports auto-generated files (committed to git) [packages/core/src/index.ts] — deferred, pre-existing
- generate-types.ts uses __dirname which fails under ESM [packages/core/scripts/generate-types.ts] — deferred, pre-existing
- domain.schema.json has redundant "domain" property [packages/core/src/schemas/domain.schema.json] — deferred, pre-existing
- entity.schema.json fields array allows zero items [packages/core/src/schemas/entity.schema.json] — deferred, pre-existing
- Field id empty string validates [packages/core/src/schemas/entity.schema.json] — deferred, pre-existing

## Deferred from: code review of 3-3-canonical-ast-serialization.md (2026-08-10)

- undefined Values Silently Dropped [packages/core/src/validator/serializer.ts:7] — deferred, pre-existing

## Deferred from: code review (3-4-ast-validation-engine) (2026-08-10)
- Lack of domain ID uniqueness checks across Canonical AST domains [packages/core/src/validator/ast-validator.ts:7]
- Deeply nested chain stack overflow [packages/core/src/validator/ast-validator.ts:38]

## Deferred from: code review of 3-5-1-establish-semantic-versioning.md (2026-08-11)
- Release workflow pushes directly to main without branch protection awareness [.github/workflows/release.yml:1-38] — pre-existing repo setup dependency

## Deferred from: code review of 3-5-2-define-monorepo-wide-json-import-standard.md (2026-08-12)
- `astro.config.mjs` docs site title is still `'My Docs'` and GitHub URL is default. — pre-existing
- ADR recommendation for `fs.readFileSync` has no helper/utility. — out of scope for this spec
- `docs/astro.config.mjs` Guides sidebar uses hardcoded links instead of autogenerate. — out of scope
- `sprint-status.yaml` no `story_file` field. — framework issue

## Deferred from: code review of 3-5-3-defensive-ast-traversal.md (2026-08-12)
- Inefficient `JSON.stringify` in Array Sorting [packages/core/src/validator/serializer.ts:63]
- Vague Error Typing with Generic `string` Type [packages/core/src/types/validation.ts:5]
- No Structural Schema Validation [packages/core/src/validator/ast-validator.ts:40]

## Deferred from: code review (4-2-contracts-and-implementations.md)
- Incomplete schema constraints for contract field types
- Overly restrictive top-level schema requirement
- Unoptimized quadratic lookup in contract field validation
- Unchecked cross-domain contract references

## Deferred from: code review of 4-4-extensibility-and-plugin-schema.md (2026-08-13)
- Unchecked Mutability in AST Parameter: \ alidateAST\ mutates input properties directly (e.g., \perm.role.trim()\), violating functional purity.

## Deferred from: code review of 4-5-behavior-validation-suite.md (2026-08-14)
- Explicit edge cases found in ast-validator.ts (e.g. Domain id missing, null elements) — deferred, pre-existing known edge cases

## Deferred from: code review of 4-6-formal-extension-manifest-lifecycle-fr-ext-008-to-013.md (2026-08-14)

- Manifest range validation without runtime version verification — deferred, pre-existing
- No rollback or failure recovery in loadAll — deferred, pre-existing
- Missing teardown and deactivation lifecycle — deferred, pre-existing
- Unhandled lifecycle rejection state poisoning — deferred, pre-existing
- Capability management lacks namespace, unregistration, and inspection — deferred, pre-existing
- Missing introspection and query APIs — deferred, pre-existing

## Deferred from: code review of 4-7-extension-security-sandboxing-fr-ext-014.md (2026-08-14)
- No Permission Revocation Mechanisms
- Untyped Magic Strings for Permissions
- No Batch Permission Granting API
- No Capability-to-Permission Mapping or Integration

## Deferred from: code review of 5-1-ast-traversal-and-dynamic-instantiation (2026-08-14)
- Suboptimal Yielding Mechanism: Yielding via setTimeout(resolve, 0) relies on timer macrotasks.
- Hardcoded Traversal Chunk Size: CHUNK_SIZE = 50 is hardcoded.
- Incomplete Test Coverage for Failure Modes: renderer.component.spec.ts only covers happy-path scenarios.
- Loose and Disconnected AST Core Types: ASTNode interface operates disconnected from CanonicalAST.

## Deferred from: code review (5-2-experience-adapter-interface.md)
- Architectural Bleed in AST Module: InteractionContract is placed in packages/core/src/types/ast.ts, coupling interaction translation semantics directly into the core AST syntax definitions instead of isolating them.

## Deferred from: code review of 5-3-core-primitive-implementation.md (2026-08-18)
- Missing <ng-content> fallback in VBoxComponent: Container only uses programmatic #vc insertion, breaking standard declarative usage.
- Fragile and naive deepClone implementation: deepClone risks stack overflow on circular references and corrupts instances.
- Superficial Playwright component accessibility coverage: Tests only verify static states, omitting disabled/focus states.
- Incomplete Recursive Schema Resolution for Nested Node Properties: prepareNode passes undefined schema for children, skipping validation.
- Unverified acceptance criteria FR-Rend-002 against Epic 3 fixture: No test validates rendering against the complex target page fixture.
- Permissive and silent error swallowing during coercion: Missing schema keys ignored, invalid objects become empty, etc.
- NaN undefined deletion regression: NaN now skipped entirely instead of setting undefined explicitly.

## Deferred from: code review of 5.5-3-resolve-recursive-schema-resolution-tech-debt.md (2026-08-22)

- Pre-existing missing string check and non-null assertion edge cases in ExtensionManager [packages/core/src/extension-api/extension-manager.ts:130] — `grantPermission` and `checkPermission` do not validate non-empty permission string, and `registerExtension` updates granted permissions before manifest validation finishes.

## Deferred from: code review of 5.5-5-define-secure-by-default-boilerplate-templates (2026-08-23)

- New `security` key added to config file callers didn't expect [packages/cli/src/commands/init.ts:20-24] — pre-existing config parser issue, not caused by template itself.

## Deferred from: code review of story 6-1-cli-initialization-and-scaffolding (2026-08-25)

- Missing strict-mode filter for aria-/data- attributes in Web Adapter [packages/angular-renderer/src/adapters/web/adapter.ts] — strict callers get unexpected passthrough of aria-/data- attributes.
- Unchecked Infinity handling in Web Adapter numeric coercion [packages/angular-renderer/src/adapters/web/adapter.ts] — Infinity passes Number() without isFinite guard, causing potential render issues.
- Unhandled whitespace trimming in Web Adapter boolean coercion (' 0 ', ' false ') [packages/angular-renderer/src/adapters/web/adapter.ts] — string ' false ' with whitespace evaluates to true instead of false.
- Null value coerced to empty object in Web Adapter object branch [packages/angular-renderer/src/adapters/web/adapter.ts] — typeof null === 'object' coerces null to {} silently.
- Non-plain object types (Date/Map/Set) stripped during deepClone in Web Adapter [packages/angular-renderer/src/adapters/web/adapter.ts] — non-plain objects cloned as empty plain object {}.
- Null value rendered as string 'null' in TextInput component effect [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — null value rendered as literal string 'null'.
- Numeric input '0' converted to empty string in TextInput component [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — sanitized value '0' falsy check wipes valid user input '0'.
- Event target null-check missing in TextInput onInput handler [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — event.target null dereference risk.
- Button component missing ID guard before capability dispatch [packages/angular-renderer/src/components/primitives/button/button.component.ts] — dispatchCapability called with empty/undefined nodeId.
- Potential circular reference error in ExperienceAdapterService debug logging [packages/angular-renderer/src/adapters/web/experience-adapter.service.ts] — console.debug with circular payload throws in some environments.
- Duplicate emission risk on Button component action output [packages/angular-renderer/src/components/primitives/button/button.component.ts] — onClick emits action.emit() and dispatches to adapter concurrently.
- Negative CSS gap/padding handling missing in VBox component [packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts] — negative gap or padding produces invalid layout.
- Race condition between TextInput local model and external contract updates [packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts] — contract effect untracked write can overwrite in-progress user input.


## Deferred from: code review of 6-2-local-schema-validation.md (2026-08-25)

- Directory exists but contains zero .json files [packages/cli/src/lib/validation.ts:325] — (confusing UX but not a bug)

## Deferred from: code review of retro-6-e2e-npm-verification.md (2026-08-31)

- Artificial Multi-Tarball Installation Masks Real Dependency Resolution [tools/scripts/verify-npm-pack.sh]
- Incomplete CLI Command Surface Testing (e.g. `origo init`) [tools/scripts/verify-npm-pack.sh]
- Redundant and Uncached Builds in CI Pipelines [.github/workflows/ci.yml]
