---
baseline_commit: 2a0938f6deb684427bd4f7e007f7f15424197b4c
completion_commit: pending
---

# Story 9.2: Data Presentation Primitives (Batch 2)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a UI Developer,
I want a set of data presentation primitives (e.g., DataGrid, List, Card),
so that I can display collections of entities dynamically.

## Acceptance Criteria

1. **Given** the Origo Angular renderer,
   **When** the AST contains `DataGrid`, `List`, or `Card` nodes,
   **Then** they map to the correct `OrigoAdapter` components using the Component Registry pattern (FR-Rend-005) — no hardcoded switches.
2. **And** DataGrid and List handle pagination, sorting, and row-level actions driven by BADL state via `WebExperienceAdapterService.updateState()`.
3. **And** List and DataGrid components mandate DOM virtualization (Angular CDK `CdkVirtualScrollViewport`) or a hard `maxItems` cap to prevent DOM thrashing on large datasets.
4. **And** all components comply with WCAG 2.1 AA standards enforced by axe-core in CI (NFR-ACC-001), with ARIA context (`aria-label`, `aria-describedby`, `role`) propagated from AST props down to native DOM elements.
5. **And** all components render correctly in RTL orientation via logical CSS properties (NFR-I18N-001).
6. **And** this story implementation explicitly acknowledges `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` per the Definition of Done — Batch 2 primitives do not host iframes or sandboxed content; note as N/A in completion notes.

## Tasks / Subtasks

- [x] Task 1: Study existing Batch 1 primitives to internalize the established patterns. (prerequisite)
  - [x] Read `select.component.ts` — canonical collection-iteration + sanitization pattern.
  - [x] Read `vbox.component.ts` — canonical container/layout pattern (`viewChild` + `ContainerComponent`).
  - [x] Read `hbox.component.ts` — logical CSS property pattern for RTL.
  - [x] Read `adapter.ts` — `OrigoAdapter<TProps>`, `ContainerComponent`, `coerceContractProps`.
  - [x] Read `renderer.tokens.ts` and `primitives.provider.ts` — how `RENDERER_REGISTRY` and `provideOrigo9Primitives()` work.
- [x] Task 2: Implement `DataGridComponent`. (AC: 1, 2, 3, 4, 5)
  - [x] Props: `columns: Array<{key: string; label: string; sortable?: boolean}>`, `rows: Array<Record<string, unknown>>`, `pageSize?: number`, `currentPage?: number`, `totalRows?: number`, `disabled?: boolean`, `aria-label?: string`.
  - [x] Enforce `maxItems` hard cap or CDK virtual scroll — never render an unbounded list.
  - [x] Sorting: on header click, call `experienceAdapter.updateState(id, 'sortKey', key)` and `updateState(id, 'sortDir', 'asc'|'desc')`. Guard disabled.
  - [x] Pagination: on page change, call `experienceAdapter.updateState(id, 'currentPage', page)`.
  - [x] Row actions: on row-level action, call `experienceAdapter.updateState(id, 'selectedRow', rowId)`. Sanitize string values before dispatch.
  - [x] Bind `[attr.data-testid]="contract().id"` and `[attr.aria-label]="computedAriaLabel()"` on host.
- [x] Task 3: Implement `ListComponent`. (AC: 1, 2, 3, 4, 5)
  - [x] Props: `items: Array<Record<string, unknown>>`, `maxItems?: number`, `disabled?: boolean`, `aria-label?: string`.
  - [x] Enforce `maxItems` cap — slice items at render time if over limit.
  - [x] On item selection: call `experienceAdapter.updateState(id, 'selectedItem', item.id)`.
  - [x] Bind `role="list"` on host; each item renders as `role="listitem"`.
- [x] Task 4: Implement `CardComponent`. (AC: 1, 4, 5)
  - [x] Props: `title?: string`, `subtitle?: string`, `imageUrl?: string`, `aria-label?: string`, `aria-describedby?: string`.
  - [x] Pure display — no `updateState()` calls. Implements `OrigoAdapter<CardProps>` only (not `ContainerComponent`).
  - [x] Sanitize `imageUrl` via `DomSanitizer.sanitize(SecurityContext.URL, imageUrl)`.
- [x] Task 5: Register all components in `RENDERER_REGISTRY`. (AC: 1)
  - [x] Open `packages/angular-renderer/src/lib/primitives.provider.ts` — the existing `provideOrigo9Primitives()` function.
  - [x] Add to the existing factory (DO NOT create a new provider — it will silently replace all Batch 1 entries):
    ```typescript
    m.set('DataGrid', DataGridComponent);
    m.set('List', ListComponent);
    m.set('Card', CardComponent);
    ```
  - [x] Add the three new imports at the top of `primitives.provider.ts`.
- [x] Task 6: Export new components from public API. (prerequisite for consumers)
  - [x] Append to `packages/angular-renderer/src/index.ts` (DO NOT remove existing exports):
    ```typescript
    export * from './components/primitives/data-grid/data-grid.component';
    export * from './components/primitives/list/list.component';
    export * from './components/primitives/card/card.component';
    ```
- [ ] Task 7: Write Jest unit tests for each component. (AC: 4)
  - [ ] Use `provideZonelessChangeDetection()` in TestBed (NOT `provideExperimentalZonelessChangeDetection` — it was removed).
  - [ ] Mock `WebExperienceAdapterService.updateState` as `jest.fn()`.
  - [ ] Test: valid contract renders, null/undefined props do not crash, disabled blocks interaction, ARIA attrs bound, `maxItems` cap respected.
  - [ ] Do NOT add extra isolation guards — `test-setup.ts` already runs `afterEach` cleanup (retro-8-harden-test-isolation).
- [ ] Task 8: Add Playwright a11y tests for each new component. (AC: 4)
  - [ ] Append three `test()` blocks to `primitives.a11y.pw.ts` using `page.setContent()` + `AxeBuilder.analyze()`.
- [ ] Task 9: Update Central Test Registry. (DoD requirement)
  - [ ] Add entries to `tools/test-registry/test-registry.yaml` for all new spec files.
  - [ ] Fields required: `id`, `description`, `package: @origo/angular-renderer`, `spec_file`, `type: unit`, `affected_stories: [9-2-data-presentation-primitives-batch-2]`, `last_result: unknown`.
- [ ] Task 10: Verify the build pipeline.
  - [ ] `nx lint angular-renderer`
  - [ ] `nx test angular-renderer`
  - [ ] `nx build angular-renderer`

## Dev Notes

### Scope — What Must Be Built

This story adds **new primitive components** to the existing `packages/angular-renderer` package. **No new Nx packages are created.** All components live under:

```
packages/angular-renderer/src/components/primitives/
  data-grid/
    data-grid.component.ts | .html | .scss | .spec.ts
  list/
    list.component.ts | .html | .scss | .spec.ts
  card/
    card.component.ts | .html | .scss | .spec.ts
```

### Mandatory Files to Read Before Writing Code

Study these files before writing a single line:

1. [`select.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/select/select.component.ts) — canonical collection + sanitization pattern
2. [`vbox.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts) — canonical container/layout pattern
3. [`hbox.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts) — logical CSS props for RTL
4. [`adapter.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/adapters/web/adapter.ts) — `OrigoAdapter<TProps>`, `ContainerComponent`, `coerceContractProps`
5. [`primitives.provider.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/lib/primitives.provider.ts) — the `provideOrigo9Primitives()` factory to extend

### Mandatory Component Structure

Every component MUST follow this exact shape (from existing primitives):

```typescript
@Component({
  selector: 'origo-<name>',
  standalone: true,
  templateUrl: './<name>.component.html',
  styleUrls: ['./<name>.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,   // ALWAYS ShadowDom
  host: {
    '[class.origo-<name>]': 'true',
    '[attr.data-testid]': 'contract().id',       // AD-12 stable selector
  },
})
export class <Name>Component implements OrigoAdapter<<Name>Props> {
  static readonly contractSchema = { /* key: 'string'|'number'|'boolean'|'array'|'object' */ };
  static readonly strictContract = false;
  contract = input.required<InteractionContract<<Name>Props>>();
  // All reactive props: always computed() — NEVER getters or ngOnChanges
}
```

### Component Registry — Critical Warning

**NEVER create a new `Map` instance for `RENDERER_REGISTRY`.** The factory in `provideOrigo9Primitives()` in `primitives.provider.ts` receives the existing map via `deps: [RENDERER_REGISTRY]` and mutates it. Creating a second provider that passes a `new Map()` silently replaces all Batch 1 registrations (`TextInput`, `Button`, `VBox`, `Select`, `Checkbox`, etc.). Just add to the existing factory:

```typescript
// In primitives.provider.ts — EXTEND, do not replace:
m.set('DataGrid', DataGridComponent);
m.set('List', ListComponent);
m.set('Card', CardComponent);
```

### Design Token Consumption (AD-6 — Strict)

Use `--origo-*` CSS custom properties exclusively. No hardcoded hex, px, or radius literals.

> **ShadowDom note:** CSS custom properties (`--origo-*`) **DO** pierce ShadowDom (they are inherited). Standard CSS properties do NOT. This is why the token system works. Use `var(--origo-color-surface-background, #fff)` — always provide a fallback.

Established token namespace from Batch 1 (`select.component.scss`):
- Colors: `--origo-color-surface-background`, `--origo-color-text-primary`, `--origo-color-border-default`, `--origo-color-focus`
- Spacing: `--origo-spacing-container-padding`
- Typography: `--origo-typography-input-font-family`, `--origo-typography-input-font-size`
- Opacity: `--origo-opacity-disabled`
- Radius: `--origo-radius-sm`

### RTL Support (FR-L-003)

All layout/data components MUST use **logical CSS properties**:
- `padding-inline-start` / `padding-inline-end` (not `padding-left`)
- `margin-inline` (not `margin-left`/`right`)
- `text-align: start` (not `left`)

This ensures RTL auto-flip without any code changes.

### Input Sanitization

- String values from user interaction: `DomSanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || ''`
- URL values (e.g., `imageUrl`): `DomSanitizer.sanitize(SecurityContext.URL, url)`
- ARIA string props (not HTML): use `String(value)` coercion — do NOT HTML-sanitize (it strips valid text)

### Architecture Compliance

| Rule | Requirement |
|---|---|
| P1-AD-1 | `standalone: true`, Signals for all reactive state, zoneless-compatible |
| P1-AD-5 | No component class inheritance; composition via `@ContentChild`/`hostDirectives` only |
| P1-AD-6 | Every component must pass axe-core WCAG 2.1 AA in `primitives.a11y.pw.ts` |
| AD-2 | All files in `packages/angular-renderer`. No cross-package `src/` imports. |
| AD-6 | Zero hardcoded visual values in `.scss` files |
| AD-12 | `[attr.data-testid]="contract().id"` on all host elements |

### Testing Requirements

- **Test runner:** Jest + `jest-preset-angular`. **Do NOT introduce Vitest** (that is the `devtools` package runner).
- **Zoneless provider:** Use `provideZonelessChangeDetection()` — `provideExperimentalZonelessChangeDetection` was removed in this version of `@angular/core`.
- **Isolation:** `test-setup.ts` already provides `afterEach` isolation guards — do NOT add more.
- **Playwright a11y:** Add to `primitives.a11y.pw.ts` via `page.setContent()` + `AxeBuilder.analyze()`.

### Previous Story Intelligence

Learnings from **Story 9-1 (Form & Layout Primitives)** that directly apply:

- **`provideZonelessChangeDetection()`** not `provideExperimentalZonelessChangeDetection` — removed from Angular.
- **`FormFieldComponent` regression pattern:** `aria-live="polite"` was wrong — use `role="alert"` for errors.
- **`HBoxComponent` regression:** physical padding (`padding-left`) instead of logical CSS (`padding-inline-start`) — watch for this in grid/list layouts.
- **Disabled guard is mandatory:** Every event handler MUST check `if (this.computedDisabled()) return;` first — omitting this was a Batch 1 review finding.
- **`computedOptions` null guard:** Filter out items where `value` or `label` is null/undefined before rendering — apply same pattern to DataGrid `rows` and List `items`.
- **`renderer.tokens.ts` eager imports risk:** Do not import all component classes at the top of `renderer.tokens.ts` — it creates circular dependency risk. Import only in `primitives.provider.ts`.
- **Playwright ShadowDom note (deferred):** Tests use raw HTML fixtures that bypass Shadow DOM — pre-existing pattern, acceptable for now.
- **No `JSON.stringify` on contract props** — cyclic object risk. Use `computed()` signal access only.

### Git Intelligence

- **Current version:** `0.0.33` (released after Batch 1 merge). No manual version bumps — Nx release handles it.
- **Batch 1 file commit:** `576e23d feat(angular-renderer): implement form layout primitive components and tokens` — all Batch 1 patterns are in HEAD.
- **Provider file:** `primitives.provider.ts` is at HEAD and exports `provideOrigo9Primitives()` with 7 entries — extend it.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.2`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md`]
- [Source: `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`] — N/A for Batch 2 (no iframes or sandboxed content)
- [Source: `docs/definition-of-done.md`]
- [Source: `stories/9-1-form-layout-primitives-batch-1.md`] — Batch 1 patterns and learnings

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (Thinking)

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- Validated and enhanced via bmad-create-story checklist: critical issues C1–C4 and enhancements E1–E5 applied.
- ADR DoD: `adr-epic7-web-worker-csp.md` — Batch 2 primitives do not host iframes or sandboxed content (N/A).

### File List

- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts`
- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html`
- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.scss`
- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.spec.ts`
- `packages/angular-renderer/src/components/primitives/list/list.component.ts`
- `packages/angular-renderer/src/components/primitives/list/list.component.html`
- `packages/angular-renderer/src/components/primitives/list/list.component.scss`
- `packages/angular-renderer/src/components/primitives/list/list.component.spec.ts`
- `packages/angular-renderer/src/components/primitives/card/card.component.ts`
- `packages/angular-renderer/src/components/primitives/card/card.component.html`
- `packages/angular-renderer/src/components/primitives/card/card.component.scss`
- `packages/angular-renderer/src/components/primitives/card/card.component.spec.ts`
- `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts`
- `packages/angular-renderer/src/lib/primitives.provider.ts`
- `packages/angular-renderer/src/index.ts`
- `tools/test-registry/test-registry.yaml`

### Review Findings

- [x] [Review][Patch] DataGrid Pagination UI Requirements — Render pagination controls internally within the DataGrid component.
- [x] [Review][Patch] Invalid WAI-ARIA aria-sort Attribute Value [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html:7]
- [x] [Review][Patch] Sortable columns display active sort indicators simultaneously [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html:7]
- [x] [Review][Patch] Broken sort direction state management [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts:86]
- [x] [Review][Patch] Flawed DOM sanitization fallback negates XSS protection [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts:100]
- [x] [Review][Patch] Arbitrary silent data truncation (missing maxItems configurable cap) [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts:60]
- [x] [Review][Patch] Lack of keyboard navigation on interactive table rows, sort headers, and list items [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html:7]
- [x] [Review][Patch] Broken ARIA list semantics in ListComponent [packages/angular-renderer/src/components/primitives/list/list.component.html:1]
- [x] [Review][Patch] Missing aria-describedby Prop Propagation and semantic landmarks [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html:1]
- [x] [Review][Patch] Violations of Design Token Architecture (AD-6) [packages/angular-renderer/src/components/primitives/card/card.component.scss:1]
- [x] [Review][Patch] Silent event drops when row/item lacks an explicit id property [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html:15]
- [x] [Review][Patch] Angular @for blocks track by object reference [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html:14]
- [x] [Review][Patch] Inconsistent component registry naming conventions [packages/angular-renderer/src/lib/primitives.provider.ts:26]
- [x] [Review][Patch] CardComponent hardcodes alt="" and lacks heading semantics [packages/angular-renderer/src/components/primitives/card/card.component.html:3]
- [x] [Review][Patch] Sloppy story specification artifact with duplicate and uncompleted tasks [_bmad-output/implementation-artifacts/9-2-data-presentation-primitives-batch-2.md:37]
- [x] [Review][Patch] DataGrid onPageChange negative number guard [packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts:87]
- [x] [Review][Patch] List item title zero value check [packages/angular-renderer/src/components/primitives/list/list.component.html:9]
- [x] [Review][Defer] Playwright accessibility tests use raw HTML fixtures that bypass Shadow DOM [packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts:161] — deferred, pre-existing
