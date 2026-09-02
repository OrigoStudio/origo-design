# Central Test Registry

This directory contains the central test case registry, maintaining a mapping of all critical test cases across the monorepo to ensure continuous traceability and prevent regression gaps.

## Files

- `test-registry.yaml`: The source-of-truth ledger tracking test cases, affected stories, and pass/fail/skip states by release.
- `validate-registry.ts`: The validation script ensuring structural correctness of the ledger.

## Schema Rules

When adding to `test-registry.yaml`, ensure compliance:

1. `id` must be unique and kebab-case.
2. `description` must be non-empty string.
3. `package` must be an allowed package (e.g. `@origo/cli`).
4. `spec_file` must use POSIX slashes (`/`) and exist relative to the repo root.
5. `type` must be `unit`, `e2e`, `integration`, or `perf`.
6. `affected_stories` must be a list containing at least one valid story key matching `/^(\d+(\.\d+)?(-\d+)*-[\w-]+|retro-[\w.-]+)$/`.
7. `last_result` starts as `unknown` for new tests.
8. `results` (optional) is a map of release version tags to the status (`pass`, `fail`, `skipped`).

### Example Entry

```yaml
- id: core-validator-ast
  description: 'Verifies the AST Validation Engine'
  package: '@origo/core'
  spec_file: packages/core/src/validator/ast-validator.spec.ts
  type: unit
  affected_stories:
    - 3-4-ast-validation-engine
  last_result: unknown
  results: {}
```

## Validation

When you introduce new test suites for features, append a new entry to the registry and ensure the validation runs cleanly:

```bash
npm run validate:registry
```

## Release Process

During the release cycle, the `last_result` and `results` maps are updated to track suite stability across product versions.
