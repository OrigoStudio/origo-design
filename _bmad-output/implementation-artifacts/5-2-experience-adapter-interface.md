# Story 5.2: Experience Adapter Interface

## Status
ready-for-dev

## Story Foundation
**User Story:**
As a UI Developer,
I want a standard Experience Adapter contract for Angular,
So that UI primitives map cleanly and predictably to BADL node definitions.

**Acceptance Criteria:**
- **Given** a BADL node definition (e.g., `TextField`)
- **When** the rendering engine resolves it
- **Then** it maps to an Angular component implementing the standard `OrigoAdapter` interface
- **And** props, validation states, and metadata are correctly passed down (FR-A-001)
- **And** strict runtime type coercion and validation are applied at the adapter boundary before props are passed to the primitive.

## Developer Context & Guardrails

### Technical Requirements
- Define the `OrigoAdapter` interface/type contract in `@origo/angular-renderer`.
- The interface must enforce that components can accept inputs/props, validation states, and metadata mapping from a BADL node.
- Implement strict runtime type coercion and validation at the adapter boundary, ensuring primitives only receive valid, coerced properties.
- Ensure the interface acts as a stateless translator (per AD-15).

### Architecture Compliance
- **AD-1 (Layered Hexagonal Paradigm):** The renderer depends on `@origo/core`, but not vice versa.
- **AD-4 (Renderer Isolation):** The Angular adapter logic must not contain core BADL evaluation or other framework specifics.
- **AD-15 (Experience Adapter Is a Stateless Interaction Translator):** The adapter must be a stateless function or component that translates an `InteractionContract` (from core) into the medium-native interaction (Angular). It must hold no session state.

### Library/Framework Requirements
- **Angular 18:** Ensure the interface is designed around Angular 18 features, such as Signals for inputs (`input()`, `input.required()`) if it's meant to be implemented by Angular standalone components.

### File Structure Requirements
- Create/update interface definition in `packages/angular-renderer/src/lib/adapter.ts` (or similar standard location).
- Ensure the interface is properly exported from the package's public API in `packages/angular-renderer/src/index.ts`.

### Testing Requirements
- Unit tests must be provided for any type coercion and validation logic at the adapter boundary to ensure malicious or malformed data from the AST does not bypass constraints.
- Verify 100% test coverage for the new adapter contract validation logic.

### Previous Story Intelligence (From Story 5.1)
- **Angular Signals:** The previous story established the pattern of using `signal` and `computed` for state. The AST node is passed to dynamically created components via `componentRef.setInput('node', ...)`. The `OrigoAdapter` interface should cleanly support being targeted by this dynamic instantiation method.
- **Strict Separation:** The renderer must consume the Canonical AST only and not alter it.

### Git Intelligence Summary
- **Recent Work:** The team recently completed Epic 4 and began Angular renderer foundations (Signals patterns, test utilities).
- **Actionable Insight:** Ensure the adapter leverages the test utilities and signal patterns established in commit `d2adbed`.

## Project Context Reference
Ensure all JSON imports follow the standard ESM/TypeScript standard to avoid TypeScript compiler OOMs. Do not bypass the `CorePermission` constraints. Follow the established `origo-` component prefix convention.

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created.
