---
title: AST JSON Validator
description: Documentation for the Canonical AST Validation Engine used in the Origo monorepo.
---

# AST Validation Engine

The AST Validation Engine (`@origo/core`) is a critical component in the Origo monorepo responsible for performing deep semantic validation on the Canonical AST before downstream code generation takes place.

## Why is it needed?

When defining architectures and designs, the generated JSON (Canonical AST) represents the fundamental structures, models, and relationships of the application. However, manual updates or generator glitches can introduce invalid states.

The AST Validator prevents corrupted definitions from propagating into code generation by enforcing strict structural and semantic rules.

## Validation Checks

The `validateAST` function performs multiple passes over the AST to ensure correctness:

1. **Global Uniqueness (Pass 1)**
   It scans all domains and entities to ensure that every `entity.id` is globally unique across the entire AST. Duplicate IDs will throw a validation error.

2. **Reference Integrity (Pass 2)**
   It checks every field that acts as a relationship (`references` property) and guarantees that the referenced entity ID actually exists within the parsed AST.

3. **Circular Dependency Detection (DFS)**
   It constructs an adjacency list of entity dependencies and runs a Depth-First Search (DFS) algorithm to detect cycles. If an entity references another entity that eventually references back to the original entity, a `Circular dependency detected` error is thrown indicating the exact loop path.

## Usage

The validator is heavily utilized in CI pipelines and before invoking downstream builders. It is typically imported from `@origo/core`:

```typescript
import { validateAST } from '@origo/core';
import { CanonicalAST } from '@origo/core';

const myAst: CanonicalAST = {
  domains: [
    /* ... */
  ],
};

try {
  validateAST(myAst);
  console.log('AST is semantically valid and ready for code generation!');
} catch (error) {
  console.error('AST Validation failed:', error.message);
}
```

## Related Standards

The validator works hand-in-hand with the [JSON Import Standard](/architecture-decisions/001-json-import-standard/) which ensures that massive AST JSON fixtures do not cause TypeScript compiler Out-Of-Memory (OOM) crashes during development and linting.
