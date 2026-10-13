Invoke the `bmad-review-edge-case-hunter` skill on this diff:

```diff
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index e0d0fc2..aa1e3d8 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -1,5 +1,5 @@
 # generated: 2026-10-07T19:00:21+05:30
-# last_updated: 2026-10-07T19:00:21+05:30
+# last_updated: 2026-10-13T19:42:00+05:30
 # project: origo-design
 # project_key: NOKEY
 # tracking_system: file-system
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-10-07T19:00:21+05:30
-last_updated: 2026-10-13T17:51:00+05:30
+last_updated: 2026-10-13T19:15:00+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -59,7 +59,7 @@ development_status:
   retro-1-overlay-portal-architecture: done
   epic-2: in-progress
   2-1-navigation-components: done
-  2-2-modal-and-overlay-components: backlog
+  2-2-modal-and-overlay-components: review
   2-3-messaging-and-notification-components: backlog
   2-4-status-and-loading-indicators: backlog
   2-5-utility-and-interaction-behaviors: backlog
diff --git a/_bmad-output/implementation-artifacts/stories/2-2-modal-and-overlay-components.md b/_bmad-output/implementation-artifacts/stories/2-2-modal-and-overlay-components.md
new file mode 100644
index 0000000..72e57bf
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/stories/2-2-modal-and-overlay-components.md
@@ -0,0 +1,788 @@
+---
+story_id: "2.2"
+story_key: 2-2-modal-and-overlay-components
+baseline_commit: 8f0124d
+epic: 2
+status: "review"
+---
+
+# Story 2.2: Modal & Overlay Components
+
+Status: review
+
+## Story
+
+As a developer,  
+I want to display overlays, dialogs, drawers, popovers, and tooltips (`Modal`, `Dialog`, `Drawer`, `Popover`, `Tooltip`),  
+So that I can gather input, confirm actions, present contextual details, and display supplementary information without navigating away from the page or breaking Shadow DOM encapsulation.
+
+---
+
+## Acceptance Criteria
+
+1. **[AC-1] Production Angular CDK Overlay & Portal Substrate (ADR: P1-AD-5, Spike: retro-1, System Constraint 4):**
+   - **Given** an Origo Angular 18/22 standalone rendering environment with `ViewEncapsulation.ShadowDom`,
+   - **When** any overlay primitive (`DialogComponent`, `ModalComponent`, `DrawerComponent`, `PopoverComponent`, `TooltipComponent`) is instantiated and opened,
+   - **Then** the floating panel MUST project outside the component's ShadowRoot into `document.body` via `OrigoOverlayService` (`packages/angular-renderer/src/lib/overlay/overlay.service.ts`), completely escaping all parent container `overflow: hidden`, `overflow: auto`, and CSS stacking context clipping boundaries (`z-index` trapping).
+   - **And** all overlays MUST support dynamic backdrop rendering, custom backdrop classes, and configurable positioning strategies (`global` center/top/bottom/start/end or `connected` target-anchored).
+
+2. **[AC-2] Shadow-DOM-Aware Keyboard Navigation & Focus Trapping (ADR: P1-AD-6, Spike: retro-1, FR-A11Y-001):**
+   - **Given** an open modal overlay (`DialogComponent`, `ModalComponent`, `DrawerComponent`),
+   - **When** the overlay transitions to visible,
+   - **Then** focus must automatically move into the overlay panel, capturing `previousFocusedElement` recursively via `getDeepActiveElement(document)` across Shadow DOM boundaries (`shadowRoot.activeElement`).
+   - **And** pressing `Tab` or `Shift+Tab` must cycle focus exclusively within the focusable elements inside the overlay (strict focus trap).
+   - **And** pressing `Escape` (when `closeOnEscape` is true, default `true`) must close the overlay, emit corresponding close outputs, and restore focus directly to `previousFocusedElement` inside the originating trigger's ShadowRoot.
+   - **And** all components must pass automated accessibility audits with zero WCAG 2.1 AA violations.
+
+3. **[AC-3] Shadow DOM Event Piercing & Outside-Click Dismissal (ADR: AD-4, P1-AD-1, Spike: retro-1):**
+   - **Given** an active overlay with backdrop dismissal (`dismissableMask` / `dismissible` on Dialog/Drawer) or outside-click dismissal (`dismissible` on Popover),
+   - **When** a user clicks anywhere in the document,
+   - **Then** the dismissal handler MUST evaluate `event.composedPath()` across Shadow DOM boundaries to determine whether the click occurred inside the overlay panel, within the trigger element, or outside both.
+   - **And** standard `event.target` retargeting must NEVER trigger false positive dismissals on clicks within internal shadow DOM nodes or fail to dismiss on external clicks.
+   - **And** all document event listeners and overlay portal instances must automatically detach and dispose on component teardown via Angular `DestroyRef`.
+
+4. **[AC-4] Zero Literal SCSS, Design Tokens & RTL Mirroring (ADR: AD-6, P1-AD-2, NFR-I18N-001):**
+   - **Given** any overlay component stylesheet (`.scss`) or global overlay panel style in `packages/angular-renderer/src/styles/overlay.scss`,
+   - **When** rendered in the browser,
+   - **Then** it must strictly utilize semantic CSS variables (`var(--origo-*)`) from `@origo/design-tokens` without any hardcoded fallback literals, hex colors, or pixel values.
+   - **And** it must strictly use CSS Logical Properties (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-start`, `inset-inline-end`, `max-inline-size`, `max-block-size`) to ensure 100% automated Right-to-Left (RTL) layout mirroring.
+   - **And** `OrigoOverlayService` direction resolution must propagate `dir="rtl"` to `.origo-overlay-pane[dir='rtl']` to maintain bidirectional layout symmetry across portal boundaries.
+
+5. **[AC-5] Dynamic Child AST Substrate (`ContainerComponent`) (ADR: P1-AD-5, P1-AD-1):**
+   - **Given** a dynamic BADL AST rendering lifecycle where dialogs, drawers, or popovers contain child components (e.g., forms, buttons, cards),
+   - **When** child nodes are nested within overlay primitives,
+   - **Then** `DialogComponent`, `ModalComponent`, `DrawerComponent`, `PopoverComponent`, and `TooltipComponent` MUST implement `ContainerComponent`.
+   - **And** components MUST declare `vc = viewChild('vc', { read: ViewContainerRef })` (optional Signal query). Using `viewChild.required('vc')` is strictly FORBIDDEN because query resolution fails with fatal runtime error `NG0951` when `#vc` is hosted within unattached `<ng-template>` views.
+   - **And** components MUST provide `<ng-container #vc></ng-container>` and content projection (`<ng-content></ng-content>`) to host dynamic child AST subtrees seamlessly.
+
+6. **[AC-6] Angular Standalone, Signals Reactivity, & Runtime Property Coercion (ADR: P1-AD-1):**
+   - **Given** incoming BADL AST payloads,
+   - **When** overlay primitives are instantiated,
+   - **Then** they must be Angular Standalone components with `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`, consume inputs via Angular Signals (`input.required<InteractionContract<T>>()`, `computed()`), and emit typed outputs (`output()`).
+   - **And** each component must define `static readonly contractSchema` covering 100% of defined properties and invoke `coerceContractProps()` on incoming `this.contract().props` to guard against runtime crashes from malformed JSON payloads.
+
+7. **[AC-7] State Synchronization & Capability Dispatch (ADR: AD-11):**
+   - **Given** user interactions and visibility changes (opening, closing, maximizing, resizing, trigger hover/click),
+   - **When** an overlay state transitions,
+   - **Then** the component must emit corresponding typed outputs (`visibleChange`, `open`, `close`, `show`, `hide`, etc.) and synchronize state via `WebExperienceAdapterService` (`updateState(id, 'visible', isVisible)` and `dispatchCapability(id, capabilityName, payload)`).
+
+8. **[AC-8] Metadata Hooks & Test Selectors (ADR: AD-12):**
+   - **Given** any overlay component instance (`DialogComponent`, `ModalComponent`, `DrawerComponent`, `PopoverComponent`, `TooltipComponent`),
+   - **When** rendered from a BADL payload,
+   - **Then** it must expose standard metadata hooks (`permissions`, `rules`, `metadata`, `aria-label`, `aria-describedby`) and bind `[attr.data-testid]="contract().id"` on both the host element and the floating overlay panel.
+
+9. **[AC-9] Server-Side Rendering (SSR) Safety & Hydration Guards (Global System AC-2):**
+   - **Given** an SSR or Angular hydration lifecycle,
+   - **When** overlay components are initialized,
+   - **Then** direct access to browser DOM globals (`window`, `document`) must be strictly guarded via `isPlatformBrowser(inject(PLATFORM_ID))` and injected `DOCUMENT`.
+   - **And** in non-browser environments, `OrigoOverlayService.create()` must return `OrigoNoopOverlayRef` ensuring safe, zero-crash execution during server execution.
+
+10. **[AC-10] Strict Content Security Policy (CSP) Compliance (Global System AC-1, ADR: AD-6):**
+    - **Given** strict enterprise Content Security Policy environments,
+    - **When** overlay panels and backdrops are dynamically mounted into `document.body`,
+    - **Then** zero inline `style="..."` attributes may be injected onto body nodes; styling must be governed strictly through predefined CSS classes (`.origo-overlay-pane`, `.origo-overlay-backdrop`, `.origo-dialog-pane`, `.origo-drawer-pane`, `.origo-popover-pane`, `.origo-tooltip-pane`) and CSS custom properties.
+    - **And** all interactive controls (close buttons, action buttons) must be semantic `<button type="button">` elements with explicit Angular event bindings—never `href="javascript:void(0)"`.
+
+11. **[AC-11] Definition of Done (DoD), Registration & Central Test Registry (DoD: docs/definition-of-done.md, ADR: AD-11, AD-12):**
+    - **Given** completion of the overlay components,
+    - **When** prepared for release,
+    - **Then** all primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts` (`'Dialog'`, `'Modal'`, `'Drawer'`, `'Popover'`, `'Tooltip'`), exported from `packages/angular-renderer/src/index.ts`.
+    - **And** `tools/test-registry/test-registry.yaml` MUST be updated with new entries `renderer-primitive-dialog`, `renderer-primitive-modal`, `renderer-primitive-drawer`, `renderer-primitive-popover`, and `renderer-primitive-tooltip` specifying `spec_file`, type `unit`, and `affected_stories: [2-2-modal-and-overlay-components]`.
+
+12. **[AC-12] Architectural Scope & Deferred Primitives (ADR: P1-AD-5, Epics.md Story 2.2):**
+    - **Given** the component API specification for Phase 2 Overlays,
+    - **When** implementing Story 2.2,
+    - **Then** scope is strictly bounded to `DialogComponent`, `ModalComponent`, `DrawerComponent`, `PopoverComponent`, and `TooltipComponent`.
+    - **And** `ConfirmationDialog` (composite confirmation workflow) and `BottomSheet` (mobile gesture drawer) are explicitly out of scope for Story 2.2 and deferred to subsequent specialized stories.
+
+---
+
+## ⚠️ Critical: Existing Code — Read Before Writing Anything
+
+### EXISTING OVERLAY INFRASTRUCTURE TO REUSE (DO NOT REINVENT)
+
+- **`OrigoOverlayService`** (`packages/angular-renderer/src/lib/overlay/overlay.service.ts`):
+  - **Established in Spike `retro-1`:** Wraps Angular CDK Overlay (`@angular/cdk@22.0.7`).
+  - **Capabilities:**
+    - `create<T>(config: OrigoOverlayConfig, destroyRef?: DestroyRef): OrigoOverlayRef<T>`
+    - Supports `position.type === 'global'` (alignment: `'center'`, `'top'`, `'bottom'`, `'start'`, `'end'`, plus `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`).
+    - Supports `position.type === 'connected'` (anchored to `target: ElementRef | HTMLElement`, with `originX`, `originY`, `overlayX`, `overlayY`, `offset: [number, number]`, and `autoRepositionOnResize: true`).
+    - Built-in `hasBackdrop`, `backdropClass`, `closeOnBackdropClick`, `closeOnOutsideClick` with `event.composedPath()` Shadow DOM piercing, `closeOnEscape`, `trapFocus`, `themeScope` inheritance, and `direction: 'ltr' | 'rtl'`.
+  - **Rule:** DO NOT recreate or duplicate CDK overlay creation logic. All overlay components in this story MUST inject `OrigoOverlayService` and call `this.overlayService.create(...)`.
+
+- **`OrigoOverlayRef` & `OrigoOverlayRefImpl`** (`packages/angular-renderer/src/lib/overlay/overlay-ref.ts`):
+  - Provides `open(content, vcr)`, `close(result)`, `afterClosed(): Promise<T>`, `updatePosition()`, `dispose()`.
+  - Manages `previousFocusedElement = getDeepActiveElement(document)` and restores focus on close.
+  - Automatically unbinds document listeners and tears down portals via `destroyRef`.
+
+- **`coerceContractProps` & `AdapterPipelineService`** (`packages/angular-renderer/src/adapters/web/adapter.ts`):
+  - Validates and coerces props against each component's `static readonly contractSchema`.
+  - Guarantees types are valid booleans, numbers, strings, arrays, or objects before runtime execution.
+
+- **`WebExperienceAdapterService`** (`packages/angular-renderer/src/adapters/web/experience-adapter.service.ts`):
+  - Injectable service for BADL state updates: `updateState(contractId, stateKey, value)`.
+  - Injectable service for capability dispatching: `dispatchCapability(contractId, capabilityName, payload)`.
+
+- **Global Overlay Stylesheet** (`packages/angular-renderer/src/styles/overlay.scss`):
+  - Already contains base classes: `.cdk-overlay-container`, `.cdk-overlay-backdrop`, `.origo-overlay-backdrop`, `.cdk-overlay-pane`, `.origo-overlay-pane`, `.origo-overlay-pane--connected`, `.origo-overlay-pane--modal`, `.theme-dark`, `.theme-light`, `.high-contrast`.
+  - Must be enhanced with modifiers for dialog, drawer slide panels, popovers, and tooltips while preserving all existing token rules.
+
+---
+
+## NEW COMPONENTS TO CREATE
+
+### 1. `DialogComponent` (`packages/angular-renderer/src/components/primitives/dialog/`)
+- **Registry Key:** `'Dialog'`
+- **Selector:** `origo-dialog`
+- **Inputs (`DialogProps`):**
+  ```typescript
+  export interface DialogProps {
+    visible?: boolean;              // Open state (default false)
+    header?: string;               // Dialog title / header
+    modal?: boolean;                // Backdrop behavior (default true)
+    closable?: boolean;             // Displays close action button (default true)
+    closeOnEscape?: boolean;        // Escape key closes dialog (default true)
+    dismissableMask?: boolean;      // Backdrop click closes dialog (default false)
+    draggable?: boolean;            // Enables dragging (default false)
+    resizable?: boolean;            // Enables resizing (default false)
+    maximizable?: boolean;          // Displays maximize toggle button (default false)
+    maximized?: boolean;            // Current maximized state (default false)
+    width?: string;                 // Dialog width (e.g. '560px', '75vw', default '560px')
+    height?: string;                // Dialog height (e.g. 'auto', '400px')
+    minWidth?: string;              // Dialog minWidth
+    minHeight?: string;             // Dialog minHeight
+    maxWidth?: string;              // Dialog maxWidth (default '90vw')
+    maxHeight?: string;             // Dialog maxHeight (default '90vh')
+    position?: 'center' | 'top' | 'bottom' | 'start' | 'end'; // Screen alignment (default 'center')
+    blockScroll?: boolean;          // Prevents background scroll when open (default true)
+    data?: unknown;                 // Contextual data payload
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
+  - `maximize = output<boolean>()`
+  - `restore = output<void>()`
+  - `dragEnd = output<{ x: number; y: number }>()`
+  - `resizeEnd = output<{ width: number; height: number }>()`
+- **Architecture & Invariant Compliance:**
+  - Angular Standalone, `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`.
+  - Implements `OrigoAdapter<DialogProps>`, `ContainerComponent`.
+  - Declares `vc = viewChild('vc', { read: ViewContainerRef })` (optional query; never `.required`!).
+  - Injects `OrigoOverlayService`, `DestroyRef`, `ViewContainerRef`, `WebExperienceAdapterService`.
+  - Template defines `<ng-template #dialogTemplate>` containing the floating dialog pane projected via `this.overlayRef.open(this.dialogTemplate, this.vcr)`.
+  - Dragging & Resizing boundaries:
+    - No `@angular/cdk/drag-drop` dependency.
+    - Dragging uses lightweight native pointer events (`pointerdown` on header, tracking delta x/y, emitting `dragEnd`).
+    - Resizing uses CSS `resize: both` with `ResizeObserver` observing dimensions and emitting `resizeEnd`.
+  - Maximizing toggles `isMaximized()` signal between contract size and 100vw/100vh bounds.
+  - Template structure:
+    ```html
+    <ng-template #dialogTemplate>
+      <div
+        role="dialog"
+        aria-modal="true"
+        class="origo-dialog"
+        [class.origo-dialog--maximized]="isMaximized()"
+        [attr.aria-labelledby]="computedHeader() ? headerId : null"
+        [attr.aria-label]="!computedHeader() ? computedAriaLabel() : null"
+        [attr.aria-describedby]="contentId"
+        [attr.data-testid]="contract().id"
+      >
+        <div class="origo-dialog__header">
+          @if (computedHeader()) {
+            <h2 [id]="headerId" class="origo-dialog__title">{{ computedHeader() }}</h2>
+          }
+          <div class="origo-dialog__header-actions">
+            @if (computedMaximizable()) {
+              <button
+                type="button"
+                class="origo-dialog__action origo-dialog__action--maximize"
+                [attr.aria-label]="isMaximized() ? 'Restore dialog' : 'Maximize dialog'"
+                (click)="toggleMaximize()"
+              >
+                <span class="origo-dialog__action-icon">{{ isMaximized() ? '🗗' : '🗖' }}</span>
+              </button>
+            }
+            @if (computedClosable()) {
+              <button
+                type="button"
+                class="origo-dialog__action origo-dialog__action--close"
+                aria-label="Close dialog"
+                (click)="onClose()"
+              >
+                <span class="origo-dialog__action-icon">✕</span>
+              </button>
+            }
+          </div>
+        </div>
+        <div [id]="contentId" class="origo-dialog__content">
+          <ng-container #vc></ng-container>
+          <ng-content></ng-content>
+        </div>
+      </div>
+    </ng-template>
+    ```
+
+---
+
+### 2. `ModalComponent` (`packages/angular-renderer/src/components/primitives/modal/`)
+- **Registry Key:** `'Modal'`
+- **Selector:** `origo-modal`
+- **Purpose:** Dedicated modal primitive enforcing `modal: true` backdrop lock by architectural contract.
+- **Architectural Invariant Enforcement (ADR: P1-AD-5):**
+  - Subclassing/inheritance is strictly forbidden (`export class ModalComponent extends DialogComponent` violates `P1-AD-5`).
+  - Standalone component with its own directory, `modal.component.ts`, `modal.component.html`, `modal.component.scss`, and `modal.component.spec.ts`.
+  - Implements `OrigoAdapter<ModalProps>`, `ContainerComponent`.
+  - Composition Pattern: Implements clean delegation by rendering `<origo-dialog>` in its template with `[contract]="coercedModalContract()"` and passing through `<ng-container #vc>` and `<ng-content>`, OR directly implements the overlay workflow with `modal: true` hardcoded as the default.
+- **Inputs (`ModalProps`):**
+  - Identical to `DialogProps`, with `modal: true` strictly enforced.
+- **Outputs:**
+  - `visibleChange = output<boolean>()`
+  - `open = output<void>()`
+  - `close = output<void>()`
+  - `maximize = output<boolean>()`
+
+---
+
+### 3. `DrawerComponent` (`packages/angular-renderer/src/components/primitives/drawer/`)
+- **Registry Key:** `'Drawer'` (and alias `'SidebarDrawer'`)
+- **Selector:** `origo-drawer`
+- **Inputs (`DrawerProps`):**
+  ```typescript
+  export interface DrawerProps {
+    visible?: boolean;                                    // Open state (default false)
+    position?: 'left' | 'right' | 'top' | 'bottom';       // Slide-in edge (default 'left')
+    modal?: boolean;                                      // Adds backdrop (default true)
+    dismissible?: boolean;                                // Closes from backdrop click (default true)
+    closeOnEscape?: boolean;                              // Closes with Escape (default true)
+    blockScroll?: boolean;                                // Prevents background scroll (default true)
+    size?: string;                                        // Drawer width/height (e.g. '320px', '25rem', default '320px')
+    header?: string;                                      // Header title content
+    footer?: string;                                      // Footer content
+    closable?: boolean;                                   // Displays close action button (default true)
+    data?: unknown;                                       // Contextual data
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
+  - `show = output<void>()`
+  - `hide = output<void>()`
+- **Architecture & Template Structure:**
+  - Standalone, `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`.
+  - Implements `OrigoAdapter<DrawerProps>`, `ContainerComponent`.
+  - Declares `vc = viewChild('vc', { read: ViewContainerRef })` (optional query).
+  - Global positioning mapping:
+    - `'left'` -> mapped to `'start'` (RTL-aware, `height: '100%'`, width: `size`)
+    - `'right'` -> mapped to `'end'` (RTL-aware, `height: '100%'`, width: `size`)
+    - `'top'` -> mapped to `'top'` (`width: '100%'`, height: `size`)
+    - `'bottom'` -> mapped to `'bottom'` (`width: '100%'`, height: `size`)
+  - Panel classes: `['origo-overlay-pane--drawer', 'origo-overlay-pane--drawer-' + computedPosition()]`.
+  - Focus trap inside drawer panel with Escape key and backdrop dismissal.
+  - Template structure:
+    ```html
+    <ng-template #drawerTemplate>
+      <div
+        role="dialog"
+        aria-modal="true"
+        class="origo-drawer"
+        [class.origo-drawer--left]="computedPosition() === 'left'"
+        [class.origo-drawer--right]="computedPosition() === 'right'"
+        [class.origo-drawer--top]="computedPosition() === 'top'"
+        [class.origo-drawer--bottom]="computedPosition() === 'bottom'"
+        [attr.aria-labelledby]="computedHeader() ? headerId : null"
+        [attr.aria-label]="!computedHeader() ? computedAriaLabel() : null"
+        [attr.data-testid]="contract().id"
+      >
+        <div class="origo-drawer__header">
+          @if (computedHeader()) {
+            <h2 [id]="headerId" class="origo-drawer__title">{{ computedHeader() }}</h2>
+          }
+          @if (computedClosable()) {
+            <button type="button" class="origo-drawer__close" aria-label="Close drawer" (click)="onClose()">
+              ✕
+            </button>
+          }
+        </div>
+        <div class="origo-drawer__content">
+          <ng-container #vc></ng-container>
+          <ng-content></ng-content>
+        </div>
+        @if (computedFooter()) {
+          <div class="origo-drawer__footer">{{ computedFooter() }}</div>
+        }
+      </div>
+    </ng-template>
+    ```
+
+---
+
+### 4. `PopoverComponent` (`packages/angular-renderer/src/components/primitives/popover/`)
+- **Registry Key:** `'Popover'`
+- **Selector:** `origo-popover`
+- **Inputs (`PopoverProps`):**
+  ```typescript
+  export interface PopoverProps {
+    visible?: boolean;                                    // Visibility state (default false)
+    placement?: 'top' | 'bottom' | 'left' | 'right' |
+                'top-start' | 'top-end' |
+                'bottom-start' | 'bottom-end' |
+                'left-start' | 'left-end' |
+                'right-start' | 'right-end';              // Preferred placement (default 'bottom')
+    dismissible?: boolean;                                // Closes on outside click (default true)
+    closeOnEscape?: boolean;                              // Closes on Escape (default true)
+    showClose?: boolean;                                  // Displays close button (default false)
+    offset?: [number, number];                            // Offset [x, y] in pixels (default [0, 8])
+    title?: string;                                       // Popover title
+    data?: unknown;                                       // Contextual data
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
+  - `action = output<unknown>()`
+- **Architecture & Connected Placement Mapping:**
+  - Standalone, `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`.
+  - Implements `OrigoAdapter<PopoverProps>`, `ContainerComponent`.
+  - Connected positioning anchored to host trigger wrapper element (`#triggerWrapper`).
+  - Outside click evaluated via `event.composedPath()` Shadow DOM piercing.
+  - Template structure:
+    ```html
+    <div
+      #triggerWrapper
+      class="origo-popover__trigger-wrapper"
+      [attr.aria-expanded]="isOpen()"
+      [attr.aria-haspopup]="'dialog'"
+      (click)="toggle()"
+    >
+      <ng-content select="[slot=trigger]"></ng-content>
+      <ng-content></ng-content>
+    </div>
+
+    <ng-template #popoverTemplate>
+      <div
+        role="dialog"
+        class="origo-popover"
+        [attr.data-testid]="contract().id"
+        [attr.aria-label]="computedAriaLabel()"
+      >
+        @if (computedTitle() || computedShowClose()) {
+          <div class="origo-popover__header">
+            @if (computedTitle()) {
+              <div class="origo-popover__title">{{ computedTitle() }}</div>
+            }
+            @if (computedShowClose()) {
+              <button type="button" class="origo-popover__close" aria-label="Close popover" (click)="closePopover()">
+                ✕
+              </button>
+            }
+          </div>
+        }
+        <div class="origo-popover__content">
+          <ng-container #vc></ng-container>
+          <ng-content></ng-content>
+        </div>
+      </div>
+    </ng-template>
+    ```
+
+---
+
+### 5. `TooltipComponent` (`packages/angular-renderer/src/components/primitives/tooltip/`)
+- **Registry Key:** `'Tooltip'`
+- **Selector:** `origo-tooltip`
+- **Inputs (`TooltipProps`):**
+  ```typescript
+  export interface TooltipProps {
+    content?: string;                                     // Tooltip text/content (required)
+    position?: 'top' | 'bottom' | 'left' | 'right';       // Placement (default 'top')
+    showDelay?: number;                                   // Delay before showing in ms (default 150)
+    hideDelay?: number;                                   // Delay before hiding in ms (default 150)
+    disabled?: boolean;                                   // Disables tooltip (default false)
+    trigger?: 'hover' | 'focus' | 'both' | 'manual';      // Activation triggers (default 'both')
+    offset?: [number, number];                            // Offset [x, y] in pixels (default [0, 6])
+    permissions?: Record<string, string>;
+    rules?: Record<string, unknown>;
+    metadata?: Record<string, unknown>;
+    'aria-label'?: string;
+    'aria-describedby'?: string;
+  }
+  ```
+- **Outputs:**
+  - `show = output<void>()`
+  - `hide = output<void>()`
+- **Architecture & Connected Placement Mapping:**
+  - Standalone, `ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`.
+  - Implements `OrigoAdapter<TooltipProps>`, `ContainerComponent`.
+  - Connected positioning anchored to host `#triggerWrapper`.
+  - Accessible ARIA integration:
+    - Host trigger wrapper binds `[attr.aria-describedby]="isOpen() ? tooltipId : null"`.
+    - Floating tooltip panel has `role="tooltip"`, `[id]="tooltipId"`.
+  - Trigger listeners:
+    - `mouseenter` / `mouseleave` (if trigger is `'hover'` or `'both'`) with `showDelay` / `hideDelay` timers.
+    - `focusin` / `focusout` (if trigger is `'focus'` or `'both'`).
+    - `Escape` key immediately closes the tooltip without delay.
+  - Template structure:
+    ```html
+    <div
+      #triggerWrapper
+      class="origo-tooltip__trigger-wrapper"
+      [attr.aria-describedby]="isOpen() ? tooltipId : null"
+      (mouseenter)="onMouseEnter()"
+      (mouseleave)="onMouseLeave()"
+      (focusin)="onFocusIn()"
+      (focusout)="onFocusOut()"
+    >
+      <ng-container #vc></ng-container>
+      <ng-content></ng-content>
+    </div>
+
+    <ng-template #tooltipTemplate>
+      <div
+        [id]="tooltipId"
+        role="tooltip"
+        class="origo-tooltip"
+        [class.origo-tooltip--top]="computedPosition() === 'top'"
+        [class.origo-tooltip--bottom]="computedPosition() === 'bottom'"
+        [class.origo-tooltip--left]="computedPosition() === 'left'"
+        [class.origo-tooltip--right]="computedPosition() === 'right'"
+        [attr.data-testid]="contract().id"
+      >
+        <span class="origo-tooltip__text">{{ computedContent() }}</span>
+      </div>
+    </ng-template>
+    ```
+
+---
+
+### EXISTING REGISTRATION, STYLES & CONFIG FILES TO UPDATE
+
+1. **`packages/angular-renderer/src/lib/primitives.provider.ts`:**
+   - Import `DialogComponent`, `ModalComponent`, `DrawerComponent`, `PopoverComponent`, `TooltipComponent`.
+   - Register entries in `provideOrigo9Primitives()`:
+     - `['Dialog', DialogComponent]`
+     - `['Modal', ModalComponent]`
+     - `['Drawer', DrawerComponent]`
+     - `['SidebarDrawer', DrawerComponent]` (alias)
+     - `['Popover', PopoverComponent]`
+     - `['Tooltip', TooltipComponent]`
+
+2. **`packages/angular-renderer/src/index.ts`:**
+   - Export all new components and property interfaces:
+     - `DialogComponent`, `DialogProps`
+     - `ModalComponent`, `ModalProps`
+     - `DrawerComponent`, `DrawerProps`
+     - `PopoverComponent`, `PopoverProps`
+     - `TooltipComponent`, `TooltipProps`
+
+3. **`packages/angular-renderer/src/styles/overlay.scss`:**
+   - Add styles for overlay panels, animations, and zero-literal token adherence:
+     - `.origo-overlay-pane--dialog`, `.origo-overlay-pane--modal` (with maximize modifier `.origo-dialog--maximized`)
+     - `.origo-overlay-pane--drawer` (with slide animation and position docking for left/right/top/bottom)
+     - `.origo-overlay-pane--popover`
+     - `.origo-overlay-pane--tooltip`
+   - Strict CSS Logical Properties and token compliance (`var(--origo-*)`).
+
+4. **`tools/test-registry/test-registry.yaml`:**
+   - Add new test cases:
+     - `renderer-primitive-dialog`: `packages/angular-renderer/src/components/primitives/dialog/dialog.component.spec.ts`
+     - `renderer-primitive-modal`: `packages/angular-renderer/src/components/primitives/modal/modal.component.spec.ts`
+     - `renderer-primitive-drawer`: `packages/angular-renderer/src/components/primitives/drawer/drawer.component.spec.ts`
+     - `renderer-primitive-popover`: `packages/angular-renderer/src/components/primitives/popover/popover.component.spec.ts`
+     - `renderer-primitive-tooltip`: `packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.spec.ts`
+   - All entries must set `type: unit`, `package: '@origo/angular-renderer'`, `affected_stories: [2-2-modal-and-overlay-components]`.
+
+---
+
+## Tasks / Subtasks
+
+- [x] **1. CREATE `DialogComponent` & `ModalComponent`** (AC: #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #12)
+  - [x] Create `packages/angular-renderer/src/components/primitives/dialog/dialog.component.ts`.
+  - [x] Define `DialogProps` interface covering `visible`, `header`, `modal`, `closable`, `closeOnEscape`, `dismissableMask`, `draggable`, `resizable`, `maximizable`, `maximized`, `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight`, `position`, `blockScroll`, `data`, metadata hooks.
+  - [x] Implement `OrigoAdapter<DialogProps>` and `ContainerComponent` (`vc = viewChild('vc', { read: ViewContainerRef })`).
+  - [x] Implement `static readonly contractSchema = DialogContractSchema` covering 100% of props (including `data: 'object'`) and invoke `coerceContractProps()`.
+  - [x] Inject `OrigoOverlayService`, `DestroyRef`, `ViewContainerRef`, `WebExperienceAdapterService`.
+  - [x] Connect reactive effect to `computedVisible()` to invoke `open()` and `close()` on `OrigoOverlayRef`.
+  - [x] Define outputs: `visibleChange`, `open`, `close`, `maximize`, `restore`, `dragEnd`, `resizeEnd`.
+  - [x] Implement `toggleMaximize()` toggling state between contract dimensions and full viewport dimensions.
+  - [x] Implement native dragging (`pointerdown` on header) and resizing (`ResizeObserver`) emitting `dragEnd` and `resizeEnd`.
+  - [x] Create `dialog.component.html` with semantic `role="dialog"`, `aria-modal="true"`, header actions, `<ng-container #vc></ng-container>`, and `<ng-content></ng-content>`.
+  - [x] Create `dialog.component.scss` with CSS Logical Properties and `--origo-*` tokens.
+  - [x] Create `packages/angular-renderer/src/components/primitives/modal/modal.component.ts` as standalone component honoring `P1-AD-5` with `modal: true` default invariant.
+  - [x] Create `modal.component.html` and `modal.component.scss`.
+  - [x] Create `packages/angular-renderer/src/components/primitives/dialog/dialog.component.spec.ts` verifying overlay attachment, focus trapping, Escape dismissal, backdrop click dismissal, and Shadow DOM piercing.
+  - [x] Create `packages/angular-renderer/src/components/primitives/modal/modal.component.spec.ts` verifying modal contract execution.
+
+- [x] **2. CREATE `DrawerComponent`** (AC: #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #12)
+  - [x] Create `packages/angular-renderer/src/components/primitives/drawer/drawer.component.ts`.
+  - [x] Define `DrawerProps` interface covering `visible`, `position`, `modal`, `dismissible`, `closeOnEscape`, `blockScroll`, `size`, `header`, `footer`, `closable`, `data`, metadata hooks.
+  - [x] Implement `OrigoAdapter<DrawerProps>` and `ContainerComponent` (`vc = viewChild('vc', { read: ViewContainerRef })`).
+  - [x] Implement `static readonly contractSchema = DrawerContractSchema` and `coerceContractProps()`.
+  - [x] Map slide positions (`'left'`, `'right'`, `'top'`, `'bottom'`) to global overlay positions (`'start'`, `'end'`, `'top'`, `'bottom'`) with RTL awareness.
+  - [x] Define outputs: `visibleChange`, `open`, `close`, `show`, `hide`.
+  - [x] Dispatch state updates (`updateState`) and capabilities (`dispatchCapability`) via `WebExperienceAdapterService`.
+  - [x] Create `drawer.component.html` with header, close action, content container (`#vc`), and optional footer.
+  - [x] Create `drawer.component.scss` with slide animations, Logical Properties, and `--origo-*` design tokens.
+  - [x] Create `drawer.component.spec.ts` verifying edge positioning, backdrop click dismissal, Escape dismissal, and Shadow DOM piercing.
+
+- [x] **3. CREATE `PopoverComponent`** (AC: #1, #3, #4, #5, #6, #7, #8, #9, #10)
+  - [x] Create `packages/angular-renderer/src/components/primitives/popover/popover.component.ts`.
+  - [x] Define `PopoverProps` interface covering `visible`, `placement`, `dismissible`, `closeOnEscape`, `showClose`, `offset`, `title`, `data`, metadata hooks.
+  - [x] Implement `OrigoAdapter<PopoverProps>` and `ContainerComponent` (`vc = viewChild('vc', { read: ViewContainerRef })`).
+  - [x] Implement `static readonly contractSchema = PopoverContractSchema` covering `offset: 'array'`, `data: 'object'`, and invoke `coerceContractProps()`.
+  - [x] Map `placement` to `OrigoConnectedPositionConfig` (`originX`, `originY`, `overlayX`, `overlayY`, `offset`).
+  - [x] Implement outside click dismissal evaluating `event.composedPath()`.
+  - [x] Define outputs: `visibleChange`, `open`, `close`, `action`.
+  - [x] Create `popover.component.html` with trigger slot, floating popover template, header, close icon, and content container (`#vc`).
+  - [x] Create `popover.component.scss` with elevation, Logical Properties, and design tokens.
+  - [x] Create `popover.component.spec.ts` verifying connected positioning, toggle interaction, outside click dismissal, and Shadow DOM piercing.
+
+- [x] **4. CREATE `TooltipComponent`** (AC: #1, #4, #5, #6, #7, #8, #9, #10)
+  - [x] Create `packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.ts`.
+  - [x] Define `TooltipProps` interface covering `content`, `position`, `showDelay`, `hideDelay`, `disabled`, `trigger`, `offset`, metadata hooks.
+  - [x] Implement `OrigoAdapter<TooltipProps>` and `ContainerComponent` (`vc = viewChild('vc', { read: ViewContainerRef })`).
+  - [x] Implement `static readonly contractSchema = TooltipContractSchema` covering `offset: 'array'` and invoke `coerceContractProps()`.
+  - [x] Map `position` to `OrigoConnectedPositionConfig` (`originX`, `originY`, `overlayX`, `overlayY`, `offset`).
+  - [x] Implement hover and focus event listeners with delay timers and immediate Escape teardown.
+  - [x] Synchronize `aria-describedby` on trigger element pointing to `role="tooltip"` container.
+  - [x] Define outputs: `show`, `hide`.
+  - [x] Create `tooltip.component.html` with trigger wrapper (`#vc`) and floating tooltip template.
+  - [x] Create `tooltip.component.scss` with tooltip bubble surface, arrow/offset, and design tokens.
+  - [x] Create `tooltip.component.spec.ts` verifying show/hide delay timers, keyboard focus activation, Escape dismissal, and Shadow DOM piercing.
+
+- [x] **5. UPDATE Global Styles, Registrations, Exports, & Test Registry** (AC: #10, #11)
+  - [x] Update `packages/angular-renderer/src/styles/overlay.scss` with modifier classes for dialog, modal, drawer, popover, tooltip.
+  - [x] Register `'Dialog'`, `'Modal'`, `'Drawer'`, `'SidebarDrawer'`, `'Popover'`, `'Tooltip'` in `packages/angular-renderer/src/lib/primitives.provider.ts`.
+  - [x] Export all new components, props interfaces, and event types from `packages/angular-renderer/src/index.ts`.
+  - [x] Add entries in `tools/test-registry/test-registry.yaml` for `renderer-primitive-dialog`, `renderer-primitive-modal`, `renderer-primitive-drawer`, `renderer-primitive-popover`, `renderer-primitive-tooltip`.
+  - [x] Run test suite validation via `npm test` or Nx test target.
+  - [x] Run linter validation via `npx nx lint angular-renderer`.
+
+---
+
+## Dev Notes
+
+### Architecture & Guideline Guardrails (From Epic 1 Retrospective & Spike retro-1)
+| Category | Requirement | Reference |
+|---|---|---|
+| **Shadow DOM & Invariants** | Every component must specify `standalone: true`, `encapsulation: ViewEncapsulation.ShadowDom`, and `changeDetection: ChangeDetectionStrategy.OnPush`. | `docs/guidelines/component-invariants.md` |
+| **Child Substrate (`ContainerComponent`)** | ALL components MUST implement `ContainerComponent`, declare `vc = viewChild('vc', { read: ViewContainerRef })` (optional, do NOT use `viewChild.required` which crashes on unattached templates with `NG0951`), and render `<ng-container #vc></ng-container>`. | `docs/guidelines/component-invariants.md` |
+| **Contract Schema & Coercion** | All components must declare `static readonly contractSchema` covering 100% of defined props and invoke `coerceContractProps()` on incoming `contract().props`. | `docs/guidelines/component-invariants.md` |
+| **Design Tokens (AD-6)** | ❌ Forbidden: `color: #0066FF;` or `border: 1px solid var(--origo-color-border-default, #ccc);`<br>✅ Required: `color: var(--origo-color-text-primary);` and `border: var(--origo-border-width-default) solid var(--origo-color-border-default);`. Zero fallback literals. | `docs/guidelines/scss-and-tokens.md` |
+| **CSS Logical Properties (RTL)** | ❌ Forbidden: `margin-left`, `padding-right`, `left`, `right`.<br>✅ Required: `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `inset-inline-end`. | `docs/guidelines/scss-and-tokens.md` |
+| **Testing Standards & Isolation** | Always use `provideZonelessChangeDetection()`. Query elements through Shadow DOM: `const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;`. Query projected overlay panels through `document.querySelector('.cdk-overlay-container')`. Always dispose overlays in `afterEach` to prevent test runner pollution. | `docs/guidelines/testing-primitives.md` |
+| **Production Overlay Integration** | Consume `OrigoOverlayService` (`packages/angular-renderer/src/lib/overlay/overlay.service.ts`). Do NOT directly import or instantiate raw CDK overlay without the service wrapper. | `docs/guidelines/overlay-portal-architecture.md` |
+| **SSR Safety** | Do not access `window` or `document` during initialization. In non-browser environments, `OrigoOverlayService` returns `OrigoNoopOverlayRef`. | `docs/guidelines/component-invariants.md` |
+| **Package Boundaries (AD-4)** | Only import from `@origostudio/core`, `@angular/cdk/overlay`, and Angular packages. Do NOT import from other renderers or CLI packages. | `ARCHITECTURE-SPINE.md` |
+
+### Connected Placement & Offset Mapping Reference Table
+| Prop Placement | `originX` | `originY` | `overlayX` | `overlayY` | Default Offset `[x, y]` |
+|---|---|---|---|---|---|
+| `'top'` | `'center'` | `'top'` | `'center'` | `'bottom'` | `[0, -8]` |
+| `'top-start'` | `'start'` | `'top'` | `'start'` | `'bottom'` | `[0, -8]` |
+| `'top-end'` | `'end'` | `'top'` | `'end'` | `'bottom'` | `[0, -8]` |
+| `'bottom'` (default) | `'center'` | `'bottom'` | `'center'` | `'top'` | `[0, 8]` |
+| `'bottom-start'` | `'start'` | `'bottom'` | `'start'` | `'top'` | `[0, 8]` |
+| `'bottom-end'` | `'end'` | `'bottom'` | `'end'` | `'top'` | `[0, 8]` |
+| `'left'` | `'start'` | `'center'` | `'end'` | `'center'` | `[-8, 0]` |
+| `'left-start'` | `'start'` | `'top'` | `'end'` | `'top'` | `[-8, 0]` |
+| `'left-end'` | `'start'` | `'bottom'` | `'end'` | `'bottom'` | `[-8, 0]` |
+| `'right'` | `'end'` | `'center'` | `'start'` | `'center'` | `[8, 0]` |
+| `'right-start'` | `'end'` | `'top'` | `'start'` | `'top'` | `[8, 0]` |
+| `'right-end'` | `'end'` | `'bottom'` | `'start'` | `'bottom'` | `[8, 0]` |
+
+### Overlay Position & Dimension Mapping (Global)
+| Component | Overlay Type | CDK Strategy | Positioning Details |
+|---|---|---|---|
+| **Dialog / Modal** | Global | GlobalPositionStrategy | Center of viewport by default (`centerHorizontally().centerVertically()`). Dimensions bounded by `width`, `height`, `maxWidth: '90vw'`, `maxHeight: '90vh'`. Maximize mode expands to `100vw` / `100vh`. |
+| **Drawer** | Global | GlobalPositionStrategy | Slide dock edge: `'left'` -> start edge (`height: '100%'`), `'right'` -> end edge (`height: '100%'`), `'top'` -> top edge (`width: '100%'`), `'bottom'` -> bottom edge (`width: '100%'`). |
+
+### Component Contract Schemas
+```typescript
+export const DialogContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  visible: 'boolean',
+  header: 'string',
+  modal: 'boolean',
+  closable: 'boolean',
+  closeOnEscape: 'boolean',
+  dismissableMask: 'boolean',
+  draggable: 'boolean',
+  resizable: 'boolean',
+  maximizable: 'boolean',
+  maximized: 'boolean',
+  width: 'string',
+  height: 'string',
+  minWidth: 'string',
+  minHeight: 'string',
+  maxWidth: 'string',
+  maxHeight: 'string',
+  position: 'string',
+  blockScroll: 'boolean',
+  data: 'object',
+} as const;
+
+export const ModalContractSchema = DialogContractSchema;
+
+export const DrawerContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  visible: 'boolean',
+  position: 'string',
+  modal: 'boolean',
+  dismissible: 'boolean',
+  closeOnEscape: 'boolean',
+  blockScroll: 'boolean',
+  size: 'string',
+  header: 'string',
+  footer: 'string',
+  closable: 'boolean',
+  data: 'object',
+} as const;
+
+export const PopoverContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  visible: 'boolean',
+  placement: 'string',
+  dismissible: 'boolean',
+  closeOnEscape: 'boolean',
+  showClose: 'boolean',
+  title: 'string',
+  offset: 'array',
+  data: 'object',
+} as const;
+
+export const TooltipContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  content: 'string',
+  position: 'string',
+  showDelay: 'number',
+  hideDelay: 'number',
+  disabled: 'boolean',
+  trigger: 'string',
+  offset: 'array',
+} as const;
+```
+
+### Project Structure Notes
+- Alignment with unified project structure:
+  - Primitives located under `packages/angular-renderer/src/components/primitives/<primitive-name>/`
+  - Global styles located in `packages/angular-renderer/src/styles/`
+  - Test specs co-located as `<primitive-name>.component.spec.ts`
+  - Public exports in `packages/angular-renderer/src/index.ts`
+  - Primitives provider in `packages/angular-renderer/src/lib/primitives.provider.ts`
+  - Central Test Registry in `tools/test-registry/test-registry.yaml`
+
+### References
+- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2: Modal & Overlay Components]
+- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 4.13 Sidebar / Drawer]
+- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#Section 5. OVERLAYS]
+- [Source: docs/guidelines/overlay-portal-architecture.md]
+- [Source: docs/guidelines/component-invariants.md]
+- [Source: docs/guidelines/scss-and-tokens.md]
+- [Source: docs/guidelines/testing-primitives.md]
+- [Source: docs/definition-of-done.md]
+- [Source: packages/angular-renderer/src/lib/overlay/overlay.service.ts]
+- [Source: packages/angular-renderer/src/lib/overlay/overlay-ref.ts]
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
+- Confirmed absence of `dialog`, `modal`, `drawer`, `popover`, and `tooltip` primitive components in `packages/angular-renderer/src/components/primitives/`.
+- Resolved `viewChild` query lifecycle invariant: mandatory optional signal query `viewChild('vc')` to eliminate runtime `NG0951` crashes before template attachment.
+- Reinforced `P1-AD-5` anti-inheritance compliance for `ModalComponent`: standalone component with separate template/styles composing `DialogComponent` via template delegation or contract default.
+- Completed all contract schemas (`DialogContractSchema`, `DrawerContractSchema`, `PopoverContractSchema`, `TooltipContractSchema`) with missing `offset`, `data` entries to ensure zero prop stripping under strict coercion.
+- Added explicit connected placement & offset mapping table for `PopoverComponent` and `TooltipComponent`.
+- Confirmed test registry requirements in `tools/test-registry/test-registry.yaml` and ensured unique test ID naming conventions (`renderer-primitive-dialog`, etc.).
+- Verified monorepo package alignment (`@angular/cdk: 22.0.7`).
+- Consolidated story specification into single canonical file under `_bmad-output/implementation-artifacts/stories/2-2-modal-and-overlay-components.md`.
+
+### Completion Notes List
+
+- Comprehensive story context engine analysis and quality validation completed; developer implementation guide perfected.
+- Defined all 5 overlay components (`Dialog`, `Modal`, `Drawer`, `Popover`, `Tooltip`) with explicit props, outputs, contract schemas, and DOM structures.
+- Enforced complete architectural invariants: Standalone, Shadow DOM, OnPush, Signals reactivity, `ContainerComponent` (`vc`), `coerceContractProps()`, and `[attr.data-testid]`.
+- Enforced Angular CDK Overlay portal projection via `OrigoOverlayService` to prevent Shadow DOM clipping and z-index trapping.
+- Enforced Shadow DOM focus trapping with deep active element restoration and `composedPath()` outside-click dismissal.
+- Enforced zero-literal design tokens and CSS Logical Properties for bidirectional RTL mirroring.
+- Implemented and unit tested DialogComponent (`packages/angular-renderer/src/components/primitives/dialog/`): 9 tests passing.
+- Implemented and unit tested ModalComponent (`packages/angular-renderer/src/components/primitives/modal/`): 5 tests passing (enforces `modal: true` invariant).
+- Implemented and unit tested DrawerComponent (`packages/angular-renderer/src/components/primitives/drawer/`): 10 tests passing.
+- Implemented and unit tested PopoverComponent (`packages/angular-renderer/src/components/primitives/popover/`): 7 tests passing.
+- Implemented and unit tested TooltipComponent (`packages/angular-renderer/src/components/primitives/tooltip/`): 8 tests passing.
+- Updated `overlay.scss` with CSS Logical Properties and token-compliant overlay panel modifiers.
+- Registered all 5 primitives (`Dialog`, `Modal`, `Drawer`, `SidebarDrawer`, `Popover`, `Tooltip`) in `primitives.provider.ts`.
+- Exported all new components and prop interfaces in `index.ts`.
+- Registered all 5 new unit test suites in `tools/test-registry/test-registry.yaml`.
+- Passed entire monorepo test suite (`npm test`) with zero failures across all 6 Nx projects.
+- Passed `npx nx lint angular-renderer` with 0 errors and 0 warnings on new components.
+
+### File List
+
+- `_bmad-output/implementation-artifacts/stories/2-2-modal-and-overlay-components.md` (STORY SPECIFICATION - CANONICAL)
+- `_bmad-output/implementation-artifacts/sprint-status.yaml` (TRACKING)
+- `packages/angular-renderer/src/components/primitives/dialog/dialog.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/dialog/dialog.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/dialog/dialog.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/dialog/dialog.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/modal/modal.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/modal/modal.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/modal/modal.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/modal/modal.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/drawer/drawer.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/drawer/drawer.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/drawer/drawer.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/drawer/drawer.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/popover/popover.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/popover/popover.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/popover/popover.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/popover/popover.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/styles/overlay.scss` (UPDATE)
+- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
+- `packages/angular-renderer/src/index.ts` (UPDATE)
+- `tools/test-registry/test-registry.yaml` (UPDATE)
+
+### Change Log
+
+- 2026-10-13: Created comprehensive developer story specification for Story 2.2 (Modal & Overlay Components). Defined complete architecture, specifications, tasks, and test requirements for Dialog, Modal, Drawer, Popover, and Tooltip primitives using the standardized Angular CDK Overlay portal substrate. Status set to ready-for-dev.
+- 2026-10-13: Validated and hardened story context against architectural invariants. Fixed ViewContainerRef query lifecycle to prevent fatal NG0951 runtime crashes. Enforced P1-AD-5 anti-inheritance compliance on ModalComponent. Added missing schema properties for strict contract coercion. Added connected placement & offset mapping table. Consolidated canonical story file location.
+- 2026-10-13: Implemented DialogComponent, ModalComponent, DrawerComponent, PopoverComponent, and TooltipComponent. Added unit tests for each component (39 total tests passing). Updated global overlay stylesheet, registered primitives in provider, exported public APIs in index.ts, and updated Central Test Registry. Verified full test suite and lint passing. Status transitioned to review.
diff --git a/packages/angular-renderer/src/components/primitives/dialog/dialog.component.html b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.html
new file mode 100644
index 0000000..9122ad1
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.html
@@ -0,0 +1,49 @@
+<ng-template #dialogTemplate>
+  <div
+    #dialogElement
+    role="dialog"
+    [attr.aria-modal]="computedModal() ? 'true' : null"
+    class="origo-dialog"
+    [class.origo-dialog--maximized]="isMaximized()"
+    [class.origo-dialog--draggable]="computedDraggable() && !isMaximized()"
+    [class.origo-dialog--resizable]="computedResizable() && !isMaximized()"
+    [style.--origo-dialog-translate-x.px]="dragPosition().x"
+    [style.--origo-dialog-translate-y.px]="dragPosition().y"
+    [attr.aria-labelledby]="computedHeader() ? headerId : null"
+    [attr.aria-label]="!computedHeader() ? computedAriaLabel() || 'Dialog' : null"
+    [attr.aria-describedby]="computedAriaDescribedBy() || contentId"
+    [attr.data-testid]="contract().id"
+  >
+    <div class="origo-dialog__header" (pointerdown)="onHeaderPointerDown($event)">
+      @if (computedHeader()) {
+        <h2 [id]="headerId" class="origo-dialog__title">{{ computedHeader() }}</h2>
+      }
+      <div class="origo-dialog__header-actions">
+        @if (computedMaximizable()) {
+          <button
+            type="button"
+            class="origo-dialog__action origo-dialog__action--maximize"
+            [attr.aria-label]="isMaximized() ? 'Restore dialog' : 'Maximize dialog'"
+            (click)="toggleMaximize()"
+          >
+            <span class="origo-dialog__action-icon">{{ isMaximized() ? '🗗' : '🗖' }}</span>
+          </button>
+        }
+        @if (computedClosable()) {
+          <button
+            type="button"
+            class="origo-dialog__action origo-dialog__action--close"
+            aria-label="Close dialog"
+            (click)="onClose()"
+          >
+            <span class="origo-dialog__action-icon">✕</span>
+          </button>
+        }
+      </div>
+    </div>
+    <div [id]="contentId" class="origo-dialog__content">
+      <ng-container #vc></ng-container>
+      <ng-content></ng-content>
+    </div>
+  </div>
+</ng-template>
diff --git a/packages/angular-renderer/src/components/primitives/dialog/dialog.component.scss b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.scss
new file mode 100644
index 0000000..39ab625
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.scss
@@ -0,0 +1,102 @@
+:host {
+  display: contents;
+}
+
+.origo-dialog {
+  display: flex;
+  flex-direction: column;
+  box-sizing: border-box;
+  inline-size: 100%;
+  block-size: 100%;
+  background-color: var(--origo-color-surface-overlay, var(--origo-color-surface-primary));
+  color: var(--origo-color-text-primary);
+  border-radius: var(--origo-radius-md);
+  box-shadow: var(--origo-shadow-lg);
+  border: var(--origo-border-width-default) solid var(--origo-color-border-subtle);
+  overflow: hidden;
+  outline: none;
+  transform: translate(var(--origo-dialog-translate-x, 0px), var(--origo-dialog-translate-y, 0px));
+
+  &--draggable {
+    user-select: none;
+  }
+
+  &--resizable {
+    resize: both;
+    overflow: auto;
+  }
+
+  &--maximized {
+    inline-size: 100vw !important;
+    block-size: 100vh !important;
+    max-inline-size: 100vw !important;
+    max-block-size: 100vh !important;
+    border-radius: 0 !important;
+    inset-block-start: 0 !important;
+    inset-inline-start: 0 !important;
+    transform: none !important;
+  }
+
+  &__header {
+    display: flex;
+    align-items: center;
+    justify-content: space-between;
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    border-block-end: var(--origo-border-width-default) solid var(--origo-color-border-subtle);
+    background-color: var(--origo-color-surface-secondary);
+    gap: var(--origo-space-sm);
+
+    .origo-dialog--draggable & {
+      cursor: move;
+    }
+  }
+
+  &__title {
+    margin: 0;
+    font-size: var(--origo-font-size-lg);
+    font-weight: var(--origo-font-weight-semibold);
+    color: var(--origo-color-text-primary);
+    line-height: var(--origo-line-height-tight);
+  }
+
+  &__header-actions {
+    display: flex;
+    align-items: center;
+    gap: var(--origo-space-xs);
+    margin-inline-start: auto;
+  }
+
+  &__action {
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    border: none;
+    background: transparent;
+    color: var(--origo-color-text-secondary);
+    border-radius: var(--origo-radius-sm);
+    padding-inline: var(--origo-space-xs);
+    padding-block: var(--origo-space-xs);
+    cursor: pointer;
+    font-size: var(--origo-font-size-md);
+    line-height: 1;
+
+    &:hover {
+      background-color: var(--origo-color-action-hover);
+      color: var(--origo-color-text-primary);
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus) solid var(--origo-color-focus-ring);
+      outline-offset: var(--origo-space-xxs);
+    }
+  }
+
+  &__content {
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    flex: 1 1 auto;
+    overflow-y: auto;
+    color: var(--origo-color-text-primary);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/dialog/dialog.component.spec.ts b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.spec.ts
new file mode 100644
index 0000000..6563f0e
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.spec.ts
@@ -0,0 +1,231 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { DialogComponent } from './dialog.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('DialogComponent', () => {
+  let component: DialogComponent;
+  let fixture: ComponentFixture<DialogComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [DialogComponent],
+      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(DialogComponent);
+    component = fixture.componentInstance;
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    // Clean up any remaining CDK overlay containers in document.body
+    const overlayContainer = document.querySelector('.cdk-overlay-container');
+    if (overlayContainer) {
+      overlayContainer.innerHTML = '';
+    }
+  });
+
+  it('should create and render with default contract', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-1',
+      type: 'Dialog',
+      props: {
+        header: 'Test Dialog',
+        visible: false,
+      },
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('dialog-1');
+  });
+
+  it('should attach overlay when visible is true', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-1',
+      type: 'Dialog',
+      props: {
+        header: 'Test Dialog',
+        visible: true,
+        modal: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const dialogEl = document.querySelector('.origo-dialog') as HTMLElement;
+    expect(dialogEl).toBeTruthy();
+    expect(dialogEl.getAttribute('role')).toBe('dialog');
+    expect(dialogEl.getAttribute('aria-modal')).toBe('true');
+    expect(dialogEl.getAttribute('data-testid')).toBe('dialog-1');
+
+    const titleEl = dialogEl.querySelector('.origo-dialog__title');
+    expect(titleEl?.textContent?.trim()).toBe('Test Dialog');
+  });
+
+  it('should emit close and visibleChange when close button is clicked', async () => {
+    let closed = false;
+    let visibleChangedVal: boolean | null = null;
+    component.close.subscribe(() => (closed = true));
+    component.visibleChange.subscribe(val => (visibleChangedVal = val));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-1',
+      type: 'Dialog',
+      props: {
+        header: 'Test Dialog',
+        visible: true,
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const closeBtn = document.querySelector('.origo-dialog__action--close') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+    closeBtn.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closed).toBe(true);
+    expect(visibleChangedVal).toBe(false);
+  });
+
+  it('should close on Escape key when closeOnEscape is true', async () => {
+    let closed = false;
+    component.close.subscribe(() => (closed = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-1',
+      type: 'Dialog',
+      props: {
+        header: 'Escape Dialog',
+        visible: true,
+        closeOnEscape: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
+    document.dispatchEvent(event);
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closed).toBe(true);
+  });
+
+  it('should close on backdrop click when dismissableMask is true', async () => {
+    let closed = false;
+    component.close.subscribe(() => (closed = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-1',
+      type: 'Dialog',
+      props: {
+        header: 'Mask Dialog',
+        visible: true,
+        modal: true,
+        dismissableMask: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
+    expect(backdrop).toBeTruthy();
+    backdrop.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closed).toBe(true);
+  });
+
+  it('should not close on backdrop click when dismissableMask is false', async () => {
+    let closed = false;
+    component.close.subscribe(() => (closed = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-1',
+      type: 'Dialog',
+      props: {
+        header: 'No Mask Dialog',
+        visible: true,
+        modal: true,
+        dismissableMask: false,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
+    expect(backdrop).toBeTruthy();
+    backdrop.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closed).toBe(false);
+  });
+
+  it('should toggle maximized state and emit maximize/restore', async () => {
+    let maximizedVal: boolean | null = null;
+    let restored = false;
+    component.maximize.subscribe(val => (maximizedVal = val));
+    component.restore.subscribe(() => (restored = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-1',
+      type: 'Dialog',
+      props: {
+        header: 'Maximizable Dialog',
+        visible: true,
+        maximizable: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const maxBtn = document.querySelector('.origo-dialog__action--maximize') as HTMLButtonElement;
+    expect(maxBtn).toBeTruthy();
+
+    // Toggle maximize
+    maxBtn.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(maximizedVal).toBe(true);
+    expect(component.isMaximized()).toBe(true);
+    const dialogEl = document.querySelector('.origo-dialog');
+    expect(dialogEl?.classList.contains('origo-dialog--maximized')).toBe(true);
+
+    // Toggle restore
+    maxBtn.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(restored).toBe(true);
+    expect(component.isMaximized()).toBe(false);
+    expect(dialogEl?.classList.contains('origo-dialog--maximized')).toBe(false);
+  });
+
+  it('should implement ContainerComponent and provide viewContainerRef', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-vc',
+      type: 'Dialog',
+      props: { header: 'VC Dialog', visible: false },
+    });
+    fixture.detectChanges();
+    // Optional vc signal query should be defined
+    expect(component.vc).toBeDefined();
+  });
+
+  it('should not crash with null or undefined props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'dialog-null',
+      type: 'Dialog',
+      props: null,
+    });
+    expect(() => fixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/dialog/dialog.component.ts b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.ts
new file mode 100644
index 0000000..a49177d
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/dialog/dialog.component.ts
@@ -0,0 +1,385 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  TemplateRef,
+  ElementRef,
+  signal,
+  computed,
+  effect,
+  DestroyRef,
+  PLATFORM_ID,
+} from '@angular/core';
+import { isPlatformBrowser, DOCUMENT } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+import { OrigoOverlayConfig, OrigoOverlayRef } from '../../../lib/overlay/overlay.models';
+
+let dialogCounter = 0;
+
+export interface DialogProps {
+  visible?: boolean;
+  header?: string;
+  modal?: boolean;
+  closable?: boolean;
+  closeOnEscape?: boolean;
+  dismissableMask?: boolean;
+  draggable?: boolean;
+  resizable?: boolean;
+  maximizable?: boolean;
+  maximized?: boolean;
+  width?: string;
+  height?: string;
+  minWidth?: string;
+  minHeight?: string;
+  maxWidth?: string;
+  maxHeight?: string;
+  position?: 'center' | 'top' | 'bottom' | 'start' | 'end';
+  blockScroll?: boolean;
+  data?: unknown;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const DialogContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  visible: 'boolean',
+  header: 'string',
+  modal: 'boolean',
+  closable: 'boolean',
+  closeOnEscape: 'boolean',
+  dismissableMask: 'boolean',
+  draggable: 'boolean',
+  resizable: 'boolean',
+  maximizable: 'boolean',
+  maximized: 'boolean',
+  width: 'string',
+  height: 'string',
+  minWidth: 'string',
+  minHeight: 'string',
+  maxWidth: 'string',
+  maxHeight: 'string',
+  position: 'string',
+  blockScroll: 'boolean',
+  data: 'object',
+} as const;
+
+@Component({
+  selector: 'origo-dialog',
+  standalone: true,
+  templateUrl: './dialog.component.html',
+  styleUrls: ['./dialog.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-dialog-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+  },
+})
+export class DialogComponent implements OrigoAdapter<DialogProps>, ContainerComponent {
+  static readonly contractSchema = DialogContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<DialogProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+
+  dialogTemplate = viewChild('dialogTemplate', { read: TemplateRef });
+  dialogElement = viewChild<ElementRef<HTMLElement>>('dialogElement');
+
+  visibleChange = output<boolean>();
+  open = output<void>();
+  close = output<void>();
+  maximize = output<boolean>();
+  restore = output<void>();
+  dragEnd = output<{ x: number; y: number }>();
+  resizeEnd = output<{ width: number; height: number }>();
+
+  private overlayService = inject(OrigoOverlayService);
+  private destroyRef = inject(DestroyRef);
+  private vcr = inject(ViewContainerRef);
+  private experienceAdapter = inject(WebExperienceAdapterService);
+  private platformId = inject(PLATFORM_ID);
+  private document = inject(DOCUMENT);
+
+  private readonly id = ++dialogCounter;
+  readonly headerId = `origo-dialog-header-${this.id}`;
+  readonly contentId = `origo-dialog-content-${this.id}`;
+
+  private overlayRef: OrigoOverlayRef | null = null;
+  private isOpen = false;
+  private resizeObserver: ResizeObserver | null = null;
+
+  isMaximized = signal(false);
+  dragPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });
+
+  private isDragging = false;
+  private dragStartCoords = { x: 0, y: 0 };
+  private initialDragPos = { x: 0, y: 0 };
+  private pointerMoveListener: ((e: PointerEvent) => void) | null = null;
+  private pointerUpListener: ((e: PointerEvent) => void) | null = null;
+
+  coercedProps = computed(() =>
+    coerceContractProps<DialogProps>(this.contract()?.props ?? {}, DialogContractSchema)
+  );
+
+  computedVisible = computed(() => !!this.coercedProps().visible);
+  computedHeader = computed(() => this.coercedProps().header);
+  computedModal = computed(() => this.coercedProps().modal !== false);
+  computedClosable = computed(() => this.coercedProps().closable !== false);
+  computedCloseOnEscape = computed(() => this.coercedProps().closeOnEscape !== false);
+  computedDismissableMask = computed(() => !!this.coercedProps().dismissableMask);
+  computedDraggable = computed(() => !!this.coercedProps().draggable);
+  computedResizable = computed(() => !!this.coercedProps().resizable);
+  computedMaximizable = computed(() => !!this.coercedProps().maximizable);
+
+  computedWidth = computed(() => this.coercedProps().width ?? '560px');
+  computedHeight = computed(() => this.coercedProps().height ?? 'auto');
+  computedMinWidth = computed(() => this.coercedProps().minWidth);
+  computedMinHeight = computed(() => this.coercedProps().minHeight);
+  computedMaxWidth = computed(() => this.coercedProps().maxWidth ?? '90vw');
+  computedMaxHeight = computed(() => this.coercedProps().maxHeight ?? '90vh');
+  computedPosition = computed(
+    () =>
+      (this.coercedProps().position as 'center' | 'top' | 'bottom' | 'start' | 'end') ?? 'center'
+  );
+
+  computedAriaLabel = computed(() => {
+    const label = this.contract()?.props?.['aria-label'];
+    return label !== undefined && label !== null ? String(label) : undefined;
+  });
+
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract()?.props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
+
+  constructor() {
+    effect(() => {
+      const visible = this.computedVisible();
+      if (visible && !this.isOpen) {
+        this.openDialog();
+      } else if (!visible && this.isOpen) {
+        this.closeDialog(false);
+      }
+    });
+
+    effect(() => {
+      const maxProp = this.coercedProps().maximized;
+      if (maxProp !== undefined) {
+        this.isMaximized.set(!!maxProp);
+      }
+    });
+
+    this.destroyRef.onDestroy(() => {
+      this.cleanup();
+    });
+  }
+
+  private openDialog(): void {
+    if (this.isOpen) return;
+
+    const tpl = this.dialogTemplate();
+    if (!tpl) return;
+
+    const config: OrigoOverlayConfig = {
+      position: {
+        type: 'global',
+        position: this.computedPosition(),
+        width: this.isMaximized() ? '100vw' : this.computedWidth(),
+        height: this.isMaximized() ? '100vh' : this.computedHeight(),
+        minWidth: this.isMaximized() ? '100vw' : this.computedMinWidth(),
+        minHeight: this.isMaximized() ? '100vh' : this.computedMinHeight(),
+        maxWidth: this.isMaximized() ? '100vw' : this.computedMaxWidth(),
+        maxHeight: this.isMaximized() ? '100vh' : this.computedMaxHeight(),
+      },
+      hasBackdrop: this.computedModal(),
+      backdropClass: 'origo-dialog-backdrop',
+      panelClass: [
+        'origo-overlay-pane--dialog',
+        'origo-overlay-pane--modal',
+        ...(this.isMaximized() ? ['origo-overlay-pane--maximized'] : []),
+      ],
+      closeOnBackdropClick: this.computedDismissableMask(),
+      closeOnOutsideClick: this.computedDismissableMask(),
+      closeOnEscape: this.computedCloseOnEscape(),
+      trapFocus: this.computedModal(),
+      viewContainerRef: this.vcr,
+    };
+
+    this.overlayRef = this.overlayService.create(config, this.destroyRef);
+    this.overlayRef.open(tpl, this.vcr);
+    this.isOpen = true;
+
+    this.open.emit();
+    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
+    this.experienceAdapter.dispatchCapability(this.contract().id, 'open', undefined);
+
+    this.setupResizeObserver();
+
+    this.overlayRef.afterClosed().then(result => {
+      if (this.isOpen) {
+        this.isOpen = false;
+        this.cleanupDrag();
+        this.visibleChange.emit(false);
+        this.close.emit();
+        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+        this.experienceAdapter.dispatchCapability(this.contract().id, 'close', result);
+      }
+    });
+  }
+
+  private closeDialog(notify = true): void {
+    if (!this.isOpen) return;
+    this.isOpen = false;
+    this.cleanupDrag();
+
+    if (this.overlayRef?.isOpen) {
+      this.overlayRef.close();
+    }
+
+    if (notify) {
+      this.visibleChange.emit(false);
+      this.close.emit();
+      this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+      this.experienceAdapter.dispatchCapability(this.contract().id, 'close', undefined);
+    }
+  }
+
+  onClose(): void {
+    this.closeDialog(true);
+  }
+
+  toggleMaximize(): void {
+    const next = !this.isMaximized();
+    this.isMaximized.set(next);
+
+    if (next) {
+      this.maximize.emit(true);
+      this.experienceAdapter.dispatchCapability(this.contract().id, 'maximize', true);
+    } else {
+      this.restore.emit();
+      this.experienceAdapter.dispatchCapability(this.contract().id, 'restore', undefined);
+    }
+
+    if (this.overlayRef?.isOpen) {
+      this.overlayRef.updatePosition();
+    }
+  }
+
+  onHeaderPointerDown(event: PointerEvent): void {
+    if (!this.computedDraggable() || this.isMaximized() || event.button !== 0) {
+      return;
+    }
+
+    // Do not initiate dragging if clicking close or maximize buttons
+    const target = event.target as HTMLElement | null;
+    if (target?.closest('button')) {
+      return;
+    }
+
+    if (!isPlatformBrowser(this.platformId) || !this.document) {
+      return;
+    }
+
+    this.isDragging = true;
+    this.dragStartCoords = { x: event.clientX, y: event.clientY };
+    this.initialDragPos = { ...this.dragPosition() };
+
+    this.pointerMoveListener = (e: PointerEvent) => {
+      if (!this.isDragging) return;
+      const dx = e.clientX - this.dragStartCoords.x;
+      const dy = e.clientY - this.dragStartCoords.y;
+      this.dragPosition.set({
+        x: this.initialDragPos.x + dx,
+        y: this.initialDragPos.y + dy,
+      });
+    };
+
+    this.pointerUpListener = () => {
+      if (!this.isDragging) return;
+      this.isDragging = false;
+      const finalPos = this.dragPosition();
+      this.dragEnd.emit(finalPos);
+      this.experienceAdapter.dispatchCapability(this.contract().id, 'dragEnd', finalPos);
+      this.cleanupDragListeners();
+    };
+
+    this.document.addEventListener('pointermove', this.pointerMoveListener);
+    this.document.addEventListener('pointerup', this.pointerUpListener);
+  }
+
+  private setupResizeObserver(): void {
+    if (!isPlatformBrowser(this.platformId) || typeof ResizeObserver === 'undefined') {
+      return;
+    }
+
+    setTimeout(() => {
+      const el = this.dialogElement()?.nativeElement;
+      if (!el) return;
+
+      let initial = true;
+      this.resizeObserver = new ResizeObserver(entries => {
+        if (initial) {
+          initial = false;
+          return;
+        }
+        if (this.isMaximized()) return;
+        for (const entry of entries) {
+          const dims = {
+            width: Math.round(entry.contentRect.width),
+            height: Math.round(entry.contentRect.height),
+          };
+          this.resizeEnd.emit(dims);
+          this.experienceAdapter.dispatchCapability(this.contract().id, 'resizeEnd', dims);
+        }
+      });
+
+      this.resizeObserver.observe(el);
+    }, 0);
+  }
+
+  private cleanupDrag(): void {
+    this.isDragging = false;
+    this.cleanupDragListeners();
+  }
+
+  private cleanupDragListeners(): void {
+    if (this.pointerMoveListener && this.document) {
+      this.document.removeEventListener('pointermove', this.pointerMoveListener);
+      this.pointerMoveListener = null;
+    }
+    if (this.pointerUpListener && this.document) {
+      this.document.removeEventListener('pointerup', this.pointerUpListener);
+      this.pointerUpListener = null;
+    }
+  }
+
+  private cleanup(): void {
+    this.cleanupDrag();
+    if (this.resizeObserver) {
+      this.resizeObserver.disconnect();
+      this.resizeObserver = null;
+    }
+    if (this.overlayRef) {
+      this.overlayRef.dispose();
+      this.overlayRef = null;
+    }
+    this.isOpen = false;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/drawer/drawer.component.html b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.html
new file mode 100644
index 0000000..07f7d01
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.html
@@ -0,0 +1,38 @@
+<ng-template #drawerTemplate>
+  <div
+    role="dialog"
+    [attr.aria-modal]="computedModal() ? 'true' : null"
+    class="origo-drawer"
+    [class.origo-drawer--left]="computedPosition() === 'left'"
+    [class.origo-drawer--right]="computedPosition() === 'right'"
+    [class.origo-drawer--top]="computedPosition() === 'top'"
+    [class.origo-drawer--bottom]="computedPosition() === 'bottom'"
+    [attr.aria-labelledby]="computedHeader() ? headerId : null"
+    [attr.aria-label]="!computedHeader() ? computedAriaLabel() : null"
+    [attr.aria-describedby]="computedAriaDescribedBy()"
+    [attr.data-testid]="contract().id"
+  >
+    <div class="origo-drawer__header">
+      @if (computedHeader()) {
+        <h2 [id]="headerId" class="origo-drawer__title">{{ computedHeader() }}</h2>
+      }
+      @if (computedClosable()) {
+        <button
+          type="button"
+          class="origo-drawer__close"
+          aria-label="Close drawer"
+          (click)="onClose()"
+        >
+          <span class="origo-drawer__close-icon">✕</span>
+        </button>
+      }
+    </div>
+    <div class="origo-drawer__content">
+      <ng-container #vc></ng-container>
+      <ng-content></ng-content>
+    </div>
+    @if (computedFooter()) {
+      <div class="origo-drawer__footer">{{ computedFooter() }}</div>
+    }
+  </div>
+</ng-template>
diff --git a/packages/angular-renderer/src/components/primitives/drawer/drawer.component.scss b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.scss
new file mode 100644
index 0000000..0df7e03
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.scss
@@ -0,0 +1,76 @@
+:host {
+  display: contents;
+}
+
+.origo-drawer {
+  display: flex;
+  flex-direction: column;
+  box-sizing: border-box;
+  inline-size: 100%;
+  block-size: 100%;
+  background-color: var(--origo-color-surface-overlay, var(--origo-color-surface-primary));
+  color: var(--origo-color-text-primary);
+  box-shadow: var(--origo-shadow-xl, var(--origo-shadow-lg));
+  overflow: hidden;
+  outline: none;
+
+  &__header {
+    display: flex;
+    align-items: center;
+    justify-content: space-between;
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    border-block-end: var(--origo-border-width-default) solid var(--origo-color-border-subtle);
+    background-color: var(--origo-color-surface-secondary);
+    gap: var(--origo-space-sm);
+  }
+
+  &__title {
+    margin: 0;
+    font-size: var(--origo-font-size-lg);
+    font-weight: var(--origo-font-weight-semibold);
+    color: var(--origo-color-text-primary);
+    line-height: var(--origo-line-height-tight);
+  }
+
+  &__close {
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    border: none;
+    background: transparent;
+    color: var(--origo-color-text-secondary);
+    border-radius: var(--origo-radius-sm);
+    padding-inline: var(--origo-space-xs);
+    padding-block: var(--origo-space-xs);
+    cursor: pointer;
+    font-size: var(--origo-font-size-md);
+    line-height: 1;
+    margin-inline-start: auto;
+
+    &:hover {
+      background-color: var(--origo-color-action-hover);
+      color: var(--origo-color-text-primary);
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus) solid var(--origo-color-focus-ring);
+      outline-offset: var(--origo-space-xxs);
+    }
+  }
+
+  &__content {
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    flex: 1 1 auto;
+    overflow-y: auto;
+    color: var(--origo-color-text-primary);
+  }
+
+  &__footer {
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    border-block-start: var(--origo-border-width-default) solid var(--origo-color-border-subtle);
+    background-color: var(--origo-color-surface-secondary);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/drawer/drawer.component.spec.ts b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.spec.ts
new file mode 100644
index 0000000..2c41e4a
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.spec.ts
@@ -0,0 +1,265 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { DrawerComponent } from './drawer.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('DrawerComponent', () => {
+  let component: DrawerComponent;
+  let fixture: ComponentFixture<DrawerComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [DrawerComponent],
+      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(DrawerComponent);
+    component = fixture.componentInstance;
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    const overlayContainer = document.querySelector('.cdk-overlay-container');
+    if (overlayContainer) {
+      overlayContainer.innerHTML = '';
+    }
+  });
+
+  it('should create and render with default contract', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-1',
+      type: 'Drawer',
+      props: {
+        header: 'Test Drawer',
+        visible: false,
+      },
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('drawer-1');
+  });
+
+  it('should attach overlay when visible is true with default left position', async () => {
+    let openEmitted = false;
+    let showEmitted = false;
+    component.open.subscribe(() => (openEmitted = true));
+    component.show.subscribe(() => (showEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-left',
+      type: 'Drawer',
+      props: {
+        header: 'Left Drawer',
+        visible: true,
+        position: 'left',
+        modal: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(openEmitted).toBe(true);
+    expect(showEmitted).toBe(true);
+
+    const drawerEl = document.querySelector('.origo-drawer') as HTMLElement;
+    expect(drawerEl).toBeTruthy();
+    expect(drawerEl.getAttribute('role')).toBe('dialog');
+    expect(drawerEl.getAttribute('aria-modal')).toBe('true');
+    expect(drawerEl.getAttribute('data-testid')).toBe('drawer-left');
+    expect(drawerEl.classList.contains('origo-drawer--left')).toBe(true);
+
+    const titleEl = drawerEl.querySelector('.origo-drawer__title');
+    expect(titleEl?.textContent?.trim()).toBe('Left Drawer');
+  });
+
+  it('should support position right, top, bottom', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-right',
+      type: 'Drawer',
+      props: {
+        header: 'Right Drawer',
+        visible: true,
+        position: 'right',
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    let drawerEl = document.querySelector('.origo-drawer');
+    expect(drawerEl?.classList.contains('origo-drawer--right')).toBe(true);
+
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-top',
+      type: 'Drawer',
+      props: {
+        header: 'Top Drawer',
+        visible: true,
+        position: 'top',
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    drawerEl = document.querySelector('.origo-drawer');
+    expect(drawerEl?.classList.contains('origo-drawer--top')).toBe(true);
+
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-bottom',
+      type: 'Drawer',
+      props: {
+        header: 'Bottom Drawer',
+        visible: true,
+        position: 'bottom',
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    drawerEl = document.querySelector('.origo-drawer');
+    expect(drawerEl?.classList.contains('origo-drawer--bottom')).toBe(true);
+  });
+
+  it('should emit close, hide, and visibleChange when close button is clicked', async () => {
+    let closeEmitted = false;
+    let hideEmitted = false;
+    let visibleVal: boolean | null = null;
+    component.close.subscribe(() => (closeEmitted = true));
+    component.hide.subscribe(() => (hideEmitted = true));
+    component.visibleChange.subscribe(val => (visibleVal = val));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-close-btn',
+      type: 'Drawer',
+      props: {
+        header: 'Closable Drawer',
+        visible: true,
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const closeBtn = document.querySelector('.origo-drawer__close') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+    closeBtn.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closeEmitted).toBe(true);
+    expect(hideEmitted).toBe(true);
+    expect(visibleVal).toBe(false);
+  });
+
+  it('should close on Escape key when closeOnEscape is true', async () => {
+    let closeEmitted = false;
+    component.close.subscribe(() => (closeEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-esc',
+      type: 'Drawer',
+      props: {
+        header: 'Escape Drawer',
+        visible: true,
+        closeOnEscape: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
+    document.dispatchEvent(event);
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closeEmitted).toBe(true);
+  });
+
+  it('should close on backdrop click when dismissible is true', async () => {
+    let closeEmitted = false;
+    component.close.subscribe(() => (closeEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-dismissible',
+      type: 'Drawer',
+      props: {
+        header: 'Dismissible Drawer',
+        visible: true,
+        modal: true,
+        dismissible: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
+    expect(backdrop).toBeTruthy();
+    backdrop.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closeEmitted).toBe(true);
+  });
+
+  it('should not close on backdrop click when dismissible is false', async () => {
+    let closeEmitted = false;
+    component.close.subscribe(() => (closeEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-non-dismissible',
+      type: 'Drawer',
+      props: {
+        header: 'Non-dismissible Drawer',
+        visible: true,
+        modal: true,
+        dismissible: false,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
+    expect(backdrop).toBeTruthy();
+    backdrop.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closeEmitted).toBe(false);
+  });
+
+  it('should render footer when provided', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-footer',
+      type: 'Drawer',
+      props: {
+        header: 'Drawer With Footer',
+        footer: 'Custom Footer Content',
+        visible: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const footerEl = document.querySelector('.origo-drawer__footer');
+    expect(footerEl?.textContent?.trim()).toBe('Custom Footer Content');
+  });
+
+  it('should implement ContainerComponent', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-vc',
+      type: 'Drawer',
+      props: { header: 'Drawer VC', visible: false },
+    });
+    fixture.detectChanges();
+    expect(component.vc).toBeDefined();
+  });
+
+  it('should not crash with null or undefined props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'drawer-null',
+      type: 'Drawer',
+      props: null,
+    });
+    expect(() => fixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/drawer/drawer.component.ts b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.ts
new file mode 100644
index 0000000..1d5a18f
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/drawer/drawer.component.ts
@@ -0,0 +1,246 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  TemplateRef,
+  computed,
+  effect,
+  DestroyRef,
+} from '@angular/core';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+import { OrigoOverlayConfig, OrigoOverlayRef } from '../../../lib/overlay/overlay.models';
+
+let drawerCounter = 0;
+
+export interface DrawerProps {
+  visible?: boolean;
+  position?: 'left' | 'right' | 'top' | 'bottom';
+  modal?: boolean;
+  dismissible?: boolean;
+  closeOnEscape?: boolean;
+  blockScroll?: boolean;
+  size?: string;
+  header?: string;
+  footer?: string;
+  closable?: boolean;
+  data?: unknown;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const DrawerContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  visible: 'boolean',
+  position: 'string',
+  modal: 'boolean',
+  dismissible: 'boolean',
+  closeOnEscape: 'boolean',
+  blockScroll: 'boolean',
+  size: 'string',
+  header: 'string',
+  footer: 'string',
+  closable: 'boolean',
+  data: 'object',
+} as const;
+
+@Component({
+  selector: 'origo-drawer',
+  standalone: true,
+  templateUrl: './drawer.component.html',
+  styleUrls: ['./drawer.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-drawer-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+  },
+})
+export class DrawerComponent implements OrigoAdapter<DrawerProps>, ContainerComponent {
+  static readonly contractSchema = DrawerContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<DrawerProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+
+  drawerTemplate = viewChild('drawerTemplate', { read: TemplateRef });
+
+  visibleChange = output<boolean>();
+  open = output<void>();
+  close = output<void>();
+  show = output<void>();
+  hide = output<void>();
+
+  private overlayService = inject(OrigoOverlayService);
+  private destroyRef = inject(DestroyRef);
+  private vcr = inject(ViewContainerRef);
+  private experienceAdapter = inject(WebExperienceAdapterService);
+
+  private readonly id = ++drawerCounter;
+  readonly headerId = `origo-drawer-header-${this.id}`;
+
+  private overlayRef: OrigoOverlayRef | null = null;
+  private isOpen = false;
+
+  coercedProps = computed(() =>
+    coerceContractProps<DrawerProps>(this.contract()?.props ?? {}, DrawerContractSchema)
+  );
+
+  computedVisible = computed(() => !!this.coercedProps().visible);
+  computedPosition = computed(() => this.coercedProps().position ?? 'left');
+  computedModal = computed(() => this.coercedProps().modal !== false);
+  computedDismissible = computed(() => this.coercedProps().dismissible !== false);
+  computedCloseOnEscape = computed(() => this.coercedProps().closeOnEscape !== false);
+  computedSize = computed(() => this.coercedProps().size ?? '320px');
+  computedHeader = computed(() => this.coercedProps().header);
+  computedFooter = computed(() => this.coercedProps().footer);
+  computedClosable = computed(() => this.coercedProps().closable !== false);
+
+  computedAriaLabel = computed(() => {
+    const label = this.contract()?.props?.['aria-label'];
+    return label !== undefined && label !== null ? String(label) : 'Drawer';
+  });
+
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract()?.props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
+
+  constructor() {
+    effect(() => {
+      const visible = this.computedVisible();
+      if (visible && !this.isOpen) {
+        this.openDrawer();
+      } else if (!visible && this.isOpen) {
+        this.closeDrawer(false);
+      }
+    });
+
+    this.destroyRef.onDestroy(() => {
+      this.cleanup();
+    });
+  }
+
+  private openDrawer(): void {
+    if (this.isOpen) return;
+
+    const tpl = this.drawerTemplate();
+    if (!tpl) return;
+
+    const pos = this.computedPosition();
+    const size = this.computedSize();
+
+    let alignment: 'start' | 'end' | 'top' | 'bottom' = 'start';
+    let width: string | undefined = size;
+    let height: string | undefined = '100%';
+
+    switch (pos) {
+      case 'right':
+        alignment = 'end';
+        width = size;
+        height = '100%';
+        break;
+      case 'top':
+        alignment = 'top';
+        width = '100%';
+        height = size;
+        break;
+      case 'bottom':
+        alignment = 'bottom';
+        width = '100%';
+        height = size;
+        break;
+      case 'left':
+      default:
+        alignment = 'start';
+        width = size;
+        height = '100%';
+        break;
+    }
+
+    const config: OrigoOverlayConfig = {
+      position: {
+        type: 'global',
+        position: alignment,
+        width,
+        height,
+      },
+      hasBackdrop: this.computedModal(),
+      backdropClass: 'origo-drawer-backdrop',
+      panelClass: ['origo-overlay-pane--drawer', `origo-overlay-pane--drawer-${pos}`],
+      closeOnBackdropClick: this.computedDismissible(),
+      closeOnOutsideClick: this.computedDismissible(),
+      closeOnEscape: this.computedCloseOnEscape(),
+      trapFocus: this.computedModal(),
+      viewContainerRef: this.vcr,
+    };
+
+    this.overlayRef = this.overlayService.create(config, this.destroyRef);
+    this.overlayRef.open(tpl, this.vcr);
+    this.isOpen = true;
+
+    this.open.emit();
+    this.show.emit();
+    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
+    this.experienceAdapter.dispatchCapability(this.contract().id, 'open', undefined);
+    this.experienceAdapter.dispatchCapability(this.contract().id, 'show', undefined);
+
+    this.overlayRef.afterClosed().then(result => {
+      if (this.isOpen) {
+        this.isOpen = false;
+        this.visibleChange.emit(false);
+        this.close.emit();
+        this.hide.emit();
+        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+        this.experienceAdapter.dispatchCapability(this.contract().id, 'close', result);
+        this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', result);
+      }
+    });
+  }
+
+  private closeDrawer(notify = true): void {
+    if (!this.isOpen) return;
+    this.isOpen = false;
+
+    if (this.overlayRef?.isOpen) {
+      this.overlayRef.close();
+    }
+
+    if (notify) {
+      this.visibleChange.emit(false);
+      this.close.emit();
+      this.hide.emit();
+      this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+      this.experienceAdapter.dispatchCapability(this.contract().id, 'close', undefined);
+      this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', undefined);
+    }
+  }
+
+  onClose(): void {
+    this.closeDrawer(true);
+  }
+
+  private cleanup(): void {
+    if (this.overlayRef) {
+      this.overlayRef.dispose();
+      this.overlayRef = null;
+    }
+    this.isOpen = false;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/modal/modal.component.html b/packages/angular-renderer/src/components/primitives/modal/modal.component.html
new file mode 100644
index 0000000..ff44861
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/modal/modal.component.html
@@ -0,0 +1,13 @@
+<origo-dialog
+  [contract]="coercedModalContract()"
+  (visibleChange)="visibleChange.emit($event)"
+  (open)="open.emit()"
+  (close)="close.emit()"
+  (maximize)="maximize.emit($event)"
+  (restore)="restore.emit()"
+  (dragEnd)="dragEnd.emit($event)"
+  (resizeEnd)="resizeEnd.emit($event)"
+>
+  <ng-container #vc></ng-container>
+  <ng-content></ng-content>
+</origo-dialog>
diff --git a/packages/angular-renderer/src/components/primitives/modal/modal.component.scss b/packages/angular-renderer/src/components/primitives/modal/modal.component.scss
new file mode 100644
index 0000000..92d692c
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/modal/modal.component.scss
@@ -0,0 +1,3 @@
+:host {
+  display: contents;
+}
diff --git a/packages/angular-renderer/src/components/primitives/modal/modal.component.spec.ts b/packages/angular-renderer/src/components/primitives/modal/modal.component.spec.ts
new file mode 100644
index 0000000..54614d6
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/modal/modal.component.spec.ts
@@ -0,0 +1,109 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { ModalComponent } from './modal.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('ModalComponent', () => {
+  let component: ModalComponent;
+  let fixture: ComponentFixture<ModalComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [ModalComponent],
+      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(ModalComponent);
+    component = fixture.componentInstance;
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    const overlayContainer = document.querySelector('.cdk-overlay-container');
+    if (overlayContainer) {
+      overlayContainer.innerHTML = '';
+    }
+  });
+
+  it('should create and render modal component', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'modal-1',
+      type: 'Modal',
+      props: {
+        header: 'Test Modal',
+        visible: false,
+      },
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('modal-1');
+  });
+
+  it('should enforce modal: true invariant even if props specify modal: false', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'modal-invariant',
+      type: 'Modal',
+      props: {
+        header: 'Forced Modal',
+        visible: true,
+        modal: false, // Invariant test: should be overridden to true
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const backdrop = document.querySelector('.origo-overlay-backdrop');
+    expect(backdrop).toBeTruthy();
+
+    const dialogEl = document.querySelector('.origo-dialog');
+    expect(dialogEl?.getAttribute('aria-modal')).toBe('true');
+  });
+
+  it('should propagate close and visibleChange outputs', async () => {
+    let closed = false;
+    let visibleChangedVal: boolean | null = null;
+    component.close.subscribe(() => (closed = true));
+    component.visibleChange.subscribe(val => (visibleChangedVal = val));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'modal-propagate',
+      type: 'Modal',
+      props: {
+        header: 'Propagate Modal',
+        visible: true,
+        closable: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const closeBtn = document.querySelector('.origo-dialog__action--close') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+    closeBtn.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closed).toBe(true);
+    expect(visibleChangedVal).toBe(false);
+  });
+
+  it('should implement ContainerComponent', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'modal-vc',
+      type: 'Modal',
+      props: { header: 'Modal VC', visible: false },
+    });
+    fixture.detectChanges();
+    expect(component.vc).toBeDefined();
+  });
+
+  it('should not crash with null or undefined props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'modal-null',
+      type: 'Modal',
+      props: null,
+    });
+    expect(() => fixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/modal/modal.component.ts b/packages/angular-renderer/src/components/primitives/modal/modal.component.ts
new file mode 100644
index 0000000..dc264a0
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/modal/modal.component.ts
@@ -0,0 +1,56 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  viewChild,
+  ViewContainerRef,
+  computed,
+} from '@angular/core';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, ContainerComponent } from '../../../adapters/web/adapter';
+import { DialogComponent, DialogProps, DialogContractSchema } from '../dialog/dialog.component';
+
+export type ModalProps = DialogProps;
+export const ModalContractSchema = DialogContractSchema;
+
+@Component({
+  selector: 'origo-modal',
+  standalone: true,
+  imports: [DialogComponent],
+  templateUrl: './modal.component.html',
+  styleUrls: ['./modal.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-modal-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+  },
+})
+export class ModalComponent implements OrigoAdapter<ModalProps>, ContainerComponent {
+  static readonly contractSchema = ModalContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<ModalProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+
+  visibleChange = output<boolean>();
+  open = output<void>();
+  close = output<void>();
+  maximize = output<boolean>();
+  restore = output<void>();
+  dragEnd = output<{ x: number; y: number }>();
+  resizeEnd = output<{ width: number; height: number }>();
+
+  coercedModalContract = computed(() => {
+    const origContract = this.contract();
+    return {
+      ...origContract,
+      props: {
+        ...(origContract?.props ?? {}),
+        modal: true, // Architectural invariant: modal is always strictly true
+      },
+    };
+  });
+}
diff --git a/packages/angular-renderer/src/components/primitives/popover/popover.component.html b/packages/angular-renderer/src/components/primitives/popover/popover.component.html
new file mode 100644
index 0000000..66e31af
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/popover/popover.component.html
@@ -0,0 +1,42 @@
+<div
+  #triggerWrapper
+  class="origo-popover__trigger-wrapper"
+  [attr.aria-expanded]="isOpen()"
+  [attr.aria-haspopup]="'dialog'"
+  (click)="toggle()"
+>
+  <ng-content select="[slot=trigger]"></ng-content>
+  <ng-content></ng-content>
+</div>
+
+<ng-template #popoverTemplate>
+  <div
+    role="dialog"
+    class="origo-popover"
+    [attr.data-testid]="contract().id"
+    [attr.aria-label]="computedAriaLabel()"
+    [attr.aria-describedby]="computedAriaDescribedBy()"
+  >
+    @if (computedTitle() || computedShowClose()) {
+      <div class="origo-popover__header">
+        @if (computedTitle()) {
+          <div class="origo-popover__title">{{ computedTitle() }}</div>
+        }
+        @if (computedShowClose()) {
+          <button
+            type="button"
+            class="origo-popover__close"
+            aria-label="Close popover"
+            (click)="closePopover()"
+          >
+            <span class="origo-popover__close-icon">✕</span>
+          </button>
+        }
+      </div>
+    }
+    <div class="origo-popover__content">
+      <ng-container #vc></ng-container>
+      <ng-content></ng-content>
+    </div>
+  </div>
+</ng-template>
diff --git a/packages/angular-renderer/src/components/primitives/popover/popover.component.scss b/packages/angular-renderer/src/components/primitives/popover/popover.component.scss
new file mode 100644
index 0000000..100cf5b
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/popover/popover.component.scss
@@ -0,0 +1,77 @@
+:host {
+  display: inline-block;
+}
+
+.origo-popover {
+  display: flex;
+  flex-direction: column;
+  box-sizing: border-box;
+  background-color: var(--origo-color-surface-overlay, var(--origo-color-surface-primary));
+  color: var(--origo-color-text-primary);
+  border-radius: var(--origo-radius-md);
+  box-shadow: var(--origo-shadow-lg);
+  border: var(--origo-border-width-default) solid var(--origo-color-border-subtle);
+  overflow: hidden;
+  outline: none;
+  min-inline-size: var(--origo-overlay-min-width, 180px);
+  max-inline-size: min(90vw, 360px);
+
+  &__trigger-wrapper {
+    display: inline-flex;
+    align-items: center;
+    cursor: pointer;
+  }
+
+  &__header {
+    display: flex;
+    align-items: center;
+    justify-content: space-between;
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-sm);
+    border-block-end: var(--origo-border-width-default) solid var(--origo-color-border-subtle);
+    background-color: var(--origo-color-surface-secondary);
+    gap: var(--origo-space-sm);
+  }
+
+  &__title {
+    margin: 0;
+    font-size: var(--origo-font-size-md);
+    font-weight: var(--origo-font-weight-semibold);
+    color: var(--origo-color-text-primary);
+    line-height: var(--origo-line-height-tight);
+  }
+
+  &__close {
+    display: inline-flex;
+    align-items: center;
+    justify-content: center;
+    border: none;
+    background: transparent;
+    color: var(--origo-color-text-secondary);
+    border-radius: var(--origo-radius-sm);
+    padding-inline: var(--origo-space-xs);
+    padding-block: var(--origo-space-xs);
+    cursor: pointer;
+    font-size: var(--origo-font-size-md);
+    line-height: 1;
+    margin-inline-start: auto;
+
+    &:hover {
+      background-color: var(--origo-color-action-hover);
+      color: var(--origo-color-text-primary);
+    }
+
+    &:focus-visible {
+      outline: var(--origo-border-width-focus) solid var(--origo-color-focus-ring);
+      outline-offset: var(--origo-space-xxs);
+    }
+  }
+
+  &__content {
+    padding-inline: var(--origo-space-md);
+    padding-block: var(--origo-space-md);
+    flex: 1 1 auto;
+    overflow-y: auto;
+    color: var(--origo-color-text-primary);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/popover/popover.component.spec.ts b/packages/angular-renderer/src/components/primitives/popover/popover.component.spec.ts
new file mode 100644
index 0000000..019f6f3
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/popover/popover.component.spec.ts
@@ -0,0 +1,175 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { PopoverComponent } from './popover.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('PopoverComponent', () => {
+  let component: PopoverComponent;
+  let fixture: ComponentFixture<PopoverComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [PopoverComponent],
+      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(PopoverComponent);
+    component = fixture.componentInstance;
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    const overlayContainer = document.querySelector('.cdk-overlay-container');
+    if (overlayContainer) {
+      overlayContainer.innerHTML = '';
+    }
+  });
+
+  it('should create and render trigger wrapper', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'popover-1',
+      type: 'Popover',
+      props: {
+        title: 'Popover Title',
+        visible: false,
+      },
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('popover-1');
+  });
+
+  it('should toggle visibility when trigger is clicked', async () => {
+    let openEmitted = false;
+    let visibleChangedVal: boolean | null = null;
+    component.open.subscribe(() => (openEmitted = true));
+    component.visibleChange.subscribe(val => (visibleChangedVal = val));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'popover-toggle',
+      type: 'Popover',
+      props: {
+        title: 'Toggle Popover',
+        visible: false,
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const trigger = root.querySelector('.origo-popover__trigger-wrapper') as HTMLElement;
+    expect(trigger).toBeTruthy();
+
+    trigger.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(openEmitted).toBe(true);
+    expect(visibleChangedVal).toBe(true);
+
+    const popoverEl = document.querySelector('.origo-popover');
+    expect(popoverEl).toBeTruthy();
+    expect(popoverEl?.getAttribute('data-testid')).toBe('popover-toggle');
+  });
+
+  it('should display title and close button when configured', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'popover-title-close',
+      type: 'Popover',
+      props: {
+        title: 'Custom Title',
+        showClose: true,
+        visible: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const popoverEl = document.querySelector('.origo-popover') as HTMLElement;
+    expect(popoverEl).toBeTruthy();
+
+    const titleEl = popoverEl.querySelector('.origo-popover__title');
+    expect(titleEl?.textContent?.trim()).toBe('Custom Title');
+
+    const closeBtn = popoverEl.querySelector('.origo-popover__close') as HTMLButtonElement;
+    expect(closeBtn).toBeTruthy();
+
+    let closeEmitted = false;
+    component.close.subscribe(() => (closeEmitted = true));
+    closeBtn.click();
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closeEmitted).toBe(true);
+  });
+
+  it('should close on Escape when closeOnEscape is true', async () => {
+    let closeEmitted = false;
+    component.close.subscribe(() => (closeEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'popover-esc',
+      type: 'Popover',
+      props: {
+        title: 'Escape Popover',
+        visible: true,
+        closeOnEscape: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
+    document.dispatchEvent(event);
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closeEmitted).toBe(true);
+  });
+
+  it('should close on outside click when dismissible is true', async () => {
+    let closeEmitted = false;
+    component.close.subscribe(() => (closeEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'popover-outside',
+      type: 'Popover',
+      props: {
+        title: 'Outside Click Popover',
+        visible: true,
+        dismissible: true,
+      },
+    });
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    const outsideDiv = document.createElement('div');
+    document.body.appendChild(outsideDiv);
+    outsideDiv.click();
+    document.body.removeChild(outsideDiv);
+
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(closeEmitted).toBe(true);
+  });
+
+  it('should implement ContainerComponent', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'popover-vc',
+      type: 'Popover',
+      props: { title: 'Popover VC', visible: false },
+    });
+    fixture.detectChanges();
+    expect(component.vc).toBeDefined();
+  });
+
+  it('should not crash with null or undefined props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'popover-null',
+      type: 'Popover',
+      props: null,
+    });
+    expect(() => fixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/popover/popover.component.ts b/packages/angular-renderer/src/components/primitives/popover/popover.component.ts
new file mode 100644
index 0000000..63238fa
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/popover/popover.component.ts
@@ -0,0 +1,338 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  TemplateRef,
+  ElementRef,
+  computed,
+  effect,
+  DestroyRef,
+} from '@angular/core';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+import {
+  OrigoOverlayConfig,
+  OrigoOverlayRef,
+  OrigoOverlayOriginX,
+  OrigoOverlayOriginY,
+} from '../../../lib/overlay/overlay.models';
+
+export interface PopoverProps {
+  visible?: boolean;
+  placement?:
+    | 'top'
+    | 'bottom'
+    | 'left'
+    | 'right'
+    | 'top-start'
+    | 'top-end'
+    | 'bottom-start'
+    | 'bottom-end'
+    | 'left-start'
+    | 'left-end'
+    | 'right-start'
+    | 'right-end';
+  dismissible?: boolean;
+  closeOnEscape?: boolean;
+  showClose?: boolean;
+  offset?: [number, number];
+  title?: string;
+  data?: unknown;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const PopoverContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  visible: 'boolean',
+  placement: 'string',
+  dismissible: 'boolean',
+  closeOnEscape: 'boolean',
+  showClose: 'boolean',
+  title: 'string',
+  offset: 'array',
+  data: 'object',
+} as const;
+
+function getConnectedPosition(
+  placement = 'bottom',
+  customOffset?: [number, number]
+): {
+  originX: OrigoOverlayOriginX;
+  originY: OrigoOverlayOriginY;
+  overlayX: OrigoOverlayOriginX;
+  overlayY: OrigoOverlayOriginY;
+  offset: [number, number];
+} {
+  switch (placement) {
+    case 'top':
+      return {
+        originX: 'center',
+        originY: 'top',
+        overlayX: 'center',
+        overlayY: 'bottom',
+        offset: customOffset ?? [0, -8],
+      };
+    case 'top-start':
+      return {
+        originX: 'start',
+        originY: 'top',
+        overlayX: 'start',
+        overlayY: 'bottom',
+        offset: customOffset ?? [0, -8],
+      };
+    case 'top-end':
+      return {
+        originX: 'end',
+        originY: 'top',
+        overlayX: 'end',
+        overlayY: 'bottom',
+        offset: customOffset ?? [0, -8],
+      };
+    case 'left':
+      return {
+        originX: 'start',
+        originY: 'center',
+        overlayX: 'end',
+        overlayY: 'center',
+        offset: customOffset ?? [-8, 0],
+      };
+    case 'left-start':
+      return {
+        originX: 'start',
+        originY: 'top',
+        overlayX: 'end',
+        overlayY: 'top',
+        offset: customOffset ?? [-8, 0],
+      };
+    case 'left-end':
+      return {
+        originX: 'start',
+        originY: 'bottom',
+        overlayX: 'end',
+        overlayY: 'bottom',
+        offset: customOffset ?? [-8, 0],
+      };
+    case 'right':
+      return {
+        originX: 'end',
+        originY: 'center',
+        overlayX: 'start',
+        overlayY: 'center',
+        offset: customOffset ?? [8, 0],
+      };
+    case 'right-start':
+      return {
+        originX: 'end',
+        originY: 'top',
+        overlayX: 'start',
+        overlayY: 'top',
+        offset: customOffset ?? [8, 0],
+      };
+    case 'right-end':
+      return {
+        originX: 'end',
+        originY: 'bottom',
+        overlayX: 'start',
+        overlayY: 'bottom',
+        offset: customOffset ?? [8, 0],
+      };
+    case 'bottom-start':
+      return {
+        originX: 'start',
+        originY: 'bottom',
+        overlayX: 'start',
+        overlayY: 'top',
+        offset: customOffset ?? [0, 8],
+      };
+    case 'bottom-end':
+      return {
+        originX: 'end',
+        originY: 'bottom',
+        overlayX: 'end',
+        overlayY: 'top',
+        offset: customOffset ?? [0, 8],
+      };
+    case 'bottom':
+    default:
+      return {
+        originX: 'center',
+        originY: 'bottom',
+        overlayX: 'center',
+        overlayY: 'top',
+        offset: customOffset ?? [0, 8],
+      };
+  }
+}
+
+@Component({
+  selector: 'origo-popover',
+  standalone: true,
+  templateUrl: './popover.component.html',
+  styleUrls: ['./popover.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-popover-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+  },
+})
+export class PopoverComponent implements OrigoAdapter<PopoverProps>, ContainerComponent {
+  static readonly contractSchema = PopoverContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<PopoverProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+
+  triggerWrapper = viewChild<ElementRef<HTMLElement>>('triggerWrapper');
+  popoverTemplate = viewChild('popoverTemplate', { read: TemplateRef });
+
+  visibleChange = output<boolean>();
+  open = output<void>();
+  close = output<void>();
+  action = output<unknown>();
+
+  private overlayService = inject(OrigoOverlayService);
+  private destroyRef = inject(DestroyRef);
+  private vcr = inject(ViewContainerRef);
+  private experienceAdapter = inject(WebExperienceAdapterService);
+
+  private overlayRef: OrigoOverlayRef | null = null;
+  private isPopoverOpen = false;
+
+  coercedProps = computed(() =>
+    coerceContractProps<PopoverProps>(this.contract()?.props ?? {}, PopoverContractSchema)
+  );
+
+  computedVisible = computed(() => !!this.coercedProps().visible);
+  computedPlacement = computed(() => this.coercedProps().placement ?? 'bottom');
+  computedDismissible = computed(() => this.coercedProps().dismissible !== false);
+  computedCloseOnEscape = computed(() => this.coercedProps().closeOnEscape !== false);
+  computedShowClose = computed(() => !!this.coercedProps().showClose);
+  computedOffset = computed(() => this.coercedProps().offset);
+  computedTitle = computed(() => this.coercedProps().title);
+
+  computedAriaLabel = computed(() => {
+    const label = this.contract()?.props?.['aria-label'];
+    return label !== undefined && label !== null ? String(label) : 'Popover';
+  });
+
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract()?.props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
+
+  constructor() {
+    effect(() => {
+      const visible = this.computedVisible();
+      if (visible && !this.isPopoverOpen) {
+        this.openPopover();
+      } else if (!visible && this.isPopoverOpen) {
+        this.closePopover(false);
+      }
+    });
+
+    this.destroyRef.onDestroy(() => {
+      this.cleanup();
+    });
+  }
+
+  isOpen(): boolean {
+    return this.isPopoverOpen;
+  }
+
+  toggle(): void {
+    if (this.isPopoverOpen) {
+      this.closePopover(true);
+    } else {
+      this.openPopover();
+    }
+  }
+
+  openPopover(): void {
+    if (this.isPopoverOpen) return;
+
+    const tpl = this.popoverTemplate();
+    const trigger = this.triggerWrapper()?.nativeElement;
+    if (!tpl || !trigger) return;
+
+    const pos = getConnectedPosition(this.computedPlacement(), this.computedOffset());
+
+    const config: OrigoOverlayConfig = {
+      position: {
+        type: 'connected',
+        target: trigger,
+        originX: pos.originX,
+        originY: pos.originY,
+        overlayX: pos.overlayX,
+        overlayY: pos.overlayY,
+        offset: pos.offset,
+        autoRepositionOnResize: true,
+      },
+      hasBackdrop: false,
+      panelClass: ['origo-overlay-pane--popover', 'origo-overlay-pane--connected'],
+      closeOnOutsideClick: this.computedDismissible(),
+      closeOnEscape: this.computedCloseOnEscape(),
+      viewContainerRef: this.vcr,
+    };
+
+    this.overlayRef = this.overlayService.create(config, this.destroyRef);
+    this.overlayRef.open(tpl, this.vcr);
+    this.isPopoverOpen = true;
+
+    this.visibleChange.emit(true);
+    this.open.emit();
+    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
+    this.experienceAdapter.dispatchCapability(this.contract().id, 'open', undefined);
+
+    this.overlayRef.afterClosed().then(result => {
+      if (this.isPopoverOpen) {
+        this.isPopoverOpen = false;
+        this.visibleChange.emit(false);
+        this.close.emit();
+        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+        this.experienceAdapter.dispatchCapability(this.contract().id, 'close', result);
+      }
+    });
+  }
+
+  closePopover(notify = true): void {
+    if (!this.isPopoverOpen) return;
+    this.isPopoverOpen = false;
+
+    if (this.overlayRef?.isOpen) {
+      this.overlayRef.close();
+    }
+
+    if (notify) {
+      this.visibleChange.emit(false);
+      this.close.emit();
+      this.experienceAdapter.updateState(this.contract().id, 'visible', false);
+      this.experienceAdapter.dispatchCapability(this.contract().id, 'close', undefined);
+    }
+  }
+
+  private cleanup(): void {
+    if (this.overlayRef) {
+      this.overlayRef.dispose();
+      this.overlayRef = null;
+    }
+    this.isPopoverOpen = false;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.html b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.html
new file mode 100644
index 0000000..16c35d9
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.html
@@ -0,0 +1,27 @@
+<div
+  #triggerWrapper
+  class="origo-tooltip__trigger-wrapper"
+  [attr.aria-describedby]="isOpen() ? tooltipId : null"
+  (mouseenter)="onMouseEnter()"
+  (mouseleave)="onMouseLeave()"
+  (focusin)="onFocusIn()"
+  (focusout)="onFocusOut()"
+>
+  <ng-container #vc></ng-container>
+  <ng-content></ng-content>
+</div>
+
+<ng-template #tooltipTemplate>
+  <div
+    [id]="tooltipId"
+    role="tooltip"
+    class="origo-tooltip"
+    [class.origo-tooltip--top]="computedPosition() === 'top'"
+    [class.origo-tooltip--bottom]="computedPosition() === 'bottom'"
+    [class.origo-tooltip--left]="computedPosition() === 'left'"
+    [class.origo-tooltip--right]="computedPosition() === 'right'"
+    [attr.data-testid]="contract().id"
+  >
+    <span class="origo-tooltip__text">{{ computedContent() }}</span>
+  </div>
+</ng-template>
diff --git a/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.scss b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.scss
new file mode 100644
index 0000000..c3ee0db
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.scss
@@ -0,0 +1,30 @@
+:host {
+  display: inline-block;
+}
+
+.origo-tooltip {
+  display: inline-flex;
+  align-items: center;
+  box-sizing: border-box;
+  background-color: var(--origo-color-surface-inverse, var(--origo-color-surface-overlay));
+  color: var(--origo-color-text-inverse, var(--origo-color-text-primary));
+  border-radius: var(--origo-radius-sm);
+  box-shadow: var(--origo-shadow-md);
+  padding-inline: var(--origo-space-sm);
+  padding-block: var(--origo-space-xs);
+  font-size: var(--origo-font-size-sm);
+  line-height: var(--origo-line-height-tight);
+  max-inline-size: min(80vw, 280px);
+  pointer-events: none;
+  user-select: none;
+  word-break: break-word;
+
+  &__trigger-wrapper {
+    display: inline-flex;
+    align-items: center;
+  }
+
+  &__text {
+    display: inline;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.spec.ts b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.spec.ts
new file mode 100644
index 0000000..3c0db60
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.spec.ts
@@ -0,0 +1,221 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { TooltipComponent } from './tooltip.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('TooltipComponent', () => {
+  let component: TooltipComponent;
+  let fixture: ComponentFixture<TooltipComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [TooltipComponent],
+      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(TooltipComponent);
+    component = fixture.componentInstance;
+  });
+
+  afterEach(() => {
+    fixture.destroy();
+    const overlayContainer = document.querySelector('.cdk-overlay-container');
+    if (overlayContainer) {
+      overlayContainer.innerHTML = '';
+    }
+  });
+
+  it('should create and render trigger wrapper', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-1',
+      type: 'Tooltip',
+      props: {
+        content: 'Tooltip text',
+      },
+    });
+    fixture.detectChanges();
+
+    expect(component).toBeTruthy();
+    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('tooltip-1');
+  });
+
+  it('should show tooltip on mouseenter and hide on mouseleave with delays', async () => {
+    let showEmitted = false;
+    let hideEmitted = false;
+    component.show.subscribe(() => (showEmitted = true));
+    component.hide.subscribe(() => (hideEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-hover',
+      type: 'Tooltip',
+      props: {
+        content: 'Hover text',
+        showDelay: 20,
+        hideDelay: 20,
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;
+    expect(trigger).toBeTruthy();
+
+    // Trigger mouseenter
+    trigger.dispatchEvent(new MouseEvent('mouseenter'));
+    expect(component.isOpen()).toBe(false);
+
+    // Wait for showDelay
+    await new Promise(resolve => setTimeout(resolve, 50));
+    fixture.detectChanges();
+
+    expect(showEmitted).toBe(true);
+    expect(component.isOpen()).toBe(true);
+    const tooltipEl = document.querySelector('.origo-tooltip');
+    expect(tooltipEl).toBeTruthy();
+    expect(tooltipEl?.textContent?.trim()).toBe('Hover text');
+
+    // Trigger mouseleave
+    trigger.dispatchEvent(new MouseEvent('mouseleave'));
+    expect(component.isOpen()).toBe(true);
+
+    // Wait for hideDelay
+    await new Promise(resolve => setTimeout(resolve, 50));
+    fixture.detectChanges();
+
+    expect(hideEmitted).toBe(true);
+    expect(component.isOpen()).toBe(false);
+  });
+
+  it('should show on focusin and hide on focusout', async () => {
+    let showEmitted = false;
+    let hideEmitted = false;
+    component.show.subscribe(() => (showEmitted = true));
+    component.hide.subscribe(() => (hideEmitted = true));
+
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-focus',
+      type: 'Tooltip',
+      props: {
+        content: 'Focus text',
+        showDelay: 0,
+        hideDelay: 0,
+        trigger: 'focus',
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;
+
+    trigger.dispatchEvent(new FocusEvent('focusin'));
+    await new Promise(resolve => setTimeout(resolve, 10));
+    fixture.detectChanges();
+
+    expect(showEmitted).toBe(true);
+    expect(component.isOpen()).toBe(true);
+
+    trigger.dispatchEvent(new FocusEvent('focusout'));
+    await new Promise(resolve => setTimeout(resolve, 10));
+    fixture.detectChanges();
+
+    expect(hideEmitted).toBe(true);
+    expect(component.isOpen()).toBe(false);
+  });
+
+  it('should close immediately on Escape key', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-esc',
+      type: 'Tooltip',
+      props: {
+        content: 'Escape text',
+        showDelay: 0,
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;
+
+    trigger.dispatchEvent(new MouseEvent('mouseenter'));
+    await new Promise(resolve => setTimeout(resolve, 10));
+    fixture.detectChanges();
+    expect(component.isOpen()).toBe(true);
+
+    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
+    document.dispatchEvent(event);
+    fixture.detectChanges();
+    await new Promise(resolve => setTimeout(resolve, 10));
+
+    expect(component.isOpen()).toBe(false);
+  });
+
+  it('should not show when disabled is true', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-disabled',
+      type: 'Tooltip',
+      props: {
+        content: 'Disabled text',
+        disabled: true,
+        showDelay: 0,
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;
+
+    trigger.dispatchEvent(new MouseEvent('mouseenter'));
+    await new Promise(resolve => setTimeout(resolve, 10));
+    fixture.detectChanges();
+
+    expect(component.isOpen()).toBe(false);
+  });
+
+  it('should synchronize aria-describedby on trigger wrapper', async () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-aria',
+      type: 'Tooltip',
+      props: {
+        content: 'Aria text',
+        showDelay: 0,
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;
+
+    expect(trigger.getAttribute('aria-describedby')).toBeNull();
+
+    trigger.dispatchEvent(new MouseEvent('mouseenter'));
+    await new Promise(resolve => setTimeout(resolve, 10));
+    fixture.detectChanges();
+
+    expect(trigger.getAttribute('aria-describedby')).toBe(component.tooltipId);
+
+    trigger.dispatchEvent(new MouseEvent('mouseleave'));
+    await new Promise(resolve => setTimeout(resolve, 170));
+    fixture.detectChanges();
+
+    expect(trigger.getAttribute('aria-describedby')).toBeNull();
+  });
+
+  it('should implement ContainerComponent', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-vc',
+      type: 'Tooltip',
+      props: { content: 'Tooltip VC' },
+    });
+    fixture.detectChanges();
+    expect(component.vc).toBeDefined();
+  });
+
+  it('should not crash with null or undefined props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'tooltip-null',
+      type: 'Tooltip',
+      props: null,
+    });
+    expect(() => fixture.detectChanges()).not.toThrow();
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.ts b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.ts
new file mode 100644
index 0000000..9a781bb
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.ts
@@ -0,0 +1,321 @@
+import {
+  Component,
+  input,
+  output,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  viewChild,
+  ViewContainerRef,
+  TemplateRef,
+  ElementRef,
+  computed,
+  signal,
+  DestroyRef,
+  HostListener,
+} from '@angular/core';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
+import {
+  OrigoOverlayConfig,
+  OrigoOverlayRef,
+  OrigoOverlayOriginX,
+  OrigoOverlayOriginY,
+} from '../../../lib/overlay/overlay.models';
+
+let tooltipCounter = 0;
+
+export interface TooltipProps {
+  content?: string;
+  position?: 'top' | 'bottom' | 'left' | 'right';
+  showDelay?: number;
+  hideDelay?: number;
+  disabled?: boolean;
+  trigger?: 'hover' | 'focus' | 'both' | 'manual';
+  offset?: [number, number];
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+export const TooltipContractSchema = {
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  content: 'string',
+  position: 'string',
+  showDelay: 'number',
+  hideDelay: 'number',
+  disabled: 'boolean',
+  trigger: 'string',
+  offset: 'array',
+} as const;
+
+function getTooltipConnectedPosition(
+  position = 'top',
+  customOffset?: [number, number]
+): {
+  originX: OrigoOverlayOriginX;
+  originY: OrigoOverlayOriginY;
+  overlayX: OrigoOverlayOriginX;
+  overlayY: OrigoOverlayOriginY;
+  offset: [number, number];
+} {
+  switch (position) {
+    case 'bottom':
+      return {
+        originX: 'center',
+        originY: 'bottom',
+        overlayX: 'center',
+        overlayY: 'top',
+        offset: customOffset ?? [0, 6],
+      };
+    case 'left':
+      return {
+        originX: 'start',
+        originY: 'center',
+        overlayX: 'end',
+        overlayY: 'center',
+        offset: customOffset ?? [-6, 0],
+      };
+    case 'right':
+      return {
+        originX: 'end',
+        originY: 'center',
+        overlayX: 'start',
+        overlayY: 'center',
+        offset: customOffset ?? [6, 0],
+      };
+    case 'top':
+    default:
+      return {
+        originX: 'center',
+        originY: 'top',
+        overlayX: 'center',
+        overlayY: 'bottom',
+        offset: customOffset ?? [0, -6],
+      };
+  }
+}
+
+@Component({
+  selector: 'origo-tooltip',
+  standalone: true,
+  templateUrl: './tooltip.component.html',
+  styleUrls: ['./tooltip.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-tooltip-host]': 'true',
+    '[attr.data-testid]': 'contract().id',
+  },
+})
+export class TooltipComponent implements OrigoAdapter<TooltipProps>, ContainerComponent {
+  static readonly contractSchema = TooltipContractSchema;
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<TooltipProps>>();
+  vc = viewChild('vc', { read: ViewContainerRef });
+
+  triggerWrapper = viewChild<ElementRef<HTMLElement>>('triggerWrapper');
+  tooltipTemplate = viewChild('tooltipTemplate', { read: TemplateRef });
+
+  show = output<void>();
+  hide = output<void>();
+
+  private overlayService = inject(OrigoOverlayService);
+  private destroyRef = inject(DestroyRef);
+  private vcr = inject(ViewContainerRef);
+  private experienceAdapter = inject(WebExperienceAdapterService);
+
+  private readonly id = ++tooltipCounter;
+  readonly tooltipId = `origo-tooltip-${this.id}`;
+
+  private overlayRef: OrigoOverlayRef | null = null;
+  readonly isTooltipOpen = signal(false);
+  private showTimer: ReturnType<typeof setTimeout> | null = null;
+  private hideTimer: ReturnType<typeof setTimeout> | null = null;
+
+  coercedProps = computed(() =>
+    coerceContractProps<TooltipProps>(this.contract()?.props ?? {}, TooltipContractSchema)
+  );
+
+  computedContent = computed(() => this.coercedProps().content);
+  computedPosition = computed(() => this.coercedProps().position ?? 'top');
+  computedShowDelay = computed(() => this.coercedProps().showDelay ?? 150);
+  computedHideDelay = computed(() => this.coercedProps().hideDelay ?? 150);
+  computedDisabled = computed(() => !!this.coercedProps().disabled);
+  computedTrigger = computed(() => this.coercedProps().trigger ?? 'both');
+  computedOffset = computed(() => this.coercedProps().offset);
+
+  constructor() {
+    this.destroyRef.onDestroy(() => {
+      this.cleanup();
+    });
+  }
+
+  isOpen(): boolean {
+    return this.isTooltipOpen();
+  }
+
+  @HostListener('keydown.escape')
+  onEscape(): void {
+    this.clearTimers();
+    this.hideTooltip();
+  }
+
+  onMouseEnter(): void {
+    const tr = this.computedTrigger();
+    if (tr === 'hover' || tr === 'both') {
+      this.scheduleShow();
+    }
+  }
+
+  onMouseLeave(): void {
+    const tr = this.computedTrigger();
+    if (tr === 'hover' || tr === 'both') {
+      this.scheduleHide();
+    }
+  }
+
+  onFocusIn(): void {
+    const tr = this.computedTrigger();
+    if (tr === 'focus' || tr === 'both') {
+      this.scheduleShow();
+    }
+  }
+
+  onFocusOut(): void {
+    const tr = this.computedTrigger();
+    if (tr === 'focus' || tr === 'both') {
+      this.scheduleHide();
+    }
+  }
+
+  private scheduleShow(): void {
+    if (this.computedDisabled() || !this.computedContent()) {
+      return;
+    }
+
+    if (this.hideTimer) {
+      clearTimeout(this.hideTimer);
+      this.hideTimer = null;
+    }
+
+    if (this.isTooltipOpen()) return;
+
+    const delay = this.computedShowDelay();
+    if (delay <= 0) {
+      this.showTooltip();
+    } else {
+      this.showTimer = setTimeout(() => {
+        this.showTooltip();
+      }, delay);
+    }
+  }
+
+  private scheduleHide(): void {
+    if (this.showTimer) {
+      clearTimeout(this.showTimer);
+      this.showTimer = null;
+    }
+
+    if (!this.isTooltipOpen()) return;
+
+    const delay = this.computedHideDelay();
+    if (delay <= 0) {
+      this.hideTooltip();
+    } else {
+      this.hideTimer = setTimeout(() => {
+        this.hideTooltip();
+      }, delay);
+    }
+  }
+
+  showTooltip(): void {
+    if (this.isTooltipOpen() || this.computedDisabled() || !this.computedContent()) return;
+
+    const tpl = this.tooltipTemplate();
+    const trigger = this.triggerWrapper()?.nativeElement;
+    if (!tpl || !trigger) return;
+
+    const pos = getTooltipConnectedPosition(this.computedPosition(), this.computedOffset());
+
+    const config: OrigoOverlayConfig = {
+      position: {
+        type: 'connected',
+        target: trigger,
+        originX: pos.originX,
+        originY: pos.originY,
+        overlayX: pos.overlayX,
+        overlayY: pos.overlayY,
+        offset: pos.offset,
+        autoRepositionOnResize: true,
+      },
+      hasBackdrop: false,
+      panelClass: [
+        'origo-overlay-pane--tooltip',
+        'origo-overlay-pane--connected',
+        `origo-overlay-pane--tooltip-${this.computedPosition()}`,
+      ],
+      closeOnOutsideClick: false,
+      closeOnEscape: true,
+      viewContainerRef: this.vcr,
+    };
+
+    this.overlayRef = this.overlayService.create(config, this.destroyRef);
+    this.overlayRef.open(tpl, this.vcr);
+    this.isTooltipOpen.set(true);
+
+    this.show.emit();
+    this.experienceAdapter.dispatchCapability(this.contract().id, 'show', undefined);
+
+    this.overlayRef.afterClosed().then(() => {
+      if (this.isTooltipOpen()) {
+        this.isTooltipOpen.set(false);
+        this.hide.emit();
+        this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', undefined);
+      }
+    });
+  }
+
+  hideTooltip(): void {
+    if (!this.isTooltipOpen()) return;
+    this.isTooltipOpen.set(false);
+
+    if (this.overlayRef?.isOpen) {
+      this.overlayRef.close();
+    }
+
+    this.hide.emit();
+    this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', undefined);
+  }
+
+  private clearTimers(): void {
+    if (this.showTimer) {
+      clearTimeout(this.showTimer);
+      this.showTimer = null;
+    }
+    if (this.hideTimer) {
+      clearTimeout(this.hideTimer);
+      this.hideTimer = null;
+    }
+  }
+
+  private cleanup(): void {
+    this.clearTimers();
+    if (this.overlayRef) {
+      this.overlayRef.dispose();
+      this.overlayRef = null;
+    }
+    this.isTooltipOpen.set(false);
+  }
+}
diff --git a/packages/angular-renderer/src/index.ts b/packages/angular-renderer/src/index.ts
index 956b2d3..c5ac63f 100644
--- a/packages/angular-renderer/src/index.ts
+++ b/packages/angular-renderer/src/index.ts
@@ -41,6 +41,11 @@ export * from './components/primitives/dropzone/dropzone.component';
 export * from './components/primitives/rich-text-editor/rich-text-editor.component';
 export * from './components/primitives/pagination/pagination.component';
 export * from './components/primitives/stepper/stepper.component';
+export * from './components/primitives/dialog/dialog.component';
+export * from './components/primitives/modal/modal.component';
+export * from './components/primitives/drawer/drawer.component';
+export * from './components/primitives/popover/popover.component';
+export * from './components/primitives/tooltip/tooltip.component';
 export * from './lib/overlay/overlay.models';
 export * from './lib/overlay/overlay-ref';
 export * from './lib/overlay/overlay.service';
diff --git a/packages/angular-renderer/src/lib/primitives.provider.ts b/packages/angular-renderer/src/lib/primitives.provider.ts
index 39a9d41..2fdd637 100644
--- a/packages/angular-renderer/src/lib/primitives.provider.ts
+++ b/packages/angular-renderer/src/lib/primitives.provider.ts
@@ -37,9 +37,20 @@ import { DropzoneComponent } from '../components/primitives/dropzone/dropzone.co
 import { RichTextEditorComponent } from '../components/primitives/rich-text-editor/rich-text-editor.component';
 import { PaginationComponent } from '../components/primitives/pagination/pagination.component';
 import { StepperComponent } from '../components/primitives/stepper/stepper.component';
+import { DialogComponent } from '../components/primitives/dialog/dialog.component';
+import { ModalComponent } from '../components/primitives/modal/modal.component';
+import { DrawerComponent } from '../components/primitives/drawer/drawer.component';
+import { PopoverComponent } from '../components/primitives/popover/popover.component';
+import { TooltipComponent } from '../components/primitives/tooltip/tooltip.component';
 
 export function provideOrigo9Primitives(): EnvironmentProviders {
   const registryMap = new Map<string, unknown>([
+    ['Dialog', DialogComponent],
+    ['Modal', ModalComponent],
+    ['Drawer', DrawerComponent],
+    ['SidebarDrawer', DrawerComponent],
+    ['Popover', PopoverComponent],
+    ['Tooltip', TooltipComponent],
     ['IconButton', IconButtonComponent],
     ['ButtonGroup', ButtonGroupComponent],
     ['FloatingActionButton', FloatingActionButtonComponent],
diff --git a/packages/angular-renderer/src/styles/overlay.scss b/packages/angular-renderer/src/styles/overlay.scss
index 8be3d9a..d6d0d34 100644
--- a/packages/angular-renderer/src/styles/overlay.scss
+++ b/packages/angular-renderer/src/styles/overlay.scss
@@ -45,23 +45,19 @@
   flex-direction: column;
 
   // Design Token Surface & Elevation bindings
-  background-color: var(--origo-color-surface-overlay, var(--origo-color-surface-primary, #ffffff));
-  color: var(--origo-color-text-primary, #111827);
-  border-radius: var(--origo-radius-md, 8px);
-  box-shadow: var(
-    --origo-shadow-lg,
-    0 10px 15px -3px rgba(0, 0, 0, 0.1),
-    0 4px 6px -2px rgba(0, 0, 0, 0.05)
-  );
-  border: 1px solid var(--origo-color-border-subtle, rgba(0, 0, 0, 0.08));
+  background-color: var(--origo-color-surface-overlay, var(--origo-color-surface-primary));
+  color: var(--origo-color-text-primary);
+  border-radius: var(--origo-radius-md);
+  box-shadow: var(--origo-shadow-lg);
+  border: var(--origo-border-width-default) solid var(--origo-color-border-subtle);
 
   // CSS Logical Properties for spacing
-  padding-inline: var(--origo-space-md, 16px);
-  padding-block: var(--origo-space-md, 16px);
+  padding-inline: var(--origo-space-md);
+  padding-block: var(--origo-space-md);
 
   outline: none;
 
-  // Connected Dropdown modifier
+  // Connected Dropdown / Anchored modifier
   &.origo-overlay-pane--connected {
     padding-inline: 0;
     padding-block: 0;
@@ -71,10 +67,58 @@
   }
 
   // Modal Dialog modifier
-  &.origo-overlay-pane--modal {
+  &.origo-overlay-pane--modal,
+  &.origo-overlay-pane--dialog {
+    padding-inline: 0;
+    padding-block: 0;
+    background: transparent;
+    border: none;
+    box-shadow: none;
+    overflow: visible;
     inline-size: min(90vw, 560px);
-    max-block-size: 85vh;
-    overflow-y: auto;
+    max-block-size: 90vh;
+  }
+
+  // Maximized Dialog modifier
+  &.origo-overlay-pane--maximized {
+    inline-size: 100vw !important;
+    block-size: 100vh !important;
+    max-inline-size: 100vw !important;
+    max-block-size: 100vh !important;
+    inset-block-start: 0 !important;
+    inset-inline-start: 0 !important;
+    border-radius: 0 !important;
+  }
+
+  // Slide-in Drawer modifier
+  &.origo-overlay-pane--drawer {
+    padding-inline: 0;
+    padding-block: 0;
+    background: transparent;
+    border: none;
+    box-shadow: none;
+    overflow: hidden;
+  }
+
+  // Floating Popover modifier
+  &.origo-overlay-pane--popover {
+    padding-inline: 0;
+    padding-block: 0;
+    background: transparent;
+    border: none;
+    box-shadow: none;
+    overflow: visible;
+  }
+
+  // Floating Tooltip modifier
+  &.origo-overlay-pane--tooltip {
+    padding-inline: 0;
+    padding-block: 0;
+    background: transparent;
+    border: none;
+    box-shadow: none;
+    overflow: visible;
+    pointer-events: none;
   }
 }
 
@@ -88,21 +132,21 @@
 
 // Theme Inheritance Scopes
 .origo-overlay-pane.theme-dark {
-  background-color: var(--origo-color-surface-overlay, #1f2937);
-  color: var(--origo-color-text-primary, #f9fafb);
-  border-color: var(--origo-color-border-subtle, rgba(255, 255, 255, 0.12));
+  background-color: var(--origo-color-surface-overlay);
+  color: var(--origo-color-text-primary);
+  border-color: var(--origo-color-border-subtle);
 }
 
 .origo-overlay-pane.theme-light {
-  background-color: var(--origo-color-surface-overlay, #ffffff);
-  color: var(--origo-color-text-primary, #111827);
-  border-color: var(--origo-color-border-subtle, rgba(0, 0, 0, 0.08));
+  background-color: var(--origo-color-surface-overlay);
+  color: var(--origo-color-text-primary);
+  border-color: var(--origo-color-border-subtle);
 }
 
 .origo-overlay-pane.high-contrast {
-  background-color: #000000;
-  color: #ffffff;
-  border: 2px solid #ffffff;
+  background-color: var(--origo-color-surface-inverse);
+  color: var(--origo-color-text-inverse);
+  border: var(--origo-border-width-focus) solid var(--origo-color-text-inverse);
 }
 
 // Prefers Reduced Motion Guardrail
diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
index 99a93ea..7815d1d 100644
--- a/tools/test-registry/test-registry.yaml
+++ b/tools/test-registry/test-registry.yaml
@@ -1041,3 +1041,48 @@ test_cases:
       - 2-1-navigation-components
     last_result: pass
     results: {}
+  - id: renderer-primitive-dialog
+    description: 'Verifies Dialog primitive rendering, portal projection, modal backdrops, and actions'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/dialog/dialog.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-2-modal-and-overlay-components
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-modal
+    description: 'Verifies Modal primitive architectural invariant and backdrop lock'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/modal/modal.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-2-modal-and-overlay-components
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-drawer
+    description: 'Verifies Drawer primitive sliding positions, docking, and dismissibility'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/drawer/drawer.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-2-modal-and-overlay-components
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-popover
+    description: 'Verifies Popover primitive connected anchoring, toggling, and outside-click'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/popover/popover.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-2-modal-and-overlay-components
+    last_result: pass
+    results: {}
+  - id: renderer-primitive-tooltip
+    description: 'Verifies Tooltip primitive hover/focus triggers, delays, and accessible descriptions'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/tooltip/tooltip.component.spec.ts
+    type: unit
+    affected_stories:
+      - 2-2-modal-and-overlay-components
+    last_result: pass
+    results: {}

```
