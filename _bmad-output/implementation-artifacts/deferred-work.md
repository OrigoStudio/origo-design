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
