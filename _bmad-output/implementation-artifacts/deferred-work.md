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
