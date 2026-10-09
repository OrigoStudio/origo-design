Invoke the bmad-review-edge-case-hunter skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/1-5-application-layout-primitives.md b/_bmad-output/implementation-artifacts/1-5-application-layout-primitives.md
new file mode 100644
index 0000000..fc67ce9
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/1-5-application-layout-primitives.md
@@ -0,0 +1,187 @@
+---
+story_id: "1.5"
+story_key: 1-5-application-layout-primitives
+baseline_commit: 87f3aef
+---
+
+# Story 1.5: Application Layout Primitives
+
+Status: ready-for-dev
+
+## Story
+
+As a developer,
+I want to use layout primitives with built-in responsive breakpoints,
+So that I can structure pages without writing custom CSS.
+
+## Acceptance Criteria
+
+1. **Given** a responsive Origo environment **When** I configure or utilize the layout primitives (`Container`, `Grid`, `Stack`) **Then** the layout must adapt its direction, columns, or spacing automatically via CSS variables crossing token breakpoints (`--origo-breakpoint-*`).
+2. **Given** a component supporting elevation (`Card`) **When** rendered **Then** it must render with consistent elevation mapped to semantic tokens (`var(--origo-shadow-sm)`, `var(--origo-shadow-md)`, `var(--origo-shadow-lg)`) respecting Light/Dark themes, with zero hardcoded HEX, RGB, or fallback literals in stylesheets (ADR: AD-6).
+3. **Given** an Angular SSR context **When** the components initialize **Then** they must be strictly SSR-compatible, with zero direct references to DOM globals (`window`, `document`) during initialization without `isPlatformBrowser` guards.
+4. **Given** a dynamic BADL AST rendering lifecycle **When** child nodes exist under a layout primitive (`Container`, `Grid`, `Stack`, `Card`) **Then** each component must implement `ContainerComponent`, expose `vc = viewChild.required('vc', { read: ViewContainerRef })`, and render `<ng-container #vc></ng-container>` so `renderer.component.ts` can recursively instantiate AST children (ADR: P1-AD-1, P1-AD-5). In addition, `<ng-content>` must be provided for direct template projection.
+5. **Given** any layout primitive **When** configured from a JSON metadata payload **Then** it must instantiate cleanly using Angular 18 Standalone + Signals (no NgModules) and expose standard metadata hooks (`permissions`, `rules`, `metadata`, `aria-label`, `aria-describedby`).
+6. **Given** a `Stack` or `Grid` component **When** configured with layout properties **Then** `Stack` must apply Flexbox layout (`direction`, `gap`, `align`, `justify`, `wrap`) and `Grid` must apply CSS Grid layout (`columns`, `gap`, `responsive`, `align`, `justify`) driven strictly by design tokens and CSS variables.
+7. **Given** a `Divider` component **When** rendered **Then** it must support `orientation` ('horizontal' | 'vertical'), `variant` ('solid' | 'dashed' | 'dotted'), optional centered `content`, and provide accessible semantics with `role="separator"` and `aria-orientation` (ADR: P1-AD-6).
+8. **Given** a `Card` component **When** rendered **Then** it must preserve existing metadata inputs (`title`, `subtitle`, `imageUrl`, `imageAlt`, sanitization), support `elevation`, `variant`, `clickable`, and `hoverable`, and if `clickable: true`, provide `tabindex="0"`, `role="article"`, and emit click events on keyboard activation (`Enter`, `Space`).
+9. **Given** bidirectional layout requirements **When** layout primitives are rendered **Then** they must use CSS logical properties (`padding-inline`, `padding-block`, `margin-inline`, `margin-block`) to support native RTL layouts without physical directional overrides.
+10. **Given** the Definition of Done **When** the story is completed **Then** all new primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`, exported from `packages/angular-renderer/src/index.ts`, and test suites must be registered in `tools/test-registry/test-registry.yaml`.
+
+## ⚠️ Critical: Existing Code — Read Before Writing Anything
+
+### NEW COMPONENTS TO CREATE
+- `ContainerComponent` -> `packages/angular-renderer/src/components/primitives/container/` (files: `container.component.ts`, `container.component.html`, `container.component.scss`, `container.component.spec.ts`) -> Registry key: `'Container'`
+- `GridComponent` -> `packages/angular-renderer/src/components/primitives/grid/` (files: `grid.component.ts`, `grid.component.html`, `grid.component.scss`, `grid.component.spec.ts`) -> Registry key: `'Grid'`
+- `StackComponent` -> `packages/angular-renderer/src/components/primitives/stack/` (files: `stack.component.ts`, `stack.component.html`, `stack.component.scss`, `stack.component.spec.ts`) -> Registry key: `'Stack'`
+- `DividerComponent` -> `packages/angular-renderer/src/components/primitives/divider/` (files: `divider.component.ts`, `divider.component.html`, `divider.component.scss`, `divider.component.spec.ts`) -> Registry key: `'Divider'`
+
+### EXISTING COMPONENTS / FILES TO UPDATE (DO NOT RE-CREATE FROM SCRATCH)
+- `packages/angular-renderer/src/components/primitives/card/card.component.ts`:
+  - **Current State:** Implements `OrigoAdapter<CardProps>`, renders title, subtitle, and sanitized image in Shadow DOM.
+  - **What Must Be Preserved:** Existing props (`title`, `subtitle`, `imageUrl`, `imageAlt`, `aria-label`, `aria-describedby`), URL sanitization via `DomSanitizer`, and RTL compliance.
+  - **What Changes:** Implement `ContainerComponent` interface and expose `vc = viewChild.required('vc', { read: ViewContainerRef })`. Add `elevation` ('none' | 'sm' | 'md' | 'lg'), `variant`, `clickable`, and `hoverable` props.
+- `packages/angular-renderer/src/components/primitives/card/card.component.html`:
+  - Add `<ng-container #vc></ng-container>` and `<ng-content></ng-content>` inside `.origo-card-content` for child and content projection.
+- `packages/angular-renderer/src/components/primitives/card/card.component.scss`:
+  - Purge hardcoded fallback literals (`#ccc`, `#fff`, `#333`, `4px`, `16px`, `8px`, `14px`) to strictly adhere to AD-6.
+  - Add elevation shadow classes mapping to `var(--origo-shadow-sm)`, `var(--origo-shadow-md)`, `var(--origo-shadow-lg)`.
+- `packages/angular-renderer/src/components/primitives/card/card.component.spec.ts`:
+  - Preserve all existing tests; add unit tests for `elevation`, `clickable` keyboard handlers, and `ContainerComponent` child container ref.
+- `packages/angular-renderer/src/lib/primitives.provider.ts`:
+  - Register `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent` in `provideOrigo9Primitives()`. (`Card` is already registered).
+- `packages/angular-renderer/src/index.ts`:
+  - Export `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent`.
+- `tools/test-registry/test-registry.yaml`:
+  - Register unit test cases for `Container`, `Grid`, `Stack`, `Divider`, and updated `Card`.
+
+## Tasks / Subtasks
+
+- [ ] **CREATE `ContainerComponent`** at `packages/angular-renderer/src/components/primitives/container/` (AC: #1, #3, #4, #5, #9)
+  - [ ] Define `ContainerProps`: `fluid?: boolean; maxWidth?: string; padding?: string | number; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string; 'aria-describedby'?: string;`.
+  - [ ] Implement `contractSchema` and `OrigoAdapter<ContainerProps>`.
+  - [ ] Implement `ContainerComponent` interface from `../../../adapters/web/adapter`: expose `vc = viewChild.required('vc', { read: ViewContainerRef })`.
+  - [ ] Template: provide `<ng-container #vc></ng-container>` and `<ng-content></ng-content>`.
+  - [ ] Styling: use CSS logical properties, max-width constraints, and fluid padding via `var(--origo-*)`.
+
+- [ ] **CREATE `GridComponent`** at `packages/angular-renderer/src/components/primitives/grid/` (AC: #1, #3, #4, #5, #6, #9)
+  - [ ] Define `GridProps`: `columns?: number | string | Record<string, number>; gap?: number | string; align?: string; justify?: string; responsive?: Record<string, number>; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string; 'aria-describedby'?: string;`.
+  - [ ] Implement `contractSchema` and `OrigoAdapter<GridProps>`.
+  - [ ] Implement `ContainerComponent` interface: expose `vc = viewChild.required('vc', { read: ViewContainerRef })`.
+  - [ ] Template: provide `<ng-container #vc></ng-container>` and `<ng-content></ng-content>`.
+  - [ ] Styling: CSS Grid layout with responsive column rules adapting across token breakpoints.
+
+- [ ] **CREATE `StackComponent`** at `packages/angular-renderer/src/components/primitives/stack/` (AC: #1, #3, #4, #5, #6, #9)
+  - [ ] Define `StackProps`: `direction?: 'row' | 'column'; gap?: number | string; align?: 'start' | 'center' | 'end' | 'stretch'; justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'; wrap?: boolean | 'wrap' | 'nowrap'; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string; 'aria-describedby'?: string;`.
+  - [ ] Implement `contractSchema` and `OrigoAdapter<StackProps>`.
+  - [ ] Implement `ContainerComponent` interface: expose `vc = viewChild.required('vc', { read: ViewContainerRef })`.
+  - [ ] Template: provide `<ng-container #vc></ng-container>` and `<ng-content></ng-content>`.
+  - [ ] Styling: Flexbox layout with flex-direction, gap, and alignment using CSS variables.
+
+- [ ] **CREATE `DividerComponent`** at `packages/angular-renderer/src/components/primitives/divider/` (AC: #3, #5, #7, #9)
+  - [ ] Define `DividerProps`: `orientation?: 'horizontal' | 'vertical'; variant?: 'solid' | 'dashed' | 'dotted'; thickness?: string | number; content?: string; permissions?: Record<string, string>; rules?: Record<string, unknown>; metadata?: Record<string, unknown>; 'aria-label'?: string;`.
+  - [ ] Implement `contractSchema` and `OrigoAdapter<DividerProps>`.
+  - [ ] Host bindings: `role="separator"`, `[attr.aria-orientation]="computedOrientation()"`.
+  - [ ] Styling: borders styled with `var(--origo-color-border-default)`, thickness, and optional centered content.
+
+- [ ] **UPDATE `CardComponent`** at `packages/angular-renderer/src/components/primitives/card/` (AC: #2, #3, #4, #5, #8, #9)
+  - [ ] Update `CardProps` interface to include: `elevation?: 'none' | 'sm' | 'md' | 'lg'; variant?: string; clickable?: boolean; hoverable?: boolean;`.
+  - [ ] Update `contractSchema` to include new props while preserving all existing props (`title`, `subtitle`, `imageUrl`, `imageAlt`).
+  - [ ] Implement `ContainerComponent` interface: add `vc = viewChild.required('vc', { read: ViewContainerRef })`.
+  - [ ] Update `card.component.html`: include `<ng-container #vc></ng-container>` and `<ng-content></ng-content>` in `.origo-card-content`.
+  - [ ] Update host bindings: `[attr.tabindex]="isClickable() ? '0' : null"`, `[attr.role]="'article'"`, keyboard listeners for `keydown.enter` / `keydown.space`.
+  - [ ] Clean `card.component.scss`: remove all hardcoded fallback literals (`#ccc`, `#fff`, `#333`, `4px`, `16px`, `8px`, `14px`), implement elevation classes (`var(--origo-shadow-*)`).
+
+- [ ] **UPDATE Registrations & Exports** (AC: #10)
+  - [ ] In `packages/angular-renderer/src/lib/primitives.provider.ts`: import and register `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent` in `provideOrigo9Primitives()`.
+  - [ ] In `packages/angular-renderer/src/index.ts`: export `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent`.
+
+- [ ] **TESTS & REGISTRY** (AC: #1–#10)
+  - [ ] Write unit specs for `ContainerComponent`, `GridComponent`, `StackComponent`, `DividerComponent`, and update `CardComponent` spec.
+  - [ ] Verify Shadow DOM piercing (`fixture.nativeElement.shadowRoot ?? fixture.nativeElement`).
+  - [ ] Verify `provideZonelessChangeDetection()` in all specs.
+  - [ ] Verify dynamic child injection via `vc` ViewContainerRef.
+  - [ ] Register all 5 test cases in `tools/test-registry/test-registry.yaml` under `@origo/angular-renderer` with `affected_stories: [1-5-application-layout-primitives]`.
+
+## Dev Notes
+
+### Architecture Compliance
+| AD | Rule |
+|---|---|
+| AD-4 | Import only `@origostudio/core` + Angular SDK — no cross-renderer imports |
+| AD-6 | Zero hardcoded design primitives — only `var(--origo-*)` tokens, zero fallback literals |
+| P1-AD-1 | Angular 18 Standalone + Signals (no NgModules, no `@Input()` decorators) |
+| P1-AD-5 | Composition over inheritance — implement `OrigoAdapter` and `ContainerComponent` interfaces, inject `WebExperienceAdapterService` |
+| P1-AD-6 | axe-core in CI — bind `role="separator"` and `aria-orientation` for Divider; `role="article"` for Card |
+| P2-AD-2 | Form Engine Substrate integration — layout primitives act as transparent container parents for nested form controls |
+
+### Child Rendering Substrate (`ContainerComponent` Interface)
+In `packages/angular-renderer/src/lib/renderer.component.ts`, dynamic AST nodes with children check:
+```typescript
+const instance = componentRef.instance as ContainerComponent;
+let childVc = instance.vc || instance.viewContainerRef;
+```
+All layout containers (`Container`, `Grid`, `Stack`, `Card`) **MUST** implement `ContainerComponent` and declare:
+```typescript
+vc = viewChild.required('vc', { read: ViewContainerRef });
+```
+and render `<ng-container #vc></ng-container>` in their HTML templates. Omitting this breaks nested component rendering in the BADL runtime.
+
+### Design Tokens & Theme Switching (AD-6)
+Never include hardcoded fallback values in SCSS:
+- ❌ Forbidden: `border: 1px solid var(--origo-color-border-default, #ccc);`
+- ❌ Forbidden: `background-color: var(--origo-color-surface-background, #fff);`
+- ❌ Forbidden: `border-radius: var(--origo-radius-sm, 4px);`
+- ✅ Required: `border: 1px solid var(--origo-color-border-default);`
+- ✅ Required: `background-color: var(--origo-color-surface-background);`
+- ✅ Required: `border-radius: var(--origo-radius-sm);`
+- ✅ Required: Elevation via `box-shadow: var(--origo-shadow-sm);`, `var(--origo-shadow-md);`, `var(--origo-shadow-lg);`
+
+### Testing Standards & Test Registry
+- Always use `provideZonelessChangeDetection()` in test configurations.
+- Use Shadow DOM piercing: `const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;`.
+- Use logical properties to maintain RTL support without physical CSS directional overrides.
+- Register all spec files in `tools/test-registry/test-registry.yaml`.
+
+### References
+- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5]
+- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md#4. LAYOUT & PANELS]
+- [Source: packages/angular-renderer/src/adapters/web/adapter.ts#ContainerComponent]
+- [Source: packages/angular-renderer/src/lib/renderer.component.ts]
+
+## Dev Agent Record
+
+### Agent Model Used
+Gemini 3.8 Flash (High)
+
+### Debug Log References
+-
+
+### Completion Notes List
+- Comprehensive context engine analysis and validation completed.
+- Identified and fixed existing CardComponent collision, provider path resolution, AST child rendering substrate requirements, token fallback violations, and central test registry ledger integration.
+
+### File List
+- `packages/angular-renderer/src/components/primitives/container/container.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/container/container.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/container/container.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/container/container.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/grid/grid.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/grid/grid.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/grid/grid.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/grid/grid.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/stack/stack.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/stack/stack.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/stack/stack.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/stack/stack.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/divider/divider.component.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/divider/divider.component.html` (NEW)
+- `packages/angular-renderer/src/components/primitives/divider/divider.component.scss` (NEW)
+- `packages/angular-renderer/src/components/primitives/divider/divider.component.spec.ts` (NEW)
+- `packages/angular-renderer/src/components/primitives/card/card.component.ts` (UPDATE)
+- `packages/angular-renderer/src/components/primitives/card/card.component.html` (UPDATE)
+- `packages/angular-renderer/src/components/primitives/card/card.component.scss` (UPDATE)
+- `packages/angular-renderer/src/components/primitives/card/card.component.spec.ts` (UPDATE)
+- `packages/angular-renderer/src/lib/primitives.provider.ts` (UPDATE)
+- `packages/angular-renderer/src/index.ts` (UPDATE)
+- `tools/test-registry/test-registry.yaml` (UPDATE)
+
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index 4f9865c..f0c3ff7 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-10-07T19:00:21+05:30
-last_updated: 2026-10-08T19:47:30+05:30
+last_updated: 2026-10-09T10:49:40+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -53,7 +53,7 @@ development_status:
   1-2-core-input-controls: done
   1-3-core-selection-controls: done
   1-4-date-and-time-controls: done
-  1-5-application-layout-primitives: backlog
+  1-5-application-layout-primitives: review
   1-6-file-input-and-rich-text-editor: backlog
   epic-1-retrospective: optional
   epic-2: backlog
diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.html b/packages/angular-renderer/src/components/primitives/card/card.component.html
index dfb87bd..2cd2fd6 100644
--- a/packages/angular-renderer/src/components/primitives/card/card.component.html
+++ b/packages/angular-renderer/src/components/primitives/card/card.component.html
@@ -5,14 +5,14 @@
     </div>
   }
 
-  @if (computedTitle() !== undefined || computedSubtitle() !== undefined) {
-    <div class="origo-card-content">
-      @if (computedTitle() !== undefined && computedTitle() !== '') {
-        <div class="origo-card-title" role="heading" aria-level="3">{{ computedTitle() }}</div>
-      }
-      @if (computedSubtitle() !== undefined && computedSubtitle() !== '') {
-        <div class="origo-card-subtitle">{{ computedSubtitle() }}</div>
-      }
-    </div>
-  }
+  <div class="origo-card-content">
+    @if (computedTitle() !== undefined && computedTitle() !== '') {
+      <div class="origo-card-title" role="heading" aria-level="3">{{ computedTitle() }}</div>
+    }
+    @if (computedSubtitle() !== undefined && computedSubtitle() !== '') {
+      <div class="origo-card-subtitle">{{ computedSubtitle() }}</div>
+    }
+    <ng-container #vc></ng-container>
+    <ng-content></ng-content>
+  </div>
 </div>
diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.scss b/packages/angular-renderer/src/components/primitives/card/card.component.scss
index c988bc5..2a04796 100644
--- a/packages/angular-renderer/src/components/primitives/card/card.component.scss
+++ b/packages/angular-renderer/src/components/primitives/card/card.component.scss
@@ -3,13 +3,30 @@
   width: 100%;
 }
 
+:host(.origo-card--elevation-sm) .origo-card-container {
+  box-shadow: var(--origo-shadow-sm);
+}
+:host(.origo-card--elevation-md) .origo-card-container {
+  box-shadow: var(--origo-shadow-md);
+}
+:host(.origo-card--elevation-lg) .origo-card-container {
+  box-shadow: var(--origo-shadow-lg);
+}
+:host(.origo-card--clickable) .origo-card-container {
+  cursor: pointer;
+}
+:host(.origo-card--hoverable) .origo-card-container:hover {
+  box-shadow: var(--origo-shadow-md);
+  transition: box-shadow 0.2s ease-in-out;
+}
+
 .origo-card-container {
   display: flex;
   flex-direction: column;
   width: 100%;
-  border-radius: var(--origo-radius-sm, 4px);
-  border: 1px solid var(--origo-color-border-default, #ccc);
-  background-color: var(--origo-color-surface-background, #fff);
+  border-radius: var(--origo-radius-sm);
+  border: 1px solid var(--origo-color-border-default);
+  background-color: var(--origo-color-surface-background);
   overflow: hidden;
 }
 
@@ -27,21 +44,21 @@
 .origo-card-content {
   display: flex;
   flex-direction: column;
-  padding-inline-start: var(--origo-spacing-container-padding, 16px);
-  padding-inline-end: var(--origo-spacing-container-padding, 16px);
-  padding-block: var(--origo-spacing-container-padding, 16px);
-  gap: var(--origo-spacing-element-gap, 8px);
+  padding-inline-start: var(--origo-spacing-container-padding);
+  padding-inline-end: var(--origo-spacing-container-padding);
+  padding-block: var(--origo-spacing-container-padding);
+  gap: var(--origo-spacing-element-gap);
   text-align: start;
-  color: var(--origo-color-text-primary, #333);
+  color: var(--origo-color-text-primary);
   font-family: var(--origo-typography-input-font-family, inherit);
 }
 
 .origo-card-title {
-  font-size: calc(var(--origo-typography-input-font-size, 14px) * 1.25);
+  font-size: calc(var(--origo-typography-input-font-size) * 1.25);
   font-weight: 600;
 }
 
 .origo-card-subtitle {
-  font-size: var(--origo-typography-input-font-size, 14px);
+  font-size: var(--origo-typography-input-font-size);
   opacity: 0.8;
 }
diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.spec.ts b/packages/angular-renderer/src/components/primitives/card/card.component.spec.ts
index 9955aa4..f3c1188 100644
--- a/packages/angular-renderer/src/components/primitives/card/card.component.spec.ts
+++ b/packages/angular-renderer/src/components/primitives/card/card.component.spec.ts
@@ -86,4 +86,40 @@ describe('CardComponent', () => {
       expect(element.style.marginRight).toBeFalsy();
     }
   });
+
+  it('should provide viewContainerRef as vc', () => {
+    fixture.componentRef.setInput('contract', { id: 'test', type: 'Card', props: {} });
+    fixture.detectChanges();
+    expect(component.vc()).toBeDefined();
+  });
+
+  it('should apply elevation classes', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test',
+      type: 'Card',
+      props: { elevation: 'md' },
+    });
+    fixture.detectChanges();
+    expect(fixture.nativeElement.classList.contains('origo-card--elevation-md')).toBe(true);
+  });
+
+  it('should emit click on Enter when clickable', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test',
+      type: 'Card',
+      props: { clickable: true },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.getAttribute('tabindex')).toBe('0');
+    expect(fixture.nativeElement.getAttribute('role')).toBe('article');
+
+    let clicked = false;
+    fixture.nativeElement.addEventListener('click', () => (clicked = true));
+
+    const event = new KeyboardEvent('keydown', { key: 'Enter' });
+    fixture.nativeElement.dispatchEvent(event);
+
+    expect(clicked).toBe(true);
+  });
 });
diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.ts b/packages/angular-renderer/src/components/primitives/card/card.component.ts
index d2185a7..9c3b5c2 100644
--- a/packages/angular-renderer/src/components/primitives/card/card.component.ts
+++ b/packages/angular-renderer/src/components/primitives/card/card.component.ts
@@ -6,10 +6,12 @@ import {
   ViewEncapsulation,
   inject,
   SecurityContext,
+  viewChild,
+  ViewContainerRef,
 } from '@angular/core';
 import { DomSanitizer } from '@angular/platform-browser';
 import { InteractionContract } from '@origostudio/core';
-import { OrigoAdapter } from '../../../adapters/web/adapter';
+import { OrigoAdapter, ContainerComponent } from '../../../adapters/web/adapter';
 
 export interface CardProps {
   permissions?: Record<string, string>;
@@ -21,6 +23,10 @@ export interface CardProps {
   imageAlt?: string;
   'aria-label'?: string;
   'aria-describedby'?: string;
+  elevation?: 'none' | 'sm' | 'md' | 'lg';
+  variant?: string;
+  clickable?: boolean;
+  hoverable?: boolean;
 }
 
 @Component({
@@ -35,9 +41,19 @@ export interface CardProps {
     '[attr.data-testid]': 'contract().id',
     '[attr.aria-label]': 'computedAriaLabel()',
     '[attr.aria-describedby]': 'computedAriaDescribedBy()',
+    '[attr.tabindex]': 'isClickable() ? "0" : null',
+    '[attr.role]': '"article"',
+    '(keydown.enter)': 'onKeydown($event)',
+    '(keydown.space)': 'onKeydown($event)',
+    '[class.origo-card--elevation-none]': 'computedElevation() === "none"',
+    '[class.origo-card--elevation-sm]': 'computedElevation() === "sm"',
+    '[class.origo-card--elevation-md]': 'computedElevation() === "md"',
+    '[class.origo-card--elevation-lg]': 'computedElevation() === "lg"',
+    '[class.origo-card--hoverable]': 'isHoverable()',
+    '[class.origo-card--clickable]': 'isClickable()',
   },
 })
-export class CardComponent implements OrigoAdapter<CardProps> {
+export class CardComponent implements OrigoAdapter<CardProps>, ContainerComponent {
   static readonly contractSchema = {
     permissions: 'object',
     rules: 'object',
@@ -46,10 +62,15 @@ export class CardComponent implements OrigoAdapter<CardProps> {
     subtitle: 'string',
     imageUrl: 'string',
     imageAlt: 'string',
+    elevation: 'string',
+    variant: 'string',
+    clickable: 'boolean',
+    hoverable: 'boolean',
   };
   static readonly strictContract = false;
 
   contract = input.required<InteractionContract<CardProps>>();
+  vc = viewChild.required('vc', { read: ViewContainerRef });
 
   private sanitizer = inject(DomSanitizer);
 
@@ -86,4 +107,23 @@ export class CardComponent implements OrigoAdapter<CardProps> {
     const desc = this.contract().props?.['aria-describedby'];
     return desc !== undefined && desc !== null ? String(desc) : undefined;
   });
+
+  computedElevation = computed(() => this.contract().props?.elevation || 'none');
+
+  isClickable = computed(() => {
+    const c = this.contract().props?.clickable;
+    return c === true || String(c) === 'true';
+  });
+
+  isHoverable = computed(() => {
+    const h = this.contract().props?.hoverable;
+    return h === true || String(h) === 'true';
+  });
+
+  onKeydown(event: Event) {
+    if (this.isClickable()) {
+      event.preventDefault();
+      (event.target as HTMLElement).click();
+    }
+  }
 }
diff --git a/packages/angular-renderer/src/components/primitives/container/container.component.html b/packages/angular-renderer/src/components/primitives/container/container.component.html
new file mode 100644
index 0000000..659174d
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/container/container.component.html
@@ -0,0 +1,11 @@
+<div
+  class="origo-container"
+  [class.origo-container--fluid]="props().fluid"
+  [style.max-width]="props().maxWidth || null"
+  [style.padding]="paddingValue || null"
+  [attr.aria-label]="props()['aria-label'] || null"
+  [attr.aria-describedby]="props()['aria-describedby'] || null"
+>
+  <ng-container #vc></ng-container>
+  <ng-content></ng-content>
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/container/container.component.scss b/packages/angular-renderer/src/components/primitives/container/container.component.scss
new file mode 100644
index 0000000..b9f1e42
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/container/container.component.scss
@@ -0,0 +1,9 @@
+.origo-container {
+  box-sizing: border-box;
+  width: 100%;
+  margin-inline: auto; // Centers horizontally if max-width is applied
+}
+
+.origo-container--fluid {
+  max-width: 100% !important;
+}
diff --git a/packages/angular-renderer/src/components/primitives/container/container.component.spec.ts b/packages/angular-renderer/src/components/primitives/container/container.component.spec.ts
new file mode 100644
index 0000000..88799dd
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/container/container.component.spec.ts
@@ -0,0 +1,61 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { ContainerComponent } from './container.component';
+
+describe('ContainerComponent', () => {
+  let component: ContainerComponent;
+  let fixture: ComponentFixture<ContainerComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [ContainerComponent],
+      providers: [provideZonelessChangeDetection()],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(ContainerComponent);
+    component = fixture.componentInstance;
+    fixture.componentRef.setInput('contract', { id: 'test', type: 'Container', props: {} });
+    fixture.detectChanges();
+  });
+
+  it('should create', () => {
+    expect(component).toBeTruthy();
+  });
+
+  it('should provide viewContainerRef as vc', () => {
+    expect(component.vc()).toBeDefined();
+  });
+
+  it('should apply padding and maxWidth from props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test',
+      type: 'Container',
+      props: {
+        padding: '16px',
+        maxWidth: '1200px',
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const containerEl = root.querySelector('.origo-container');
+    expect(containerEl).toBeTruthy();
+    expect(containerEl.style.padding).toBe('16px');
+    expect(containerEl.style.maxWidth).toBe('1200px');
+  });
+
+  it('should apply aria-label if provided', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test',
+      type: 'Container',
+      props: {
+        'aria-label': 'test-label',
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const containerEl = root.querySelector('.origo-container');
+    expect(containerEl.getAttribute('aria-label')).toBe('test-label');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/container/container.component.ts b/packages/angular-renderer/src/components/primitives/container/container.component.ts
new file mode 100644
index 0000000..35817fd
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/container/container.component.ts
@@ -0,0 +1,53 @@
+import { Component, input, viewChild, ViewContainerRef, computed } from '@angular/core';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent as IContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+
+export interface ContainerProps {
+  fluid?: boolean;
+  maxWidth?: string;
+  padding?: string | number;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+const contractSchema: Record<
+  keyof ContainerProps,
+  'string' | 'number' | 'boolean' | 'array' | 'object'
+> = {
+  fluid: 'boolean',
+  maxWidth: 'string',
+  padding: 'string',
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+};
+
+@Component({
+  selector: 'origo-container',
+  standalone: true,
+  templateUrl: './container.component.html',
+  styleUrl: './container.component.scss',
+})
+export class ContainerComponent implements OrigoAdapter<ContainerProps>, IContainerComponent {
+  contract = input.required<InteractionContract<ContainerProps>>();
+  vc = viewChild.required('vc', { read: ViewContainerRef });
+
+  protected props = computed(() =>
+    coerceContractProps<ContainerProps>(this.contract().props, contractSchema)
+  );
+
+  protected get paddingValue(): string {
+    const p = this.props().padding;
+    if (typeof p === 'number') return `${p}px`;
+    return (p as string) || '';
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/divider/divider.component.html b/packages/angular-renderer/src/components/primitives/divider/divider.component.html
new file mode 100644
index 0000000..4c6a42e
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/divider/divider.component.html
@@ -0,0 +1,5 @@
+<div class="origo-divider-inner" [ngStyle]="inlineStyles">
+  @if (props().content) {
+    <span class="origo-divider-content">{{ props().content }}</span>
+  }
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/divider/divider.component.scss b/packages/angular-renderer/src/components/primitives/divider/divider.component.scss
new file mode 100644
index 0000000..1f9ba85
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/divider/divider.component.scss
@@ -0,0 +1,67 @@
+:host {
+  display: block;
+}
+
+:host(.origo-divider--horizontal) {
+  width: 100%;
+  margin-block: var(--origo-space-md, 16px);
+
+  .origo-divider-inner {
+    display: flex;
+    align-items: center;
+    width: 100%;
+
+    &::before,
+    &::after {
+      content: '';
+      flex: 1;
+      border-bottom-width: var(--origo-divider-thickness, 1px);
+      border-bottom-style: var(--origo-divider-variant, solid);
+      border-bottom-color: var(--origo-color-border-default);
+    }
+
+    .origo-divider-content {
+      padding-inline: var(--origo-space-sm, 8px);
+      color: var(--origo-color-text-secondary);
+      font-size: var(--origo-font-size-sm);
+    }
+
+    &:not(:has(.origo-divider-content))::after {
+      display: none;
+    }
+  }
+}
+
+:host(.origo-divider--vertical) {
+  height: 100%;
+  min-height: 1em;
+  margin-inline: var(--origo-space-md, 16px);
+  display: inline-block;
+  vertical-align: middle;
+
+  .origo-divider-inner {
+    display: flex;
+    flex-direction: column;
+    align-items: center;
+    height: 100%;
+
+    &::before,
+    &::after {
+      content: '';
+      flex: 1;
+      border-left-width: var(--origo-divider-thickness, 1px);
+      border-left-style: var(--origo-divider-variant, solid);
+      border-left-color: var(--origo-color-border-default);
+    }
+
+    .origo-divider-content {
+      padding-block: var(--origo-space-sm, 8px);
+      color: var(--origo-color-text-secondary);
+      font-size: var(--origo-font-size-sm);
+    }
+
+    &:not(:has(.origo-divider-content))::after {
+      display: none;
+    }
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/divider/divider.component.spec.ts b/packages/angular-renderer/src/components/primitives/divider/divider.component.spec.ts
new file mode 100644
index 0000000..d95b876
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/divider/divider.component.spec.ts
@@ -0,0 +1,53 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { DividerComponent } from './divider.component';
+
+describe('DividerComponent', () => {
+  let component: DividerComponent;
+  let fixture: ComponentFixture<DividerComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [DividerComponent],
+      providers: [provideZonelessChangeDetection()],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(DividerComponent);
+    component = fixture.componentInstance;
+    fixture.componentRef.setInput('contract', { id: 'test', type: 'Divider', props: {} });
+    fixture.detectChanges();
+  });
+
+  it('should create', () => {
+    expect(component).toBeTruthy();
+  });
+
+  it('should have separator role', () => {
+    expect(fixture.nativeElement.getAttribute('role')).toBe('separator');
+  });
+
+  it('should apply orientation and variant from props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test',
+      type: 'Divider',
+      props: {
+        orientation: 'vertical',
+        variant: 'dashed',
+        thickness: '2px',
+        content: 'OR',
+      },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.getAttribute('aria-orientation')).toBe('vertical');
+    expect(fixture.nativeElement.classList.contains('origo-divider--vertical')).toBe(true);
+
+    const inner = fixture.nativeElement.querySelector('.origo-divider-inner') as HTMLElement;
+    expect(inner.style.getPropertyValue('--origo-divider-variant')).toBe('dashed');
+    expect(inner.style.getPropertyValue('--origo-divider-thickness')).toBe('2px');
+
+    const content = fixture.nativeElement.querySelector('.origo-divider-content');
+    expect(content).toBeTruthy();
+    expect(content.textContent.trim()).toBe('OR');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/divider/divider.component.ts b/packages/angular-renderer/src/components/primitives/divider/divider.component.ts
new file mode 100644
index 0000000..2d376d2
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/divider/divider.component.ts
@@ -0,0 +1,76 @@
+import { Component, input, computed, HostBinding } from '@angular/core';
+import { NgStyle } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+
+export interface DividerProps {
+  orientation?: 'horizontal' | 'vertical';
+  variant?: 'solid' | 'dashed' | 'dotted';
+  thickness?: string | number;
+  content?: string;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+}
+
+const contractSchema: Record<
+  keyof DividerProps,
+  'string' | 'number' | 'boolean' | 'array' | 'object'
+> = {
+  orientation: 'string',
+  variant: 'string',
+  thickness: 'string',
+  content: 'string',
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+};
+
+const finalSchema = { ...contractSchema };
+delete (finalSchema as any).thickness;
+
+@Component({
+  selector: 'origo-divider',
+  standalone: true,
+  imports: [NgStyle],
+  templateUrl: './divider.component.html',
+  styleUrl: './divider.component.scss',
+  host: {
+    role: 'separator',
+    '[attr.aria-orientation]': 'computedOrientation()',
+    '[attr.aria-label]': "props()['aria-label'] || null",
+    '[class.origo-divider--horizontal]': "computedOrientation() === 'horizontal'",
+    '[class.origo-divider--vertical]': "computedOrientation() === 'vertical'",
+  },
+})
+export class DividerComponent implements OrigoAdapter<DividerProps> {
+  contract = input.required<InteractionContract<DividerProps>>();
+
+  protected props = computed(() => {
+    const p = coerceContractProps<DividerProps>(this.contract().props, finalSchema);
+    const original = this.contract().props || {};
+    if ('thickness' in original) p.thickness = original.thickness as any;
+    return p;
+  });
+
+  protected computedOrientation = computed(() => this.props().orientation || 'horizontal');
+
+  protected get thicknessValue(): string {
+    const t = this.props().thickness;
+    if (typeof t === 'number') return `${t}px`;
+    return (t as string) || '';
+  }
+
+  protected get inlineStyles(): Record<string, string> {
+    const p = this.props();
+    const styles: Record<string, string> = {
+      '--origo-divider-variant': p.variant || 'solid',
+    };
+    if (this.thicknessValue) {
+      styles['--origo-divider-thickness'] = this.thicknessValue;
+    }
+    return styles;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/grid/grid.component.html b/packages/angular-renderer/src/components/primitives/grid/grid.component.html
new file mode 100644
index 0000000..f663ecf
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/grid/grid.component.html
@@ -0,0 +1,9 @@
+<div
+  class="origo-grid"
+  [ngStyle]="inlineStyles"
+  [attr.aria-label]="props()['aria-label'] || null"
+  [attr.aria-describedby]="props()['aria-describedby'] || null"
+>
+  <ng-container #vc></ng-container>
+  <ng-content></ng-content>
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/grid/grid.component.scss b/packages/angular-renderer/src/components/primitives/grid/grid.component.scss
new file mode 100644
index 0000000..5de687f
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/grid/grid.component.scss
@@ -0,0 +1,51 @@
+.origo-grid {
+  display: grid;
+  width: 100%;
+  grid-template-columns: var(--origo-grid-columns, repeat(12, minmax(0, 1fr)));
+}
+
+// Map standard origo breakpoints. We should use CSS variables mapping to actual tokens.
+// For responsive grid, if a variable --origo-grid-cols-sm is defined, we use it at the sm breakpoint.
+// We expect global breakpoints --origo-breakpoint-sm etc to exist, but CSS media queries can't use vars directly in standard CSS, they require env() or preprocessor.
+// Using standard SCSS or assuming a token-based approach. Since we can't use var() in @media, we assume standard breakpoints.
+@media (min-width: 640px) {
+  .origo-grid {
+    grid-template-columns: var(
+      --origo-grid-cols-sm,
+      var(--origo-grid-columns, repeat(12, minmax(0, 1fr)))
+    );
+  }
+}
+@media (min-width: 768px) {
+  .origo-grid {
+    grid-template-columns: var(
+      --origo-grid-cols-md,
+      var(--origo-grid-cols-sm, var(--origo-grid-columns, repeat(12, minmax(0, 1fr))))
+    );
+  }
+}
+@media (min-width: 1024px) {
+  .origo-grid {
+    grid-template-columns: var(
+      --origo-grid-cols-lg,
+      var(
+        --origo-grid-cols-md,
+        var(--origo-grid-cols-sm, var(--origo-grid-columns, repeat(12, minmax(0, 1fr))))
+      )
+    );
+  }
+}
+@media (min-width: 1280px) {
+  .origo-grid {
+    grid-template-columns: var(
+      --origo-grid-cols-xl,
+      var(
+        --origo-grid-cols-lg,
+        var(
+          --origo-grid-cols-md,
+          var(--origo-grid-cols-sm, var(--origo-grid-columns, repeat(12, minmax(0, 1fr))))
+        )
+      )
+    );
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/grid/grid.component.spec.ts b/packages/angular-renderer/src/components/primitives/grid/grid.component.spec.ts
new file mode 100644
index 0000000..2ac398b
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/grid/grid.component.spec.ts
@@ -0,0 +1,46 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { GridComponent } from './grid.component';
+
+describe('GridComponent', () => {
+  let component: GridComponent;
+  let fixture: ComponentFixture<GridComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [GridComponent],
+      providers: [provideZonelessChangeDetection()],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(GridComponent);
+    component = fixture.componentInstance;
+    fixture.componentRef.setInput('contract', { id: 'test', type: 'Grid', props: {} });
+    fixture.detectChanges();
+  });
+
+  it('should create', () => {
+    expect(component).toBeTruthy();
+  });
+
+  it('should provide viewContainerRef as vc', () => {
+    expect(component.vc()).toBeDefined();
+  });
+
+  it('should apply columns from props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test',
+      type: 'Grid',
+      props: {
+        columns: 4,
+        gap: '16px',
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const gridEl = root.querySelector('.origo-grid') as HTMLElement;
+    expect(gridEl).toBeTruthy();
+    expect(gridEl.style.gap).toBe('16px');
+    expect(gridEl.style.getPropertyValue('--origo-grid-columns')).toBe('repeat(4, minmax(0, 1fr))');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/grid/grid.component.ts b/packages/angular-renderer/src/components/primitives/grid/grid.component.ts
new file mode 100644
index 0000000..4580f38
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/grid/grid.component.ts
@@ -0,0 +1,99 @@
+import { Component, input, viewChild, ViewContainerRef, computed } from '@angular/core';
+import { NgStyle } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent as IContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+
+export interface GridProps {
+  columns?: number | string | Record<string, number>;
+  gap?: number | string;
+  align?: string;
+  justify?: string;
+  responsive?: Record<string, number>;
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+const contractSchema: Record<
+  keyof GridProps,
+  'string' | 'number' | 'boolean' | 'array' | 'object'
+> = {
+  columns: 'object', // coerce to object if responsive, or string if literal. We'll type this broadly. Wait, coerceContractProps doesn't handle union coercions well natively. Let's use 'string' for string, or 'number', but wait, the schema doesn't support complex unions. We'll map to object for responsive and parse in computed. We can omit it from schema to avoid strict coercion dropping it, or handle it manually.
+  gap: 'string', // wait, gap can be string or number. Let's omit from strict schema coercion to keep it intact.
+  align: 'string',
+  justify: 'string',
+  responsive: 'object',
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+};
+// We will modify the schema slightly to avoid dropping columns/gap
+const finalSchema = { ...contractSchema };
+delete (finalSchema as any).columns;
+delete (finalSchema as any).gap;
+
+@Component({
+  selector: 'origo-grid',
+  standalone: true,
+  imports: [NgStyle],
+  templateUrl: './grid.component.html',
+  styleUrl: './grid.component.scss',
+})
+export class GridComponent implements OrigoAdapter<GridProps>, IContainerComponent {
+  contract = input.required<InteractionContract<GridProps>>();
+  vc = viewChild.required('vc', { read: ViewContainerRef });
+
+  protected props = computed(() => {
+    const p = coerceContractProps<GridProps>(this.contract().props, finalSchema);
+    const original = this.contract().props || {};
+    if ('columns' in original) p.columns = original.columns as any;
+    if ('gap' in original) p.gap = original.gap as any;
+    return p;
+  });
+
+  protected get gridTemplateColumns(): string {
+    const cols = this.props().columns;
+    if (typeof cols === 'number') return `repeat(${cols}, minmax(0, 1fr))`;
+    if (typeof cols === 'string') return cols;
+    // Responsive records are harder to do inline. We'll use CSS custom properties via style bindings.
+    // For now, default to 1 or 12.
+    return 'repeat(12, minmax(0, 1fr))';
+  }
+
+  protected get gapValue(): string {
+    const g = this.props().gap;
+    if (typeof g === 'number') return `${g}px`;
+    return (g as string) || '';
+  }
+
+  protected get inlineStyles(): Record<string, string> {
+    const p = this.props();
+    const styles: Record<string, string> = {
+      '--origo-grid-columns': this.gridTemplateColumns,
+    };
+    if (this.gapValue) styles['gap'] = this.gapValue;
+    if (p.align) styles['align-items'] = p.align;
+    if (p.justify) styles['justify-content'] = p.justify;
+
+    // Apply responsive columns via inline css variables if provided (e.g. { sm: 1, md: 2, lg: 4 })
+    // The CSS would use these variables via media queries.
+    if (p.responsive) {
+      for (const [key, val] of Object.entries(p.responsive)) {
+        styles[`--origo-grid-cols-${key}`] = `repeat(${val}, minmax(0, 1fr))`;
+      }
+    } else if (typeof p.columns === 'object' && p.columns !== null) {
+      for (const [key, val] of Object.entries(p.columns)) {
+        styles[`--origo-grid-cols-${key}`] = `repeat(${val}, minmax(0, 1fr))`;
+      }
+    }
+    return styles;
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/stack/stack.component.html b/packages/angular-renderer/src/components/primitives/stack/stack.component.html
new file mode 100644
index 0000000..4d529c4
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/stack/stack.component.html
@@ -0,0 +1,9 @@
+<div
+  class="origo-stack"
+  [ngStyle]="inlineStyles"
+  [attr.aria-label]="props()['aria-label'] || null"
+  [attr.aria-describedby]="props()['aria-describedby'] || null"
+>
+  <ng-container #vc></ng-container>
+  <ng-content></ng-content>
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/stack/stack.component.scss b/packages/angular-renderer/src/components/primitives/stack/stack.component.scss
new file mode 100644
index 0000000..d44b748
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/stack/stack.component.scss
@@ -0,0 +1,6 @@
+.origo-stack {
+  display: flex;
+  flex-direction: var(--origo-stack-direction, column);
+  flex-wrap: var(--origo-stack-wrap, nowrap);
+  width: 100%;
+}
diff --git a/packages/angular-renderer/src/components/primitives/stack/stack.component.spec.ts b/packages/angular-renderer/src/components/primitives/stack/stack.component.spec.ts
new file mode 100644
index 0000000..e43d543
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/stack/stack.component.spec.ts
@@ -0,0 +1,52 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { provideZonelessChangeDetection } from '@angular/core';
+import { StackComponent } from './stack.component';
+
+describe('StackComponent', () => {
+  let component: StackComponent;
+  let fixture: ComponentFixture<StackComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [StackComponent],
+      providers: [provideZonelessChangeDetection()],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(StackComponent);
+    component = fixture.componentInstance;
+    fixture.componentRef.setInput('contract', { id: 'test', type: 'Stack', props: {} });
+    fixture.detectChanges();
+  });
+
+  it('should create', () => {
+    expect(component).toBeTruthy();
+  });
+
+  it('should provide viewContainerRef as vc', () => {
+    expect(component.vc()).toBeDefined();
+  });
+
+  it('should apply flex properties from props', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'test',
+      type: 'Stack',
+      props: {
+        direction: 'row',
+        gap: '16px',
+        align: 'center',
+        justify: 'space-between',
+        wrap: true,
+      },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const stackEl = root.querySelector('.origo-stack') as HTMLElement;
+    expect(stackEl).toBeTruthy();
+    expect(stackEl.style.gap).toBe('16px');
+    expect(stackEl.style.alignItems).toBe('center');
+    expect(stackEl.style.justifyContent).toBe('space-between');
+    expect(stackEl.style.getPropertyValue('--origo-stack-direction')).toBe('row');
+    expect(stackEl.style.getPropertyValue('--origo-stack-wrap')).toBe('wrap');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/stack/stack.component.ts b/packages/angular-renderer/src/components/primitives/stack/stack.component.ts
new file mode 100644
index 0000000..8072783
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/stack/stack.component.ts
@@ -0,0 +1,85 @@
+import { Component, input, viewChild, ViewContainerRef, computed } from '@angular/core';
+import { NgStyle } from '@angular/common';
+import { InteractionContract } from '@origostudio/core';
+import {
+  OrigoAdapter,
+  ContainerComponent as IContainerComponent,
+  coerceContractProps,
+} from '../../../adapters/web/adapter';
+
+export interface StackProps {
+  direction?: 'row' | 'column';
+  gap?: number | string;
+  align?: 'start' | 'center' | 'end' | 'stretch';
+  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
+  wrap?: boolean | 'wrap' | 'nowrap';
+  permissions?: Record<string, string>;
+  rules?: Record<string, unknown>;
+  metadata?: Record<string, unknown>;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+const contractSchema: Record<
+  keyof StackProps,
+  'string' | 'number' | 'boolean' | 'array' | 'object'
+> = {
+  direction: 'string',
+  gap: 'string', // wait, gap can be string or number. Let's omit gap.
+  align: 'string',
+  justify: 'string',
+  wrap: 'string', // boolean | string
+  permissions: 'object',
+  rules: 'object',
+  metadata: 'object',
+  'aria-label': 'string',
+  'aria-describedby': 'string',
+};
+
+const finalSchema = { ...contractSchema };
+delete (finalSchema as any).gap;
+delete (finalSchema as any).wrap;
+
+@Component({
+  selector: 'origo-stack',
+  standalone: true,
+  imports: [NgStyle],
+  templateUrl: './stack.component.html',
+  styleUrl: './stack.component.scss',
+})
+export class StackComponent implements OrigoAdapter<StackProps>, IContainerComponent {
+  contract = input.required<InteractionContract<StackProps>>();
+  vc = viewChild.required('vc', { read: ViewContainerRef });
+
+  protected props = computed(() => {
+    const p = coerceContractProps<StackProps>(this.contract().props, finalSchema);
+    const original = this.contract().props || {};
+    if ('gap' in original) p.gap = original.gap as any;
+    if ('wrap' in original) p.wrap = original.wrap as any;
+    return p;
+  });
+
+  protected get gapValue(): string {
+    const g = this.props().gap;
+    if (typeof g === 'number') return `${g}px`;
+    return (g as string) || '';
+  }
+
+  protected get wrapValue(): string {
+    const w = this.props().wrap;
+    if (typeof w === 'boolean') return w ? 'wrap' : 'nowrap';
+    return (w as string) || 'nowrap';
+  }
+
+  protected get inlineStyles(): Record<string, string> {
+    const p = this.props();
+    const styles: Record<string, string> = {
+      '--origo-stack-direction': p.direction || 'column',
+      '--origo-stack-wrap': this.wrapValue,
+    };
+    if (this.gapValue) styles['gap'] = this.gapValue;
+    if (p.align) styles['align-items'] = p.align;
+    if (p.justify) styles['justify-content'] = p.justify;
+    return styles;
+  }
+}
diff --git a/packages/angular-renderer/src/index.ts b/packages/angular-renderer/src/index.ts
index 4295fc0..f7365ff 100644
--- a/packages/angular-renderer/src/index.ts
+++ b/packages/angular-renderer/src/index.ts
@@ -1,7 +1,11 @@
 export * from './lib/theme.provider';
 export * from './lib/renderer.component';
 export * from './lib/renderer.tokens';
-export * from './adapters/web/adapter';
+export { coerceContractProps, AdapterPipelineService } from './adapters/web/adapter';
+export type {
+  OrigoAdapter,
+  ContainerComponent as AdapterContainerComponent,
+} from './adapters/web/adapter';
 export * from './components/primitives/vbox/vbox.component';
 export * from './components/primitives/text-input/text-input.component';
 export * from './components/primitives/button/button.component';
@@ -31,3 +35,7 @@ export * from './components/primitives/input-number/input-number.component';
 export * from './components/primitives/date-picker/date-picker.component';
 export * from './components/primitives/time-picker/time-picker.component';
 export * from './components/primitives/date-range-picker/date-range-picker.component';
+export * from './components/primitives/container/container.component';
+export * from './components/primitives/grid/grid.component';
+export * from './components/primitives/stack/stack.component';
+export * from './components/primitives/divider/divider.component';
diff --git a/packages/angular-renderer/src/lib/primitives.provider.ts b/packages/angular-renderer/src/lib/primitives.provider.ts
index 8e429b0..19051bf 100644
--- a/packages/angular-renderer/src/lib/primitives.provider.ts
+++ b/packages/angular-renderer/src/lib/primitives.provider.ts
@@ -28,6 +28,10 @@ import { InputNumberComponent } from '../components/primitives/input-number/inpu
 import { DatePickerComponent } from '../components/primitives/date-picker/date-picker.component';
 import { TimePickerComponent } from '../components/primitives/time-picker/time-picker.component';
 import { DateRangePickerComponent } from '../components/primitives/date-range-picker/date-range-picker.component';
+import { ContainerComponent } from '../components/primitives/container/container.component';
+import { GridComponent } from '../components/primitives/grid/grid.component';
+import { StackComponent } from '../components/primitives/stack/stack.component';
+import { DividerComponent } from '../components/primitives/divider/divider.component';
 
 export function provideOrigo9Primitives(): EnvironmentProviders {
   const registryMap = new Map<string, unknown>([
@@ -60,6 +64,10 @@ export function provideOrigo9Primitives(): EnvironmentProviders {
     ['DatePicker', DatePickerComponent],
     ['TimePicker', TimePickerComponent],
     ['DateRangePicker', DateRangePickerComponent],
+    ['Container', ContainerComponent],
+    ['Grid', GridComponent],
+    ['Stack', StackComponent],
+    ['Divider', DividerComponent],
     ['vbox', VBoxComponent], // For backward compatibility with 'vbox' in preview-root
   ]);
 
diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
index 54af47c..c3a343b 100644
--- a/tools/test-registry/test-registry.yaml
+++ b/tools/test-registry/test-registry.yaml
@@ -508,6 +508,7 @@ test_cases:
     affected_stories:
       - 9-4-accessibility-localization-enforcement
       - 9-2-data-presentation-primitives-batch-2
+      - 1-5-application-layout-primitives
     last_result: unknown
     results: {}
   - id: renderer-primitive-sidebar
@@ -937,3 +938,39 @@ test_cases:
       - 1-4-date-and-time-controls
     last_result: unknown
     results: {}
+  - id: renderer-primitive-container
+    description: 'Verifies Container layout primitive rendering and logic'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/container/container.component.spec.ts
+    type: unit
+    affected_stories:
+      - 1-5-application-layout-primitives
+    last_result: unknown
+    results: {}
+  - id: renderer-primitive-grid
+    description: 'Verifies Grid layout primitive rendering and logic'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/grid/grid.component.spec.ts
+    type: unit
+    affected_stories:
+      - 1-5-application-layout-primitives
+    last_result: unknown
+    results: {}
+  - id: renderer-primitive-stack
+    description: 'Verifies Stack layout primitive rendering and logic'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/stack/stack.component.spec.ts
+    type: unit
+    affected_stories:
+      - 1-5-application-layout-primitives
+    last_result: unknown
+    results: {}
+  - id: renderer-primitive-divider
+    description: 'Verifies Divider layout primitive rendering and logic'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/divider/divider.component.spec.ts
+    type: unit
+    affected_stories:
+      - 1-5-application-layout-primitives
+    last_result: unknown
+    results: {}

