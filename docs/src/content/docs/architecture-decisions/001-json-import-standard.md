---
title: JSON Import Standard
description: Architectural Decision Record defining the standard for importing JSON files across the Origo monorepo.
---

# ADR 001: JSON Import Standard

- **Date:** 2026-08-12
- **Status:** Accepted
- **Author:** Origo Core Team

## Context

Within the Origo monorepo, many packages (such as `@origo/core`) need to read JSON schemas and fixtures for validation and testing purposes. Historically, differing TypeScript configurations resulted in errors like `TS2732: Cannot find module '...'` or required awkward workarounds when importing JSON files.

Furthermore, importing massive JSON fixtures directly as ECMAScript modules causes the TypeScript compiler to parse and retain the entire JSON object in memory as a type, which has frequently led to Out-Of-Memory (OOM) crashes in the build process (NFR-PREP-008).

## Decision

We have established the following monorepo-wide standards for importing JSON files:

1. **Compiler Configuration**: All projects must use `resolveJsonModule: true` and `esModuleInterop: true` in their TypeScript compiler options. This has been globally enforced via the root `tsconfig.base.json`.
2. **Safe Importing**: Small JSON files (e.g. configuration files, small localized schemas) may be imported directly using standard ES6 syntax: `import data from './data.json'`.
3. **Massive Fixture Restriction**: Importing massive JSON fixtures directly is strictly forbidden to prevent TypeScript compiler OOM crashes.
   - A custom ESLint rule `no-restricted-imports` is configured at the monorepo root to block the import of `**/*.fixture.json`, `**/*.mock.json`, `**/*.data.json`, `**/*.large.json`, and `**/seed.json` files.
   - For these files, developers must load the data at runtime using Node.js `fs.readFileSync` or stream parsing instead of the TypeScript import syntax.
   - **Exception handling:** If an `eslint-disable-next-line no-restricted-imports` override is necessary (e.g. for a very small mock file that happens to match the suffix), it must be accompanied by a comment explaining why the file is small enough to not trigger OOM issues.

## Consequences

- **Positive**: Consistent handling of JSON across the monorepo.
- **Positive**: Elimination of TS2732 build and linting errors for valid JSON imports.
- **Positive**: Protection against build-time OOM crashes due to the TypeScript compiler over-analyzing massive JSON test fixtures.
- **Negative**: Extra boilerplate (`fs.readFileSync` and `JSON.parse`) is required when loading large mock or fixture files in tests.
- **Negative**: Enabling `esModuleInterop: true` changes how default imports from CommonJS modules are synthesized across the monorepo. This may break existing packages that relied on `allowSyntheticDefaultImports: false` behavior.

## Compliance

This decision complies with the requirements defined in **FR-PREP-001**, **NFR-PREP-001**, and **NFR-PREP-008**.
