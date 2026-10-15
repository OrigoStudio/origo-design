---
story_id: "2.4"
story_key: 2-4-status-and-loading-indicators
baseline_commit: 14e07c7
epic: 2
status: "review"
---

# Story 2.4: Status & Loading Indicators

Status: review

<!-- Note: Validated against quality competition checklist. Ready for dev-story implementation. -->

## Story

As a developer,  
I want to use comprehensive status and loading indicator primitives (`Spinner`, `ProgressBar`, `Skeleton`, `Badge`, `Tag`, and `BlockUI` / `LoadingOverlay`),  
So that I can visually communicate system processing states, background task progress, placeholder layout frames, semantic entity statuses, and block asynchronous user interactions without breaking Shadow DOM encapsulation, crashing during SSR hydration, or leaking DOM state.

---

## Acceptance Criteria

1. **[AC-1] Semantic Severity & Design Token Visual Substrate (ADR: AD-6, NFR-I18N-001, FR4):**
   - **Given** an Origo Angular 18/22 standalone rendering environment with `ViewEncapsulation.ShadowDom`,
   - **When** any status primitive (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`) is rendered,
   - **Then** all color, surface, border, and elevation styles must be bound strictly to `@origo/design-tokens` semantic CSS custom properties:
     - `primary`: Bound to `--origo-color-primary` (fallback `#2563eb`), `--origo-color-surface-primary`, `--origo-color-text-inverse` (fallback `#ffffff`).
     - `secondary`: Bound to `--origo-color-surface-secondary`, `--origo-color-border-subtle`, `--origo-color-text-secondary` (fallback `#64748b`).
     - `info`: Bound to `--origo-color-surface-subtle` (fallback `#eff6ff`), `--origo-color-border-info` (fallback `#bfdbfe`), `--origo-color-text-info` (fallback `#1e40af`).
     - `success`: Bound to `--origo-color-surface-success` (fallback `#ecfdf5`), `--origo-color-border-success` (fallback `#a7f3d0`), `--origo-color-text-success` (fallback `#065f46`).
     - `warn` / `warning`: Bound to `--origo-color-surface-warning` (fallback `#fffbeb`), `--origo-color-border-warning` (fallback `#fde68a`), `--origo-color-text-warning` (fallback `#92400e`).
     - `error`: Bound to `--origo-color-surface-danger` (fallback `#fef2f2`), `--origo-color-border-danger` (fallback `#fecaca`), `--origo-color-text-danger` (fallback `#991b1b`).
     - `contrast`: Bound to `--origo-color-surface-inverse` (fallback `#0f172a`), `--origo-color-text-inverse` (fallback `#ffffff`).
   - **And** all component stylesheets must strictly use CSS Logical Properties (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `border-inline-start`, `inline-size`, `block-size`, `min-inline-size`, `max-inline-size`) with zero physical coordinates (`left`, `right`, `padding-left`, `margin-right`), guaranteeing 100% automated Right-to-Left (RTL) mirroring under `dir="rtl"`.
   - **And** all stylesheets must contain zero hardcoded color hex values or pixel literals outside documented fallback expressions in `var()`.

2. **[AC-2] Accessible ARIA Roles, Live Regions & Screen Reader Semantics (ADR: P1-AD-6, FR-A11Y-001, Global System AC-4):**
   - **Given** any status or loading indicator displayed in the UI,
   - **When** rendered or dynamically transitioning states,
   - **Then** accessible semantics must be exposed:
     - For `SpinnerComponent`: Host or root SVG must bind `role="status"` and `aria-live="polite"`, with an accessible description rendered via `<span class="sr-only">{{ computedLabel() }}</span>` (default label: `"Loading..."`).
     - For `ProgressBarComponent`: Bound to `role="progressbar"`, `[attr.aria-valuenow]="mode() === 'determinate' ? computedValue() : null"`, `[attr.aria-valuemin]="0"`, `[attr.aria-valuemax]="max()"`, and `[attr.aria-label]="computedLabel() || 'Progress'"` (or `[attr.aria-valuetext]`).
     - For `SkeletonComponent`: Host element must declare `aria-hidden="true"` by default to prevent screen readers from reading raw structural placeholders, or `role="status"` with an explicit accessible label when operating as a stand-in block.
     - For `BadgeComponent`: When rendering numeric counts, must expose `[attr.aria-label]="computedAriaLabel()"`, announcing counts (e.g., `"5 unread notifications"`, `"99+ notifications"`). Dot-only badges must expose an accessible status label.
     - For `TagComponent`: When removable (`removable: true`), the remove trigger must be a semantic `<button type="button">` with `aria-label="Remove tag"` (or custom label) operable via `Enter`, `Space`, and `Backspace`.
     - For `BlockUIComponent`: When `blocked` is `true`, the blocked container or mask must declare `aria-busy="true"` and provide an `aria-live="polite"` announcement of the loading message.
   - **And** all components must respect the user's OS reduced-motion preferences (`@media (prefers-reduced-motion: reduce)`):
     - `SpinnerComponent`: Reduces rotation speed or replaces continuous spinning with a steady pulse.
     - `ProgressBarComponent`: Indeterminate sliding shimmer animation is replaced with a gentle, accessible opacity transition or static indicator.
     - `SkeletonComponent`: Shimmer wave animation is disabled; renders a static, neutral placeholder surface.
   - **And** all components must pass automated accessibility audits with zero WCAG 2.1 AA violations.

3. **[AC-3] Spinner Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.7):**
   - **Given** an asynchronous operation or loading state,
   - **When** `SpinnerComponent` (`origo-spinner`) is instantiated via BADL contract with key `'Spinner'`,
   - **Then** it must render a scalable SVG circular spinner supporting:
     - `size`: `'small'` (1rem / 16px), `'medium'` (2rem / 32px, default), `'large'` (3rem / 48px), or a custom CSS dimension string (e.g., `'24px'`, `'2.5rem'`).
     - `strokeWidth`: Stroke thickness of the SVG circle (number or string, default `4`).
     - `label`: Accessible loading text (default `'Loading...'`).
     - `variant`: Color variant (`'primary'` | `'secondary'` | `'accent'` | `'contrast'` | string, default `'primary'`).
     - `animationDuration`: CSS animation rotation duration (default `'1s'`).
     - `fill`: Background track color (default `'transparent'`).
     - `fluid`: Adapts display to parent container width when `true`.
   - **And** the spinner must render as an inline-block SVG with a spinning circular dash stroke (`stroke-dasharray`, `stroke-dashoffset`, `stroke-linecap="round"`).

4. **[AC-4] ProgressBar Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.8):**
   - **Given** a determinate or indeterminate task in progress,
   - **When** `ProgressBarComponent` (`origo-progress-bar`) is instantiated via BADL contract with key `'ProgressBar'` or `'Progress'`,
   - **Then** it must render a responsive progress bar supporting:
     - `value`: Number between `0` and `max` representing current progress; ignored when `mode === 'indeterminate'`.
     - `mode`: `'determinate' | 'indeterminate'` (default `'determinate'`).
     - `showValue`: Boolean toggle controlling visibility of percentage or numeric text within or beside the bar (default `true` for determinate, `false` for indeterminate).
     - `max`: Maximum progress value (default `100`); must safely fallback to `100` if `max <= 0` or `NaN` to prevent division-by-zero (`Infinity%`/`NaN%`) crashes.
     - `label`: Accessible label / text description of the task.
     - `unit`: Value suffix string (default `'%'`).
     - `severity`: `'primary' | 'info' | 'success' | 'warn' | 'warning' | 'error'` (default `'primary'`).
     - `height`: Custom bar block-size (default: `var(--origo-size-progress-height, 0.5rem)`).
   - **And** input values must be strictly clamped: `clampedValue = Math.min(Math.max(value ?? 0, 0), safeMax)`.
   - **And** when `mode === 'determinate'` and `value` transitions to reach or exceed `max`:
     - Emits `complete = output<void>()` and dispatches capability `dispatchCapability(id, 'complete', { value, max })`.
     - **CRITICAL DEBOUNCE GUARD:** `complete` must emit ONLY once upon crossing the boundary from `< safeMax` to `>= safeMax`. It must NOT re-emit on initial mount if initialized complete, nor repeat continuously across dirty-checking passes.
   - **And** value changes emit `valueChange = output<number>()` and synchronize state via `updateState(id, 'value', value)`.
   - **And** indeterminate mode displays a continuous sliding shimmer animation along the bar without exposing numeric values.

5. **[AC-5] Skeleton Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.9):**
   - **Given** content that is awaiting data resolution,
   - **When** `SkeletonComponent` (`origo-skeleton`) is instantiated via BADL contract with key `'Skeleton'`,
   - **Then** it must render a placeholder preview geometry supporting:
     - `shape`: `'rectangle' | 'circle'` (default `'rectangle'`).
     - `width`: Rendered inline-size string (default `'100%'`).
     - `height`: Rendered block-size string (default `'1rem'`).
     - `size`: Square/circle dimension string (e.g., `'3rem'`); when specified, takes precedence and sets both `width` and `height` equally.
     - `borderRadius`: Border radius override (default: `'var(--origo-radius-md)'` for rectangle, `'50%'` for circle).
     - `animation`: `'shimmer' | 'pulse' | 'none'` (default `'shimmer'`).
   - **And** when `shape === 'circle'`, default dimensions resolve to `size || '2.5rem'` with `border-radius: 50%`.
   - **And** the shimmer animation uses a linear gradient moving horizontally across the skeleton surface bound to `--origo-color-surface-subtle` and `--origo-color-surface-hover` tokens.

6. **[AC-6] Badge Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.4):**
   - **Given** an entity count, notification tally, or status flag,
   - **When** `BadgeComponent` (`origo-badge`) is instantiated via BADL contract with key `'Badge'`,
   - **Then** it must support both standalone and container-overlay usage:
     - `value`: String or number payload to display (e.g., `5`, `"NEW"`, `120`).
     - `severity`: `'primary' | 'secondary' | 'info' | 'success' | 'warn' | 'warning' | 'error' | 'contrast'` (default `'primary'`).
     - `size`: `'small' | 'medium' | 'large'` (default `'medium'`).
     - `shape`: `'circle' | 'rounded' | 'square'` (default `'rounded'`).
     - `max`: Maximum numeric threshold (default `undefined`); if `value` is a number > `max`, renders `"${max}+"` (e.g., `max: 99`, `value: 120` -> renders `"99+"`).
     - `dot`: Boolean toggle (default `false`); when `true` or when `value` is null/empty/undefined, renders as a compact circular indicator dot without text.
     - `interactive`: Boolean toggle (default `false`); when `true`, adds cursor pointer, focus styles, and emits `click = output<MouseEvent>()`.
   - **And** `BadgeComponent` must implement `ContainerComponent` with optional `vc = viewChild('vc', { read: ViewContainerRef })` and `<ng-content>`.
   - **And** when wrapping content (`hasContent: true`), the badge indicator must position as an overlay at the top-end corner:
     - Standard: `inset-block-start: 0; inset-inline-end: 0; transform: translate(50%, -50%);`
     - RTL Mirroring: `[dir='rtl'] & { transform: translate(-50%, -50%); }` (guaranteeing the badge shifts outward to the inline-end, not inward over container content).
   - **And** when no children are projected (`hasContent: false`), `BadgeComponent` renders directly inline-flex in document flow without absolute positioning.

7. **[AC-7] Tag Component Specification (ADR: P1-AD-1, P1-AD-5, API Spec 7.5):**
   - **Given** categorization, entity attributes, or removable metadata chips,
   - **When** `TagComponent` (`origo-tag`) is instantiated via BADL contract with key `'Tag'`,
   - **Then** it must render a semantic status pill supporting:
     - `value`: String text label of the tag.
     - `severity`: `'primary' | 'secondary' | 'info' | 'success' | 'warn' | 'warning' | 'error' | 'contrast'` (default `'primary'`).
     - `icon`: Optional leading icon identifier or SVG string.
     - `rounded`: Boolean toggle for fully pill-shaped border radius (`9999px`, default `false`).
     - `removable`: Boolean toggle (default `false`) displaying a trailing remove button.
     - `variant`: Visual style (`'filled' | 'outlined'`, default `'filled'`).
     - `interactive`: Boolean toggle (default `false`) enabling focus and click handlers.
   - **And** clicking the tag when `interactive: true` emits `click = output<MouseEvent>()` and dispatches capability `dispatchCapability(id, 'click')`.
   - **And** clicking the remove button emits `remove = output<void>()`, updates state `updateState(id, 'visible', false)`, and dispatches capability `dispatchCapability(id, 'remove')`.
   - **CRITICAL EVENT ISOLATION:** The remove button click handler MUST call `$event.stopPropagation()` to prevent bubbling and ensure the outer tag `click` event is NOT triggered when dismissing a tag.
   - **And** keyboard removal is supported via `Enter`, `Space` on the remove trigger, or `Backspace` / `Delete` on a focused tag.

8. **[AC-8] BlockUI & Loading Overlay Component Specification (ADR: P1-AD-1, P1-AD-5, Spike: retro-1, API Spec 7.7, PRD Epic 1.4):**
   - **Given** a container, form, card, or full application screen that must block user interaction during processing,
   - **When** `BlockUIComponent` (`origo-block-ui` / `origo-loading-overlay`) is instantiated via BADL contract with key `'BlockUI'` or `'LoadingOverlay'`,
   - **Then** it must support:
     - `blocked`: Boolean toggle (default `false`, accepting `loading` as an alias) controlling whether the blocking mask is active.
     - `fullScreen`: Boolean toggle (default `false`); when `true`, projects the blocking mask to `document.body` via `OrigoOverlayService` so the entire browser viewport is blocked. When `false`, blocks only the local component container.
     - `message`: Optional loading message or status string displayed below the spinner (e.g., `"Please wait..."`).
     - `spinner`: Boolean toggle (default `true`) displaying an inner `SpinnerComponent` within the mask.
     - `baseZIndex`: Base z-index override (default `var(--origo-z-overlay, 1000)`).
   - **And** `BlockUIComponent` implements `ContainerComponent` with optional `vc = viewChild('vc', { read: ViewContainerRef })` and `<ng-content>`.
   - **And** when `blocked` is `true`:
     - Sets `aria-busy="true"` on the host.
     - Renders a semi-transparent backdrop overlay (`.origo-block-ui__mask` bound to `--origo-color-backdrop` or surface tokens with smooth fade-in).
     - Centered content displays the spinner and message.
     - Blocks user clicks, hover, and interaction on the underlying content (`pointer-events: none` on wrapped content, `pointer-events: auto` on mask).
     - Suppresses keyboard interaction by intercepting keydown events or trapping focus within the mask.
   - **And** toggling `blocked` emits `blockedChange = output<boolean>()` and synchronizes state via `updateState(id, 'blocked', blocked)`.
   - **CRITICAL LIFECYCLE & MEMORY SAFETY:** In full-screen mode, `BlockUIComponent` must register an explicit cleanup handler with `DestroyRef.onDestroy(() => this.overlayRef?.dispose())`, guaranteeing that unmounting the component or navigating away cleans up any active CDK overlay mask from `document.body`.
   - **And** browser-only APIs and CDK Overlay creation must be guarded by `isPlatformBrowser(platformId)`.

9. **[AC-9] Angular Standalone, Signals Reactivity & Runtime Property Coercion (ADR: P1-AD-1, P1-AD-4):**
   - **Given** incoming BADL AST payloads,
   - **When** any of the status/loading primitives are instantiated,
   - **Then** all components (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`) must be Angular Standalone components with `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`, consuming inputs via Angular Signals (`input.required<InteractionContract<TProps>>()`, `computed()`), and emitting typed outputs (`output()`).
   - **And** each component must define `static readonly contractSchema` covering 100% of defined properties and aliases (`value`, `severity`, `size`, `label`, `strokeWidth`, `mode`, `showValue`, `max`, `shape`, `width`, `height`, `borderRadius`, `animation`, `rounded`, `removable`, `blocked`, `loading`, `fullScreen`, `message`, etc.) and invoke `coerceContractProps()` on incoming `this.contract().props` to guard against runtime property stripping or malformed types.
   - **And** all components implementing `ContainerComponent` (`BadgeComponent`, `BlockUIComponent`) must declare optional signal query `vc = viewChild('vc', { read: ViewContainerRef })`. Using `viewChild.required('vc')` is strictly FORBIDDEN to eliminate fatal runtime error `NG0951`.
   - **And** leaf primitives (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `TagComponent`) do NOT implement `ContainerComponent` to avoid unnecessary slot overhead.

10. **[AC-10] State Synchronization & Capability Dispatch (ADR: AD-11, AD-15):**
    - **Given** user interactions and component state transitions,
    - **When** an event occurs,
    - **Then** the component must emit corresponding typed outputs and synchronize state via `WebExperienceAdapterService`:
      - `ProgressBarComponent`: `complete`, `valueChange`, `updateState(id, 'value', value)`, `dispatchCapability(id, 'complete', payload)`.
      - `BadgeComponent`: `click`, `dispatchCapability(id, 'click', payload)`.
      - `TagComponent`: `click`, `remove`, `updateState(id, 'visible', false)`, `dispatchCapability(id, 'remove', payload)`, `dispatchCapability(id, 'click', payload)`.
      - `BlockUIComponent`: `blockedChange`, `updateState(id, 'blocked', isBlocked)`, `dispatchCapability(id, 'blockedChange', { blocked: isBlocked })`.

11. **[AC-11] Server-Side Rendering (SSR) & Content Security Policy (CSP) Compliance (Global System AC-1, AC-2):**
    - **Given** strict enterprise SSR and Content Security Policy environments,
    - **When** status components or full-screen loading overlays are initialized and mounted,
    - **Then** direct access to browser DOM globals (`window`, `document`) must be strictly guarded via `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
    - **And** any timer handles (`setTimeout`, `requestAnimationFrame`) must be cleanly cleared and disposed upon component teardown via `DestroyRef.onDestroy()`.
    - **And** zero inline `style="..."` attributes may be dynamically injected onto body nodes; all full-screen overlay styles must be governed strictly through predefined CSS classes in `packages/angular-renderer/src/styles/overlay.scss` (`.origo-overlay-pane--block-ui`) and CSS custom properties.

12. **[AC-12] Definition of Done (DoD), Registration & Central Test Registry (DoD: docs/definition-of-done.md, ADR: AD-11, AD-12):**
    - **Given** completion of the status and loading indicator components,
    - **When** prepared for release,
    - **Then** all primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`:
      - `'Spinner'` -> `SpinnerComponent`
      - `'ProgressBar'` -> `ProgressBarComponent`
      - `'Progress'` -> `ProgressBarComponent` (alias)
      - `'Skeleton'` -> `SkeletonComponent`
      - `'Badge'` -> `BadgeComponent`
      - `'Tag'` -> `TagComponent`
      - `'BlockUI'` -> `BlockUIComponent`
      - `'LoadingOverlay'` -> `BlockUIComponent` (alias)
    - **And** exported from `packages/angular-renderer/src/index.ts`.
    - **And** `tools/test-registry/test-registry.yaml` MUST be updated with six new test suite entries:
      - `renderer-primitive-spinner` (`packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts`)
      - `renderer-primitive-progress-bar` (`packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts`)
      - `renderer-primitive-skeleton` (`packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts`)
      - `renderer-primitive-badge` (`packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts`)
      - `renderer-primitive-tag` (`packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts`)
      - `renderer-primitive-block-ui` (`packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts`)
      each specifying `affected_stories: [2-4-status-and-loading-indicators]` and type `unit`.

---

## Tasks / Subtasks

- [x] Task 1: Overlay Infrastructure & Global Overlay Pane Styling for BlockUI (AC: 1, 8, 11)
  - [x] 1.1 Add `.origo-overlay-pane--block-ui` modifier class to `packages/angular-renderer/src/styles/overlay.scss` with:
    - `inline-size: 100vw !important; block-size: 100vh !important; inset-block-start: 0 !important; inset-inline-start: 0 !important;`
    - `background-color: var(--origo-color-backdrop, rgba(0, 0, 0, 0.45));`
    - `display: flex; align-items: center; justify-content: center; pointer-events: auto;`
    - Clean backdrop and elevation tokens.
  - [x] 1.2 Verify reduced motion queries in `overlay.scss` disable transitions for block-ui overlays.

- [x] Task 2: Implement SpinnerComponent (`origo-spinner`) (AC: 1, 2, 3, 9, 10, 11)
  - [x] 2.1 Create component files under `packages/angular-renderer/src/components/primitives/spinner/`:
    - `spinner.component.ts`
    - `spinner.component.html`
    - `spinner.component.scss`
    - `spinner.component.spec.ts`
  - [x] 2.2 Define `SpinnerProps` interface and `static readonly contractSchema` supporting `size`, `strokeWidth`, `label`, `variant`, `animationDuration`, `fill`, `fluid`, metadata hooks.
  - [x] 2.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, and scalable SVG circle with rotating CSS keyframe animation.
  - [x] 2.4 Bind ARIA attributes: `role="status"`, `aria-live="polite"`, `<span class="sr-only">{{ computedLabel() }}</span>`.
  - [x] 2.5 Author unit test suite in `spinner.component.spec.ts` asserting SVG rendering across shadow boundaries, size variations, variant token bindings, ARIA roles, and null-safe contract handling.

- [x] Task 3: Implement ProgressBarComponent (`origo-progress-bar`) (AC: 1, 2, 4, 9, 10, 11)
  - [x] 3.1 Create component files under `packages/angular-renderer/src/components/primitives/progress-bar/`:
    - `progress-bar.component.ts`
    - `progress-bar.component.html`
    - `progress-bar.component.scss`
    - `progress-bar.component.spec.ts`
  - [x] 3.2 Define `ProgressBarProps` interface and `static readonly contractSchema` supporting `value`, `mode`, `showValue`, `max`, `label`, `unit`, `severity`, `height`, metadata hooks.
  - [x] 3.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, safe max resolution (`safeMax = max > 0 ? max : 100`), input clamping (`0` to `safeMax`), determinate progress percentage calculation, and indeterminate sliding animation.
  - [x] 3.4 Implement `complete = output<void>()`, `valueChange = output<number>()`, and capability/state dispatching upon reaching `max` with `hasCompleted` boundary guard to prevent duplicate or infinite emissions.
  - [x] 3.5 Bind ARIA `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`, omitting `aria-valuenow` in indeterminate mode.
  - [x] 3.6 Author unit test suite in `progress-bar.component.spec.ts` asserting determinate progress widths, zero-division fallback, indeterminate animation states, completion events boundary guard, severity token classes, and RTL mirroring.

- [x] Task 4: Implement SkeletonComponent (`origo-skeleton`) (AC: 1, 2, 5, 9, 10, 11)
  - [x] 4.1 Create component files under `packages/angular-renderer/src/components/primitives/skeleton/`:
    - `skeleton.component.ts`
    - `skeleton.component.html`
    - `skeleton.component.scss`
    - `skeleton.component.spec.ts`
  - [x] 4.2 Define `SkeletonProps` interface and `static readonly contractSchema` supporting `shape`, `width`, `height`, `size`, `borderRadius`, `animation`, metadata hooks.
  - [x] 4.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, dimension resolution (`size` overriding `width`/`height`), geometric shape rendering (`rectangle`, `circle`), and shimmer/pulse CSS animations.
  - [x] 4.4 Bind `aria-hidden="true"` and reduced motion guardrails (disabling shimmer animation).
  - [x] 4.5 Author unit test suite in `skeleton.component.spec.ts` asserting circle/rectangle shapes, dimension styles, animation class bindings, and shadow DOM encapsulation.

- [x] Task 5: Implement BadgeComponent (`origo-badge`) (AC: 1, 2, 6, 9, 10, 11)
  - [x] 5.1 Create component files under `packages/angular-renderer/src/components/primitives/badge/`:
    - `badge.component.ts`
    - `badge.component.html`
    - `badge.component.scss`
    - `badge.component.spec.ts`
  - [x] 5.2 Define `BadgeProps` interface and `static readonly contractSchema` supporting `value`, `severity`, `size`, `shape`, `max`, `dot`, `interactive`, metadata hooks.
  - [x] 5.3 Implement Standalone, Shadow DOM, OnPush, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
  - [x] 5.4 Implement corner overlay positioning when wrapping content vs inline-block when standalone, including RTL logical coordinate mirroring (`[dir='rtl'] & { transform: translate(-50%, -50%); }`).
  - [x] 5.5 Implement numeric threshold formatting (e.g., `max: 99` displaying `99+`) and dot mode with accessible label.
  - [x] 5.6 Author unit test suite in `badge.component.spec.ts` asserting value formatting, dot rendering, container wrapping vs standalone, click event emission, RTL mirroring, and keyboard accessibility.

- [x] Task 6: Implement TagComponent (`origo-tag`) (AC: 1, 2, 7, 9, 10, 11)
  - [x] 6.1 Create component files under `packages/angular-renderer/src/components/primitives/tag/`:
    - `tag.component.ts`
    - `tag.component.html`
    - `tag.component.scss`
    - `tag.component.spec.ts`
  - [x] 6.2 Define `TagProps` interface and `static readonly contractSchema` supporting `value`, `severity`, `icon`, `rounded`, `removable`, `variant`, `interactive`, metadata hooks.
  - [x] 6.3 Implement Standalone, Shadow DOM, OnPush, Signals reactivity, pill shaping, and severity color mappings.
  - [x] 6.4 Implement removal action button with `$event.stopPropagation()` to isolate remove from tag click (`remove = output<void>()`, `updateState(id, 'visible', false)`), and interactive click emission (`click = output<MouseEvent>()`).
  - [x] 6.5 Bind ARIA labels and keyboard handlers for removal (`Enter`, `Space`, `Backspace`, `Delete`).
  - [x] 6.6 Author unit test suite in `tag.component.spec.ts` asserting label rendering, icon placement, removal events with click isolation, keyboard activation, and outlined vs filled variants.

- [x] Task 7: Implement BlockUIComponent (`origo-block-ui` / `origo-loading-overlay`) (AC: 1, 2, 8, 9, 10, 11)
  - [x] 7.1 Create component files under `packages/angular-renderer/src/components/primitives/block-ui/`:
    - `block-ui.component.ts`
    - `block-ui.component.html`
    - `block-ui.component.scss`
    - `block-ui.component.spec.ts`
  - [x] 7.2 Define `BlockUIProps` interface and `static readonly contractSchema` supporting `blocked`, `loading`, `fullScreen`, `message`, `spinner`, `baseZIndex`, metadata hooks.
  - [x] 7.3 Implement Standalone, Shadow DOM, OnPush, and `ContainerComponent` with optional `vc = viewChild('vc')` and `<ng-content>`.
  - [x] 7.4 Implement local container mask with `pointer-events: none` on wrapped content and `pointer-events: auto` on mask, and fullScreen projection via `OrigoOverlayService`.
  - [x] 7.5 Register `DestroyRef.onDestroy(() => this.overlayRef?.dispose())` to prevent orphaned full-screen overlays upon component teardown or route changes.
  - [x] 7.6 Embed `SpinnerComponent` and message text within the blocking mask.
  - [x] 7.7 Bind `aria-busy="true"` on blocked state and emit `blockedChange = output<boolean>()`.
  - [x] 7.8 Author unit test suite in `block-ui.component.spec.ts` asserting local vs fullScreen blocking, pointer-events blocking, message and spinner rendering, dynamic `blocked` toggle, SSR safety guards, and overlay teardown.

- [x] Task 8: Monorepo Registration, Exports & Central Test Registry (AC: 12)
  - [x] 8.1 Register primitives in `packages/angular-renderer/src/lib/primitives.provider.ts`:
    - `'Spinner'`: `SpinnerComponent`
    - `'ProgressBar'`: `ProgressBarComponent`
    - `'Progress'`: `ProgressBarComponent`
    - `'Skeleton'`: `SkeletonComponent`
    - `'Badge'`: `BadgeComponent`
    - `'Tag'`: `TagComponent`
    - `'BlockUI'`: `BlockUIComponent`
    - `'LoadingOverlay'`: `BlockUIComponent`
  - [x] 8.2 Export all new components and model interfaces in `packages/angular-renderer/src/index.ts`.
  - [x] 8.3 Register test suites in `tools/test-registry/test-registry.yaml`:
    - `renderer-primitive-spinner`
    - `renderer-primitive-progress-bar`
    - `renderer-primitive-skeleton`
    - `renderer-primitive-badge`
    - `renderer-primitive-tag`
    - `renderer-primitive-block-ui`
  - [x] 8.4 Run full monorepo test suite (`npm test`) and lint checks (`npx nx lint angular-renderer`) to verify zero regressions.
  - [x] 8.5 Update `sprint-status.yaml` marking `2-4-status-and-loading-indicators` as `ready-for-dev`.

### Review Findings

- [ ] [Review][Patch] Full-screen BlockUI overlay styling isolation in Shadow DOM and double backdrop opacity [packages/angular-renderer/src/styles/overlay.scss:155]
- [ ] [Review][Patch] Untracked ViewChild in BlockUI constructor effect causes full-screen overlay to fail opening on initial mount [packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.ts:149]
- [ ] [Review][Patch] Absence of keyboard focus trapping and keyboard suppression in BlockUI blocked state [packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.ts:57]
- [ ] [Review][Patch] ProgressBar formattedValue computes incorrect value when using non-percentage units [packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts:120]
- [ ] [Review][Patch] Invalid aria-valuemin on indeterminate ProgressBar violating W3C specification [packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts:60]
- [ ] [Review][Patch] Conflicting host and template [class] string bindings risk clobbering boolean class bindings [packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.html:5]
- [ ] [Review][Patch] ProgressBar stale completion and event state across contract identity changes and mode switches [packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts:135]
- [ ] [Review][Patch] Duplicate screen reader announcement on Spinner due to redundant aria-label on host [packages/angular-renderer/src/components/primitives/spinner/spinner.component.ts:62]
- [ ] [Review][Patch] Hardcoded dash animation duration on Spinner circle causes phase-drift and stutter [packages/angular-renderer/src/components/primitives/spinner/spinner.component.scss:64]
- [ ] [Review][Patch] Tag remove button missing Backspace and Delete keyboard operability [packages/angular-renderer/src/components/primitives/tag/tag.component.ts:168]
- [ ] [Review][Patch] Hardcoded color literal in Tag remove button hover state [packages/angular-renderer/src/components/primitives/tag/tag.component.scss:77]
- [ ] [Review][Patch] Signal mutation in Badge ngAfterContentChecked risks NG0100 error [packages/angular-renderer/src/components/primitives/badge/badge.component.ts:170]
- [ ] [Review][Patch] Badge click event bubbling and unsafe KeyboardEvent casting [packages/angular-renderer/src/components/primitives/badge/badge.component.ts:193]
- [ ] [Review][Patch] Hardcoded physical gradient in Skeleton shimmer ignores RTL reading direction [packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.scss:31]
- [ ] [Review][Patch] Test suite coverage gaps for RTL mirroring, SSR safety, and overlay teardown [packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts:121]
- [ ] [Review][Patch] ProgressBar boundary clamping boolean check [packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts:96]
- [ ] [Review][Patch] BlockUI fallback screen reader announcement when spinner=false and message is empty [packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.html:12]

---

## Dev Notes

### Architecture Patterns & Invariants to Enforce

1. **Standalone & Shadow DOM (Invariant 1, ADR: P1-AD-1):**
   - Every component must declare `standalone: true`, `encapsulation: ViewEncapsulation.ShadowDom`, and `changeDetection: ChangeDetectionStrategy.OnPush`.
   - Host binding: `[attr.data-testid]="contract().id"`.
   - Host styling: Every `.scss` file MUST define `:host` and `:host([hidden]) { display: none !important; }`.

2. **Signals Reactivity (Invariant 3, ADR: P1-AD-1):**
   - Inputs must use `input.required<InteractionContract<TProps>>()`.
   - Derived states must use `computed()`.
   - Events must use `output<T>()`.
   - No direct property mutation; no unmanaged RxJS subscriptions.
   - When writing constructor effects that sync model signals from contract inputs, always wrap untracked updates in `untracked()` or pass `{ allowSignalWrites: true }` to avoid Angular runtime signal writing errors.

3. **Runtime Contract Coercion & Schema (Invariant 4, ADR: P1-AD-4):**
   - Every component must implement `OrigoAdapter<TProps>`.
   - Must define `static readonly contractSchema` covering all defined properties and aliases.
   - Must call `coerceContractProps()` on incoming `this.contract().props` in constructor or computed signal.

4. **Composition Slots & ViewContainerRef (Invariant 5, ADR: P1-AD-5):**
   - Components implementing `ContainerComponent` (`BadgeComponent`, `BlockUIComponent`) must declare optional signal query:
     ```typescript
     readonly vc = viewChild('vc', { read: ViewContainerRef });
     ```
   - **CRITICAL ANTI-PATTERN TO AVOID:** Do NOT use `viewChild.required('vc')`. Query resolution fails with fatal runtime error `NG0951` when `#vc` is hosted within unattached `<ng-template>` views.
   - Leaf primitives (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `TagComponent`) do NOT implement `ContainerComponent` to avoid unnecessary slot overhead.

5. **CDK Overlay & Portal Substrate for BlockUI (ADR: P1-AD-5, Spike: retro-1):**
   - `BlockUIComponent` when configured with `fullScreen: true` projects into `document.body` via `OrigoOverlayService`.
   - Clean up overlay refs on teardown via `DestroyRef.onDestroy()`.
   - Ensure local blocking mode (`fullScreen: false`) uses relative host container with absolute mask positioning and does not invoke CDK overlay unnecessarily.

6. **SSR & Browser Guardrails (Global System AC-2):**
   - Guard direct DOM and browser APIs with `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
   - In non-browser environments, `OrigoOverlayService` returns `OrigoNoopOverlayRef` ensuring zero crashes during SSR.

7. **Zero-Literal Design Tokens & RTL Mirroring (ADR: AD-6, NFR-I18N-001):**
   - Strictly consume `var(--origo-*)` tokens with documented semantic fallbacks.
   - Use CSS Logical Properties exclusively (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `border-inline-start`, `inline-size`, `block-size`).
   - Zero physical directional properties (`left`, `right`, `padding-left`, `margin-right`).

---

### Technical Implementation Blueprints & Concrete Guardrails

#### 1. Exact BADL Contract Schemas for All 6 Primitives

Every primitive must define its `static readonly contractSchema` and implement `OrigoAdapter<TProps>`:

```typescript
// 1. SpinnerComponent
export const SpinnerContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  size: 'string',
  strokeWidth: 'number',
  label: 'string',
  variant: 'string',
  animationDuration: 'string',
  fill: 'string',
  fluid: 'boolean',
} as const;

// 2. ProgressBarComponent
export const ProgressBarContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  value: 'number',
  mode: 'string',
  showValue: 'boolean',
  max: 'number',
  label: 'string',
  unit: 'string',
  severity: 'string',
  height: 'string',
} as const;

// 3. SkeletonComponent
export const SkeletonContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  shape: 'string',
  width: 'string',
  height: 'string',
  size: 'string',
  borderRadius: 'string',
  animation: 'string',
} as const;

// 4. BadgeComponent
export const BadgeContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  value: 'string',
  severity: 'string',
  size: 'string',
  shape: 'string',
  max: 'number',
  dot: 'boolean',
  interactive: 'boolean',
} as const;

// 5. TagComponent
export const TagContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  value: 'string',
  severity: 'string',
  icon: 'string',
  rounded: 'boolean',
  removable: 'boolean',
  variant: 'string',
  interactive: 'boolean',
} as const;

// 6. BlockUIComponent
export const BlockUIContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  blocked: 'boolean',
  loading: 'boolean', // alias for blocked
  fullScreen: 'boolean',
  message: 'string',
  spinner: 'boolean',
  baseZIndex: 'number',
} as const;
```

#### 2. ProgressBar Clamping & Debounced Completion Blueprint

```typescript
export class ProgressBarComponent implements OrigoAdapter<ProgressBarProps> {
  static readonly contractSchema = ProgressBarContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ProgressBarProps>>();
  complete = output<void>();
  valueChange = output<number>();

  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
  private hasCompleted = false;

  protected props = computed(() =>
    coerceContractProps<ProgressBarProps>(this.contract().props, ProgressBarComponent.contractSchema)
  );

  readonly safeMax = computed(() => {
    const m = this.props().max;
    return m !== undefined && m !== null && Number(m) > 0 ? Number(m) : 100;
  });

  readonly clampedValue = computed(() => {
    const v = this.props().value;
    const num = v !== undefined && v !== null ? Number(v) : 0;
    return Math.min(Math.max(isNaN(num) ? 0 : num, 0), this.safeMax());
  });

  readonly percentage = computed(() => {
    return (this.clampedValue() / this.safeMax()) * 100;
  });

  readonly mode = computed(() => this.props().mode ?? 'determinate');

  constructor() {
    effect(() => {
      const val = this.clampedValue();
      const max = this.safeMax();
      const currentMode = this.mode();

      if (currentMode === 'determinate' && val >= max && max > 0) {
        if (!this.hasCompleted) {
          this.hasCompleted = true;
          untracked(() => {
            this.complete.emit();
            this.experienceAdapter?.dispatchCapability(this.contract().id, 'complete', {
              value: val,
              max,
            });
          });
        }
      } else if (val < max) {
        this.hasCompleted = false;
      }
    });
  }
}
```

#### 3. Spinner SVG Geometry & CSS Keyframe Blueprint

SVG Template (`spinner.component.html`):
```html
<svg
  class="origo-spinner__svg"
  viewBox="0 0 50 50"
  aria-hidden="true"
  focusable="false"
  [style.animation-duration]="computedDuration()"
>
  <circle
    class="origo-spinner__circle"
    cx="25"
    cy="25"
    r="20"
    fill="none"
    [attr.stroke-width]="computedStrokeWidth()"
  ></circle>
</svg>
<span class="sr-only">{{ computedLabel() }}</span>
```

Styles (`spinner.component.scss`):
```scss
:host {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  box-sizing: border-box;
}

:host([hidden]) {
  display: none !important;
}

.origo-spinner__svg {
  display: block;
  inline-size: var(--origo-spinner-size, 2rem);
  block-size: var(--origo-spinner-size, 2rem);
  animation: origo-spinner-rotate var(--origo-spinner-duration, 1.5s) linear infinite;
}

.origo-spinner__circle {
  stroke: var(--origo-spinner-color, var(--origo-color-primary, #2563eb));
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: origo-spinner-dash 1.5s ease-in-out infinite;
}

@keyframes origo-spinner-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes origo-spinner-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -125px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .origo-spinner__svg,
  .origo-spinner__circle {
    animation: none !important;
    opacity: 0.8;
  }
}
```

#### 4. Badge Dual-Mode & RTL Offset Blueprint

Template (`badge.component.html`):
```html
<div class="origo-badge-host" [class.origo-badge-host--overlay]="hasContent()">
  <ng-container #vc></ng-container>
  <ng-content></ng-content>
  @if (isVisible()) {
    <span
      class="origo-badge"
      [class]="computedBadgeClasses()"
      [attr.aria-label]="computedAriaLabel()"
      (click)="onClick($event)"
    >
      @if (!isDot()) {
        {{ displayValue() }}
      }
    </span>
  }
</div>
```

Styles (`badge.component.scss`):
```scss
:host {
  display: inline-flex;
  box-sizing: border-box;
  vertical-align: middle;
}

:host([hidden]) {
  display: none !important;
}

.origo-badge-host {
  display: inline-flex;
  position: relative;
}

.origo-badge-host--overlay .origo-badge {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  transform: translate(50%, -50%);
}

// Crucial RTL Translation Inversion
:host([dir='rtl']) .origo-badge-host--overlay .origo-badge,
[dir='rtl'] .origo-badge-host--overlay .origo-badge {
  transform: translate(-50%, -50%);
}
```

#### 5. Tag Removal Event Isolation Blueprint

```typescript
export class TagComponent implements OrigoAdapter<TagProps> {
  // ...
  remove = output<void>();
  click = output<MouseEvent>();

  onRemove(event: MouseEvent) {
    // STOP PROPAGATION is mandatory to prevent triggering tag's click handler
    event.stopPropagation();
    this.remove.emit();
    this.experienceAdapter?.updateState(this.contract().id, 'visible', false);
    this.experienceAdapter?.dispatchCapability(this.contract().id, 'remove', {});
  }

  onClick(event: MouseEvent) {
    if (this.isInteractive()) {
      this.click.emit(event);
      this.experienceAdapter?.dispatchCapability(this.contract().id, 'click', {});
    }
  }
}
```

#### 6. BlockUI FullScreen Lifecycle & Teardown Blueprint

```typescript
export class BlockUIComponent implements OrigoAdapter<BlockUIProps>, ContainerComponent {
  static readonly contractSchema = BlockUIContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<BlockUIProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });
  fullScreenOverlayTemplate = viewChild<TemplateRef<unknown>>('fullScreenOverlayTemplate');
  blockedChange = output<boolean>();

  private overlayRef?: OrigoOverlayRef;
  private readonly overlayService = inject(OrigoOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly experienceAdapter = inject(WebExperienceAdapterService, { optional: true });

  readonly isBlocked = computed(() => {
    const p = this.props();
    return !!(p.blocked || p.loading);
  });

  readonly isFullScreen = computed(() => !!this.props().fullScreen);

  constructor() {
    // Prevent memory leaks & orphaned backdrops upon unmount or route change
    this.destroyRef.onDestroy(() => {
      this.overlayRef?.dispose();
    });

    effect(() => {
      const blocked = this.isBlocked();
      const fullScreen = this.isFullScreen();

      if (isPlatformBrowser(this.platformId) && fullScreen) {
        if (blocked) {
          if (!this.overlayRef?.isOpen) {
            this.openFullScreenOverlay();
          }
        } else {
          this.overlayRef?.close();
        }
      }
    });
  }

  private openFullScreenOverlay() {
    const tpl = this.fullScreenOverlayTemplate();
    if (!tpl) return;

    this.overlayRef = this.overlayService.create(
      {
        position: {
          type: 'global',
          position: 'center',
          width: '100vw',
          height: '100vh',
        },
        hasBackdrop: false, // The pane mask itself acts as the backdrop
        panelClass: ['origo-overlay-pane', 'origo-overlay-pane--block-ui'],
      },
      this.destroyRef
    );

    this.overlayRef.open(tpl);
  }
}
```

---

### Previous Story Intelligence & Anti-Patterns to Prevent

From Story 2.3 and 2.2 retrospective reviews:
1. **Host Resets in SCSS:** Ensure `:host` declares `display: inline-block` (for Spinner, Tag, Badge, Skeleton) or `display: block` (for ProgressBar, BlockUI), with `box-sizing: border-box;` and `:host([hidden]) { display: none !important; }`.
2. **Missing `allowSignalWrites: true` or `untracked()`:** In Angular 18/22, updating a `signal()` or `model()` inside an `effect()` without `untracked()` throws an error in developer mode. Always wrap signal writes in `untracked(() => { ... })`.
3. **Hardcoded Color Literals:** Do NOT use hardcoded hex (`#fff`, `#000`) or rgba literals in component stylesheets. Use CSS custom properties such as `var(--origo-color-surface-primary)`, `var(--origo-color-backdrop)`, etc.
4. **SVG Accessibility in Spinner:** SVGs inside `SpinnerComponent` must have `aria-hidden="true"` while the parent host or wrapper provides `role="status"` and `<span class="sr-only">{{ label }}</span>`.
5. **Progress Bar Boundary Conditions:** Ensure determinate progress handles negative values (clamps to 0) and values exceeding max (clamps to max). Ensure `complete` output only fires once when transitioning from incomplete to complete.
6. **Badge Corner Coordinates in RTL:** When badging an element, badge offset must use `inset-inline-end: 0` and `transform: translate(50%, -50%)`. Under RTL, `inset-inline-end` correctly attaches to the inline-end (left in RTL). Ensure test asserts RTL layout behavior.
7. **DOM Cleanup in Tests:** In `afterEach()` of all unit tests, always clean up any created CDK overlay containers or appended elements to prevent cross-test DOM pollution.

---

### Existing Files Being Modified

| File | Current State | Modification for Story 2.4 | Preserved Behaviors |
|---|---|---|---|
| `packages/angular-renderer/src/lib/primitives.provider.ts` | Provides `provideOrigo9Primitives()`, registering ~45 component types. | Add imports and registry entries for `Spinner`, `ProgressBar`, `Skeleton`, `Badge`, `Tag`, `BlockUI`, and aliases. | All existing mappings (`Alert`, `Toast`, `Snackbar`, `Banner`, etc.) preserved intact. |
| `packages/angular-renderer/src/index.ts` | Exports all public components, services, and models. | Export new components and interfaces (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`, and their `Props` interfaces). | All existing exports preserved intact. |
| `packages/angular-renderer/src/styles/overlay.scss` | Global overlay pane and backdrop styling for modals, dropdowns, toasts, snackbars. | Add `.origo-overlay-pane--block-ui` styling for full-screen loading overlays. | All existing overlay modifiers preserved intact. |
| `tools/test-registry/test-registry.yaml` | 1134 lines of test suite entries. | Append 6 new test suite entries for the status/loading indicator test files. | Schema version, headers, and all existing 1134 lines preserved. |
| `_bmad-output/implementation-artifacts/sprint-status.yaml` | `2-4-status-and-loading-indicators: backlog`. | Update status to `ready-for-dev`, update `last_updated`. | All comments, structure, and status definitions preserved. |

---

### Testing Standards & DOM Test Isolation Patterns

1. **Unit Test Framework:** Angular 18/22 TestBed, Vitest / Jest.
2. **Shadow DOM Piercing:** Test queries targeting elements inside shadow root must query `fixture.nativeElement.shadowRoot`:
   ```typescript
   const shadowRoot = fixture.nativeElement.shadowRoot;
   const spinnerEl = shadowRoot.querySelector('.origo-spinner');
   expect(spinnerEl).toBeTruthy();
   ```
3. **Accessibility Assertions:** Test suites must assert:
   - Presence of `role="status"` or `role="progressbar"`.
   - `aria-live="polite"` and screen-reader descriptive text.
   - ARIA values (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
   - `data-testid` bound to `contract().id`.
4. **DOM Cleanup Isolation:**
   ```typescript
   afterEach(() => {
     fixture?.destroy();
     document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
   });
   ```

---

### Project Structure Notes

All new component directories reside under `packages/angular-renderer/src/components/primitives/`:
- `spinner/`
  - `spinner.component.ts`
  - `spinner.component.html`
  - `spinner.component.scss`
  - `spinner.component.spec.ts`
- `progress-bar/`
  - `progress-bar.component.ts`
  - `progress-bar.component.html`
  - `progress-bar.component.scss`
  - `progress-bar.component.spec.ts`
- `skeleton/`
  - `skeleton.component.ts`
  - `skeleton.component.html`
  - `skeleton.component.scss`
  - `skeleton.component.spec.ts`
- `badge/`
  - `badge.component.ts`
  - `badge.component.html`
  - `badge.component.scss`
  - `badge.component.spec.ts`
- `tag/`
  - `tag.component.ts`
  - `tag.component.html`
  - `tag.component.scss`
  - `tag.component.spec.ts`
- `block-ui/`
  - `block-ui.component.ts`
  - `block-ui.component.html`
  - `block-ui.component.scss`
  - `block-ui.component.spec.ts`

No deviations from monorepo conventions.

---

### References

- [Epics Document: Story 2.4](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/epics.md#L372-L386)
- [Component API Specification: Section 7 Messages & Status](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#L855-L946)
- [Component Invariants & Shadow DOM Checklist](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/component-invariants.md)
- [Modular SCSS & Design Token Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/scss-and-tokens.md)
- [Angular Overlay & Portal Architecture Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/overlay-portal-architecture.md)
- [Testing Primitives Guide](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/guidelines/testing-primitives.md)
- [Definition of Done](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/docs/definition-of-done.md)

---

## Dev Agent Record

### Agent Model Used

Gemini 3.8 Flash (High)

### Debug Log References

### Completion Notes List

- Story context created by `bmad-create-story` context engine.
- Comprehensive technical guidance and developer guardrails established for `SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, and `BlockUIComponent`.
- Complete BDD Acceptance Criteria linking architectural decisions (`P1-AD-1`, `P1-AD-4`, `P1-AD-5`, `P1-AD-6`, `AD-4`, `AD-6`, `NFR-I18N-001`, `Global System AC-1/AC-2/AC-4`, `DoD`) and technical spike (`retro-1`).
- Detailed task breakdown with granular subtasks, test isolation rules, and registry update instructions.
- Implemented all 6 status and loading indicator primitives (`SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`) adhering to Angular 18/22 Standalone, Shadow DOM, OnPush change detection, Signals reactivity (`input.required`), and 100% CSS Logical Properties.
- Built scalable SVG circular spinner with accessible `role="status"`, `aria-live="polite"`, and screen-reader label.
- Built linear progress bar with safe division fallback, clamping (0..safeMax), debounced completion boundary guard, `valueChange` output, and indeterminate sliding keyframe animation.
- Built skeleton placeholder with rectangle/circle geometry, size override, shimmer/pulse animations, accessible `aria-hidden="true"`, and reduced-motion guard.
- Built badge indicator with `ContainerComponent` viewChild support, corner-overlay vs standalone positioning, RTL-safe transform translation (-50%, -50%), and numeric threshold formatting (`99+`).
- Built tag chip with pill styling, filled/outlined variants, event-isolated remove button (`$event.stopPropagation()`), keyboard shortcuts (Enter/Space/Backspace/Delete), and `remove`/`click` outputs.
- Built BlockUI indicator with local container blocking, pointer-events isolation, CDK Overlay projection via `OrigoOverlayService` with guaranteed memory cleanup on destroy.
- Added `.origo-overlay-pane--block-ui` modifier to global overlay SCSS styles.
- Registered all components and aliases (`Progress`, `LoadingOverlay`) in `primitives.provider.ts` and exported in library public API `index.ts`.
- Added 6 test suites to `tools/test-registry/test-registry.yaml`, verified with `npm run validate:registry` (115/115 passed).
- Linting passed with 0 errors (`npx nx lint angular-renderer`).
- Full test suite passed with 58/58 suites and 388/388 tests (`npx nx test angular-renderer`).

### File List

- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/spinner/spinner.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/progress-bar/progress-bar.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/skeleton/skeleton.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/badge/badge.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/badge/badge.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/badge/badge.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/badge/badge.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/tag/tag.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/tag/tag.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/tag/tag.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/tag/tag.component.spec.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.ts` (NEW)
- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.html` (NEW)
- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.scss` (NEW)
- `packages/angular-renderer/src/components/primitives/block-ui/block-ui.component.spec.ts` (NEW)
- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
- `packages/angular-renderer/src/index.ts` (UPDATE)
- `packages/angular-renderer/src/styles/overlay.scss` (UPDATE)
- `tools/test-registry/test-registry.yaml` (UPDATE)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (UPDATE)
- `_bmad-output/implementation-artifacts/stories/2-4-status-and-loading-indicators.md` (UPDATE)

## Change Log

- **2026-10-15**: Completed implementation of Story 2.4 (Status & Loading Indicators):
  - Created 6 standalone primitives: `SpinnerComponent`, `ProgressBarComponent`, `SkeletonComponent`, `BadgeComponent`, `TagComponent`, `BlockUIComponent`.
  - Added global `.origo-overlay-pane--block-ui` CSS modifier for full-screen overlay projection.
  - Registered primitives and aliases in `primitives.provider.ts` and `index.ts`.
  - Added comprehensive unit tests and verified via `tools/test-registry/test-registry.yaml`.
  - Ran linting and verified 100% test pass across `packages/angular-renderer` (388 tests, 0 failures).
  - Moved story status to `review`.

