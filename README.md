# origo-design

## Semantic Versioning and Commits

This repository enforces **Conventional Commits** for all changes. Our CI pipeline relies on these commit messages to automatically determine semantic version bumps for packages (like `@origo/core`) using `nx release`.

- `fix: ...` -> Patch release (e.g. 1.0.0 to 1.0.1)
- `feat: ...` -> Minor release (e.g. 1.0.0 to 1.1.0)
- `feat!: ...` or `BREAKING CHANGE: ...` -> Major release (e.g. 1.0.0 to 2.0.0)

A commit hook (`commitlint`) runs locally to verify that commit messages adhere to the `config-conventional` specification. If your commit is rejected, please format it properly.
