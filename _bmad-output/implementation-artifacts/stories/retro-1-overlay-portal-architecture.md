---
story_id: "retro-1"
story_key: "retro-1-overlay-portal-architecture"
baseline_commit: "147ef03e50728c643f2faa7688bb4c4408f7ddf2"
epic: 1
status: "ready-for-dev"
---

# Story retro-1: Prototype/Standardize Angular Overlay & Portal Architecture for Shadow DOM

Status: ready-for-dev

<!-- Note: Validation is complete. Story is ready for dev-story. -->

## Story

As an Angular Platform Architect (Charlie) and Component Developer,  
I want to research, prototype, and standardize an Angular Overlay and Portal architecture compatible with `ViewEncapsulation.ShadowDom`,  
So that upcoming Epic 2 interaction components (Modals, Dialogs, Drawers, Popovers, Tooltips) and Epic 1 floating controls (Select, Autocomplete, DatePicker dropdowns) can project floating panels to the document root without style bleed, token detachment, focus trapping failures, or SSR/CSP incompatibilities.

---

## Acceptance Criteria

1. **[AC-1] Spike Prototype Implementation (`tools/spikes/overlay-shadowdom`):**
   - **Given** an Angular 18/22 standalone component using `ViewEncapsulation.ShadowDom` and zoneless change detection (`P1-AD-1`),
   - **When** an overlay or portal trigger (e.g., button, select trigger) is activated,
   - **Then** the overlay content must project outside the component's ShadowRoot to the document overlay container (e.g. CDK `OverlayContainer` attached to `document.body`), escaping all parent container `overflow: hidden`, `overflow: auto`, and CSS stacking context clipping.
   - **And** the overlay substrate MUST be strictly SSR-compatible, injecting `PLATFORM_ID` and `DOCUMENT`, guarding all DOM/body access with `isPlatformBrowser`, and providing safe no-op execution in non-browser environments.
   - **And** a working, automated prototype harness must exist at `tools/spikes/overlay-shadowdom/` demonstrating this projection and executable via `npm run spike:overlay`.
   *(Reference: Technical Spike `tools/spikes/overlay-shadowdom`, `P1-AD-1`, Epics.md System-wide SSR Constraint)*

2. **[AC-2] Design Token, Theme & RTL Inheritance Across Boundaries (`AD-6`, `P1-AD-2`, `NFR-I18N-001`):**
   - **Given** a floating overlay projected outside a component's ShadowRoot into `document.body`,
   - **When** the overlay panel is rendered,
   - **Then** it must strictly consume `--origo-*` design tokens from `@origo/design-tokens` without style bleed to host applications and without unstyled default browser fallbacks.
   - **And** the overlay container or panel MUST inherit active theme classes (`theme-light`, `theme-dark`, `high-contrast`) and tenant styling attributes from the originating component host or root application context.
   - **And** styling must be strictly Content Security Policy (CSP) compliant, using class-based styling or CSS Custom Property bindings and NEVER injecting inline `style="..."` attributes on dynamically injected body nodes.
   - **And** all layout and positioning rules must use CSS Logical Properties (`padding-inline`, `padding-block`, `inset-inline-*`) and propagate computed `dir="rtl"` directionality to prevent misalignment in RTL locales (`NFR-I18N-001`).
   *(Reference: ADR `AD-6`, `P1-AD-2`, `NFR-I18N-001`, `docs/guidelines/scss-and-tokens.md`)*

3. **[AC-3] Shadow DOM Event Piercing, Outside-Click Dismissal & Teardown (`AD-4`, `P1-AD-1`):**
   - **Given** an active overlay with backdrop or outside-click dismissal enabled,
   - **When** a user clicks anywhere in the document,
   - **Then** the dismissal handler MUST evaluate `event.composedPath()` across Shadow DOM boundaries to accurately determine whether the click originated inside the triggering element, within the overlay panel, or outside both.
   - **And** standard `event.target` retargeting must NOT cause false positive dismissals on internal shadow elements or fail to dismiss on external clicks.
   - **And** all document event listeners (`document:click`, keydown) and projected DOM containers must automatically unbind and dispose when the overlay is detached or when the triggering host component is destroyed via Angular `DestroyRef`.
   *(Reference: ADR `AD-4`, `P1-AD-1`, `docs/guidelines/component-invariants.md`)*

4. **[AC-4] Keyboard Navigation, Focus Trapping & A11y State Sync (`P1-AD-6`, `FR-A11Y-001`):**
   - **Given** a modal dialog or floating dropdown overlay opened from within a Shadow DOM primitive,
   - **When** the overlay is opened,
   - **Then** focus must move into the overlay panel, and pressing `Tab` / `Shift+Tab` must cycle focus exclusively within the overlay focusable elements (focus trap).
   - **And** the focus trap implementation must pierce `shadowRoot.activeElement` rather than relying solely on `document.activeElement`.
   - **And** pressing `Escape` must close the overlay and return focus to the originating trigger element within the component's ShadowRoot.
   - **And** host trigger elements must automatically synchronize accessibility state attributes (`aria-expanded`, `aria-controls`, `aria-haspopup`).
   - **And** animations and transitions must strictly respect `--origo-motion-duration-*` tokens and user `prefers-reduced-motion` settings.
   *(Reference: ADR `P1-AD-6`, `docs/guidelines/testing-primitives.md`, Epics.md System-wide Constraint 4)*

5. **[AC-5] Standardized Overlay & Portal Service API and Public Exports (`P1-AD-5`, Global AC-4):**
   - **Given** renderer components requiring floating panels across Epic 1 (Select, DatePicker, Autocomplete) and Epic 2 (Modal, Dialog, Drawer, Popover, Tooltip),
   - **When** developers implement floating UI interactions,
   - **Then** `@origo/angular-renderer` must expose a standardized, documented service and directive contract (`OrigoOverlayService`, `OrigoOverlayRef`, `OrigoOverlayConfig`, `OrigoConnectedPositionStrategy`, `OrigoGlobalPositionStrategy`) wrapping Angular CDK Overlay.
   - **And** all public overlay types, services, and directives must be exported through `packages/angular-renderer/src/index.ts`.
   - **And** the connected position strategy must incorporate `ResizeObserver` / scroll listeners to automatically reposition floating panels on viewport resize and container scrolling without breaking stacking.
   *(Reference: ADR `P1-AD-5`, Epics.md System-wide AC-4: Z-Index Portals, `packages/angular-renderer/src/index.ts`)*

6. **[AC-6] Architectural Standard & Developer Guide (`docs/guidelines/overlay-portal-architecture.md`):**
   - **Given** the completed spike and standardization analysis,
   - **When** inspected in the repository,
   - **Then** a canonical developer guide and architecture record must be authored at `docs/guidelines/overlay-portal-architecture.md` covering:
     - Shadow DOM vs CDK Overlay interaction challenges and proven solutions.
     - Token inheritance patterns, CSP compliance, and container isolation.
     - Step-by-step golden implementation patterns for both Connected Overlays (Dropdown/Popover) and Global Overlays (Modal/Dialog).
     - Migration roadmap for Epic 1 dropdowns (Select, DatePicker) and prerequisite contract for Epic 2 Story 2.2 (`2-2-modal-and-overlay-components`).
   *(Reference: Epic 1 Retrospective Action Item 4, `epic-1-retro-2026-10-11.md`)*

7. **[AC-7] Test Suite, Central Registry & Package Dependency Alignment (`AD-11`, `AD-12`):**
   - **Given** the overlay architecture implementation and spike harness,
   - **When** tested in CI,
   - **Then** automated unit/component tests verifying portal projection, focus trapping, outside-click dismissal, and SSR execution must pass.
   - **And** test scenarios must be registered in `tools/test-registry/test-registry.yaml` under `@origo/angular-renderer`.
   - **And** monorepo dependencies must be aligned: `@angular/cdk@22.0.8` added to root `package.json` (`dependencies`), and added to `packages/angular-renderer/package.json` (`peerDependencies: >=18.0.0` and `devDependencies: 22.0.8`).
   - **And** script `"spike:overlay"` must be added to root `package.json`.
   *(Reference: ADR `AD-11`, `AD-12`, `tools/test-registry/test-registry.yaml`)*

---

## ⚠️ Critical: Existing Code — Read Before Writing Anything

### 1. The Core Architectural Dilemma
In Epic 1, components like `SelectComponent`, `DatePickerComponent`, and `AutocompleteComponent` implemented floating dropdowns directly in their templates (`.origo-select__dropdown` inside `select.component.html`). Because all primitives enforce `ViewEncapsulation.ShadowDom`:
- **Overflow Clipping Bug:** When placed inside layout primitives (`origo-card`, `origo-grid`, `origo-container`) with `overflow: hidden` or `overflow: auto`, dropdowns are clipped by the boundary of the host element.
- **Z-Index Stacking Context:** Inner shadow elements cannot escape local stacking contexts created by CSS properties (`transform`, `contain`, `filter`) on ancestor elements.

### 2. The Shadow DOM Boundary Complications with Overlays
When using Angular CDK Overlay (`@angular/cdk/overlay`):
1. **CDK Overlay Host:** By default, CDK appends overlays to `<div class="cdk-overlay-container">` on `document.body`. This escapes container clipping, but removes the content from the component's ShadowRoot.
2. **Design Token Loss:** Styles authored in `:host` or scoped component `.scss` are completely lost once content is projected into `document.body`.
3. **CSS Custom Properties Scope:** If CSS variables (`--origo-*`) are overridden on a specific component or section rather than `:root`, the CDK overlay in `document.body` cannot read them unless the active theme scope class (`theme-light`, `theme-dark`) is copied to the overlay panel container.
4. **Event Retargeting:** Event handlers checking `event.target` at the window/document level will receive the `<origo-select>` host element instead of the internal button or option. Outside click handlers must inspect `event.composedPath()`.
5. **Focus Trapping:** Browsers report `document.activeElement` as the host custom element; active element inspection inside the shadow root requires `hostElement.shadowRoot.activeElement`.

### 3. Monorepo Dependencies & Exact Package Placement
- Root `package.json`: Contains Angular 22.0.8 (`@angular/core`, `@angular/common`, `@angular/forms`), but `@angular/cdk` is **not currently installed**.
  - Must add `"@angular/cdk": "22.0.8"` to root `package.json` `dependencies`.
  - Must add `"spike:overlay": "nx test angular-renderer --testFile=tools/spikes/overlay-shadowdom"` (or spike runner script) to `package.json` `scripts`.
- `packages/angular-renderer/package.json`:
  - Must declare `"@angular/cdk": ">=18.0.0"` in `peerDependencies`.
  - Must declare `"@angular/cdk": "22.0.8"` in `devDependencies`.

### 4. SSR & Hydration Safety (`System-Wide Constraint 2`)
Any overlay service attaching elements to `document.body` or subscribing to `window`/`document` events will crash on Angular SSR unless guarded:
- Always inject `PLATFORM_ID` and `DOCUMENT` from `@angular/core` and `@angular/common`.
- Guard all DOM manipulation with `if (isPlatformBrowser(this.platformId))`.
- Return mock / no-op references when executed in non-browser server contexts.

### 5. Content Security Policy & Inline Style Prohibition
- Never set inline styles on projected DOM elements (`element.style.cssText = ...` or `style="..."` attributes).
- Use CSS Custom Properties and predefined BEM classes (`.origo-overlay-pane`, `.origo-overlay-backdrop`) from `@origo/angular-renderer/src/styles/overlay.scss`.

### 6. Lifecycle & Memory Leak Guardrails (`DestroyRef`)
- Every `OrigoOverlayRef` must bind to the calling component's `DestroyRef`.
- When the host component is destroyed, any open overlays, focus traps, and document listeners MUST automatically detach and dispose.

---

## Tasks / Subtasks

- [ ] **Task 1: Monorepo Dependency Alignment & Package Configuration (AC: 1, 5, 7)**
  - [ ] Add `"@angular/cdk": "22.0.8"` to root `package.json` `dependencies`.
  - [ ] Add `"@angular/cdk": ">=18.0.0"` to `packages/angular-renderer/package.json` `peerDependencies`.
  - [ ] Add `"@angular/cdk": "22.0.8"` to `packages/angular-renderer/package.json` `devDependencies`.
  - [ ] Add `"spike:overlay"` script to root `package.json`.
  - [ ] Verify build and bundle size with `npx nx build angular-renderer`.

- [ ] **Task 2: Build Spike Harness in `tools/spikes/overlay-shadowdom` (AC: 1, 3, 4, 7)**
  - [ ] Create `tools/spikes/overlay-shadowdom/` harness with sample Shadow DOM trigger component.
  - [ ] Implement portal projection attaching to document-level overlay container outside shadow boundary.
  - [ ] Implement and verify `event.composedPath()` outside-click dismissal handler without false positives.
  - [ ] Implement and verify Shadow-DOM-aware focus trap cycling with `Tab` / `Shift+Tab` and `Escape`.
  - [ ] Verify execution via `npm run spike:overlay` or Jest spec.

- [ ] **Task 3: Design Token, Theme & RTL Propagation with CSP Compliance (AC: 2)**
  - [ ] Standardize the theme container strategy: ensuring `.origo-overlay-pane` automatically receives `.theme-light`, `.theme-dark`, or custom tenant tokens without inline styles.
  - [ ] Establish global overlay styles in `packages/angular-renderer/src/styles/overlay.scss` defining base overlay backdrop, panel elevation (`--origo-shadow-lg`), and surface styling using CSS logical properties.
  - [ ] Support RTL directionality propagation (`dir="rtl"`) so connected overlays mirror correctly in RTL locales.

- [ ] **Task 4: Standardize Renderer Overlay Substrate & Public Exports (`packages/angular-renderer`) (AC: 3, 4, 5)**
  - [ ] Define TypeScript contracts (`OrigoOverlayConfig`, `OrigoOverlayRef`, `OrigoOverlayPositionStrategy`) in `packages/angular-renderer/src/lib/overlay/overlay.models.ts`.
  - [ ] Implement `OrigoOverlayRef` with automatic `DestroyRef` cleanup, backdrop management, and focus restore in `packages/angular-renderer/src/lib/overlay/overlay-ref.ts`.
  - [ ] Implement `OrigoOverlayService` in `packages/angular-renderer/src/lib/overlay/overlay.service.ts` wrapping CDK Overlay with SSR guards (`isPlatformBrowser`, `DOCUMENT`).
  - [ ] Support Connected Position Strategy (dropdowns/tooltips) with flip/shift and `ResizeObserver` repositioning.
  - [ ] Support Global Position Strategy (modals/drawers/dialogs) with centered or docked positioning.
  - [ ] Export all overlay services, models, and references in `packages/angular-renderer/src/index.ts`.

- [ ] **Task 5: Author Canonical Guideline & Architecture Specification (AC: 6)**
  - [ ] Author `docs/guidelines/overlay-portal-architecture.md` detailing:
    - Executive summary and architectural decisions.
    - Shadow DOM overlay challenges and concrete solutions (style isolation, token propagation, composed path events, focus trapping, SSR safety).
    - Complete golden code snippets for Connected Overlay (Select/Dropdown pattern) and Global Overlay (Modal/Dialog pattern).
    - PR pre-flight checklist for Epic 2 Story 2.2 (`2-2-modal-and-overlay-components`).

- [ ] **Task 6: Unit Test Suite & Central Test Registry Registration (AC: 7)**
  - [ ] Write unit specs covering `OrigoOverlayService`, position strategies, outside-click, focus trap, and SSR no-op.
  - [ ] Register new test scenarios in `tools/test-registry/test-registry.yaml` under `@origo/angular-renderer`.
  - [ ] Verify `git status` and test suite passes cleanly.

---

## Dev Notes

### TypeScript Interface Contracts

```typescript
// packages/angular-renderer/src/lib/overlay/overlay.models.ts
import { ElementRef, TemplateRef, Type, ViewContainerRef } from '@angular/core';

export type OrigoOverlayPosition = 
  | { type: 'connected'; target: ElementRef | HTMLElement; originX?: 'start' | 'end' | 'center'; originY?: 'top' | 'bottom'; offset?: [number, number] }
  | { type: 'global'; position?: 'center' | 'top' | 'bottom' | 'start' | 'end' };

export interface OrigoOverlayConfig {
  position: OrigoOverlayPosition;
  hasBackdrop?: boolean;
  backdropClass?: string;
  panelClass?: string | string[];
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  viewContainerRef?: ViewContainerRef;
  direction?: 'ltr' | 'rtl';
}

export interface OrigoOverlayRef<T = unknown> {
  readonly id: string;
  readonly isOpen: boolean;
  open(): void;
  close(result?: T): void;
  afterClosed(): Promise<T | undefined>;
  updatePosition(): void;
  dispose(): void;
}
```

### Relevant Architecture Patterns and Constraints

1. **P1-AD-1 (Angular 18 Standalone + Signals + Zoneless):**
   All services and helper directives must be standalone-first. Use Signals (`signal()`, `computed()`) for overlay open/close state. Do not rely on Zone.js or unmanaged RxJS subscriptions.
2. **P1-AD-5 (Composition over Inheritance):**
   Components must not extend a base overlay class. Primitives consume overlays via service injection (`inject(OrigoOverlayService)`) or directive attachment.
3. **P1-AD-6 & WCAG 2.1 AA (Accessibility):**
   - Floating elements must have `role="dialog"`, `role="listbox"`, `role="tooltip"`, or `role="menu"`.
   - Host trigger must link `aria-expanded`, `aria-controls`, and `aria-haspopup`.
   - Focus must be trapped inside modal dialogs and restored to trigger on close.
4. **AD-6 & NFR-I18N-001 (Design Tokens & Logical Properties):**
   - Overlay panels must strictly use `--origo-color-surface-overlay`, `--origo-shadow-lg`, `--origo-radius-md`, etc.
   - Spacing must use CSS logical properties (`padding-inline`, `padding-block`, `inset-inline-start`).
5. **Epics.md System-Wide Constraint 4 (Z-Index Portals):**
   All floating elements (Modals, Selects, Tooltips) must use Angular CDK Overlays to render at the `<body>` root, ensuring correct z-index stacking.
6. **Epics.md System-Wide Constraint 2 (SSR Compatibility):**
   No direct access to DOM globals without `isPlatformBrowser` guards and `DOCUMENT` token injection.

### Code Files to Create / Update

| File | Action | Purpose |
|---|---|---|
| `package.json` | UPDATE | Add `@angular/cdk: 22.0.8` to `dependencies` & add `spike:overlay` script |
| `packages/angular-renderer/package.json` | UPDATE | Add `@angular/cdk` to `peerDependencies` (`>=18.0.0`) & `devDependencies` (`22.0.8`) |
| `packages/angular-renderer/src/index.ts` | UPDATE | Export public overlay services, models, and reference types |
| `packages/angular-renderer/src/lib/overlay/overlay.models.ts` | NEW | Define overlay config, position strategies, and ref interfaces |
| `packages/angular-renderer/src/lib/overlay/overlay-ref.ts` | NEW | Concrete overlay instance with focus trap, outside click, and DestroyRef |
| `packages/angular-renderer/src/lib/overlay/overlay.service.ts` | NEW | SSR-safe injectable service creating CDK overlay portals |
| `packages/angular-renderer/src/styles/overlay.scss` | NEW | Global styles for overlay container, backdrop, and token elevation |
| `tools/spikes/overlay-shadowdom/` | NEW | Working automated spike harness demonstrating Shadow DOM portal projection |
| `docs/guidelines/overlay-portal-architecture.md` | NEW | Canonical architecture guideline and golden implementation patterns |
| `tools/test-registry/test-registry.yaml` | UPDATE | Register unit and component test scenarios for `@origo/angular-renderer` |

### References

- [Epic 1 Retrospective](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/implementation-artifacts/epic-1-retro-2026-10-11.md#Section-5) — Action Item 4 and Epic 2 Kickoff Prerequisites.
- [Phase 2 Architecture Spine](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/ARCHITECTURE-SPINE.md) — Angular Standalone & Component Invariants.
- [Component Invariants Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/component-invariants.md) — 6 Non-Negotiable Invariants and Shadow DOM rules.
- [SCSS and Design Tokens Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/scss-and-tokens.md) — Token taxonomy and CSS logical properties.
- [Test Quality Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/testing-primitives.md) — Real Shadow DOM testing patterns.
- [Epics Document](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/epics.md#L105) — Z-Index Portals and Story 2.2 specifications.

---

## Dev Agent Record

### Agent Model Used

Gemini 3.8 Flash (High)

### Debug Log References

- Validated with BMad Method create-story engine against project architecture spine, retro findings, and custom rules (`_bmad/custom/bmad-create-story.toml`).
- Analyzed existing `packages/angular-renderer/src/components/primitives/select/` to identify overflow clipping and token isolation constraints.
- Verified monorepo package setup in `packages/angular-renderer/package.json` and root `package.json`.
- Enforced SSR safety (`isPlatformBrowser`, `DOCUMENT`), CSP styling restrictions, DestroyRef teardown, and public index.ts exports.

### Completion Notes List

- Story file comprehensively validated and optimized for LLM developer agent execution.
- Includes 7 exhaustive Acceptance Criteria with explicit references to ADRs and technical spikes as mandated by project rules.
- Defines clear task breakdown spanning monorepo dependency alignment, spike harness, token inheritance, CDK/overlay service standardization, architectural documentation, and test registry hygiene.
- Provides concrete TypeScript interface contracts and an explicit Code Files to Create / Update ledger.

### File List

- `_bmad-output/implementation-artifacts/stories/retro-1-overlay-portal-architecture.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
