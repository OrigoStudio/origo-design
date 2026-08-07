## ~~Deferred from: code review (2026-07-30) 1-1-nx-workspace-bootstrap.md~~

- ~~Specify correct app name in generic 'start' script [package.json]~~ — **resolved 2026-07-31**: Updated to `nx serve origo-design`.

## ~~Deferred from: code review (2026-07-30) 1-2-ci-pipeline-git-hooks-nfr-git-001.md~~

- ~~Path Resolution in GUI Clients [.husky/pre-commit:1]~~ — **resolved 2026-07-31**: Added `#!/usr/bin/env sh` + Husky init line so the hook sources the correct PATH in GUI Git clients.
- ~~Legacy Peer Deps in CI vs No-Audit [.github/workflows/ci.yml:30]~~ — **resolved 2026-07-31**: Replaced `--legacy-peer-deps` with `--no-audit`; `npm ci` reads the lockfile verbatim and never needs legacy peer dep resolution.

## Deferred from: code review of 2-2-token-compilation-pipeline.md (2026-08-06)

- Unconstrained Token Group Metadata [packages/design-tokens/src/schemas/base-tokens.schema.json:1] — `base-tokens.schema.json` permits any arbitrary string for `$type` inside a `tokenGroup`, creating schema loopholes.
