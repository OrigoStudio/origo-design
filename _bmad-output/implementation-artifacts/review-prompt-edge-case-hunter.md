Invoke the `bmad-review-edge-case-hunter` skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index b638b98..373189b 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-10-07T19:00:21+05:30
-last_updated: 2026-10-13T21:28:30+05:30
+last_updated: 2026-10-14T21:16:00+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -60,7 +60,7 @@ development_status:
   epic-2: in-progress
   2-1-navigation-components: done
   2-2-modal-and-overlay-components: done
-  2-3-messaging-and-notification-components: backlog
+  2-3-messaging-and-notification-components: review
   2-4-status-and-loading-indicators: backlog
   2-5-utility-and-interaction-behaviors: backlog
   epic-2-retrospective: optional
diff --git a/_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md b/_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md
new file mode 100644
index 0000000..20c777c
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md
@@ -0,0 +1,782 @@
+---
+story_id: "2.3"
+story_key: 2-3-messaging-and-notification-components
+baseline_commit: f3967d8
+epic: 2
+status: "review"
+---
+
+# Story 2.3: Messaging & Notification Components
+
+Status: review
+
+<!-- Note: Validated against quality competition checklist. Ready for dev-story implementation. -->
+
+## Story
+
+As a developer,  
+I want to use comprehensive messaging, alert, toast, snackbar, and banner primitives (`Alert`, `Toast`, `Snackbar`, `Banner`),  
+So that I can deliver accessible, contextual, transient, and system-wide feedback to users without breaking Shadow DOM encapsulation, crashing during SSR hydration, trapping pointer events, or violating strict Content Security Policies.
+
+---
+
+## Acceptance Criteria
+
+1. **[AC-1] Semantic Severity & Design Token Visual Substrate (ADR: AD-6, NFR-I18N-001, FR4):**
+   - **Given** an Origo Angular 18/22 standalone rendering environment with `ViewEncapsulation.ShadowDom`,
+   - **When** any messaging primitive (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`) is rendered,
+   - **Then** it must render with the exact semantic design token colors for the specified severity:
+     - `info`: Surface/border/icon bound to `--origo-color-surface-subtle` (fallback `#eff6ff`), `--origo-color-border-info` (fallback `#bfdbfe`), `--origo-color-text-info` (fallback `#1e40af`).
+     - `success`: Surface/border/icon bound to `--origo-color-surface-success` (fallback `#ecfdf5`), `--origo-color-border-success` (fallback `#a7f3d0`), `--origo-color-text-success` (fallback `#065f46`).
+     - `warn` / `warning`: Surface/border/icon bound to `--origo-color-surface-warning` (fallback `#fffbeb`), `--origo-color-border-warning` (fallback `#fde68a`), `--origo-color-text-warning` (fallback `#92400e`).
+     - `error`: Surface/border/icon bound to `--origo-color-surface-danger` (fallback `#fef2f2`), `--origo-color-border-danger` (fallback `#fecaca`), `--origo-color-text-danger` (fallback `#991b1b`).
+   - **And** all component styles must strictly use CSS Logical Properties (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `border-inline-start`, `max-inline-size`, `max-block-size`) with zero physical coordinates, guaranteeing 100% automated Right-to-Left (RTL) layout mirroring under `dir="rtl"`.
+   - **And** accent indicators must use `border-inline-start` so border accents mirror symmetrically in RTL.
+   - **And** all stylesheets must contain zero hardcoded color hex values or pixel literals outside documented fallback expressions.
+
+2. **[AC-2] Accessible ARIA Live Region & Screen Reader Semantics (ADR: P1-AD-6, FR-A11Y-001, Global System AC-4):**
+   - **Given** any messaging or notification component displayed in the UI,
+   - **When** rendered or dynamically inserted into the DOM,
+   - **Then** screen readers must be notified via correct ARIA live region semantics:
+     - For error or warning messages: `role="alert"` and `aria-live="assertive"`, `aria-atomic="true"`.
+     - For info or success messages: `role="status"` and `aria-live="polite"`, `aria-atomic="true"`.
+     - For system banners: `role="region"` and `[attr.aria-label]="computedTitle() || 'System announcement'"`.
+   - **And** all interactive controls (dismiss/close buttons, action buttons) must be semantic `<button type="button">` elements with explicit `aria-label` (e.g. `"Close alert"`, `"Close notification"`), operable via keyboard (`Enter`, `Space`, `Tab`, `Escape`).
+   - **And** all components must pass automated accessibility audits with zero WCAG 2.1 AA violations.
+
+3. **[AC-3] Alert & Message Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.1, 7.3):**
+   - **Given** an inline or block messaging requirement in an application flow or form,
+   - **When** `AlertComponent` (`origo-alert`) is instantiated via BADL contract with key `'Alert'` or `'Message'`,
+   - **Then** it must render contextual feedback supporting:
+     - `visible`: Boolean toggle (default `true`) controlling element visibility.
+     - `severity`: `'info' | 'success' | 'warn' | 'warning' | 'error'` (default `'info'`).
+     - `title`: Optional bold alert heading.
+     - `message`: Alert body content (also accepts `text` for seamless backwards compatibility with BADL `Message` payloads).
+     - `icon`: Optional custom icon string, or auto-derived semantic icon if not provided.
+     - `closable`: Boolean toggle (default `false`) controlling visibility of close action button.
+     - `variant`: Visual style (`'standard'` | `'outlined'` | `'filled'`, default `'standard'`).
+     - `actions`: Optional array of interactive actions (`{ label: string; action: string; variant?: string }`).
+     - `life`: Optional duration in ms; when > 0, auto-dismisses after the specified delay.
+   - **And** closing the alert emits `close = output<void>()`, `visibleChange = output<boolean>()`, and dispatches state update `updateState(id, 'visible', false)`.
+   - **And** clicking an action button emits `action = output<{ action: string; data?: unknown }>()` and dispatches capability `dispatchCapability(id, actionName, payload)`.
+
+4. **[AC-4] Toast & Floating Notification Portal Substrate (ADR: P1-AD-5, Spike: retro-1, API Spec 7.2):**
+   - **Given** a transient toast notification request,
+   - **When** `ToastComponent` (`origo-toast`) is instantiated or triggered,
+   - **Then** the floating toast container MUST project outside the component's ShadowRoot into `document.body` via `OrigoOverlayService`, escaping all parent container overflow clipping boundaries and z-index trapping.
+   - **And** the container MUST support configurable screen positions via `position` input:
+     - Top positions: `'top-start'`, `'top-center'`, `'top-end'`, `'top-left'`, `'top-right'`.
+     - Bottom positions: `'bottom-start'`, `'bottom-center'`, `'bottom-end'`, `'bottom-left'`, `'bottom-right'`.
+     - Default position: `'top-end'`.
+   - **And** `.origo-overlay-pane--toast` MUST declare `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;` so the overlay container does NOT render an opaque box or block user clicks to underlying page elements.
+   - **And** individual toast items (`.origo-toast__item`) inside the projected container MUST declare `pointer-events: auto;`.
+   - **And** `ToastComponent` maintains a single CDK overlay per position hosting a reactive list of stacked `ToastMessage[]` with vertical gap (`display: flex; flex-direction: column; gap: var(--origo-space-sm, 0.5rem);`).
+   - **And** each toast item must support auto-dismissal governed by `life` (default `3000ms`, 0 = persistent), with individual manual close button (`closable: true`, default `true`), emitting `close = output<ToastMessage>()`.
+   - **And** hovering over a toast panel must pause its auto-dismiss timer; unhovering must resume the timer using remaining elapsed time calculations.
+   - **And** duplicate suppression (`preventDuplicates: true`, default `false`) must prevent stacking duplicate messages with identical severity and summary/content.
+   - **And** a companion `OrigoToastService` (`@Injectable({ providedIn: 'root' })`) must be provided for imperative notification dispatch (`show(message)`, `info()`, `success()`, `warn()`, `error()`, `clear(group?)`) alongside declarative BADL contract binding.
+
+5. **[AC-5] Snackbar Transient Action Bar Substrate (ADR: P1-AD-1, P1-AD-5, Global System AC-1, FR4):**
+   - **Given** an operation confirmation or transient status update (e.g. "Record deleted", "Changes saved"),
+   - **When** `SnackbarComponent` (`origo-snackbar`) is displayed,
+   - **Then** it MUST project into `document.body` via `OrigoOverlayService` with default `'bottom-center'` alignment (or configurable `'bottom-start'`, `'bottom-end'`, `'top-center'`, `'top-start'`, `'top-end'`).
+   - **And** `.origo-overlay-pane--snackbar` MUST declare `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;` so it does not trap clicks outside the bar.
+   - **And** the inner `.origo-snackbar__bar` must declare `pointer-events: auto;`.
+   - **And** it must display a concise message with an optional single action button (e.g. `"Undo"`, `"Retry"`), accepting both `action` and `actionLabel` prop keys.
+   - **And** clicking the action button must emit `actionClick = output<void>()`, dispatch capability `dispatchCapability(id, 'action', {})`, and close the snackbar.
+   - **And** the snackbar must automatically dismiss after `duration` ms (accepting `life` as alias, default `4000ms`, 0 = persistent), emitting `close = output<void>()` and updating state `updateState(id, 'visible', false)`.
+   - **And** manual close button (`closable: true`, default `false`) must allow immediate dismissal.
+
+6. **[AC-6] Banner System-Wide Announcement Substrate (ADR: P1-AD-1, P1-AD-5, API Spec 7.1, FR4):**
+   - **Given** an important system announcement, maintenance notice, or compliance alert,
+   - **When** `BannerComponent` (`origo-banner`) is rendered,
+   - **Then** it must render a full-width (`fluid: true`, default `true`) announcement bar spanning 100% of the container or viewport.
+   - **And** it must support `sticky: true` (default `false`) pinning to the top of the container/viewport via CSS Logical sticky positioning (`position: sticky; inset-block-start: 0; z-index: var(--origo-z-sticky, 100);`).
+   - **And** it must render severity icons, bold title, description message (accepting `message` or `text`), an action button array (`actions`), and an optional dismiss button (`closable: true`, default `false`).
+   - **And** it must implement `ContainerComponent` with `<ng-container #vc>` and content projection (`<ng-content>`) to allow dynamic child AST subtrees within banner layouts.
+
+7. **[AC-7] Angular Standalone, Signals Reactivity & Runtime Property Coercion (ADR: P1-AD-1):**
+   - **Given** incoming BADL AST payloads,
+   - **When** messaging primitives are instantiated,
+   - **Then** all four components (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`) must be Angular Standalone components with `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`, consuming inputs via Angular Signals (`input.required<InteractionContract<T>>()`, `computed()`), and emitting typed outputs (`output()`).
+   - **And** each component must define `static readonly contractSchema` covering 100% of defined properties and aliases (`visible`, `text`, `actionLabel`, `life`, `severity`, etc.) and invoke `coerceContractProps()` on incoming `this.contract().props` to guard against runtime property stripping or crashes from malformed JSON payloads.
+   - **And** all components implementing `ContainerComponent` (`AlertComponent`, `BannerComponent`) must declare optional signal query `vc = viewChild('vc', { read: ViewContainerRef })`. Using `viewChild.required('vc')` is strictly FORBIDDEN to eliminate fatal runtime error `NG0951` during template attachment.
+   - **And** leaf primitives (`ToastComponent`, `SnackbarComponent`) do NOT implement `ContainerComponent` to avoid unnecessary slot overhead.
+
+8. **[AC-8] State Synchronization & Capability Dispatch (ADR: AD-11):**
+   - **Given** user interactions and visibility changes (dismissal, action click, auto-dismiss timeout),
+   - **When** a messaging state transitions,
+   - **Then** the component must emit corresponding typed outputs (`visibleChange`, `close`, `action`, `show`, `actionClick`) and synchronize state via `WebExperienceAdapterService`:
+     - `updateState(id, 'visible', isVisible)`
+     - `dispatchCapability(id, capabilityName, payload)`
+
+9. **[AC-9] Metadata Hooks & Test Selectors (ADR: AD-12):**
+   - **Given** any messaging component instance (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`),
+   - **When** rendered from a BADL payload,
+   - **Then** it must expose standard metadata hooks (`permissions`, `rules`, `metadata`, `aria-label`, `aria-describedby`) and bind `[attr.data-testid]="contract().id"` on both the host element and any projected overlay panels.
+
+10. **[AC-10] Server-Side Rendering (SSR) & Content Security Policy (CSP) Compliance (Global System AC-1, AC-2):**
+    - **Given** strict enterprise SSR and Content Security Policy environments,
+    - **When** messaging components and overlay panels are initialized and mounted,
+    - **Then** direct access to browser DOM globals (`window`, `document`) must be strictly guarded via `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
+    - **And** timer handles (`setTimeout`, `setInterval`) must be cleanly cleared and disposed upon component teardown via `DestroyRef.onDestroy()`.
+    - **And** zero inline `style="..."` attributes may be injected onto body nodes; all floating styles must be governed strictly through predefined CSS classes in `packages/angular-renderer/src/styles/overlay.scss` (`.origo-overlay-pane--toast`, `.origo-overlay-pane--snackbar`) and CSS custom properties.
+
+11. **[AC-11] Definition of Done (DoD), Registration & Central Test Registry (DoD: docs/definition-of-done.md, ADR: AD-11, AD-12):**
+    - **Given** completion of the messaging components,
+    - **When** prepared for release,
+    - **Then** all primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`:
+      - `'Alert'` -> `AlertComponent`
+      - `'Message'` -> `AlertComponent` (alias/interchangeable)
+      - `'Toast'` -> `ToastComponent`
+      - `'Snackbar'` -> `SnackbarComponent`
+      - `'Banner'` -> `BannerComponent`
+    - **And** exported from `packages/angular-renderer/src/index.ts`.
+    - **And** `tools/test-registry/test-registry.yaml` MUST be updated with five new test suite entries:
+      - `renderer-primitive-alert` (`packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts`)
+      - `renderer-primitive-toast` (`packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts`)
+      - `renderer-service-toast` (`packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts`)
+      - `renderer-primitive-snackbar` (`packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts`)
+      - `renderer-primitive-banner` (`packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts`)
+      each specifying `affected_stories: [2-3-messaging-and-notification-components]` and type `unit`.
+
+12. **[AC-12] Architectural Scope & Deferred Primitives (ADR: P1-AD-5, PRD Epic 1.4):**
+    - **Given** the Phase 2 component roadmap,
+    - **When** implementing Story 2.3,
+    - **Then** scope is strictly bounded to `AlertComponent`, `ToastComponent`, `SnackbarComponent`, and `BannerComponent`.
+    - **And** `NotificationCenter` (complex inbox/notification drawer), `InlineValidation` (form-field error decorators), audio chimes, and browser Web Push notifications are explicitly out of scope for Story 2.3 and deferred to subsequent stories.
+
+---
+
+## Tasks / Subtasks
+
+- [x] Task 1: Overlay Infrastructure & Global Position Strategy Enhancement (AC: 1, 4, 5, 10)
+  - [x] 1.1 Update `OrigoGlobalPositionAlignment` in `packages/angular-renderer/src/lib/overlay/overlay.models.ts` to include 8-point corner alignments: `'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`.
+  - [x] 1.2 Update `OrigoOverlayService.buildPositionStrategy()` in `packages/angular-renderer/src/lib/overlay/overlay.service.ts` using CDK's native methods (`.top()`, `.bottom()`, `.left()`, `.right()`, `.centerHorizontally()`) and explicit RTL direction branching:
+    - `'top-start'`: `global.top(0); direction === 'rtl' ? global.right(0) : global.left(0);`
+    - `'top-end'`: `global.top(0); direction === 'rtl' ? global.left(0) : global.right(0);`
+    - `'top-center'`: `global.top(0).centerHorizontally();`
+    - `'bottom-start'`: `global.bottom(0); direction === 'rtl' ? global.right(0) : global.left(0);`
+    - `'bottom-end'`: `global.bottom(0); direction === 'rtl' ? global.left(0) : global.right(0);`
+    - `'bottom-center'`: `global.bottom(0).centerHorizontally();`
+    - Corner coordinates: `'top-left'`, `'top-right'`, `'bottom-left'`, `'bottom-right'`.
+  - [x] 1.3 Add `.origo-overlay-pane--toast` and `.origo-overlay-pane--snackbar` modifier classes to `packages/angular-renderer/src/styles/overlay.scss` with:
+    - `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;`
+    - Inner item cards (`.origo-toast__item`, `.origo-snackbar__bar`) set to `pointer-events: auto;`.
+    - Logical padding/margins for viewport clearance.
+  - [x] 1.4 Update `packages/angular-renderer/src/lib/overlay/overlay.service.spec.ts` to verify corner position strategy resolution in LTR and RTL.
+
+- [x] Task 2: Implement AlertComponent (`origo-alert`) (AC: 1, 2, 3, 7, 8, 9, 10)
+  - [x] 2.1 Create component files under `packages/angular-renderer/src/components/primitives/alert/`:
+    - `alert.component.ts`
+    - `alert.component.html`
+    - `alert.component.scss`
+    - `alert.component.spec.ts`
+  - [x] 2.2 Define `AlertProps` interface and `static readonly contractSchema` supporting `visible`, `severity`, `title`, `message`, `text`, `icon`, `closable`, `variant`, `actions`, `life`, `permissions`, `rules`, `metadata`, `'aria-label'`, `'aria-describedby'`.
+  - [x] 2.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
+  - [x] 2.4 Bind ARIA attributes: `role="alert"` / `aria-live="assertive"` for error/warn; `role="status"` / `aria-live="polite"` for info/success.
+  - [x] 2.5 Implement auto-dismiss timer when `life > 0` with safe cleanup via `DestroyRef.onDestroy()`.
+  - [x] 2.6 Implement action button click dispatching (`action = output()`, `dispatchCapability()`) and close dismissal (`close = output()`, `updateState()`).
+  - [x] 2.7 Author comprehensive unit test suite in `alert.component.spec.ts` asserting DOM rendering across shadow boundaries, severity classes, ARIA roles, action clicks, timer dismissals, and null-safe contract handling.
+
+- [x] Task 3: Implement ToastComponent (`origo-toast`) & OrigoToastService (AC: 1, 2, 4, 7, 8, 9, 10)
+  - [x] 3.1 Create component files under `packages/angular-renderer/src/components/primitives/toast/`:
+    - `toast.component.ts`
+    - `toast.component.html`
+    - `toast.component.scss`
+    - `toast.component.spec.ts`
+    - `toast.models.ts`
+    - `toast.service.ts`
+    - `toast.service.spec.ts`
+  - [x] 3.2 Define `ToastProps` and `ToastMessage` interfaces and `static readonly contractSchema` supporting `messages`, `position`, `life`, `closable`, `preventDuplicates`, `group`, `severity`, `summary`, `detail`, `message`, `icon`, `sticky`, `breakpoints`, metadata hooks.
+  - [x] 3.3 Implement `OrigoToastService` (`@Injectable({ providedIn: 'root' })`) managing reactive toast messages via Signals with methods `show(msg)`, `info()`, `success()`, `warn()`, `error()`, `clear(group?)`.
+  - [x] 3.4 Implement single floating portal overlay per position via `OrigoOverlayService` hosting a vertical flex container (`display: flex; flex-direction: column; gap: var(--origo-space-sm);`).
+  - [x] 3.5 Implement per-message auto-dismiss timers via `Map<string, { timeoutId, startTime, remaining }>` supporting pause-on-hover (`mouseenter` / `mouseleave`), manual dismissal, and leak-free destruction.
+  - [x] 3.6 Implement ARIA live region wrapping toast items with `role="region"`, `aria-label="Notifications"`, and dynamic `aria-live` levels per message severity.
+  - [x] 3.7 Author unit test suites in `toast.component.spec.ts` and `toast.service.spec.ts` asserting overlay mounting, multi-toast stacking, pause-on-hover timers, dismiss events, DOM isolation in `afterEach()`, and SSR guardrails.
+
+- [x] Task 4: Implement SnackbarComponent (`origo-snackbar`) (AC: 1, 2, 5, 7, 8, 9, 10)
+  - [x] 4.1 Create component files under `packages/angular-renderer/src/components/primitives/snackbar/`:
+    - `snackbar.component.ts`
+    - `snackbar.component.html`
+    - `snackbar.component.scss`
+    - `snackbar.component.spec.ts`
+  - [x] 4.2 Define `SnackbarProps` interface and `static readonly contractSchema` supporting `visible`, `message`, `action`, `actionLabel`, `duration`, `life`, `position`, `severity`, `closable`, metadata hooks.
+  - [x] 4.3 Implement Standalone, Shadow DOM, OnPush, and portal projection via `OrigoOverlayService` with `'bottom-center'` default and `pointer-events: none` on container pane.
+  - [x] 4.4 Implement `actionClick = output<void>()`, `visibleChange = output<boolean>()`, auto-dismissal via `duration` timer with `DestroyRef` cleanup.
+  - [x] 4.5 Implement ARIA `role="status"` and `aria-live="polite"`.
+  - [x] 4.6 Author unit test suite in `snackbar.component.spec.ts` asserting bottom portal mounting, action button clicks, auto-dismiss timers, DOM cleanup in `afterEach()`, and escape dismissal.
+
+- [x] Task 5: Implement BannerComponent (`origo-banner`) (AC: 1, 2, 6, 7, 8, 9, 10)
+  - [x] 5.1 Create component files under `packages/angular-renderer/src/components/primitives/banner/`:
+    - `banner.component.ts`
+    - `banner.component.html`
+    - `banner.component.scss`
+    - `banner.component.spec.ts`
+  - [x] 5.2 Define `BannerProps` interface and `static readonly contractSchema` supporting `visible`, `severity`, `title`, `message`, `text`, `icon`, `closable`, `sticky`, `fluid`, `variant`, `actions`, `life`, metadata hooks.
+  - [x] 5.3 Implement Standalone, Shadow DOM, OnPush, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
+  - [x] 5.4 Implement sticky pinning via CSS Logical sticky positioning (`position: sticky; inset-block-start: 0;`).
+  - [x] 5.5 Bind ARIA `role="region"`, `[attr.aria-label]="computedTitle() || 'System announcement'"`, and dynamic live region announcements.
+  - [x] 5.6 Author unit test suite in `banner.component.spec.ts` asserting full-width layout, sticky classes, action triggers, dismissal, and content projection.
+
+- [x] Task 6: Monorepo Registration, Exports & Central Test Registry (AC: 11)
+  - [x] 6.1 Register primitives in `packages/angular-renderer/src/lib/primitives.provider.ts`:
+    - `'Alert'`: `AlertComponent`
+    - `'Message'`: `AlertComponent`
+    - `'Toast'`: `ToastComponent`
+    - `'Snackbar'`: `SnackbarComponent`
+    - `'Banner'`: `BannerComponent`
+  - [x] 6.2 Export all new components, services, and models in `packages/angular-renderer/src/index.ts`.
+  - [x] 6.3 Register test suites in `tools/test-registry/test-registry.yaml`:
+    - `renderer-primitive-alert`
+    - `renderer-primitive-toast`
+    - `renderer-service-toast`
+    - `renderer-primitive-snackbar`
+    - `renderer-primitive-banner`
+  - [x] 6.4 Run full monorepo test suite (`npm test`) and lint checks (`npx nx lint angular-renderer`) to verify zero regressions.
+  - [x] 6.5 Update `sprint-status.yaml` marking `2-3-messaging-and-notification-components` as `review`.
+
+---
+
+## Dev Notes
+
+### Architecture Patterns & Invariants to Enforce
+
+1. **Standalone & Shadow DOM (Invariant 1, ADR: P1-AD-1):**
+   - Every component must declare `standalone: true`, `encapsulation: ViewEncapsulation.ShadowDom`, and `changeDetection: ChangeDetectionStrategy.OnPush`.
+   - Host binding: `[attr.data-testid]="contract().id"`.
+
+2. **Signals Reactivity (Invariant 3, ADR: P1-AD-1):**
+   - Inputs must use `input.required<InteractionContract<TProps>>()`.
+   - Derived states must use `computed()`.
+   - Events must use `output<T>()`.
+   - No direct property mutation; no unmanaged RxJS subscriptions.
+
+3. **Runtime Contract Coercion & Schema (Invariant 4, ADR: P1-AD-4):**
+   - Every component must implement `OrigoAdapter<TProps>`.
+   - Must define `static readonly contractSchema` covering all defined properties and aliases.
+   - Must call `coerceContractProps()` on incoming `this.contract().props` in constructor or computed signal.
+
+4. **Composition Slots & ViewContainerRef (Invariant 5, ADR: P1-AD-5):**
+   - Components implementing `ContainerComponent` (`AlertComponent`, `BannerComponent`) must declare optional signal query:
+     ```typescript
+     readonly vc = viewChild('vc', { read: ViewContainerRef });
+     ```
+   - **CRITICAL ANTI-PATTERN TO AVOID:** Do NOT use `viewChild.required('vc')`. Query resolution fails with fatal runtime error `NG0951` when `#vc` is hosted within unattached `<ng-template>` views.
+   - Leaf primitives (`ToastComponent`, `SnackbarComponent`) do NOT implement `ContainerComponent`.
+
+5. **Angular CDK Overlay & Portal Substrate (ADR: P1-AD-5, Spike: retro-1):**
+   - `ToastComponent` and `SnackbarComponent` project into `document.body` via `OrigoOverlayService`.
+   - Overlay containers MUST set `pointer-events: none` on the pane and `pointer-events: auto` on inner cards so background elements remain clickable.
+   - Clean up overlay refs on teardown via `DestroyRef.onDestroy()`.
+
+6. **SSR & Browser Guardrails (Global System AC-2):**
+   - Guard direct DOM and browser APIs with `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
+   - In non-browser environments, `OrigoOverlayService` returns `OrigoNoopOverlayRef` ensuring zero crashes during SSR.
+
+7. **Zero-Literal Design Tokens & RTL Mirroring (ADR: AD-6, NFR-I18N-001):**
+   - Strictly consume `var(--origo-*)` tokens with documented semantic fallbacks.
+   - Use CSS Logical Properties exclusively (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `border-inline-start`, `inline-size`, `block-size`).
+   - Zero physical directional properties (`left`, `right`, `padding-left`, `margin-right`).
+
+---
+
+### CDK GlobalPositionStrategy Alignment Reference
+
+CDK Overlay `GlobalPositionStrategy` does not support `.start()` or `.end()`. Map alignments in `overlay.service.ts` using native methods:
+
+| Position Config | CDK GlobalPositionStrategy Call (LTR) | CDK GlobalPositionStrategy Call (RTL) |
+|---|---|---|
+| `'top-start'` | `global.top('0').left('0')` | `global.top('0').right('0')` |
+| `'top-center'` | `global.top('0').centerHorizontally()` | `global.top('0').centerHorizontally()` |
+| `'top-end'` | `global.top('0').right('0')` | `global.top('0').left('0')` |
+| `'bottom-start'` | `global.bottom('0').left('0')` | `global.bottom('0').right('0')` |
+| `'bottom-center'` | `global.bottom('0').centerHorizontally()` | `global.bottom('0').centerHorizontally()` |
+| `'bottom-end'` | `global.bottom('0').right('0')` | `global.bottom('0').left('0')` |
+| `'top-left'` | `global.top('0').left('0')` | `global.top('0').left('0')` |
+| `'top-right'` | `global.top('0').right('0')` | `global.top('0').right('0')` |
+| `'bottom-left'` | `global.bottom('0').left('0')` | `global.bottom('0').left('0')` |
+| `'bottom-right'` | `global.bottom('0').right('0')` | `global.bottom('0').right('0')` |
+
+---
+
+### Timer Management & Pause-on-Hover Pattern
+
+For `ToastComponent` with multiple auto-dismiss timers:
+
+```typescript
+interface ActiveToastTimer {
+  timeoutId: ReturnType<typeof setTimeout>;
+  startTime: number;
+  remaining: number;
+}
+
+export class ToastComponent {
+  private readonly timers = new Map<string, ActiveToastTimer>();
+  private readonly destroyRef = inject(DestroyRef);
+
+  constructor() {
+    this.destroyRef.onDestroy(() => this.clearAllTimers());
+  }
+
+  private startTimer(id: string, duration: number): void {
+    this.clearTimer(id);
+    const timeoutId = setTimeout(() => this.dismiss(id), duration);
+    this.timers.set(id, { timeoutId, startTime: Date.now(), remaining: duration });
+  }
+
+  onItemMouseEnter(id: string): void {
+    const timer = this.timers.get(id);
+    if (!timer) return;
+    clearTimeout(timer.timeoutId);
+    const elapsed = Date.now() - timer.startTime;
+    timer.remaining = Math.max(0, timer.remaining - elapsed);
+  }
+
+  onItemMouseLeave(id: string): void {
+    const timer = this.timers.get(id);
+    if (!timer || timer.remaining <= 0) return;
+    timer.startTime = Date.now();
+    timer.timeoutId = setTimeout(() => this.dismiss(id), timer.remaining);
+  }
+
+  private clearTimer(id: string): void {
+    const timer = this.timers.get(id);
+    if (timer) {
+      clearTimeout(timer.timeoutId);
+      this.timers.delete(id);
+    }
+  }
+
+  private clearAllTimers(): void {
+    this.timers.forEach((t) => clearTimeout(t.timeoutId));
+    this.timers.clear();
+  }
+}
+```
+
+---
+
+### Keyboard Navigation & A11y Focus Matrix
+
+| Component | Target Element | Key | Behavior |
+|---|---|---|---|
+| `AlertComponent` | Action Button | `Enter` / `Space` | Dispatches action capability and emits `action` output |
+| `AlertComponent` | Close Button | `Enter` / `Space` / `Escape` | Closes alert, updates state `visible: false` |
+| `ToastComponent` | Close Button | `Enter` / `Space` | Closes individual toast item, emits `close` |
+| `ToastComponent` | Active Toast Container | `Escape` | Closes top-most / most recent toast item |
+| `SnackbarComponent` | Action Button | `Enter` / `Space` | Dispatches action capability, closes snackbar |
+| `SnackbarComponent` | Close Button | `Enter` / `Space` / `Escape` | Closes snackbar immediately |
+| `BannerComponent` | Action / Close Buttons | `Enter` / `Space` / `Tab` | Navigates and activates interactive buttons |
+
+---
+
+### Component API Specifications
+
+#### 1. `AlertComponent` (`origo-alert`)
+- **Registry Keys:** `'Alert'`, `'Message'`
+- **Selector:** `origo-alert`
+- **Inputs (`AlertProps`):**
+  ```typescript
+  export interface AlertAction {
+    label: string;
+    action: string;
+    variant?: 'primary' | 'secondary' | 'text';
+  }
+
+  export interface AlertProps {
+    visible?: boolean;                                            // Visibility toggle (default true)
+    severity?: 'info' | 'success' | 'warn' | 'warning' | 'error'; // default 'info'
+    title?: string;                                               // Alert title
+    message?: string;                                             // Alert description
+    text?: string;                                                // Message API alias for message
+    icon?: string;                                                // Custom icon or emoji
+    closable?: boolean;                                           // Dismiss action toggle (default false)
+    variant?: 'standard' | 'outlined' | 'filled';                 // Visual variant (default 'standard')
+    actions?: AlertAction[];                                      // Interactive action buttons
+    life?: number;                                                // Auto-dismiss duration in ms (0 = persistent)
+    permissions?: Record<string, string>;
+    rules?: Record<string, unknown>;
+    metadata?: Record<string, unknown>;
+    'aria-label'?: string;
+    'aria-describedby'?: string;
+  }
+  ```
+- **Outputs:**
+  - `close = output<void>()`
+  - `action = output<{ action: string; data?: unknown }>()`
+  - `visibleChange = output<boolean>()`
+- **Contract Schema:**
+  ```typescript
+  export const AlertContractSchema = {
+    visible: 'boolean',
+    severity: 'string',
+    title: 'string',
+    message: 'string',
+    text: 'string',
+    icon: 'string',
+    closable: 'boolean',
+    variant: 'string',
+    actions: 'array',
+    life: 'number',
+    permissions: 'object',
+    rules: 'object',
+    metadata: 'object',
+    'aria-label': 'string',
+    'aria-describedby': 'string',
+  } as const;
+  ```
+
+---
+
+#### 2. `ToastComponent` (`origo-toast`) & `OrigoToastService`
+- **Registry Key:** `'Toast'`
+- **Selector:** `origo-toast`
+- **Models (`ToastMessage`, `ToastProps`):**
+  ```typescript
+  export interface ToastMessage {
+    id?: string;
+    severity?: 'info' | 'success' | 'warn' | 'warning' | 'error';
+    summary?: string;
+    detail?: string;
+    content?: string;
+    message?: string;
+    icon?: string;
+    life?: number;
+    closable?: boolean;
+    sticky?: boolean;
+    data?: unknown;
+    group?: string;
+  }
+
+  export type ToastPosition =
+    | 'top-start'
+    | 'top-center'
+    | 'top-end'
+    | 'bottom-start'
+    | 'bottom-center'
+    | 'bottom-end'
+    | 'top-left'
+    | 'top-right'
+    | 'bottom-left'
+    | 'bottom-right'
+    | 'center';
+
+  export interface ToastProps {
+    messages?: ToastMessage[];
+    position?: ToastPosition;                                     // default 'top-end'
+    life?: number;                                                // default 3000ms
+    closable?: boolean;                                           // default true
+    preventDuplicates?: boolean;                                  // default false
+    group?: string;                                               // channel filter
+    severity?: string;                                            // Single-message prop support
+    summary?: string;                                             // Single-message prop support
+    detail?: string;                                              // Single-message prop support
+    message?: string;                                             // Single-message prop support
+    icon?: string;                                                // Single-message prop support
+    sticky?: boolean;                                             // Single-message prop support
+    breakpoints?: Record<string, { width: string }>;
+    permissions?: Record<string, string>;
+    rules?: Record<string, unknown>;
+    metadata?: Record<string, unknown>;
+    'aria-label'?: string;
+    'aria-describedby'?: string;
+  }
+  ```
+- **Outputs:**
+  - `show = output<ToastMessage>()`
+  - `close = output<ToastMessage>()`
+  - `action = output<{ message: ToastMessage; action: string }>()`
+- **Contract Schema:**
+  ```typescript
+  export const ToastContractSchema = {
+    messages: 'array',
+    position: 'string',
+    life: 'number',
+    closable: 'boolean',
+    preventDuplicates: 'boolean',
+    group: 'string',
+    severity: 'string',
+    summary: 'string',
+    detail: 'string',
+    message: 'string',
+    icon: 'string',
+    sticky: 'boolean',
+    breakpoints: 'object',
+    permissions: 'object',
+    rules: 'object',
+    metadata: 'object',
+    'aria-label': 'string',
+    'aria-describedby': 'string',
+  } as const;
+  ```
+- **`OrigoToastService` API:**
+  ```typescript
+  @Injectable({ providedIn: 'root' })
+  export class OrigoToastService {
+    readonly messages = signal<ToastMessage[]>([]);
+    show(message: ToastMessage): void;
+    info(summary: string, detail?: string, life?: number): void;
+    success(summary: string, detail?: string, life?: number): void;
+    warn(summary: string, detail?: string, life?: number): void;
+    error(summary: string, detail?: string, life?: number): void;
+    clear(group?: string): void;
+  }
+  ```
+
+---
+
+#### 3. `SnackbarComponent` (`origo-snackbar`)
+- **Registry Key:** `'Snackbar'`
+- **Selector:** `origo-snackbar`
+- **Inputs (`SnackbarProps`):**
+  ```typescript
+  export interface SnackbarProps {
+    visible?: boolean;                                            // Open state (default false)
+    message?: string;                                             // Concise status message
+    action?: string;                                              // Optional action label (e.g. 'Undo')
+    actionLabel?: string;                                         // Alias for action
+    duration?: number;                                            // Auto-close duration in ms (default 4000)
+    life?: number;                                                // Alias for duration
+    position?: 'bottom-center' | 'bottom-start' | 'bottom-end' | 'top-center' | 'top-start' | 'top-end'; // default 'bottom-center'
+    severity?: 'info' | 'success' | 'warn' | 'error';             // default 'info'
+    closable?: boolean;                                           // Close button toggle (default false)
+    permissions?: Record<string, string>;
+    rules?: Record<string, unknown>;
+    metadata?: Record<string, unknown>;
+    'aria-label'?: string;
+    'aria-describedby'?: string;
+  }
+  ```
+- **Outputs:**
+  - `visibleChange = output<boolean>()`
+  - `open = output<void>()`
+  - `close = output<void>()`
+  - `actionClick = output<void>()`
+- **Contract Schema:**
+  ```typescript
+  export const SnackbarContractSchema = {
+    visible: 'boolean',
+    message: 'string',
+    action: 'string',
+    actionLabel: 'string',
+    duration: 'number',
+    life: 'number',
+    position: 'string',
+    severity: 'string',
+    closable: 'boolean',
+    permissions: 'object',
+    rules: 'object',
+    metadata: 'object',
+    'aria-label': 'string',
+    'aria-describedby': 'string',
+  } as const;
+  ```
+
+---
+
+#### 4. `BannerComponent` (`origo-banner`)
+- **Registry Key:** `'Banner'`
+- **Selector:** `origo-banner`
+- **Inputs (`BannerProps`):**
+  ```typescript
+  export interface BannerAction {
+    label: string;
+    action: string;
+    variant?: 'primary' | 'secondary' | 'text';
+  }
+
+  export interface BannerProps {
+    visible?: boolean;                                            // default true
+    severity?: 'info' | 'success' | 'warn' | 'error';             // default 'info'
+    title?: string;                                               // Bold title/summary
+    message?: string;                                             // Detailed announcement
+    text?: string;                                                // Alias for message
+    icon?: string;                                                // Custom icon
+    closable?: boolean;                                           // Dismiss toggle (default false)
+    sticky?: boolean;                                             // Fixed to top of container/viewport (default false)
+    fluid?: boolean;                                              // Full width 100% (default true)
+    variant?: 'standard' | 'outlined' | 'filled';                 // Visual variant (default 'standard')
+    actions?: BannerAction[];                                     // Action button array
+    life?: number;                                                // Auto-dismiss duration in ms (0 = persistent)
+    permissions?: Record<string, string>;
+    rules?: Record<string, unknown>;
+    metadata?: Record<string, unknown>;
+    'aria-label'?: string;
+    'aria-describedby'?: string;
+  }
+  ```
+- **Outputs:**
+  - `visibleChange = output<boolean>()`
+  - `close = output<void>()`
+  - `action = output<{ action: string }>()`
+- **Contract Schema:**
+  ```typescript
+  export const BannerContractSchema = {
+    visible: 'boolean',
+    severity: 'string',
+    title: 'string',
+    message: 'string',
+    text: 'string',
+    icon: 'string',
+    closable: 'boolean',
+    sticky: 'boolean',
+    fluid: 'boolean',
+    variant: 'string',
+    actions: 'array',
+    life: 'number',
+    permissions: 'object',
+    rules: 'object',
+    metadata: 'object',
+    'aria-label': 'string',
+    'aria-describedby': 'string',
+  } as const;
+  ```
+
+---
+
+### Existing Code to Update
+
+1. **`packages/angular-renderer/src/lib/overlay/overlay.models.ts`:**
+   - **Current State:** `OrigoGlobalPositionAlignment` only supports `'center' | 'top' | 'bottom' | 'start' | 'end'`.
+   - **Changes:** Add `'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`.
+   - **Preserve:** All existing overlay config interfaces, methods, and types.
+
+2. **`packages/angular-renderer/src/lib/overlay/overlay.service.ts`:**
+   - **Current State:** `buildPositionStrategy()` maps global positions only to 5 basic alignments.
+   - **Changes:** Add corner position mapping in `buildPositionStrategy()` handling `top-start`, `top-end`, `bottom-start`, `bottom-end`, and directional mirroring in RTL using native CDK position methods.
+   - **Preserve:** Connected position strategies, backdrop handling, theme scope resolution, direction detection.
+
+3. **`packages/angular-renderer/src/styles/overlay.scss`:**
+   - **Current State:** Contains panel modifiers for dialog, drawer, popover, tooltip.
+   - **Changes:** Add `.origo-overlay-pane--toast` and `.origo-overlay-pane--snackbar` with `background: transparent !important; border: none !important; box-shadow: none !important; pointer-events: none !important;` and CSS Logical Properties.
+   - **Preserve:** All existing CDK container, backdrop, modal, drawer, popover, and tooltip rules.
+
+4. **`packages/angular-renderer/src/lib/primitives.provider.ts`:**
+   - **Current State:** Registers 42 primitives (through Story 2.2).
+   - **Changes:** Add imports and map entries for `'Alert'`, `'Message'`, `'Toast'`, `'Snackbar'`, and `'Banner'`.
+   - **Preserve:** All existing primitive registrations.
+
+5. **`packages/angular-renderer/src/index.ts`:**
+   - **Current State:** Exports all components up to Tooltip.
+   - **Changes:** Export `AlertComponent`, `ToastComponent`, `OrigoToastService`, `SnackbarComponent`, `BannerComponent`, and their respective interfaces.
+   - **Preserve:** All existing exports.
+
+6. **`tools/test-registry/test-registry.yaml`:**
+   - **Current State:** Central test cases ledger ending at `renderer-primitive-tooltip`.
+   - **Changes:** Append test cases for `renderer-primitive-alert`, `renderer-primitive-toast`, `renderer-service-toast`, `renderer-primitive-snackbar`, and `renderer-primitive-banner`.
+   - **Preserve:** Schema version, all existing test cases, and test isolation comments.
+
+---
+
+### Testing Standards Summary
+
+- **Shadow DOM Piercing:** For `AlertComponent` and `BannerComponent`, assertions must pierce `fixture.nativeElement.shadowRoot` to inspect encapsulated elements (`button`, `role="alert"`, `.origo-alert__title`).
+- **Overlay DOM Piercing:** For `ToastComponent` and `SnackbarComponent`, because panels project to `document.body` via `OrigoOverlayService`, assertions must query `document.body.querySelector('.origo-toast-item')` or `document.body.querySelector('.origo-snackbar-bar')`.
+- **Test Isolation Cleanup:** In `afterEach()` of all overlay tests, explicitly remove `.cdk-overlay-container` and `.origo-overlay-pane` elements from `document.body` to prevent leakages across tests.
+- **Real DOM Event Dispatch:** Test dismissal and actions by triggering native click events (`btn.click()` or `btn.dispatchEvent(new MouseEvent('click'))`) rather than calling component methods directly.
+- **Zoneless Signal Propagation:** Set inputs via `fixture.componentRef.setInput('contract', contractPayload)` and immediately invoke `fixture.detectChanges()`.
+- **Timer & Auto-Dismiss Verification:** Use Angular `fakeAsync` with `tick(duration)` or Jest fake timers (`jest.useFakeTimers()`, `jest.advanceTimersByTime(ms)`) to verify auto-dismissal without real-time delays.
+- **SSR & Browser Isolation:** Verify components instantiate cleanly without errors in non-browser platform contexts.
+- **Central Test Registry:** Maintain 100% synchronization in `tools/test-registry/test-registry.yaml`.
+
+---
+
+### Project Structure Notes
+
+- Primitives located under `packages/angular-renderer/src/components/primitives/<primitive-name>/`
+- Global overlay styles located in `packages/angular-renderer/src/styles/overlay.scss`
+- Test specs co-located as `<primitive-name>.component.spec.ts`
+- Public exports in `packages/angular-renderer/src/index.ts`
+- Primitives provider in `packages/angular-renderer/src/lib/primitives.provider.ts`
+- Central Test Registry in `tools/test-registry/test-registry.yaml`
+
+---
+
+### References
+
+- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Messaging & Notification Components]
+- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 7. MESSAGES & STATUS]
+- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/enhancements-for-origo-components.md#Section 8. Notifications / Messages]
+- [Source: docs/guidelines/overlay-portal-architecture.md]
+- [Source: docs/guidelines/component-invariants.md]
+- [Source: docs/guidelines/scss-and-tokens.md]
+- [Source: docs/guidelines/testing-primitives.md]
+- [Source: docs/definition-of-done.md]
+- [Source: packages/angular-renderer/src/lib/overlay/overlay.service.ts]
+- [Source: packages/angular-renderer/src/lib/overlay/overlay.models.ts]
+- [Source: packages/angular-renderer/src/styles/overlay.scss]
+
+---
+
+## Dev Agent Record
+
+### Agent Model Used
+
+Gemini 3.8 Flash (High)
+
+### Debug Log References
+
+- Verified live `OrigoOverlayService`, `OrigoOverlayRefImpl`, and `overlay.scss` in `packages/angular-renderer/src/lib/overlay/` and `src/styles/`.
+- Confirmed absence of `alert`, `toast`, `snackbar`, and `banner` primitive components in `packages/angular-renderer/src/components/primitives/`.
+- Extended `OrigoGlobalPositionAlignment` in `overlay.models.ts` and `overlay.service.ts` to support 8-point corner placements for Toast and Snackbar with exact CDK position method calls and RTL direction branching.
+- Mandated `pointer-events: none` on `.origo-overlay-pane--toast` and `.origo-overlay-pane--snackbar` with `pointer-events: auto` on inner cards to prevent background interaction blocking.
+- Detailed single-overlay stacking model for `ToastComponent` and multi-timer tracking map `Map<string, { timeoutId, startTime, remaining }>` for pause-on-hover and leak-free destruction.
+- Reinforced `ContainerComponent` optional signal query `viewChild('vc')` invariant on `AlertComponent` and `BannerComponent` to eliminate runtime `NG0951` crashes while designating `ToastComponent` and `SnackbarComponent` as leaf primitives.
+- Completed all contract schemas (`AlertContractSchema`, `ToastContractSchema`, `SnackbarContractSchema`, `BannerContractSchema`) with strict property definitions and aliases (`visible`, `text`, `actionLabel`, `life`) to prevent prop stripping under `coerceContractProps()`.
+- Added Keyboard & Focus Navigation Matrix for WCAG 2.1 AA compliance.
+- Confirmed test registry requirements in `tools/test-registry/test-registry.yaml` and ensured unique test ID naming conventions (`renderer-primitive-alert`, `renderer-primitive-toast`, `renderer-service-toast`, `renderer-primitive-snackbar`, `renderer-primitive-banner`).
+- Added test DOM isolation cleanup instructions in `afterEach()`.
+- Consolidated story specification into single canonical file under `_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md`.
+
+### Completion Notes List
+
+- Ultimate context engine analysis completed; comprehensive developer implementation guide created.
+- Defined all 4 messaging primitives (`Alert`, `Toast`, `Snackbar`, `Banner`) with explicit props, outputs, contract schemas, and DOM structures.
+- Enforced complete architectural invariants: Standalone, Shadow DOM, OnPush, Signals reactivity, `ContainerComponent` (`vc`), `coerceContractProps()`, and `[attr.data-testid]`.
+- Enforced Angular CDK Overlay portal projection via `OrigoOverlayService` for Toast and Snackbar to prevent Shadow DOM clipping and z-index trapping.
+- Enforced ARIA live region semantics (`role="alert"` vs `role="status"`, assertive vs polite) for screen reader accessibility.
+- Enforced zero-literal design tokens and CSS Logical Properties for bidirectional RTL mirroring.
+- Completed full implementation of all 4 standalone Angular messaging primitives (`AlertComponent`, `ToastComponent`, `SnackbarComponent`, `BannerComponent`) under `packages/angular-renderer/src/components/primitives/`.
+- Implemented `OrigoToastService` managing reactive toast notifications via Signals with duplicate prevention, pause-on-hover timers, and automatic portal overlay mounting.
+- Extended CDK Overlay positioning in `OrigoOverlayService` with 8-point corner alignments (`top-start`, `top-end`, `top-center`, `bottom-start`, `bottom-end`, `bottom-center`, etc.) and automated RTL direction flipping.
+- Implemented pass-through container overlays with `pointer-events: none` on panes and `pointer-events: auto` on message cards to guarantee background clickability without trapping pointer events.
+- Created and executed comprehensive unit test suites: 51 tests across 6 test suites (`alert.component.spec.ts`, `toast.component.spec.ts`, `toast.service.spec.ts`, `snackbar.component.spec.ts`, `banner.component.spec.ts`, `overlay.service.spec.ts`), 100% passing.
+- Registered all 5 test suites in `tools/test-registry/test-registry.yaml` and verified with `npm run validate:registry` (109 test cases verified passing).
+- Verified linting with `npx nx lint angular-renderer` (0 errors, 0 warnings in new primitive files).
+- Registered components in `primitives.provider.ts` and exported all primitives, services, and models in `src/index.ts`.
+
+### File List
+
+- `_bmad-output/implementation-artifacts/stories/2-3-messaging-and-notification-components.md` (STORY SPECIFICATION - CANONICAL)
+- `_bmad-output/implementation-artifacts/sprint-status.yaml` (TRACKING)
+- `packages/angular-renderer/src/components/primitives/alert/alert.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/alert/alert.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/alert/alert.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/toast/toast.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/toast/toast.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/toast/toast.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/toast/toast.models.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/toast/toast.service.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/banner/banner.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/banner/banner.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/banner/banner.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/lib/overlay/overlay.models.ts` (UPDATE)
+- `packages/angular-renderer/src/lib/overlay/overlay.service.ts` (UPDATE)
+- `packages/angular-renderer/src/styles/overlay.scss` (UPDATE)
+- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
+- `packages/angular-renderer/src/index.ts` (UPDATE)
+- `tools/test-registry/test-registry.yaml` (UPDATE)
+
+### Change Log
+
+- 2026-10-14: Created and hardened comprehensive developer story specification for Story 2.3 (Messaging & Notification Components). Validated against quality competition checklist. Enforced pointer-events pass-through on global overlay containers, single-overlay stacking model for multi-toast lists, robust multi-timer lifecycle map for pause-on-hover, complete contract schemas with alias resolution (`visible`, `text`, `actionLabel`, `life`), keyboard navigation matrix, test isolation in `afterEach()`, and registered 5 test suites. Status set to ready-for-dev.
+- 2026-10-14: Completed full implementation and test suites for Story 2.3 (AlertComponent, ToastComponent + OrigoToastService, SnackbarComponent, BannerComponent). Updated primitives provider, exports, and test registry. Passed all 51 tests across 6 test suites, passed registry validation (109 test cases verified), and passed Nx linting with zero errors/warnings in new primitives. Transitioned status to review.
diff --git a/packages/angular-renderer/src/components/primitives/alert/alert.component.html b/packages/angular-renderer/src/components/primitives/alert/alert.component.html
new file mode 100644
index 0000000..b308f08
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/alert/alert.component.html
@@ -0,0 +1,97 @@
+@if (isVisible()) {
+  <div
+    class="origo-alert origo-alert--{{ normalizedSeverity() }} origo-alert--{{ computedVariant() }}"
+    [attr.role]="role()"
+    [attr.aria-live]="ariaLive()"
+    aria-atomic="true"
+    [attr.aria-label]="ariaLabel()"
+    [attr.aria-describedby]="ariaDescribedBy()"
+  >
+    <div class="origo-alert__icon" aria-hidden="true">
+      @if (customIcon()) {
+        <span class="origo-alert__custom-icon">{{ customIcon() }}</span>
+      } @else {
+        @switch (normalizedSeverity()) {
+          @case ('success') {
+            <svg class="origo-alert__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+              <path
+                fill-rule="evenodd"
+                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
+                clip-rule="evenodd"
+              />
+            </svg>
+          }
+          @case ('warning') {
+            <svg class="origo-alert__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+              <path
+                fill-rule="evenodd"
+                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
+                clip-rule="evenodd"
+              />
+            </svg>
+          }
+          @case ('error') {
+            <svg class="origo-alert__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+              <path
+                fill-rule="evenodd"
+                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
+                clip-rule="evenodd"
+              />
+            </svg>
+          }
+          @default {
+            <svg class="origo-alert__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+              <path
+                fill-rule="evenodd"
+                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
+                clip-rule="evenodd"
+              />
+            </svg>
+          }
+        }
+      }
+    </div>
+
+    <div class="origo-alert__content">
+      @if (computedTitle()) {
+        <div class="origo-alert__title">{{ computedTitle() }}</div>
+      }
+      @if (computedMessage()) {
+        <div class="origo-alert__message">{{ computedMessage() }}</div>
+      }
+      <ng-container #vc></ng-container>
+      <ng-content></ng-content>
+    </div>
+
+    @if (actions().length > 0) {
+      <div class="origo-alert__actions">
+        @for (act of actions(); track act.action) {
+          <button
+            type="button"
+            class="origo-alert__action-btn origo-alert__action-btn--{{ act.variant || 'text' }}"
+            (click)="onActionClick(act)"
+          >
+            {{ act.label }}
+          </button>
+        }
+      </div>
+    }
+
+    @if (isClosable()) {
+      <button
+        type="button"
+        class="origo-alert__close-btn"
+        aria-label="Close alert"
+        (click)="onClose()"
+      >
+        <svg class="origo-alert__close-svg" viewBox="0 0 20 20" fill="currentColor">
+          <path
+            fill-rule="evenodd"
+            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
+            clip-rule="evenodd"
+          />
+        </svg>
+      </button>
+    }
+  </div>
+}
diff --git a/packages/angular-renderer/src/components/primitives/alert/alert.component.scss b/packages/angular-renderer/src/components/primitives/alert/alert.component.scss
new file mode 100644
index 0000000..bf200f6
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/alert/alert.component.scss
@@ -0,0 +1,192 @@
+:host {
+  display: block;
+  box-sizing: border-box;
+
+  &.origo-alert--hidden {
+    display: none !important;
+  }
+}
+
+.origo-alert {
+  display: flex;
+  align-items: flex-start;
+  box-sizing: border-box;
+  inline-size: 100%;
+  padding-inline: var(--origo-space-md, 1rem);
+  padding-block: var(--origo-space-md, 0.75rem);
+  margin-block-end: var(--origo-space-md, 1rem);
+  border-radius: var(--origo-radius-md, 0.375rem);
+  border: var(--origo-border-width-default, 1px) solid transparent;
+  gap: var(--origo-space-sm, 0.75rem);
+  transition: opacity var(--origo-motion-duration-fast, 150ms) ease;
+
+  // Severity: Info
+  &--info {
+    --origo-alert-bg: var(--origo-color-surface-subtle, #eff6ff);
+    --origo-alert-border: var(--origo-color-border-info, #bfdbfe);
+    --origo-alert-text: var(--origo-color-text-info, #1e40af);
+    --origo-alert-icon: var(--origo-color-text-info, #1e40af);
+  }
+
+  // Severity: Success
+  &--success {
+    --origo-alert-bg: var(--origo-color-surface-success, #ecfdf5);
+    --origo-alert-border: var(--origo-color-border-success, #a7f3d0);
+    --origo-alert-text: var(--origo-color-text-success, #065f46);
+    --origo-alert-icon: var(--origo-color-text-success, #065f46);
+  }
+
+  // Severity: Warning
+  &--warning {
+    --origo-alert-bg: var(--origo-color-surface-warning, #fffbeb);
+    --origo-alert-border: var(--origo-color-border-warning, #fde68a);
+    --origo-alert-text: var(--origo-color-text-warning, #92400e);
+    --origo-alert-icon: var(--origo-color-text-warning, #92400e);
+  }
+
+  // Severity: Error
+  &--error {
+    --origo-alert-bg: var(--origo-color-surface-danger, #fef2f2);
+    --origo-alert-border: var(--origo-color-border-danger, #fecaca);
+    --origo-alert-text: var(--origo-color-text-danger, #991b1b);
+    --origo-alert-icon: var(--origo-color-text-danger, #991b1b);
+  }
+
+  // Variant: Standard (Subtle bg + full border + thick inline-start accent)
+  &--standard {
+    background-color: var(--origo-alert-bg);
+    border-color: var(--origo-alert-border);
+    border-inline-start: var(--origo-border-width-accent, 4px) solid var(--origo-alert-text);
+    color: var(--origo-alert-text);
+  }
+
+  // Variant: Outlined (Transparent bg + border)
+  &--outlined {
+    background-color: transparent;
+    border-color: var(--origo-alert-border);
+    color: var(--origo-alert-text);
+  }
+
+  // Variant: Filled (Full color bg + inverse text)
+  &--filled {
+    background-color: var(--origo-alert-text);
+    border-color: var(--origo-alert-text);
+    color: var(--origo-color-text-inverse, #ffffff);
+
+    .origo-alert__icon {
+      color: var(--origo-color-text-inverse, #ffffff);
+    }
+
+    .origo-alert__close-btn {
+      color: var(--origo-color-text-inverse, #ffffff);
+      &:hover {
+        background-color: rgba(255, 255, 255, 0.2);
+      }
+    }
+  }
+
+  &__icon {
+    flex-shrink: 0;
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    color: var(--origo-alert-icon);
+    inline-size: var(--origo-size-icon-md, 1.25rem);
+    block-size: var(--origo-size-icon-md, 1.25rem);
+    margin-block-start: var(--origo-space-2xs, 0.125rem);
+  }
+
+  &__svg-icon {
+    inline-size: 100%;
+    block-size: 100%;
+  }
+
+  &__custom-icon {
+    font-size: var(--origo-font-size-md, 1.125rem);
+    line-height: 1;
+  }
+
+  &__content {
+    flex: 1 1 auto;
+    min-inline-size: 0;
+  }
+
+  &__title {
+    font-family: var(--origo-font-family-base, inherit);
+    font-weight: var(--origo-font-weight-semibold, 600);
+    font-size: var(--origo-font-size-md, 0.9375rem);
+    line-height: var(--origo-line-height-normal, 1.375);
+    margin-block-end: var(--origo-space-2xs, 0.25rem);
+  }
+
+  &__message {
+    font-family: var(--origo-font-family-base, inherit);
+    font-size: var(--origo-font-size-sm, 0.875rem);
+    line-height: var(--origo-line-height-normal, 1.4);
+  }
+
+  &__actions {
+    display: flex;
+    align-items: center;
+    gap: var(--origo-space-xs, 0.5rem);
+    margin-inline-start: auto;
+    flex-shrink: 0;
+  }
+
+  &__action-btn {
+    border: none;
+    background: transparent;
+    cursor: pointer;
+    font-family: var(--origo-font-family-base, inherit);
+    font-weight: var(--origo-font-weight-semibold, 600);
+    font-size: var(--origo-font-size-sm, 0.875rem);
+    padding-inline: var(--origo-space-sm, 0.5rem);
+    padding-block: var(--origo-space-xs, 0.25rem);
+    border-radius: var(--origo-radius-sm, 0.25rem);
+    color: inherit;
+    text-decoration: underline;
+
+    &:hover {
+      opacity: 0.85;
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus, 2px) solid currentColor;
+      outline-offset: 2px;
+    }
+  }
+
+  &__close-btn {
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    flex-shrink: 0;
+    margin-inline-start: var(--origo-space-xs, 0.5rem);
+    inline-size: var(--origo-size-icon-md, 1.5rem);
+    block-size: var(--origo-size-icon-md, 1.5rem);
+    border: none;
+    background: transparent;
+    border-radius: var(--origo-radius-sm, 0.25rem);
+    color: inherit;
+    cursor: pointer;
+    padding-inline: 0;
+    padding-block: 0;
+    opacity: 0.75;
+    transition: opacity var(--origo-motion-duration-fast, 150ms) ease;
+
+    &:hover {
+      opacity: 1;
+      background-color: rgba(0, 0, 0, 0.05);
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus, 2px) solid currentColor;
+      outline-offset: 2px;
+    }
+  }
+
+  &__close-svg {
+    inline-size: var(--origo-size-icon-sm, 1rem);
+    block-size: var(--origo-size-icon-sm, 1rem);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts b/packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts
new file mode 100644
index 0000000..df2e098
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts
@@ -0,0 +1,271 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
+import { AlertComponent, AlertProps } from './alert.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('AlertComponent', () => {
+  let fixture: ComponentFixture<AlertComponent>;
+  let component: AlertComponent;
+  let experienceAdapter: WebExperienceAdapterService;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [AlertComponent],
+      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(AlertComponent);
+    component = fixture.componentInstance;
+    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    jest.clearAllMocks();
+  });
+
+  it('should render host with data-testid', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-1',
+      type: 'Alert',
+      props: {
+        visible: true,
+        severity: 'info',
+        title: 'Info Title',
+        message: 'This is an information message',
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-alert-1');
+  });
+
+  it('should pierce Shadow DOM and render title, message, and icon for info severity', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-1',
+      type: 'Alert',
+      props: {
+        visible: true,
+        severity: 'info',
+        title: 'Info Title',
+        message: 'This is an information message',
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    expect(shadow).toBeTruthy();
+
+    const alertBox = shadow.querySelector('.origo-alert');
+    expect(alertBox).toBeTruthy();
+    expect(alertBox.classList.contains('origo-alert--info')).toBe(true);
+    expect(alertBox.getAttribute('role')).toBe('status');
+    expect(alertBox.getAttribute('aria-live')).toBe('polite');
+
+    const title = shadow.querySelector('.origo-alert__title');
+    expect(title?.textContent?.trim()).toBe('Info Title');
+
+    const message = shadow.querySelector('.origo-alert__message');
+    expect(message?.textContent?.trim()).toBe('This is an information message');
+  });
+
+  it('should assign role="alert" and aria-live="assertive" for error and warning severities', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-err',
+      type: 'Alert',
+      props: {
+        severity: 'error',
+        title: 'Error Occurred',
+        message: 'Something went wrong',
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    let alertBox = shadow.querySelector('.origo-alert');
+
+    expect(alertBox.classList.contains('origo-alert--error')).toBe(true);
+    expect(alertBox.getAttribute('role')).toBe('alert');
+    expect(alertBox.getAttribute('aria-live')).toBe('assertive');
+
+    // Test warning
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-warn',
+      type: 'Alert',
+      props: {
+        severity: 'warning',
+        message: 'Warning text',
+      },
+    });
+    fixture.detectChanges();
+
+    alertBox = shadow.querySelector('.origo-alert');
+    expect(alertBox.classList.contains('origo-alert--warning')).toBe(true);
+    expect(alertBox.getAttribute('role')).toBe('alert');
+    expect(alertBox.getAttribute('aria-live')).toBe('assertive');
+  });
+
+  it('should support backwards-compatible "text" property for message', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-text',
+      type: 'Message',
+      props: {
+        severity: 'success',
+        text: 'Action completed successfully via text prop',
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    const message = shadow.querySelector('.origo-alert__message');
+    expect(message?.textContent?.trim()).toBe('Action completed successfully via text prop');
+  });
+
+  it('should handle dismissal via close button click and update state', () => {
+    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+    let emittedClose = false;
+    let emittedVisible: boolean | undefined = undefined;
+
+    component.close.subscribe(() => (emittedClose = true));
+    component.visibleChange.subscribe(v => (emittedVisible = v));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-close',
+      type: 'Alert',
+      props: {
+        title: 'Closable Alert',
+        message: 'Close me',
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    const closeBtn = shadow.querySelector('.origo-alert__close-btn') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+    expect(closeBtn.getAttribute('aria-label')).toBe('Close alert');
+
+    closeBtn.click();
+    fixture.detectChanges();
+
+    expect(updateStateSpy).toHaveBeenCalledWith('test-alert-close', 'visible', false);
+    expect(emittedClose).toBe(true);
+    expect(emittedVisible).toBe(false);
+    expect(shadow.querySelector('.origo-alert')).toBeNull();
+    expect(fixture.nativeElement.classList.contains('origo-alert--hidden')).toBe(true);
+  });
+
+  it('should dispatch action and capability when action button is clicked', () => {
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    let emittedAction: { action: string; data?: unknown } | undefined = undefined;
+    component.action.subscribe(a => (emittedAction = a));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-act',
+      type: 'Alert',
+      props: {
+        title: 'Needs Action',
+        message: 'Please review',
+        actions: [
+          { label: 'Retry', action: 'retry-op' },
+          { label: 'Cancel', action: 'cancel-op', variant: 'secondary' },
+        ],
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    const buttons = shadow.querySelectorAll('.origo-alert__action-btn');
+    expect(buttons.length).toBe(2);
+
+    (buttons[0] as HTMLButtonElement).click();
+    expect(dispatchSpy).toHaveBeenCalledWith('test-alert-act', 'retry-op', {
+      label: 'Retry',
+      action: 'retry-op',
+    });
+    expect(emittedAction).toEqual({
+      action: 'retry-op',
+      data: { label: 'Retry', action: 'retry-op' },
+    });
+  });
+
+  it('should auto-dismiss after life ms duration', () => {
+    jest.useFakeTimers();
+    try {
+      const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+
+      fixture.componentRef.setInput('contract', {
+        id: 'test-alert-life',
+        type: 'Alert',
+        props: {
+          message: 'Auto dismiss alert',
+          life: 2000,
+        },
+      });
+      fixture.detectChanges();
+
+      const shadow = fixture.nativeElement.shadowRoot;
+      expect(shadow.querySelector('.origo-alert')).toBeTruthy();
+
+      jest.advanceTimersByTime(1000);
+      fixture.detectChanges();
+      expect(shadow.querySelector('.origo-alert')).toBeTruthy();
+
+      jest.advanceTimersByTime(1000);
+      fixture.detectChanges();
+      expect(updateStateSpy).toHaveBeenCalledWith('test-alert-life', 'visible', false);
+      expect(shadow.querySelector('.origo-alert')).toBeNull();
+    } finally {
+      jest.useRealTimers();
+    }
+  });
+
+  it('should render custom icon when provided', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-custom-icon',
+      type: 'Alert',
+      props: {
+        icon: '🔔',
+        message: 'Custom icon alert',
+      },
+    });
+    fixture.detectChanges();
+
+    const customIcon = fixture.nativeElement.shadowRoot.querySelector('.origo-alert__custom-icon');
+    expect(customIcon?.textContent?.trim()).toBe('🔔');
+  });
+
+  it('should safely render without errors when props are null or undefined', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-alert-null',
+      type: 'Alert',
+      props: undefined as unknown as AlertProps,
+    });
+    expect(() => fixture.detectChanges()).not.toThrow();
+
+    expect(fixture.nativeElement.shadowRoot.querySelector('.origo-alert')).toBeTruthy();
+  });
+
+  it('should safely initialize in SSR server platform without timers', () => {
+    TestBed.resetTestingModule();
+    TestBed.configureTestingModule({
+      imports: [AlertComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        WebExperienceAdapterService,
+        { provide: PLATFORM_ID, useValue: 'server' },
+      ],
+    });
+
+    const alertFixture = TestBed.createComponent(AlertComponent);
+    alertFixture.componentRef.setInput('contract', {
+      id: 'ssr-alert',
+      type: 'Alert',
+      props: { message: 'SSR Alert', life: 1000 },
+    });
+
+    expect(() => alertFixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/alert/alert.component.ts b/packages/angular-renderer/src/components/primitives/alert/alert.component.ts
new file mode 100644
index 0000000..874735a
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/alert/alert.component.ts
@@ -0,0 +1,176 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  computed,
+  signal,
+  effect,
+  DestroyRef,
+  PLATFORM_ID,
+} from '@angular/core';
+import { CommonModule, isPlatformBrowser } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface AlertAction {
+  label: string;
+  action: string;
+  variant?: 'primary' | 'secondary' | 'text' | string;
+}
+
+export interface AlertProps {
+  visible?: boolean;
+  severity?: 'info' | 'success' | 'warn' | 'warning' | 'error';
+  title?: string;
+  message?: string;
+  text?: string;
+  icon?: string;
+  closable?: boolean;
+  variant?: 'standard' | 'outlined' | 'filled';
+  actions?: AlertAction[];
+  life?: number;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const AlertContractSchema = {
+  visible: 'boolean',
+  severity: 'string',
+  title: 'string',
+  message: 'string',
+  text: 'string',
+  icon: 'string',
+  closable: 'boolean',
+  variant: 'string',
+  actions: 'array',
+  life: 'number',
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+} as const;
+
+@Component({
+  selector: 'origo-alert',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './alert.component.html',
+  styleUrls: ['./alert.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-alert-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+    '[class.origo-alert--hidden]': '!isVisible()',
+  },
+})
+export class AlertComponent implements OrigoAdapter<AlertProps>, ContainerComponent {
+  static readonly contractSchema = AlertContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<AlertProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+
+  close = output<void>();
+  action = output<{ action: string; data?: unknown }>();
+  visibleChange = output<boolean>();
+
+  private experienceAdapter = inject(WebExperienceAdapterService);
+  private destroyRef = inject(DestroyRef);
+  private platformId = inject(PLATFORM_ID);
+
+  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
+  readonly isVisible = signal(true);
+
+  readonly coercedProps = computed(() =>
+    coerceContractProps<AlertProps>(this.contract()?.props, AlertContractSchema)
+  );
+
+  readonly normalizedSeverity = computed(() => {
+    const sev = this.coercedProps().severity?.toLowerCase();
+    if (sev === 'warn' || sev === 'warning') return 'warning';
+    if (sev === 'error') return 'error';
+    if (sev === 'success') return 'success';
+    return 'info';
+  });
+
+  readonly computedVariant = computed(() => this.coercedProps().variant || 'standard');
+
+  readonly computedTitle = computed(() => this.coercedProps().title);
+
+  readonly computedMessage = computed(
+    () => this.coercedProps().message ?? this.coercedProps().text ?? ''
+  );
+
+  readonly isClosable = computed(() => this.coercedProps().closable === true);
+
+  readonly actions = computed(() => this.coercedProps().actions ?? []);
+
+  readonly customIcon = computed(() => this.coercedProps().icon);
+
+  readonly role = computed(() => {
+    const sev = this.normalizedSeverity();
+    return sev === 'error' || sev === 'warning' ? 'alert' : 'status';
+  });
+
+  readonly ariaLive = computed(() => {
+    const sev = this.normalizedSeverity();
+    return sev === 'error' || sev === 'warning' ? 'assertive' : 'polite';
+  });
+
+  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);
+
+  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
+
+  constructor() {
+    this.destroyRef.onDestroy(() => this.clearTimer());
+
+    effect(() => {
+      const props = this.coercedProps();
+      const contractVisible = props.visible !== false;
+      this.isVisible.set(contractVisible);
+
+      this.clearTimer();
+
+      if (contractVisible && props.life && props.life > 0 && isPlatformBrowser(this.platformId)) {
+        this.autoDismissTimer = setTimeout(() => {
+          this.onClose();
+        }, props.life);
+      }
+    });
+  }
+
+  private clearTimer(): void {
+    if (this.autoDismissTimer) {
+      clearTimeout(this.autoDismissTimer);
+      this.autoDismissTimer = null;
+    }
+  }
+
+  onClose(): void {
+    this.clearTimer();
+    this.isVisible.set(false);
+    this.visibleChange.emit(false);
+    this.close.emit();
+    this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+  }
+
+  onActionClick(act: AlertAction): void {
+    this.action.emit({ action: act.action, data: act });
+    this.experienceAdapter.dispatchCapability(this.contract().id, act.action, act);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/banner/banner.component.html b/packages/angular-renderer/src/components/primitives/banner/banner.component.html
new file mode 100644
index 0000000..ccf6c2d
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/banner/banner.component.html
@@ -0,0 +1,101 @@
+@if (isVisible()) {
+  <div
+    class="origo-banner origo-banner--{{ normalizedSeverity() }} origo-banner--{{
+      computedVariant()
+    }}"
+    [class.origo-banner--fluid]="isFluid()"
+    role="region"
+    [attr.aria-label]="ariaLabel()"
+    [attr.aria-describedby]="ariaDescribedBy()"
+    [attr.aria-live]="ariaLive()"
+  >
+    <div class="origo-banner__body">
+      <div class="origo-banner__icon" aria-hidden="true">
+        @if (customIcon()) {
+          <span class="origo-banner__custom-icon">{{ customIcon() }}</span>
+        } @else {
+          @switch (normalizedSeverity()) {
+            @case ('success') {
+              <svg class="origo-banner__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                <path
+                  fill-rule="evenodd"
+                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
+                  clip-rule="evenodd"
+                />
+              </svg>
+            }
+            @case ('warning') {
+              <svg class="origo-banner__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                <path
+                  fill-rule="evenodd"
+                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
+                  clip-rule="evenodd"
+                />
+              </svg>
+            }
+            @case ('error') {
+              <svg class="origo-banner__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                <path
+                  fill-rule="evenodd"
+                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
+                  clip-rule="evenodd"
+                />
+              </svg>
+            }
+            @default {
+              <svg class="origo-banner__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                <path
+                  fill-rule="evenodd"
+                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
+                  clip-rule="evenodd"
+                />
+              </svg>
+            }
+          }
+        }
+      </div>
+
+      <div class="origo-banner__content">
+        @if (computedTitle()) {
+          <strong class="origo-banner__title">{{ computedTitle() }}</strong>
+        }
+        @if (computedMessage()) {
+          <span class="origo-banner__message">{{ computedMessage() }}</span>
+        }
+        <ng-container #vc></ng-container>
+        <ng-content></ng-content>
+      </div>
+
+      @if (actions().length > 0) {
+        <div class="origo-banner__actions">
+          @for (act of actions(); track act.action) {
+            <button
+              type="button"
+              class="origo-banner__action-btn origo-banner__action-btn--{{ act.variant || 'text' }}"
+              (click)="onActionClick(act)"
+            >
+              {{ act.label }}
+            </button>
+          }
+        </div>
+      }
+
+      @if (isClosable()) {
+        <button
+          type="button"
+          class="origo-banner__close-btn"
+          aria-label="Close banner"
+          (click)="onClose()"
+        >
+          <svg class="origo-banner__close-svg" viewBox="0 0 20 20" fill="currentColor">
+            <path
+              fill-rule="evenodd"
+              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
+              clip-rule="evenodd"
+            />
+          </svg>
+        </button>
+      }
+    </div>
+  </div>
+}
diff --git a/packages/angular-renderer/src/components/primitives/banner/banner.component.scss b/packages/angular-renderer/src/components/primitives/banner/banner.component.scss
new file mode 100644
index 0000000..2dafcbc
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/banner/banner.component.scss
@@ -0,0 +1,199 @@
+:host {
+  display: block;
+  box-sizing: border-box;
+
+  &.origo-banner--sticky {
+    position: sticky;
+    inset-block-start: 0;
+    z-index: var(--origo-z-sticky, 100);
+  }
+
+  &.origo-banner--hidden {
+    display: none !important;
+  }
+}
+
+.origo-banner {
+  box-sizing: border-box;
+  padding-inline: var(--origo-space-lg, 1.5rem);
+  padding-block: var(--origo-space-sm, 0.75rem);
+  border-block-end: var(--origo-border-width-default, 1px) solid transparent;
+  transition: all var(--origo-motion-duration-fast, 150ms) ease;
+
+  &--fluid {
+    inline-size: 100%;
+  }
+
+  // Severity: Info
+  &--info {
+    --origo-banner-bg: var(--origo-color-surface-subtle, #eff6ff);
+    --origo-banner-border: var(--origo-color-border-info, #bfdbfe);
+    --origo-banner-text: var(--origo-color-text-info, #1e40af);
+  }
+
+  // Severity: Success
+  &--success {
+    --origo-banner-bg: var(--origo-color-surface-success, #ecfdf5);
+    --origo-banner-border: var(--origo-color-border-success, #a7f3d0);
+    --origo-banner-text: var(--origo-color-text-success, #065f46);
+  }
+
+  // Severity: Warning
+  &--warning {
+    --origo-banner-bg: var(--origo-color-surface-warning, #fffbeb);
+    --origo-banner-border: var(--origo-color-border-warning, #fde68a);
+    --origo-banner-text: var(--origo-color-text-warning, #92400e);
+  }
+
+  // Severity: Error
+  &--error {
+    --origo-banner-bg: var(--origo-color-surface-danger, #fef2f2);
+    --origo-banner-border: var(--origo-color-border-danger, #fecaca);
+    --origo-banner-text: var(--origo-color-text-danger, #991b1b);
+  }
+
+  // Variant: Standard (Subtle background + border)
+  &--standard {
+    background-color: var(--origo-banner-bg);
+    border-block-end-color: var(--origo-banner-border);
+    color: var(--origo-banner-text);
+  }
+
+  // Variant: Outlined (Transparent + bordered)
+  &--outlined {
+    background-color: transparent;
+    border-block-end-color: var(--origo-banner-border);
+    border-block-start: var(--origo-border-width-default, 1px) solid var(--origo-banner-border);
+    color: var(--origo-banner-text);
+  }
+
+  // Variant: Filled (Solid color + inverse text)
+  &--filled {
+    background-color: var(--origo-banner-text);
+    border-block-end-color: var(--origo-banner-text);
+    color: var(--origo-color-text-inverse, #ffffff);
+
+    .origo-banner__icon {
+      color: var(--origo-color-text-inverse, #ffffff);
+    }
+
+    .origo-banner__close-btn {
+      color: var(--origo-color-text-inverse, #ffffff);
+      &:hover {
+        background-color: rgba(255, 255, 255, 0.2);
+      }
+    }
+  }
+
+  &__body {
+    display: flex;
+    align-items: center;
+    gap: var(--origo-space-md, 1rem);
+    inline-size: 100%;
+    box-sizing: border-box;
+  }
+
+  &__icon {
+    flex-shrink: 0;
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    inline-size: var(--origo-size-icon-md, 1.25rem);
+    block-size: var(--origo-size-icon-md, 1.25rem);
+    color: var(--origo-banner-text);
+  }
+
+  &__svg-icon {
+    inline-size: 100%;
+    block-size: 100%;
+  }
+
+  &__custom-icon {
+    font-size: var(--origo-font-size-md, 1.125rem);
+    line-height: 1;
+  }
+
+  &__content {
+    flex: 1 1 auto;
+    display: flex;
+    align-items: center;
+    gap: var(--origo-space-xs, 0.5rem);
+    flex-wrap: wrap;
+    font-family: var(--origo-font-family-base, inherit);
+    font-size: var(--origo-font-size-sm, 0.875rem);
+    line-height: var(--origo-line-height-normal, 1.4);
+  }
+
+  &__title {
+    font-weight: var(--origo-font-weight-semibold, 600);
+    margin-inline-end: var(--origo-space-2xs, 0.25rem);
+  }
+
+  &__message {
+    font-weight: var(--origo-font-weight-normal, 400);
+  }
+
+  &__actions {
+    display: flex;
+    align-items: center;
+    gap: var(--origo-space-xs, 0.5rem);
+    flex-shrink: 0;
+  }
+
+  &__action-btn {
+    border: none;
+    background: transparent;
+    cursor: pointer;
+    font-family: var(--origo-font-family-base, inherit);
+    font-weight: var(--origo-font-weight-semibold, 600);
+    font-size: var(--origo-font-size-sm, 0.875rem);
+    padding-inline: var(--origo-space-sm, 0.5rem);
+    padding-block: var(--origo-space-xs, 0.25rem);
+    border-radius: var(--origo-radius-sm, 0.25rem);
+    color: inherit;
+    text-decoration: underline;
+
+    &:hover {
+      opacity: 0.85;
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus, 2px) solid currentColor;
+      outline-offset: 2px;
+    }
+  }
+
+  &__close-btn {
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    flex-shrink: 0;
+    margin-inline-start: var(--origo-space-xs, 0.5rem);
+    inline-size: var(--origo-size-icon-md, 1.5rem);
+    block-size: var(--origo-size-icon-md, 1.5rem);
+    border: none;
+    background: transparent;
+    border-radius: var(--origo-radius-sm, 0.25rem);
+    color: inherit;
+    cursor: pointer;
+    padding-inline: 0;
+    padding-block: 0;
+    opacity: 0.75;
+    transition: opacity var(--origo-motion-duration-fast, 150ms) ease;
+
+    &:hover {
+      opacity: 1;
+      background-color: rgba(0, 0, 0, 0.05);
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus, 2px) solid currentColor;
+      outline-offset: 2px;
+    }
+  }
+
+  &__close-svg {
+    inline-size: var(--origo-size-icon-sm, 1rem);
+    block-size: var(--origo-size-icon-sm, 1rem);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts b/packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts
new file mode 100644
index 0000000..b3f9d8b
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts
@@ -0,0 +1,277 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
+import { BannerComponent, BannerProps } from './banner.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('BannerComponent', () => {
+  let fixture: ComponentFixture<BannerComponent>;
+  let component: BannerComponent;
+  let experienceAdapter: WebExperienceAdapterService;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [BannerComponent],
+      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(BannerComponent);
+    component = fixture.componentInstance;
+    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    jest.clearAllMocks();
+  });
+
+  it('should render host with data-testid', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-1',
+      type: 'Banner',
+      props: {
+        title: 'System Notice',
+        message: 'Scheduled maintenance tonight',
+      },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-banner-1');
+  });
+
+  it('should pierce Shadow DOM and render title, message, and icon for info severity', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-info',
+      type: 'Banner',
+      props: {
+        severity: 'info',
+        title: 'System Notice',
+        message: 'Scheduled maintenance tonight at 10 PM',
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    expect(shadow).toBeTruthy();
+
+    const bannerBox = shadow.querySelector('.origo-banner');
+    expect(bannerBox).toBeTruthy();
+    expect(bannerBox.classList.contains('origo-banner--info')).toBe(true);
+    expect(bannerBox.classList.contains('origo-banner--fluid')).toBe(true);
+    expect(bannerBox.getAttribute('role')).toBe('region');
+    expect(bannerBox.getAttribute('aria-live')).toBe('polite');
+
+    const title = shadow.querySelector('.origo-banner__title');
+    expect(title?.textContent?.trim()).toBe('System Notice');
+
+    const msg = shadow.querySelector('.origo-banner__message');
+    expect(msg?.textContent?.trim()).toBe('Scheduled maintenance tonight at 10 PM');
+  });
+
+  it('should assign aria-live="assertive" for error and warning severities', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-err',
+      type: 'Banner',
+      props: {
+        severity: 'error',
+        title: 'Outage',
+        message: 'Service is down',
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    let bannerBox = shadow.querySelector('.origo-banner');
+    expect(bannerBox.classList.contains('origo-banner--error')).toBe(true);
+    expect(bannerBox.getAttribute('aria-live')).toBe('assertive');
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-warn',
+      type: 'Banner',
+      props: {
+        severity: 'warn',
+        title: 'Warning',
+        message: 'High latency',
+      },
+    });
+    fixture.detectChanges();
+
+    bannerBox = shadow.querySelector('.origo-banner');
+    expect(bannerBox.classList.contains('origo-banner--warning')).toBe(true);
+    expect(bannerBox.getAttribute('aria-live')).toBe('assertive');
+  });
+
+  it('should apply sticky host class when sticky is true', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-sticky',
+      type: 'Banner',
+      props: {
+        sticky: true,
+        message: 'Sticky banner',
+      },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.classList.contains('origo-banner--sticky')).toBe(true);
+  });
+
+  it('should support backwards-compatible "text" property for message', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-text',
+      type: 'Banner',
+      props: {
+        text: 'Announcement text via text prop',
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    const msg = shadow.querySelector('.origo-banner__message');
+    expect(msg?.textContent?.trim()).toBe('Announcement text via text prop');
+  });
+
+  it('should handle dismissal via close button click and update state', () => {
+    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+    let emittedClose = false;
+    let emittedVisible: boolean | undefined = undefined;
+
+    component.close.subscribe(() => (emittedClose = true));
+    component.visibleChange.subscribe(v => (emittedVisible = v));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-close',
+      type: 'Banner',
+      props: {
+        title: 'Closable Banner',
+        message: 'Click close',
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    const closeBtn = shadow.querySelector('.origo-banner__close-btn') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+    expect(closeBtn.getAttribute('aria-label')).toBe('Close banner');
+
+    closeBtn.click();
+    fixture.detectChanges();
+
+    expect(updateStateSpy).toHaveBeenCalledWith('test-banner-close', 'visible', false);
+    expect(emittedClose).toBe(true);
+    expect(emittedVisible).toBe(false);
+    expect(shadow.querySelector('.origo-banner')).toBeNull();
+    expect(fixture.nativeElement.classList.contains('origo-banner--hidden')).toBe(true);
+  });
+
+  it('should dispatch action and capability when action button is clicked', () => {
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    let emittedAction: { action: string; data?: unknown } | undefined = undefined;
+    component.action.subscribe(a => (emittedAction = a));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-act',
+      type: 'Banner',
+      props: {
+        title: 'New Feature',
+        message: 'Try our new dashboard',
+        actions: [
+          { label: 'Learn More', action: 'learn-more' },
+          { label: 'Dismiss', action: 'dismiss', variant: 'secondary' },
+        ],
+      },
+    });
+    fixture.detectChanges();
+
+    const shadow = fixture.nativeElement.shadowRoot;
+    const buttons = shadow.querySelectorAll('.origo-banner__action-btn');
+    expect(buttons.length).toBe(2);
+
+    (buttons[0] as HTMLButtonElement).click();
+    expect(dispatchSpy).toHaveBeenCalledWith('test-banner-act', 'learn-more', {
+      label: 'Learn More',
+      action: 'learn-more',
+    });
+    expect(emittedAction).toEqual({
+      action: 'learn-more',
+      data: { label: 'Learn More', action: 'learn-more' },
+    });
+  });
+
+  it('should auto-dismiss after life ms duration', () => {
+    jest.useFakeTimers();
+    try {
+      const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+
+      fixture.componentRef.setInput('contract', {
+        id: 'test-banner-life',
+        type: 'Banner',
+        props: {
+          message: 'Auto dismiss banner',
+          life: 2500,
+        },
+      });
+      fixture.detectChanges();
+
+      const shadow = fixture.nativeElement.shadowRoot;
+      expect(shadow.querySelector('.origo-banner')).toBeTruthy();
+
+      jest.advanceTimersByTime(1500);
+      fixture.detectChanges();
+      expect(shadow.querySelector('.origo-banner')).toBeTruthy();
+
+      jest.advanceTimersByTime(1000);
+      fixture.detectChanges();
+      expect(updateStateSpy).toHaveBeenCalledWith('test-banner-life', 'visible', false);
+      expect(shadow.querySelector('.origo-banner')).toBeNull();
+    } finally {
+      jest.useRealTimers();
+    }
+  });
+
+  it('should render custom icon when provided', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-icon',
+      type: 'Banner',
+      props: {
+        icon: '📢',
+        message: 'Custom icon banner',
+      },
+    });
+    fixture.detectChanges();
+
+    const customIcon = fixture.nativeElement.shadowRoot.querySelector('.origo-banner__custom-icon');
+    expect(customIcon?.textContent?.trim()).toBe('📢');
+  });
+
+  it('should safely render without errors when props are null or undefined', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-banner-null',
+      type: 'Banner',
+      props: undefined as unknown as BannerProps,
+    });
+    expect(() => fixture.detectChanges()).not.toThrow();
+
+    expect(fixture.nativeElement.shadowRoot.querySelector('.origo-banner')).toBeTruthy();
+  });
+
+  it('should safely initialize in SSR server platform without timers', () => {
+    TestBed.resetTestingModule();
+    TestBed.configureTestingModule({
+      imports: [BannerComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        WebExperienceAdapterService,
+        { provide: PLATFORM_ID, useValue: 'server' },
+      ],
+    });
+
+    const bannerFixture = TestBed.createComponent(BannerComponent);
+    bannerFixture.componentRef.setInput('contract', {
+      id: 'ssr-banner',
+      type: 'Banner',
+      props: { message: 'SSR Banner', life: 1000 },
+    });
+
+    expect(() => bannerFixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/banner/banner.component.ts b/packages/angular-renderer/src/components/primitives/banner/banner.component.ts
new file mode 100644
index 0000000..30983c3
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/banner/banner.component.ts
@@ -0,0 +1,182 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  computed,
+  signal,
+  effect,
+  DestroyRef,
+  PLATFORM_ID,
+} from '@angular/core';
+import { CommonModule, isPlatformBrowser } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface BannerAction {
+  label: string;
+  action: string;
+  variant?: 'primary' | 'secondary' | 'text' | string;
+}
+
+export interface BannerProps {
+  visible?: boolean;
+  severity?: 'info' | 'success' | 'warn' | 'error';
+  title?: string;
+  message?: string;
+  text?: string;
+  icon?: string;
+  closable?: boolean;
+  sticky?: boolean;
+  fluid?: boolean;
+  variant?: 'standard' | 'outlined' | 'filled';
+  actions?: BannerAction[];
+  life?: number;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const BannerContractSchema = {
+  visible: 'boolean',
+  severity: 'string',
+  title: 'string',
+  message: 'string',
+  text: 'string',
+  icon: 'string',
+  closable: 'boolean',
+  sticky: 'boolean',
+  fluid: 'boolean',
+  variant: 'string',
+  actions: 'array',
+  life: 'number',
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+} as const;
+
+@Component({
+  selector: 'origo-banner',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './banner.component.html',
+  styleUrls: ['./banner.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-banner-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+    '[class.origo-banner--sticky]': 'isSticky()',
+    '[class.origo-banner--hidden]': '!isVisible()',
+  },
+})
+export class BannerComponent implements OrigoAdapter<BannerProps>, ContainerComponent {
+  static readonly contractSchema = BannerContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<BannerProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+
+  visibleChange = output<boolean>();
+  close = output<void>();
+  action = output<{ action: string; data?: unknown }>();
+
+  private experienceAdapter = inject(WebExperienceAdapterService);
+  private destroyRef = inject(DestroyRef);
+  private platformId = inject(PLATFORM_ID);
+
+  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
+  readonly isVisible = signal(true);
+
+  readonly coercedProps = computed(() =>
+    coerceContractProps<BannerProps>(this.contract()?.props, BannerContractSchema)
+  );
+
+  readonly normalizedSeverity = computed(() => {
+    const s = this.coercedProps().severity?.toLowerCase();
+    if (s === 'warn' || s === 'warning') return 'warning';
+    if (s === 'error') return 'error';
+    if (s === 'success') return 'success';
+    return 'info';
+  });
+
+  readonly computedTitle = computed(() => this.coercedProps().title);
+
+  readonly computedMessage = computed(
+    () => this.coercedProps().message ?? this.coercedProps().text ?? ''
+  );
+
+  readonly computedVariant = computed(() => this.coercedProps().variant || 'standard');
+
+  readonly isClosable = computed(() => this.coercedProps().closable === true);
+
+  readonly isSticky = computed(() => this.coercedProps().sticky === true);
+
+  readonly isFluid = computed(() => this.coercedProps().fluid !== false);
+
+  readonly actions = computed(() => this.coercedProps().actions ?? []);
+
+  readonly customIcon = computed(() => this.coercedProps().icon);
+
+  readonly ariaLabel = computed(() => {
+    return this.coercedProps()['aria-label'] || this.computedTitle() || 'System announcement';
+  });
+
+  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
+
+  readonly ariaLive = computed(() => {
+    const s = this.normalizedSeverity();
+    return s === 'error' || s === 'warning' ? 'assertive' : 'polite';
+  });
+
+  constructor() {
+    this.destroyRef.onDestroy(() => this.clearTimer());
+
+    effect(() => {
+      const props = this.coercedProps();
+      const contractVisible = props.visible !== false;
+      this.isVisible.set(contractVisible);
+
+      this.clearTimer();
+
+      if (contractVisible && props.life && props.life > 0 && isPlatformBrowser(this.platformId)) {
+        this.autoDismissTimer = setTimeout(() => {
+          this.onClose();
+        }, props.life);
+      }
+    });
+  }
+
+  private clearTimer(): void {
+    if (this.autoDismissTimer) {
+      clearTimeout(this.autoDismissTimer);
+      this.autoDismissTimer = null;
+    }
+  }
+
+  onClose(): void {
+    this.clearTimer();
+    this.isVisible.set(false);
+    this.visibleChange.emit(false);
+    this.close.emit();
+    this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+  }
+
+  onActionClick(act: BannerAction): void {
+    this.action.emit({ action: act.action, data: act });
+    this.experienceAdapter.dispatchCapability(this.contract().id, act.action, act);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.html b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.html
new file mode 100644
index 0000000..e38a53e
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.html
@@ -0,0 +1,36 @@
+<ng-template #snackbarTemplate>
+  <div
+    class="origo-snackbar origo-snackbar--{{ severity() }}"
+    role="status"
+    aria-live="polite"
+    [attr.aria-label]="ariaLabel()"
+    [attr.data-testid]="contract().id + '-portal'"
+  >
+    <div class="origo-snackbar__bar">
+      <div class="origo-snackbar__message">{{ computedMessage() }}</div>
+
+      @if (computedActionLabel()) {
+        <button type="button" class="origo-snackbar__action-btn" (click)="onAction()">
+          {{ computedActionLabel() }}
+        </button>
+      }
+
+      @if (isClosable()) {
+        <button
+          type="button"
+          class="origo-snackbar__close-btn"
+          aria-label="Close snackbar"
+          (click)="closeSnackbar()"
+        >
+          <svg class="origo-snackbar__close-svg" viewBox="0 0 20 20" fill="currentColor">
+            <path
+              fill-rule="evenodd"
+              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
+              clip-rule="evenodd"
+            />
+          </svg>
+        </button>
+      }
+    </div>
+  </div>
+</ng-template>
diff --git a/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.scss b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.scss
new file mode 100644
index 0000000..2c60a7a
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.scss
@@ -0,0 +1,118 @@
+:host {
+  display: contents;
+}
+
+.origo-snackbar {
+  display: flex;
+  justify-content: center;
+  inline-size: 100%;
+  box-sizing: border-box;
+  pointer-events: none;
+
+  &__bar {
+    pointer-events: auto;
+    display: flex;
+    align-items: center;
+    gap: var(--origo-space-md, 1rem);
+    min-inline-size: var(--origo-size-snackbar-min-width, 18rem);
+    max-inline-size: min(90vw, var(--origo-size-snackbar-max-width, 36rem));
+    padding-inline: var(--origo-space-md, 1rem);
+    padding-block: var(--origo-space-sm, 0.75rem);
+    border-radius: var(--origo-radius-md, 0.375rem);
+    box-shadow: var(--origo-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.25));
+    background-color: var(--origo-color-surface-inverse, #1f2937);
+    color: var(--origo-color-text-inverse, #ffffff);
+    box-sizing: border-box;
+    transition: all var(--origo-motion-duration-fast, 150ms) ease;
+  }
+
+  &--info .origo-snackbar__bar {
+    background-color: var(--origo-color-surface-inverse, #1f2937);
+    border-inline-start: var(--origo-border-width-accent, 4px) solid
+      var(--origo-color-border-info, #60a5fa);
+  }
+
+  &--success .origo-snackbar__bar {
+    background-color: var(--origo-color-surface-inverse, #1f2937);
+    border-inline-start: var(--origo-border-width-accent, 4px) solid
+      var(--origo-color-border-success, #34d399);
+  }
+
+  &--warn .origo-snackbar__bar {
+    background-color: var(--origo-color-surface-inverse, #1f2937);
+    border-inline-start: var(--origo-border-width-accent, 4px) solid
+      var(--origo-color-border-warning, #fbbf24);
+  }
+
+  &--error .origo-snackbar__bar {
+    background-color: var(--origo-color-surface-inverse, #1f2937);
+    border-inline-start: var(--origo-border-width-accent, 4px) solid
+      var(--origo-color-border-danger, #f87171);
+  }
+
+  &__message {
+    flex: 1 1 auto;
+    font-family: var(--origo-font-family-base, inherit);
+    font-size: var(--origo-font-size-sm, 0.875rem);
+    line-height: var(--origo-line-height-normal, 1.4);
+    word-break: break-word;
+  }
+
+  &__action-btn {
+    flex-shrink: 0;
+    border: none;
+    background: transparent;
+    cursor: pointer;
+    font-family: var(--origo-font-family-base, inherit);
+    font-weight: var(--origo-font-weight-semibold, 600);
+    font-size: var(--origo-font-size-sm, 0.875rem);
+    color: var(--origo-color-action-highlight, #93c5fd);
+    padding-inline: var(--origo-space-xs, 0.25rem);
+    padding-block: var(--origo-space-2xs, 0.125rem);
+    border-radius: var(--origo-radius-sm, 0.25rem);
+    text-transform: uppercase;
+    letter-spacing: 0.05em;
+
+    &:hover {
+      text-decoration: underline;
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus, 2px) solid currentColor;
+      outline-offset: 2px;
+    }
+  }
+
+  &__close-btn {
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    flex-shrink: 0;
+    inline-size: var(--origo-size-icon-md, 1.5rem);
+    block-size: var(--origo-size-icon-md, 1.5rem);
+    border: none;
+    background: transparent;
+    border-radius: var(--origo-radius-sm, 0.25rem);
+    color: inherit;
+    cursor: pointer;
+    padding-inline: 0;
+    padding-block: 0;
+    opacity: 0.75;
+    transition: opacity var(--origo-motion-duration-fast, 150ms) ease;
+
+    &:hover {
+      opacity: 1;
+      background-color: rgba(255, 255, 255, 0.1);
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus, 2px) solid currentColor;
+      outline-offset: 2px;
+    }
+  }
+
+  &__close-svg {
+    inline-size: var(--origo-size-icon-sm, 1rem);
+    block-size: var(--origo-size-icon-sm, 1rem);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts
new file mode 100644
index 0000000..c0768a8
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts
@@ -0,0 +1,210 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
+import { OverlayModule } from '@angular/cdk/overlay';
+import { SnackbarComponent } from './snackbar.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+
+describe('SnackbarComponent', () => {
+  let fixture: ComponentFixture<SnackbarComponent>;
+  let component: SnackbarComponent;
+  let experienceAdapter: WebExperienceAdapterService;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [OverlayModule, SnackbarComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        OrigoOverlayService,
+        WebExperienceAdapterService,
+      ],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(SnackbarComponent);
+    component = fixture.componentInstance;
+    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    const containers = document.querySelectorAll('.cdk-overlay-container');
+    containers.forEach(c => c.remove());
+    jest.clearAllMocks();
+  });
+
+  it('should render host with data-testid', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-snackbar-1',
+      type: 'Snackbar',
+      props: {
+        visible: false,
+      },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-snackbar-1');
+  });
+
+  it('should mount in document.body when visible is true and display message', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-snackbar-mount',
+      type: 'Snackbar',
+      props: {
+        visible: true,
+        message: 'File deleted successfully',
+      },
+    });
+    fixture.detectChanges();
+
+    const portal = document.querySelector('.origo-snackbar');
+    expect(portal).toBeTruthy();
+    expect(portal?.getAttribute('role')).toBe('status');
+    expect(portal?.getAttribute('aria-live')).toBe('polite');
+
+    const msg = document.querySelector('.origo-snackbar__message');
+    expect(msg?.textContent?.trim()).toBe('File deleted successfully');
+  });
+
+  it('should render action button and handle click event', () => {
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    let actionClicked = false;
+    component.actionClick.subscribe(() => (actionClicked = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-snackbar-action',
+      type: 'Snackbar',
+      props: {
+        visible: true,
+        message: 'Item archived',
+        actionLabel: 'Undo',
+      },
+    });
+    fixture.detectChanges();
+
+    const actionBtn = document.querySelector('.origo-snackbar__action-btn') as HTMLButtonElement;
+    expect(actionBtn).toBeTruthy();
+    expect(actionBtn.textContent?.trim()).toBe('Undo');
+
+    actionBtn.click();
+    fixture.detectChanges();
+
+    expect(actionClicked).toBe(true);
+    expect(dispatchSpy).toHaveBeenCalledWith('test-snackbar-action', 'action', {});
+    expect(document.querySelector('.origo-snackbar')).toBeNull();
+  });
+
+  it('should support "action" as alias for actionLabel', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-snackbar-alias',
+      type: 'Snackbar',
+      props: {
+        visible: true,
+        message: 'Changes saved',
+        action: 'Retry',
+      },
+    });
+    fixture.detectChanges();
+
+    const actionBtn = document.querySelector('.origo-snackbar__action-btn');
+    expect(actionBtn?.textContent?.trim()).toBe('Retry');
+  });
+
+  it('should support manual dismissal via close button', () => {
+    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+    let closed = false;
+    component.close.subscribe(() => (closed = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-snackbar-close',
+      type: 'Snackbar',
+      props: {
+        visible: true,
+        message: 'Closable message',
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+
+    const closeBtn = document.querySelector('.origo-snackbar__close-btn') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+
+    closeBtn.click();
+    fixture.detectChanges();
+
+    expect(closed).toBe(true);
+    expect(updateStateSpy).toHaveBeenCalledWith('test-snackbar-close', 'visible', false);
+    expect(document.querySelector('.origo-snackbar')).toBeNull();
+  });
+
+  it('should auto-dismiss after duration ms timeout', () => {
+    jest.useFakeTimers();
+    try {
+      const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+
+      fixture.componentRef.setInput('contract', {
+        id: 'test-snackbar-duration',
+        type: 'Snackbar',
+        props: {
+          visible: true,
+          message: 'Transient snackbar',
+          duration: 3000,
+        },
+      });
+      fixture.detectChanges();
+
+      expect(document.querySelector('.origo-snackbar')).toBeTruthy();
+
+      jest.advanceTimersByTime(1500);
+      fixture.detectChanges();
+      expect(document.querySelector('.origo-snackbar')).toBeTruthy();
+
+      jest.advanceTimersByTime(1500);
+      fixture.detectChanges();
+      expect(updateStateSpy).toHaveBeenCalledWith('test-snackbar-duration', 'visible', false);
+      expect(document.querySelector('.origo-snackbar')).toBeNull();
+    } finally {
+      jest.useRealTimers();
+    }
+  });
+
+  it('should close on Escape keydown', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-snackbar-esc',
+      type: 'Snackbar',
+      props: {
+        visible: true,
+        message: 'Press Escape to close',
+      },
+    });
+    fixture.detectChanges();
+
+    expect(document.querySelector('.origo-snackbar')).toBeTruthy();
+
+    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
+    fixture.detectChanges();
+
+    expect(document.querySelector('.origo-snackbar')).toBeNull();
+  });
+
+  it('should safely execute without errors on SSR server platform', () => {
+    TestBed.resetTestingModule();
+    TestBed.configureTestingModule({
+      imports: [SnackbarComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        OrigoOverlayService,
+        WebExperienceAdapterService,
+        { provide: PLATFORM_ID, useValue: 'server' },
+      ],
+    });
+
+    const ssrFixture = TestBed.createComponent(SnackbarComponent);
+    ssrFixture.componentRef.setInput('contract', {
+      id: 'ssr-snackbar',
+      type: 'Snackbar',
+      props: { visible: true, message: 'SSR' },
+    });
+
+    expect(() => ssrFixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.ts b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.ts
new file mode 100644
index 0000000..6979694
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.ts
@@ -0,0 +1,236 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  TemplateRef,
+  computed,
+  signal,
+  effect,
+  DestroyRef,
+  PLATFORM_ID,
+  ViewContainerRef,
+  HostListener,
+} from '@angular/core';
+import { CommonModule, isPlatformBrowser } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+import { OrigoOverlayRef, OrigoGlobalPositionAlignment } from '../../../lib/overlay/overlay.models';
+
+export type SnackbarPosition =
+  | 'bottom-center'
+  | 'bottom-start'
+  | 'bottom-end'
+  | 'top-center'
+  | 'top-start'
+  | 'top-end';
+
+export interface SnackbarProps {
+  visible?: boolean;
+  message?: string;
+  action?: string;
+  actionLabel?: string;
+  duration?: number;
+  life?: number;
+  position?: SnackbarPosition;
+  severity?: 'info' | 'success' | 'warn' | 'error';
+  closable?: boolean;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const SnackbarContractSchema = {
+  visible: 'boolean',
+  message: 'string',
+  action: 'string',
+  actionLabel: 'string',
+  duration: 'number',
+  life: 'number',
+  position: 'string',
+  severity: 'string',
+  closable: 'boolean',
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+} as const;
+
+@Component({
+  selector: 'origo-snackbar',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './snackbar.component.html',
+  styleUrls: ['./snackbar.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-snackbar-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+  },
+})
+export class SnackbarComponent implements OrigoAdapter<SnackbarProps> {
+  static readonly contractSchema = SnackbarContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<SnackbarProps>>();
+
+  visibleChange = output<boolean>();
+  open = output<void>();
+  close = output<void>();
+  actionClick = output<void>();
+
+  snackbarTemplate = viewChild<TemplateRef<unknown>>('snackbarTemplate');
+
+  private overlayService = inject(OrigoOverlayService);
+  private experienceAdapter = inject(WebExperienceAdapterService);
+  private destroyRef = inject(DestroyRef);
+  private vcr = inject(ViewContainerRef);
+  private platformId = inject(PLATFORM_ID);
+
+  private overlayRef: OrigoOverlayRef | null = null;
+  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
+  private lastContractVisible: boolean | null = null;
+
+  readonly isVisible = signal(false);
+
+  readonly coercedProps = computed(() =>
+    coerceContractProps<SnackbarProps>(this.contract()?.props, SnackbarContractSchema)
+  );
+
+  readonly computedMessage = computed(() => this.coercedProps().message ?? '');
+
+  readonly computedActionLabel = computed(
+    () => this.coercedProps().actionLabel ?? this.coercedProps().action ?? ''
+  );
+
+  readonly position = computed<SnackbarPosition>(() => {
+    return (this.coercedProps().position as SnackbarPosition) || 'bottom-center';
+  });
+
+  readonly severity = computed(() => this.coercedProps().severity || 'info');
+
+  readonly isClosable = computed(() => this.coercedProps().closable === true);
+
+  readonly duration = computed(() => {
+    const d = this.coercedProps().duration ?? this.coercedProps().life;
+    return typeof d === 'number' ? d : 4000;
+  });
+
+  readonly ariaLabel = computed(() => this.coercedProps()['aria-label'] || 'Status notification');
+
+  constructor() {
+    this.destroyRef.onDestroy(() => {
+      this.clearTimer();
+      if (this.overlayRef) {
+        this.overlayRef.dispose();
+        this.overlayRef = null;
+      }
+    });
+
+    effect(() => {
+      const contractVisible = this.coercedProps().visible === true;
+      if (this.lastContractVisible === null) {
+        this.lastContractVisible = contractVisible;
+        if (contractVisible) {
+          this.openSnackbar();
+        }
+      } else if (this.lastContractVisible !== contractVisible) {
+        this.lastContractVisible = contractVisible;
+        if (contractVisible) {
+          this.openSnackbar();
+        } else {
+          this.closeSnackbar(false);
+        }
+      }
+    });
+  }
+
+  @HostListener('document:keydown.escape')
+  onEscapeKey(): void {
+    if (this.isVisible()) {
+      this.closeSnackbar();
+    }
+  }
+
+  openSnackbar(): void {
+    if (this.isVisible()) return;
+    this.isVisible.set(true);
+    this.visibleChange.emit(true);
+    this.open.emit();
+    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
+
+    if (isPlatformBrowser(this.platformId)) {
+      this.ensureOverlay();
+      this.scheduleDismiss();
+    }
+  }
+
+  closeSnackbar(notify = true): void {
+    this.clearTimer();
+    if (!this.isVisible()) return;
+
+    this.isVisible.set(false);
+
+    if (this.overlayRef) {
+      this.overlayRef.close();
+      this.overlayRef.dispose();
+      this.overlayRef = null;
+    }
+
+    if (notify) {
+      this.visibleChange.emit(false);
+      this.close.emit();
+      this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+    }
+  }
+
+  onAction(): void {
+    this.actionClick.emit();
+    this.experienceAdapter.dispatchCapability(this.contract().id, 'action', {});
+    this.closeSnackbar();
+  }
+
+  private scheduleDismiss(): void {
+    this.clearTimer();
+    const dur = this.duration();
+    if (dur > 0) {
+      this.autoDismissTimer = setTimeout(() => {
+        this.closeSnackbar();
+      }, dur);
+    }
+  }
+
+  private clearTimer(): void {
+    if (this.autoDismissTimer) {
+      clearTimeout(this.autoDismissTimer);
+      this.autoDismissTimer = null;
+    }
+  }
+
+  private ensureOverlay(): void {
+    if (this.overlayRef) return;
+    const template = this.snackbarTemplate();
+    if (!template) return;
+
+    this.overlayRef = this.overlayService.create({
+      position: {
+        type: 'global',
+        position: this.position() as OrigoGlobalPositionAlignment,
+      },
+      hasBackdrop: false,
+      panelClass: ['origo-overlay-pane--snackbar', 'origo-snackbar-portal'],
+      viewContainerRef: this.vcr,
+    });
+
+    this.overlayRef.open(template, this.vcr);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/toast/toast.component.html b/packages/angular-renderer/src/components/primitives/toast/toast.component.html
new file mode 100644
index 0000000..64d2578
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/toast/toast.component.html
@@ -0,0 +1,91 @@
+<ng-template #toastTemplate>
+  <div
+    class="origo-toast"
+    role="region"
+    aria-label="Notifications"
+    [attr.data-testid]="contract().id + '-portal'"
+  >
+    @for (msg of activeMessages(); track msg.id) {
+      <div
+        class="origo-toast__item origo-toast__item--{{ normalizeSeverity(msg.severity) }}"
+        (mouseenter)="onItemMouseEnter(msg.id!)"
+        (mouseleave)="onItemMouseLeave(msg.id!)"
+        [attr.role]="getItemRole(msg.severity)"
+        [attr.aria-live]="getItemAriaLive(msg.severity)"
+        aria-atomic="true"
+        [attr.data-id]="msg.id"
+      >
+        <div class="origo-toast__icon" aria-hidden="true">
+          @if (msg.icon) {
+            <span class="origo-toast__custom-icon">{{ msg.icon }}</span>
+          } @else {
+            @switch (normalizeSeverity(msg.severity)) {
+              @case ('success') {
+                <svg class="origo-toast__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                  <path
+                    fill-rule="evenodd"
+                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
+                    clip-rule="evenodd"
+                  />
+                </svg>
+              }
+              @case ('warning') {
+                <svg class="origo-toast__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                  <path
+                    fill-rule="evenodd"
+                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
+                    clip-rule="evenodd"
+                  />
+                </svg>
+              }
+              @case ('error') {
+                <svg class="origo-toast__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                  <path
+                    fill-rule="evenodd"
+                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
+                    clip-rule="evenodd"
+                  />
+                </svg>
+              }
+              @default {
+                <svg class="origo-toast__svg-icon" viewBox="0 0 20 20" fill="currentColor">
+                  <path
+                    fill-rule="evenodd"
+                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
+                    clip-rule="evenodd"
+                  />
+                </svg>
+              }
+            }
+          }
+        </div>
+
+        <div class="origo-toast__content">
+          @if (msg.summary) {
+            <div class="origo-toast__summary">{{ msg.summary }}</div>
+          }
+          @if (msg.detail) {
+            <div class="origo-toast__detail">{{ msg.detail }}</div>
+          }
+        </div>
+
+        @if (msg.closable !== false) {
+          <button
+            type="button"
+            class="origo-toast__close-btn"
+            aria-label="Close notification"
+            (click)="dismiss(msg.id!)"
+          >
+            <svg class="origo-toast__close-svg" viewBox="0 0 20 20" fill="currentColor">
+              <path
+                fill-rule="evenodd"
+                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
+                clip-rule="evenodd"
+              />
+            </svg>
+          </button>
+        }
+      </div>
+    }
+  </div>
+</ng-template>
diff --git a/packages/angular-renderer/src/components/primitives/toast/toast.component.scss b/packages/angular-renderer/src/components/primitives/toast/toast.component.scss
new file mode 100644
index 0000000..d496657
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/toast/toast.component.scss
@@ -0,0 +1,152 @@
+:host {
+  display: contents;
+}
+
+.origo-toast {
+  display: flex;
+  flex-direction: column;
+  gap: var(--origo-space-sm, 0.5rem);
+  inline-size: var(--origo-size-toast-width, 24rem);
+  max-inline-size: 90vw;
+  box-sizing: border-box;
+  pointer-events: none;
+
+  &__item {
+    pointer-events: auto;
+    display: flex;
+    align-items: flex-start;
+    gap: var(--origo-space-sm, 0.75rem);
+    padding-inline: var(--origo-space-md, 1rem);
+    padding-block: var(--origo-space-md, 0.75rem);
+    border-radius: var(--origo-radius-md, 0.375rem);
+    box-shadow: var(--origo-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
+    border: var(--origo-border-width-default, 1px) solid transparent;
+    box-sizing: border-box;
+    transition: all var(--origo-motion-duration-fast, 150ms) ease;
+
+    // Severity: Info
+    &--info {
+      background-color: var(--origo-color-surface-subtle, #eff6ff);
+      border-color: var(--origo-color-border-info, #bfdbfe);
+      border-inline-start: var(--origo-border-width-accent, 4px) solid
+        var(--origo-color-text-info, #1e40af);
+      color: var(--origo-color-text-info, #1e40af);
+
+      .origo-toast__icon {
+        color: var(--origo-color-text-info, #1e40af);
+      }
+    }
+
+    // Severity: Success
+    &--success {
+      background-color: var(--origo-color-surface-success, #ecfdf5);
+      border-color: var(--origo-color-border-success, #a7f3d0);
+      border-inline-start: var(--origo-border-width-accent, 4px) solid
+        var(--origo-color-text-success, #065f46);
+      color: var(--origo-color-text-success, #065f46);
+
+      .origo-toast__icon {
+        color: var(--origo-color-text-success, #065f46);
+      }
+    }
+
+    // Severity: Warning
+    &--warning {
+      background-color: var(--origo-color-surface-warning, #fffbeb);
+      border-color: var(--origo-color-border-warning, #fde68a);
+      border-inline-start: var(--origo-border-width-accent, 4px) solid
+        var(--origo-color-text-warning, #92400e);
+      color: var(--origo-color-text-warning, #92400e);
+
+      .origo-toast__icon {
+        color: var(--origo-color-text-warning, #92400e);
+      }
+    }
+
+    // Severity: Error
+    &--error {
+      background-color: var(--origo-color-surface-danger, #fef2f2);
+      border-color: var(--origo-color-border-danger, #fecaca);
+      border-inline-start: var(--origo-border-width-accent, 4px) solid
+        var(--origo-color-text-danger, #991b1b);
+      color: var(--origo-color-text-danger, #991b1b);
+
+      .origo-toast__icon {
+        color: var(--origo-color-text-danger, #991b1b);
+      }
+    }
+  }
+
+  &__icon {
+    flex-shrink: 0;
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    inline-size: var(--origo-size-icon-md, 1.25rem);
+    block-size: var(--origo-size-icon-md, 1.25rem);
+    margin-block-start: var(--origo-space-2xs, 0.125rem);
+  }
+
+  &__svg-icon {
+    inline-size: 100%;
+    block-size: 100%;
+  }
+
+  &__custom-icon {
+    font-size: var(--origo-font-size-md, 1.125rem);
+    line-height: 1;
+  }
+
+  &__content {
+    flex: 1 1 auto;
+    min-inline-size: 0;
+  }
+
+  &__summary {
+    font-family: var(--origo-font-family-base, inherit);
+    font-weight: var(--origo-font-weight-semibold, 600);
+    font-size: var(--origo-font-size-md, 0.9375rem);
+    line-height: var(--origo-line-height-normal, 1.375);
+    margin-block-end: var(--origo-space-2xs, 0.25rem);
+  }
+
+  &__detail {
+    font-family: var(--origo-font-family-base, inherit);
+    font-size: var(--origo-font-size-sm, 0.875rem);
+    line-height: var(--origo-line-height-normal, 1.4);
+  }
+
+  &__close-btn {
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    flex-shrink: 0;
+    margin-inline-start: var(--origo-space-xs, 0.5rem);
+    inline-size: var(--origo-size-icon-md, 1.5rem);
+    block-size: var(--origo-size-icon-md, 1.5rem);
+    border: none;
+    background: transparent;
+    border-radius: var(--origo-radius-sm, 0.25rem);
+    color: inherit;
+    cursor: pointer;
+    padding-inline: 0;
+    padding-block: 0;
+    opacity: 0.75;
+    transition: opacity var(--origo-motion-duration-fast, 150ms) ease;
+
+    &:hover {
+      opacity: 1;
+      background-color: rgba(0, 0, 0, 0.05);
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus, 2px) solid currentColor;
+      outline-offset: 2px;
+    }
+  }
+
+  &__close-svg {
+    inline-size: var(--origo-size-icon-sm, 1rem);
+    block-size: var(--origo-size-icon-sm, 1rem);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts b/packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts
new file mode 100644
index 0000000..d4552df
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts
@@ -0,0 +1,216 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
+import { OverlayModule } from '@angular/cdk/overlay';
+import { ToastComponent } from './toast.component';
+import { ToastMessage } from './toast.models';
+import { OrigoToastService } from './toast.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+
+describe('ToastComponent', () => {
+  let fixture: ComponentFixture<ToastComponent>;
+  let component: ToastComponent;
+  let toastService: OrigoToastService;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [OverlayModule, ToastComponent],
+      providers: [provideZonelessChangeDetection(), OrigoOverlayService, OrigoToastService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(ToastComponent);
+    component = fixture.componentInstance;
+    toastService = TestBed.inject(OrigoToastService);
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    toastService.clear();
+    const containers = document.querySelectorAll('.cdk-overlay-container');
+    containers.forEach(c => c.remove());
+    jest.clearAllMocks();
+  });
+
+  it('should render host with data-testid', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-toast-1',
+      type: 'Toast',
+      props: {
+        position: 'top-end',
+      },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-toast-1');
+  });
+
+  it('should project toast panel into document.body overlay container', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-toast-portal',
+      type: 'Toast',
+      props: {
+        summary: 'Portal Toast',
+        detail: 'Visible in document body',
+        severity: 'info',
+      },
+    });
+    fixture.detectChanges();
+
+    const portal = document.querySelector('.origo-toast');
+    expect(portal).toBeTruthy();
+    expect(portal?.getAttribute('role')).toBe('region');
+    expect(portal?.getAttribute('aria-label')).toBe('Notifications');
+
+    const toastItem = document.querySelector('.origo-toast__item');
+    expect(toastItem).toBeTruthy();
+    expect(toastItem?.classList.contains('origo-toast__item--info')).toBe(true);
+
+    const summary = document.querySelector('.origo-toast__summary');
+    expect(summary?.textContent?.trim()).toBe('Portal Toast');
+
+    const detail = document.querySelector('.origo-toast__detail');
+    expect(detail?.textContent?.trim()).toBe('Visible in document body');
+  });
+
+  it('should stack multiple toast messages vertically', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-toast-stack',
+      type: 'Toast',
+      props: {
+        messages: [
+          { severity: 'info', summary: 'Msg 1', detail: 'First' },
+          { severity: 'success', summary: 'Msg 2', detail: 'Second' },
+          { severity: 'error', summary: 'Msg 3', detail: 'Third' },
+        ],
+      },
+    });
+    fixture.detectChanges();
+
+    const items = document.querySelectorAll('.origo-toast__item');
+    expect(items.length).toBe(3);
+    expect(items[0].classList.contains('origo-toast__item--info')).toBe(true);
+    expect(items[1].classList.contains('origo-toast__item--success')).toBe(true);
+    expect(items[2].classList.contains('origo-toast__item--error')).toBe(true);
+  });
+
+  it('should reflect imperatively dispatched messages from OrigoToastService', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-toast-service-sync',
+      type: 'Toast',
+      props: {},
+    });
+    fixture.detectChanges();
+
+    toastService.success('Saved', 'Record updated successfully');
+    fixture.detectChanges();
+
+    const summary = document.querySelector('.origo-toast__summary');
+    expect(summary?.textContent?.trim()).toBe('Saved');
+  });
+
+  it('should dismiss individual toast on close button click and emit close output', () => {
+    let closedToast: ToastMessage | undefined = undefined;
+    component.close.subscribe(msg => (closedToast = msg));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'test-toast-dismiss',
+      type: 'Toast',
+      props: {
+        messages: [{ severity: 'warn', summary: 'To Dismiss', closable: true }],
+      },
+    });
+    fixture.detectChanges();
+
+    const closeBtn = document.querySelector('.origo-toast__close-btn') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+
+    closeBtn.click();
+    fixture.detectChanges();
+
+    expect(closedToast).toBeTruthy();
+    expect((closedToast as unknown as ToastMessage)?.summary).toBe('To Dismiss');
+    expect(document.querySelector('.origo-toast__item')).toBeNull();
+  });
+
+  it('should pause auto-dismiss timer on mouseenter and resume on mouseleave', () => {
+    jest.useFakeTimers();
+    try {
+      fixture.componentRef.setInput('contract', {
+        id: 'test-toast-pause',
+        type: 'Toast',
+        props: {
+          messages: [{ id: 'pause-item-1', summary: 'Pause Me', life: 2000 }],
+        },
+      });
+      fixture.detectChanges();
+
+      const item = document.querySelector('.origo-toast__item') as HTMLElement;
+      expect(item).toBeTruthy();
+
+      // Advance 1000ms
+      jest.advanceTimersByTime(1000);
+
+      // Mouse enter -> pause
+      item.dispatchEvent(new MouseEvent('mouseenter'));
+
+      // Advance another 2000ms while hovered - should NOT dismiss
+      jest.advanceTimersByTime(2000);
+      fixture.detectChanges();
+      expect(document.querySelector('.origo-toast__item')).toBeTruthy();
+
+      // Mouse leave -> resume with remaining 1000ms
+      item.dispatchEvent(new MouseEvent('mouseleave'));
+
+      // Advance 500ms -> still present
+      jest.advanceTimersByTime(500);
+      fixture.detectChanges();
+      expect(document.querySelector('.origo-toast__item')).toBeTruthy();
+
+      // Advance remaining 500ms -> dismissed
+      jest.advanceTimersByTime(500);
+      fixture.detectChanges();
+      expect(document.querySelector('.origo-toast__item')).toBeNull();
+    } finally {
+      jest.useRealTimers();
+    }
+  });
+
+  it('should suppress duplicate messages when preventDuplicates is true', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test-toast-dup',
+      type: 'Toast',
+      props: {
+        preventDuplicates: true,
+      },
+    });
+    fixture.detectChanges();
+
+    component.addToast({ severity: 'info', summary: 'Unique', detail: 'Content' });
+    component.addToast({ severity: 'info', summary: 'Unique', detail: 'Content' });
+    fixture.detectChanges();
+
+    const items = document.querySelectorAll('.origo-toast__item');
+    expect(items.length).toBe(1);
+  });
+
+  it('should safely execute without errors on SSR server platform', () => {
+    TestBed.resetTestingModule();
+    TestBed.configureTestingModule({
+      imports: [ToastComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        OrigoOverlayService,
+        OrigoToastService,
+        { provide: PLATFORM_ID, useValue: 'server' },
+      ],
+    });
+
+    const ssrFixture = TestBed.createComponent(ToastComponent);
+    ssrFixture.componentRef.setInput('contract', {
+      id: 'ssr-toast',
+      type: 'Toast',
+      props: { summary: 'SSR Toast' },
+    });
+
+    expect(() => ssrFixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/toast/toast.component.ts b/packages/angular-renderer/src/components/primitives/toast/toast.component.ts
new file mode 100644
index 0000000..71a3c1c
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/toast/toast.component.ts
@@ -0,0 +1,318 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  TemplateRef,
+  computed,
+  signal,
+  effect,
+  DestroyRef,
+  PLATFORM_ID,
+  ViewContainerRef,
+  AfterViewInit,
+} from '@angular/core';
+import { CommonModule, isPlatformBrowser } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+import {
+  ToastProps,
+  ToastMessage,
+  ToastContractSchema,
+  ToastPosition,
+  ToastSeverity,
+} from './toast.models';
+import { OrigoToastService } from './toast.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+import { OrigoOverlayRef } from '../../../lib/overlay/overlay.models';
+
+interface ActiveToastTimer {
+  timeoutId: ReturnType<typeof setTimeout>;
+  startTime: number;
+  remaining: number;
+}
+
+let toastItemCounter = 0;
+
+@Component({
+  selector: 'origo-toast',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './toast.component.html',
+  styleUrls: ['./toast.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-toast-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+  },
+})
+export class ToastComponent implements OrigoAdapter<ToastProps>, AfterViewInit {
+  static readonly contractSchema = ToastContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<ToastProps>>();
+
+  show = output<ToastMessage>();
+  close = output<ToastMessage>();
+  action = output<{ message: ToastMessage; action: string }>();
+
+  toastTemplate = viewChild<TemplateRef<unknown>>('toastTemplate');
+
+  private overlayService = inject(OrigoOverlayService);
+  private toastService = inject(OrigoToastService);
+  private destroyRef = inject(DestroyRef);
+  private vcr = inject(ViewContainerRef);
+  private platformId = inject(PLATFORM_ID);
+
+  private overlayRef: OrigoOverlayRef | null = null;
+  private readonly timers = new Map<string, ActiveToastTimer>();
+  private readonly scheduledMessageIds = new Set<string>();
+
+  private readonly imperativeMessages = signal<ToastMessage[]>([]);
+  private readonly dismissedIds = signal<Set<string>>(new Set());
+
+  readonly coercedProps = computed(() =>
+    coerceContractProps<ToastProps>(this.contract()?.props, ToastContractSchema)
+  );
+
+  readonly position = computed<ToastPosition>(() => {
+    return (this.coercedProps().position as ToastPosition) || 'top-end';
+  });
+
+  readonly defaultLife = computed(() => {
+    const life = this.coercedProps().life;
+    return typeof life === 'number' ? life : 3000;
+  });
+
+  readonly defaultClosable = computed(() => {
+    const closable = this.coercedProps().closable;
+    return closable !== false;
+  });
+
+  readonly preventDuplicates = computed(() => this.coercedProps().preventDuplicates === true);
+
+  private readonly contractMessages = computed<ToastMessage[]>(() => {
+    const props = this.coercedProps();
+    const result: ToastMessage[] = [];
+
+    if (props.messages && Array.isArray(props.messages)) {
+      props.messages.forEach((m, idx) => {
+        result.push({
+          ...m,
+          id: m.id ?? `contract-msg-${idx}-${m.summary || ''}`,
+          severity: (m.severity as ToastSeverity) || 'info',
+          detail: m.detail ?? m.message ?? m.content,
+          closable: m.closable !== undefined ? m.closable : this.defaultClosable(),
+          life: m.life !== undefined ? m.life : this.defaultLife(),
+        });
+      });
+    } else if (props.summary || props.message || props.detail) {
+      result.push({
+        id: `contract-msg-single-${props.summary || ''}`,
+        severity: (props.severity as ToastSeverity) || 'info',
+        summary: props.summary,
+        detail: props.detail ?? props.message,
+        icon: props.icon,
+        life: props.life ?? this.defaultLife(),
+        closable: props.closable !== undefined ? props.closable : this.defaultClosable(),
+        sticky: props.sticky,
+      });
+    }
+
+    return result;
+  });
+
+  readonly activeMessages = computed<ToastMessage[]>(() => {
+    const dismissed = this.dismissedIds();
+    const all = [...this.contractMessages(), ...this.imperativeMessages()];
+    const filtered = all.filter(m => m.id && !dismissed.has(m.id));
+
+    if (!this.preventDuplicates()) {
+      return filtered;
+    }
+
+    const unique: ToastMessage[] = [];
+    for (const m of filtered) {
+      const isDup = unique.some(
+        u =>
+          (u.severity || 'info') === (m.severity || 'info') &&
+          (u.summary || '') === (m.summary || '') &&
+          (u.detail || '') === (m.detail || '')
+      );
+      if (!isDup) {
+        unique.push(m);
+      }
+    }
+    return unique;
+  });
+
+  constructor() {
+    this.destroyRef.onDestroy(() => {
+      this.clearAllTimers();
+      if (this.overlayRef) {
+        this.overlayRef.dispose();
+        this.overlayRef = null;
+      }
+    });
+
+    // Reactive effect to sync with OrigoToastService
+    effect(() => {
+      const serviceMessages = this.toastService.messages();
+      const currentGroup = this.coercedProps().group;
+
+      for (const msg of serviceMessages) {
+        if (!currentGroup || msg.group === currentGroup) {
+          this.addToast(msg);
+        }
+      }
+    });
+
+    // Reactive effect to schedule timers for active messages
+    effect(() => {
+      const msgs = this.activeMessages();
+      if (!isPlatformBrowser(this.platformId)) return;
+
+      if (msgs.length > 0) {
+        this.ensureOverlay();
+      }
+
+      for (const msg of msgs) {
+        if (msg.id && !this.scheduledMessageIds.has(msg.id)) {
+          this.scheduledMessageIds.add(msg.id);
+          this.show.emit(msg);
+
+          const life = msg.sticky ? 0 : (msg.life ?? this.defaultLife());
+          if (life > 0) {
+            this.startTimer(msg.id, life);
+          }
+        }
+      }
+    });
+  }
+
+  ngAfterViewInit(): void {
+    if (isPlatformBrowser(this.platformId) && this.activeMessages().length > 0) {
+      this.ensureOverlay();
+    }
+  }
+
+  private ensureOverlay(): void {
+    if (this.overlayRef) return;
+    const template = this.toastTemplate();
+    if (!template) return;
+
+    this.overlayRef = this.overlayService.create({
+      position: {
+        type: 'global',
+        position: this.position(),
+      },
+      hasBackdrop: false,
+      panelClass: ['origo-overlay-pane--toast', 'origo-toast-portal'],
+      viewContainerRef: this.vcr,
+    });
+
+    this.overlayRef.open(template, this.vcr);
+  }
+
+  addToast(message: ToastMessage): void {
+    const id = message.id ?? `origo-toast-item-${++toastItemCounter}`;
+    const toastItem: ToastMessage = {
+      ...message,
+      id,
+      severity: (message.severity as ToastSeverity) || 'info',
+      summary: message.summary ?? '',
+      detail: message.detail ?? message.message ?? message.content ?? '',
+      closable: message.closable !== undefined ? message.closable : this.defaultClosable(),
+      life: message.life !== undefined ? message.life : this.defaultLife(),
+    };
+
+    this.imperativeMessages.update(msgs => {
+      if (this.preventDuplicates()) {
+        const isDuplicate = msgs.some(
+          m =>
+            (m.severity || 'info') === toastItem.severity &&
+            (m.summary || '') === toastItem.summary &&
+            (m.detail || '') === toastItem.detail
+        );
+        if (isDuplicate) return msgs;
+      }
+      return [...msgs, toastItem];
+    });
+  }
+
+  private startTimer(id: string, duration: number): void {
+    this.clearTimer(id);
+    const timeoutId = setTimeout(() => {
+      this.dismiss(id);
+    }, duration);
+
+    this.timers.set(id, {
+      timeoutId,
+      startTime: Date.now(),
+      remaining: duration,
+    });
+  }
+
+  onItemMouseEnter(id: string): void {
+    const timer = this.timers.get(id);
+    if (!timer) return;
+    clearTimeout(timer.timeoutId);
+    const elapsed = Date.now() - timer.startTime;
+    timer.remaining = Math.max(0, timer.remaining - elapsed);
+  }
+
+  onItemMouseLeave(id: string): void {
+    const timer = this.timers.get(id);
+    if (!timer || timer.remaining <= 0) return;
+    timer.startTime = Date.now();
+    timer.timeoutId = setTimeout(() => {
+      this.dismiss(id);
+    }, timer.remaining);
+  }
+
+  private clearTimer(id: string): void {
+    const timer = this.timers.get(id);
+    if (timer) {
+      clearTimeout(timer.timeoutId);
+      this.timers.delete(id);
+    }
+  }
+
+  private clearAllTimers(): void {
+    this.timers.forEach(t => clearTimeout(t.timeoutId));
+    this.timers.clear();
+  }
+
+  dismiss(id: string): void {
+    this.clearTimer(id);
+    const target = this.activeMessages().find(m => m.id === id);
+    if (target) {
+      this.dismissedIds.update(set => new Set(set).add(id));
+      this.imperativeMessages.update(msgs => msgs.filter(m => m.id !== id));
+      this.toastService.remove(id);
+      this.close.emit(target);
+    }
+  }
+
+  normalizeSeverity(severity?: string): string {
+    const s = severity?.toLowerCase();
+    if (s === 'warn' || s === 'warning') return 'warning';
+    if (s === 'error') return 'error';
+    if (s === 'success') return 'success';
+    return 'info';
+  }
+
+  getItemRole(severity?: string): string {
+    const s = this.normalizeSeverity(severity);
+    return s === 'error' || s === 'warning' ? 'alert' : 'status';
+  }
+
+  getItemAriaLive(severity?: string): string {
+    const s = this.normalizeSeverity(severity);
+    return s === 'error' || s === 'warning' ? 'assertive' : 'polite';
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/toast/toast.models.ts b/packages/angular-renderer/src/components/primitives/toast/toast.models.ts
new file mode 100644
index 0000000..030e48a
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/toast/toast.models.ts
@@ -0,0 +1,71 @@
+export type ToastSeverity = 'info' | 'success' | 'warn' | 'warning' | 'error';
+
+export type ToastPosition =
+  | 'top-start'
+  | 'top-center'
+  | 'top-end'
+  | 'bottom-start'
+  | 'bottom-center'
+  | 'bottom-end'
+  | 'top-left'
+  | 'top-right'
+  | 'bottom-left'
+  | 'bottom-right'
+  | 'center';
+
+export interface ToastMessage {
+  id?: string;
+  severity?: ToastSeverity;
+  summary?: string;
+  detail?: string;
+  content?: string;
+  message?: string;
+  icon?: string;
+  life?: number;
+  closable?: boolean;
+  sticky?: boolean;
+  data?: unknown;
+  group?: string;
+}
+
+export interface ToastProps {
+  messages?: ToastMessage[];
+  position?: ToastPosition;
+  life?: number;
+  closable?: boolean;
+  preventDuplicates?: boolean;
+  group?: string;
+  severity?: string;
+  summary?: string;
+  detail?: string;
+  message?: string;
+  icon?: string;
+  sticky?: boolean;
+  breakpoints?: Record<string, { width: string }>;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const ToastContractSchema = {
+  messages: 'array',
+  position: 'string',
+  life: 'number',
+  closable: 'boolean',
+  preventDuplicates: 'boolean',
+  group: 'string',
+  severity: 'string',
+  summary: 'string',
+  detail: 'string',
+  message: 'string',
+  icon: 'string',
+  sticky: 'boolean',
+  breakpoints: 'object',
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+} as const;
diff --git a/packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts b/packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts
new file mode 100644
index 0000000..3dff0f4
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts
@@ -0,0 +1,88 @@
+import { TestBed } from '@angular/core/testing';
+import { OrigoToastService } from './toast.service';
+
+describe('OrigoToastService', () => {
+  let service: OrigoToastService;
+
+  beforeEach(() => {
+    TestBed.configureTestingModule({
+      providers: [OrigoToastService],
+    });
+    service = TestBed.inject(OrigoToastService);
+  });
+
+  afterEach(() => {
+    service.clear();
+  });
+
+  it('should be created and have empty initial messages', () => {
+    expect(service).toBeTruthy();
+    expect(service.messages()).toEqual([]);
+  });
+
+  it('should add message with show() and assign auto-generated id', () => {
+    service.show({
+      severity: 'info',
+      summary: 'Test Summary',
+      detail: 'Test Detail',
+    });
+
+    const msgs = service.messages();
+    expect(msgs.length).toBe(1);
+    expect(msgs[0].id).toBeTruthy();
+    expect(msgs[0].summary).toBe('Test Summary');
+    expect(msgs[0].detail).toBe('Test Detail');
+  });
+
+  it('should provide severity helper methods (info, success, warn, error)', () => {
+    service.info('Info sum', 'Info det', 3000);
+    service.success('Success sum', 'Success det', 4000);
+    service.warn('Warn sum', 'Warn det', 5000);
+    service.error('Error sum', 'Error det', 6000);
+
+    const msgs = service.messages();
+    expect(msgs.length).toBe(4);
+    expect(msgs[0].severity).toBe('info');
+    expect(msgs[1].severity).toBe('success');
+    expect(msgs[2].severity).toBe('warn');
+    expect(msgs[3].severity).toBe('error');
+  });
+
+  it('should suppress duplicate messages when preventDuplicates is true', () => {
+    service.show({ severity: 'info', summary: 'Duplicate', detail: 'Msg' }, true);
+    service.show({ severity: 'info', summary: 'Duplicate', detail: 'Msg' }, true);
+
+    expect(service.messages().length).toBe(1);
+
+    // Different severity is not a duplicate
+    service.show({ severity: 'warn', summary: 'Duplicate', detail: 'Msg' }, true);
+    expect(service.messages().length).toBe(2);
+  });
+
+  it('should remove specific message by id', () => {
+    service.show({ id: 'msg-1', summary: 'One' });
+    service.show({ id: 'msg-2', summary: 'Two' });
+
+    expect(service.messages().length).toBe(2);
+
+    service.remove('msg-1');
+    const remaining = service.messages();
+    expect(remaining.length).toBe(1);
+    expect(remaining[0].id).toBe('msg-2');
+  });
+
+  it('should clear messages by group or all', () => {
+    service.show({ id: 'm1', summary: 'G1', group: 'groupA' });
+    service.show({ id: 'm2', summary: 'G2', group: 'groupB' });
+    service.show({ id: 'm3', summary: 'G3', group: 'groupA' });
+
+    expect(service.messages().length).toBe(3);
+
+    service.clear('groupA');
+    expect(service.messages().length).toBe(1);
+    expect(service.messages()[0].id).toBe('m2');
+
+    service.clear();
+    expect(service.messages().length).toBe(0);
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/toast/toast.service.ts b/packages/angular-renderer/src/components/primitives/toast/toast.service.ts
new file mode 100644
index 0000000..8def1d5
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/toast/toast.service.ts
@@ -0,0 +1,64 @@
+import { Injectable, signal } from '@angular/core';
+import { ToastMessage } from './toast.models';
+
+let toastIdCounter = 0;
+
+@Injectable({
+  providedIn: 'root',
+})
+export class OrigoToastService {
+  readonly messages = signal<ToastMessage[]>([]);
+
+  show(message: ToastMessage, preventDuplicates = false): void {
+    const summary = message.summary ?? '';
+    const detail = message.detail ?? message.message ?? message.content ?? '';
+    const severity = message.severity ?? 'info';
+
+    if (preventDuplicates) {
+      const exists = this.messages().some(
+        m =>
+          (m.severity ?? 'info') === severity &&
+          (m.summary ?? '') === summary &&
+          (m.detail ?? m.message ?? m.content ?? '') === detail
+      );
+      if (exists) {
+        return;
+      }
+    }
+
+    const toastWithId: ToastMessage = {
+      ...message,
+      id: message.id ?? `origo-toast-${++toastIdCounter}`,
+    };
+
+    this.messages.update(current => [...current, toastWithId]);
+  }
+
+  info(summary: string, detail?: string, life?: number): void {
+    this.show({ severity: 'info', summary, detail, life });
+  }
+
+  success(summary: string, detail?: string, life?: number): void {
+    this.show({ severity: 'success', summary, detail, life });
+  }
+
+  warn(summary: string, detail?: string, life?: number): void {
+    this.show({ severity: 'warn', summary, detail, life });
+  }
+
+  error(summary: string, detail?: string, life?: number): void {
+    this.show({ severity: 'error', summary, detail, life });
+  }
+
+  remove(id: string): void {
+    this.messages.update(current => current.filter(m => m.id !== id));
+  }
+
+  clear(group?: string): void {
+    if (!group) {
+      this.messages.set([]);
+    } else {
+      this.messages.update(current => current.filter(m => m.group !== group));
+    }
+  }
+}
diff --git a/packages/angular-renderer/src/index.ts b/packages/angular-renderer/src/index.ts
index c5ac63f..f16bc7c 100644
--- a/packages/angular-renderer/src/index.ts
+++ b/packages/angular-renderer/src/index.ts
@@ -49,3 +49,9 @@ export * from './components/primitives/tooltip/tooltip.component';
 export * from './lib/overlay/overlay.models';
 export * from './lib/overlay/overlay-ref';
 export * from './lib/overlay/overlay.service';
+export * from './components/primitives/alert/alert.component';
+export * from './components/primitives/toast/toast.models';
+export * from './components/primitives/toast/toast.service';
+export * from './components/primitives/toast/toast.component';
+export * from './components/primitives/snackbar/snackbar.component';
+export * from './components/primitives/banner/banner.component';
diff --git a/packages/angular-renderer/src/lib/overlay/overlay.models.ts b/packages/angular-renderer/src/lib/overlay/overlay.models.ts
index e46058b..68a4e78 100644
--- a/packages/angular-renderer/src/lib/overlay/overlay.models.ts
+++ b/packages/angular-renderer/src/lib/overlay/overlay.models.ts
@@ -2,7 +2,22 @@ import { ElementRef, TemplateRef, Type, ViewContainerRef } from '@angular/core';
 
 export type OrigoOverlayOriginX = 'start' | 'end' | 'center';
 export type OrigoOverlayOriginY = 'top' | 'bottom' | 'center';
-export type OrigoGlobalPositionAlignment = 'center' | 'top' | 'bottom' | 'start' | 'end';
+export type OrigoGlobalPositionAlignment =
+  | 'center'
+  | 'top'
+  | 'bottom'
+  | 'start'
+  | 'end'
+  | 'top-start'
+  | 'top-center'
+  | 'top-end'
+  | 'bottom-start'
+  | 'bottom-center'
+  | 'bottom-end'
+  | 'top-left'
+  | 'top-right'
+  | 'bottom-left'
+  | 'bottom-right';
 
 export interface OrigoConnectedPositionConfig {
   type: 'connected';
diff --git a/packages/angular-renderer/src/lib/overlay/overlay.service.spec.ts b/packages/angular-renderer/src/lib/overlay/overlay.service.spec.ts
index 8a04ad6..29bdc8f 100644
--- a/packages/angular-renderer/src/lib/overlay/overlay.service.spec.ts
+++ b/packages/angular-renderer/src/lib/overlay/overlay.service.spec.ts
@@ -11,6 +11,7 @@ import {
 import { CommonModule } from '@angular/common';
 import { OverlayModule } from '@angular/cdk/overlay';
 import { OrigoOverlayService } from './overlay.service';
+import { OrigoGlobalPositionAlignment } from './overlay.models';
 import { getDeepActiveElement } from './overlay-ref';
 
 @Component({
@@ -120,6 +121,43 @@ describe('OrigoOverlayService', () => {
     overlayRef.dispose();
   });
 
+  it('should create global corner position overlays in LTR and RTL without error', () => {
+    const positions: OrigoGlobalPositionAlignment[] = [
+      'top-start',
+      'top-end',
+      'top-center',
+      'bottom-start',
+      'bottom-end',
+      'bottom-center',
+      'top-left',
+      'top-right',
+      'bottom-left',
+      'bottom-right',
+    ];
+
+    for (const pos of positions) {
+      // Test LTR
+      const refLtr = service.create({
+        position: { type: 'global', position: pos },
+        direction: 'ltr',
+        viewContainerRef: hostComponent.vcr,
+      });
+      refLtr.open(hostComponent.panelTemplate);
+      expect(refLtr.isOpen).toBe(true);
+      refLtr.dispose();
+
+      // Test RTL
+      const refRtl = service.create({
+        position: { type: 'global', position: pos },
+        direction: 'rtl',
+        viewContainerRef: hostComponent.vcr,
+      });
+      refRtl.open(hostComponent.panelTemplate);
+      expect(refRtl.isOpen).toBe(true);
+      refRtl.dispose();
+    }
+  });
+
   it('should close overlay on outside click without dismissing when clicking inside trigger or panel', () => {
     const overlayRef = service.create({
       position: {
diff --git a/packages/angular-renderer/src/lib/overlay/overlay.service.ts b/packages/angular-renderer/src/lib/overlay/overlay.service.ts
index 76dd410..2f4bf58 100644
--- a/packages/angular-renderer/src/lib/overlay/overlay.service.ts
+++ b/packages/angular-renderer/src/lib/overlay/overlay.service.ts
@@ -144,6 +144,56 @@ export class OrigoOverlayService {
             global.right('0').centerVertically();
           }
           break;
+        case 'top-start':
+          global.top('0');
+          if (direction === 'rtl') {
+            global.right('0');
+          } else {
+            global.left('0');
+          }
+          break;
+        case 'top-end':
+          global.top('0');
+          if (direction === 'rtl') {
+            global.left('0');
+          } else {
+            global.right('0');
+          }
+          break;
+        case 'top-center':
+          global.top('0').centerHorizontally();
+          break;
+        case 'bottom-start':
+          global.bottom('0');
+          if (direction === 'rtl') {
+            global.right('0');
+          } else {
+            global.left('0');
+          }
+          break;
+        case 'bottom-end':
+          global.bottom('0');
+          if (direction === 'rtl') {
+            global.left('0');
+          } else {
+            global.right('0');
+          }
+          break;
+        case 'bottom-center':
+          global.bottom('0').centerHorizontally();
+          break;
+        case 'top-left':
+          global.top('0').left('0');
+          break;
+        case 'top-right':
+          global.top('0').right('0');
+          break;
+        case 'bottom-left':
+          global.bottom('0').left('0');
+          break;
+        case 'bottom-right':
+          global.bottom('0').right('0');
+          break;
         case 'center':
         default:
           global.centerHorizontally().centerVertically();
diff --git a/packages/angular-renderer/src/lib/primitives.provider.ts b/packages/angular-renderer/src/lib/primitives.provider.ts
index 2fdd637..fc9358c 100644
--- a/packages/angular-renderer/src/lib/primitives.provider.ts
+++ b/packages/angular-renderer/src/lib/primitives.provider.ts
@@ -42,9 +42,18 @@ import { ModalComponent } from '../components/primitives/modal/modal.component';
 import { DrawerComponent } from '../components/primitives/drawer/drawer.component';
 import { PopoverComponent } from '../components/primitives/popover/popover.component';
 import { TooltipComponent } from '../components/primitives/tooltip/tooltip.component';
+import { AlertComponent } from '../components/primitives/alert/alert.component';
+import { ToastComponent } from '../components/primitives/toast/toast.component';
+import { SnackbarComponent } from '../components/primitives/snackbar/snackbar.component';
+import { BannerComponent } from '../components/primitives/banner/banner.component';
 
 export function provideOrigo9Primitives(): EnvironmentProviders {
   const registryMap = new Map<string, unknown>([
+    ['Alert', AlertComponent],
+    ['Message', AlertComponent],
+    ['Toast', ToastComponent],
+    ['Snackbar', SnackbarComponent],
+    ['Banner', BannerComponent],
     ['Dialog', DialogComponent],
     ['Modal', ModalComponent],
     ['Drawer', DrawerComponent],
diff --git a/packages/angular-renderer/src/styles/overlay.scss b/packages/angular-renderer/src/styles/overlay.scss
index df39995..384d742 100644
--- a/packages/angular-renderer/src/styles/overlay.scss
+++ b/packages/angular-renderer/src/styles/overlay.scss
@@ -120,6 +120,36 @@
     overflow: visible;
     pointer-events: none;
   }
+
+  // Floating Toast Stack modifier
+  &.origo-overlay-pane--toast {
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    background: transparent !important;
+    border: none !important;
+    box-shadow: none !important;
+    overflow: visible;
+    pointer-events: none !important;
+
+    .origo-toast__item {
+      pointer-events: auto;
+    }
+  }
+
+  // Floating Snackbar modifier
+  &.origo-overlay-pane--snackbar {
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    background: transparent !important;
+    border: none !important;
+    box-shadow: none !important;
+    overflow: visible;
+    pointer-events: none !important;
+
+    .origo-snackbar__bar {
+      pointer-events: auto;
+    }
+  }
 }
 
 // RTL Internationalization Directionality Propagation
diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
index 7815d1d..3364c94 100644
--- a/tools/test-registry/test-registry.yaml
+++ b/tools/test-registry/test-registry.yaml
@@ -1086,3 +1086,48 @@ test_cases:
       - 2-2-modal-and-overlay-components
     last_result: pass
     results: {}
+  - id: renderer-primitive-alert
+    description: 'Verifies Alert and Message primitives severity rendering, actions, and auto-dismissal'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/alert/alert.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-3-messaging-and-notification-components
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-toast
+    description: 'Verifies Toast primitive portal projection, vertical stacking, and timer lifecycle'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/toast/toast.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-3-messaging-and-notification-components
+    last_result: pass
+    results: {}
+  - id: renderer-service-toast
+    description: 'Verifies OrigoToastService reactive notification dispatch, deduplication, and groups'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/toast/toast.service.spec.ts
+    type: unit
+    affected_stories:
+      - 2-3-messaging-and-notification-components
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-snackbar
+    description: 'Verifies Snackbar primitive bottom-center portal action bar, action triggers, and auto-dismiss'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/snackbar/snackbar.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-3-messaging-and-notification-components
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-banner
+    description: 'Verifies Banner primitive full-width layout, sticky pinning, actions, and live announcements'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/banner/banner.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-3-messaging-and-notification-components
+    last_result: pass
+    results: {}

