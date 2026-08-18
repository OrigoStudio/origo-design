---
baseline_commit: bd2fdf25e06c0c8eb01b10ab14a2ea5e67e4f2a7
---
# Story 5.3: Core Primitive Implementation

## Status
ready-for-dev

## Story Foundation
**User Story:**
As a UI Developer,
I want a vertical slice of core primitives (Layout, Input, Action),
So that I can test the full end-to-end rendering flow against real UI elements.

**Acceptance Criteria:**
- **Given** the complex target page fixture from Epic 3
- **When** the renderer processes it
- **Then** it successfully renders at least one Layout container (e.g., `VBox`), one Input (e.g., `TextInput`), and one Action (e.g., `Button`) (FR-Rend-002).

## Tasks/Subtasks
- [x] Task 1: Fix `coerceContractProps` in `adapter.ts` to properly handle properties, schema associations, unmapped attributes, and data coercion (boolean, numeric, array) based on Story 5.2 review findings.
- [x] Task 2: Implement Layout Primitive (`VBox`) inside `packages/angular-renderer/src/components/primitives/vbox/`. Includes component, HTML, SCSS, and Spec.
- [x] Task 3: Implement Input Primitive (`TextInput`) inside `packages/angular-renderer/src/components/primitives/text-input/`. Includes component, HTML, SCSS, and Spec.
- [x] Task 4: Implement Action Primitive (`Button`) inside `packages/angular-renderer/src/components/primitives/button/`. Includes component, HTML, SCSS, and Spec.
- [x] Task 5: Export all primitives in `packages/angular-renderer/src/index.ts`.
- [x] Task 6: Add Playwright component tests for axe-core accessibility checks for each primitive.

## Developer Context & Guardrails

### Technical Requirements
- Implement 3 primitive Angular components: Layout (`VBox`), Input (`TextInput`), Action (`Button`).
- These primitives must implement the `OrigoAdapter` interface from `packages/angular-renderer/src/adapters/web/adapter.ts`.
- Ensure strict runtime type coercion and validation are applied at the adapter boundary before props are passed down, fixing edge cases identified in Story 5.2.
- The primitives must dynamically receive the AST nodes using the previously established Signal patterns.

### Architecture Compliance
- **P1-AD-1 (Angular 18 Standalone + Signals):** Primitives MUST be standalone Angular components (`standalone: true`). Component-local state must use Signals (`signal()`, `computed()`, `effect()`). Zoneless-compatible.
- **P1-AD-5 (Composition over Inheritance):** Primitives MUST NOT extend a base class. Extension uses Angular `@ContentChild/ng-content` slots or hostDirectives.
- **P1-AD-6 (Accessibility Enforcement in CI):** Every component MUST have a Playwright component test that runs axe-core against its rendered output.
- **Consistency Conventions:** 
  - Angular component selector prefix: `origo-` (e.g., `origo-vbox`, `origo-text-input`, `origo-button`).
  - Co-locate `.component.ts`, `.html`, `.scss`, and `.spec.ts` in the same directory.
  - Component Input grouping: `[appearance]`, `[behavior]`, `[validation]`, `[events]`, `[security]`, `[accessibility]`, `[animation]`, `[responsive]`, `[theme]`, `[data]`.

### File Structure Requirements
- Place new components in `packages/angular-renderer/src/components/primitives/`.
- Ensure all primitives are properly exported from the package's public API in `packages/angular-renderer/src/index.ts`.

### Testing Requirements
- Unit tests (`.spec.ts`) must be provided alongside each component implementation, achieving 100% test coverage for the validation logic.
- Playwright component tests for axe-core accessibility checks.

### Previous Story Intelligence (From Story 5.2)
- **Review Findings to Address:**
  - `coerceContractProps` expects a property schema dictionary, but there is no mechanism to associate node types with their expected property schemas. Implement this.
  - Aggressive and lossy property stripping in `coerceContractProps` discards unmapped attributes (like `aria-*` tags, dynamic attributes) which breaks accessibility and passthrough behavior. Address this.
  - Fix silent data corruption in numeric coercion and inconsistent boolean coercion.
  - Improve inadequate non-primitive and array handling.
  - Ensure component inputs are not directly mutated.
  - Add missing `children` to the translated `InteractionContract`.

### Git Intelligence Summary
- **Recent Work:** Angular renderer foundations (Signals patterns, test utilities) were laid down in recent commits.
- **Actionable Insight:** Ensure components leverage these test utilities and the signal patterns (e.g., `componentRef.setInput(...)` with Signals).

## Project Context Reference
- Ensure all JSON imports follow the standard ESM/TypeScript standard to avoid TypeScript compiler OOMs.
- Do not bypass the `CorePermission` constraints.
- Follow the established `origo-` component prefix convention.

---
**Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created.
