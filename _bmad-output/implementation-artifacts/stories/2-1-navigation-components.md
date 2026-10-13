---
story_id: "2.1"
story_key: 2-1-navigation-components
baseline_commit: e5aafb2
epic: 2
status: "ready-for-dev"
---

# Story 2.1: Navigation Components

Status: ready-for-dev

## Story

As a developer,
I want to use structured navigation menus (`Breadcrumbs`, `Pagination`, `Tabs`, `Stepper`),
So that users can easily move through the application.

## Acceptance Criteria

1. **[AC-1] Full Keyboard Navigation & Accessibility (ADR: P1-AD-6):**
   - **Given** an Origo layout environment
   - **When** I configure or utilize the delivered components (`Breadcrumbs`, `Pagination`, `Tabs`, `Stepper`)
   - **Then** all components must be fully keyboard navigable (Arrow keys, Tab, Home, End, Esc, Enter, Space) with full focus indicators
   - **And** all components must pass automated `axe-core` accessibility audits with zero AA violations.
2. **[AC-2] Metadata Hooks & Test Selectors (ADR: AD-12):**
   - **Given** any component instance (`BreadcrumbsComponent`, `PaginationComponent`, `TabsComponent`, `StepperComponent`)
   - **When** rendered from a BADL payload
   - **Then** it must expose standard metadata hooks (`permissions`, `rules`, `metadata`, `aria-label`, `aria-describedby`)
   - **And** bind `[attr.data-testid]="contract().id"` on the host element.
3. **[AC-3] Zero Literal SCSS & RTL Support (ADR: AD-6, NFR-I18N-001):**
   - **Given** any component stylesheet (`.scss`)
   - **When** rendered in the browser
   - **Then** it must strictly utilize semantic CSS variables (`var(--origo-*)`) without any hardcoded fallback literals, hex colors, or pixel values
   - **And** strictly use CSS Logical Properties (`padding-inline`, `margin-inline`, `inset-inline-start`, etc.) ensuring 100% automated Right-to-Left (RTL) mirroring.
4. **[AC-4] Dynamic Child AST Substrate (`ContainerComponent`) (ADR: P1-AD-5):**
   - **Given** a dynamic BADL AST rendering lifecycle
   - **When** child nodes or sub-views are nested inside navigation containers
   - **Then** all 4 components must implement `ContainerComponent`, declare `vc = viewChild.required('vc', { read: ViewContainerRef })`, and render `<ng-container #vc></ng-container>` to support the dynamic child rendering pipeline.
5. **[AC-5] Angular Standalone, Signals, & Schema Coercion (ADR: P1-AD-1):**
   - **Given** incoming BADL AST payloads
   - **When** components are instantiated
   - **Then** they must be Angular 18/22 Standalone components with `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`, consume inputs via Angular Signals (`input.required()`, `computed()`, `output()`)
   - **And** validate/coerce properties via `static readonly contractSchema` and `coerceContractProps()` to prevent runtime crashes from malformed inputs.
6. **[AC-6] State Synchronization & Capability Dispatch (ADR: AD-11):**
   - **Given** user interactions and navigation state changes
   - **When** an item is selected or a page/step transition occurs
   - **Then** the component must emit corresponding typed outputs and synchronize state via `WebExperienceAdapterService` (`updateState` and `dispatchCapability`).
7. **[AC-7] Production Overlay Architecture Integration (ADR: AD-4, Spike: retro-1):**
   - **Given** navigation menus or triggers that spawn popup menus or dropdowns (e.g., page size dropdowns or step popovers)
   - **When** overlays are opened
   - **Then** they must consume `OrigoOverlayService` (`packages/angular-renderer/src/lib/overlay/overlay.service.ts`) established in `retro-1` to project into the document root overlay container without Shadow DOM clipping, token detachment, or z-index trapping.
8. **[AC-8] Server-Side Rendering (SSR) Safety (Global System AC):**
   - **Given** an SSR or hydration lifecycle
   - **When** components are initialized and rendered
   - **Then** direct access to browser DOM globals (`window`, `document`) must be strictly avoided during initialization, and any DOM event or RTL direction inspections must be guarded via `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
9. **[AC-9] Strict Content Security Policy (CSP) Compliance (Global System AC):**
   - **Given** strict CSP environments
   - **When** navigation links or actions are rendered
   - **Then** templates must not use inline script handlers or `href="javascript:void(0)"`; interactive elements must be semantic `<button type="button">` or valid router/anchor elements with explicit event handlers.
10. **[AC-10] Definition of Done (DoD) & Test Registry (DoD: docs/definition-of-done.md):**
    - **Given** completion of the navigation components
    - **When** validated for release
    - **Then** all primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`, exported from `packages/angular-renderer/src/index.ts`
    - **And** `tools/test-registry/test-registry.yaml` must be updated with `2-1-navigation-components` in `affected_stories` for existing tests (`renderer-primitive-breadcrumbs`, `renderer-primitive-tabs`) and new entries created for `renderer-primitive-pagination` and `renderer-primitive-stepper`.

---

## ⚠️ Critical: Existing Code — Read Before Writing Anything

### EXISTING COMPONENTS TO UPDATE (DO NOT REINVENT)

- `BreadcrumbsComponent` -> `packages/angular-renderer/src/components/primitives/breadcrumbs/` (Registry key: `'Breadcrumbs'`):
  - **Current State:** Standalone, Shadow DOM, OnPush component. Implements `OrigoAdapter<BreadcrumbsProps>`, but lacks `ContainerComponent` (`vc`), lacks `coerceContractProps()`, uses insecure `href="javascript:void(0)"`, and only supports basic `label` and `outcomeRef`.
  - **What This Story Changes:**
    - Implement `ContainerComponent`: declare `vc = viewChild.required('vc', { read: ViewContainerRef })` and add `<ng-container #vc></ng-container>` to `breadcrumbs.component.html`.
    - Apply `coerceContractProps()` to incoming `this.contract().props` with `static readonly contractSchema`.
    - Expand `BreadcrumbItem` interface: `label?: string`, `icon?: string`, `outcomeRef?: string`, `url?: string`, `disabled?: boolean`.
    - Expand `BreadcrumbsProps` interface: `items?: Array<BreadcrumbItem>`, `home?: BreadcrumbItem` (root home item), `separator?: string` (custom separator, default `'/'`), `routerMode?: 'angular' | 'native' | 'state'` per Component API Specification 6.1.
    - Replace CSP-violating `href="javascript:void(0)"` with semantic `<button type="button" class="origo-breadcrumbs__link">` or `<a [attr.href]="item.url || null">` with `(click)` handler calling `event.preventDefault()` when `item.url` is empty.
    - Render custom `home` item (if provided) as the first item with home icon/label, and render custom `separator` via `computedSeparator()` (defaulting to `'/'`).
    - Expose `itemClick = output<BreadcrumbItem>()` output event and dispatch capability via `WebExperienceAdapterService.dispatchCapability(this.contract().id, 'itemClick', item)` while preserving existing `activeOutcome` state updates.
    - Audit SCSS to enforce CSS Logical Properties (`padding-inline`, `margin-inline`) and AD-6 token compliance without fallbacks.
  - **What Must Be Preserved:**
    - Existing `outcomeRef` state updating via `experienceAdapter.updateState(...)` so existing BADL flows do not break.
    - Selector `origo-breadcrumbs`.
    - Host binding `[attr.data-testid]="contract().id"`.
    - HTML class naming structure (`origo-breadcrumbs__list`, `origo-breadcrumbs__item`, `origo-breadcrumbs__link`, etc.).

- `TabsComponent` -> `packages/angular-renderer/src/components/primitives/tabs/` (Registry key: `'Tabs'`):
  - **Current State:** Standalone, Shadow DOM, OnPush component. Implements `OrigoAdapter<TabsProps>`, has horizontal keyboard navigation, but uses legacy `@ViewChildren` and `QueryList`, lacks `ContainerComponent` (`vc`), lacks `coerceContractProps()`, and lacks vertical orientation, scrollable tabs, closable tabs, and capability dispatching.
  - **What This Story Changes:**
    - Implement `ContainerComponent`: declare `vc = viewChild.required('vc', { read: ViewContainerRef })` and add `<ng-container #vc></ng-container>` inside `tabs.component.html` along with content projection slots (`<slot>` / `<ng-content>`) for active tab panel content.
    - Modernize DOM queries: replace `@ViewChildren('tabButton') tabButtons!: QueryList<...>` with Signal `tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton')`.
    - Apply `coerceContractProps()` to contract props with `static readonly contractSchema`.
    - Expand `TabsProps` to support `items?: Array<TabItem>` as alias/primary alongside `tabs`, `value?: string` as alias for `activeTab`, `orientation?: 'horizontal' | 'vertical'` (default `'horizontal'`), `scrollable?: boolean`, `lazy?: boolean`.
    - Expand `TabItem` to support `key: string`, `label: string`, `icon?: string`, `closable?: boolean`, `badge?: string | number`, `disabled?: boolean`.
    - On closable tabs (`tab.closable === true`), render a close button with `(click)="onTabClose($event, tab)"`; the handler must explicitly call `event.stopPropagation()` to prevent selecting the tab before closing it, emit `tabClose`, and dispatch capability.
    - Expand keyboard navigation in `onKeyDown`: In vertical orientation (`orientation === 'vertical'`), support `ArrowUp` and `ArrowDown` in addition to Home/End; guard RTL detection via `isPlatformBrowser`.
    - Expose typed outputs: `valueChange = output<string>()`, `tabChange = output<TabItem>()`, and `tabClose = output<string>()`.
    - Dispatch capabilities through `WebExperienceAdapterService`: `dispatchCapability(id, 'valueChange', key)`, `dispatchCapability(id, 'tabChange', tab)`, `dispatchCapability(id, 'tabClose', key)`.
    - Update `tabs.component.html` and `tabs.component.scss` to support vertical orientation (`origo-tabs--vertical`, flex-direction column) and scrollable tab headers with overflow indicators.
  - **What Must Be Preserved:**
    - Existing `key`, `label`, `disabled` properties on `TabItem`.
    - Existing horizontal keyboard navigation and RTL awareness.
    - Selector `origo-tabs`.
    - Host binding `[attr.data-testid]="contract().id"`.
    - State update `updateState(this.contract().id, 'activeTab', tab.key)`.

---

### NEW COMPONENTS TO CREATE

- `PaginationComponent` -> `packages/angular-renderer/src/components/primitives/pagination/` (Registry key: `'Pagination'` and alias `'Paginator'`):
  - **Inputs (`PaginationProps`):**
    - `first?: number` (first record offset, default 0)
    - `rows?: number` (page size, default 10)
    - `totalRecords?: number` (total available records, default 0)
    - `pageLinkSize?: number` (visible numbered page buttons window, default 5)
    - `rowsPerPageOptions?: number[]` (allowed page sizes, e.g. `[10, 20, 50]`)
    - `showFirstLastIcon?: boolean` (first/last navigation controls, default true)
    - `showPageLinks?: boolean` (numbered page links, default true)
    - `template?: string` (layout order/template)
    - Universal props: `disabled?: boolean`, `size?: 'small' | 'medium' | 'large'`, `variant?: string`, `permissions?: Record<string, string>`, `rules?: Record<string, unknown>`, `metadata?: Record<string, unknown>`, `'aria-label'?: string`, `'aria-describedby'?: string`.
  - **Outputs:**
    - `pageChange = output<PageChangeEvent>()` (`PageChangeEvent: { page: number, first: number, rows: number, pageCount: number }`)
    - `rowsChange = output<RowsChangeEvent>()` (`RowsChangeEvent: { rows: number, first: number }`)
  - **Architecture:** Standalone, Shadow DOM, OnPush, `ContainerComponent` (`vc`), `OrigoAdapter<PaginationProps>`, `static readonly contractSchema`, `coerceContractProps()`.
  - **Calculations & Computeds:**
    - `pageCount = computed(() => { const r = this.computedRows(); return r > 0 ? Math.ceil(this.computedTotalRecords() / r) : 0; })`
    - `pageIndex = computed(() => { const r = this.computedRows(); return r > 0 ? Math.floor(this.computedFirst() / r) : 0; })`
    - `visiblePageLinks = computed(() => ...)`: calculates sliding window of page numbers bounded by `pageLinkSize`, clamped to `[0, pageCount - 1]`.
    - Boundary clamping: `first` is clamped between `0` and `Math.max(0, (pageCount - 1) * rows)`.
  - **Accessibility & ARIA:**
    - Host/nav element: `<nav role="navigation" [attr.aria-label]="computedAriaLabel()">`
    - Page link buttons: `aria-label="Page {pageNumber}"`, active button has `aria-current="page"`, disabled buttons have `[disabled]="true"` and `aria-disabled="true"`.
    - Rows per page dropdown: `<select [attr.aria-label]="'Rows per page'">` or integrated select primitive.
  - **Integration & State:**
    - Dispatches `updateState(id, 'first', offset)` and `updateState(id, 'rows', rows)`.
    - Dispatches `dispatchCapability(id, 'pageChange', payload)` and `dispatchCapability(id, 'rowsChange', payload)`.

- `StepperComponent` -> `packages/angular-renderer/src/components/primitives/stepper/` (Registry key: `'Stepper'`):
  - **Inputs (`StepperProps`):**
    - `steps?: Array<StepItem>`
      ```ts
      export interface StepItem {
        key: string;
        label: string;
        description?: string;
        icon?: string;
        optional?: boolean;
        disabled?: boolean;
        completed?: boolean;
      }
      ```
    - `value?: string` (active step key)
    - `linear?: boolean` (prevents skipping incomplete steps, default false)
    - `readonly?: boolean` (prevents navigation, default false)
    - `orientation?: 'horizontal' | 'vertical'` (default `'horizontal'`)
    - `completedSteps?: Array<string>` (array of completed step keys)
    - Universal props: `disabled?: boolean`, `permissions?: Record<string, string>`, `rules?: Record<string, unknown>`, `metadata?: Record<string, unknown>`, `'aria-label'?: string`, `'aria-describedby'?: string`.
  - **Outputs:**
    - `valueChange = output<string>()` (step key)
    - `stepChange = output<StepChangeEvent>()` (`StepChangeEvent: { activeStep: string, previousStep?: string, index: number }`)
    - `next = output<string>()`
    - `previous = output<string>()`
    - `complete = output<void>()`
    - `stepClick = output<StepItem>()`
  - **Architecture:** Standalone, Shadow DOM, OnPush, `ContainerComponent` (`vc`), `OrigoAdapter<StepperProps>`, `static readonly contractSchema`, `coerceContractProps()`.
  - **Linear Gating Rule:**
    - In `linear === true` mode: Step at index `i` is enabled only if `i <= activeStepIndex` OR all previous steps `0 .. i-1` are marked `completed: true` or present in `completedSteps`.
    - If `readonly === true` or component `disabled === true`: all step interactions are suppressed.
  - **Accessibility & ARIA:**
    - Step header container has `role="tablist"` or `role="navigation"`.
    - Step buttons have `role="tab"`, `aria-selected="true"` (for active step) or `aria-current="step"`, `aria-disabled="true"` for unreachable steps.
    - Keyboard navigation: In horizontal mode, `ArrowRight`/`ArrowLeft`, `Home`, `End`, `Enter`/`Space`. In vertical mode, `ArrowDown`/`ArrowUp`.
  - **Integration & State:**
    - Dispatches `updateState(id, 'value', stepKey)` and `updateState(id, 'activeStep', stepKey)`.
    - Dispatches `dispatchCapability(id, 'stepChange', payload)` and `dispatchCapability(id, 'complete', undefined)`.

---

### EXISTING REGISTRATION & CONFIG FILES TO UPDATE

- `packages/angular-renderer/src/lib/primitives.provider.ts`:
  - Register `'Pagination'` -> `PaginationComponent`
  - Register `'Paginator'` -> `PaginationComponent` (alias for BADL contract parity)
  - Register `'Stepper'` -> `StepperComponent`
- `packages/angular-renderer/src/index.ts`:
  - Export `PaginationComponent`, `PaginationProps`, `PageChangeEvent`, `RowsChangeEvent`
  - Export `StepperComponent`, `StepperProps`, `StepItem`, `StepChangeEvent`
- `tools/test-registry/test-registry.yaml`:
  - UPDATE `renderer-primitive-breadcrumbs` (line 534): append `2-1-navigation-components` to `affected_stories`
  - UPDATE `renderer-primitive-tabs` (line 524): append `2-1-navigation-components` to `affected_stories`
  - UPDATE `renderer-primitive-breadcrumbs-ct` (line 562) & `renderer-primitive-tabs-ct` (line 758): append `2-1-navigation-components` to `affected_stories`
  - ADD `renderer-primitive-pagination` (`packages/angular-renderer/src/components/primitives/pagination/pagination.component.spec.ts`, type `unit`, affected_stories: `['2-1-navigation-components']`)
  - ADD `renderer-primitive-stepper` (`packages/angular-renderer/src/components/primitives/stepper/stepper.component.spec.ts`, type `unit`, affected_stories: `['2-1-navigation-components']`)

---

## Tasks / Subtasks

- [ ] **UPDATE `BreadcrumbsComponent`** (AC: #1, #2, #3, #4, #5, #6, #9, #10)
  - [ ] Update `BreadcrumbItem` interface in `breadcrumbs.component.ts`: add `icon?: string`, `url?: string`, `disabled?: boolean`.
  - [ ] Update `BreadcrumbsProps` interface: add `home?: BreadcrumbItem`, `separator?: string`, `routerMode?: 'angular' | 'native' | 'state'`.
  - [ ] Implement `ContainerComponent` on `BreadcrumbsComponent`: add `vc = viewChild.required('vc', { read: ViewContainerRef })`.
  - [ ] Define `static readonly contractSchema` covering `permissions`, `rules`, `metadata`, `items`, `home`, `separator`, `routerMode` and invoke `coerceContractProps()`.
  - [ ] Add `itemClick = output<BreadcrumbItem>()` output event and dispatch capability via `WebExperienceAdapterService.dispatchCapability(this.contract().id, 'itemClick', item)`.
  - [ ] Update `breadcrumbs.component.html`:
    - [ ] Render `home` item if present as root element with home icon/label.
    - [ ] Replace `href="javascript:void(0)"` with semantic `<button type="button" class="origo-breadcrumbs__link">` (or `<a [attr.href]="item.url || null">`) to satisfy CSP.
    - [ ] Render dynamic separator via `computedSeparator()` (defaulting to `'/'`) or separator icon.
    - [ ] Add `<ng-container #vc></ng-container>` for dynamic child projection.
  - [ ] Update `breadcrumbs.component.scss` to enforce 100% CSS Logical Properties (`padding-inline`, `margin-inline`, `gap`) and AD-6 token compliance without fallbacks.
  - [ ] Update `breadcrumbs.component.spec.ts` to verify Shadow DOM piercing, Zoneless change detection, `ContainerComponent` `vc`, keyboard interaction, home item rendering, and custom separator.

- [ ] **UPDATE `TabsComponent`** (AC: #1, #2, #3, #4, #5, #6, #8)
  - [ ] Expand `TabsProps` to support `items?: Array<TabItem>` (alias for `tabs`), `value?: string` (alias for `activeTab`), `orientation?: 'horizontal' | 'vertical'`, `scrollable?: boolean`, `lazy?: boolean`.
  - [ ] Expand `TabItem` to support `icon?: string`, `closable?: boolean`, `badge?: string | number`.
  - [ ] Modernize DOM query: replace `@ViewChildren` with Signal `tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton')`.
  - [ ] Implement `ContainerComponent` on `TabsComponent`: add `vc = viewChild.required('vc', { read: ViewContainerRef })`.
  - [ ] Integrate `coerceContractProps()` with `static readonly contractSchema`.
  - [ ] Add output events: `valueChange = output<string>()`, `tabChange = output<TabItem>()`, `tabClose = output<string>()`.
  - [ ] Implement `onTabClose(event: Event, tab: TabItem)`: call `event.stopPropagation()`, emit `tabClose.emit(tab.key)`, and dispatch capability `dispatchCapability(this.contract().id, 'tabClose', tab.key)`.
  - [ ] Expand keyboard navigation in `onKeyDown` to support vertical orientation (`ArrowUp`/`ArrowDown`) while preserving horizontal Arrow navigation and SSR-safe RTL handling via `isPlatformBrowser`.
  - [ ] Update `tabs.component.html` to support vertical layout, close buttons on closable tabs with accessible labels, active tab panel projection (`<slot>` / `<ng-content>`), and `<ng-container #vc></ng-container>`.
  - [ ] Update `tabs.component.scss` to support `origo-tabs--vertical`, scrollable tabs overflow, and CSS Logical Properties with AD-6 tokens.
  - [ ] Update `tabs.component.spec.ts` to cover vertical keyboard navigation, closable tabs with event isolation, `ContainerComponent` `vc`, and Shadow DOM interaction.

- [ ] **CREATE `PaginationComponent`** (AC: #1, #2, #3, #4, #5, #6, #8)
  - [ ] Create `packages/angular-renderer/src/components/primitives/pagination/pagination.component.ts`.
  - [ ] Define `PaginationProps` (`first`, `rows`, `totalRecords`, `pageLinkSize`, `rowsPerPageOptions`, `showFirstLastIcon`, `showPageLinks`, `template`, metadata hooks).
  - [ ] Define `PageChangeEvent` (`{ page: number, first: number, rows: number, pageCount: number }`) and `RowsChangeEvent` (`{ rows: number, first: number }`) interfaces.
  - [ ] Implement `OrigoAdapter<PaginationProps>` and `ContainerComponent` (`vc = viewChild.required('vc', { read: ViewContainerRef })`).
  - [ ] Implement `static readonly contractSchema` and `coerceContractProps()`.
  - [ ] Implement computeds: `pageIndex`, `pageCount`, `visiblePageLinks` (sliding window of length `pageLinkSize`), `hasPrevious`, `hasNext`, `isFirstPage`, `isLastPage`.
  - [ ] Define outputs: `pageChange = output<PageChangeEvent>()`, `rowsChange = output<RowsChangeEvent>()`.
  - [ ] Implement navigation handlers: `onPageSelect(page)`, `onNext()`, `onPrevious()`, `onFirst()`, `onLast()`, `onRowsChange(newRows)`.
  - [ ] Dispatch state updates (`updateState`) and capabilities (`dispatchCapability`) via `WebExperienceAdapterService`.
  - [ ] Create `pagination.component.html` with semantic `<nav>`, accessible buttons (`aria-label`, `aria-current="page"`), rows-per-page `<select>`, and `<ng-container #vc></ng-container>`.
  - [ ] Create `pagination.component.scss` using `:host`, CSS Logical Properties, and AD-6 design tokens without fallbacks.
  - [ ] Create `pagination.component.spec.ts` covering page index calculation, bounds clamping, event dispatch, keyboard navigation, and Shadow DOM piercing.

- [ ] **CREATE `StepperComponent`** (AC: #1, #2, #3, #4, #5, #6, #7, #8)
  - [ ] Create `packages/angular-renderer/src/components/primitives/stepper/stepper.component.ts`.
  - [ ] Define `StepItem` and `StepperProps` (`steps`, `value`, `linear`, `readonly`, `orientation`, `completedSteps`, metadata hooks).
  - [ ] Define `StepChangeEvent` (`{ activeStep: string, previousStep?: string, index: number }`) interface.
  - [ ] Implement `OrigoAdapter<StepperProps>` and `ContainerComponent` (`vc = viewChild.required('vc', { read: ViewContainerRef })`).
  - [ ] Implement `static readonly contractSchema` and `coerceContractProps()`.
  - [ ] Implement computeds: `activeStepIndex`, `isStepActive(index)`, `isStepCompleted(index)`, `isStepDisabled(index)` (enforcing linear mode constraints: enabled if `!linear || i <= activeStepIndex || previousStepsCompleted`).
  - [ ] Define outputs: `valueChange = output<string>()`, `stepChange = output<StepChangeEvent>()`, `next = output<string>()`, `previous = output<string>()`, `complete = output<void>()`, `stepClick = output<StepItem>()`.
  - [ ] Implement keyboard navigation: `ArrowRight`/`ArrowDown` (next step), `ArrowLeft`/`ArrowUp` (previous step), `Home`/`End`, `Enter`/`Space` (activate).
  - [ ] Dispatch state updates (`updateState`) and capabilities (`dispatchCapability`) via `WebExperienceAdapterService`.
  - [ ] Create `stepper.component.html` with step headers (`role="tablist"`), step buttons (`role="tab"`, `aria-current="step"`), indicator numbers/icons, connector lines, active panel content slot (`<slot>` / `<ng-content>`), and `<ng-container #vc></ng-container>`.
  - [ ] Create `stepper.component.scss` with horizontal/vertical flex layouts, progress connector styling, CSS Logical Properties, and AD-6 tokens.
  - [ ] Create `stepper.component.spec.ts` covering step switching, linear mode gating, keyboard navigation, and Shadow DOM piercing.

- [ ] **UPDATE Registrations, Exports, & Test Registry** (AC: #10)
  - [ ] Register `PaginationComponent` (as `'Pagination'` and `'Paginator'`) and `StepperComponent` in `packages/angular-renderer/src/lib/primitives.provider.ts`.
  - [ ] Export `PaginationComponent`, `PaginationProps`, `PageChangeEvent`, `RowsChangeEvent` from `packages/angular-renderer/src/index.ts`.
  - [ ] Export `StepperComponent`, `StepperProps`, `StepItem`, `StepChangeEvent` from `packages/angular-renderer/src/index.ts`.
  - [ ] Update `tools/test-registry/test-registry.yaml`:
    - [ ] Append `2-1-navigation-components` to `affected_stories` in `renderer-primitive-breadcrumbs`.
    - [ ] Append `2-1-navigation-components` to `affected_stories` in `renderer-primitive-tabs`.
    - [ ] Append `2-1-navigation-components` to `affected_stories` in `renderer-primitive-breadcrumbs-ct` and `renderer-primitive-tabs-ct`.
    - [ ] Add new entry `renderer-primitive-pagination` (`packages/angular-renderer/src/components/primitives/pagination/pagination.component.spec.ts`).
    - [ ] Add new entry `renderer-primitive-stepper` (`packages/angular-renderer/src/components/primitives/stepper/stepper.component.spec.ts`).
  - [ ] Run full test validation: `npm test` or Nx test target for `@origo/angular-renderer`.

---

## Dev Notes

### Architecture & Guideline Guardrails (From Epic 1 Retrospective)
| Category | Requirement | Reference |
|---|---|---|
| **Shadow DOM & Invariants** | Every component must specify `standalone: true`, `encapsulation: ViewEncapsulation.ShadowDom`, and `changeDetection: ChangeDetectionStrategy.OnPush`. | `docs/guidelines/component-invariants.md` |
| **Child Substrate (`ContainerComponent`)** | ALL components MUST implement `ContainerComponent`, declare `vc = viewChild.required('vc', { read: ViewContainerRef })`, and render `<ng-container #vc></ng-container>`. Omitting this breaks nested BADL AST child rendering. | `docs/guidelines/component-invariants.md` |
| **Contract Schema & Coercion** | All components must declare `static readonly contractSchema` and invoke `coerceContractProps()` on incoming `contract().props` to prevent runtime crashes from dynamic JSON payloads. | `docs/guidelines/component-invariants.md` |
| **Design Tokens (AD-6)** | ❌ Forbidden: `color: #0066FF;` or `border: 1px solid var(--origo-color-border-default, #ccc);`<br>✅ Required: `color: var(--origo-color-text-primary);` and `border: var(--origo-border-width-default) solid var(--origo-color-border-default);`. Zero fallback literals. | `docs/guidelines/scss-and-tokens.md` |
| **CSS Logical Properties (RTL)** | ❌ Forbidden: `margin-left`, `padding-right`, `left`, `right`.<br>✅ Required: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `inset-inline-end`. | `docs/guidelines/scss-and-tokens.md` |
| **Testing Standards** | Always use `provideZonelessChangeDetection()`. Query elements through Shadow DOM: `const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;`. Dispatch real DOM events (`new MouseEvent('click')`, `new KeyboardEvent('keydown')`) rather than calling component methods directly. | `docs/guidelines/testing-primitives.md` |
| **Production Overlay Integration** | When navigation menus trigger popup menus or dropdowns, integrate with `OrigoOverlayService` (`packages/angular-renderer/src/lib/overlay/overlay.service.ts`) established in `retro-1` to render overlays at root `<body>` without z-index clipping. | `docs/guidelines/overlay-portal-architecture.md` |
| **SSR Safety** | Do not access `window` or `document` during initialization. Wrap runtime DOM access (such as direction computation) in `isPlatformBrowser(inject(PLATFORM_ID))`. | `docs/guidelines/component-invariants.md` |
| **Package Boundaries (AD-4)** | Only import from `@origostudio/core` and Angular packages. Do NOT import from other renderers or CLI packages. | `ARCHITECTURE-SPINE.md` |

### Component Keyboard Navigation Matrix
| Component | Primary Role | Navigable Keys | Special Behavior |
|---|---|---|---|
| **Breadcrumbs** | `navigation` | `Tab`, `Shift+Tab`, `Enter`, `Space` | Focus lands on interactive links only; last (current) item is non-focusable text (`aria-current="page"`). |
| **Tabs (Horizontal)** | `tablist` | `ArrowLeft`, `ArrowRight`, `Home`, `End` | Switches focus between tabs; automatically wraps around. Adapts to RTL. |
| **Tabs (Vertical)** | `tablist` | `ArrowUp`, `ArrowDown`, `Home`, `End` | Switches focus vertically between tabs with wrapping. |
| **Pagination** | `navigation` | `Tab`, `Shift+Tab`, `ArrowLeft`, `ArrowRight`, `Home`, `End` | Moves between page buttons and dropdown; disabled boundary buttons omitted from Tab order. |
| **Stepper (Horizontal)** | `tablist` | `ArrowRight` (next), `ArrowLeft` (prev), `Home`, `End`, `Enter`/`Space` | Linear mode disables jumping over incomplete steps. |
| **Stepper (Vertical)** | `tablist` | `ArrowDown` (next), `ArrowUp` (prev), `Home`, `End`, `Enter`/`Space` | Vertical step flow with connector lines. |

### Component Schemas & Contract Specification
```ts
// Contract Schemas for coerceContractProps:

export const BreadcrumbsContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  items: 'array',
  home: 'object',
  separator: 'string',
  routerMode: 'string',
} as const;

export const TabsContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  tabs: 'array',
  items: 'array',
  activeTab: 'string',
  value: 'string',
  orientation: 'string',
  scrollable: 'boolean',
  lazy: 'boolean',
} as const;

export const PaginationContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  first: 'number',
  rows: 'number',
  totalRecords: 'number',
  pageLinkSize: 'number',
  rowsPerPageOptions: 'array',
  showFirstLastIcon: 'boolean',
  showPageLinks: 'boolean',
  template: 'string',
  disabled: 'boolean',
  size: 'string',
  variant: 'string',
} as const;

export const StepperContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  steps: 'array',
  value: 'string',
  linear: 'boolean',
  readonly: 'boolean',
  orientation: 'string',
  completedSteps: 'array',
  disabled: 'boolean',
} as const;
```

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1: Navigation Components]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 3.4 Paginator]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 4.4 Tabs]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 4.5 Stepper]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 6.1 Breadcrumb]
- [Source: packages/angular-renderer/src/lib/overlay/overlay.service.ts]
- [Source: docs/guidelines/component-invariants.md]
- [Source: docs/guidelines/scss-and-tokens.md]
- [Source: docs/guidelines/testing-primitives.md]
- [Source: docs/guidelines/overlay-portal-architecture.md]
- [Source: docs/definition-of-done.md]

---

## Dev Agent Record

### Agent Model Used

Gemini 3.8 Flash (High)

### Debug Log References

- Verified existing `breadcrumbs` and `tabs` components in `packages/angular-renderer/src/components/primitives/`.
- Confirmed absence of `pagination` and `stepper` components, requiring full implementation.
- Verified live `OrigoOverlayService` in `packages/angular-renderer/src/lib/overlay/overlay.service.ts` from merged `retro-1` story.
- Checked `primitives.provider.ts` and `index.ts` registration requirements.
- Audited `tools/test-registry/test-registry.yaml` preventing duplicate key collisions for `breadcrumbs` and `tabs`.
- Verified commit history through baseline `e5aafb2` (release 0.0.54).

### Completion Notes List

- Comprehensive story context engine analysis and quality validation completed.
- Eliminated contradictory output types (`rowsChange` standardized to `RowsChangeEvent`).
- Added missing `pageLinkSize` sliding window pagination calculation.
- Fixed CSP violation by replacing `javascript:void(0)` with semantic interactive elements.
- Modernized `TabsComponent` DOM queries to Signal-based `viewChildren`.
- Clarified linear progression gating algorithm for `StepperComponent`.
- Enforced complete architectural invariants, AD-6 zero-literal tokens, and Shadow DOM testing standards.

### File List

- `_bmad-output/implementation-artifacts/stories/2-1-navigation-components.md` (STORY SPECIFICATION)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (TRACKING)
- `packages/angular-renderer/src/components/primitives/breadcrumbs/breadcrumbs.component.ts` (UPDATE)
- `packages/angular-renderer/src/components/primitives/breadcrumbs/breadcrumbs.component.html` (UPDATE)
- `packages/angular-renderer/src/components/primitives/breadcrumbs/breadcrumbs.component.scss` (UPDATE)
- `packages/angular-renderer/src/components/primitives/breadcrumbs/breadcrumbs.component.spec.ts` (UPDATE)
- `packages/angular-renderer/src/components/primitives/tabs/tabs.component.ts` (UPDATE)
- `packages/angular-renderer/src/components/primitives/tabs/tabs.component.html` (UPDATE)
- `packages/angular-renderer/src/components/primitives/tabs/tabs.component.scss` (UPDATE)
- `packages/angular-renderer/src/components/primitives/tabs/tabs.component.spec.ts` (UPDATE)
- `packages/angular-renderer/src/components/primitives/pagination/pagination.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/pagination/pagination.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/pagination/pagination.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/pagination/pagination.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/stepper/stepper.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/stepper/stepper.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/stepper/stepper.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/stepper/stepper.component.spec.ts` (NEW)
- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
- `packages/angular-renderer/src/index.ts` (UPDATE)
- `tools/test-registry/test-registry.yaml` (UPDATE)
