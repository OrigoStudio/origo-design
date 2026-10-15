Invoke the `bmad-review-edge-case-hunter` skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index a9cfe6b..83c6356 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -1,5 +1,5 @@
 # generated: 2026-10-07T19:00:21+05:30
-# last_updated: 2026-10-15T19:31:00+05:30
+# last_updated: 2026-10-15T20:04:00+05:30
 # project: origo-design
 # project_key: NOKEY
 # tracking_system: file-system
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-10-07T19:00:21+05:30
-last_updated: 2026-10-14T21:16:00+05:30
+last_updated: 2026-10-15T20:54:00+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -61,7 +61,7 @@ development_status:
   2-1-navigation-components: done
   2-2-modal-and-overlay-components: done
   2-3-messaging-and-notification-components: done
-  2-4-status-and-loading-indicators: backlog
+  2-4-status-and-loading-indicators: review
   2-5-utility-and-interaction-behaviors: backlog
   epic-2-retrospective: optional
   epic-3: backlog
diff --git a/_bmad-output/implementation-artifacts/stories/2-4-status-and-loading-indicators.md b/_bmad-output/implementation-artifacts/stories/2-4-status-and-loading-indicators.md
new file mode 100644
index 0000000..c1e39a8
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/stories/2-4-status-and-loading-indicators.md
@@ -0,0 +1,914 @@
+---
+story_id: "2.4"
+story_key: 2-4-status-and-loading-indicators
+baseline_commit: 14e07c7
+epic: 2
+status: "review"
+---
+
+# Story 2.4: Status & Loading Indicators
+
+Status: review
+
+<!-- Note: Validated against quality competition checklist. Ready for dev-story implementation. -->
+
+## Story
+
+As a developer,  
+I want to use comprehensive status and loading indicator primitives (`Spinner`, `ProgressBar`, `Skeleton`, `Badge`, `Tag`, and `BlockUI` / `LoadingOverlay`),  
+So that I can visually communicate system processing states, background task progress, placeholder layout frames, semantic entity statuses, and block asynchronous user interactions without breaking Shadow DOM encapsulation, crashing during SSR hydration, or leaking DOM state.
+
+---
+
+## Acceptance Criteria
+
+1. **[AC-1] Semantic Severity & Design Token Visual Substrate (ADR: AD-6, NFR-I18N-001, FR4):**
+   - **Given** an Origo Angular 18/22 standalone rendering environment with `ViewEncapsulation.ShadowDom`,
+   - **When** any status primitive (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`) is rendered,
+   - **Then** all color, surface, border, and elevation styles must be bound strictly to `@origo/design-tokens` semantic CSS custom properties:
+     - `primary`: Bound to `--origo-color-primary` (fallback `#2563eb`), `--origo-color-surface-primary`, `--origo-color-text-inverse` (fallback `#ffffff`).
+     - `secondary`: Bound to `--origo-color-surface-secondary`, `--origo-color-border-subtle`, `--origo-color-text-secondary` (fallback `#64748b`).
+     - `info`: Bound to `--origo-color-surface-subtle` (fallback `#eff6ff`), `--origo-color-border-info` (fallback `#bfdbfe`), `--origo-color-text-info` (fallback `#1e40af`).
+     - `success`: Bound to `--origo-color-surface-success` (fallback `#ecfdf5`), `--origo-color-border-success` (fallback `#a7f3d0`), `--origo-color-text-success` (fallback `#065f46`).
+     - `warn` / `warning`: Bound to `--origo-color-surface-warning` (fallback `#fffbeb`), `--origo-color-border-warning` (fallback `#fde68a`), `--origo-color-text-warning` (fallback `#92400e`).
+     - `error`: Bound to `--origo-color-surface-danger` (fallback `#fef2f2`), `--origo-color-border-danger` (fallback `#fecaca`), `--origo-color-text-danger` (fallback `#991b1b`).
+     - `contrast`: Bound to `--origo-color-surface-inverse` (fallback `#0f172a`), `--origo-color-text-inverse` (fallback `#ffffff`).
+   - **And** all component stylesheets must strictly use CSS Logical Properties (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `border-inline-start`, `inline-size`, `block-size`, `min-inline-size`, `max-inline-size`) with zero physical coordinates (`left`, `right`, `padding-left`, `margin-right`), guaranteeing 100% automated Right-to-Left (RTL) mirroring under `dir="rtl"`.
+   - **And** all stylesheets must contain zero hardcoded color hex values or pixel literals outside documented fallback expressions in `var()`.
+
+2. **[AC-2] Accessible ARIA Roles, Live Regions & Screen Reader Semantics (ADR: P1-AD-6, FR-A11Y-001, Global System AC-4):**
+   - **Given** any status or loading indicator displayed in the UI,
+   - **When** rendered or dynamically transitioning states,
+   - **Then** accessible semantics must be exposed:
+     - For `SpinnerComponent`: Host or root SVG must bind `role="status"` and `aria-live="polite"`, with an accessible description rendered via `<span class="sr-only">{{ computedLabel() }}</span>` (default label: `"Loading..."`).
+     - For `ProgressBarComponent`: Bound to `role="progressbar"`, `[attr.aria-valuenow]="mode() === 'determinate' ? computedValue() : null"`, `[attr.aria-valuemin]="0"`, `[attr.aria-valuemax]="max()"`, and `[attr.aria-label]="computedLabel() || 'Progress'"` (or `[attr.aria-valuetext]`).
+     - For `SkeletonComponent`: Host element must declare `aria-hidden="true"` by default to prevent screen readers from reading raw structural placeholders, or `role="status"` with an explicit accessible label when operating as a stand-in block.
+     - For `BadgeComponent`: When rendering numeric counts, must expose `[attr.aria-label]="computedAriaLabel()"`, announcing counts (e.g., `"5 unread notifications"`, `"99+ notifications"`). Dot-only badges must expose an accessible status label.
+     - For `TagComponent`: When removable (`removable: true`), the remove trigger must be a semantic `<button type="button">` with `aria-label="Remove tag"` (or custom label) operable via `Enter`, `Space`, and `Backspace`.
+     - For `BlockUIComponent`: When `blocked` is `true`, the blocked container or mask must declare `aria-busy="true"` and provide an `aria-live="polite"` announcement of the loading message.
+   - **And** all components must respect the user's OS reduced-motion preferences (`@media (prefers-reduced-motion: reduce)`):
+     - `SpinnerComponent`: Reduces rotation speed or replaces continuous spinning with a steady pulse.
+     - `ProgressBarComponent`: Indeterminate sliding shimmer animation is replaced with a gentle, accessible opacity transition or static indicator.
+     - `SkeletonComponent`: Shimmer wave animation is disabled; renders a static, neutral placeholder surface.
+   - **And** all components must pass automated accessibility audits with zero WCAG 2.1 AA violations.
+
+3. **[AC-3] Spinner Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.7):**
+   - **Given** an asynchronous operation or loading state,
+   - **When** `SpinnerComponent` (`origo-spinner`) is instantiated via BADL contract with key `'Spinner'`,
+   - **Then** it must render a scalable SVG circular spinner supporting:
+     - `size`: `'small'` (1rem / 16px), `'medium'` (2rem / 32px, default), `'large'` (3rem / 48px), or a custom CSS dimension string (e.g., `'24px'`, `'2.5rem'`).
+     - `strokeWidth`: Stroke thickness of the SVG circle (number or string, default `4`).
+     - `label`: Accessible loading text (default `'Loading...'`).
+     - `variant`: Color variant (`'primary'` | `'secondary'` | `'accent'` | `'contrast'` | string, default `'primary'`).
+     - `animationDuration`: CSS animation rotation duration (default `'1s'`).
+     - `fill`: Background track color (default `'transparent'`).
+     - `fluid`: Adapts display to parent container width when `true`.
+   - **And** the spinner must render as an inline-block SVG with a spinning circular dash stroke (`stroke-dasharray`, `stroke-dashoffset`, `stroke-linecap="round"`).
+
+4. **[AC-4] ProgressBar Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.8):**
+   - **Given** a determinate or indeterminate task in progress,
+   - **When** `ProgressBarComponent` (`origo-progress-bar`) is instantiated via BADL contract with key `'ProgressBar'` or `'Progress'`,
+   - **Then** it must render a responsive progress bar supporting:
+     - `value`: Number between `0` and `max` representing current progress; ignored when `mode === 'indeterminate'`.
+     - `mode`: `'determinate' | 'indeterminate'` (default `'determinate'`).
+     - `showValue`: Boolean toggle controlling visibility of percentage or numeric text within or beside the bar (default `true` for determinate, `false` for indeterminate).
+     - `max`: Maximum progress value (default `100`); must safely fallback to `100` if `max <= 0` or `NaN` to prevent division-by-zero (`Infinity%`/`NaN%`) crashes.
+     - `label`: Accessible label / text description of the task.
+     - `unit`: Value suffix string (default `'%'`).
+     - `severity`: `'primary' | 'info' | 'success' | 'warn' | 'warning' | 'error'` (default `'primary'`).
+     - `height`: Custom bar block-size (default: `var(--origo-size-progress-height, 0.5rem)`).
+   - **And** input values must be strictly clamped: `clampedValue = Math.min(Math.max(value ?? 0, 0), safeMax)`.
+   - **And** when `mode === 'determinate'` and `value` transitions to reach or exceed `max`:
+     - Emits `complete = output<void>()` and dispatches capability `dispatchCapability(id, 'complete', { value, max })`.
+     - **CRITICAL DEBOUNCE GUARD:** `complete` must emit ONLY once upon crossing the boundary from `< safeMax` to `>= safeMax`. It must NOT re-emit on initial mount if initialized complete, nor repeat continuously across dirty-checking passes.
+   - **And** value changes emit `valueChange = output<number>()` and synchronize state via `updateState(id, 'value', value)`.
+   - **And** indeterminate mode displays a continuous sliding shimmer animation along the bar without exposing numeric values.
+
+5. **[AC-5] Skeleton Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.9):**
+   - **Given** content that is awaiting data resolution,
+   - **When** `SkeletonComponent` (`origo-skeleton`) is instantiated via BADL contract with key `'Skeleton'`,
+   - **Then** it must render a placeholder preview geometry supporting:
+     - `shape`: `'rectangle' | 'circle'` (default `'rectangle'`).
+     - `width`: Rendered inline-size string (default `'100%'`).
+     - `height`: Rendered block-size string (default `'1rem'`).
+     - `size`: Square/circle dimension string (e.g., `'3rem'`); when specified, takes precedence and sets both `width` and `height` equally.
+     - `borderRadius`: Border radius override (default: `'var(--origo-radius-md)'` for rectangle, `'50%'` for circle).
+     - `animation`: `'shimmer' | 'pulse' | 'none'` (default `'shimmer'`).
+   - **And** when `shape === 'circle'`, default dimensions resolve to `size || '2.5rem'` with `border-radius: 50%`.
+   - **And** the shimmer animation uses a linear gradient moving horizontally across the skeleton surface bound to `--origo-color-surface-subtle` and `--origo-color-surface-hover` tokens.
+
+6. **[AC-6] Badge Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.4):**
+   - **Given** an entity count, notification tally, or status flag,
+   - **When** `BadgeComponent` (`origo-badge`) is instantiated via BADL contract with key `'Badge'`,
+   - **Then** it must support both standalone and container-overlay usage:
+     - `value`: String or number payload to display (e.g., `5`, `"NEW"`, `120`).
+     - `severity`: `'primary' | 'secondary' | 'info' | 'success' | 'warn' | 'warning' | 'error' | 'contrast'` (default `'primary'`).
+     - `size`: `'small' | 'medium' | 'large'` (default `'medium'`).
+     - `shape`: `'circle' | 'rounded' | 'square'` (default `'rounded'`).
+     - `max`: Maximum numeric threshold (default `undefined`); if `value` is a number > `max`, renders `"${max}+"` (e.g., `max: 99`, `value: 120` -> renders `"99+"`).
+     - `dot`: Boolean toggle (default `false`); when `true` or when `value` is null/empty/undefined, renders as a compact circular indicator dot without text.
+     - `interactive`: Boolean toggle (default `false`); when `true`, adds cursor pointer, focus styles, and emits `click = output<MouseEvent>()`.
+   - **And** `BadgeComponent` must implement `ContainerComponent` with optional `vc = viewChild('vc', { read: ViewContainerRef })` and `<ng-content>`.
+   - **And** when wrapping content (`hasContent: true`), the badge indicator must position as an overlay at the top-end corner:
+     - Standard: `inset-block-start: 0; inset-inline-end: 0; transform: translate(50%, -50%);`
+     - RTL Mirroring: `[dir='rtl'] & { transform: translate(-50%, -50%); }` (guaranteeing the badge shifts outward to the inline-end, not inward over container content).
+   - **And** when no children are projected (`hasContent: false`), `BadgeComponent` renders directly inline-flex in document flow without absolute positioning.
+
+7. **[AC-7] Tag Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.5):**
+   - **Given** categorization, entity attributes, or removable metadata chips,
+   - **When** `TagComponent` (`origo-tag`) is instantiated via BADL contract with key `'Tag'`,
+   - **Then** it must render a semantic status pill supporting:
+     - `value`: String text label of the tag.
+     - `severity`: `'primary' | 'secondary' | 'info' | 'success' | 'warn' | 'warning' | 'error' | 'contrast'` (default `'primary'`).
+     - `icon`: Optional leading icon identifier or SVG string.
+     - `rounded`: Boolean toggle for fully pill-shaped border radius (`9999px`, default `false`).
+     - `removable`: Boolean toggle (default `false`) displaying a trailing remove button.
+     - `variant`: Visual style (`'filled' | 'outlined'`, default `'filled'`).
+     - `interactive`: Boolean toggle (default `false`) enabling focus and click handlers.
+   - **And** clicking the tag when `interactive: true` emits `click = output<MouseEvent>()` and dispatches capability `dispatchCapability(id, 'click')`.
+   - **And** clicking the remove button emits `remove = output<void>()`, updates state `updateState(id, 'visible', false)`, and dispatches capability `dispatchCapability(id, 'remove')`.
+   - **CRITICAL EVENT ISOLATION:** The remove button click handler MUST call `$event.stopPropagation()` to prevent bubbling and ensure the outer tag `click` event is NOT triggered when dismissing a tag.
+   - **And** keyboard removal is supported via `Enter`, `Space` on the remove trigger, or `Backspace` / `Delete` on a focused tag.
+
+8. **[AC-8] BlockUI & Loading Overlay Component Specification (ADR: P1-AD-1, P1-AD-5, Spike: retro-1, API Spec 7.7, PRD Epic 1.4):**
+   - **Given** a container, form, card, or full application screen that must block user interaction during processing,
+   - **When** `BlockUIComponent` (`origo-block-ui` / `origo-loading-overlay`) is instantiated via BADL contract with key `'BlockUI'` or `'LoadingOverlay'`,
+   - **Then** it must support:
+     - `blocked`: Boolean toggle (default `false`, accepting `loading` as an alias) controlling whether the blocking mask is active.
+     - `fullScreen`: Boolean toggle (default `false`); when `true`, projects the blocking mask to `document.body` via `OrigoOverlayService` so the entire browser viewport is blocked. When `false`, blocks only the local component container.
+     - `message`: Optional loading message or status string displayed below the spinner (e.g., `"Please wait..."`).
+     - `spinner`: Boolean toggle (default `true`) displaying an inner `SpinnerComponent` within the mask.
+     - `baseZIndex`: Base z-index override (default `var(--origo-z-overlay, 1000)`).
+   - **And** `BlockUIComponent` implements `ContainerComponent` with optional `vc = viewChild('vc', { read: ViewContainerRef })` and `<ng-content>`.
+   - **And** when `blocked` is `true`:
+     - Sets `aria-busy="true"` on the host.
+     - Renders a semi-transparent backdrop overlay (`.origo-block-ui__mask` bound to `--origo-color-backdrop` or surface tokens with smooth fade-in).
+     - Centered content displays the spinner and message.
+     - Blocks user clicks, hover, and interaction on the underlying content (`pointer-events: none` on wrapped content, `pointer-events: auto` on mask).
+     - Suppresses keyboard interaction by intercepting keydown events or trapping focus within the mask.
+   - **And** toggling `blocked` emits `blockedChange = output<boolean>()` and synchronizes state via `updateState(id, 'blocked', blocked)`.
+   - **CRITICAL LIFECYCLE & MEMORY SAFETY:** In full-screen mode, `BlockUIComponent` must register an explicit cleanup handler with `DestroyRef.onDestroy(() => this.overlayRef?.dispose())`, guaranteeing that unmounting the component or navigating away cleans up any active CDK overlay mask from `document.body`.
+   - **And** browser-only APIs and CDK Overlay creation must be guarded by `isPlatformBrowser(platformId)`.
+
+9. **[AC-9] Angular Standalone, Signals Reactivity & Runtime Property Coercion (ADR: P1-AD-1, P1-AD-4):**
+   - **Given** incoming BADL AST payloads,
+   - **When** any of the status/loading primitives are instantiated,
+   - **Then** all components (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`) must be Angular Standalone components with `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`, consuming inputs via Angular Signals (`input.required<InteractionContract<TProps>>()`, `computed()`), and emitting typed outputs (`output()`).
+   - **And** each component must define `static readonly contractSchema` covering 100% of defined properties and aliases (`value`, `severity`, `size`, `label`, `strokeWidth`, `mode`, `showValue`, `max`, `shape`, `width`, `height`, `borderRadius`, `animation`, `rounded`, `removable`, `blocked`, `loading`, `fullScreen`, `message`, etc.) and invoke `coerceContractProps()` on incoming `this.contract().props` to guard against runtime property stripping or malformed types.
+   - **And** all components implementing `ContainerComponent` (`BadgeComponent`, `BlockUIComponent`) must declare optional signal query `vc = viewChild('vc', { read: ViewContainerRef })`. Using `viewChild.required('vc')` is strictly FORBIDDEN to eliminate fatal runtime error `NG0951`.
+   - **And** leaf primitives (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `TagComponent`) do NOT implement `ContainerComponent` to avoid unnecessary slot overhead.
+
+10. **[AC-10] State Synchronization & Capability Dispatch (ADR: AD-11, AD-15):**
+    - **Given** user interactions and component state transitions,
+    - **When** an event occurs,
+    - **Then** the component must emit corresponding typed outputs and synchronize state via `WebExperienceAdapterService`:
+      - `ProgressBarComponent`: `complete`, `valueChange`, `updateState(id, 'value', value)`, `dispatchCapability(id, 'complete', payload)`.
+      - `BadgeComponent`: `click`, `dispatchCapability(id, 'click', payload)`.
+      - `TagComponent`: `click`, `remove`, `updateState(id, 'visible', false)`, `dispatchCapability(id, 'remove', payload)`, `dispatchCapability(id, 'click', payload)`.
+      - `BlockUIComponent`: `blockedChange`, `updateState(id, 'blocked', isBlocked)`, `dispatchCapability(id, 'blockedChange', { blocked: isBlocked })`.
+
+11. **[AC-11] Server-Side Rendering (SSR) & Content Security Policy (CSP) Compliance (Global System AC-1, AC-2):**
+    - **Given** strict enterprise SSR and Content Security Policy environments,
+    - **When** status components or full-screen loading overlays are initialized and mounted,
+    - **Then** direct access to browser DOM globals (`window`, `document`) must be strictly guarded via `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
+    - **And** any timer handles (`setTimeout`, `requestAnimationFrame`) must be cleanly cleared and disposed upon component teardown via `DestroyRef.onDestroy()`.
+    - **And** zero inline `style="..."` attributes may be dynamically injected onto body nodes; all full-screen overlay styles must be governed strictly through predefined CSS classes in `packages/angular-renderer/src/styles/overlay.scss` (`.origo-overlay-pane--block-ui`) and CSS custom properties.
+
+12. **[AC-12] Definition of Done (DoD), Registration & Central Test Registry (DoD: docs/definition-of-done.md, ADR: AD-11, AD-12):**
+    - **Given** completion of the status and loading indicator components,
+    - **When** prepared for release,
+    - **Then** all primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`:
+      - `'Spinner'` -> `SpinnerComponent`
+      - `'ProgressBar'` -> `ProgressBarComponent`
+      - `'Progress'` -> `ProgressBarComponent` (alias)
+      - `'Skeleton'` -> `SkeletonComponent`
+      - `'Badge'` -> `BadgeComponent`
+      - `'Tag'` -> `TagComponent`
+      - `'BlockUI'` -> `BlockUIComponent`
+      - `'LoadingOverlay'` -> `BlockUIComponent` (alias)
+    - **And** exported from `packages/angular-renderer/src/index.ts`.
+    - **And** `tools/test-registry/test-registry.yaml` MUST be updated with six new test suite entries:
+      - `renderer-primitive-spinner` (`packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts`)
+      - `renderer-primitive-progress-bar` (`packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts`)
+      - `renderer-primitive-skeleton` (`packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts`)
+      - `renderer-primitive-badge` (`packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts`)
+      - `renderer-primitive-tag` (`packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts`)
+      - `renderer-primitive-block-ui` (`packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts`)
+      each specifying `affected_stories: [2-4-status-and-loading-indicators]` and type `unit`.
+
+---
+
+## Tasks / Subtasks
+
+- [x] Task 1: Overlay Infrastructure & Global Overlay Pane Styling for BlockUI (AC: 1, 8, 11)
+  - [x] 1.1 Add `.origo-overlay-pane--block-ui` modifier class to `packages/angular-renderer/src/styles/overlay.scss` with:
+    - `inline-size: 100vw !important; block-size: 100vh !important; inset-block-start: 0 !important; inset-inline-start: 0 !important;`
+    - `background-color: var(--origo-color-backdrop, rgba(0, 0, 0, 0.45));`
+    - `display: flex; align-items: center; justify-content: center; pointer-events: auto;`
+    - Clean backdrop and elevation tokens.
+  - [x] 1.2 Verify reduced motion queries in `overlay.scss` disable transitions for block-ui overlays.
+
+- [x] Task 2: Implement SpinnerComponent (`origo-spinner`) (AC: 1, 2, 3, 9, 10, 11)
+  - [x] 2.1 Create component files under `packages/angular-renderer/src/components/primitives/spinner/`:
+    - `spinner.component.ts`
+    - `spinner.component.html`
+    - `spinner.component.scss`
+    - `spinner.component.spec.ts`
+  - [x] 2.2 Define `SpinnerProps` interface and `static readonly contractSchema` supporting `size`, `strokeWidth`, `label`, `variant`, `animationDuration`, `fill`, `fluid`, metadata hooks.
+  - [x] 2.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, and scalable SVG circle with rotating CSS keyframe animation.
+  - [x] 2.4 Bind ARIA attributes: `role="status"`, `aria-live="polite"`, `<span class="sr-only">{{ computedLabel() }}</span>`.
+  - [x] 2.5 Author unit test suite in `spinner.component.spec.ts` asserting SVG rendering across shadow boundaries, size variations, variant token bindings, ARIA roles, and null-safe contract handling.
+
+- [x] Task 3: Implement ProgressBarComponent (`origo-progress-bar`) (AC: 1, 2, 4, 9, 10, 11)
+  - [x] 3.1 Create component files under `packages/angular-renderer/src/components/primitives/progress-bar/`:
+    - `progress-bar.component.ts`
+    - `progress-bar.component.html`
+    - `progress-bar.component.scss`
+    - `progress-bar.component.spec.ts`
+  - [x] 3.2 Define `ProgressBarProps` interface and `static readonly contractSchema` supporting `value`, `mode`, `showValue`, `max`, `label`, `unit`, `severity`, `height`, metadata hooks.
+  - [x] 3.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, safe max resolution (`safeMax = max > 0 ? max : 100`), input clamping (`0` to `safeMax`), determinate progress percentage calculation, and indeterminate sliding animation.
+  - [x] 3.4 Implement `complete = output<void>()`, `valueChange = output<number>()`, and capability/state dispatching upon reaching `max` with `hasCompleted` boundary guard to prevent duplicate or infinite emissions.
+  - [x] 3.5 Bind ARIA `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`, omitting `aria-valuenow` in indeterminate mode.
+  - [x] 3.6 Author unit test suite in `progress-bar.component.spec.ts` asserting determinate progress widths, zero-division fallback, indeterminate animation states, completion events boundary guard, severity token classes, and RTL mirroring.
+
+- [x] Task 4: Implement SkeletonComponent (`origo-skeleton`) (AC: 1, 2, 5, 9, 10, 11)
+  - [x] 4.1 Create component files under `packages/angular-renderer/src/components/primitives/skeleton/`:
+    - `skeleton.component.ts`
+    - `skeleton.component.html`
+    - `skeleton.component.scss`
+    - `skeleton.component.spec.ts`
+  - [x] 4.2 Define `SkeletonProps` interface and `static readonly contractSchema` supporting `shape`, `width`, `height`, `size`, `borderRadius`, `animation`, metadata hooks.
+  - [x] 4.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, dimension resolution (`size` overriding `width`/`height`), geometric shape rendering (`rectangle`, `circle`), and shimmer/pulse CSS animations.
+  - [x] 4.4 Bind `aria-hidden="true"` and reduced motion guardrails (disabling shimmer animation).
+  - [x] 4.5 Author unit test suite in `skeleton.component.spec.ts` asserting circle/rectangle shapes, dimension styles, animation class bindings, and shadow DOM encapsulation.
+
+- [x] Task 5: Implement BadgeComponent (`origo-badge`) (AC: 1, 2, 6, 9, 10, 11)
+  - [x] 5.1 Create component files under `packages/angular-renderer/src/components/primitives/badge/`:
+    - `badge.component.ts`
+    - `badge.component.html`
+    - `badge.component.scss`
+    - `badge.component.spec.ts`
+  - [x] 5.2 Define `BadgeProps` interface and `static readonly contractSchema` supporting `value`, `severity`, `size`, `shape`, `max`, `dot`, `interactive`, metadata hooks.
+  - [x] 5.3 Implement Standalone, Shadow DOM, OnPush, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
+  - [x] 5.4 Implement corner overlay positioning when wrapping content vs inline-block when standalone, including RTL logical coordinate mirroring (`[dir='rtl'] & { transform: translate(-50%, -50%); }`).
+  - [x] 5.5 Implement numeric threshold formatting (e.g., `max: 99` displaying `99+`) and dot mode with accessible label.
+  - [x] 5.6 Author unit test suite in `badge.component.spec.ts` asserting value formatting, dot rendering, container wrapping vs standalone, click event emission, RTL mirroring, and keyboard accessibility.
+
+- [x] Task 6: Implement TagComponent (`origo-tag`) (AC: 1, 2, 7, 9, 10, 11)
+  - [x] 6.1 Create component files under `packages/angular-renderer/src/components/primitives/tag/`:
+    - `tag.component.ts`
+    - `tag.component.html`
+    - `tag.component.scss`
+    - `tag.component.spec.ts`
+  - [x] 6.2 Define `TagProps` interface and `static readonly contractSchema` supporting `value`, `severity`, `icon`, `rounded`, `removable`, `variant`, `interactive`, metadata hooks.
+  - [x] 6.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, pill shaping, and severity color mappings.
+  - [x] 6.4 Implement removal action button with `$event.stopPropagation()` to isolate remove from tag click (`remove = output<void>()`, `updateState(id, 'visible', false)`), and interactive click emission (`click = output<MouseEvent>()`).
+  - [x] 6.5 Bind ARIA labels and keyboard handlers for removal (`Enter`, `Space`, `Backspace`, `Delete`).
+  - [x] 6.6 Author unit test suite in `tag.component.spec.ts` asserting label rendering, icon placement, removal events with click isolation, keyboard activation, and outlined vs filled variants.
+
+- [x] Task 7: Implement BlockUIComponent (`origo-block-ui` / `origo-loading-overlay`) (AC: 1, 2, 8, 9, 10, 11)
+  - [x] 7.1 Create component files under `packages/angular-renderer/src/components/primitives/block-ui/`:
+    - `block-ui.component.ts`
+    - `block-ui.component.html`
+    - `block-ui.component.scss`
+    - `block-ui.component.spec.ts`
+  - [x] 7.2 Define `BlockUIProps` interface and `static readonly contractSchema` supporting `blocked`, `loading`, `fullScreen`, `message`, `spinner`, `baseZIndex`, metadata hooks.
+  - [x] 7.3 Implement Standalone, Shadow DOM, OnPush, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
+  - [x] 7.4 Implement local container mask with `pointer-events: none` on wrapped content and `pointer-events: auto` on mask, and fullScreen projection via `OrigoOverlayService`.
+  - [x] 7.5 Register `DestroyRef.onDestroy(() => this.overlayRef?.dispose())` to prevent orphaned full-screen overlays upon component teardown or route changes.
+  - [x] 7.6 Embed `SpinnerComponent` and message text within the blocking mask.
+  - [x] 7.7 Bind `aria-busy="true"` on blocked state and emit `blockedChange = output<boolean>()`.
+  - [x] 7.8 Author unit test suite in `block-ui.component.spec.ts` asserting local vs fullScreen blocking, pointer-events blocking, message and spinner rendering, dynamic `blocked` toggle, SSR safety guards, and overlay teardown.
+
+- [x] Task 8: Monorepo Registration, Exports & Central Test Registry (AC: 12)
+  - [x] 8.1 Register primitives in `packages/angular-renderer/src/lib/primitives.provider.ts`:
+    - `'Spinner'`: `SpinnerComponent`
+    - `'ProgressBar'`: `ProgressBarComponent`
+    - `'Progress'`: `ProgressBarComponent`
+    - `'Skeleton'`: `SkeletonComponent`
+    - `'Badge'`: `BadgeComponent`
+    - `'Tag'`: `TagComponent`
+    - `'BlockUI'`: `BlockUIComponent`
+    - `'LoadingOverlay'`: `BlockUIComponent`
+  - [x] 8.2 Export all new components and model interfaces in `packages/angular-renderer/src/index.ts`.
+  - [x] 8.3 Register test suites in `tools/test-registry/test-registry.yaml`:
+    - `renderer-primitive-spinner`
+    - `renderer-primitive-progress-bar`
+    - `renderer-primitive-skeleton`
+    - `renderer-primitive-badge`
+    - `renderer-primitive-tag`
+    - `renderer-primitive-block-ui`
+  - [x] 8.4 Run full monorepo test suite (`npm test`) and lint checks (`npx nx lint angular-renderer`) to verify zero regressions.
+  - [x] 8.5 Update `sprint-status.yaml` marking `2-4-status-and-loading-indicators` as `ready-for-dev`.
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
+   - Host styling: Every `.scss` file MUST define `:host` and `:host([hidden]) { display: none !important; }`.
+
+2. **Signals Reactivity (Invariant 3, ADR: P1-AD-1):**
+   - Inputs must use `input.required<InteractionContract<TProps>>()`.
+   - Derived states must use `computed()`.
+   - Events must use `output<T>()`.
+   - No direct property mutation; no unmanaged RxJS subscriptions.
+   - When writing constructor effects that sync model signals from contract inputs, always wrap untracked updates in `untracked()` or pass `{ allowSignalWrites: true }` to avoid Angular runtime signal writing errors.
+
+3. **Runtime Contract Coercion & Schema (Invariant 4, ADR: P1-AD-4):**
+   - Every component must implement `OrigoAdapter<TProps>`.
+   - Must define `static readonly contractSchema` covering all defined properties and aliases.
+   - Must call `coerceContractProps()` on incoming `this.contract().props` in constructor or computed signal.
+
+4. **Composition Slots & ViewContainerRef (Invariant 5, ADR: P1-AD-5):**
+   - Components implementing `ContainerComponent` (`BadgeComponent`, `BlockUIComponent`) must declare optional signal query:
+     ```typescript
+     readonly vc = viewChild('vc', { read: ViewContainerRef });
+     ```
+   - **CRITICAL ANTI-PATTERN TO AVOID:** Do NOT use `viewChild.required('vc')`. Query resolution fails with fatal runtime error `NG0951` when `#vc` is hosted within unattached `<ng-template>` views.
+   - Leaf primitives (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `TagComponent`) do NOT implement `ContainerComponent` to avoid unnecessary slot overhead.
+
+5. **CDK Overlay & Portal Substrate for BlockUI (ADR: P1-AD-5, Spike: retro-1):**
+   - `BlockUIComponent` when configured with `fullScreen: true` projects into `document.body` via `OrigoOverlayService`.
+   - Clean up overlay refs on teardown via `DestroyRef.onDestroy()`.
+   - Ensure local blocking mode (`fullScreen: false`) uses relative host container with absolute mask positioning and does not invoke CDK overlay unnecessarily.
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
+### Technical Implementation Blueprints & Concrete Guardrails
+
+#### 1. Exact BADL Contract Schemas for All 6 Primitives
+
+Every primitive must define its `static readonly contractSchema` and implement `OrigoAdapter<TProps>`:
+
+```typescript
+// 1. SpinnerComponent
+export const SpinnerContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  size: 'string',
+  strokeWidth: 'number',
+  label: 'string',
+  variant: 'string',
+  animationDuration: 'string',
+  fill: 'string',
+  fluid: 'boolean',
+} as const;
+
+// 2. ProgressBarComponent
+export const ProgressBarContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  value: 'number',
+  mode: 'string',
+  showValue: 'boolean',
+  max: 'number',
+  label: 'string',
+  unit: 'string',
+  severity: 'string',
+  height: 'string',
+} as const;
+
+// 3. SkeletonComponent
+export const SkeletonContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  shape: 'string',
+  width: 'string',
+  height: 'string',
+  size: 'string',
+  borderRadius: 'string',
+  animation: 'string',
+} as const;
+
+// 4. BadgeComponent
+export const BadgeContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  value: 'string',
+  severity: 'string',
+  size: 'string',
+  shape: 'string',
+  max: 'number',
+  dot: 'boolean',
+  interactive: 'boolean',
+} as const;
+
+// 5. TagComponent
+export const TagContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  value: 'string',
+  severity: 'string',
+  icon: 'string',
+  rounded: 'boolean',
+  removable: 'boolean',
+  variant: 'string',
+  interactive: 'boolean',
+} as const;
+
+// 6. BlockUIComponent
+export const BlockUIContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  blocked: 'boolean',
+  loading: 'boolean', // alias for blocked
+  fullScreen: 'boolean',
+  message: 'string',
+  spinner: 'boolean',
+  baseZIndex: 'number',
+} as const;
+```
+
+#### 2. ProgressBar Clamping & Debounced Completion Blueprint
+
+```typescript
+export class ProgressBarComponent implements OrigoAdapter<ProgressBarProps> {
+  static readonly contractSchema = ProgressBarContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<ProgressBarProps>>();
+  complete = output<void>();
+  valueChange = output<number>();
+
+  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
+  private hasCompleted = false;
+
+  protected props = computed(() =>
+    coerceContractProps<ProgressBarProps>(this.contract().props, ProgressBarComponent.contractSchema)
+  );
+
+  readonly safeMax = computed(() => {
+    const m = this.props().max;
+    return m !== undefined && m !== null && Number(m) > 0 ? Number(m) : 100;
+  });
+
+  readonly clampedValue = computed(() => {
+    const v = this.props().value;
+    const num = v !== undefined && v !== null ? Number(v) : 0;
+    return Math.min(Math.max(isNaN(num) ? 0 : num, 0), this.safeMax());
+  });
+
+  readonly percentage = computed(() => {
+    return (this.clampedValue() / this.safeMax()) * 100;
+  });
+
+  readonly mode = computed(() => this.props().mode ?? 'determinate');
+
+  constructor() {
+    effect(() => {
+      const val = this.clampedValue();
+      const max = this.safeMax();
+      const currentMode = this.mode();
+
+      if (currentMode === 'determinate' && val >= max && max > 0) {
+        if (!this.hasCompleted) {
+          this.hasCompleted = true;
+          untracked(() => {
+            this.complete.emit();
+            this.experienceAdapter?.dispatchCapability(this.contract().id, 'complete', {
+              value: val,
+              max,
+            });
+          });
+        }
+      } else if (val < max) {
+        this.hasCompleted = false;
+      }
+    });
+  }
+}
+```
+
+#### 3. Spinner SVG Geometry & CSS Keyframe Blueprint
+
+SVG Template (`spinner.component.html`):
+```html
+<svg
+  class="origo-spinner__svg"
+  viewBox="0 0 50 50"
+  aria-hidden="true"
+  focusable="false"
+  [style.animation-duration]="computedDuration()"
+>
+  <circle
+    class="origo-spinner__circle"
+    cx="25"
+    cy="25"
+    r="20"
+    fill="none"
+    [attr.stroke-width]="computedStrokeWidth()"
+  ></circle>
+</svg>
+<span class="sr-only">{{ computedLabel() }}</span>
+```
+
+Styles (`spinner.component.scss`):
+```scss
+:host {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  vertical-align: middle;
+  box-sizing: border-box;
+}
+
+:host([hidden]) {
+  display: none !important;
+}
+
+.origo-spinner__svg {
+  display: block;
+  inline-size: var(--origo-spinner-size, 2rem);
+  block-size: var(--origo-spinner-size, 2rem);
+  animation: origo-spinner-rotate var(--origo-spinner-duration, 1.5s) linear infinite;
+}
+
+.origo-spinner__circle {
+  stroke: var(--origo-spinner-color, var(--origo-color-primary, #2563eb));
+  stroke-linecap: round;
+  stroke-dasharray: 90, 150;
+  stroke-dashoffset: 0;
+  animation: origo-spinner-dash 1.5s ease-in-out infinite;
+}
+
+@keyframes origo-spinner-rotate {
+  100% {
+    transform: rotate(360deg);
+  }
+}
+
+@keyframes origo-spinner-dash {
+  0% {
+    stroke-dasharray: 1, 200;
+    stroke-dashoffset: 0;
+  }
+  50% {
+    stroke-dasharray: 90, 150;
+    stroke-dashoffset: -35px;
+  }
+  100% {
+    stroke-dasharray: 90, 150;
+    stroke-dashoffset: -125px;
+  }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .origo-spinner__svg,
+  .origo-spinner__circle {
+    animation: none !important;
+    opacity: 0.8;
+  }
+}
+```
+
+#### 4. Badge Dual-Mode & RTL Offset Blueprint
+
+Template (`badge.component.html`):
+```html
+<div class="origo-badge-host" [class.origo-badge-host--overlay]="hasContent()">
+  <ng-container #vc></ng-container>
+  <ng-content></ng-content>
+  @if (isVisible()) {
+    <span
+      class="origo-badge"
+      [class]="computedBadgeClasses()"
+      [attr.aria-label]="computedAriaLabel()"
+      (click)="onClick($event)"
+    >
+      @if (!isDot()) {
+        {{ displayValue() }}
+      }
+    </span>
+  }
+</div>
+```
+
+Styles (`badge.component.scss`):
+```scss
+:host {
+  display: inline-flex;
+  box-sizing: border-box;
+  vertical-align: middle;
+}
+
+:host([hidden]) {
+  display: none !important;
+}
+
+.origo-badge-host {
+  display: inline-flex;
+  position: relative;
+}
+
+.origo-badge-host--overlay .origo-badge {
+  position: absolute;
+  inset-block-start: 0;
+  inset-inline-end: 0;
+  transform: translate(50%, -50%);
+}
+
+// Crucial RTL Translation Inversion
+:host([dir='rtl']) .origo-badge-host--overlay .origo-badge,
+[dir='rtl'] .origo-badge-host--overlay .origo-badge {
+  transform: translate(-50%, -50%);
+}
+```
+
+#### 5. Tag Removal Event Isolation Blueprint
+
+```typescript
+export class TagComponent implements OrigoAdapter<TagProps> {
+  // ...
+  remove = output<void>();
+  click = output<MouseEvent>();
+
+  onRemove(event: MouseEvent) {
+    // STOP PROPAGATION is mandatory to prevent triggering tag's click handler
+    event.stopPropagation();
+    this.remove.emit();
+    this.experienceAdapter?.updateState(this.contract().id, 'visible', false);
+    this.experienceAdapter?.dispatchCapability(this.contract().id, 'remove', {});
+  }
+
+  onClick(event: MouseEvent) {
+    if (this.isInteractive()) {
+      this.click.emit(event);
+      this.experienceAdapter?.dispatchCapability(this.contract().id, 'click', {});
+    }
+  }
+}
+```
+
+#### 6. BlockUI FullScreen Lifecycle & Teardown Blueprint
+
+```typescript
+export class BlockUIComponent implements OrigoAdapter<BlockUIProps>, ContainerComponent {
+  static readonly contractSchema = BlockUIContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<BlockUIProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+  fullScreenOverlayTemplate = viewChild<TemplateRef<unknown>>('fullScreenOverlayTemplate');
+  blockedChange = output<boolean>();
+
+  private overlayRef?: OrigoOverlayRef;
+  private readonly overlayService = inject(OrigoOverlayService);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly platformId = inject(PLATFORM_ID);
+  private readonly experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
+
+  readonly isBlocked = computed(() => {
+    const p = this.props();
+    return !!(p.blocked || p.loading);
+  });
+
+  readonly isFullScreen = computed(() => !!this.props().fullScreen);
+
+  constructor() {
+    // Prevent memory leaks & orphaned backdrops upon unmount or route change
+    this.destroyRef.onDestroy(() => {
+      this.overlayRef?.dispose();
+    });
+
+    effect(() => {
+      const blocked = this.isBlocked();
+      const fullScreen = this.isFullScreen();
+
+      if (isPlatformBrowser(this.platformId) && fullScreen) {
+        if (blocked) {
+          if (!this.overlayRef?.isOpen) {
+            this.openFullScreenOverlay();
+          }
+        } else {
+          this.overlayRef?.close();
+        }
+      }
+    });
+  }
+
+  private openFullScreenOverlay() {
+    const tpl = this.fullScreenOverlayTemplate();
+    if (!tpl) return;
+
+    this.overlayRef = this.overlayService.create(
+      {
+        position: {
+          type: 'global',
+          position: 'center',
+          width: '100vw',
+          height: '100vh',
+        },
+        hasBackdrop: false, // The pane mask itself acts as the backdrop
+        panelClass: ['origo-overlay-pane', 'origo-overlay-pane--block-ui'],
+      },
+      this.destroyRef
+    );
+
+    this.overlayRef.open(tpl);
+  }
+}
+```
+
+---
+
+### Previous Story Intelligence & Anti-Patterns to Prevent
+
+From Story 2.3 and 2.2 retrospective reviews:
+1. **Host Resets in SCSS:** Ensure `:host` declares `display: inline-block` (for Spinner, Tag, Badge, Skeleton) or `display: block` (for ProgressBar, BlockUI), with `box-sizing: border-box;` and `:host([hidden]) { display: none !important; }`.
+2. **Missing `allowSignalWrites: true` or `untracked()`:** In Angular 18/22, updating a `signal()` or `model()` inside an `effect()` without `untracked()` throws an error in developer mode. Always wrap signal writes in `untracked(() => { ... })`.
+3. **Hardcoded Color Literals:** Do NOT use hardcoded hex (`#fff`, `#000`) or rgba literals in component stylesheets. Use CSS custom properties such as `var(--origo-color-surface-primary)`, `var(--origo-color-backdrop)`, etc.
+4. **SVG Accessibility in Spinner:** SVGs inside `SpinnerComponent` must have `aria-hidden="true"` while the parent host or wrapper provides `role="status"` and `<span class="sr-only">{{ label }}</span>`.
+5. **Progress Bar Boundary Conditions:** Ensure determinate progress handles negative values (clamps to 0) and values exceeding max (clamps to max). Ensure `complete` output only fires once when transitioning from incomplete to complete.
+6. **Badge Corner Coordinates in RTL:** When badging an element, badge offset must use `inset-inline-end: 0` and `transform: translate(50%, -50%)`. Under RTL, `inset-inline-end` correctly attaches to the inline-end (left in RTL). Ensure test asserts RTL layout behavior.
+7. **DOM Cleanup in Tests:** In `afterEach()` of all unit tests, always clean up any created CDK overlay containers or appended elements to prevent cross-test DOM pollution.
+
+---
+
+### Existing Files Being Modified
+
+| File | Current State | Modification for Story 2.4 | Preserved Behaviors |
+|---|---|---|---|
+| `packages/angular-renderer/src/lib/primitives.provider.ts` | Provides `provideOrigo9Primitives()`, registering ~45 component types. | Add imports and registry entries for `Spinner`, `ProgressBar`, `Skeleton`, `Badge`, `Tag`, `BlockUI`, and aliases. | All existing mappings (`Alert`, `Toast`, `Snackbar`, `Banner`, etc.) preserved intact. |
+| `packages/angular-renderer/src/index.ts` | Exports all public components, services, and models. | Export new components and interfaces (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`, and their `Props` interfaces). | All existing exports preserved intact. |
+| `packages/angular-renderer/src/styles/overlay.scss` | Global overlay pane and backdrop styling for modals, dropdowns, toasts, snackbars. | Add `.origo-overlay-pane--block-ui` styling for full-screen loading overlays. | All existing overlay modifiers preserved intact. |
+| `tools/test-registry/test-registry.yaml` | 1134 lines of test suite entries. | Append 6 new test suite entries for the status/loading indicator test files. | Schema version, headers, and all existing 1134 lines preserved. |
+| `_bmad-output/implementation-artifacts/sprint-status.yaml` | `2-4-status-and-loading-indicators: backlog`. | Update status to `ready-for-dev`, update `last_updated`. | All comments, structure, and status definitions preserved. |
+
+---
+
+### Testing Standards & DOM Test Isolation Patterns
+
+1. **Unit Test Framework:** Angular 18/22 TestBed, Vitest / Jest.
+2. **Shadow DOM Piercing:** Test queries targeting elements inside shadow root must query `fixture.nativeElement.shadowRoot`:
+   ```typescript
+   const shadowRoot = fixture.nativeElement.shadowRoot;
+   const spinnerEl = shadowRoot.querySelector('.origo-spinner');
+   expect(spinnerEl).toBeTruthy();
+   ```
+3. **Accessibility Assertions:** Test suites must assert:
+   - Presence of `role="status"` or `role="progressbar"`.
+   - `aria-live="polite"` and screen-reader descriptive text.
+   - ARIA values (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
+   - `data-testid` bound to `contract().id`.
+4. **DOM Cleanup Isolation:**
+   ```typescript
+   afterEach(() => {
+     fixture?.destroy();
+     document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
+   });
+   ```
+
+---
+
+### Project Structure Notes
+
+All new component directories reside under `packages/angular-renderer/src/components/primitives/`:
+- `spinner/`
+  - `spinner.component.ts`
+  - `spinner.component.html`
+  - `spinner.component.scss`
+  - `spinner.component.spec.ts`
+- `progress-bar/`
+  - `progress-bar.component.ts`
+  - `progress-bar.component.html`
+  - `progress-bar.component.scss`
+  - `progress-bar.component.spec.ts`
+- `skeleton/`
+  - `skeleton.component.ts`
+  - `skeleton.component.html`
+  - `skeleton.component.scss`
+  - `skeleton.component.spec.ts`
+- `badge/`
+  - `badge.component.ts`
+  - `badge.component.html`
+  - `badge.component.scss`
+  - `badge.component.spec.ts`
+- `tag/`
+  - `tag.component.ts`
+  - `tag.component.html`
+  - `tag.component.scss`
+  - `tag.component.spec.ts`
+- `block-ui/`
+  - `block-ui.component.ts`
+  - `block-ui.component.html`
+  - `block-ui.component.scss`
+  - `block-ui.component.spec.ts`
+
+No deviations from monorepo conventions.
+
+---
+
+### References
+
+- [Epics Document: Story 2.4](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/epics.md#L372-L386)
+- [Component API Specification: Section 7 Messages & Status](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#L855-L946)
+- [Component Invariants & Shadow DOM Checklist](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/component-invariants.md)
+- [Modular SCSS & Design Token Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/scss-and-tokens.md)
+- [Angular Overlay & Portal Architecture Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/overlay-portal-architecture.md)
+- [Testing Primitives Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/testing-primitives.md)
+- [Definition of Done](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/definition-of-done.md)
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
+### Completion Notes List
+
+- Story context created by `bmad-create-story` context engine.
+- Comprehensive technical guidance and developer guardrails established for `SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, and `BlockUIComponent`.
+- Complete BDD Acceptance Criteria linking architectural decisions (`P1-AD-1`, `P1-AD-4`, `P1-AD-5`, `P1-AD-6`, `AD-4`, `AD-6`, `NFR-I18N-001`, `Global System AC-1/AC-2/AC-4`, `DoD`) and technical spike (`retro-1`).
+- Detailed task breakdown with granular subtasks, test isolation rules, and registry update instructions.
+- Implemented all 6 status and loading indicator primitives (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`) adhering to Angular 18/22 Standalone, Shadow DOM, OnPush change detection, Signals reactivity (`input.required`), and 100% CSS Logical Properties.
+- Built scalable SVG circular spinner with accessible `role="status"`, `aria-live="polite"`, and screen-reader label.
+- Built linear progress bar with safe division fallback, clamping (0..safeMax), debounced completion boundary guard, `valueChange` output, and indeterminate sliding keyframe animation.
+- Built skeleton placeholder with rectangle/circle geometry, size override, shimmer/pulse animations, accessible `aria-hidden="true"`, and reduced-motion guard.
+- Built badge indicator with `ContainerComponent` viewChild support, corner-overlay vs standalone positioning, RTL-safe transform translation (-50%, -50%), and numeric threshold formatting (`99+`).
+- Built tag chip with pill styling, filled/outlined variants, event-isolated remove button (`$event.stopPropagation()`), keyboard shortcuts (Enter/Space/Backspace/Delete), and `remove`/`click` outputs.
+- Built BlockUI indicator with local container blocking, pointer-events isolation, CDK Overlay projection via `OrigoOverlayService` with guaranteed memory cleanup on destroy.
+- Added `.origo-overlay-pane--block-ui` modifier to global overlay SCSS styles.
+- Registered all components and aliases (`Progress`, `LoadingOverlay`) in `primitives.provider.ts` and exported in library public API `index.ts`.
+- Added 6 test suites to `tools/test-registry/test-registry.yaml`, verified with `npm run validate:registry` (115/115 passed).
+- Linting passed with 0 errors (`npx nx lint angular-renderer`).
+- Full test suite passed with 58/58 suites and 388/388 tests (`npx nx test angular-renderer`).
+
+### File List
+
+- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/badge/badge.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/badge/badge.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/badge/badge.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/tag/tag.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/tag/tag.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/tag/tag.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
+- `packages/angular-renderer/src/index.ts` (UPDATE)
+- `packages/angular-renderer/src/styles/overlay.scss` (UPDATE)
+- `tools/test-registry/test-registry.yaml` (UPDATE)
+- `_bmad-output/implementation-artifacts/sprint-status.yaml` (UPDATE)
+- `_bmad-output/implementation-artifacts/stories/2-4-status-and-loading-indicators.md` (UPDATE)
+
+## Change Log
+
+- **2026-10-15**: Completed implementation of Story 2.4 (Status & Loading Indicators):
+  - Created 6 standalone primitives: `SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`.
+  - Added global `.origo-overlay-pane--block-ui` CSS modifier for full-screen overlay projection.
+  - Registered primitives and aliases in `primitives.provider.ts` and `index.ts`.
+  - Added comprehensive unit tests and verified via `tools/test-registry/test-registry.yaml`.
+  - Ran linting and verified 100% test pass across `packages/angular-renderer` (388 tests, 0 failures).
+  - Moved story status to `review`.
+
diff --git a/packages/angular-renderer/src/components/primitives/badge/badge.component.html b/packages/angular-renderer/src/components/primitives/badge/badge.component.html
new file mode 100644
index 0000000..2efee06
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/badge/badge.component.html
@@ -0,0 +1,19 @@
+<div class="origo-badge-wrapper" [class.origo-badge-wrapper--overlay]="hasContent()">
+  <div #contentWrapper class="origo-badge__content">
+    <ng-container #vc></ng-container>
+    <ng-content></ng-content>
+  </div>
+  <span
+    [class]="computedBadgeClasses()"
+    [attr.aria-label]="computedAriaLabel()"
+    [attr.aria-describedby]="ariaDescribedBy()"
+    [attr.tabindex]="isInteractive() ? 0 : null"
+    [attr.role]="isInteractive() ? 'button' : 'status'"
+    (click)="onClick($event)"
+    (keydown)="onKeyDown($event)"
+  >
+    @if (!isDot()) {
+      {{ displayValue() }}
+    }
+  </span>
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/badge/badge.component.scss b/packages/angular-renderer/src/components/primitives/badge/badge.component.scss
new file mode 100644
index 0000000..b0bf7e7
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/badge/badge.component.scss
@@ -0,0 +1,158 @@
+:host {
+  display: inline-flex;
+  vertical-align: middle;
+  box-sizing: border-box;
+}
+
+:host([hidden]) {
+  display: none !important;
+}
+
+.origo-badge-wrapper {
+  display: inline-flex;
+  position: relative;
+  vertical-align: middle;
+}
+
+.origo-badge__content {
+  display: inline-flex;
+}
+
+.origo-badge {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  box-sizing: border-box;
+  font-weight: var(--origo-font-weight-semibold, 600);
+  line-height: 1;
+  white-space: nowrap;
+  text-align: center;
+  font-variant-numeric: tabular-nums;
+  user-select: none;
+  border-radius: var(--origo-radius-full, 9999px);
+  transition:
+    background-color var(--origo-motion-duration-fast, 150ms) ease,
+    color var(--origo-motion-duration-fast, 150ms) ease;
+}
+
+// Positioning as overlay when wrapping content
+.origo-badge-wrapper--overlay .origo-badge {
+  position: absolute;
+  inset-block-start: 0;
+  inset-inline-end: 0;
+  transform: translate(50%, -50%);
+  z-index: 1;
+}
+
+// RTL Coordinate Inversion
+:host([dir='rtl']) .origo-badge-wrapper--overlay .origo-badge,
+[dir='rtl'] .origo-badge-wrapper--overlay .origo-badge {
+  transform: translate(-50%, -50%);
+}
+
+// Sizes
+.origo-badge--size-small {
+  font-size: 0.625rem;
+  min-inline-size: 1rem;
+  block-size: 1rem;
+  padding-inline: 0.25rem;
+  padding-block: 0.125rem;
+}
+
+.origo-badge--size-medium {
+  font-size: 0.75rem;
+  min-inline-size: 1.25rem;
+  block-size: 1.25rem;
+  padding-inline: 0.375rem;
+  padding-block: 0.125rem;
+}
+
+.origo-badge--size-large {
+  font-size: 0.875rem;
+  min-inline-size: 1.5rem;
+  block-size: 1.5rem;
+  padding-inline: 0.5rem;
+  padding-block: 0.25rem;
+}
+
+// Shapes
+.origo-badge--shape-rounded {
+  border-radius: var(--origo-radius-full, 9999px);
+}
+
+.origo-badge--shape-circle {
+  border-radius: 50%;
+  padding-inline: 0;
+  padding-block: 0;
+}
+
+.origo-badge--shape-square {
+  border-radius: var(--origo-radius-xs, 0.125rem);
+}
+
+// Dot Mode
+.origo-badge--dot {
+  min-inline-size: 0.5rem !important;
+  block-size: 0.5rem !important;
+  inline-size: 0.5rem !important;
+  padding-inline: 0 !important;
+  padding-block: 0 !important;
+  border-radius: 50% !important;
+}
+
+// Severity Variants
+.origo-badge--severity-primary {
+  background-color: var(--origo-color-primary, #2563eb);
+  color: var(--origo-color-text-inverse, #ffffff);
+}
+
+.origo-badge--severity-secondary {
+  background-color: var(--origo-color-surface-secondary, #e2e8f0);
+  color: var(--origo-color-text-secondary, #64748b);
+}
+
+.origo-badge--severity-info {
+  background-color: var(--origo-color-text-info, #1e40af);
+  color: var(--origo-color-text-inverse, #ffffff);
+}
+
+.origo-badge--severity-success {
+  background-color: var(--origo-color-text-success, #065f46);
+  color: var(--origo-color-text-inverse, #ffffff);
+}
+
+.origo-badge--severity-warn,
+.origo-badge--severity-warning {
+  background-color: var(--origo-color-text-warning, #92400e);
+  color: var(--origo-color-text-inverse, #ffffff);
+}
+
+.origo-badge--severity-error {
+  background-color: var(--origo-color-text-danger, #991b1b);
+  color: var(--origo-color-text-inverse, #ffffff);
+}
+
+.origo-badge--severity-contrast {
+  background-color: var(--origo-color-surface-inverse, #0f172a);
+  color: var(--origo-color-text-inverse, #ffffff);
+}
+
+// Interactive Mode
+.origo-badge--interactive {
+  cursor: pointer;
+
+  &:hover {
+    filter: brightness(0.92);
+  }
+
+  &:focus-visible {
+    outline: var(--origo-border-width-focus, 2px) solid var(--origo-color-primary, #2563eb);
+    outline-offset: 2px;
+  }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .origo-badge {
+    transition: none !important;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts b/packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts
new file mode 100644
index 0000000..089aef7
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts
@@ -0,0 +1,138 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { Component } from '@angular/core';
+import { BadgeComponent, BadgeProps } from './badge.component';
+import { InteractionContract } from '@origostudio/core';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+@Component({
+  standalone: true,
+  imports: [BadgeComponent],
+  template: `
+    <origo-badge [contract]="contract">
+      <button id="target-button">Notifications</button>
+    </origo-badge>
+  `,
+})
+class TestBadgeHostComponent {
+  contract: InteractionContract<BadgeProps> = {
+    id: 'badge-wrapped',
+    type: 'Badge',
+    props: { value: 5 },
+  };
+}
+
+describe('BadgeComponent', () => {
+  let component: BadgeComponent;
+  let fixture: ComponentFixture<BadgeComponent>;
+  let experienceAdapter: WebExperienceAdapterService;
+
+  function createContract(
+    props: Partial<BadgeProps> = {},
+    id = 'badge-1'
+  ): InteractionContract<BadgeProps> {
+    return {
+      id,
+      type: 'Badge',
+      props,
+    };
+  }
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [BadgeComponent, TestBadgeHostComponent],
+      providers: [WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(BadgeComponent);
+    component = fixture.componentInstance;
+    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
+  });
+
+  afterEach(() => {
+    fixture?.destroy();
+  });
+
+  it('should create and render standalone badge with default properties', () => {
+    fixture.componentRef.setInput('contract', createContract({ value: 'NEW' }));
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    expect(shadowRoot).toBeTruthy();
+
+    const badgeEl = shadowRoot.querySelector('.origo-badge');
+    expect(badgeEl).toBeTruthy();
+    expect(badgeEl.textContent?.trim()).toBe('NEW');
+    expect(component.hasContent()).toBe(false);
+
+    const wrapper = shadowRoot.querySelector('.origo-badge-wrapper');
+    expect(wrapper.classList.contains('origo-badge-wrapper--overlay')).toBe(false);
+  });
+
+  it('should format value when exceeding max numeric threshold (99+)', () => {
+    fixture.componentRef.setInput('contract', createContract({ value: 120, max: 99 }));
+    fixture.detectChanges();
+
+    expect(component.displayValue()).toBe('99+');
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const badgeEl = shadowRoot.querySelector('.origo-badge');
+    expect(badgeEl.textContent?.trim()).toBe('99+');
+  });
+
+  it('should render dot-only badge when dot is true or value is empty', () => {
+    fixture.componentRef.setInput('contract', createContract({ dot: true }));
+    fixture.detectChanges();
+
+    expect(component.isDot()).toBe(true);
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const badgeEl = shadowRoot.querySelector('.origo-badge');
+    expect(badgeEl.classList.contains('origo-badge--dot')).toBe(true);
+    expect(badgeEl.textContent?.trim()).toBe('');
+    expect(badgeEl.getAttribute('aria-label')).toBe('Status indicator');
+  });
+
+  it('should support severity variants and shapes (circle, rounded, square)', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ value: 3, severity: 'error', shape: 'circle', size: 'small' })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const badgeEl = shadowRoot.querySelector('.origo-badge');
+    expect(badgeEl.classList.contains('origo-badge--severity-error')).toBe(true);
+    expect(badgeEl.classList.contains('origo-badge--shape-circle')).toBe(true);
+    expect(badgeEl.classList.contains('origo-badge--size-small')).toBe(true);
+  });
+
+  it('should emit click and dispatch capability when interactive is true', () => {
+    const clickSpy = jest.fn();
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    component.click.subscribe(clickSpy);
+
+    fixture.componentRef.setInput('contract', createContract({ value: 5, interactive: true }));
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const badgeEl = shadowRoot.querySelector('.origo-badge') as HTMLElement;
+    expect(badgeEl.getAttribute('role')).toBe('button');
+    expect(badgeEl.getAttribute('tabindex')).toBe('0');
+
+    badgeEl.click();
+    expect(clickSpy).toHaveBeenCalledTimes(1);
+    expect(dispatchSpy).toHaveBeenCalledWith('badge-1', 'click', expect.any(Object));
+  });
+
+  it('should position as overlay when wrapping projected content', () => {
+    const hostFixture = TestBed.createComponent(TestBadgeHostComponent);
+    hostFixture.detectChanges();
+
+    const badgeDebugEl = hostFixture.debugElement.children[0];
+    const badgeComp = badgeDebugEl.componentInstance as BadgeComponent;
+    const shadowRoot = badgeDebugEl.nativeElement.shadowRoot;
+
+    expect(badgeComp.hasContent()).toBe(true);
+    const wrapper = shadowRoot.querySelector('.origo-badge-wrapper');
+    expect(wrapper.classList.contains('origo-badge-wrapper--overlay')).toBe(true);
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/badge/badge.component.ts b/packages/angular-renderer/src/components/primitives/badge/badge.component.ts
new file mode 100644
index 0000000..da8997d
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/badge/badge.component.ts
@@ -0,0 +1,208 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  computed,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  ElementRef,
+  signal,
+  AfterContentChecked,
+} from '@angular/core';
+import { CommonModule } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface BadgeProps {
+  value?: string | number;
+  severity?:
+    | 'primary'
+    | 'secondary'
+    | 'info'
+    | 'success'
+    | 'warn'
+    | 'warning'
+    | 'error'
+    | 'contrast'
+    | string;
+  size?: 'small' | 'medium' | 'large' | string;
+  shape?: 'circle' | 'rounded' | 'square' | string;
+  max?: number;
+  dot?: boolean;
+  interactive?: boolean;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const BadgeContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  value: 'string',
+  severity: 'string',
+  size: 'string',
+  shape: 'string',
+  max: 'number',
+  dot: 'boolean',
+  interactive: 'boolean',
+} as const;
+
+@Component({
+  selector: 'origo-badge',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './badge.component.html',
+  styleUrls: ['./badge.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-badge-host]': 'true',
+    '[attr.data-testid]': 'contractId()',
+  },
+})
+export class BadgeComponent
+  implements OrigoAdapter<BadgeProps>, ContainerComponent, AfterContentChecked
+{
+  static readonly contractSchema = BadgeContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<BadgeProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+  contentWrapper = viewChild<ElementRef<HTMLElement>>('contentWrapper');
+
+  click = output<MouseEvent>();
+
+  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
+  private readonly _hasProjectedContent = signal(false);
+
+  readonly contractId = computed(() => {
+    try {
+      return this.contract()?.id ?? '';
+    } catch {
+      return '';
+    }
+  });
+
+  readonly coercedProps = computed(() => {
+    let rawProps: BadgeProps | undefined;
+    try {
+      rawProps = this.contract()?.props;
+    } catch {
+      rawProps = undefined;
+    }
+    return coerceContractProps<BadgeProps>(rawProps, BadgeContractSchema);
+  });
+
+  readonly isDot = computed(() => {
+    const p = this.coercedProps();
+    if (p.dot === true) return true;
+    const v = p.value;
+    return v === undefined || v === null || String(v).trim() === '';
+  });
+
+  readonly displayValue = computed(() => {
+    const p = this.coercedProps();
+    const v = p.value;
+    if (v === undefined || v === null) return '';
+    const maxVal = p.max;
+    if (maxVal !== undefined && maxVal !== null && !isNaN(Number(v)) && Number(v) > maxVal) {
+      return `${maxVal}+`;
+    }
+    return String(v);
+  });
+
+  readonly isInteractive = computed(() => this.coercedProps().interactive === true);
+
+  readonly severity = computed(() => {
+    const s = this.coercedProps().severity?.toLowerCase() || 'primary';
+    return s === 'warn' || s === 'warning' ? 'warning' : s;
+  });
+
+  readonly size = computed(() => this.coercedProps().size || 'medium');
+
+  readonly shape = computed(() => this.coercedProps().shape || 'rounded');
+
+  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);
+
+  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
+
+  readonly computedAriaLabel = computed(() => {
+    if (this.ariaLabel()) return this.ariaLabel();
+    if (this.isDot()) return 'Status indicator';
+    return String(this.displayValue());
+  });
+
+  readonly hasContent = computed(() => {
+    let contractWithChildren: { children?: unknown[] } | undefined;
+    try {
+      contractWithChildren = this.contract() as unknown as { children?: unknown[] };
+    } catch {
+      contractWithChildren = undefined;
+    }
+    return this._hasProjectedContent() || (contractWithChildren?.children?.length ?? 0) > 0;
+  });
+
+  readonly computedBadgeClasses = computed(() => {
+    const classes = [
+      'origo-badge',
+      `origo-badge--severity-${this.severity()}`,
+      `origo-badge--size-${this.size()}`,
+      `origo-badge--shape-${this.shape()}`,
+    ];
+    if (this.isDot()) classes.push('origo-badge--dot');
+    if (this.isInteractive()) classes.push('origo-badge--interactive');
+    return classes.join(' ');
+  });
+
+  ngAfterContentChecked() {
+    const wrapper = this.contentWrapper();
+    if (wrapper) {
+      const el = wrapper.nativeElement;
+      let hasChildren = false;
+      for (let i = 0; i < el.childNodes.length; i++) {
+        const node = el.childNodes[i];
+        if (node.nodeType === 1) {
+          // ELEMENT_NODE
+          hasChildren = true;
+          break;
+        } else if (node.nodeType === 3 && (node.textContent?.trim().length ?? 0) > 0) {
+          // TEXT_NODE
+          hasChildren = true;
+          break;
+        }
+      }
+      if (this._hasProjectedContent() !== hasChildren) {
+        this._hasProjectedContent.set(hasChildren);
+      }
+    }
+  }
+
+  onClick(event: MouseEvent) {
+    if (this.isInteractive()) {
+      this.click.emit(event);
+      if (this.contract()?.id) {
+        this.experienceAdapter?.dispatchCapability(this.contract().id, 'click', { event });
+      }
+    }
+  }
+
+  onKeyDown(event: KeyboardEvent) {
+    if (this.isInteractive() && (event.key === 'Enter' || event.key === ' ')) {
+      event.preventDefault();
+      this.onClick(event as unknown as MouseEvent);
+    }
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.html b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.html
new file mode 100644
index 0000000..7f2566f
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.html
@@ -0,0 +1,39 @@
+<div class="origo-block-ui" [class.origo-block-ui--blocked]="isBlocked() && !isFullScreen()">
+  <div
+    class="origo-block-ui__content"
+    [class.origo-block-ui__content--blocked]="isBlocked() && !isFullScreen()"
+  >
+    <ng-container #vc></ng-container>
+    <ng-content></ng-content>
+  </div>
+
+  @if (isBlocked() && !isFullScreen()) {
+    <div class="origo-block-ui__mask" role="presentation" [style.z-index]="computedZIndex()">
+      <div class="origo-block-ui__mask-content" role="status" aria-live="polite">
+        @if (showSpinner()) {
+          <origo-spinner [contract]="spinnerContract()"></origo-spinner>
+        }
+        @if (message()) {
+          <span class="origo-block-ui__message">{{ message() }}</span>
+        }
+      </div>
+    </div>
+  }
+</div>
+
+<ng-template #fullScreenOverlayTemplate>
+  <div
+    class="origo-block-ui__mask origo-block-ui__mask--fullscreen"
+    role="presentation"
+    [style.z-index]="computedZIndex()"
+  >
+    <div class="origo-block-ui__mask-content" role="status" aria-live="polite">
+      @if (showSpinner()) {
+        <origo-spinner [contract]="spinnerContract()"></origo-spinner>
+      }
+      @if (message()) {
+        <span class="origo-block-ui__message">{{ message() }}</span>
+      }
+    </div>
+  </div>
+</ng-template>
diff --git a/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.scss b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.scss
new file mode 100644
index 0000000..130f28f
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.scss
@@ -0,0 +1,76 @@
+:host {
+  display: block;
+  position: relative;
+  inline-size: 100%;
+  box-sizing: border-box;
+}
+
+:host([hidden]) {
+  display: none !important;
+}
+
+.origo-block-ui {
+  position: relative;
+  inline-size: 100%;
+  block-size: 100%;
+  box-sizing: border-box;
+}
+
+.origo-block-ui__content {
+  inline-size: 100%;
+  block-size: 100%;
+  box-sizing: border-box;
+  transition: filter var(--origo-motion-duration-fast, 150ms) ease;
+}
+
+.origo-block-ui__content--blocked {
+  pointer-events: none !important;
+  user-select: none !important;
+  filter: blur(1px);
+}
+
+.origo-block-ui__mask {
+  position: absolute;
+  inset: 0;
+  inline-size: 100%;
+  block-size: 100%;
+  background-color: var(--origo-color-backdrop, rgba(0, 0, 0, 0.45));
+  display: flex;
+  align-items: center;
+  justify-content: center;
+  pointer-events: auto;
+  border-radius: inherit;
+  box-sizing: border-box;
+  transition: opacity var(--origo-motion-duration-fast, 150ms) ease;
+}
+
+.origo-block-ui__mask--fullscreen {
+  position: fixed;
+  inset: 0;
+  inline-size: 100vw;
+  block-size: 100vh;
+}
+
+.origo-block-ui__mask-content {
+  display: flex;
+  flex-direction: column;
+  align-items: center;
+  justify-content: center;
+  gap: var(--origo-space-sm, 0.5rem);
+  color: var(--origo-color-text-inverse, #ffffff);
+}
+
+.origo-block-ui__message {
+  font-size: var(--origo-font-size-sm, 0.875rem);
+  font-weight: var(--origo-font-weight-medium, 500);
+  color: inherit;
+  text-align: center;
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .origo-block-ui__mask,
+  .origo-block-ui__content {
+    transition: none !important;
+    filter: none !important;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts
new file mode 100644
index 0000000..8e02a56
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts
@@ -0,0 +1,151 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { BlockUIComponent, BlockUIProps } from './block-ui.component';
+import { InteractionContract } from '@origostudio/core';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+
+describe('BlockUIComponent', () => {
+  let component: BlockUIComponent;
+  let fixture: ComponentFixture<BlockUIComponent>;
+  let experienceAdapter: WebExperienceAdapterService;
+  let overlayService: OrigoOverlayService;
+
+  function createContract(
+    props: Partial<BlockUIProps> = {},
+    id = 'block-ui-1'
+  ): InteractionContract<BlockUIProps> {
+    return {
+      id,
+      type: 'BlockUI',
+      props,
+    };
+  }
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [BlockUIComponent],
+      providers: [WebExperienceAdapterService, OrigoOverlayService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(BlockUIComponent);
+    component = fixture.componentInstance;
+    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
+    overlayService = TestBed.inject(OrigoOverlayService);
+  });
+
+  afterEach(() => {
+    fixture?.destroy();
+    document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove());
+  });
+
+  it('should create in unblocked state by default', () => {
+    fixture.componentRef.setInput('contract', createContract({ blocked: false }));
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(component.isBlocked()).toBe(false);
+
+    const host = fixture.nativeElement;
+    expect(host.getAttribute('aria-busy')).toBeNull();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const mask = shadowRoot.querySelector('.origo-block-ui__mask');
+    expect(mask).toBeNull();
+  });
+
+  it('should render local blocking mask with message and spinner when blocked is true', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ blocked: true, message: 'Please wait...', spinner: true })
+    );
+    fixture.detectChanges();
+
+    expect(component.isBlocked()).toBe(true);
+
+    const host = fixture.nativeElement;
+    expect(host.getAttribute('aria-busy')).toBe('true');
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const mask = shadowRoot.querySelector('.origo-block-ui__mask');
+    expect(mask).toBeTruthy();
+
+    const content = shadowRoot.querySelector('.origo-block-ui__content');
+    expect(content.classList.contains('origo-block-ui__content--blocked')).toBe(true);
+
+    const messageEl = shadowRoot.querySelector('.origo-block-ui__message');
+    expect(messageEl?.textContent?.trim()).toBe('Please wait...');
+
+    const spinner = shadowRoot.querySelector('origo-spinner');
+    expect(spinner).toBeTruthy();
+  });
+
+  it('should recognize loading prop alias for blocked', () => {
+    fixture.componentRef.setInput('contract', createContract({ loading: true }));
+    fixture.detectChanges();
+
+    expect(component.isBlocked()).toBe(true);
+  });
+
+  it('should omit spinner when spinner: false is configured', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ blocked: true, spinner: false, message: 'Saving...' })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const spinner = shadowRoot.querySelector('origo-spinner');
+    expect(spinner).toBeNull();
+
+    const messageEl = shadowRoot.querySelector('.origo-block-ui__message');
+    expect(messageEl?.textContent?.trim()).toBe('Saving...');
+  });
+
+  it('should emit blockedChange and synchronize state on toggle', () => {
+    const blockedChangeSpy = jest.fn();
+    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    component.blockedChange.subscribe(blockedChangeSpy);
+
+    fixture.componentRef.setInput('contract', createContract({ blocked: false }));
+    fixture.detectChanges();
+
+    fixture.componentRef.setInput('contract', createContract({ blocked: true }));
+    fixture.detectChanges();
+
+    expect(blockedChangeSpy).toHaveBeenCalledWith(true);
+    expect(updateStateSpy).toHaveBeenCalledWith('block-ui-1', 'blocked', true);
+    expect(dispatchSpy).toHaveBeenCalledWith('block-ui-1', 'blockedChange', { blocked: true });
+  });
+
+  it('should trigger OrigoOverlayService in fullScreen mode', () => {
+    const createOverlaySpy = jest.spyOn(overlayService, 'create');
+
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ blocked: true, fullScreen: true, message: 'Processing full screen...' })
+    );
+    fixture.detectChanges();
+
+    expect(component.isFullScreen()).toBe(true);
+    expect(createOverlaySpy).toHaveBeenCalledWith(
+      expect.objectContaining({
+        position: expect.objectContaining({ type: 'global', width: '100vw', height: '100vh' }),
+        panelClass: expect.arrayContaining(['origo-overlay-pane--block-ui']),
+      }),
+      expect.anything()
+    );
+  });
+
+  it('should be safe with undefined or null props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'null-block-ui',
+      type: 'BlockUI',
+      props: undefined as unknown as BlockUIProps,
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(component.isBlocked()).toBe(false);
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.ts b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.ts
new file mode 100644
index 0000000..103d11d
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.ts
@@ -0,0 +1,194 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  computed,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  TemplateRef,
+  DestroyRef,
+  PLATFORM_ID,
+  effect,
+  untracked,
+} from '@angular/core';
+import { CommonModule, isPlatformBrowser } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+import { OrigoOverlayRef } from '../../../lib/overlay/overlay.models';
+import { SpinnerComponent, SpinnerProps } from '../spinner/spinner.component';
+
+export interface BlockUIProps {
+  blocked?: boolean;
+  loading?: boolean;
+  fullScreen?: boolean;
+  message?: string;
+  spinner?: boolean;
+  baseZIndex?: number;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const BlockUIContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  blocked: 'boolean',
+  loading: 'boolean',
+  fullScreen: 'boolean',
+  message: 'string',
+  spinner: 'boolean',
+  baseZIndex: 'number',
+} as const;
+
+@Component({
+  selector: 'origo-block-ui',
+  standalone: true,
+  imports: [CommonModule, SpinnerComponent],
+  templateUrl: './block-ui.component.html',
+  styleUrls: ['./block-ui.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-block-ui-host]': 'true',
+    '[attr.data-testid]': 'contractId()',
+    '[attr.aria-busy]': "isBlocked() ? 'true' : null",
+  },
+})
+export class BlockUIComponent implements OrigoAdapter<BlockUIProps>, ContainerComponent {
+  static readonly contractSchema = BlockUIContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<BlockUIProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+  fullScreenOverlayTemplate = viewChild<TemplateRef<unknown>>('fullScreenOverlayTemplate');
+
+  blockedChange = output<boolean>();
+
+  private overlayRef?: OrigoOverlayRef;
+  private readonly overlayService = inject(OrigoOverlayService);
+  private readonly destroyRef = inject(DestroyRef);
+  private readonly platformId = inject(PLATFORM_ID);
+  private readonly vcr = inject(ViewContainerRef);
+  private readonly experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
+  private lastBlockedState: boolean | null = null;
+
+  readonly contractId = computed(() => {
+    try {
+      return this.contract()?.id ?? '';
+    } catch {
+      return '';
+    }
+  });
+
+  readonly coercedProps = computed(() => {
+    let rawProps: BlockUIProps | undefined;
+    try {
+      rawProps = this.contract()?.props;
+    } catch {
+      rawProps = undefined;
+    }
+    return coerceContractProps<BlockUIProps>(rawProps, BlockUIContractSchema);
+  });
+
+  readonly isBlocked = computed(() => {
+    const p = this.coercedProps();
+    return !!(p.blocked || p.loading);
+  });
+
+  readonly isFullScreen = computed(() => !!this.coercedProps().fullScreen);
+
+  readonly message = computed(() => this.coercedProps().message ?? '');
+
+  readonly showSpinner = computed(() => this.coercedProps().spinner !== false);
+
+  readonly computedZIndex = computed(() => this.coercedProps().baseZIndex ?? 1000);
+
+  readonly spinnerContract = computed<InteractionContract<SpinnerProps>>(() => ({
+    id: `${this.contractId()}-spinner`,
+    type: 'Spinner',
+    props: {
+      label: this.message() || 'Loading...',
+    },
+  }));
+
+  constructor() {
+    this.destroyRef.onDestroy(() => {
+      this.overlayRef?.dispose();
+    });
+
+    effect(() => {
+      const blocked = this.isBlocked();
+      const fullScreen = this.isFullScreen();
+      const contractId = this.contractId();
+
+      if (this.lastBlockedState !== null && this.lastBlockedState !== blocked) {
+        untracked(() => {
+          this.blockedChange.emit(blocked);
+          if (contractId) {
+            this.experienceAdapter?.updateState(contractId, 'blocked', blocked);
+            this.experienceAdapter?.dispatchCapability(contractId, 'blockedChange', { blocked });
+          }
+        });
+      }
+      this.lastBlockedState = blocked;
+
+      if (isPlatformBrowser(this.platformId) && fullScreen) {
+        if (blocked) {
+          if (!this.overlayRef) {
+            untracked(() => this.openFullScreenOverlay());
+          }
+        } else {
+          if (this.overlayRef) {
+            untracked(() => {
+              this.overlayRef?.close();
+              this.overlayRef?.dispose();
+              this.overlayRef = undefined;
+            });
+          }
+        }
+      } else if (!fullScreen && this.overlayRef) {
+        untracked(() => {
+          this.overlayRef?.close();
+          this.overlayRef?.dispose();
+          this.overlayRef = undefined;
+        });
+      }
+    });
+  }
+
+  private openFullScreenOverlay() {
+    const tpl = this.fullScreenOverlayTemplate();
+    if (!tpl) return;
+
+    this.overlayRef = this.overlayService.create(
+      {
+        position: {
+          type: 'global',
+          position: 'center',
+          width: '100vw',
+          height: '100vh',
+        },
+        hasBackdrop: false,
+        panelClass: ['origo-overlay-pane', 'origo-overlay-pane--block-ui'],
+        viewContainerRef: this.vcr,
+      },
+      this.destroyRef
+    );
+
+    this.overlayRef.open(tpl, this.vcr);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.html b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.html
new file mode 100644
index 0000000..ce54417
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.html
@@ -0,0 +1,19 @@
+<div class="origo-progress-bar">
+  @if (computedLabel() || showValue()) {
+    <div class="origo-progress-bar__header">
+      @if (computedLabel()) {
+        <span class="origo-progress-bar__label">{{ computedLabel() }}</span>
+      }
+      @if (showValue()) {
+        <span class="origo-progress-bar__value">{{ formattedValue() }}</span>
+      }
+    </div>
+  }
+  <div class="origo-progress-bar__track">
+    <div
+      class="origo-progress-bar__fill"
+      [class.origo-progress-bar__fill--indeterminate]="mode() === 'indeterminate'"
+      [style.inline-size]="mode() === 'determinate' ? percentage() + '%' : null"
+    ></div>
+  </div>
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.scss b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.scss
new file mode 100644
index 0000000..524d882
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.scss
@@ -0,0 +1,95 @@
+:host {
+  display: block;
+  inline-size: 100%;
+  box-sizing: border-box;
+  --origo-progress-fill-color: var(--origo-color-primary, #2563eb);
+}
+
+:host([hidden]) {
+  display: none !important;
+}
+
+// Severity Mappings
+:host(.origo-progress-bar--severity-primary) {
+  --origo-progress-fill-color: var(--origo-color-primary, #2563eb);
+}
+
+:host(.origo-progress-bar--severity-info) {
+  --origo-progress-fill-color: var(--origo-color-text-info, #1e40af);
+}
+
+:host(.origo-progress-bar--severity-success) {
+  --origo-progress-fill-color: var(--origo-color-text-success, #065f46);
+}
+
+:host(.origo-progress-bar--severity-warn),
+:host(.origo-progress-bar--severity-warning) {
+  --origo-progress-fill-color: var(--origo-color-text-warning, #92400e);
+}
+
+:host(.origo-progress-bar--severity-error) {
+  --origo-progress-fill-color: var(--origo-color-text-danger, #991b1b);
+}
+
+.origo-progress-bar {
+  display: flex;
+  flex-direction: column;
+  gap: var(--origo-space-xs, 0.25rem);
+}
+
+.origo-progress-bar__header {
+  display: flex;
+  justify-content: space-between;
+  align-items: center;
+  font-size: var(--origo-font-size-sm, 0.875rem);
+  color: var(--origo-color-text-secondary, #64748b);
+}
+
+.origo-progress-bar__label {
+  font-weight: var(--origo-font-weight-medium, 500);
+}
+
+.origo-progress-bar__value {
+  font-variant-numeric: tabular-nums;
+}
+
+.origo-progress-bar__track {
+  inline-size: 100%;
+  block-size: var(--origo-progress-height, var(--origo-size-progress-height, 0.5rem));
+  background-color: var(--origo-color-surface-secondary, #e2e8f0);
+  border-radius: var(--origo-radius-full, 9999px);
+  overflow: hidden;
+  position: relative;
+}
+
+.origo-progress-bar__fill {
+  block-size: 100%;
+  border-radius: var(--origo-radius-full, 9999px);
+  background-color: var(--origo-progress-fill-color, var(--origo-color-primary, #2563eb));
+  transition: inline-size var(--origo-motion-duration-normal, 250ms)
+    var(--origo-motion-easing-standard, ease);
+}
+
+.origo-progress-bar__fill--indeterminate {
+  inline-size: 40% !important;
+  position: absolute;
+  inset-block-start: 0;
+  animation: origo-progress-indeterminate 1.5s infinite ease-in-out;
+}
+
+@keyframes origo-progress-indeterminate {
+  0% {
+    inset-inline-start: -40%;
+  }
+  100% {
+    inset-inline-start: 100%;
+  }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .origo-progress-bar__fill {
+    transition: none !important;
+    animation: none !important;
+    opacity: 0.85;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts
new file mode 100644
index 0000000..7d75205
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts
@@ -0,0 +1,141 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { ProgressBarComponent, ProgressBarProps } from './progress-bar.component';
+import { InteractionContract } from '@origostudio/core';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('ProgressBarComponent', () => {
+  let component: ProgressBarComponent;
+  let fixture: ComponentFixture<ProgressBarComponent>;
+  let experienceAdapter: WebExperienceAdapterService;
+
+  function createContract(
+    props: Partial<ProgressBarProps> = {},
+    id = 'progress-1'
+  ): InteractionContract<ProgressBarProps> {
+    return {
+      id,
+      type: 'ProgressBar',
+      props,
+    };
+  }
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [ProgressBarComponent],
+      providers: [WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(ProgressBarComponent);
+    component = fixture.componentInstance;
+    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
+  });
+
+  afterEach(() => {
+    fixture?.destroy();
+  });
+
+  it('should create and render determinate progress with default properties', () => {
+    fixture.componentRef.setInput('contract', createContract({ value: 50 }));
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    expect(shadowRoot).toBeTruthy();
+
+    const host = fixture.nativeElement;
+    expect(host.getAttribute('role')).toBe('progressbar');
+    expect(host.getAttribute('aria-valuenow')).toBe('50');
+    expect(host.getAttribute('aria-valuemin')).toBe('0');
+    expect(host.getAttribute('aria-valuemax')).toBe('100');
+
+    expect(component.percentage()).toBe(50);
+    const fill = shadowRoot.querySelector('.origo-progress-bar__fill') as HTMLElement;
+    expect(fill).toBeTruthy();
+    expect(fill.style.inlineSize).toBe('50%');
+  });
+
+  it('should safely fallback to safeMax 100 when max is 0 or negative', () => {
+    fixture.componentRef.setInput('contract', createContract({ value: 40, max: 0 }));
+    fixture.detectChanges();
+
+    expect(component.safeMax()).toBe(100);
+    expect(component.percentage()).toBe(40);
+  });
+
+  it('should clamp value within 0 and safeMax', () => {
+    fixture.componentRef.setInput('contract', createContract({ value: -10, max: 100 }));
+    fixture.detectChanges();
+    expect(component.clampedValue()).toBe(0);
+
+    fixture.componentRef.setInput('contract', createContract({ value: 150, max: 100 }));
+    fixture.detectChanges();
+    expect(component.clampedValue()).toBe(100);
+  });
+
+  it('should support indeterminate mode omitting aria-valuenow and hiding numeric text', () => {
+    fixture.componentRef.setInput('contract', createContract({ mode: 'indeterminate' }));
+    fixture.detectChanges();
+
+    const host = fixture.nativeElement;
+    expect(host.getAttribute('role')).toBe('progressbar');
+    expect(host.getAttribute('aria-valuenow')).toBeNull();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const valueText = shadowRoot.querySelector('.origo-progress-bar__value');
+    expect(valueText).toBeNull();
+
+    const fill = shadowRoot.querySelector('.origo-progress-bar__fill');
+    expect(fill.classList.contains('origo-progress-bar__fill--indeterminate')).toBe(true);
+  });
+
+  it('should display label and formatted percentage when showValue is true', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ value: 75, label: 'Uploading file', showValue: true })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const labelEl = shadowRoot.querySelector('.origo-progress-bar__label');
+    expect(labelEl?.textContent?.trim()).toBe('Uploading file');
+
+    const valueEl = shadowRoot.querySelector('.origo-progress-bar__value');
+    expect(valueEl?.textContent?.trim()).toBe('75%');
+  });
+
+  it('should emit complete and dispatch capability once when crossing completion boundary, guarded against mount re-emission', () => {
+    // Initial mount at 100 should NOT emit complete
+    const completeSpy = jest.fn();
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    component.complete.subscribe(completeSpy);
+
+    fixture.componentRef.setInput('contract', createContract({ value: 100, max: 100 }));
+    fixture.detectChanges();
+
+    expect(completeSpy).not.toHaveBeenCalled();
+
+    // Reset to 80
+    fixture.componentRef.setInput('contract', createContract({ value: 80, max: 100 }));
+    fixture.detectChanges();
+    expect(completeSpy).not.toHaveBeenCalled();
+
+    // Now transition from 80 to 100 -> should fire once
+    fixture.componentRef.setInput('contract', createContract({ value: 100, max: 100 }));
+    fixture.detectChanges();
+    expect(completeSpy).toHaveBeenCalledTimes(1);
+    expect(dispatchSpy).toHaveBeenCalledWith('progress-1', 'complete', { value: 100, max: 100 });
+
+    // Subsequent change at 100 should not re-trigger
+    fixture.componentRef.setInput('contract', createContract({ value: 100, max: 100 }));
+    fixture.detectChanges();
+    expect(completeSpy).toHaveBeenCalledTimes(1);
+  });
+
+  it('should support custom severity classes', () => {
+    fixture.componentRef.setInput('contract', createContract({ value: 30, severity: 'success' }));
+    fixture.detectChanges();
+
+    const host = fixture.nativeElement;
+    expect(host.classList.contains('origo-progress-bar--severity-success')).toBe(true);
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts
new file mode 100644
index 0000000..6b03b53
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts
@@ -0,0 +1,180 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  computed,
+  inject,
+  effect,
+  untracked,
+} from '@angular/core';
+import { CommonModule } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface ProgressBarProps {
+  value?: number;
+  mode?: 'determinate' | 'indeterminate';
+  showValue?: boolean;
+  max?: number;
+  label?: string;
+  unit?: string;
+  severity?: 'primary' | 'info' | 'success' | 'warn' | 'warning' | 'error' | string;
+  height?: string;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const ProgressBarContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  value: 'number',
+  mode: 'string',
+  showValue: 'boolean',
+  max: 'number',
+  label: 'string',
+  unit: 'string',
+  severity: 'string',
+  height: 'string',
+} as const;
+
+@Component({
+  selector: 'origo-progress-bar',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './progress-bar.component.html',
+  styleUrls: ['./progress-bar.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-progress-bar-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+    role: 'progressbar',
+    '[attr.aria-valuenow]': "mode() === 'determinate' ? clampedValue() : null",
+    '[attr.aria-valuemin]': "'0'",
+    '[attr.aria-valuemax]': "mode() === 'determinate' ? safeMax() : null",
+    '[attr.aria-label]': "computedLabel() || 'Progress'",
+    '[attr.aria-describedby]': 'ariaDescribedBy()',
+    '[class]': 'computedSeverityClass()',
+    '[style.--origo-progress-height]': 'computedHeight()',
+  },
+})
+export class ProgressBarComponent implements OrigoAdapter<ProgressBarProps> {
+  static readonly contractSchema = ProgressBarContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<ProgressBarProps>>();
+
+  complete = output<void>();
+  valueChange = output<number>();
+
+  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
+  private hasCompleted = false;
+  private isMounted = false;
+  private lastReportedValue: number | null = null;
+
+  readonly coercedProps = computed(() =>
+    coerceContractProps<ProgressBarProps>(this.contract()?.props, ProgressBarContractSchema)
+  );
+
+  readonly mode = computed(() => {
+    return this.coercedProps().mode === 'indeterminate' ? 'indeterminate' : 'determinate';
+  });
+
+  readonly safeMax = computed(() => {
+    const m = this.coercedProps().max;
+    return m !== undefined && m !== null && Number(m) > 0 ? Number(m) : 100;
+  });
+
+  readonly clampedValue = computed(() => {
+    const v = this.coercedProps().value;
+    const num = v !== undefined && v !== null ? Number(v) : 0;
+    return Math.min(Math.max(isNaN(num) ? 0 : num, 0), this.safeMax());
+  });
+
+  readonly percentage = computed(() => {
+    return (this.clampedValue() / this.safeMax()) * 100;
+  });
+
+  readonly showValue = computed(() => {
+    if (this.mode() === 'indeterminate') return false;
+    return this.coercedProps().showValue ?? true;
+  });
+
+  readonly computedLabel = computed(() => {
+    return this.coercedProps().label ?? this.coercedProps()['aria-label'];
+  });
+
+  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
+
+  readonly unit = computed(() => this.coercedProps().unit ?? '%');
+
+  readonly formattedValue = computed(() => {
+    return `${Math.round(this.percentage())}${this.unit()}`;
+  });
+
+  readonly computedHeight = computed(() => {
+    return this.coercedProps().height;
+  });
+
+  readonly computedSeverityClass = computed(() => {
+    const s = this.coercedProps().severity?.toLowerCase() || 'primary';
+    const normalized = s === 'warn' || s === 'warning' ? 'warning' : s;
+    return `origo-progress-bar--severity-${normalized}`;
+  });
+
+  constructor() {
+    effect(() => {
+      const val = this.clampedValue();
+      const max = this.safeMax();
+      const currentMode = this.mode();
+      const contractId = this.contract()?.id;
+
+      if (!this.isMounted) {
+        // First run on mount: initialize completion state without emitting
+        this.isMounted = true;
+        this.lastReportedValue = val;
+        if (currentMode === 'determinate' && val >= max && max > 0) {
+          this.hasCompleted = true;
+        }
+        return;
+      }
+
+      // Subsequent changes
+      if (this.lastReportedValue !== val) {
+        this.lastReportedValue = val;
+        untracked(() => {
+          this.valueChange.emit(val);
+          if (contractId) {
+            this.experienceAdapter?.updateState(contractId, 'value', val);
+          }
+        });
+      }
+
+      if (currentMode === 'determinate' && val >= max && max > 0) {
+        if (!this.hasCompleted) {
+          this.hasCompleted = true;
+          untracked(() => {
+            this.complete.emit();
+            if (contractId) {
+              this.experienceAdapter?.dispatchCapability(contractId, 'complete', {
+                value: val,
+                max,
+              });
+            }
+          });
+        }
+      } else if (val < max) {
+        this.hasCompleted = false;
+      }
+    });
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.html b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.html
new file mode 100644
index 0000000..1501741
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.html
@@ -0,0 +1,7 @@
+<div
+  class="origo-skeleton"
+  [class.origo-skeleton--circle]="shape() === 'circle'"
+  [class.origo-skeleton--rectangle]="shape() === 'rectangle'"
+  [class]="'origo-skeleton--animation-' + animation()"
+  [style.border-radius]="computedBorderRadius()"
+></div>
diff --git a/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.scss b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.scss
new file mode 100644
index 0000000..82f5605
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.scss
@@ -0,0 +1,76 @@
+:host {
+  display: inline-block;
+  vertical-align: middle;
+  box-sizing: border-box;
+}
+
+:host([hidden]) {
+  display: none !important;
+}
+
+.origo-skeleton {
+  inline-size: 100%;
+  block-size: 100%;
+  background-color: var(--origo-color-surface-subtle, #f1f5f9);
+  position: relative;
+  overflow: hidden;
+  box-sizing: border-box;
+}
+
+.origo-skeleton--circle {
+  border-radius: 50% !important;
+}
+
+// Shimmer Animation
+.origo-skeleton--animation-shimmer::after {
+  content: '';
+  position: absolute;
+  inset-block: 0;
+  inset-inline-start: -100%;
+  inline-size: 100%;
+  background: linear-gradient(
+    90deg,
+    transparent 0%,
+    var(--origo-color-surface-hover, rgba(255, 255, 255, 0.6)) 50%,
+    transparent 100%
+  );
+  animation: origo-skeleton-shimmer 1.5s infinite;
+}
+
+// Pulse Animation
+.origo-skeleton--animation-pulse {
+  animation: origo-skeleton-pulse 1.5s ease-in-out infinite;
+}
+
+// None Animation
+.origo-skeleton--animation-none {
+  animation: none !important;
+}
+
+@keyframes origo-skeleton-shimmer {
+  0% {
+    inset-inline-start: -100%;
+  }
+  100% {
+    inset-inline-start: 100%;
+  }
+}
+
+@keyframes origo-skeleton-pulse {
+  0%,
+  100% {
+    opacity: 1;
+  }
+  50% {
+    opacity: 0.4;
+  }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .origo-skeleton,
+  .origo-skeleton--animation-shimmer::after,
+  .origo-skeleton--animation-pulse {
+    animation: none !important;
+    opacity: 1;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts
new file mode 100644
index 0000000..6dabd4c
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts
@@ -0,0 +1,127 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { SkeletonComponent, SkeletonProps } from './skeleton.component';
+import { InteractionContract } from '@origostudio/core';
+
+describe('SkeletonComponent', () => {
+  let component: SkeletonComponent;
+  let fixture: ComponentFixture<SkeletonComponent>;
+
+  function createContract(
+    props: Partial<SkeletonProps> = {},
+    id = 'skeleton-1'
+  ): InteractionContract<SkeletonProps> {
+    return {
+      id,
+      type: 'Skeleton',
+      props,
+    };
+  }
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [SkeletonComponent],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(SkeletonComponent);
+    component = fixture.componentInstance;
+  });
+
+  afterEach(() => {
+    fixture?.destroy();
+  });
+
+  it('should create and render with default rectangle shape and shimmer animation', () => {
+    fixture.componentRef.setInput('contract', createContract());
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    expect(shadowRoot).toBeTruthy();
+
+    const host = fixture.nativeElement;
+    expect(host.getAttribute('data-testid')).toBe('skeleton-1');
+    expect(host.getAttribute('aria-hidden')).toBe('true');
+
+    expect(component.shape()).toBe('rectangle');
+    expect(component.computedWidth()).toBe('100%');
+    expect(component.computedHeight()).toBe('1rem');
+    expect(component.animation()).toBe('shimmer');
+
+    const skeletonEl = shadowRoot.querySelector('.origo-skeleton');
+    expect(skeletonEl).toBeTruthy();
+    expect(skeletonEl.classList.contains('origo-skeleton--rectangle')).toBe(true);
+    expect(skeletonEl.classList.contains('origo-skeleton--animation-shimmer')).toBe(true);
+  });
+
+  it('should render circle shape with 50% border radius and 2.5rem default dimension', () => {
+    fixture.componentRef.setInput('contract', createContract({ shape: 'circle' }));
+    fixture.detectChanges();
+
+    expect(component.shape()).toBe('circle');
+    expect(component.computedWidth()).toBe('2.5rem');
+    expect(component.computedHeight()).toBe('2.5rem');
+    expect(component.computedBorderRadius()).toBe('50%');
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const skeletonEl = shadowRoot.querySelector('.origo-skeleton');
+    expect(skeletonEl.classList.contains('origo-skeleton--circle')).toBe(true);
+  });
+
+  it('should allow size property to override width and height', () => {
+    fixture.componentRef.setInput('contract', createContract({ size: '4rem' }));
+    fixture.detectChanges();
+
+    expect(component.computedWidth()).toBe('4rem');
+    expect(component.computedHeight()).toBe('4rem');
+  });
+
+  it('should allow custom width, height, and borderRadius', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ width: '200px', height: '30px', borderRadius: '8px' })
+    );
+    fixture.detectChanges();
+
+    expect(component.computedWidth()).toBe('200px');
+    expect(component.computedHeight()).toBe('30px');
+    expect(component.computedBorderRadius()).toBe('8px');
+  });
+
+  it('should support pulse and none animation modes', () => {
+    fixture.componentRef.setInput('contract', createContract({ animation: 'pulse' }));
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const skeletonEl = shadowRoot.querySelector('.origo-skeleton');
+    expect(skeletonEl.classList.contains('origo-skeleton--animation-pulse')).toBe(true);
+
+    fixture.componentRef.setInput('contract', createContract({ animation: 'none' }));
+    fixture.detectChanges();
+    expect(skeletonEl.classList.contains('origo-skeleton--animation-none')).toBe(true);
+  });
+
+  it('should support aria-label override rendering role status instead of aria-hidden', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ 'aria-label': 'Loading profile card' })
+    );
+    fixture.detectChanges();
+
+    const host = fixture.nativeElement;
+    expect(host.getAttribute('role')).toBe('status');
+    expect(host.getAttribute('aria-label')).toBe('Loading profile card');
+    expect(host.getAttribute('aria-hidden')).toBeNull();
+  });
+
+  it('should be safe with undefined or null contract props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'null-skeleton',
+      type: 'Skeleton',
+      props: undefined as unknown as SkeletonProps,
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(component.computedWidth()).toBe('100%');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.ts b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.ts
new file mode 100644
index 0000000..1198699
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.ts
@@ -0,0 +1,104 @@
+import {
+  Component,
+  input,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  computed,
+} from '@angular/core';
+import { CommonModule } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+
+export interface SkeletonProps {
+  shape?: 'rectangle' | 'circle';
+  width?: string;
+  height?: string;
+  size?: string;
+  borderRadius?: string;
+  animation?: 'shimmer' | 'pulse' | 'none';
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const SkeletonContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  shape: 'string',
+  width: 'string',
+  height: 'string',
+  size: 'string',
+  borderRadius: 'string',
+  animation: 'string',
+} as const;
+
+@Component({
+  selector: 'origo-skeleton',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './skeleton.component.html',
+  styleUrls: ['./skeleton.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-skeleton-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
+    '[attr.role]': "ariaLabel() ? 'status' : null",
+    '[attr.aria-label]': 'ariaLabel()',
+    '[attr.aria-describedby]': 'ariaDescribedBy()',
+    '[style.inline-size]': 'computedWidth()',
+    '[style.block-size]': 'computedHeight()',
+  },
+})
+export class SkeletonComponent implements OrigoAdapter<SkeletonProps> {
+  static readonly contractSchema = SkeletonContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<SkeletonProps>>();
+
+  readonly coercedProps = computed(() =>
+    coerceContractProps<SkeletonProps>(this.contract()?.props, SkeletonContractSchema)
+  );
+
+  readonly shape = computed(() => {
+    return this.coercedProps().shape === 'circle' ? 'circle' : 'rectangle';
+  });
+
+  readonly computedWidth = computed(() => {
+    const props = this.coercedProps();
+    if (props.size && props.size.trim()) return props.size;
+    if (this.shape() === 'circle') return props.width || '2.5rem';
+    return props.width || '100%';
+  });
+
+  readonly computedHeight = computed(() => {
+    const props = this.coercedProps();
+    if (props.size && props.size.trim()) return props.size;
+    if (this.shape() === 'circle') return props.height || '2.5rem';
+    return props.height || '1rem';
+  });
+
+  readonly computedBorderRadius = computed(() => {
+    const props = this.coercedProps();
+    if (props.borderRadius && props.borderRadius.trim()) return props.borderRadius;
+    if (this.shape() === 'circle') return '50%';
+    return 'var(--origo-radius-md, 0.375rem)';
+  });
+
+  readonly animation = computed(() => {
+    const anim = this.coercedProps().animation;
+    if (anim === 'pulse') return 'pulse';
+    if (anim === 'none') return 'none';
+    return 'shimmer';
+  });
+
+  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);
+
+  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
+}
diff --git a/packages/angular-renderer/src/components/primitives/spinner/spinner.component.html b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.html
new file mode 100644
index 0000000..5cdf9a0
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.html
@@ -0,0 +1,11 @@
+<svg class="origo-spinner__svg" viewBox="0 0 50 50" aria-hidden="true" focusable="false">
+  <circle
+    class="origo-spinner__circle"
+    cx="25"
+    cy="25"
+    r="20"
+    [attr.fill]="computedFill()"
+    [attr.stroke-width]="computedStrokeWidth()"
+  ></circle>
+</svg>
+<span class="sr-only">{{ computedLabel() }}</span>
diff --git a/packages/angular-renderer/src/components/primitives/spinner/spinner.component.scss b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.scss
new file mode 100644
index 0000000..2807762
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.scss
@@ -0,0 +1,108 @@
+:host {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  vertical-align: middle;
+  box-sizing: border-box;
+  inline-size: var(--origo-spinner-size, 2rem);
+  block-size: var(--origo-spinner-size, 2rem);
+  --origo-spinner-color: var(--origo-color-primary, #2563eb);
+}
+
+:host([hidden]) {
+  display: none !important;
+}
+
+:host(.origo-spinner--fluid) {
+  inline-size: 100%;
+  block-size: 100%;
+}
+
+// Semantic Variant Color Mappings
+:host(.origo-spinner--variant-primary) {
+  --origo-spinner-color: var(--origo-color-primary, #2563eb);
+}
+
+:host(.origo-spinner--variant-secondary) {
+  --origo-spinner-color: var(--origo-color-text-secondary, #64748b);
+}
+
+:host(.origo-spinner--variant-accent),
+:host(.origo-spinner--variant-info) {
+  --origo-spinner-color: var(--origo-color-text-info, #1e40af);
+}
+
+:host(.origo-spinner--variant-success) {
+  --origo-spinner-color: var(--origo-color-text-success, #065f46);
+}
+
+:host(.origo-spinner--variant-warn),
+:host(.origo-spinner--variant-warning) {
+  --origo-spinner-color: var(--origo-color-text-warning, #92400e);
+}
+
+:host(.origo-spinner--variant-error) {
+  --origo-spinner-color: var(--origo-color-text-danger, #991b1b);
+}
+
+:host(.origo-spinner--variant-contrast) {
+  --origo-spinner-color: var(--origo-color-text-inverse, #ffffff);
+}
+
+.origo-spinner__svg {
+  display: block;
+  inline-size: 100%;
+  block-size: 100%;
+  animation: origo-spinner-rotate var(--origo-spinner-duration, 1s) linear infinite;
+}
+
+.origo-spinner__circle {
+  stroke: var(--origo-spinner-color, var(--origo-color-primary, #2563eb));
+  stroke-linecap: round;
+  stroke-dasharray: 90, 150;
+  stroke-dashoffset: 0;
+  animation: origo-spinner-dash 1.5s ease-in-out infinite;
+}
+
+.sr-only {
+  position: absolute;
+  inline-size: 1px;
+  block-size: 1px;
+  padding-inline: 0;
+  padding-block: 0;
+  margin-inline: -1px;
+  margin-block: -1px;
+  overflow: hidden;
+  clip: rect(0, 0, 0, 0);
+  white-space: nowrap;
+  border-width: 0;
+}
+
+@keyframes origo-spinner-rotate {
+  100% {
+    transform: rotate(360deg);
+  }
+}
+
+@keyframes origo-spinner-dash {
+  0% {
+    stroke-dasharray: 1, 200;
+    stroke-dashoffset: 0;
+  }
+  50% {
+    stroke-dasharray: 90, 150;
+    stroke-dashoffset: -35px;
+  }
+  100% {
+    stroke-dasharray: 90, 150;
+    stroke-dashoffset: -125px;
+  }
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .origo-spinner__svg,
+  .origo-spinner__circle {
+    animation: none !important;
+    opacity: 0.8;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts
new file mode 100644
index 0000000..68318e3
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts
@@ -0,0 +1,119 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { SpinnerComponent } from './spinner.component';
+import { InteractionContract } from '@origostudio/core';
+import { SpinnerProps } from './spinner.component';
+
+describe('SpinnerComponent', () => {
+  let component: SpinnerComponent;
+  let fixture: ComponentFixture<SpinnerComponent>;
+
+  function createContract(
+    props: Partial<SpinnerProps> = {},
+    id = 'spinner-1'
+  ): InteractionContract<SpinnerProps> {
+    return {
+      id,
+      type: 'Spinner',
+      props,
+    };
+  }
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [SpinnerComponent],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(SpinnerComponent);
+    component = fixture.componentInstance;
+  });
+
+  afterEach(() => {
+    fixture?.destroy();
+  });
+
+  it('should create and render with default properties', () => {
+    fixture.componentRef.setInput('contract', createContract());
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    expect(shadowRoot).toBeTruthy();
+
+    const svg = shadowRoot.querySelector('svg');
+    expect(svg).toBeTruthy();
+    expect(svg.getAttribute('aria-hidden')).toBe('true');
+
+    const srOnly = shadowRoot.querySelector('.sr-only');
+    expect(srOnly).toBeTruthy();
+    expect(srOnly.textContent?.trim()).toBe('Loading...');
+
+    // Host ARIA
+    const hostEl = fixture.nativeElement;
+    expect(hostEl.getAttribute('role')).toBe('status');
+    expect(hostEl.getAttribute('aria-live')).toBe('polite');
+    expect(hostEl.getAttribute('data-testid')).toBe('spinner-1');
+  });
+
+  it('should support size variations: small, medium, large, and custom dimensions', () => {
+    fixture.componentRef.setInput('contract', createContract({ size: 'small' }));
+    fixture.detectChanges();
+    expect(component.computedSize()).toBe('1rem');
+
+    fixture.componentRef.setInput('contract', createContract({ size: 'large' }));
+    fixture.detectChanges();
+    expect(component.computedSize()).toBe('3rem');
+
+    fixture.componentRef.setInput('contract', createContract({ size: '24px' }));
+    fixture.detectChanges();
+    expect(component.computedSize()).toBe('24px');
+  });
+
+  it('should support custom strokeWidth and fill', () => {
+    fixture.componentRef.setInput('contract', createContract({ strokeWidth: 6, fill: '#f0f0f0' }));
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const circle = shadowRoot.querySelector('circle');
+    expect(circle.getAttribute('stroke-width')).toBe('6');
+    expect(circle.getAttribute('fill')).toBe('#f0f0f0');
+  });
+
+  it('should support custom label and update screen reader text', () => {
+    fixture.componentRef.setInput('contract', createContract({ label: 'Fetching data...' }));
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const srOnly = shadowRoot.querySelector('.sr-only');
+    expect(srOnly.textContent?.trim()).toBe('Fetching data...');
+  });
+
+  it('should apply color variants (primary, secondary, success, warn, error, contrast)', () => {
+    fixture.componentRef.setInput('contract', createContract({ variant: 'success' }));
+    fixture.detectChanges();
+
+    expect(component.computedVariantClass()).toBe('origo-spinner--variant-success');
+    const host = fixture.nativeElement;
+    expect(host.classList.contains('origo-spinner--variant-success')).toBe(true);
+  });
+
+  it('should handle fluid layout adaptation', () => {
+    fixture.componentRef.setInput('contract', createContract({ fluid: true }));
+    fixture.detectChanges();
+
+    expect(component.isFluid()).toBe(true);
+    const host = fixture.nativeElement;
+    expect(host.classList.contains('origo-spinner--fluid')).toBe(true);
+  });
+
+  it('should be safe with empty or null contract props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'null-props-spinner',
+      type: 'Spinner',
+      props: undefined as unknown as SpinnerProps,
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(component.computedLabel()).toBe('Loading...');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/spinner/spinner.component.ts b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.ts
new file mode 100644
index 0000000..07bae1e
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/spinner/spinner.component.ts
@@ -0,0 +1,123 @@
+import {
+  Component,
+  input,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  computed,
+} from '@angular/core';
+import { CommonModule } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+
+export interface SpinnerProps {
+  size?: 'small' | 'medium' | 'large' | string;
+  strokeWidth?: number | string;
+  label?: string;
+  variant?:
+    | 'primary'
+    | 'secondary'
+    | 'accent'
+    | 'contrast'
+    | 'success'
+    | 'warn'
+    | 'warning'
+    | 'error'
+    | string;
+  animationDuration?: string;
+  fill?: string;
+  fluid?: boolean;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const SpinnerContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  size: 'string',
+  strokeWidth: 'number',
+  label: 'string',
+  variant: 'string',
+  animationDuration: 'string',
+  fill: 'string',
+  fluid: 'boolean',
+} as const;
+
+@Component({
+  selector: 'origo-spinner',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './spinner.component.html',
+  styleUrls: ['./spinner.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-spinner-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+    role: 'status',
+    'aria-live': 'polite',
+    '[attr.aria-label]': 'computedLabel()',
+    '[attr.aria-describedby]': 'ariaDescribedBy()',
+    '[class.origo-spinner--fluid]': 'isFluid()',
+    '[class]': 'computedVariantClass()',
+    '[style.--origo-spinner-size]': 'computedSize()',
+    '[style.--origo-spinner-duration]': 'computedDuration()',
+  },
+})
+export class SpinnerComponent implements OrigoAdapter<SpinnerProps> {
+  static readonly contractSchema = SpinnerContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<SpinnerProps>>();
+
+  readonly coercedProps = computed(() =>
+    coerceContractProps<SpinnerProps>(this.contract()?.props, SpinnerContractSchema)
+  );
+
+  readonly computedSize = computed(() => {
+    const s = this.coercedProps().size;
+    if (s === 'small') return '1rem';
+    if (s === 'large') return '3rem';
+    if (s === 'medium') return '2rem';
+    if (typeof s === 'string' && s.trim()) return s;
+    return '2rem';
+  });
+
+  readonly computedStrokeWidth = computed(() => {
+    const sw = this.coercedProps().strokeWidth;
+    if (sw !== undefined && sw !== null && !isNaN(Number(sw))) {
+      return Number(sw);
+    }
+    return 4;
+  });
+
+  readonly computedLabel = computed(() => {
+    const label = this.coercedProps().label ?? this.coercedProps()['aria-label'];
+    return label && label.trim() ? label : 'Loading...';
+  });
+
+  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
+
+  readonly computedDuration = computed(() => {
+    return this.coercedProps().animationDuration || '1s';
+  });
+
+  readonly computedFill = computed(() => {
+    return this.coercedProps().fill || 'none';
+  });
+
+  readonly isFluid = computed(() => {
+    return this.coercedProps().fluid === true;
+  });
+
+  readonly computedVariantClass = computed(() => {
+    const v = this.coercedProps().variant?.toLowerCase() || 'primary';
+    const normalized = v === 'warn' || v === 'warning' ? 'warning' : v;
+    return `origo-spinner--variant-${normalized}`;
+  });
+}
diff --git a/packages/angular-renderer/src/components/primitives/tag/tag.component.html b/packages/angular-renderer/src/components/primitives/tag/tag.component.html
new file mode 100644
index 0000000..d0f76b4
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tag/tag.component.html
@@ -0,0 +1,36 @@
+@if (isVisible()) {
+  <span
+    [class]="computedTagClasses()"
+    [attr.role]="isInteractive() ? 'button' : 'status'"
+    [attr.tabindex]="isInteractive() ? 0 : null"
+    [attr.aria-label]="ariaLabel() || displayValue()"
+    [attr.aria-describedby]="ariaDescribedBy()"
+    (click)="onClick($event)"
+    (keydown)="onTagKeyDown($event)"
+  >
+    @if (icon()) {
+      <i class="origo-tag__icon" [class]="icon()" aria-hidden="true"></i>
+    }
+    <span class="origo-tag__value">{{ displayValue() }}</span>
+    @if (isRemovable()) {
+      <button
+        type="button"
+        class="origo-tag__remove-btn"
+        aria-label="Remove tag"
+        (click)="onRemove($event)"
+        (keydown)="onRemoveKeyDown($event)"
+      >
+        <svg
+          class="origo-tag__remove-icon"
+          viewBox="0 0 16 16"
+          fill="currentColor"
+          aria-hidden="true"
+        >
+          <path
+            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
+          />
+        </svg>
+      </button>
+    }
+  </span>
+}
diff --git a/packages/angular-renderer/src/components/primitives/tag/tag.component.scss b/packages/angular-renderer/src/components/primitives/tag/tag.component.scss
new file mode 100644
index 0000000..fd72202
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tag/tag.component.scss
@@ -0,0 +1,186 @@
+:host {
+  display: inline-flex;
+  vertical-align: middle;
+  box-sizing: border-box;
+}
+
+:host([hidden]),
+:host(.origo-tag-host--hidden) {
+  display: none !important;
+}
+
+.origo-tag {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  gap: var(--origo-space-xs, 0.25rem);
+  padding-inline: var(--origo-space-sm, 0.5rem);
+  padding-block: var(--origo-space-2xs, 0.125rem);
+  border-radius: var(--origo-radius-sm, 0.25rem);
+  font-size: var(--origo-font-size-xs, 0.75rem);
+  font-weight: var(--origo-font-weight-medium, 500);
+  line-height: 1.25;
+  user-select: none;
+  box-sizing: border-box;
+  border-width: 1px;
+  border-style: solid;
+  border-color: transparent;
+  transition:
+    background-color var(--origo-motion-duration-fast, 150ms) ease,
+    color var(--origo-motion-duration-fast, 150ms) ease,
+    border-color var(--origo-motion-duration-fast, 150ms) ease;
+}
+
+.origo-tag--rounded {
+  border-radius: var(--origo-radius-full, 9999px) !important;
+}
+
+.origo-tag--interactive {
+  cursor: pointer;
+
+  &:hover {
+    filter: brightness(0.95);
+  }
+
+  &:focus-visible {
+    outline: var(--origo-border-width-focus, 2px) solid var(--origo-color-primary, #2563eb);
+    outline-offset: 2px;
+  }
+}
+
+.origo-tag__icon {
+  font-size: 0.875em;
+  display: inline-block;
+}
+
+.origo-tag__remove-btn {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  background: transparent;
+  border: none;
+  padding-inline: 0;
+  padding-block: 0;
+  margin-inline-start: var(--origo-space-2xs, 0.125rem);
+  cursor: pointer;
+  color: inherit;
+  opacity: 0.7;
+  border-radius: 50%;
+  inline-size: 1rem;
+  block-size: 1rem;
+  transition:
+    opacity var(--origo-motion-duration-fast, 150ms) ease,
+    background-color var(--origo-motion-duration-fast, 150ms) ease;
+
+  &:hover {
+    opacity: 1;
+    background-color: rgba(0, 0, 0, 0.1);
+  }
+
+  &:focus-visible {
+    outline: 1px solid currentColor;
+    outline-offset: 1px;
+    opacity: 1;
+  }
+}
+
+.origo-tag__remove-icon {
+  inline-size: 0.75rem;
+  block-size: 0.75rem;
+  display: block;
+}
+
+// Filled Severity Styles
+.origo-tag--variant-filled.origo-tag--severity-primary {
+  background-color: var(--origo-color-primary, #2563eb);
+  color: var(--origo-color-text-inverse, #ffffff);
+  border-color: var(--origo-color-primary, #2563eb);
+}
+
+.origo-tag--variant-filled.origo-tag--severity-secondary {
+  background-color: var(--origo-color-surface-secondary, #e2e8f0);
+  color: var(--origo-color-text-secondary, #64748b);
+  border-color: var(--origo-color-border-subtle, #cbd5e1);
+}
+
+.origo-tag--variant-filled.origo-tag--severity-info {
+  background-color: var(--origo-color-surface-subtle, #eff6ff);
+  color: var(--origo-color-text-info, #1e40af);
+  border-color: var(--origo-color-border-info, #bfdbfe);
+}
+
+.origo-tag--variant-filled.origo-tag--severity-success {
+  background-color: var(--origo-color-surface-success, #ecfdf5);
+  color: var(--origo-color-text-success, #065f46);
+  border-color: var(--origo-color-border-success, #a7f3d0);
+}
+
+.origo-tag--variant-filled.origo-tag--severity-warn,
+.origo-tag--variant-filled.origo-tag--severity-warning {
+  background-color: var(--origo-color-surface-warning, #fffbeb);
+  color: var(--origo-color-text-warning, #92400e);
+  border-color: var(--origo-color-border-warning, #fde68a);
+}
+
+.origo-tag--variant-filled.origo-tag--severity-error {
+  background-color: var(--origo-color-surface-danger, #fef2f2);
+  color: var(--origo-color-text-danger, #991b1b);
+  border-color: var(--origo-color-border-danger, #fecaca);
+}
+
+.origo-tag--variant-filled.origo-tag--severity-contrast {
+  background-color: var(--origo-color-surface-inverse, #0f172a);
+  color: var(--origo-color-text-inverse, #ffffff);
+  border-color: var(--origo-color-surface-inverse, #0f172a);
+}
+
+// Outlined Severity Styles
+.origo-tag--variant-outlined.origo-tag--severity-primary {
+  background-color: transparent;
+  color: var(--origo-color-primary, #2563eb);
+  border-color: var(--origo-color-primary, #2563eb);
+}
+
+.origo-tag--variant-outlined.origo-tag--severity-secondary {
+  background-color: transparent;
+  color: var(--origo-color-text-secondary, #64748b);
+  border-color: var(--origo-color-border-subtle, #cbd5e1);
+}
+
+.origo-tag--variant-outlined.origo-tag--severity-info {
+  background-color: transparent;
+  color: var(--origo-color-text-info, #1e40af);
+  border-color: var(--origo-color-border-info, #bfdbfe);
+}
+
+.origo-tag--variant-outlined.origo-tag--severity-success {
+  background-color: transparent;
+  color: var(--origo-color-text-success, #065f46);
+  border-color: var(--origo-color-border-success, #a7f3d0);
+}
+
+.origo-tag--variant-outlined.origo-tag--severity-warn,
+.origo-tag--variant-outlined.origo-tag--severity-warning {
+  background-color: transparent;
+  color: var(--origo-color-text-warning, #92400e);
+  border-color: var(--origo-color-border-warning, #fde68a);
+}
+
+.origo-tag--variant-outlined.origo-tag--severity-error {
+  background-color: transparent;
+  color: var(--origo-color-text-danger, #991b1b);
+  border-color: var(--origo-color-border-danger, #fecaca);
+}
+
+.origo-tag--variant-outlined.origo-tag--severity-contrast {
+  background-color: transparent;
+  color: var(--origo-color-surface-inverse, #0f172a);
+  border-color: var(--origo-color-surface-inverse, #0f172a);
+}
+
+@media (prefers-reduced-motion: reduce) {
+  .origo-tag,
+  .origo-tag__remove-btn {
+    transition: none !important;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts b/packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts
new file mode 100644
index 0000000..bc5ffee
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts
@@ -0,0 +1,156 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { TagComponent, TagProps } from './tag.component';
+import { InteractionContract } from '@origostudio/core';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('TagComponent', () => {
+  let component: TagComponent;
+  let fixture: ComponentFixture<TagComponent>;
+  let experienceAdapter: WebExperienceAdapterService;
+
+  function createContract(
+    props: Partial<TagProps> = {},
+    id = 'tag-1'
+  ): InteractionContract<TagProps> {
+    return {
+      id,
+      type: 'Tag',
+      props,
+    };
+  }
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [TagComponent],
+      providers: [WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(TagComponent);
+    component = fixture.componentInstance;
+    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
+  });
+
+  afterEach(() => {
+    fixture?.destroy();
+  });
+
+  it('should create and render label with default filled variant and primary severity', () => {
+    fixture.componentRef.setInput('contract', createContract({ value: 'Feature' }));
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    expect(shadowRoot).toBeTruthy();
+
+    const tagEl = shadowRoot.querySelector('.origo-tag');
+    expect(tagEl).toBeTruthy();
+    expect(tagEl.textContent?.trim()).toBe('Feature');
+    expect(tagEl.classList.contains('origo-tag--variant-filled')).toBe(true);
+    expect(tagEl.classList.contains('origo-tag--severity-primary')).toBe(true);
+  });
+
+  it('should render leading icon when provided', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ value: 'Verified', icon: 'pi-check' })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const iconEl = shadowRoot.querySelector('.origo-tag__icon');
+    expect(iconEl).toBeTruthy();
+    expect(iconEl.classList.contains('pi-check')).toBe(true);
+  });
+
+  it('should support rounded pill shape and outlined variant', () => {
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ value: 'Beta', rounded: true, variant: 'outlined', severity: 'warning' })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const tagEl = shadowRoot.querySelector('.origo-tag');
+    expect(tagEl.classList.contains('origo-tag--rounded')).toBe(true);
+    expect(tagEl.classList.contains('origo-tag--variant-outlined')).toBe(true);
+    expect(tagEl.classList.contains('origo-tag--severity-warning')).toBe(true);
+  });
+
+  it('should isolate remove click event from tag click event and dispatch remove capability', () => {
+    const removeSpy = jest.fn();
+    const clickSpy = jest.fn();
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
+
+    component.remove.subscribe(removeSpy);
+    component.click.subscribe(clickSpy);
+
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ value: 'Removable Tag', removable: true, interactive: true })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const removeBtn = shadowRoot.querySelector('.origo-tag__remove-btn') as HTMLButtonElement;
+    expect(removeBtn).toBeTruthy();
+    expect(removeBtn.getAttribute('aria-label')).toBe('Remove tag');
+
+    removeBtn.click();
+    expect(removeSpy).toHaveBeenCalledTimes(1);
+    expect(clickSpy).not.toHaveBeenCalled(); // Event isolation guaranteed via stopPropagation
+    expect(updateStateSpy).toHaveBeenCalledWith('tag-1', 'visible', false);
+    expect(dispatchSpy).toHaveBeenCalledWith('tag-1', 'remove', expect.any(Object));
+  });
+
+  it('should emit click event and dispatch capability when interactive tag body is clicked', () => {
+    const clickSpy = jest.fn();
+    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
+    component.click.subscribe(clickSpy);
+
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ value: 'Clickable Tag', interactive: true })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const tagEl = shadowRoot.querySelector('.origo-tag') as HTMLElement;
+    expect(tagEl.getAttribute('role')).toBe('button');
+    expect(tagEl.getAttribute('tabindex')).toBe('0');
+
+    tagEl.click();
+    expect(clickSpy).toHaveBeenCalledTimes(1);
+    expect(dispatchSpy).toHaveBeenCalledWith('tag-1', 'click', expect.any(Object));
+  });
+
+  it('should support keyboard removal with Backspace/Delete on focused tag', () => {
+    const removeSpy = jest.fn();
+    component.remove.subscribe(removeSpy);
+
+    fixture.componentRef.setInput(
+      'contract',
+      createContract({ value: 'Key Tag', removable: true, interactive: true })
+    );
+    fixture.detectChanges();
+
+    const shadowRoot = fixture.nativeElement.shadowRoot;
+    const tagEl = shadowRoot.querySelector('.origo-tag') as HTMLElement;
+
+    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
+    tagEl.dispatchEvent(event);
+    expect(removeSpy).toHaveBeenCalledTimes(1);
+  });
+
+  it('should be safe with null or undefined props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'null-tag',
+      type: 'Tag',
+      props: undefined as unknown as TagProps,
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(component.displayValue()).toBe('');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/tag/tag.component.ts b/packages/angular-renderer/src/components/primitives/tag/tag.component.ts
new file mode 100644
index 0000000..836738e
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tag/tag.component.ts
@@ -0,0 +1,175 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  computed,
+  inject,
+  signal,
+} from '@angular/core';
+import { CommonModule } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface TagProps {
+  value?: string;
+  severity?:
+    | 'primary'
+    | 'secondary'
+    | 'info'
+    | 'success'
+    | 'warn'
+    | 'warning'
+    | 'error'
+    | 'contrast'
+    | string;
+  icon?: string;
+  rounded?: boolean;
+  removable?: boolean;
+  variant?: 'filled' | 'outlined' | string;
+  interactive?: boolean;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const TagContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+  value: 'string',
+  severity: 'string',
+  icon: 'string',
+  rounded: 'boolean',
+  removable: 'boolean',
+  variant: 'string',
+  interactive: 'boolean',
+} as const;
+
+@Component({
+  selector: 'origo-tag',
+  standalone: true,
+  imports: [CommonModule],
+  templateUrl: './tag.component.html',
+  styleUrls: ['./tag.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-tag-host]': 'true',
+    '[attr.data-testid]': 'contractId()',
+    '[class.origo-tag-host--hidden]': '!isVisible()',
+  },
+})
+export class TagComponent implements OrigoAdapter<TagProps> {
+  static readonly contractSchema = TagContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<TagProps>>();
+
+  click = output<MouseEvent>();
+  remove = output<void>();
+
+  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
+  readonly isVisible = signal(true);
+
+  readonly contractId = computed(() => {
+    try {
+      return this.contract()?.id ?? '';
+    } catch {
+      return '';
+    }
+  });
+
+  readonly coercedProps = computed(() => {
+    let rawProps: TagProps | undefined;
+    try {
+      rawProps = this.contract()?.props;
+    } catch {
+      rawProps = undefined;
+    }
+    return coerceContractProps<TagProps>(rawProps, TagContractSchema);
+  });
+
+  readonly displayValue = computed(() => {
+    const v = this.coercedProps().value;
+    return v !== undefined && v !== null ? String(v) : '';
+  });
+
+  readonly severity = computed(() => {
+    const s = this.coercedProps().severity?.toLowerCase() || 'primary';
+    return s === 'warn' || s === 'warning' ? 'warning' : s;
+  });
+
+  readonly variant = computed(() => {
+    return this.coercedProps().variant === 'outlined' ? 'outlined' : 'filled';
+  });
+
+  readonly isRounded = computed(() => this.coercedProps().rounded === true);
+
+  readonly isRemovable = computed(() => this.coercedProps().removable === true);
+
+  readonly isInteractive = computed(() => this.coercedProps().interactive === true);
+
+  readonly icon = computed(() => this.coercedProps().icon);
+
+  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);
+
+  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
+
+  readonly computedTagClasses = computed(() => {
+    const classes = [
+      'origo-tag',
+      `origo-tag--severity-${this.severity()}`,
+      `origo-tag--variant-${this.variant()}`,
+    ];
+    if (this.isRounded()) classes.push('origo-tag--rounded');
+    if (this.isInteractive()) classes.push('origo-tag--interactive');
+    if (this.isRemovable()) classes.push('origo-tag--removable');
+    return classes.join(' ');
+  });
+
+  onClick(event: MouseEvent) {
+    if (this.isInteractive()) {
+      this.click.emit(event);
+      const id = this.contractId();
+      if (id) {
+        this.experienceAdapter?.dispatchCapability(id, 'click', { event });
+      }
+    }
+  }
+
+  onTagKeyDown(event: KeyboardEvent) {
+    if (this.isRemovable() && (event.key === 'Backspace' || event.key === 'Delete')) {
+      event.preventDefault();
+      this.onRemove(event as unknown as MouseEvent);
+    } else if (this.isInteractive() && (event.key === 'Enter' || event.key === ' ')) {
+      event.preventDefault();
+      this.onClick(event as unknown as MouseEvent);
+    }
+  }
+
+  onRemove(event: MouseEvent) {
+    event.stopPropagation();
+    this.isVisible.set(false);
+    this.remove.emit();
+    const id = this.contractId();
+    if (id) {
+      this.experienceAdapter?.updateState(id, 'visible', false);
+      this.experienceAdapter?.dispatchCapability(id, 'remove', {});
+    }
+  }
+
+  onRemoveKeyDown(event: KeyboardEvent) {
+    if (event.key === 'Enter' || event.key === ' ') {
+      event.preventDefault();
+      event.stopPropagation();
+      this.onRemove(event as unknown as MouseEvent);
+    }
+  }
+}
diff --git a/packages/angular-renderer/src/index.ts b/packages/angular-renderer/src/index.ts
index f16bc7c..a8a518a 100644
--- a/packages/angular-renderer/src/index.ts
+++ b/packages/angular-renderer/src/index.ts
@@ -55,3 +55,9 @@ export * from './components/primitives/toast/toast.service';
 export * from './components/primitives/toast/toast.component';
 export * from './components/primitives/snackbar/snackbar.component';
 export * from './components/primitives/banner/banner.component';
+export * from './components/primitives/spinner/spinner.component';
+export * from './components/primitives/progress-bar/progress-bar.component';
+export * from './components/primitives/skeleton/skeleton.component';
+export * from './components/primitives/badge/badge.component';
+export * from './components/primitives/tag/tag.component';
+export * from './components/primitives/block-ui/block-ui.component';
diff --git a/packages/angular-renderer/src/lib/primitives.provider.ts b/packages/angular-renderer/src/lib/primitives.provider.ts
index fc9358c..8308bc1 100644
--- a/packages/angular-renderer/src/lib/primitives.provider.ts
+++ b/packages/angular-renderer/src/lib/primitives.provider.ts
@@ -46,6 +46,12 @@ import { AlertComponent } from '../components/primitives/alert/alert.component';
 import { ToastComponent } from '../components/primitives/toast/toast.component';
 import { SnackbarComponent } from '../components/primitives/snackbar/snackbar.component';
 import { BannerComponent } from '../components/primitives/banner/banner.component';
+import { SpinnerComponent } from '../components/primitives/spinner/spinner.component';
+import { ProgressBarComponent } from '../components/primitives/progress-bar/progress-bar.component';
+import { SkeletonComponent } from '../components/primitives/skeleton/skeleton.component';
+import { BadgeComponent } from '../components/primitives/badge/badge.component';
+import { TagComponent } from '../components/primitives/tag/tag.component';
+import { BlockUIComponent } from '../components/primitives/block-ui/block-ui.component';
 
 export function provideOrigo9Primitives(): EnvironmentProviders {
   const registryMap = new Map<string, unknown>([
@@ -99,6 +105,14 @@ export function provideOrigo9Primitives(): EnvironmentProviders {
     ['FileInput', FileInputComponent],
     ['Dropzone', DropzoneComponent],
     ['RichTextEditor', RichTextEditorComponent],
+    ['Spinner', SpinnerComponent],
+    ['ProgressBar', ProgressBarComponent],
+    ['Progress', ProgressBarComponent],
+    ['Skeleton', SkeletonComponent],
+    ['Badge', BadgeComponent],
+    ['Tag', TagComponent],
+    ['BlockUI', BlockUIComponent],
+    ['LoadingOverlay', BlockUIComponent],
     ['vbox', VBoxComponent], // For backward compatibility with 'vbox' in preview-root
   ]);
 
diff --git a/packages/angular-renderer/src/styles/overlay.scss b/packages/angular-renderer/src/styles/overlay.scss
index 384d742..9174e38 100644
--- a/packages/angular-renderer/src/styles/overlay.scss
+++ b/packages/angular-renderer/src/styles/overlay.scss
@@ -150,6 +150,27 @@
       pointer-events: auto;
     }
   }
+
+  // Full-screen BlockUI / Loading Overlay modifier
+  &.origo-overlay-pane--block-ui {
+    inline-size: 100vw !important;
+    block-size: 100vh !important;
+    max-inline-size: 100vw !important;
+    max-block-size: 100vh !important;
+    inset-block-start: 0 !important;
+    inset-inline-start: 0 !important;
+    border-radius: 0 !important;
+    border: none !important;
+    box-shadow: none !important;
+    padding-inline: 0 !important;
+    padding-block: 0 !important;
+    background-color: var(--origo-color-backdrop, rgba(0, 0, 0, 0.45)) !important;
+    display: flex !important;
+    align-items: center;
+    justify-content: center;
+    pointer-events: auto !important;
+    overflow: hidden;
+  }
 }
 
 // RTL Internationalization Directionality Propagation
diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
index 3364c94..026bc83 100644
--- a/tools/test-registry/test-registry.yaml
+++ b/tools/test-registry/test-registry.yaml
@@ -1131,3 +1131,57 @@ test_cases:
       - 2-3-messaging-and-notification-components
     last_result: pass
     results: {}
+  - id: renderer-primitive-spinner
+    description: 'Verifies Spinner primitive scalable SVG circular geometry, rotating CSS keyframe, ARIA live region, and size/variant styling'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-4-status-and-loading-indicators
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-progress-bar
+    description: 'Verifies ProgressBar primitive determinate/indeterminate modes, safeMax division protection, boundary-guarded complete emission, and severity styling'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-4-status-and-loading-indicators
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-skeleton
+    description: 'Verifies Skeleton primitive geometric shapes (rectangle, circle), dimension resolution, and shimmer/pulse animations'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-4-status-and-loading-indicators
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-badge
+    description: 'Verifies Badge primitive standalone vs corner-overlay positioning, numeric threshold formatting (99+), dot mode, and RTL offsets'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-4-status-and-loading-indicators
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-tag
+    description: 'Verifies Tag primitive semantic chip pill styling, isolated remove button events, keyboard navigation, and filled/outlined variants'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-4-status-and-loading-indicators
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-block-ui
+    description: 'Verifies BlockUI primitive container interaction blocking, fullScreen overlay projection via OrigoOverlayService, and lifecycle disposal'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-4-status-and-loading-indicators
+    last_result: pass
+    results: {}
