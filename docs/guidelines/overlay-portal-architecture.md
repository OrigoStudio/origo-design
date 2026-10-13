# Angular Overlay & Portal Architecture for Shadow DOM

**Owner:** Charlie (Senior Developer / Platform Architect)  
**Status:** Active Canonical Architecture Guide  
**Applies To:** `@origo/angular-renderer`, all Epic 1 dropdown primitives, all Epic 2 interaction components  
**Related Architecture Decisions:** `AD-4` (Shadow DOM Invariants), `AD-6` (Design Tokens Single Source of Truth), `P1-AD-1` (Angular Standalone & Zoneless), `P1-AD-5` (Composition over Inheritance), `P1-AD-6` (WCAG 2.1 AA A11y), `NFR-I18N-001` (RTL via CSS Logical Properties)

---

## 1. Executive Overview & Core Problem Statement

During Epic 1 implementation, components such as `SelectComponent`, `DatePickerComponent`, and `AutocompleteComponent` rendered dropdown panels directly within their local component templates. Because all Origo UI primitives enforce strict encapsulation via `ViewEncapsulation.ShadowDom`, this pattern resulted in severe production-blocking UI defects:

1. **Overflow Clipping Defect:** When a component is hosted within layout primitives (`origo-card`, `origo-grid`, `origo-container`, tables) featuring `overflow: hidden` or `overflow: auto`, dropdowns are clipped by the boundary of the parent container.
2. **CSS Stacking Context Trapping:** Local elements cannot escape stacking contexts formed by ancestor CSS properties (`transform`, `contain`, `filter`, `perspective`). Modals and dropdowns end up submerged beneath sibling layers regardless of inner `z-index` values.
3. **The Shadow DOM Portal Paradox:** Moving floating panels outside the host ShadowRoot into `document.body` (via Angular CDK Overlay) solves clipping and stacking, but introduces new boundary challenges:
   - Scoped component styles and `:host` token definitions are lost.
   - `event.target` retargets to the host element, breaking naive outside-click dismissal.
   - `document.activeElement` stops at the shadow host, breaking standard focus trapping and return-of-focus logic.
   - Server-Side Rendering (SSR) crashes if DOM or `document.body` is accessed without hydration guards.

This canonical guide establishes the standardized architecture, services, styles, and golden implementation patterns to resolve these challenges across the Origo Design System.

---

## 2. Architectural Bindings & Non-Negotiable Invariants

| Invariant / Decision                 | Architectural Rule                                                                                                                                                                                                                   | Enforcement Mechanism         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| **Epics.md System Constraint 4**     | All floating UI (dropdowns, popovers, tooltips, modals, dialogs) MUST project to `document.body` via Angular CDK Overlay. Direct template embedding is prohibited.                                                                   | CI Linting & Code Review      |
| **P1-AD-1 (Zoneless + Standalone)**  | Standalone-first services using Angular Signals (`signal()`, `computed()`) for state. No reliance on Zone.js or unmanaged RxJS subscriptions.                                                                                        | Unit test suite               |
| **AD-6 & CSP Compliance**            | Zero inline `style="..."` attributes on dynamically injected body nodes. Overlays must consume design tokens exclusively through predefined BEM classes (`.origo-overlay-pane`, `.theme-*`) and CSS custom properties (`--origo-*`). | ESLint / CSP audit            |
| **AD-4 (Shadow DOM Event Piercing)** | Outside-click detection MUST inspect `event.composedPath()`. Reliance on `event.target` alone is strictly prohibited due to Shadow DOM retargeting.                                                                                  | Automated Spike & Unit tests  |
| **P1-AD-6 & WCAG 2.1 AA**            | Modals and dropdowns must trap focus, pierce `shadowRoot.activeElement`, close on `Escape`, and return focus to the originating trigger inside Shadow DOM.                                                                           | Automated Accessibility Tests |
| **System Constraint 2 (SSR)**        | Direct access to DOM globals (`window`, `document`) must be guarded with `isPlatformBrowser(this.platformId)`. Non-browser environments must safely no-op.                                                                           | SSR Test Matrix               |
| **DestroyRef Lifecycle**             | Every overlay instance must bind to the caller's `DestroyRef`. Destroying the host component must automatically detach overlays and unbind all document listeners.                                                                   | Memory leak tests             |

---

## 3. Shadow DOM vs. Overlay Challenges & Proven Solutions

### 3.1 Container Clipping & Portal Projection

- **Challenge:** Placing `.origo-select__dropdown` inside a component template causes parent elements with `overflow: hidden` to clip the dropdown box.
- **Solution:** Inject `OrigoOverlayService` (wrapping Angular CDK Overlay). The CDK attaches a single `<div class="cdk-overlay-container">` directly to `document.body`. Floating panels render inside this container, completely bypassing all ancestor CSS stacking and clipping boundaries.

### 3.2 Token & Theme Inheritance Across Boundaries

- **Challenge:** When content is projected outside the ShadowRoot into `document.body`, styles defined within `:host` or component-scoped SCSS do not apply. Additionally, CSS variables overridden locally on container subtrees are inaccessible at the root.
- **Solution:**
  1. Global styles defined in `@origo/angular-renderer/src/styles/overlay.scss` define base surface tokens:
     ```scss
     .origo-overlay-pane {
       background-color: var(
         --origo-color-surface-overlay,
         var(--origo-color-surface-primary, #ffffff)
       );
       color: var(--origo-color-text-primary, #111827);
       border-radius: var(--origo-radius-md, 8px);
       box-shadow: var(--origo-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
       padding-inline: var(--origo-space-md, 16px);
       padding-block: var(--origo-space-md, 16px);
     }
     ```
  2. `OrigoOverlayService` automatically inspects the originating host's theme context and appends active theme classes (`.theme-light`, `.theme-dark`, `.high-contrast`) directly to `.origo-overlay-pane`.
  3. No inline `element.style` injection is ever used, ensuring strict Content Security Policy (CSP) compliance.

### 3.3 RTL Internationalization Propagation

- **Challenge:** Elements projected to `document.body` detach from ancestor `dir="rtl"` attributes.
- **Solution:** `OrigoOverlayService` inspects the trigger element's hierarchy via `target.closest('[dir]')` or `document.documentElement.getAttribute('dir')`. If RTL is detected, `direction: 'rtl'` is passed to the CDK Overlay configuration and `.origo-overlay-pane[dir='rtl']` styles mirror layouts automatically using CSS Logical Properties (`padding-inline`, `inset-inline-start`).

### 3.4 Shadow DOM Event Piercing & Outside-Click Dismissal

- **Challenge:** In Shadow DOM, when a user clicks a button inside the component, standard document-level event listeners receive `event.target` retargeted to the host element (`<origo-select>`). If an outside-click handler checks `triggerEl.contains(event.target)` or `event.target !== triggerEl`, it causes false-positive dismissals.
- **Solution:** Inspect `event.composedPath()`:

  ```typescript
  const path = event.composedPath ? event.composedPath() : [];
  const isInsideOverlay =
    overlayPane && (path.includes(overlayPane) || overlayPane.contains(event.target as Node));
  const isInsideTrigger =
    triggerEl && (path.includes(triggerEl) || triggerEl.contains(event.target as Node));

  if (!isInsideOverlay && !isInsideTrigger) {
    this.close();
  }
  ```

  `event.composedPath()` returns an array containing the exact internal nodes clicked across all Shadow DOM boundaries.

### 3.5 Shadow-DOM-Aware Focus Trapping & ActiveElement Restoration

- **Challenge:** `document.activeElement` stops at the shadow host. It does not reveal which element inside the component's ShadowRoot held focus before the overlay opened.
- **Solution:** Pierce `shadowRoot.activeElement` recursively:
  ```typescript
  export function getDeepActiveElement(doc: Document | null): Element | null {
    if (!doc) return null;
    let active = doc.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }
  ```
  When the overlay opens, `previousFocusedElement = getDeepActiveElement(document)` captures the true focused internal element. When the overlay closes via `close()` or `Escape`, focus is restored directly to `previousFocusedElement.focus()`.

### 3.6 Angular SSR Safety & Hydration Guards

- **Challenge:** CDK Overlay attempts to read `window` and `document.body`. Running overlay code on the server during SSR crashes the Node runtime.
- **Solution:** `OrigoOverlayService` injects `PLATFORM_ID` and checks `isPlatformBrowser(this.platformId)`. In non-browser server contexts, `create()` immediately returns a safe `OrigoNoopOverlayRef` that performs no-op operations without touching globals.

---

## 4. Golden Implementation Patterns

### Pattern A: Connected Overlay (Dropdown / Select / Autocomplete / DatePicker)

```typescript
import {
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  signal,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrigoOverlayService, OrigoOverlayRef } from '@origostudio/angular-renderer';

@Component({
  selector: 'origo-select-example',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <button
      #triggerBtn
      type="button"
      class="origo-select__trigger"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-haspopup]="'listbox'"
      (click)="toggleDropdown()"
    >
      <span>Select Option</span>
    </button>

    <ng-template #dropdownTemplate>
      <ul class="origo-select__dropdown" role="listbox">
        <li role="option" tabindex="0" (click)="selectOption('Opt 1')">Option 1</li>
        <li role="option" tabindex="0" (click)="selectOption('Opt 2')">Option 2</li>
      </ul>
    </ng-template>
  `,
  styleUrls: ['./select.component.scss'],
})
export class SelectExampleComponent implements OnInit {
  private readonly overlayService = inject(OrigoOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('triggerBtn', { static: true })
  triggerBtnRef!: ElementRef<HTMLButtonElement>;

  @ViewChild('dropdownTemplate', { static: true })
  dropdownTemplate!: TemplateRef<unknown>;

  readonly isOpen = signal(false);
  private overlayRef: OrigoOverlayRef | null = null;

  ngOnInit(): void {
    this.overlayRef = this.overlayService.create(
      {
        position: {
          type: 'connected',
          target: this.triggerBtnRef,
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offset: [0, 4],
          autoRepositionOnResize: true,
        },
        hasBackdrop: false,
        closeOnOutsideClick: true,
        closeOnEscape: true,
        trapFocus: false,
        viewContainerRef: this.vcr,
      },
      this.destroyRef
    );
  }

  toggleDropdown(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.overlayRef?.open(this.dropdownTemplate);
    this.isOpen.set(true);
  }

  close(): void {
    this.overlayRef?.close();
    this.isOpen.set(false);
  }

  selectOption(val: string): void {
    this.close();
  }
}
```

### Pattern B: Global Overlay (Modal Dialog / Drawer)

```typescript
import {
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrigoOverlayService, OrigoOverlayRef } from '@origostudio/angular-renderer';

@Component({
  selector: 'origo-modal-example',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <button type="button" (click)="openModal()">Open Confirm Modal</button>

    <ng-template #modalTemplate>
      <div role="dialog" aria-modal="true" class="origo-modal-pane">
        <h2>Confirm Transaction</h2>
        <p>Are you sure you want to proceed?</p>
        <button type="button" (click)="confirm(true)">Confirm</button>
        <button type="button" (click)="confirm(false)">Cancel</button>
      </div>
    </ng-template>
  `,
})
export class ModalExampleComponent {
  private readonly overlayService = inject(OrigoOverlayService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly vcr = inject(ViewContainerRef);

  @ViewChild('modalTemplate', { static: true })
  modalTemplate!: TemplateRef<unknown>;

  private overlayRef: OrigoOverlayRef<boolean> | null = null;

  async openModal(): Promise<boolean> {
    this.overlayRef = this.overlayService.create<boolean>(
      {
        position: {
          type: 'global',
          position: 'center',
          maxWidth: '560px',
        },
        hasBackdrop: true,
        closeOnBackdropClick: true,
        closeOnEscape: true,
        trapFocus: true,
        viewContainerRef: this.vcr,
      },
      this.destroyRef
    );

    this.overlayRef.open(this.modalTemplate);
    const result = await this.overlayRef.afterClosed();
    return result ?? false;
  }

  confirm(decision: boolean): void {
    this.overlayRef?.close(decision);
  }
}
```

---

## 5. Migration Roadmap for Epic 1 Primitives

Existing Epic 1 floating dropdowns must be migrated to `OrigoOverlayService`:

| Component               | Current State                                      | Migration Plan                                                                                   | Target Milestone |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| `SelectComponent`       | Template inline `.origo-select__dropdown`          | Wrap dropdown in `<ng-template>` and attach via `OrigoOverlayService` with `connected` position. | Epic 2 Sprint 1  |
| `DatePickerComponent`   | Template inline `.origo-date-picker__dropdown`     | Project calendar popup via `OrigoOverlayService`, removing local `overflow` clipping risks.      | Epic 2 Sprint 1  |
| `AutocompleteComponent` | Template inline `.origo-autocomplete__suggestions` | Migrate suggestion list to `OrigoOverlayService` with `autoRepositionOnResize: true`.            | Epic 2 Sprint 1  |
| `MultiSelectComponent`  | Template inline dropdown                           | Project checkbox menu via `OrigoOverlayService`.                                                 | Epic 2 Sprint 1  |
| `ComboboxComponent`     | Template inline dropdown                           | Project filtered options via `OrigoOverlayService`.                                              | Epic 2 Sprint 1  |

---

## 6. Prerequisite Contract & PR Pre-Flight Checklist for Epic 2 Story 2.2

Before submitting any Pull Request implementing Story 2.2 (`2-2-modal-and-overlay-components`), authors must verify every item on this checklist:

- [ ] **Portal Root Projection:** The component injects `OrigoOverlayService` and renders panels outside its ShadowRoot via CDK Overlay.
- [ ] **Zero Inline Styles (CSP):** No dynamic inline `style="..."` attributes are injected onto body nodes. Styling is governed by `.origo-overlay-pane` and CSS custom properties.
- [ ] **Composed Path Outside Clicks:** Outside-click handlers evaluate `event.composedPath()` across Shadow DOM boundaries.
- [ ] **Shadow-DOM Focus Trap:** Focus moves inside the panel upon opening; `Tab` / `Shift+Tab` cycles exclusively within the panel; pressing `Escape` closes the overlay and restores focus to `previousFocusedElement` inside the ShadowRoot.
- [ ] **ARIA Sync:** Trigger element binds `aria-expanded`, `aria-haspopup`, and `aria-controls`.
- [ ] **SSR Guard:** All DOM/body manipulation is guarded by `isPlatformBrowser` or abstracted through `OrigoOverlayService`.
- [ ] **Lifecycle Teardown:** `DestroyRef` is linked to auto-dispose the overlay on component teardown.
- [ ] **Motion & Accessibility:** Animations respect `--origo-motion-duration-*` and `@media (prefers-reduced-motion: reduce)`.
- [ ] **Test Registry Entry:** The component's test cases are cataloged in `tools/test-registry/test-registry.yaml`.
