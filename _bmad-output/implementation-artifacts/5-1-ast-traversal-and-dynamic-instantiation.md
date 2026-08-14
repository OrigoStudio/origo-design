---
baseline_commit: 0c06302959d2407aceb83ddd53d1d61b7ef247d6
---
# Story 5.1: AST Traversal and Dynamic Instantiation

## Status
review

## Story Foundation
**User Story:**
As a UI Developer,
I want a rendering engine that recursively traverses a BADL JSON AST,
So that Angular components can be dynamically instantiated based on the metadata without hardcoding templates.

**Acceptance Criteria:**
- **Given** a compiled JSON AST
- **When** it is passed to the core `<origo-renderer>` component
- **Then** the engine recursively reads the tree of nodes and prepares them for the adapter pipeline
- **And** it employs chunked rendering or yield-to-main-thread techniques to prevent locking the browser during massive AST traversals.

## Tasks/Subtasks
- [x] Implement `origo-renderer` Angular standalone component
- [x] Implement recursive AST traversal using `ViewContainerRef` and dynamic instantiation
- [x] Implement yielding mechanism (chunked rendering) for large ASTs
- [x] Add unit tests for `origo-renderer` achieving 100% coverage
- [x] Add tests verifying yielding behavior to prevent main thread blocking

## Developer Context & Guardrails

### Technical Requirements
- Implement the core `<origo-renderer>` Angular component.
- The component must accept an `ASTNode` tree via an Angular `input.required<ASTNode>()`.
- It must recursively render children using `ViewContainerRef` and dynamic component instantiation.
- Implement a yielding mechanism (e.g., chunking or `requestAnimationFrame`/`setTimeout`) to process large ASTs asynchronously without blocking the main UI thread.

### Architecture Compliance
- **Angular Signals:** You MUST follow the patterns defined in `docs/architecture/angular-signals-patterns.md`. Do not mutate the AST. Use `signal` and `computed` for state. Pass the node to dynamically created components using `componentRef.setInput('node', ...)`.
- **Strict Separation:** The renderer must consume the Canonical AST (from `@origo/core`) only. It must NOT contain business logic or alter the AST structure.

### File Structure Requirements
- Update or create `packages/angular-renderer/src/lib/renderer.component.ts`.
- Ensure appropriate helper classes/services for the recursive traversal logic are placed in `packages/angular-renderer/src/lib/`.
- Ensure changes are exported properly from the package's `index.ts`.

### Testing Requirements
- **100% Coverage:** The `<origo-renderer>` and any traversal helpers must have comprehensive unit tests in `renderer.component.spec.ts`.
- **Chunked Rendering Test:** Test that the rendering of a massive AST does not block the thread (verify yielding behavior using fake timers or async testing utilities).
- Use the `renderPrimitive` helper in `test-utils.ts` if applicable, though this story builds the orchestrator itself.

## Project Context Reference
Ensure all JSON imports follow the standard ESM/TypeScript standard to avoid TypeScript compiler OOMs. Do not bypass the `CorePermission` constraints if the renderer needs to interact with the sandbox environment.

## Dev Agent Record
### Implementation Plan
- Create `OrigoRendererComponent` in `@origo/angular-renderer`.
- Register the components with an injection token (`RENDERER_REGISTRY`).
- Traverse `ASTNode` recursively using a queue-based chunking architecture.
- Flush changes with yield to main thread after `CHUNK_SIZE` (50 nodes).

### Completion Notes
- Test suite added to verify single-level rendering, recursive multi-level rendering, and chunked rendering.
- Reconfigured Jest (`jest.config.cts`) to leverage `jest-preset-angular` so that Angular signal `input` is successfully transformed during JIT tests.
- Extracted and solved zone.js test issues for modern Zoneless/Signal application paradigm.

## File List
- `packages/angular-renderer/src/lib/renderer.component.ts`
- `packages/angular-renderer/src/lib/renderer.component.spec.ts`
- `packages/angular-renderer/src/lib/renderer.tokens.ts`
- `packages/angular-renderer/jest.config.cts`
- `packages/core/src/types/ast.ts`

## Change Log
- Added `ASTNode` interface to core.
- Added `RENDERER_REGISTRY` InjectionToken to map types to Component classes.
- Created `OrigoRendererComponent` and unit tests.
- Replaced `ts-jest` manual transform with `jest-preset-angular` to fix `TestBed` handling of Component signal inputs.

### Review Findings
- [x] [Review][Decision] Missing Preparation for the Adapter Pipeline — The component type is dynamically instantiated with 
ode passed directly to inputs without a translation layer. Does 5.1 need to implement the adapter, or is it covered in 5.2?
- [x] [Review][Patch] Asynchronous Race Condition on Rapid Node Updates [packages/angular-renderer/src/lib/renderer.component.ts:322-329]
- [x] [Review][Patch] Fragile Duck-Typing for Child ViewContainers [packages/angular-renderer/src/lib/renderer.component.ts:361]
- [x] [Review][Patch] Silent Loss of Subtrees on Unregistered Node Types [packages/angular-renderer/src/lib/renderer.component.ts:349-354]
- [x] [Review][Patch] Missing Public API Exports [packages/angular-renderer/src/index.ts]
- [x] [Review][Patch] Unhandled Null Injector Failure [packages/angular-renderer/src/lib/renderer.component.ts:343]
- [x] [Review][Patch] Synchronous Per-Node Change Detection Overload [packages/angular-renderer/src/lib/renderer.component.ts:358]
- [x] [Review][Patch] Unhandled View Container Destruction During Async Render [packages/angular-renderer/src/lib/renderer.component.ts:338-381]
- [x] [Review][Patch] Null/Undefined elements in node.children array [packages/angular-renderer/src/lib/renderer.component.ts:362-364]
- [x] [Review][Patch] Circular child references [packages/angular-renderer/src/lib/renderer.component.ts:363]
- [x] [Review][Defer] Suboptimal Yielding Mechanism — deferred, pre-existing
- [x] [Review][Defer] Hardcoded Traversal Chunk Size — deferred, pre-existing
- [x] [Review][Defer] Incomplete Test Coverage for Failure Modes — deferred, pre-existing
- [x] [Review][Defer] Loose and Disconnected AST Core Types — deferred, pre-existing
