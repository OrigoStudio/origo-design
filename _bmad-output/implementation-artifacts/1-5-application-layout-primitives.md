---
story_id: "1.5"
story_key: 1-5-application-layout-primitives
baseline_commit: 87f3aef
---

# Story 1.5: Application Layout Primitives

Status: ready-for-dev

## Story

As a developer,
I want to use layout primitives with built-in responsive breakpoints,
So that I can structure pages without writing custom CSS.

## Acceptance Criteria

1. **Given** a responsive Origo environment **When** I configure or utilize the layout primitives (`Container`, `Grid`, `Stack`) **Then** the layout must adapt its direction, columns, or spacing automatically via CSS variables crossing token breakpoints (`--origo-breakpoint-*`).
2. **Given** a component supporting elevation (`Card`) **When** rendered **Then** it must render with consistent elevation mapped to semantic tokens (`var(--origo-shadow-sm)`, `var(--origo-shadow-md)`, `var(--origo-shadow-lg)`) respecting Light/Dark themes, with zero hardcoded HEX, RGB, or fallback literals in stylesheets (ADR: AD-6).
3. **Given** an Angular SSR context **When** the components initialize **Then** they must be strictly SSR-compatible, with zero direct references to DOM globals (`window`, `document`) during initialization without `isPlatformBrowser` guards.
4. **Given** a dynamic BADL AST rendering lifecycle **When** child nodes exist under a layout primitive (`Container`, `Grid`, `Stack`, `Card`) **Then** each component must implement `ContainerComponent`, expose `vc = viewChild.required('vc', { read: ViewContainerRef })`, and render `<ng-container #vc></ng-container>` so `renderer.component.ts` can recursively instantiate AST children (ADR: P1-AD-1, P1-AD-5). In addition, `<ng-content>` must be provided for direct template projection.
5. **Given** any layout primitive **When** configured from a JSON metadata payload **Then** it must instantiate cleanly using Angular 18 Standalone + Signals (no NgModules) and expose standard metadata hooks (`permissions`, `rules`, `metadata`, `aria-label`, `aria-describedby`).
6. **Given** a `Stack` or `Grid` component **When** configured with layout properties **Then** `Stack` must apply Flexbox layout (`direction`, `gap`, `align`, `justify`, `wrap`) and `Grid` must apply CSS Grid layout (`columns`, `gap`, `responsive`, `align`, `justify`) driven strictly by design tokens and CSS variables.
7. **Given** a `Divider` component **When** rendered **Then** it must support `orientation` ('horizontal' | 'vertical'), `variant` ('solid' | 'dashed' | 'dotted'), optional centered `content`, and provide accessible semantics with `role="separator"` and `aria-orientation` (ADR: P1-AD-6).
8. **Given** a `Card` component **When** rendered **Then** it must preserve existing metadata inputs (`title`, `subtitle`, `imageUrl`, `imageAlt`, sanitization), support `elevation`, `variant`, `clickable`, and `hoverable`, and if `clickable: true`, provide `tabindex="0"`, `role="article"`, and emit click events on keyboard activation (`Enter`, `Space`).
9. **Given** bidirectional layout requirements **When** layout primitives are rendered **Then** they must use CSS logical properties (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`) to support native RTL layouts without physical directional overrides.
10. **Given** the Definition of Done **When** the story is completed **Then** all new primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`, exported from `packages/angular-renderer/src/index.ts`, and test suites must be registered in `tools/test-registry/test-registry.yaml`.

## ⚠️ Critical: Existing Code — Read Before Writing Anything

### NEW COMPONENTS TO CREATE
- `ContainerComponent` -> `packages/angular-renderer/src/components/primitives/container/` (files: `container.component.ts`, `container.component.html`, `container.component.scss`, `container.component.spec.ts`) -> Registry key: `'Container'`
- `GridComponent` -> `packages/angular-renderer/src/components/primitives/grid/` (files: `grid.component.ts`, `grid.component.html`, `grid.component.scss`, `grid.component.spec.ts`) -> Registry key: `'Grid'`
- `StackComponent` -> `packages/angular-renderer/src/components/primitives/stack/` (files: `stack.component.ts`, `stack.component.html`, `stack.component.scss`, `stack.component.spec.ts`) -> Registry key: `'Stack'`
- `DividerComponent` -> `packages/angular-renderer/src/components/primitives/divider/` (files: `divider.component.ts`, `divider.component.html`, `divider.component.scss`, `divider.component.spec.ts`) -> Registry key: `'Divider'`

### EXISTING COMPONENTS / FILES TO UPDATE (DO NOT RE-CREATE FROM SCRATCH)
- `packages/angular-renderer/src/components/primitives/card/card.component.ts`:
  - **Current State:** Implements `OrigoAdapter<CardProps>`, renders title, subtitle, and sanitized image in Shadow DOM.
  - **What Must Be Preserved:** Existing props (`title`, `subtitle`, `imageUrl`, `imageAlt`, `aria-label`, `aria-describedby`), URL sanitization via `DomSanitizer`, and RTL compliance.
  - **What Changes:** Implement `ContainerComponent` interface and expose `vc = viewChild.required('vc', { read: ViewContainerRef })`. Add `elevation` ('none' | 'sm' | 'md' | 'lg'), `variant`, `clickable`, and `hoverable` props.
- `packages/angular-renderer/src/components/primitives/card/card.component.html`:
  - Add `<ng-container #vc></ng-container>` and `<ng-content></ng-content>` inside `.origo-card-content` for child and content projection.
- `packages/angular-renderer/src/components/primitives/card/card.component.scss`:
  - Purge hardcoded fallback literals (`#ccc`, `#fff`, `#333`, `4px`, `16px`, `8px`, `14px`) to strictly adhere to AD-6.
  - Add elevation shadow classes mapping to `var(--origo-shadow-sm)`, `var(--origo-shadow-md)`, `var(--origo-shadow-lg)`.
- `packages/angular-renderer/src/components/primitives/card/card.component.spec.ts`:
  - Preserve all existing tests; add unit tests for `elevation`, `clickable` keyboard handlers, and `ContainerComponent` child container ref.
- `packages/angular-renderer/src/lib/primitives.provider.ts`:
  - Register `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent` in `provideOrigo9Primitives()`. (`Card` is already registered).
- `packages/angular-renderer/src/index.ts`:
  - Export `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent`.
- `tools/test-registry/test-registry.yaml`:
  - Register unit test cases for `Container`, `Grid`, `Stack`, `Divider`, and updated `Card`.

## Tasks / Subtasks

- [ ] **CREATE `ContainerComponent`** at `packages/angular-renderer/src/components/primitives/container/` (AC: #1, #3, #4, #5, #9)
  - [ ] Define `ContainerProps`: `fluid?: boolean; maxWidth?: string; padding?: string | number; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string; 'aria-describedby'?: string;`.
  - [ ] Implement `contractSchema` and `OrigoAdapter<ContainerProps>`.
  - [ ] Implement `ContainerComponent` interface from `../../../adapters/web/adapter`: expose `vc = viewChild.required('vc', { read: ViewContainerRef })`.
  - [ ] Template: provide `<ng-container #vc></ng-container>` and `<ng-content></ng-content>`.
  - [ ] Styling: use CSS logical properties, max-width constraints, and fluid padding via `var(--origo-*)`.

- [ ] **CREATE `GridComponent`** at `packages/angular-renderer/src/components/primitives/grid/` (AC: #1, #3, #4, #5, #6, #9)
  - [ ] Define `GridProps`: `columns?: number | string | Record<string, number>; gap?: number | string; align?: string; justify?: string; responsive?: Record<string, number>; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string; 'aria-describedby'?: string;`.
  - [ ] Implement `contractSchema` and `OrigoAdapter<GridProps>`.
  - [ ] Implement `ContainerComponent` interface: expose `vc = viewChild.required('vc', { read: ViewContainerRef })`.
  - [ ] Template: provide `<ng-container #vc></ng-container>` and `<ng-content></ng-content>`.
  - [ ] Styling: CSS Grid layout with responsive column rules adapting across token breakpoints.

- [ ] **CREATE `StackComponent`** at `packages/angular-renderer/src/components/primitives/stack/` (AC: #1, #3, #4, #5, #6, #9)
  - [ ] Define `StackProps`: `direction?: 'row' | 'column'; gap?: number | string; align?: 'start' | 'center' | 'end' | 'stretch'; justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'; wrap?: boolean | 'wrap' | 'nowrap'; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string; 'aria-describedby'?: string;`.
  - [ ] Implement `contractSchema` and `OrigoAdapter<StackProps>`.
  - [ ] Implement `ContainerComponent` interface: expose `vc = viewChild.required('vc', { read: ViewContainerRef })`.
  - [ ] Template: provide `<ng-container #vc></ng-container>` and `<ng-content></ng-content>`.
  - [ ] Styling: Flexbox layout with flex-direction, gap, and alignment using CSS variables.

- [ ] **CREATE `DividerComponent`** at `packages/angular-renderer/src/components/primitives/divider/` (AC: #3, #5, #7, #9)
  - [ ] Define `DividerProps`: `orientation?: 'horizontal' | 'vertical'; variant?: 'solid' | 'dashed' | 'dotted'; thickness?: string | number; content?: string; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string;`.
  - [ ] Implement `contractSchema` and `OrigoAdapter<DividerProps>`.
  - [ ] Host bindings: `role="separator"`, `[attr.aria-orientation]="computedOrientation()"`.
  - [ ] Styling: borders styled with `var(--origo-color-border-default)`, thickness, and optional centered content.

- [ ] **UPDATE `CardComponent`** at `packages/angular-renderer/src/components/primitives/card/` (AC: #2, #3, #4, #5, #8, #9)
  - [ ] Update `CardProps` interface to include: `elevation?: 'none' | 'sm' | 'md' | 'lg'; variant?: string; clickable?: boolean; hoverable?: boolean;`.
  - [ ] Update `contractSchema` to include new props while preserving all existing props (`title`, `subtitle`, `imageUrl`, `imageAlt`).
  - [ ] Implement `ContainerComponent` interface: add `vc = viewChild.required('vc', { read: ViewContainerRef })`.
  - [ ] Update `card.component.html`: include `<ng-container #vc></ng-container>` and `<ng-content></ng-content>` in `.origo-card-content`.
  - [ ] Update host bindings: `[attr.tabindex]="isClickable() ? '0' : null"`, `[attr.role]="'article'"`, keyboard listeners for `keydown.enter` / `keydown.space`.
  - [ ] Clean `card.component.scss`: remove all hardcoded fallback literals (`#ccc`, `#fff`, `#333`, `4px`, `16px`, `8px`, `14px`), implement elevation classes (`var(--origo-shadow-*)`).

- [ ] **UPDATE Registrations & Exports** (AC: #10)
  - [ ] In `packages/angular-renderer/src/lib/primitives.provider.ts`: import and register `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent` in `provideOrigo9Primitives()`.
  - [ ] In `packages/angular-renderer/src/index.ts`: export `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent`.

- [ ] **TESTS & REGISTRY** (AC: #1–#10)
  - [ ] Write unit specs for `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent`, and update `CardComponent` spec.
  - [ ] Verify Shadow DOM piercing (`fixture.nativeElement.shadowRoot ?? fixture.nativeElement`).
  - [ ] Verify `provideZonelessChangeDetection()` in all specs.
  - [ ] Verify dynamic child injection via `vc` ViewContainerRef.
  - [ ] Register all 5 test cases in `tools/test-registry/test-registry.yaml` under `@origo/angular-renderer` with `affected_stories: [1-5-application-layout-primitives]`.

## Dev Notes

### Architecture Compliance
| AD | Rule |
|---|---|
| AD-4 | Import only `@origostudio/core` + Angular SDK — no cross-renderer imports |
| AD-6 | Zero hardcoded design primitives — only `var(--origo-*)` tokens, zero fallback literals |
| P1-AD-1 | Angular 18 Standalone + Signals (no NgModules, no `@Input()` decorators) |
| P1-AD-5 | Composition over inheritance — implement `OrigoAdapter` and `ContainerComponent` interfaces, inject `WebExperienceAdapterService` |
| P1-AD-6 | axe-core in CI — bind `role="separator"` and `aria-orientation` for Divider; `role="article"` for Card |
| P2-AD-2 | Form Engine Substrate integration — layout primitives act as transparent container parents for nested form controls |

### Child Rendering Substrate (`ContainerComponent` Interface)
In `packages/angular-renderer/src/lib/renderer.component.ts`, dynamic AST nodes with children check:
```typescript
const instance = componentRef.instance as ContainerComponent;
let childVc = instance.vc || instance.viewContainerRef;
```
All layout containers (`Container`, `Grid`, `Stack`, `Card`) **MUST** implement `ContainerComponent` and declare:
```typescript
vc = viewChild.required('vc', { read: ViewContainerRef });
```
and render `<ng-container #vc></ng-container>` in their HTML templates. Omitting this breaks nested component rendering in the BADL runtime.

### Design Tokens & Theme Switching (AD-6)
Never include hardcoded fallback values in SCSS:
- ❌ Forbidden: `border: 1px solid var(--origo-color-border-default, #ccc);`
- ❌ Forbidden: `background-color: var(--origo-color-surface-background, #fff);`
- ❌ Forbidden: `border-radius: var(--origo-radius-sm, 4px);`
- ✅ Required: `border: 1px solid var(--origo-color-border-default);`
- ✅ Required: `background-color: var(--origo-color-surface-background);`
- ✅ Required: `border-radius: var(--origo-radius-sm);`
- ✅ Required: Elevation via `box-shadow: var(--origo-shadow-sm);`, `var(--origo-shadow-md);`, `var(--origo-shadow-lg);`

### Testing Standards & Test Registry
- Always use `provideZonelessChangeDetection()` in test configurations.
- Use Shadow DOM piercing: `const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;`.
- Use logical properties to maintain RTL support without physical CSS directional overrides.
- Register all spec files in `tools/test-registry/test-registry.yaml`.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#4. LAYOUT & PANELS]
- [Source: packages/angular-renderer/src/adapters/web/adapter.ts#ContainerComponent]
- [Source: packages/angular-renderer/src/lib/renderer.component.ts]

## Dev Agent Record

### Agent Model Used
Gemini 3.8 Flash (High)

### Debug Log References
-

### Completion Notes List
- Comprehensive context engine analysis and validation completed.
- Identified and fixed existing CardComponent collision, provider path resolution, AST child rendering substrate requirements, token fallback violations, and central test registry ledger integration.

### File List
- `packages/angular-renderer/src/components/primitives/container/container.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/container/container.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/container/container.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/container/container.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/grid/grid.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/grid/grid.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/grid/grid.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/grid/grid.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/stack/stack.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/stack/stack.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/stack/stack.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/stack/stack.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/divider/divider.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/divider/divider.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/divider/divider.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/divider/divider.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/card/card.component.ts` (UPDATE)
- `packages/angular-renderer/src/components/primitives/card/card.component.html` (UPDATE)
- `packages/angular-renderer/src/components/primitives/card/card.component.scss` (UPDATE)
- `packages/angular-renderer/src/components/primitives/card/card.component.spec.ts` (UPDATE)
- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
- `packages/angular-renderer/src/index.ts` (UPDATE)
- `tools/test-registry/test-registry.yaml` (UPDATE)

