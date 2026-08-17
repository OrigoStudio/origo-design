---
baseline_commit: 54e34b7f0a6180e730b1c77f8134874fe3d44750
---
# Story 5.2: Experience Adapter Interface

## Status
review

## Story Foundation
**User Story:**
As a UI Developer,
I want a standard Experience Adapter contract for Angular,
So that UI primitives map cleanly and predictably to BADL node definitions.

**Acceptance Criteria:**
- **Given** an `InteractionContract` (e.g., standard-read, standard-write) from `@origo/core`
- **When** the rendering engine resolves it
- **Then** it maps to an Angular component implementing the standard `OrigoAdapter` interface
- **And** it acts as a stateless translator from the `InteractionContract` to the Angular medium-native interaction (FR-A-001)
- **And** strict runtime type coercion and validation are applied at the adapter boundary before props are passed down.

## Tasks/Subtasks
- [x] Define `InteractionContract` in `@origo/core/src/types/ast.ts`
- [x] Ensure `InteractionContract` is exported from `@origo/core/src/index.ts`
- [x] Move adapter to `packages/angular-renderer/src/adapters/web/adapter.ts` and define `OrigoAdapter` with `InteractionContract`
- [x] Implement runtime type coercion utilities in `adapter.ts`
- [x] Update `OrigoRendererComponent` (`renderer.component.ts`) to use new adapter path and map `ASTNode` to `InteractionContract`
- [x] Export `OrigoAdapter` from `@origo/angular-renderer` package
- [x] Add unit tests for runtime validation inside `adapter.spec.ts`

## Developer Context & Guardrails

### Technical Requirements
- Define the `OrigoAdapter` interface/type contract in `@origo/angular-renderer`.
- The interface must enforce that components accept an `InteractionContract` mapping rather than a generic BADL node.
- Implement strict runtime type coercion and validation at the adapter boundary, ensuring primitives only receive valid, coerced properties.
- Ensure the interface acts as a stateless function mapping `(InteractionContract) -> MediumInteraction` (per AD-15).

### Architecture Compliance
- **AD-1 & P1-AD-1 (Layered Hexagonal Paradigm):** The renderer depends on `@origo/core`, but not vice versa. Angular components must be `standalone: true` and `zoneless-compatible` (no `zone.js` peer dependency).
- **AD-4 (Renderer Isolation):** The Angular adapter logic must not contain core BADL evaluation or other framework specifics.
- **AD-15 (Experience Adapter Is a Stateless Interaction Translator):** The adapter must be a stateless function or component that translates an `InteractionContract` (from core) into the medium-native interaction (Angular). It must hold no session state.
- **P1-AD-5 (Composition Only):** No renderer component implementing `OrigoAdapter` may extend another component; they must use composition only.

### Library/Framework Requirements
- **Angular 18:** Ensure the interface is designed around Angular 18 features, such as Signals for inputs (`input()`, `input.required()`) if it's meant to be implemented by Angular standalone components.

### File Structure Requirements
- Create/update interface definition at `packages/angular-renderer/src/adapters/web/adapter.ts` (strictly mandated by Phase 1 Architecture Spine).
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
Ensure all JSON imports follow the standard ESM/TypeScript standard to avoid TypeScript compiler OOMs. Do not bypass the `CorePermission` constraints. Follow the established `origo-` component prefix convention (e.g., `origo-button`) explicitly when building primitives with this adapter.

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created.

### Review Findings
- [x] [Review][Decision] Missing Schema Association Architecture — coerceContractProps expects a property schema dictionary, but there is no registry, decorator, or component metadata mechanism for primitive components or the renderer to associate node types with their expected property schemas.
- [x] [Review][Decision] Aggressive and Lossy Property Stripping — coerceContractProps silently discards all properties not explicitly declared in the schema (e.g., ria-* tags, dynamic attributes), which breaks accessibility and passthrough behavior.
- [x] [Review][Patch] Unwired Validation and Type Coercion Pipeline [packages/angular-renderer/src/adapters/web/adapter.ts]
- [x] [Review][Patch] Silent Data Corruption in Numeric Coercion [packages/angular-renderer/src/adapters/web/adapter.ts]
- [x] [Review][Patch] Inadequate Non-Primitive and Array Handling [packages/angular-renderer/src/adapters/web/adapter.ts]
- [x] [Review][Patch] Inconsistent Boolean Coercion [packages/angular-renderer/src/adapters/web/adapter.ts]
- [x] [Review][Patch] Lack of Interface Verification in Tests [packages/angular-renderer/src/lib/renderer.component.spec.ts]
- [x] [Review][Patch] Unchecked Component Input Mutation [packages/angular-renderer/src/lib/renderer.component.ts]
- [x] [Review][Patch] Omission of \children\ in translated \InteractionContract\ [packages/angular-renderer/src/adapters/web/adapter.ts]
- [x] [Review][Patch] Test Suite Hang / Timeout in Chunk Rendering Test [packages/angular-renderer/src/lib/renderer.component.spec.ts]
- [x] [Review][Patch] Untracked Core Implementation Files [packages/angular-renderer/src/adapters/web/adapter.ts]
- [x] [Review][Defer] Architectural Bleed in AST Module [packages/core/src/types/ast.ts] — deferred, pre-existing
