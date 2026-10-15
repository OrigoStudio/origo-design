---
story_id: "2.3"
story_key: 2-3-messaging-and-notification-components
baseline_commit: f3967d8
epic: 2
status: "done"
---

# Story 2.3: Messaging & Notification Components

Status: done

<!-- Note: Validated against quality competition checklist. Ready for dev-story implementation. -->

## Story

As a developer,  
I want to use comprehensive messaging, alert, toast, snackbar, and banner primitives (`Alert`, `Toast`, `Snackbar`, `Banner`),  
So that I can deliver accessible, contextual, transient, and system-wide feedback to users without breaking Shadow DOM encapsulation, crashing during SSR hydration, trapping pointer events, or violating strict Content Security Policies.

---

## Acceptance Criteria

1. **[AC-1] Semantic Severity & Design Token Visual Substrate (ADR: AD-6, NFR-I18N-001, FR4):**
   - **Given** an Origo Angular 18/22 standalone rendering environment with `ViewEncapsulation.ShadowDom`,
   - **When** any messaging primitive (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`) is rendered,
   - **Then** it must render with the exact semantic design token colors for the specified severity:
     - `info`: Surface/border/icon bound to `--origo-color-surface-subtle` (fallback `#eff6ff`), `--origo-color-border-info` (fallback `#bfdbfe`), `--origo-color-text-info` (fallback `#1e40af`).
     - `success`: Surface/border/icon bound to `--origo-color-surface-success` (fallback `#ecfdf5`), `--origo-color-border-success` (fallback `#a7f3d0`), `--origo-color-text-success` (fallback `#065f46`).
     - `warn` / `warning`: Surface/border/icon bound to `--origo-color-surface-warning` (fallback `#fffbeb`), `--origo-color-border-warning` (fallback `#fde68a`), `--origo-color-text-warning` (fallback `#92400e`).
     - `error`: Surface/border/icon bound to `--origo-color-surface-danger` (fallback `#fef2f2`), `--origo-color-border-danger` (fallback `#fecaca`), `--origo-color-text-danger` (fallback `#991b1b`).
   - **And** all component styles must strictly use CSS Logical Properties (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `border-inline-start`, `max-inline-size`, `max-block-size`) with zero physical coordinates, guaranteeing 100% automated Right-to-Left (RTL) layout mirroring under `dir="rtl"`.
   - **And** accent indicators must use `border-inline-start` so border accents mirror symmetrically in RTL.
   - **And** all stylesheets must contain zero hardcoded color hex values or pixel literals outside documented fallback expressions.

2. **[AC-2] Accessible ARIA Live Region & Screen Reader Semantics (ADR: P1-AD-6, FR-A11Y-001, Global System AC-4):**
   - **Given** any messaging or notification component displayed in the UI,
   - **When** rendered or dynamically inserted into the DOM,
   - **Then** screen readers must be notified via correct ARIA live region semantics:
     - For error or warning messages: `role="alert"` and `aria-live="assertive"`, `aria-atomic="true"`.
     - For info or success messages: `role="status"` and `aria-live="polite"`, `aria-atomic="true"`.
     - For system banners: `role="region"` and `[attr.aria-label]="computedTitle() || 'System announcement'"`.
   - **And** all interactive controls (dismiss/close buttons, action buttons) must be semantic `<button type="button">` elements with explicit `aria-label` (e.g. `"Close alert"`, `"Close notification"`), operable via keyboard (`Enter`, `Space`, `Tab`, `Escape`).
   - **And** all components must pass automated accessibility audits with zero WCAG 2.1 AA violations.

3. **[AC-3] Alert & Message Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.1, 7.3):**
   - **Given** an inline or block messaging requirement in an application flow or form,
   - **When** `AlertComponent` (`origo-alert`) is instantiated via BADL contract with key `'Alert'` or `'Message'`,
   - **Then** it must render contextual feedback supporting:
     - `visible`: Boolean toggle (default `true`) controlling element visibility.
     - `severity`: `'info' | 'success' | 'warn' | 'warning' | 'error'` (default `'info'`).
     - `title`: Optional bold alert heading.
     - `message`: Alert body content (also accepts `text` for seamless backwards compatibility with BADL `Message` payloads).
     - `icon`: Optional custom icon string, or auto-derived semantic icon if not provided.
     - `closable`: Boolean toggle (default `false`) controlling visibility of close action button.
     - `variant`: Visual style (`'standard'` | `'outlined'` | `'filled'`, default `'standard'`).
     - `actions`: Optional array of interactive actions (`{ label: string; action: string; variant?: string }`).
     - `life`: Optional duration in ms; when > 0, auto-dismisses after the specified delay.
   - **And** closing the alert emits `close = output<void>()`, `visibleChange = output<boolean>()`, and dispatches state update `updateState(id, 'visible', false)`.
   - **And** clicking an action button emits `action = output<{ action: string; data?: unknown }>()` and dispatches capability `dispatchCapability(id, actionName, payload)`.

4. **[AC-4] Toast & Floating Notification Portal Substrate (ADR: P1-AD-5, Spike: retro-1, API Spec 7.2):**
   - **Given** a transient toast notification request,
   - **When** `ToastComponent` (`origo-toast`) is instantiated or triggered,
   - **Then** the floating toast container MUST project outside the component's ShadowRoot into `document.body` via `OrigoOverlayService`, escaping all parent container overflow clipping boundaries and z-index trapping.
   - **And** the container MUST support configurable screen positions via `position` input:
     - Top positions: `'top-start'`, `'top-center'`, `'top-end'`, `'top-left'`, `'top-right'`.
     - Bottom positions: `'bottom-start'`, `'bottom-center'`, `'bottom-end'`, `'bottom-left'`, `'bottom-right'`.
     - Default position: `'top-end'`.
   - **And** `.origo-overlay-pane--toast` MUST declare `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;` so the overlay container does NOT render an opaque box or block user clicks to underlying page elements.
   - **And** individual toast items (`.origo-toast__item`) inside the projected container MUST declare `pointer-events: auto;`.
   - **And** `ToastComponent` maintains a single CDK overlay per position hosting a reactive list of stacked `ToastMessage[]` with vertical gap (`display: flex; flex-direction: column; gap: var(--origo-space-sm, 0.5rem);`).
   - **And** each toast item must support auto-dismissal governed by `life` (default `3000ms`, 0 = persistent), with individual manual close button (`closable: true`, default `true`), emitting `close = output<ToastMessage>()`.
   - **And** hovering over a toast panel must pause its auto-dismiss timer; unhovering must resume the timer using remaining elapsed time calculations.
   - **And** duplicate suppression (`preventDuplicates: true`, default `false`) must prevent stacking duplicate messages with identical severity and summary/content.
   - **And** a companion `OrigoToastService` (`@Injectable({ providedIn: 'root' })`) must be provided for imperative notification dispatch (`show(message)`, `info()`, `success()`, `warn()`, `error()`, `clear(group?)`) alongside declarative BADL contract binding.

5. **[AC-5] Snackbar Transient Action Bar Substrate (ADR: P1-AD-1, P1-AD-5, Global System AC-1, FR4):**
   - **Given** an operation confirmation or transient status update (e.g. "Record deleted", "Changes saved"),
   - **When** `SnackbarComponent` (`origo-snackbar`) is displayed,
   - **Then** it MUST project into `document.body` via `OrigoOverlayService` with default `'bottom-center'` alignment (or configurable `'bottom-start'`, `'bottom-end'`, `'top-center'`, `'top-start'`, `'top-end'`).
   - **And** `.origo-overlay-pane--snackbar` MUST declare `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;` so it does not trap clicks outside the bar.
   - **And** the inner `.origo-snackbar__bar` must declare `pointer-events: auto;`.
   - **And** it must display a concise message with an optional single action button (e.g. `"Undo"`, `"Retry"`), accepting both `action` and `actionLabel` prop keys.
   - **And** clicking the action button must emit `actionClick = output<void>()`, dispatch capability `dispatchCapability(id, 'action', {})`, and close the snackbar.
   - **And** the snackbar must automatically dismiss after `duration` ms (accepting `life` as alias, default `4000ms`, 0 = persistent), emitting `close = output<void>()` and updating state `updateState(id, 'visible', false)`.
   - **And** manual close button (`closable: true`, default `false`) must allow immediate dismissal.

6. **[AC-6] Banner System-Wide Announcement Substrate (ADR: P1-AD-1, P1-AD-5, API Spec 7.1, FR4):**
   - **Given** an important system announcement, maintenance notice, or compliance alert,
   - **When** `BannerComponent` (`origo-banner`) is rendered,
   - **Then** it must render a full-width (`fluid: true`, default `true`) announcement bar spanning 100% of the container or viewport.
   - **And** it must support `sticky: true` (default `false`) pinning to the top of the container/viewport via CSS Logical sticky positioning (`position: sticky; inset-block-start: 0; z-index: var(--origo-z-sticky, 100);`).
   - **And** it must render severity icons, bold title, description message (accepting `message` or `text`), an action button array (`actions`), and an optional dismiss button (`closable: true`, default `false`).
   - **And** it must implement `ContainerComponent` with `<ng-container #vc>` and content projection (`<ng-content>`) to allow dynamic child AST subtrees within banner layouts.

7. **[AC-7] Angular Standalone, Signals Reactivity & Runtime Property Coercion (ADR: P1-AD-1):**
   - **Given** incoming BADL AST payloads,
   - **When** messaging primitives are instantiated,
   - **Then** all four components (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`) must be Angular Standalone components with `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`, consuming inputs via Angular Signals (`input.required<InteractionContract<T>>()`, `computed()`), and emitting typed outputs (`output()`).
   - **And** each component must define `static readonly contractSchema` covering 100% of defined properties and aliases (`visible`, `text`, `actionLabel`, `life`, `severity`, etc.) and invoke `coerceContractProps()` on incoming `this.contract().props` to guard against runtime property stripping or crashes from malformed JSON payloads.
   - **And** all components implementing `ContainerComponent` (`AlertComponent`, `BannerComponent`) must declare optional signal query `vc = viewChild('vc', { read: ViewContainerRef })`. Using `viewChild.required('vc')` is strictly FORBIDDEN to eliminate fatal runtime error `NG0951` during template attachment.
   - **And** leaf primitives (`ToastComponent`, `SnackbarComponent`) do NOT implement `ContainerComponent` to avoid unnecessary slot overhead.

8. **[AC-8] State Synchronization & Capability Dispatch (ADR: AD-11):**
   - **Given** user interactions and visibility changes (dismissal, action click, auto-dismiss timeout),
   - **When** a messaging state transitions,
   - **Then** the component must emit corresponding typed outputs (`visibleChange`, `close`, `action`, `show`, `actionClick`) and synchronize state via `WebExperienceAdapterService`:
     - `updateState(id, 'visible', isVisible)`
     - `dispatchCapability(id, capabilityName, payload)`

9. **[AC-9] Metadata Hooks & Test Selectors (ADR: AD-12):**
   - **Given** any messaging component instance (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`),
   - **When** rendered from a BADL payload,
   - **Then** it must expose standard metadata hooks (`permissions`, `rules`, `metadata`, `aria-label`, `aria-describedby`) and bind `[attr.data-testid]="contract().id"` on both the host element and any projected overlay panels.

10. **[AC-10] Server-Side Rendering (SSR) & Content Security Policy (CSP) Compliance (Global System AC-1, AC-2):**
    - **Given** strict enterprise SSR and Content Security Policy environments,
    - **When** messaging components and overlay panels are initialized and mounted,
    - **Then** direct access to browser DOM globals (`window`, `document`) must be strictly guarded via `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
    - **And** timer handles (`setTimeout`, `setInterval`) must be cleanly cleared and disposed upon component teardown via `DestroyRef.onDestroy()`.
    - **And** zero inline `style="..."` attributes may be injected onto body nodes; all floating styles must be governed strictly through predefined CSS classes in `packages/angular-renderer/src/styles/overlay.scss` (`.origo-overlay-pane--toast`, `.origo-overlay-pane--snackbar`) and CSS custom properties.

11. **[AC-11] Definition of Done (DoD), Registration & Central Test Registry (DoD: docs/definition-of-done.md, ADR: AD-11, AD-12):**
    - **Given** completion of the messaging components,
    - **When** prepared for release,
    - **Then** all primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`:
      - `'Alert'` -> `AlertComponent`
      - `'Message'` -> `AlertComponent` (alias/interchangeable)
      - `'Toast'` -> `ToastComponent`
      - `'Snackbar'` -> `SnackbarComponent`
      - `'Banner'` -> `BannerComponent`
    - **And** exported from `packages/angular-renderer/src/index.ts`.
    - **And** `tools/test-registry/test-registry.yaml` MUST be updated with five new test suite entries:
      - `renderer-primitive-alert` (`packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts`)
      - `renderer-primitive-toast` (`packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts`)
      - `renderer-service-toast` (`packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts`)
      - `renderer-primitive-snackbar` (`packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts`)
      - `renderer-primitive-banner` (`packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts`)
      each specifying `affected_stories: [2-3-messaging-and-notification-components]` and type `unit`.

12. **[AC-12] Architectural Scope & Deferred Primitives (ADR: P1-AD-5, PRD Epic 1.4):**
    - **Given** the Phase 2 component roadmap,
    - **When** implementing Story 2.3,
    - **Then** scope is strictly bounded to `AlertComponent`, `ToastComponent`, `SnackbarComponent`, and `BannerComponent`.
    - **And** `NotificationCenter` (complex inbox/notification drawer), `InlineValidation` (form-field error decorators), audio chimes, and browser Web Push notifications are explicitly out of scope for Story 2.3 and deferred to subsequent stories.

---

## Tasks / Subtasks

- [x] Task 1: Overlay Infrastructure & Global Position Strategy Enhancement (AC: 1, 4, 5, 10)
  - [x] 1.1 Update `OrigoGlobalPositionAlignment` in `packages/angular-renderer/src/lib/overlay/overlay.models.ts` to include 8-point corner alignments: `'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`.
  - [x] 1.2 Update `OrigoOverlayService.buildPositionStrategy()` in `packages/angular-renderer/src/lib/overlay/overlay.service.ts` using CDK's native methods (`.top()`, `.bottom()`, `.left()`, `.right()`, `.centerHorizontally()`) and explicit RTL direction branching:
    - `'top-start'`: `global.top(0); direction === 'rtl' ? global.right(0) : global.left(0);`
    - `'top-end'`: `global.top(0); direction === 'rtl' ? global.left(0) : global.right(0);`
    - `'top-center'`: `global.top(0).centerHorizontally();`
    - `'bottom-start'`: `global.bottom(0); direction === 'rtl' ? global.right(0) : global.left(0);`
    - `'bottom-end'`: `global.bottom(0); direction === 'rtl' ? global.left(0) : global.right(0);`
    - `'bottom-center'`: `global.bottom(0).centerHorizontally();`
    - Corner coordinates: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`.
  - [x] 1.3 Add `.origo-overlay-pane--toast` and `.origo-overlay-pane--snackbar` modifier classes to `packages/angular-renderer/src/styles/overlay.scss` with:
    - `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;`
    - Inner item cards (`.origo-toast__item`, `.origo-snackbar__bar`) set to `pointer-events: auto;`.
    - Logical padding/margins for viewport clearance.
  - [x] 1.4 Update `packages/angular-renderer/src/lib/overlay/overlay.service.spec.ts` to verify corner position strategy resolution in LTR and RTL.

- [x] Task 2: Implement AlertComponent (`origo-alert`) (AC: 1, 2, 3, 7, 8, 9, 10)
  - [x] 2.1 Create component files under `packages/angular-renderer/src/components/primitives/alert/`:
    - `alert.component.ts`
    - `alert.component.html`
    - `alert.component.scss`
    - `alert.component.spec.ts`
  - [x] 2.2 Define `AlertProps` interface and `static readonly contractSchema` supporting `visible`, `severity`, `title`, `message`, `text`, `icon`, `closable`, `variant`, `actions`, `life`, `permissions`, `rules`, `metadata`, `'aria-label'`, `'aria-describedby'`.
  - [x] 2.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
  - [x] 2.4 Bind ARIA attributes: `role="alert"` / `aria-live="assertive"` for error/warn; `role="status"` / `aria-live="polite"` for info/success.
  - [x] 2.5 Implement auto-dismiss timer when `life > 0` with safe cleanup via `DestroyRef.onDestroy()`.
  - [x] 2.6 Implement action button click dispatching (`action = output()`, `dispatchCapability()`) and close dismissal (`close = output()`, `updateState()`).
  - [x] 2.7 Author comprehensive unit test suite in `alert.component.spec.ts` asserting DOM rendering across shadow boundaries, severity classes, ARIA roles, action clicks, timer dismissals, and null-safe contract handling.

- [x] Task 3: Implement ToastComponent (`origo-toast`) & OrigoToastService (AC: 1, 2, 4, 7, 8, 9, 10)
  - [x] 3.1 Create component files under `packages/angular-renderer/src/components/primitives/toast/`:
    - `toast.component.ts`
    - `toast.component.html`
    - `toast.component.scss`
    - `toast.component.spec.ts`
    - `toast.models.ts`
    - `toast.service.ts`
    - `toast.service.spec.ts`
  - [x] 3.2 Define `ToastProps` and `ToastMessage` interfaces and `static readonly contractSchema` supporting `messages`, `position`, `life`, `closable`, `preventDuplicates`, `group`, `severity`, `summary`, `detail`, `message`, `icon`, `sticky`, `breakpoints`, metadata hooks.
  - [x] 3.3 Implement `OrigoToastService` (`@Injectable({ providedIn: 'root' })`) managing reactive toast messages via Signals with methods `show(msg)`, `info()`, `success()`, `warn()`, `error()`, `clear(group?)`.
  - [x] 3.4 Implement single floating portal overlay per position via `OrigoOverlayService` hosting a vertical flex container (`display: flex; flex-direction: column; gap: var(--origo-space-sm);`).
  - [x] 3.5 Implement per-message auto-dismiss timers via `Map<string, { timeoutId, startTime, remaining }>` supporting pause-on-hover (`mouseenter` / `mouseleave`), manual dismissal, and leak-free destruction.
  - [x] 3.6 Implement ARIA live region wrapping toast items with `role="region"`, `aria-label="Notifications"`, and dynamic `aria-live` levels per message severity.
  - [x] 3.7 Author unit test suites in `toast.component.spec.ts` and `toast.service.spec.ts` asserting overlay mounting, multi-toast stacking, pause-on-hover timers, dismiss events, DOM isolation in `afterEach()`, and SSR guardrails.

- [x] Task 4: Implement SnackbarComponent (`origo-snackbar`) (AC: 1, 2, 5, 7, 8, 9, 10)
  - [x] 4.1 Create component files under `packages/angular-renderer/src/components/primitives/snackbar/`:
    - `snackbar.component.ts`
    - `snackbar.component.html`
    - `snackbar.component.scss`
    - `snackbar.component.spec.ts`
  - [x] 4.2 Define `SnackbarProps` interface and `static readonly contractSchema` supporting `visible`, `message`, `action`, `actionLabel`, `duration`, `life`, `position`, `severity`, `closable`, metadata hooks.
  - [x] 4.3 Implement Standalone, Shadow DOM, OnPush, and portal projection via `OrigoOverlayService` with `'bottom-center'` default and `pointer-events: none` on container pane.
  - [x] 4.4 Implement `actionClick = output<void>()`, `visibleChange = output<boolean>()`, auto-dismissal via `duration` timer with `DestroyRef` cleanup.
  - [x] 4.5 Implement ARIA `role="status"` and `aria-live="polite"`.
  - [x] 4.6 Author unit test suite in `snackbar.component.spec.ts` asserting bottom portal mounting, action button clicks, auto-dismiss timers, DOM cleanup in `afterEach()`, and escape dismissal.

- [x] Task 5: Implement BannerComponent (`origo-banner`) (AC: 1, 2, 6, 7, 8, 9, 10)
  - [x] 5.1 Create component files under `packages/angular-renderer/src/components/primitives/banner/`:
    - `banner.component.ts`
    - `banner.component.html`
    - `banner.component.scss`
    - `banner.component.spec.ts`
  - [x] 5.2 Define `BannerProps` interface and `static readonly contractSchema` supporting `visible`, `severity`, `title`, `message`, `text`, `icon`, `closable`, `sticky`, `fluid`, `variant`, `actions`, `life`, metadata hooks.
  - [x] 5.3 Implement Standalone, Shadow DOM, OnPush, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
  - [x] 5.4 Implement sticky pinning via CSS Logical sticky positioning (`position: sticky; inset-block-start: 0;`).
  - [x] 5.5 Bind ARIA `role="region"`, `[attr.aria-label]="computedTitle() || 'System announcement'"`, and dynamic live region announcements.
  - [x] 5.6 Author unit test suite in `banner.component.spec.ts` asserting full-width layout, sticky classes, action triggers, dismissal, and content projection.

- [x] Task 6: Monorepo Registration, Exports & Central Test Registry (AC: 11)
  - [x] 6.1 Register primitives in `packages/angular-renderer/src/lib/primitives.provider.ts`:
    - `'Alert'`: `AlertComponent`
    - `'Message'`: `AlertComponent`
    - `'Toast'`: `ToastComponent`
    - `'Snackbar'`: `SnackbarComponent`
    - `'Banner'`: `BannerComponent`
  - [x] 6.2 Export all new components, services, and models in `packages/angular-renderer/src/index.ts`.
  - [x] 6.3 Register test suites in `tools/test-registry/test-registry.yaml`:
    - `renderer-primitive-alert`
    - `renderer-primitive-toast`
    - `renderer-service-toast`
    - `renderer-primitive-snackbar`
    - `renderer-primitive-banner`
  - [x] 6.4 Run full monorepo test suite (`npm test`) and lint checks (`npx nx lint angular-renderer`) to verify zero regressions.
  - [x] 6.5 Update `sprint-status.yaml` marking `2-3-messaging-and-notification-components` as `review`.

### Review Findings

- [x] [Review][Patch] Quadratic Toast Duplication on Reactive Service Sync [packages/angular-renderer/src/components/primitives/toast/toast.component.ts:163]
- [x] [Review][Patch] ToastComponent Ignores OrigoToastService.clear() [packages/angular-renderer/src/components/primitives/toast/toast.component.ts:163]
- [x] [Review][Patch] Orphaned CDK Overlay Container Retained When Toasts Empty & Ignored Repositioning [packages/angular-renderer/src/components/primitives/toast/toast.component.ts:176]
- [x] [Review][Patch] Missing allowSignalWrites: true or Untracked Signal Mutation in Constructor Effects [packages/angular-renderer/src/components/primitives/alert/alert.component.ts:142]
- [x] [Review][Patch] Initial visible: false Contract Causes Visibility Flash in Alert and Banner [packages/angular-renderer/src/components/primitives/alert/alert.component.ts:98]
- [x] [Review][Patch] Missing :host([hidden]) and Host Resets in Alert and Banner SCSS [packages/angular-renderer/src/components/primitives/alert/alert.component.scss:1]
- [x] [Review][Patch] Hardcoded rgba(...) Color Literals in Stylesheets [packages/angular-renderer/src/components/primitives/alert/alert.component.scss:83]
- [x] [Review][Patch] Duplicate Tracking Keys in Action @for Loops [packages/angular-renderer/src/components/primitives/alert/alert.component.html:68]
- [x] [Review][Patch] Missing warning Severity Mapping and Style in Snackbar [packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.ts:98]
- [x] [Review][Patch] Missing aria-atomic="true" and Non-Dynamic Live Region in Snackbar and Banner [packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.html:4]
- [x] [Review][Patch] Overlay Panels Append -portal to data-testid and Omit aria-describedby [packages/angular-renderer/src/components/primitives/toast/toast.component.html:6]
- [x] [Review][Patch] BannerProps.severity TypeScript Union Omits warning [packages/angular-renderer/src/components/primitives/banner/banner.component.ts:25]
- [x] [Review][Patch] Missing WebExperienceAdapterService State Synchronization in ToastComponent [packages/angular-renderer/src/components/primitives/toast/toast.component.ts:53]
- [x] [Review][Patch] Indiscriminate Document-Level Escape Listener in SnackbarComponent [packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.ts:157]

---

## Dev Notes

### Architecture Patterns & Invariants to Enforce

1. **Standalone & Shadow DOM (Invariant 1, ADR: P1-AD-1):**
   - Every component must declare `standalone: true`, `encapsulation: ViewEncapsulation.ShadowDom`, and `changeDetection: ChangeDetectionStrategy.OnPush`.
   - Host binding: `[attr.data-testid]="contract().id"`.

2. **Signals Reactivity (Invariant 3, ADR: P1-AD-1):**
   - Inputs must use `input.required<InteractionContract<TProps>>()`.
   - Derived states must use `computed()`.
   - Events must use `output<T>()`.
   - No direct property mutation; no unmanaged RxJS subscriptions.

3. **Runtime Contract Coercion & Schema (Invariant 4, ADR: P1-AD-4):**
   - Every component must implement `OrigoAdapter<TProps>`.
   - Must define `static readonly contractSchema` covering all defined properties and aliases.
   - Must call `coerceContractProps()` on incoming `this.contract().props` in constructor or computed signal.

4. **Composition Slots & ViewContainerRef (Invariant 5, ADR: P1-AD-5):**
   - Components implementing `ContainerComponent` (`AlertComponent`, `BannerComponent`) must declare optional signal query:
     ```typescript
     readonly vc = viewChild('vc', { read: ViewContainerRef });
     ```
   - **CRITICAL ANTI-PATTERN TO AVOID:** Do NOT use `viewChild.required('vc')`. Query resolution fails with fatal runtime error `NG0951` when `#vc` is hosted within unattached `<ng-template>` views.
   - Leaf primitives (`ToastComponent`, `SnackbarComponent`) do NOT implement `ContainerComponent`.

5. **Angular CDK Overlay & Portal Substrate (ADR: P1-AD-5, Spike: retro-1):**
   - `ToastComponent` and `SnackbarComponent` project into `document.body` via `OrigoOverlayService`.
   - Overlay containers MUST set `pointer-events: none` on the pane and `pointer-events: auto` on inner cards so background elements remain clickable.
   - Clean up overlay refs on teardown via `DestroyRef.onDestroy()`.

6. **SSR & Browser Guardrails (Global System AC-2):**
   - Guard direct DOM and browser APIs with `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
   - In non-browser environments, `OrigoOverlayService` returns `OrigoNoopOverlayRef` ensuring zero crashes during SSR.

7. **Zero-Literal Design Tokens & RTL Mirroring (ADR: AD-6, NFR-I18N-001):**
   - Strictly consume `var(--origo-*)` tokens with documented semantic fallbacks.
   - Use CSS Logical Properties exclusively (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `border-inline-start`, `inline-size`, `block-size`).
   - Zero physical directional properties (`left`, `right`, `padding-left`, `margin-right`).

---

### CDK GlobalPositionStrategy Alignment Reference

CDK Overlay `GlobalPositionStrategy` does not support `.start()` or `.end()`. Map alignments in `overlay.service.ts` using native methods:

| Position Config | CDK GlobalPositionStrategy Call (LTR) | CDK GlobalPositionStrategy Call (RTL) |
|---|---|---|
| `'top-start'` | `global.top('0').left('0')` | `global.top('0').right('0')` |
| `'top-center'` | `global.top('0').centerHorizontally()` | `global.top('0').centerHorizontally()` |
| `'top-end'` | `global.top('0').right('0')` | `global.top('0').left('0')` |
| `'bottom-start'` | `global.bottom('0').left('0')` | `global.bottom('0').right('0')` |
| `'bottom-center'` | `global.bottom('0').centerHorizontally()` | `global.bottom('0').centerHorizontally()` |
| `'bottom-end'` | `global.bottom('0').right('0')` | `global.bottom('0').left('0')` |
| `'top-left'` | `global.top('0').left('0')` | `global.top('0').left('0')` |
| `'top-right'` | `global.top('0').right('0')` | `global.top('0').right('0')` |
| `'bottom-left'` | `global.bottom('0').left('0')` | `global.bottom('0').left('0')` |
| `'bottom-right'` | `global.bottom('0').right('0')` | `global.bottom('0').right('0')` |

---

### Timer Management & Pause-on-Hover Pattern

For `ToastComponent` with multiple auto-dismiss timers:

```typescript
interface ActiveToastTimer {
  timeoutId: ReturnType<typeof setTimeout>;
  startTime: number;
  remaining: number;
}

export class ToastComponent {
  private readonly timers = new Map<string, ActiveToastTimer>();
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearAllTimers());
  }

  private startTimer(id: string, duration: number): void {
    this.clearTimer(id);
    const timeoutId = setTimeout(() => this.dismiss(id), duration);
    this.timers.set(id, { timeoutId, startTime: Date.now(), remaining: duration });
  }

  onItemMouseEnter(id: string): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    clearTimeout(timer.timeoutId);
    const elapsed = Date.now() - timer.startTime;
    timer.remaining = Math.max(0, timer.remaining - elapsed);
  }

  onItemMouseLeave(id: string): void {
    const timer = this.timers.get(id);
    if (!timer || timer.remaining <= 0) return;
    timer.startTime = Date.now();
    timer.timeoutId = setTimeout(() => this.dismiss(id), timer.remaining);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer.timeoutId);
      this.timers.delete(id);
    }
  }

  private clearAllTimers(): void {
    this.timers.forEach((t) => clearTimeout(t.timeoutId));
    this.timers.clear();
  }
}
```

---

### Keyboard Navigation & A11y Focus Matrix

| Component | Target Element | Key | Behavior |
|---|---|---|---|
| `AlertComponent` | Action Button | `Enter` / `Space` | Dispatches action capability and emits `action` output |
| `AlertComponent` | Close Button | `Enter` / `Space` / `Escape` | Closes alert, updates state `visible: false` |
| `ToastComponent` | Close Button | `Enter` / `Space` | Closes individual toast item, emits `close` |
| `ToastComponent` | Active Toast Container | `Escape` | Closes top-most / most recent toast item |
| `SnackbarComponent` | Action Button | `Enter` / `Space` | Dispatches action capability, closes snackbar |
| `SnackbarComponent` | Close Button | `Enter` / `Space` / `Escape` | Closes snackbar immediately |
| `BannerComponent` | Action / Close Buttons | `Enter` / `Space` / `Tab` | Navigates and activates interactive buttons |

---

### Component API Specifications

#### 1. `AlertComponent` (`origo-alert`)
- **Registry Keys:** `'Alert'`, `'Message'`
- **Selector:** `origo-alert`
- **Inputs (`AlertProps`):**
  ```typescript
  export interface AlertAction {
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'text';
  }

  export interface AlertProps {
    visible?: boolean;                                            // Visibility toggle (default true)
    severity?: 'info' | 'success' | 'warn' | 'warning' | 'error'; // default 'info'
    title?: string;                                               // Alert title
    message?: string;                                             // Alert description
    text?: string;                                                // Message API alias for message
    icon?: string;                                                // Custom icon or emoji
    closable?: boolean;                                           // Dismiss action toggle (default false)
    variant?: 'standard' | 'outlined' | 'filled';                 // Visual variant (default 'standard')
    actions?: AlertAction[];                                      // Interactive action buttons
    life?: number;                                                // Auto-dismiss duration in ms (0 = persistent)
    permissions?: Record<string, string>;
    rules?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    'aria-label'?: string;
    'aria-describedby'?: string;
  }
  ```
- **Outputs:**
  - `close = output<void>()`
  - `action = output<{ action: string; data?: unknown }>()`
  - `visibleChange = output<boolean>()`
- **Contract Schema:**
  ```typescript
  export const AlertContractSchema = {
    visible: 'boolean',
    severity: 'string',
    title: 'string',
    message: 'string',
    text: 'string',
    icon: 'string',
    closable: 'boolean',
    variant: 'string',
    actions: 'array',
    life: 'number',
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    'aria-label': 'string',
    'aria-describedby': 'string',
  } as const;
  ```

---

#### 2. `ToastComponent` (`origo-toast`) & `OrigoToastService`
- **Registry Key:** `'Toast'`
- **Selector:** `origo-toast`
- **Models (`ToastMessage`, `ToastProps`):**
  ```typescript
  export interface ToastMessage {
    id?: string;
    severity?: 'info' | 'success' | 'warn' | 'warning' | 'error';
    summary?: string;
    detail?: string;
    content?: string;
    message?: string;
    icon?: string;
    life?: number;
    closable?: boolean;
    sticky?: boolean;
    data?: unknown;
    group?: string;
  }

  export type ToastPosition =
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center';

  export interface ToastProps {
    messages?: ToastMessage[];
    position?: ToastPosition;                                     // default 'top-end'
    life?: number;                                                // default 3000ms
    closable?: boolean;                                           // default true
    preventDuplicates?: boolean;                                  // default false
    group?: string;                                               // channel filter
    severity?: string;                                            // Single-message prop support
    summary?: string;                                             // Single-message prop support
    detail?: string;                                              // Single-message prop support
    message?: string;                                             // Single-message prop support
    icon?: string;                                                // Single-message prop support
    sticky?: boolean;                                             // Single-message prop support
    breakpoints?: Record<string, { width: string }>;
    permissions?: Record<string, string>;
    rules?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    'aria-label'?: string;
    'aria-describedby'?: string;
  }
  ```
- **Outputs:**
  - `show = output<ToastMessage>()`
  - `close = output<ToastMessage>()`
  - `action = output<{ message: ToastMessage; action: string }>()`
- **Contract Schema:**
  ```typescript
  export const ToastContractSchema = {
    messages: 'array',
    position: 'string',
    life: 'number',
    closable: 'boolean',
    preventDuplicates: 'boolean',
    group: 'string',
    severity: 'string',
    summary: 'string',
    detail: 'string',
    message: 'string',
    icon: 'string',
    sticky: 'boolean',
    breakpoints: 'object',
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    'aria-label': 'string',
    'aria-describedby': 'string',
  } as const;
  ```
- **`OrigoToastService` API:**
  ```typescript
  @Injectable({ providedIn: 'root' })
  export class OrigoToastService {
    readonly messages = signal<ToastMessage[]>([]);
    show(message: ToastMessage): void;
    info(summary: string, detail?: string, life?: number): void;
    success(summary: string, detail?: string, life?: number): void;
    warn(summary: string, detail?: string, life?: number): void;
    error(summary: string, detail?: string, life?: number): void;
    clear(group?: string): void;
  }
  ```

---

#### 3. `SnackbarComponent` (`origo-snackbar`)
- **Registry Key:** `'Snackbar'`
- **Selector:** `origo-snackbar`
- **Inputs (`SnackbarProps`):**
  ```typescript
  export interface SnackbarProps {
    visible?: boolean;                                            // Open state (default false)
    message?: string;                                             // Concise status message
    action?: string;                                              // Optional action label (e.g. 'Undo')
    actionLabel?: string;                                         // Alias for action
    duration?: number;                                            // Auto-close duration in ms (default 4000)
    life?: number;                                                // Alias for duration
    position?: 'bottom-center' | 'bottom-start' | 'bottom-end' | 'top-center' | 'top-start' | 'top-end'; // default 'bottom-center'
    severity?: 'info' | 'success' | 'warn' | 'error';             // default 'info'
    closable?: boolean;                                           // Close button toggle (default false)
    permissions?: Record<string, string>;
    rules?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    'aria-label'?: string;
    'aria-describedby'?: string;
  }
  ```
- **Outputs:**
  - `visibleChange = output<boolean>()`
  - `open = output<void>()`
  - `close = output<void>()`
  - `actionClick = output<void>()`
- **Contract Schema:**
  ```typescript
  export const SnackbarContractSchema = {
    visible: 'boolean',
    message: 'string',
    action: 'string',
    actionLabel: 'string',
    duration: 'number',
    life: 'number',
    position: 'string',
    severity: 'string',
    closable: 'boolean',
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    'aria-label': 'string',
    'aria-describedby': 'string',
  } as const;
  ```

---

#### 4. `BannerComponent` (`origo-banner`)
- **Registry Key:** `'Banner'`
- **Selector:** `origo-banner`
- **Inputs (`BannerProps`):**
  ```typescript
  export interface BannerAction {
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'text';
  }

  export interface BannerProps {
    visible?: boolean;                                            // default true
    severity?: 'info' | 'success' | 'warn' | 'error';             // default 'info'
    title?: string;                                               // Bold title/summary
    message?: string;                                             // Detailed announcement
    text?: string;                                                // Alias for message
    icon?: string;                                                // Custom icon
    closable?: boolean;                                           // Dismiss toggle (default false)
    sticky?: boolean;                                             // Fixed to top of container/viewport (default false)
    fluid?: boolean;                                              // Full width 100% (default true)
    variant?: 'standard' | 'outlined' | 'filled';                 // Visual variant (default 'standard')
    actions?: BannerAction[];                                     // Action button array
    life?: number;                                                // Auto-dismiss duration in ms (0 = persistent)
    permissions?: Record<string, string>;
    rules?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    'aria-label'?: string;
    'aria-describedby'?: string;
  }
  ```
- **Outputs:**
  - `visibleChange = output<boolean>()`
  - `close = output<void>()`
  - `action = output<{ action: string }>()`
- **Contract Schema:**
  ```typescript
  export const BannerContractSchema = {
    visible: 'boolean',
    severity: 'string',
    title: 'string',
    message: 'string',
    text: 'string',
    icon: 'string',
    closable: 'boolean',
    sticky: 'boolean',
    fluid: 'boolean',
    variant: 'string',
    actions: 'array',
    life: 'number',
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    'aria-label': 'string',
    'aria-describedby': 'string',
  } as const;
  ```

---

### Existing Code to Update

1. **`packages/angular-renderer/src/lib/overlay/overlay.models.ts`:**
   - **Current State:** `OrigoGlobalPositionAlignment` only supports `'center' | 'top' | 'bottom' | 'start' | 'end'`.
   - **Changes:** Add `'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`.
   - **Preserve:** All existing overlay config interfaces, methods, and types.

2. **`packages/angular-renderer/src/lib/overlay/overlay.service.ts`:**
   - **Current State:** `buildPositionStrategy()` maps global positions only to 5 basic alignments.
   - **Changes:** Add corner position mapping in `buildPositionStrategy()` handling `top-start`, `top-end`, `bottom-start`, `bottom-end`, and directional mirroring in RTL using native CDK position methods.
   - **Preserve:** Connected position strategies, backdrop handling, theme scope resolution, direction detection.

3. **`packages/angular-renderer/src/styles/overlay.scss`:**
   - **Current State:** Contains panel modifiers for dialog, drawer, popover, tooltip.
   - **Changes:** Add `.origo-overlay-pane--toast` and `.origo-overlay-pane--snackbar` with `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;` and CSS Logical Properties.
   - **Preserve:** All existing CDK container, backdrop, modal, drawer, popover, and tooltip rules.

4. **`packages/angular-renderer/src/lib/primitives.provider.ts`:**
   - **Current State:** Registers 42 primitives (through Story 2.2).
   - **Changes:** Add imports and map entries for `'Alert'`, `'Message'`, `'Toast'`, `'Snackbar'`, and `'Banner'`.
   - **Preserve:** All existing primitive registrations.

5. **`packages/angular-renderer/src/index.ts`:**
   - **Current State:** Exports all components up to Tooltip.
   - **Changes:** Export `AlertComponent`, `ToastComponent`, `OrigoToastService`, `SnackbarComponent`, `BannerComponent`, and their respective interfaces.
   - **Preserve:** All existing exports.

6. **`tools/test-registry/test-registry.yaml`:**
   - **Current State:** Central test cases ledger ending at `renderer-primitive-tooltip`.
   - **Changes:** Append test cases for `renderer-primitive-alert`, `renderer-primitive-toast`, `renderer-service-toast`, `renderer-primitive-snackbar`, and `renderer-primitive-banner`.
   - **Preserve:** Schema version, all existing test cases, and test isolation comments.

---

### Testing Standards Summary

- **Shadow DOM Piercing:** For `AlertComponent` and `BannerComponent`, assertions must pierce `fixture.nativeElement.shadowRoot` to inspect encapsulated elements (`button`, `role="alert"`, `.origo-alert__title`).
- **Overlay DOM Piercing:** For `ToastComponent` and `SnackbarComponent`, because panels project to `document.body` via `OrigoOverlayService`, assertions must query `document.body.querySelector('.origo-toast-item')` or `document.body.querySelector('.origo-snackbar-bar')`.
- **Test Isolation Cleanup:** In `afterEach()` of all overlay tests, explicitly remove `.cdk-overlay-container` and `.origo-overlay-pane` elements from `document.body` to prevent leakages across tests.
- **Real DOM Event Dispatch:** Test dismissal and actions by triggering native click events (`btn.click()` or `btn.dispatchEvent(new MouseEvent('click'))`) rather than calling component methods directly.
- **Zoneless Signal Propagation:** Set inputs via `fixture.componentRef.setInput('contract', contractPayload)` and immediately invoke `fixture.detectChanges()`.
- **Timer & Auto-Dismiss Verification:** Use Angular `fakeAsync` with `tick(duration)` or Jest fake timers (`jest.useFakeTimers()`, `jest.advanceTimersByTime(ms)`) to verify auto-dismissal without real-time delays.
- **SSR & Browser Isolation:** Verify components instantiate cleanly without errors in non-browser platform contexts.
- **Central Test Registry:** Maintain 100% synchronization in `tools/test-registry/test-registry.yaml`.

---

### Project Structure Notes

- Primitives located under `packages/angular-renderer/src/components/primitives/<primitive-name>/`
- Global overlay styles located in `packages/angular-renderer/src/styles/overlay.scss`
- Test specs co-located as `<primitive-name>.component.spec.ts`
- Public exports in `packages/angular-renderer/src/index.ts`
- Primitives provider in `packages/angular-renderer/src/lib/primitives.provider.ts`
- Central Test Registry in `tools/test-registry/test-registry.yaml`

---

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Messaging & Notification Components]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 7. MESSAGES & STATUS]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/enhancements-for-origo-components.md#Section 8. Notifications / Messages]
- [Source: docs/guidelines/overlay-portal-architecture.md]
- [Source: docs/guidelines/component-invariants.md]
- [Source: docs/guidelines/scss-and-tokens.md]
- [Source: docs/guidelines/testing-primitives.md]
- [Source: docs/definition-of-done.md]
- [Source: packages/angular-renderer/src/lib/overlay/overlay.service.ts]
- [Source: packages/angular-renderer/src/lib/overlay/overlay.models.ts]
- [Source: packages/angular-renderer/src/styles/overlay.scss]

---

## Dev Agent Record

### Agent Model Used

Gemini 3.8 Flash (High)

### Debug Log References

- Verified live `OrigoOverlayService`, `OrigoOverlayRefImpl`, and `overlay.scss` in `packages/angular-renderer/src/lib/overlay/` and `src/styles/`.
- Confirmed absence of `alert`, `toast`, `snackbar`, and `banner` primitive components in `packages/angular-renderer/src/components/primitives/`.
- Extended `OrigoGlobalPositionAlignment` in `overlay.models.ts` and `overlay.service.ts` to support 8-point corner placements for Toast and Snackbar with exact CDK position method calls and RTL direction branching.
- Mandated `pointer-events: none` on `.origo-overlay-pane--toast` and `.origo-overlay-pane--snackbar` with `pointer-events: auto` on inner cards to prevent background interaction blocking.
- Detailed single-overlay stacking model for `ToastComponent` and multi-timer tracking map `Map<string, { timeoutId, startTime, remaining }>` for pause-on-hover and leak-free destruction.
- Reinforced `ContainerComponent` optional signal query `viewChild('vc')` invariant on `AlertComponent` and `BannerComponent` to eliminate runtime `NG0951` crashes while designating `ToastComponent` and `SnackbarComponent` as leaf primitives.
- Completed all contract schemas (`AlertContractSchema`, `ToastContractSchema`, `SnackbarContractSchema`, `BannerContractSchema`) with strict property definitions and aliases (`visible`, `text`, `actionLabel`, `life`) to prevent prop stripping under `coerceContractProps()`.
- Added Keyboard & Focus Navigation Matrix for WCAG 2.1 AA compliance.
- Confirmed test registry requirements in `tools/test-registry/test-registry.yaml` and ensured unique test ID naming conventions (`renderer-primitive-alert`, `renderer-primitive-toast`, `renderer-service-toast`, `renderer-primitive-snackbar`, `renderer-primitive-banner`).
- Added test DOM isolation cleanup instructions in `afterEach()`.
- Consolidated story specification into single canonical file under `_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md`.

### Completion Notes List

- Ultimate context engine analysis completed; comprehensive developer implementation guide created.
- Defined all 4 messaging primitives (`Alert`, `Toast`, `Snackbar`, `Banner`) with explicit props, outputs, contract schemas, and DOM structures.
- Enforced complete architectural invariants: Standalone, Shadow DOM, OnPush, Signals reactivity, `ContainerComponent` (`vc`), `coerceContractProps()`, and `[attr.data-testid]`.
- Enforced Angular CDK Overlay portal projection via `OrigoOverlayService` for Toast and Snackbar to prevent Shadow DOM clipping and z-index trapping.
- Enforced ARIA live region semantics (`role="alert"` vs `role="status"`, assertive vs polite) for screen reader accessibility.
- Enforced zero-literal design tokens and CSS Logical Properties for bidirectional RTL mirroring.
- Completed full implementation of all 4 standalone Angular messaging primitives (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`) under `packages/angular-renderer/src/components/primitives/`.
- Implemented `OrigoToastService` managing reactive toast notifications via Signals with duplicate prevention, pause-on-hover timers, and automatic portal overlay mounting.
- Extended CDK Overlay positioning in `OrigoOverlayService` with 8-point corner alignments (`top-start`, `top-end`, `top-center`, `bottom-start`, `bottom-end`, `bottom-center`, etc.) and automated RTL direction flipping.
- Implemented pass-through container overlays with `pointer-events: none` on panes and `pointer-events: auto` on message cards to guarantee background clickability without trapping pointer events.
- Created and executed comprehensive unit test suites: 51 tests across 6 test suites (`alert.component.spec.ts`, `toast.component.spec.ts`, `toast.service.spec.ts`, `snackbar.component.spec.ts`, `banner.component.spec.ts`, `overlay.service.spec.ts`), 100% passing.
- Registered all 5 test suites in `tools/test-registry/test-registry.yaml` and verified with `npm run validate:registry` (109 test cases verified passing).
- Verified linting with `npx nx lint angular-renderer` (0 errors, 0 warnings in new primitive files).
- Registered components in `primitives.provider.ts` and exported all primitives, services, and models in `src/index.ts`.

### File List

- `_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md` (STORY SPECIFICATION - CANONICAL)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (TRACKING)
- `packages/angular-renderer/src/components/primitives/alert/alert.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/alert/alert.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/alert/alert.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/toast/toast.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/toast/toast.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/toast/toast.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/toast/toast.models.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/toast/toast.service.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/banner/banner.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/banner/banner.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/banner/banner.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts` (NEW)
- `packages/angular-renderer/src/lib/overlay/overlay.models.ts` (UPDATE)
- `packages/angular-renderer/src/lib/overlay/overlay.service.ts` (UPDATE)
- `packages/angular-renderer/src/styles/overlay.scss` (UPDATE)
- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
- `packages/angular-renderer/src/index.ts` (UPDATE)
- `tools/test-registry/test-registry.yaml` (UPDATE)

### Change Log

- 2026-10-14: Created and hardened comprehensive developer story specification for Story 2.3 (Messaging & Notification Components). Validated against quality competition checklist. Enforced pointer-events pass-through on global overlay containers, single-overlay stacking model for multi-toast lists, robust multi-timer lifecycle map for pause-on-hover, complete contract schemas with alias resolution (`visible`, `text`, `actionLabel`, `life`), keyboard navigation matrix, test isolation in `afterEach()`, and registered 5 test suites. Status set to ready-for-dev.
- 2026-10-14: Completed full implementation and test suites for Story 2.3 (AlertComponent, ToastComponent + OrigoToastService, SnackbarComponent, BannerComponent). Updated primitives provider, exports, and test registry. Passed all 51 tests across 6 test suites, passed registry validation (109 test cases verified), and passed Nx linting with zero errors/warnings in new primitives. Transitioned status to review.
- 2026-10-15: Completed code review adversarial audit (Blind Hunter, Edge Case Hunter, Acceptance Auditor). Triage resolved 1 decision-needed (dismissed in favor of accessible button-focused keyboard dismissal) and applied 14 patches: reactive service toast sync via computed, OrigoToastService.clear() support, overlay container disposal on empty queue, dynamic ARIA live/atomic/role bindings, tokenized hover styles and :host([hidden]) resets, tracked $index loops, warning severity in BannerProps and Snackbar, and WebExperienceAdapterService integration. 100% unit tests passing and test registry validated. Status transitioned to done.
