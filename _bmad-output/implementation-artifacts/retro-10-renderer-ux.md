---
baseline_commit: HEAD
---
# Story retro-10: renderer-ux

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want the Playground preview to render content dynamically based on which sidebar navigation item I select,
So that I see entity-specific data grids and forms for the active outcome rather than the same static fixed view regardless of navigation state.

## Acceptance Criteria

1. **Given** the Playground with a BADL schema that includes Entities with fields defined
   **When** I click the "Entities" sidebar navigation item
   **Then** the content area renders a DataGrid populated with rows from the BADL entities (not just fields from `entities[0]`).
2. **Given** the Playground with a BADL schema loaded
   **When** I click each navigation item in the sidebar (Home, Entities, Capabilities)
   **Then** the content area updates to show a distinct, relevant view for each outcome — navigation tabs are not broken or static.
3. **And** the fix does not introduce Angular Router — navigation is driven entirely by `WebExperienceAdapterService.getState()` and `updateState()` (no `provideRouter`, no `routerLink`).
4. **And** this story explicitly acknowledges `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` per the Definition of Done — changes to `preview-root.component.ts` do not affect iframe sandbox or Web Worker CSP constraints; note as N/A in completion notes.
5. **And** a test scenario for this fix is appended to `tools/test-registry/test-registry.yaml`.

## Tasks / Subtasks

- [ ] Task 1: Study existing code before changing anything.
  - [ ] Read `packages/playground/src/preview/preview-root.component.ts` (all 209 lines) — understand the existing `uiNode` computed signal and `activeOutcome` state flow.
  - [ ] Read `packages/playground/src/app/app.config.ts` — confirm no Angular Router is provided (no `provideRouter`). Do NOT add one.
  - [ ] Read `packages/angular-renderer/src/lib/primitives.provider.ts` — confirm `RENDERER_REGISTRY` is already fully correct. Do NOT modify this file.
- [ ] Task 2: Fix `uiNode` in `preview-root.component.ts` to render dynamic content per outcome.
  - [ ] At line 25, refactor the `uiNode = computed<ASTNode | null>()` to branch the returned content children based on `activeOutcome`:
    - `'home'` outcome → show overview Card + form section (current behavior preserved).
    - `'entities'` outcome → show a DataGrid with rows mapped from ALL entities in the domain (not just `entities[0]?.fields`). Columns: `[{key: 'name', label: 'Entity Name'}, {key: 'fieldCount', label: 'Fields'}]`. Rows: `domain.entities.map(e => ({ name: e.name, fieldCount: e.fields?.length ?? 0 }))`.
    - `'capabilities'` outcome → show a DataGrid or List from `domain.capabilities || []`. If no capabilities exist, render a Card with placeholder text (do not crash on empty array).
  - [ ] Retain the existing Sidebar, Breadcrumbs, and Tabs nodes unchanged — only the content children after Tabs change per outcome.
  - [ ] Guard all array accesses: `domain.entities || []`, `domain.capabilities || []` — never let a missing field crash the computed signal.
- [ ] Task 3: Verify Tabs still work after the refactor.
  - [ ] Confirm `activeTab` from `WebExperienceAdapterService.getState('tabs', 'activeTab')` is still read and passed into the Tabs node.
  - [ ] Tabs do not control page-level routing — they are a visual component receiving `activeTab` prop only.
- [ ] Task 4: DoD compliance — Central Test Registry.
  - [ ] Open `tools/test-registry/test-registry.yaml` and append entries using this exact YAML structure:
    ```yaml
    - id: playground-outcome-navigation
      description: "Playground preview renders distinct content per sidebar outcome (Home, Entities, Capabilities)"
      package: "@origo/playground"
      spec_file: "packages/playground/src/preview/preview-root.component.spec.ts"
      type: unit
      affected_stories: ["retro-10-renderer-ux"]
      last_result: unknown
    ```
- [ ] Task 5: Add/update unit tests in `packages/playground/src/preview/preview-root.component.spec.ts`.
  - [ ] Test: When `activeOutcome = 'entities'`, `uiNode()` contains a DataGrid node with rows from all entities.
  - [ ] Test: When `activeOutcome = 'capabilities'`, `uiNode()` contains a DataGrid/List or fallback Card.
  - [ ] Test: When `domain.capabilities` is undefined/empty, `uiNode()` does not throw.
  - [ ] Use `provideZonelessChangeDetection()` in TestBed (NOT `provideExperimentalZonelessChangeDetection` — removed).
  - [ ] Mock `WebExperienceAdapterService.getState` as `jest.fn()`.
- [ ] Task 6: Verify build pipeline.
  - [ ] `nx lint playground`
  - [ ] `nx test playground`
  - [ ] `nx build playground`

## Dev Notes

### Diagnosis — Root Cause

**DO NOT modify `@origo/angular-renderer` or `primitives.provider.ts`** — they are correct and complete. The `RENDERER_REGISTRY` in `packages/angular-renderer/src/lib/primitives.provider.ts` already maps all 25 primitives including DataGrid, Form, Sidebar, Tabs, etc.

The bug is entirely in **`packages/playground/src/preview/preview-root.component.ts`**:

1. **Static content regardless of navigation**: `activeOutcome` is read at line 33, but the returned `uiNode` always returns the same set of children (DataGrid showing `entities[0]?.fields`, Card, form section). The content area does not branch based on `activeOutcome`. When the user clicks "Entities" in the sidebar, nothing changes visually.

2. **DataGrid only shows fields from the first entity**: Line 31 reads `entities[0]?.fields || []` and maps those as grid rows. This makes the grid show field-level metadata (name/type/label), not a per-entity summary.

**There is no Angular Router in this application.** `app.config.ts` provides only:
```typescript
providers: [
  provideBrowserGlobalErrorListeners(),
  provideZonelessChangeDetection(),
  provideOrigo9Primitives(),
]
```
Navigation is purely signal-state driven via `WebExperienceAdapterService`.

### Key Files

| File | Action | Why |
|------|--------|-----|
| `packages/playground/src/preview/preview-root.component.ts` | **UPDATE** | Contains the buggy `uiNode` computed signal (lines 25–196) |
| `packages/playground/src/preview/preview-root.component.spec.ts` | **UPDATE** | Add outcome-branching tests |
| `tools/test-registry/test-registry.yaml` | **UPDATE** | DoD requirement |
| `packages/angular-renderer/src/lib/primitives.provider.ts` | **DO NOT TOUCH** | Already correct |
| `packages/playground/src/app/app.config.ts` | **DO NOT TOUCH** | Do not add Angular Router |

### WebExperienceAdapterService API (State Pattern)

```typescript
// Reading state (already in preview-root.component.ts):
const activeOutcome = (this.experience.getState('main-sidebar', 'activeOutcome') as string) || 'home';

// Writing state (done by Sidebar/Tabs components via their updateState() calls):
experienceAdapter.updateState('main-sidebar', 'activeOutcome', 'entities');
```
The `uiNode` computed signal already depends on `this.experience.getState(...)` — Angular Signals will automatically recompute when the service state changes. No manual subscription needed.

### Branching Pattern (Pseudocode)

```typescript
public uiNode = computed<ASTNode | null>(() => {
  // ...existing setup code (lines 26-35)...
  
  let contentChildren: ASTNode[];
  
  if (activeOutcome === 'entities') {
    contentChildren = [/* DataGrid of all entities */];
  } else if (activeOutcome === 'capabilities') {
    contentChildren = domain.capabilities?.length
      ? [/* DataGrid/List of capabilities */]
      : [/* fallback Card */];
  } else {
    contentChildren = [/* existing home content: Card + form section */];
  }
  
  return {
    // ...Sidebar, Breadcrumbs, Tabs unchanged...
    // Replace the children after Tabs with contentChildren
  };
});
```

### Previous Story Intelligence (retro-10-iframe-scroll)

The previous retro story (`retro-10-iframe-scroll`) confirmed the playground structure:
- Preview files live at `packages/playground/src/preview/`
- `preview-pane.component.scss` handles iframe container styling
- `preview-root.component.ts` is the Angular component rendered **inside** the iframe
- State is communicated into the iframe via `window.postMessage` with `type: 'RENDER_AST'`

### Architecture Compliance

- Angular 18 standalone components only (`standalone: true`).
- Signals for reactivity — the computed `uiNode` signal is the correct pattern; do not convert to `ngOnChanges` or subscriptions.
- Zoneless: use `provideZonelessChangeDetection()` in all TestBed setups.
- No `zone.js` peer dep.

### ADR Acknowledgment

`_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` — Changes are limited to `preview-root.component.ts` template/logic. No iframe CSP attributes are modified. Web Worker communication channel is unchanged. **N/A for this story.**

## Dev Agent Record

### Implementation Plan
### Completion Notes
## File List
## Change Log
