# Story 5.1: AST Traversal and Dynamic Instantiation

## Status
ready-for-dev

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

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created.
