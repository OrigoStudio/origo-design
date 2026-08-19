---
baseline_commit: "de5f96e"
---
# Story 5.5: Reactive State & Event Binding

Status: ready-for-dev

## Story

As a UI Developer,
I want the renderer to wire up Angular Signals to BADL state,
So that user interactions correctly update the model and trigger actions.

## Acceptance Criteria

1. **Given** an Input and a Button primitive rendered from AST
2. **When** the user types in the input and clicks the button
3. **Then** the local state is reactively updated via Angular Signals
4. **And** the input is explicitly sanitized before state updates to prevent XSS attacks
5. **And** the corresponding BADL capability or action is dispatched to the core engine (FR-A-002, 003).

## Tasks / Subtasks

- [ ] Task 1: Wire up Angular Signals to reactive BADL state for Input primitive
  - [ ] Subtask 1.1: Update `text-input.component.ts` to connect internal `valueChange` to a reactive Signal store / BADL model state
  - [ ] Subtask 1.2: Implement input sanitization before state update to prevent XSS attacks
- [ ] Task 2: Dispatch BADL capability actions for Button primitive
  - [ ] Subtask 2.1: Update `button.component.ts` to dispatch BADL capability execution when clicked
- [ ] Task 3: Verify state and event binding in unit/e2e tests
  - [ ] Subtask 3.1: Add unit tests verifying reactive state updates in Input
  - [ ] Subtask 3.2: Add unit tests verifying capability dispatch in Button
  - [ ] Subtask 3.3: Verify XSS sanitization works effectively

## Dev Notes

### Technical Requirements
- **Angular 18 Standalone Components** (`standalone: true`).
- **Reactivity** MUST use Angular Signals (`signal()`, `computed()`, `effect()`) for component-local state.
- **Zoneless-compatible** implementation (no `zone.js` peer dependency).
- Input fields MUST be sanitized before state updates. Use Angular's `DomSanitizer` or equivalent secure approach.
- State updates and capability dispatches should follow the `OrigoAdapter` contracts to the core engine.

### Architecture Compliance
- **P1-AD-1:** Angular 18 Standalone Components + Signals. No RxJS except for Angular Router/HttpClient where no signal equivalent exists.
- **AD-4:** Renderer isolation. Components must not import from other renderers, only from `@origo/core`.
- Maintain CSS encapsulation from previous story `5.4` (`ViewEncapsulation.ShadowDom`).

### Library & Framework Requirements
- Angular 18.x
- Axe-core and Playwright for accessibility testing.

### File Structure Requirements
- Update files in `packages/angular-renderer/src/components/primitives/` (button, text-input).

### Testing Requirements
- Unit tests (`*.spec.ts`) co-located with component source.
- Unit tests MUST explicitly verify that signal state changes correctly.
- Test selectors must use `metadata_path`.
- Add explicit tests for XSS sanitization on text input.

### Project Structure Notes
- Existing files to modify: `button.component.ts`, `text-input.component.ts`, `button.component.spec.ts`, `text-input.component.spec.ts`.
- Ensure changes maintain the behavior introduced in story 5.4 where tokens are used for styles and `ViewEncapsulation.ShadowDom` is kept intact.

### References
- Architecture Spine AD-1: Layered Hexagonal paradigm
- Functional Requirements (FR-A-002, 003)
