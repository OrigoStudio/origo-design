---
title: 'ADR-002: CLI Template Generation Strategy'
description: 'Decision record for the zero-config and ejectable CLI templates pattern to prevent architectural drift.'
---

# ADR-002: CLI Template Generation Strategy (Zero-Config + Eject)

**Status:** Accepted
**Date:** 2026-08-24
**Authors:** Charlie, Alina, Winston, Patel

## Context and Problem Statement

For Epic 6 (Developer CLI), we need to implement scaffolding and code generation capabilities (`origo generate entity`).
Initially, there was a concern regarding architectural drift: if the CLI hardcodes string-based templates to generate BADL metadata and code, these templates might diverge from the strict AST requirements validated by the core compiler (Epic 3).
If a developer relies on the CLI and it produces invalid schema due to drift, it creates immediate developer friction.

However, forcing the CLI to serialize an actual AST into boilerplate code results in code that is machine-generated, lacks helpful comments, and is hard for humans to read or modify.
We needed a solution that prevents drift while prioritizing developer experience (DX).

## Decision

We have adopted a **Tiered Template Strategy (Zero-Config + Eject)**:

1. **Embedded Internal Templates (Zero-Config by Default):**
   The `@origo/cli` package will ship with internal, string-based templates (e.g., EJS or Handlebars).
   To prevent architectural drift, these templates will be treated as core internal code and rigorously tested in our CI pipeline against the Epic 3 AST validator. This ensures they always generate valid syntax. The end-user does absolutely nothing to use them—it just works out of the box.

2. **Opt-in Extensibility (`--eject`):**
   For the 10% of use cases where a consumer needs to customize the boilerplate (e.g., adding company headers, custom import aliases), the CLI will provide an `--eject` flag.
   Running `origo generate --eject` copies the internal templates into a local workspace directory (`.origo/templates`).
   If the CLI detects local templates, it prioritizes them over the internal ones.

## Consequences

### Positive

- **Minimum Friction:** 90% of developers get instant, reliable scaffolding without managing template files.
- **High Flexibility:** Power users get full control over boilerplate via the `.origo/templates` folder.
- **Architectural Integrity:** The default templates are CI-validated against the AST, preventing drift. If a developer breaks an ejected template, the core validator will catch the error at compile time.

### Negative

- We must maintain the CI pipeline that validates the internal string templates against the AST.
- If a developer ejects a template and the Origo core AST schema undergoes a major version change later, their ejected template might become outdated and require manual migration.
