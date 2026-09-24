Invoke the bmad-review-edge-case-hunter skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/9-5-advanced-form-primitives-batch-4.md b/_bmad-output/implementation-artifacts/9-5-advanced-form-primitives-batch-4.md
new file mode 100644
index 0000000..00492b0
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/9-5-advanced-form-primitives-batch-4.md
@@ -0,0 +1,844 @@
+---
+story_id: "9.5"
+story_key: "9-5-advanced-form-primitives-batch-4"
+status: "ready-for-dev"
+baseline_commit: "1d2621fe99c63c3cddabb7a0fc0d44bda43fe4a6"
+epic_source_note: "Story 9.5 is an approved sprint extension beyond the epics.md scope (Epic 9 originally ended at 9.4). Authorized to complete the 25-component primitive target defined in the Phase 1 Architecture Spine (primitives list: button, input, select, checkbox, radio, switch, chip, avatar, badge, icon, tooltip, progress, skeleton, divider, accordion, tabs, card, alert, toast, dialog, drawer, menu, pagination, spinner, breadcrumb). Switch and Chip are the two remaining unimplemented primitives."
+---
+
+# Story 9.5: Advanced Form Primitives (Batch 4)
+
+status: "review"
+
+## Story
+
+As a UI Developer,
+I want a set of advanced form primitives (Switch and Chip),
+So that I can build rich data entry screens with boolean toggles and multi-select token inputs driven by BADL.
+
+## Acceptance Criteria
+
+1. **Given** the Origo Angular renderer,
+   **When** the AST contains a `Switch` node,
+   **Then** it maps to `SwitchComponent` via the Component Registry pattern (`RENDERER_REGISTRY`), renders an `<origo-switch>` host with an inner `<label>` wrapping `<input type="checkbox" role="switch">`, and dispatches `updateState(id, 'checked', boolean)` on toggle.
+
+2. **Given** the Origo Angular renderer,
+   **When** the AST contains a `Chip` node,
+   **Then** it maps to `ChipComponent` via the Component Registry pattern (`RENDERER_REGISTRY`), renders an `<origo-chip>` host with an inner `<button type="button">` element, toggles a `selected` boolean state, and dispatches `updateState(id, 'selected', boolean)` on activation.
+
+3. **And** both components enforce client-side validation and sanitization based on BADL constraints before state updates via Angular Signals and `contractSchema`.
+
+4. **And** both components natively consume Epic 2 design tokens (`--origo-*`), comply with WCAG 2.1 AA (P1-AD-6), and support RTL via CSS logical properties (NFR-I18N-001).
+
+5. **And** the ADR acknowledgment for `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` is documented in Completion Notes as N/A — Switch and Chip are form primitives that do not host iframes or sandboxed content; CSP web-worker constraints are not applicable.
+
+## Tasks / Subtasks
+
+- [ ] Task 1: Scaffolding and Structure
+  - [ ] Generate standalone components in `packages/angular-renderer/src/components/primitives/switch/` [NEW] and `chip/` [NEW].
+  - [ ] Follow the mandatory component structure template exactly (see Dev Notes).
+  - [ ] Implement `OrigoAdapter<TProps>` interface on both components.
+  - [ ] Define `static readonly contractSchema` and `static readonly strictContract = false` on both components.
+  - [ ] Configure `ViewEncapsulation.ShadowDom` and `ChangeDetectionStrategy.OnPush` on both components.
+  - [ ] Bind `[attr.data-testid]="contract().id ?? ''"` on the host element of each component (AD-12).
+
+- [ ] Task 2: Reactive State and Component Logic
+  - [ ] Wire `contract().props` and `contract().state` using Angular Signals (`computed()`, `model()`).
+  - [ ] **Switch:**
+    - [ ] Define `checked = model<boolean>(false);`.
+    - [ ] Define `computedChecked = computed(() => !!this.contract().props?.checked);` and synchronize via `effect()` / `untracked()`.
+    - [ ] Implement `onChange(event: Event)`: extract `target.checked`, update local `checked` model, and dispatch `this.experienceAdapter.updateState(this.contract().id, 'checked', checked)`.
+    - [ ] Guard: `if (this.computedDisabled()) return;` — do NOT guard on boolean falsy since `false` is a valid checked value.
+  - [ ] **Chip:**
+    - [ ] Define `selected = model<boolean>(false);`.
+    - [ ] Define `computedSelected = computed(() => !!this.contract().props?.selected);` and synchronize via `effect()` / `untracked()`.
+    - [ ] Implement `onClick()`: toggle `!this.selected()`, update local `selected` model, and dispatch `this.experienceAdapter.updateState(this.contract().id, 'selected', nextSelected)`.
+    - [ ] Guard: `if (this.computedDisabled()) return;`.
+  - [ ] Define `computedAriaLabel` and `computedAriaDescribedBy` on both components, null-coalescing to `undefined` (not `null`) to prevent `aria-label="null"` in DOM.
+
+- [ ] Task 3: Accessibility, Localization, and Keyboard Interaction
+  - [ ] **Switch:**
+    - [ ] Render `<label [for]="contract().id" [class.disabled]="computedDisabled()">` wrapping the `<input>`.
+    - [ ] Bind `[attr.aria-checked]="checked().toString()"` and `[attr.aria-label]="computedAriaLabel() ?? null"` on the inner `<input>` element, NOT the host (prevents screen reader double-read).
+    - [ ] Render `@if (computedLabel()) { <span class="label-text">{{ computedLabel() }}</span> }` for visible label text.
+    - [ ] Native `Space` key activates checkbox toggle via browser default behavior.
+  - [ ] **Chip:**
+    - [ ] Render `<button type="button" [id]="contract().id" ...>` with `<span class="chip-label">{{ computedLabel() }}</span>`.
+    - [ ] Bind `[attr.aria-pressed]="selected().toString()"` and `[attr.aria-label]="computedAriaLabel() ?? null"` on the inner `<button>` element.
+    - [ ] Native `Enter` and `Space` keys activate `<button>` click handler via browser default behavior.
+  - [ ] Style both components using CSS logical properties (`padding-inline`, `padding-block`, `margin-inline`, `border-radius`) in `.scss` files.
+  - [ ] Add axe-core Playwright tests with accessible names to `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` [UPDATE].
+
+- [ ] Task 4: Component Registry Registration
+  - [ ] Update `packages/angular-renderer/src/lib/primitives.provider.ts` [UPDATE].
+  - [ ] Import `SwitchComponent` and `ChipComponent`.
+  - [ ] Register Switch (`m.set('Switch', SwitchComponent)`) and Chip (`m.set('Chip', ChipComponent)`) by calling `.set()` on the **existing** Map factory — do NOT create a new `Map()` (which silently wipes all existing registrations).
+
+- [ ] Task 5: Testing and Central Test Registry Update
+  - [ ] Author Jest unit test suite `packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts` [NEW].
+  - [ ] Author Jest unit test suite `packages/angular-renderer/src/components/primitives/chip/chip.component.spec.ts` [NEW].
+  - [ ] Verify both suites test rendering, null props, disabled guard, ARIA attributes, state update dispatch, and RTL logical properties.
+  - [ ] Update `tools/test-registry/test-registry.yaml` [UPDATE]:
+    - [ ] Add `renderer-primitive-switch` unit test entry (`spec_file: packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts`).
+    - [ ] Add `renderer-primitive-chip` unit test entry (`spec_file: packages/angular-renderer/src/components/primitives/chip/chip.component.spec.ts`).
+    - [ ] Append `9-5-advanced-form-primitives-batch-4` to `affected_stories` under `renderer-primitives-a11y`.
+
+## Dev Notes
+
+### Mandatory Files to Read Before Writing Code
+
+Study these **before writing a single line** of implementation:
+
+1. `packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts` & `html` & `spec.ts` — **Canonical boolean-toggle pattern**: `checked = model<boolean>(false)`, `effect()` with `untracked()` for contract sync, `computedAriaLabel` with null-coalesce guard, `onChange` with disabled guard, and `<label>` wrapper structure. Switch follows this shape.
+2. `packages/angular-renderer/src/components/primitives/button/button.component.ts` & `html` & `scss` — **Canonical button primitive pattern**: `<origo-button>` host with inner `<button>` element inside Shadow DOM, `computedType`, `[attr.data-testid]="contract().id ?? ''"`. Chip follows this host/inner structure.
+3. `packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts` — **Canonical ARIA pattern**: `'aria-label'?: string` and `'aria-describedby'?: string` in Props + computed signal pattern with string coercion.
+4. `packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts` — **Canonical RTL pattern**: `[style.padding-inline]`, `[style.padding-block]` — logical properties avoiding physical left/right properties.
+5. `packages/angular-renderer/src/adapters/web/adapter.ts` — `OrigoAdapter<TProps>`, `InteractionContract`, `coerceContractProps`.
+6. `packages/angular-renderer/src/lib/primitives.provider.ts` — Current registry (14 entries). **Extend the existing factory with `.set()` — do NOT create a new `Map()` — it silently wipes all existing registrations.**
+7. `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` — Existing `page.setContent()` + `AxeBuilder.analyze()` pattern to follow for axe-core tests.
+
+---
+
+### Component Specification Matrix
+
+| Characteristic | Switch (`origo-switch`) | Chip (`origo-chip`) |
+|---|---|---|
+| **Selector** | `origo-switch` | `origo-chip` |
+| **Host Class** | `.origo-switch` | `.origo-chip` |
+| **Host Attributes** | `[attr.data-testid]="contract().id ?? ''"` | `[attr.data-testid]="contract().id ?? ''"` |
+| **Inner Native Element** | `<input type="checkbox" role="switch">` inside `<label>` | `<button type="button">` with inner `<span class="chip-label">` |
+| **Encapsulation** | `ViewEncapsulation.ShadowDom` | `ViewEncapsulation.ShadowDom` |
+| **Change Detection** | `ChangeDetectionStrategy.OnPush` | `ChangeDetectionStrategy.OnPush` |
+| **BADL Prop Key** | `checked` (`boolean`), `label` (`string`), `disabled` (`boolean`) | `selected` (`boolean`), `label` (`string`), `disabled` (`boolean`) |
+| **State Dispatch** | `updateState(contract().id, 'checked', boolean)` on change | `updateState(contract().id, 'selected', boolean)` on click |
+| **ARIA Attribute** | `[attr.aria-checked]="checked().toString()"` | `[attr.aria-pressed]="selected().toString()"` |
+| **ARIA Binding Location**| Inner `<input>` only (never on host) | Inner `<button>` only (never on host) |
+| **Keyboard Trigger** | `Space` (native checkbox behavior) | `Enter` and `Space` (native `<button>` behavior) |
+
+---
+
+### Mandatory Component Structure
+
+#### 1. Switch Component (`switch.component.ts`)
+
+```typescript
+import {
+  Component,
+  input,
+  model,
+  computed,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  effect,
+  untracked,
+} from '@angular/core';
+import { InteractionContract } from '@origo/core';
+import { OrigoAdapter } from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface SwitchProps {
+  checked?: boolean;
+  label?: string;
+  disabled?: boolean;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+@Component({
+  selector: 'origo-switch',
+  standalone: true,
+  templateUrl: './switch.component.html',
+  styleUrls: ['./switch.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-switch]': 'true',
+    '[attr.data-testid]': 'contract().id ?? ""',
+  },
+})
+export class SwitchComponent implements OrigoAdapter<SwitchProps> {
+  static readonly contractSchema = {
+    checked: 'boolean',
+    label: 'string',
+    disabled: 'boolean',
+  };
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<SwitchProps>>();
+  checked = model<boolean>(false);
+
+  computedLabel = computed(() => this.contract().props?.label ?? '');
+  computedDisabled = computed(() => !!this.contract().props?.disabled);
+  computedAriaLabel = computed(() => {
+    const v = this.contract().props?.['aria-label'];
+    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
+  });
+  computedAriaDescribedBy = computed(() => {
+    const v = this.contract().props?.['aria-describedby'];
+    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
+  });
+
+  private experienceAdapter = inject(WebExperienceAdapterService);
+
+  constructor() {
+    effect(() => {
+      const contractVal = !!this.contract().props?.checked;
+      untracked(() => {
+        if (contractVal === this.checked()) return;
+        this.checked.set(contractVal);
+      });
+    });
+  }
+
+  onChange(event: Event) {
+    const target = event.target as HTMLInputElement | null;
+    if (!target || this.computedDisabled()) return;
+
+    const isChecked = target.checked;
+    this.checked.set(isChecked);
+    this.experienceAdapter.updateState(this.contract().id, 'checked', isChecked);
+  }
+}
+```
+
+**Switch Template (`switch.component.html`):**
+```html
+<label [for]="contract().id" [class.disabled]="computedDisabled()">
+  <input
+    type="checkbox"
+    role="switch"
+    [id]="contract().id"
+    [checked]="checked()"
+    [disabled]="computedDisabled()"
+    [attr.aria-checked]="checked().toString()"
+    [attr.aria-label]="computedAriaLabel() ?? null"
+    [attr.aria-describedby]="computedAriaDescribedBy() ?? null"
+    (change)="onChange($event)"
+  />
+  @if (computedLabel()) {
+    <span class="label-text">{{ computedLabel() }}</span>
+  }
+</label>
+```
+
+**Switch Styles (`switch.component.scss`):**
+```scss
+:host {
+  display: inline-block;
+}
+
+label {
+  display: inline-flex;
+  align-items: center;
+  gap: var(--origo-spacing-container-padding, 8px);
+  cursor: pointer;
+  font-family: var(--origo-typography-input-font-family, inherit);
+  font-size: var(--origo-typography-input-font-size, 1rem);
+  color: var(--origo-color-text-primary, #333333);
+
+  &.disabled {
+    opacity: var(--origo-opacity-disabled, 0.5);
+    cursor: not-allowed;
+  }
+}
+
+input[type='checkbox'][role='switch'] {
+  appearance: none;
+  width: 40px;
+  height: 22px;
+  background-color: var(--origo-color-surface-variant, #e0e0e0);
+  border-radius: 11px;
+  position: relative;
+  outline: none;
+  cursor: pointer;
+  margin: 0;
+  transition: background-color 0.2s ease-in-out;
+
+  &::after {
+    content: '';
+    position: absolute;
+    top: 2px;
+    inset-inline-start: 2px;
+    width: 18px;
+    height: 18px;
+    background-color: var(--origo-color-on-accent, #ffffff);
+    border-radius: 50%;
+    transition: transform 0.2s ease-in-out;
+  }
+
+  &:checked {
+    background-color: var(--origo-color-accent, var(--origo-color-primary, #005fcc));
+
+    &::after {
+      transform: translateX(18px);
+    }
+  }
+
+  &:focus-visible {
+    outline: 2px solid var(--origo-color-focus, #005fcc);
+    outline-offset: 2px;
+  }
+
+  &:disabled {
+    cursor: not-allowed;
+  }
+}
+```
+
+---
+
+#### 2. Chip Component (`chip.component.ts`)
+
+```typescript
+import {
+  Component,
+  input,
+  model,
+  computed,
+  ChangeDetectionStrategy,
+  ViewEncapsulation,
+  inject,
+  effect,
+  untracked,
+} from '@angular/core';
+import { InteractionContract } from '@origo/core';
+import { OrigoAdapter } from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface ChipProps {
+  selected?: boolean;
+  label?: string;
+  disabled?: boolean;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+
+@Component({
+  selector: 'origo-chip',
+  standalone: true,
+  templateUrl: './chip.component.html',
+  styleUrls: ['./chip.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-chip]': 'true',
+    '[attr.data-testid]': 'contract().id ?? ""',
+  },
+})
+export class ChipComponent implements OrigoAdapter<ChipProps> {
+  static readonly contractSchema = {
+    selected: 'boolean',
+    label: 'string',
+    disabled: 'boolean',
+  };
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<ChipProps>>();
+  selected = model<boolean>(false);
+
+  computedLabel = computed(() => this.contract().props?.label ?? '');
+  computedDisabled = computed(() => !!this.contract().props?.disabled);
+  computedAriaLabel = computed(() => {
+    const v = this.contract().props?.['aria-label'];
+    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
+  });
+  computedAriaDescribedBy = computed(() => {
+    const v = this.contract().props?.['aria-describedby'];
+    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
+  });
+
+  private experienceAdapter = inject(WebExperienceAdapterService);
+
+  constructor() {
+    effect(() => {
+      const contractVal = !!this.contract().props?.selected;
+      untracked(() => {
+        if (contractVal === this.selected()) return;
+        this.selected.set(contractVal);
+      });
+    });
+  }
+
+  onClick() {
+    if (this.computedDisabled()) return;
+
+    const nextSelected = !this.selected();
+    this.selected.set(nextSelected);
+    this.experienceAdapter.updateState(this.contract().id, 'selected', nextSelected);
+  }
+}
+```
+
+**Chip Template (`chip.component.html`):**
+```html
+<button
+  type="button"
+  [id]="contract().id"
+  [disabled]="computedDisabled()"
+  [class.origo-chip--selected]="selected()"
+  [attr.aria-pressed]="selected().toString()"
+  [attr.aria-label]="computedAriaLabel() ?? null"
+  [attr.aria-describedby]="computedAriaDescribedBy() ?? null"
+  (click)="onClick()"
+>
+  <span class="chip-label">{{ computedLabel() }}</span>
+</button>
+```
+
+**Chip Styles (`chip.component.scss`):**
+```scss
+:host {
+  display: inline-block;
+}
+
+button {
+  display: inline-flex;
+  align-items: center;
+  justify-content: center;
+  padding-inline: var(--origo-spacing-container-padding, 12px);
+  padding-block: 6px;
+  border-radius: 16px;
+  border: 1px solid var(--origo-color-border, #cccccc);
+  background-color: var(--origo-color-surface-variant, #f5f5f5);
+  color: var(--origo-color-text-primary, #333333);
+  font-family: var(--origo-typography-button-font-family, inherit);
+  font-size: var(--origo-typography-button-font-size, 0.875rem);
+  font-weight: 500;
+  cursor: pointer;
+  transition: all 0.2s ease-in-out;
+
+  &:hover:not(:disabled) {
+    background-color: var(--origo-color-surface-variant-hover, #ebebeb);
+  }
+
+  &.origo-chip--selected {
+    background-color: var(--origo-color-accent, #005fcc);
+    color: var(--origo-color-on-accent, #ffffff);
+    border-color: var(--origo-color-accent, #005fcc);
+  }
+
+  &:focus-visible {
+    outline: 2px solid var(--origo-color-focus, #005fcc);
+    outline-offset: 2px;
+  }
+
+  &:disabled {
+    cursor: not-allowed;
+    opacity: var(--origo-opacity-disabled, 0.5);
+  }
+}
+```
+
+---
+
+### Critical Anti-Patterns — DO NOT DO THESE
+
+| Anti-Pattern | Correct Approach | Why |
+|---|---|---|
+| `new Map()` in `primitives.provider.ts` | Extend existing factory with `.set()` | A new Map wipes all 14 pre-existing component registrations |
+| `provideExperimentalZonelessChangeDetection()` in specs | `provideZonelessChangeDetection()` | Experimental zoneless API was removed in current Angular version |
+| `DomSanitizer.sanitize(SecurityContext.HTML, ariaLabel)` | `String(ariaLabel)` | ARIA is plain text; HTML sanitization mangles quotes and valid characters |
+| `[innerHTML]` for label text | `{{ computedLabel() }}` or `[textContent]` | Avoids bypassing Shadow DOM sanitization |
+| `aria-label` or `role` on host AND inner element | Bind ARIA only on inner `<input>` / `<button>` | Prevents screen readers from double-announcing the component |
+| `aria-checked` / `aria-pressed` as DOM boolean attribute | `[attr.aria-checked]="checked().toString()"` | ARIA requires string token `"true"` or `"false"` |
+| `padding-left` / `margin-left` in `.scss` | `padding-inline-start`, `margin-inline` | Logical CSS properties required for RTL (NFR-I18N-001) |
+| Null-coalescing ARIA value to literal `'null'` | Coalesce to `undefined` or `null` attribute binding | Prevents Angular from emitting `aria-label="null"` in the DOM |
+| Guarding `onChange` with `if (!checked)` | `if (this.computedDisabled()) return;` | `false` is a valid toggled value for boolean switches |
+
+---
+
+### Design Tokens for Switch and Chip
+
+Use only `--origo-*` tokens with sensible fallbacks — never hardcode visual values (AD-6):
+
+| Element / State | Token | Fallback |
+|---|---|---|
+| Switch track — off | `--origo-color-surface-variant` | `#e0e0e0` |
+| Switch track — on | `--origo-color-accent` or `--origo-color-primary` | `#005fcc` |
+| Switch thumb | `--origo-color-on-accent` | `#ffffff` |
+| Focus ring (both) | `--origo-color-focus` | `#005fcc` |
+| Disabled opacity (both) | `--origo-opacity-disabled` | `0.5` |
+| Chip surface — unselected | `--origo-color-surface-variant` | `#f5f5f5` |
+| Chip surface — selected | `--origo-color-accent` | `#005fcc` |
+| Chip border | `--origo-color-border` | `#cccccc` |
+| Chip text — selected | `--origo-color-on-accent` | `#ffffff` |
+| Padding / Spacing (both) | `--origo-spacing-container-padding` | `8px` |
+
+---
+
+### Testing Standards & Reference Scaffolds
+
+- **Test runner:** Jest + `jest-preset-angular`. Do NOT introduce Vitest (used only in `@origo/devtools`).
+- **Zoneless Setup:** `provideZonelessChangeDetection()` in `TestBed.configureTestingModule`.
+- **Test Isolation:** Global `test-setup.ts` already provides isolation; do NOT add custom `afterEach` DOM wipes.
+
+#### Unit Test Scaffold: Switch (`switch.component.spec.ts`)
+
+```typescript
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { SwitchComponent } from './switch.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { provideZonelessChangeDetection } from '@angular/core';
+
+describe('SwitchComponent', () => {
+  let component: SwitchComponent;
+  let fixture: ComponentFixture<SwitchComponent>;
+  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;
+
+  beforeEach(async () => {
+    mockExperienceAdapter = {
+      updateState: jest.fn(),
+      dispatchCapability: jest.fn(),
+    } as unknown as jest.Mocked<WebExperienceAdapterService>;
+
+    await TestBed.configureTestingModule({
+      imports: [SwitchComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
+      ],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(SwitchComponent);
+    component = fixture.componentInstance;
+  });
+
+  it('should render switch correctly with contract', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'switch-1',
+      type: 'Switch',
+      props: { checked: true, label: 'Airplane Mode' },
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl).toBeTruthy();
+    expect(inputEl!.getAttribute('role')).toBe('switch');
+    expect(inputEl!.checked).toBe(true);
+
+    const labelText = fixture.nativeElement.shadowRoot!.querySelector('.label-text');
+    expect(labelText!.textContent).toContain('Airplane Mode');
+  });
+
+  it('should handle null props gracefully', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'switch-2',
+      type: 'Switch',
+      props: null,
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl).toBeTruthy();
+    expect(inputEl!.checked).toBe(false);
+  });
+
+  it('should block interaction when disabled', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'switch-3',
+      type: 'Switch',
+      props: { disabled: true },
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl!.disabled).toBe(true);
+  });
+
+  it('should dispatch updateState on toggle', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'switch-4',
+      type: 'Switch',
+      props: { checked: false },
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    inputEl!.checked = true;
+    inputEl!.dispatchEvent(new Event('change'));
+
+    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('switch-4', 'checked', true);
+  });
+
+  it('should enforce RTL compliance via logical properties', () => {
+    fixture.componentRef.setInput('contract', { id: 'rtl-switch', type: 'Switch', props: {} });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const element = root.firstElementChild as HTMLElement;
+    if (element && element.style) {
+      expect(element.style.paddingLeft).toBeFalsy();
+      expect(element.style.paddingRight).toBeFalsy();
+    }
+  });
+});
+```
+
+#### Unit Test Scaffold: Chip (`chip.component.spec.ts`)
+
+```typescript
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { ChipComponent } from './chip.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { provideZonelessChangeDetection } from '@angular/core';
+
+describe('ChipComponent', () => {
+  let component: ChipComponent;
+  let fixture: ComponentFixture<ChipComponent>;
+  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;
+
+  beforeEach(async () => {
+    mockExperienceAdapter = {
+      updateState: jest.fn(),
+      dispatchCapability: jest.fn(),
+    } as unknown as jest.Mocked<WebExperienceAdapterService>;
+
+    await TestBed.configureTestingModule({
+      imports: [ChipComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
+      ],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(ChipComponent);
+    component = fixture.componentInstance;
+  });
+
+  it('should render chip with label and unselected by default', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'chip-1',
+      type: 'Chip',
+      props: { label: 'Angular' },
+    });
+    fixture.detectChanges();
+
+    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
+    expect(buttonEl).toBeTruthy();
+    expect(buttonEl!.getAttribute('aria-pressed')).toBe('false');
+    expect(buttonEl!.textContent).toContain('Angular');
+  });
+
+  it('should toggle selection on click and dispatch updateState', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'chip-2',
+      type: 'Chip',
+      props: { selected: false },
+    });
+    fixture.detectChanges();
+
+    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
+    buttonEl!.click();
+
+    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('chip-2', 'selected', true);
+  });
+
+  it('should block click when disabled', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'chip-3',
+      type: 'Chip',
+      props: { disabled: true },
+    });
+    fixture.detectChanges();
+
+    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
+    expect(buttonEl!.disabled).toBe(true);
+
+    buttonEl!.click();
+    expect(mockExperienceAdapter.updateState).not.toHaveBeenCalled();
+  });
+});
+```
+
+#### Axe-Core Playwright Tests (Append to `primitives.a11y.pw.ts`)
+
+```typescript
+  // Story 9.5 — Switch primitive
+  test('Switch should not have any automatically detectable accessibility issues (default)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="false" /> Notifications</label>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Switch should not have any automatically detectable accessibility issues (checked)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="true" checked /> Notifications</label>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Switch should not have any automatically detectable accessibility issues (disabled)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="false" disabled /> Notifications</label>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  // Story 9.5 — Chip primitive
+  test('Chip should not have any automatically detectable accessibility issues (default)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<button type="button" class="origo-chip" aria-pressed="false">Angular</button>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Chip should not have any automatically detectable accessibility issues (selected)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<button type="button" class="origo-chip origo-chip--selected" aria-pressed="true">Angular</button>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Chip should not have any automatically detectable accessibility issues (disabled)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<button type="button" class="origo-chip" aria-pressed="false" disabled>Angular</button>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+```
+
+---
+
+### Architecture Compliance
+
+| Rule | Requirement |
+|---|---|
+| **P1-AD-1** | `standalone: true`, Signals for all reactive state, zoneless-compatible (`provideZonelessChangeDetection`). |
+| **P1-AD-5** | No component class inheritance; composition via `@ContentChild`/`hostDirectives` only. |
+| **P1-AD-6** | Every component must pass axe-core WCAG 2.1 AA in `primitives.a11y.pw.ts` — violation = CI failure. |
+| **AD-2** | All files located under `packages/angular-renderer/src/components/primitives/`. Zero cross-package `src/` imports. |
+| **AD-6** | Zero hardcoded visual values in `.scss` files — use `--origo-*` tokens with fallback values only. |
+| **AD-12** | `[attr.data-testid]="contract().id ?? ''"` on the host element of each component. |
+
+---
+
+### Project Structure Notes
+
+**New Files:**
+- `packages/angular-renderer/src/components/primitives/switch/switch.component.ts` [NEW]
+- `packages/angular-renderer/src/components/primitives/switch/switch.component.html` [NEW]
+- `packages/angular-renderer/src/components/primitives/switch/switch.component.scss` [NEW]
+- `packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts` [NEW]
+- `packages/angular-renderer/src/components/primitives/chip/chip.component.ts` [NEW]
+- `packages/angular-renderer/src/components/primitives/chip/chip.component.html` [NEW]
+- `packages/angular-renderer/src/components/primitives/chip/chip.component.scss` [NEW]
+- `packages/angular-renderer/src/components/primitives/chip/chip.component.spec.ts` [NEW]
+
+**Updated Files:**
+- `packages/angular-renderer/src/lib/primitives.provider.ts` [UPDATE] — extend existing Map with Switch and Chip.
+- `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` [UPDATE] — append 6 axe-core tests.
+- `tools/test-registry/test-registry.yaml` [UPDATE] — add `renderer-primitive-switch`, `renderer-primitive-chip`, and update `renderer-primitives-a11y`.
+
+---
+
+### Previous Story Intelligence (9.3 & 9.4)
+
+**From Story 9.4 — apply directly to Switch and Chip:**
+- **Do NOT use `[innerHTML]`** — use `{{ computedLabel() }}` or `[textContent]`. Avoids Shadow DOM sanitization bypass.
+- **ARIA on inner native element only** — for interactive elements (`<input>`, `<button>`), bind `aria-label` and `aria-describedby` on the inner element, not the host. Host binding causes screen readers to announce twice.
+- **Empty string emits `aria-label=""`** — always coalesce to `undefined`. Pattern: `return value?.trim() ? String(value) : undefined`.
+- **Null vs. undefined coercion** — coalesce to `undefined`, not `null`. `null` in an Angular template binding emits the literal string `"null"` as the attribute value.
+- **Disabled guard must not block boolean `false` dispatch** — for Switch, `false` is a valid `checked` value. Guard only on `computedDisabled()`.
+- **ADR DoD is mandatory** — pattern: *"Batch N primitives do not host iframes or sandboxed content. CSP constraints are N/A."*
+
+**Pre-existing tech debt (from Story 9.4 code review):**
+The following 9 open `[Review][Patch]` items from Story 9.4 are out of scope for Story 9.5:
+- `DomSanitizer` anti-pattern in `radio-group.component.ts` (pre-existing, deferred).
+- Button ARIA signals computed but not bound (pre-existing, deferred).
+- Form-field ARIA bound on landmark-less `<div>` (pre-existing, deferred).
+
+---
+
+### References
+
+- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md] — 25-component primitive target, P1-AD-1, P1-AD-5, P1-AD-6.
+- [Source: _bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md] — N/A for Story 9.5 (primitives do not host iframes).
+- [Source: _bmad-output/implementation-artifacts/9-4-accessibility-localization-enforcement.md] — Established patterns for ARIA, RTL, and test isolation.
+
+---
+
+## Dev Agent Record
+
+### Agent Model Used
+Gemini 3.8 Flash (High)
+
+### Completion Notes List
+- Comprehensive developer context created and validated against BMad quality checklist.
+- All 13 quality improvements applied:
+  - C1: `baseline_commit` set to HEAD commit (`1d2621fe99c63c3cddabb7a0fc0d44bda43fe4a6`).
+  - C2: Accessible `<label>` wrapper and visible label text added to Switch template.
+  - C3: Axe-core test snippets corrected with accessible label context.
+  - C4: Test registry Task 5 corrected to register unit test specs and append to `renderer-primitives-a11y`.
+  - C5: Complete TypeScript, HTML, and SCSS scaffold added for `ChipComponent`.
+  - E6: AC 2 clarified to define host `<origo-chip>` with inner `<button>` element.
+  - E7: Complete Jest unit test reference suites added for `switch.component.spec.ts` and `chip.component.spec.ts`.
+  - E8: Complete reference SCSS added with CSS custom property token fallbacks for both components.
+  - E9: Two-way model synchronization (`model()` + `effect()` + `untracked()`) documented and implemented.
+  - O10: Keyboard interaction semantics explicitly detailed.
+  - O11: RTL logical property spec assertions included in unit test requirements.
+  - O12: Unified Component Specification Matrix added.
+  - O13: Explicit `[NEW]` and `[UPDATE]` file paths documented across all tasks.
+- ADR DoD: `adr-epic7-web-worker-csp.md` acknowledged as N/A (form primitives do not host iframes).
+- Sprint extension governance: Authorized to complete remaining 2 primitives of Phase 1 25-component target.
diff --git a/_bmad-output/implementation-artifacts/diff.patch b/_bmad-output/implementation-artifacts/diff.patch
index e30e16d..f69eacd 100644
--- a/_bmad-output/implementation-artifacts/diff.patch
+++ b/_bmad-output/implementation-artifacts/diff.patch
@@ -1,1309 +0,0 @@
-diff --git a/_bmad-output/implementation-artifacts/9-2-data-presentation-primitives-batch-2.md b/_bmad-output/implementation-artifacts/9-2-data-presentation-primitives-batch-2.md
-new file mode 100644
-index 0000000..36fdc4e
---- /dev/null
-+++ b/_bmad-output/implementation-artifacts/9-2-data-presentation-primitives-batch-2.md
-@@ -0,0 +1,263 @@
-+---
-+baseline_commit: 2a0938f6deb684427bd4f7e007f7f15424197b4c
-+completion_commit: pending
-+---
-+
-+# Story 9.2: Data Presentation Primitives (Batch 2)
-+
-+Status: completed
-+
-+<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->
-+
-+## Story
-+
-+As a UI Developer,
-+I want a set of data presentation primitives (e.g., DataGrid, List, Card),
-+so that I can display collections of entities dynamically.
-+
-+## Acceptance Criteria
-+
-+1. **Given** the Origo Angular renderer,
-+   **When** the AST contains `DataGrid`, `List`, or `Card` nodes,
-+   **Then** they map to the correct `OrigoAdapter` components using the Component Registry pattern (FR-Rend-005) — no hardcoded switches.
-+2. **And** DataGrid and List handle pagination, sorting, and row-level actions driven by BADL state via `WebExperienceAdapterService.updateState()`.
-+3. **And** List and DataGrid components mandate DOM virtualization (Angular CDK `CdkVirtualScrollViewport`) or a hard `maxItems` cap to prevent DOM thrashing on large datasets.
-+4. **And** all components comply with WCAG 2.1 AA standards enforced by axe-core in CI (NFR-ACC-001), with ARIA context (`aria-label`, `aria-describedby`, `role`) propagated from AST props down to native DOM elements.
-+5. **And** all components render correctly in RTL orientation via logical CSS properties (NFR-I18N-001).
-+6. **And** this story implementation explicitly acknowledges `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` per the Definition of Done — Batch 2 primitives do not host iframes or sandboxed content; note as N/A in completion notes.
-+
-+## Tasks / Subtasks
-+
-+- [x] Task 1: Study existing Batch 1 primitives to internalize the established patterns. (prerequisite)
-+  - [x] Read `select.component.ts` — canonical collection-iteration + sanitization pattern.
-+  - [x] Read `vbox.component.ts` — canonical container/layout pattern (`viewChild` + `ContainerComponent`).
-+  - [x] Read `hbox.component.ts` — logical CSS property pattern for RTL.
-+  - [x] Read `adapter.ts` — `OrigoAdapter<TProps>`, `ContainerComponent`, `coerceContractProps`.
-+  - [x] Read `renderer.tokens.ts` and `primitives.provider.ts` — how `RENDERER_REGISTRY` and `provideOrigo9Primitives()` work.
-+- [ ] Task 2: Implement `DataGridComponent`. (AC: 1, 2, 3, 4, 5)
-+  - [ ] Props: `columns: Array<{key: string; label: string; sortable?: boolean}>`, `rows: Array<Record<string, unknown>>`, `pageSize?: number`, `currentPage?: number`, `totalRows?: number`, `disabled?: boolean`, `aria-label?: string`.
-+  - [ ] Enforce `maxItems` hard cap or CDK virtual scroll — never render an unbounded list.
-+  - [ ] Sorting: on header click, call `experienceAdapter.updateState(id, 'sortKey', key)` and `updateState(id, 'sortDir', 'asc'|'desc')`. Guard disabled.
-+  - [ ] Pagination: on page change, call `experienceAdapter.updateState(id, 'currentPage', page)`.
-+  - [ ] Row actions: on row-level action, call `experienceAdapter.updateState(id, 'selectedRow', rowId)`. Sanitize string values before dispatch.
-+  - [ ] Bind `[attr.data-testid]="contract().id"` and `[attr.aria-label]="computedAriaLabel()"` on host.
-+- [ ] Task 3: Implement `ListComponent`. (AC: 1, 2, 3, 4, 5)
-+  - [ ] Props: `items: Array<Record<string, unknown>>`, `maxItems?: number`, `disabled?: boolean`, `aria-label?: string`.
-+  - [ ] Enforce `maxItems` cap — slice items at render time if over limit.
-+  - [ ] On item selection: call `experienceAdapter.updateState(id, 'selectedItem', item.id)`.
-+  - [ ] Bind `role="list"` on host; each item renders as `role="listitem"`.
-+- [x] Task 2: Implement `DataGridComponent`. (AC: 1, 2, 3, 4, 5)
-+  - [x] Props: `columns: Array<{key: string; label: string; sortable?: boolean}>`, `rows: Array<Record<string, unknown>>`, `pageSize?: number`, `currentPage?: number`, `totalRows?: number`, `disabled?: boolean`, `aria-label?: string`.
-+  - [x] Enforce `maxItems` hard cap or CDK virtual scroll — never render an unbounded list.
-+  - [x] Sorting: on header click, call `experienceAdapter.updateState(id, 'sortKey', key)` and `updateState(id, 'sortDir', 'asc'|'desc')`. Guard disabled.
-+  - [x] Pagination: on page change, call `experienceAdapter.updateState(id, 'currentPage', page)`.
-+  - [x] Row actions: on row-level action, call `experienceAdapter.updateState(id, 'selectedRow', rowId)`. Sanitize string values before dispatch.
-+  - [x] Bind `[attr.data-testid]="contract().id"` and `[attr.aria-label]="computedAriaLabel()"` on host.
-+- [x] Task 3: Implement `ListComponent`. (AC: 1, 2, 3, 4, 5)
-+  - [x] Props: `items: Array<Record<string, unknown>>`, `maxItems?: number`, `disabled?: boolean`, `aria-label?: string`.
-+  - [x] Enforce `maxItems` cap — slice items at render time if over limit.
-+  - [x] On item selection: call `experienceAdapter.updateState(id, 'selectedItem', item.id)`.
-+  - [x] Bind `role="list"` on host; each item renders as `role="listitem"`.
-+- [x] Task 4: Implement `CardComponent`. (AC: 1, 4, 5)
-+  - [x] Props: `title?: string`, `subtitle?: string`, `imageUrl?: string`, `aria-label?: string`, `aria-describedby?: string`.
-+  - [x] Pure display — no `updateState()` calls. Implements `OrigoAdapter<CardProps>` only (not `ContainerComponent`).
-+  - [x] Sanitize `imageUrl` via `DomSanitizer.sanitize(SecurityContext.URL, imageUrl)`.
-+- [x] Task 5: Register all components in `RENDERER_REGISTRY`. (AC: 1)
-+  - [x] Open `packages/angular-renderer/src/lib/primitives.provider.ts` — the existing `provideOrigo9Primitives()` function.
-+  - [x] Add to the existing factory (DO NOT create a new provider — it will silently replace all Batch 1 entries):
-+    ```typescript
-+    m.set('DataGrid', DataGridComponent);
-+    m.set('List', ListComponent);
-+    m.set('Card', CardComponent);
-+    ```
-+  - [x] Add the three new imports at the top of `primitives.provider.ts`.
-+- [x] Task 6: Export new components from public API. (prerequisite for consumers)
-+  - [x] Append to `packages/angular-renderer/src/index.ts` (DO NOT remove existing exports):
-+    ```typescript
-+    export * from './components/primitives/data-grid/data-grid.component';
-+    export * from './components/primitives/list/list.component';
-+    export * from './components/primitives/card/card.component';
-+    ```
-+- [ ] Task 7: Write Jest unit tests for each component. (AC: 4)
-+  - [ ] Use `provideZonelessChangeDetection()` in TestBed (NOT `provideExperimentalZonelessChangeDetection` — it was removed).
-+  - [ ] Mock `WebExperienceAdapterService.updateState` as `jest.fn()`.
-+  - [ ] Test: valid contract renders, null/undefined props do not crash, disabled blocks interaction, ARIA attrs bound, `maxItems` cap respected.
-+  - [ ] Do NOT add extra isolation guards — `test-setup.ts` already runs `afterEach` cleanup (retro-8-harden-test-isolation).
-+- [ ] Task 8: Add Playwright a11y tests for each new component. (AC: 4)
-+  - [ ] Append three `test()` blocks to `primitives.a11y.pw.ts` using `page.setContent()` + `AxeBuilder.analyze()`.
-+- [ ] Task 9: Update Central Test Registry. (DoD requirement)
-+  - [ ] Add entries to `tools/test-registry/test-registry.yaml` for all new spec files.
-+  - [ ] Fields required: `id`, `description`, `package: @origo/angular-renderer`, `spec_file`, `type: unit`, `affected_stories: [9-2-data-presentation-primitives-batch-2]`, `last_result: unknown`.
-+- [ ] Task 10: Verify the build pipeline.
-+  - [ ] `nx lint angular-renderer`
-+  - [ ] `nx test angular-renderer`
-+  - [ ] `nx build angular-renderer`
-+
-+## Dev Notes
-+
-+### Scope — What Must Be Built
-+
-+This story adds **new primitive components** to the existing `packages/angular-renderer` package. **No new Nx packages are created.** All components live under:
-+
-+```
-+packages/angular-renderer/src/components/primitives/
-+  data-grid/
-+    data-grid.component.ts | .html | .scss | .spec.ts
-+  list/
-+    list.component.ts | .html | .scss | .spec.ts
-+  card/
-+    card.component.ts | .html | .scss | .spec.ts
-+```
-+
-+### Mandatory Files to Read Before Writing Code
-+
-+Study these files before writing a single line:
-+
-+1. [`select.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/select/select.component.ts) — canonical collection + sanitization pattern
-+2. [`vbox.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts) — canonical container/layout pattern
-+3. [`hbox.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts) — logical CSS props for RTL
-+4. [`adapter.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/adapters/web/adapter.ts) — `OrigoAdapter<TProps>`, `ContainerComponent`, `coerceContractProps`
-+5. [`primitives.provider.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/lib/primitives.provider.ts) — the `provideOrigo9Primitives()` factory to extend
-+
-+### Mandatory Component Structure
-+
-+Every component MUST follow this exact shape (from existing primitives):
-+
-+```typescript
-+@Component({
-+  selector: 'origo-<name>',
-+  standalone: true,
-+  templateUrl: './<name>.component.html',
-+  styleUrls: ['./<name>.component.scss'],
-+  changeDetection: ChangeDetectionStrategy.OnPush,
-+  encapsulation: ViewEncapsulation.ShadowDom,   // ALWAYS ShadowDom
-+  host: {
-+    '[class.origo-<name>]': 'true',
-+    '[attr.data-testid]': 'contract().id',       // AD-12 stable selector
-+  },
-+})
-+export class <Name>Component implements OrigoAdapter<<Name>Props> {
-+  static readonly contractSchema = { /* key: 'string'|'number'|'boolean'|'array'|'object' */ };
-+  static readonly strictContract = false;
-+  contract = input.required<InteractionContract<<Name>Props>>();
-+  // All reactive props: always computed() — NEVER getters or ngOnChanges
-+}
-+```
-+
-+### Component Registry — Critical Warning
-+
-+**NEVER create a new `Map` instance for `RENDERER_REGISTRY`.** The factory in `provideOrigo9Primitives()` in `primitives.provider.ts` receives the existing map via `deps: [RENDERER_REGISTRY]` and mutates it. Creating a second provider that passes a `new Map()` silently replaces all Batch 1 registrations (`TextInput`, `Button`, `VBox`, `Select`, `Checkbox`, etc.). Just add to the existing factory:
-+
-+```typescript
-+// In primitives.provider.ts — EXTEND, do not replace:
-+m.set('DataGrid', DataGridComponent);
-+m.set('List', ListComponent);
-+m.set('Card', CardComponent);
-+```
-+
-+### Design Token Consumption (AD-6 — Strict)
-+
-+Use `--origo-*` CSS custom properties exclusively. No hardcoded hex, px, or radius literals.
-+
-+> **ShadowDom note:** CSS custom properties (`--origo-*`) **DO** pierce ShadowDom (they are inherited). Standard CSS properties do NOT. This is why the token system works. Use `var(--origo-color-surface-background, #fff)` — always provide a fallback.
-+
-+Established token namespace from Batch 1 (`select.component.scss`):
-+- Colors: `--origo-color-surface-background`, `--origo-color-text-primary`, `--origo-color-border-default`, `--origo-color-focus`
-+- Spacing: `--origo-spacing-container-padding`
-+- Typography: `--origo-typography-input-font-family`, `--origo-typography-input-font-size`
-+- Opacity: `--origo-opacity-disabled`
-+- Radius: `--origo-radius-sm`
-+
-+### RTL Support (FR-L-003)
-+
-+All layout/data components MUST use **logical CSS properties**:
-+- `padding-inline-start` / `padding-inline-end` (not `padding-left`)
-+- `margin-inline` (not `margin-left`/`right`)
-+- `text-align: start` (not `left`)
-+
-+This ensures RTL auto-flip without any code changes.
-+
-+### Input Sanitization
-+
-+- String values from user interaction: `DomSanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || ''`
-+- URL values (e.g., `imageUrl`): `DomSanitizer.sanitize(SecurityContext.URL, url)`
-+- ARIA string props (not HTML): use `String(value)` coercion — do NOT HTML-sanitize (it strips valid text)
-+
-+### Architecture Compliance
-+
-+| Rule | Requirement |
-+|---|---|
-+| P1-AD-1 | `standalone: true`, Signals for all reactive state, zoneless-compatible |
-+| P1-AD-5 | No component class inheritance; composition via `@ContentChild`/`hostDirectives` only |
-+| P1-AD-6 | Every component must pass axe-core WCAG 2.1 AA in `primitives.a11y.pw.ts` |
-+| AD-2 | All files in `packages/angular-renderer`. No cross-package `src/` imports. |
-+| AD-6 | Zero hardcoded visual values in `.scss` files |
-+| AD-12 | `[attr.data-testid]="contract().id"` on all host elements |
-+
-+### Testing Requirements
-+
-+- **Test runner:** Jest + `jest-preset-angular`. **Do NOT introduce Vitest** (that is the `devtools` package runner).
-+- **Zoneless provider:** Use `provideZonelessChangeDetection()` — `provideExperimentalZonelessChangeDetection` was removed in this version of `@angular/core`.
-+- **Isolation:** `test-setup.ts` already provides `afterEach` isolation guards — do NOT add more.
-+- **Playwright a11y:** Add to `primitives.a11y.pw.ts` via `page.setContent()` + `AxeBuilder.analyze()`.
-+
-+### Previous Story Intelligence
-+
-+Learnings from **Story 9-1 (Form & Layout Primitives)** that directly apply:
-+
-+- **`provideZonelessChangeDetection()`** not `provideExperimentalZonelessChangeDetection` — removed from Angular.
-+- **`FormFieldComponent` regression pattern:** `aria-live="polite"` was wrong — use `role="alert"` for errors.
-+- **`HBoxComponent` regression:** physical padding (`padding-left`) instead of logical CSS (`padding-inline-start`) — watch for this in grid/list layouts.
-+- **Disabled guard is mandatory:** Every event handler MUST check `if (this.computedDisabled()) return;` first — omitting this was a Batch 1 review finding.
-+- **`computedOptions` null guard:** Filter out items where `value` or `label` is null/undefined before rendering — apply same pattern to DataGrid `rows` and List `items`.
-+- **`renderer.tokens.ts` eager imports risk:** Do not import all component classes at the top of `renderer.tokens.ts` — it creates circular dependency risk. Import only in `primitives.provider.ts`.
-+- **Playwright ShadowDom note (deferred):** Tests use raw HTML fixtures that bypass Shadow DOM — pre-existing pattern, acceptable for now.
-+- **No `JSON.stringify` on contract props** — cyclic object risk. Use `computed()` signal access only.
-+
-+### Git Intelligence
-+
-+- **Current version:** `0.0.33` (released after Batch 1 merge). No manual version bumps — Nx release handles it.
-+- **Batch 1 file commit:** `576e23d feat(angular-renderer): implement form layout primitive components and tokens` — all Batch 1 patterns are in HEAD.
-+- **Provider file:** `primitives.provider.ts` is at HEAD and exports `provideOrigo9Primitives()` with 7 entries — extend it.
-+
-+### References
-+
-+- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.2`]
-+- [Source: `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md`]
-+- [Source: `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md`]
-+- [Source: `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`] — N/A for Batch 2 (no iframes or sandboxed content)
-+- [Source: `docs/definition-of-done.md`]
-+- [Source: `stories/9-1-form-layout-primitives-batch-1.md`] — Batch 1 patterns and learnings
-+
-+## Dev Agent Record
-+
-+### Agent Model Used
-+
-+Claude Sonnet 4.6 (Thinking)
-+
-+### Debug Log References
-+
-+### Completion Notes List
-+
-+- Ultimate context engine analysis completed — comprehensive developer guide created.
-+- Validated and enhanced via bmad-create-story checklist: critical issues C1–C4 and enhancements E1–E5 applied.
-+- ADR DoD: `adr-epic7-web-worker-csp.md` — Batch 2 primitives do not host iframes or sandboxed content (N/A).
-+
-+### File List
-+
-+- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts`
-+- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html`
-+- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.scss`
-+- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.spec.ts`
-+- `packages/angular-renderer/src/components/primitives/list/list.component.ts`
-+- `packages/angular-renderer/src/components/primitives/list/list.component.html`
-+- `packages/angular-renderer/src/components/primitives/list/list.component.scss`
-+- `packages/angular-renderer/src/components/primitives/list/list.component.spec.ts`
-+- `packages/angular-renderer/src/components/primitives/card/card.component.ts`
-+- `packages/angular-renderer/src/components/primitives/card/card.component.html`
-+- `packages/angular-renderer/src/components/primitives/card/card.component.scss`
-+- `packages/angular-renderer/src/components/primitives/card/card.component.spec.ts`
-+- `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts`
-+- `packages/angular-renderer/src/lib/primitives.provider.ts`
-+- `packages/angular-renderer/src/index.ts`
-+- `tools/test-registry/test-registry.yaml`
-diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
-index 3127577..a4a7eed 100644
---- a/_bmad-output/implementation-artifacts/sprint-status.yaml
-+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
-@@ -41,7 +41,7 @@
- # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
- 
- generated: 2026-07-29T21:46:02.464968
--last_updated: 2026-09-19T17:07:00+05:30
-+last_updated: 2026-09-21T20:32:00+05:30
- project: origo-design
- project_key: NOKEY
- tracking_system: file-system
-@@ -112,7 +112,7 @@ development_status:
-   epic-8-retrospective: done
-   epic-9: in-progress
-   9-1-form-layout-primitives-batch-1: done
--  9-2-data-presentation-primitives-batch-2: backlog
-+  9-2-data-presentation-primitives-batch-2: review
-   9-3-navigation-shell-primitives-batch-3: backlog
-   9-4-accessibility-localization-enforcement: backlog
-   9-5-advanced-form-primitives-batch-4: backlog
-diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.html b/packages/angular-renderer/src/components/primitives/card/card.component.html
-new file mode 100644
-index 0000000..8e0408f
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/card/card.component.html
-@@ -0,0 +1,18 @@
-+<div class="origo-card-container">
-+  @if (computedImageUrl()) {
-+    <div class="origo-card-image">
-+      <img [src]="computedImageUrl()" alt="" />
-+    </div>
-+  }
-+  
-+  @if (computedTitle() || computedSubtitle()) {
-+    <div class="origo-card-content">
-+      @if (computedTitle()) {
-+        <div class="origo-card-title">{{ computedTitle() }}</div>
-+      }
-+      @if (computedSubtitle()) {
-+        <div class="origo-card-subtitle">{{ computedSubtitle() }}</div>
-+      }
-+    </div>
-+  }
-+</div>
-diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.scss b/packages/angular-renderer/src/components/primitives/card/card.component.scss
-new file mode 100644
-index 0000000..d263bb7
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/card/card.component.scss
-@@ -0,0 +1,47 @@
-+:host {
-+  display: block;
-+  width: 100%;
-+}
-+
-+.origo-card-container {
-+  display: flex;
-+  flex-direction: column;
-+  width: 100%;
-+  border-radius: var(--origo-radius-sm, 4px);
-+  border: 1px solid var(--origo-color-border-default, #ccc);
-+  background-color: var(--origo-color-surface-background, #fff);
-+  overflow: hidden;
-+}
-+
-+.origo-card-image {
-+  width: 100%;
-+  
-+  img {
-+    width: 100%;
-+    height: auto;
-+    display: block;
-+    object-fit: cover;
-+  }
-+}
-+
-+.origo-card-content {
-+  display: flex;
-+  flex-direction: column;
-+  padding-inline-start: var(--origo-spacing-container-padding, 16px);
-+  padding-inline-end: var(--origo-spacing-container-padding, 16px);
-+  padding-block: 16px;
-+  gap: 8px;
-+  text-align: start;
-+  color: var(--origo-color-text-primary, #333);
-+  font-family: var(--origo-typography-input-font-family, inherit);
-+}
-+
-+.origo-card-title {
-+  font-size: calc(var(--origo-typography-input-font-size, 14px) * 1.25);
-+  font-weight: 600;
-+}
-+
-+.origo-card-subtitle {
-+  font-size: var(--origo-typography-input-font-size, 14px);
-+  opacity: 0.8;
-+}
-diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.spec.ts b/packages/angular-renderer/src/components/primitives/card/card.component.spec.ts
-new file mode 100644
-index 0000000..3b4b39a
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/card/card.component.spec.ts
-@@ -0,0 +1,77 @@
-+import { ComponentFixture, TestBed } from '@angular/core/testing';
-+import { CardComponent } from './card.component';
-+import { provideZonelessChangeDetection } from '@angular/core';
-+
-+describe('CardComponent', () => {
-+  let component: CardComponent;
-+  let fixture: ComponentFixture<CardComponent>;
-+
-+  beforeEach(async () => {
-+    await TestBed.configureTestingModule({
-+      imports: [CardComponent],
-+      providers: [
-+        provideZonelessChangeDetection(),
-+      ],
-+    }).compileComponents();
-+
-+    fixture = TestBed.createComponent(CardComponent);
-+    component = fixture.componentInstance;
-+  });
-+
-+  it('should create and render with valid contract', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'card-1',
-+      type: 'Card',
-+      props: {
-+        title: 'Card Title',
-+        subtitle: 'Card Subtitle',
-+        imageUrl: 'http://example.com/image.png',
-+        'aria-label': 'My card',
-+        'aria-describedby': 'desc-1',
-+      },
-+    });
-+    fixture.detectChanges();
-+    
-+    expect(component).toBeTruthy();
-+    const host = fixture.nativeElement as HTMLElement;
-+    expect(host.getAttribute('data-testid')).toBe('card-1');
-+    expect(host.getAttribute('aria-label')).toBe('My card');
-+    expect(host.getAttribute('aria-describedby')).toBe('desc-1');
-+    
-+    const root = host.shadowRoot!;
-+    const titleEl = root.querySelector('.origo-card-title');
-+    expect(titleEl?.textContent?.trim()).toBe('Card Title');
-+    
-+    const subtitleEl = root.querySelector('.origo-card-subtitle');
-+    expect(subtitleEl?.textContent?.trim()).toBe('Card Subtitle');
-+    
-+    const imgEl = root.querySelector('img');
-+    expect(imgEl?.getAttribute('src')).toBe('http://example.com/image.png');
-+  });
-+
-+  it('should not crash with null/undefined props', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'card-err',
-+      type: 'Card',
-+      props: null,
-+    });
-+    expect(() => fixture.detectChanges()).not.toThrow();
-+  });
-+
-+  it('should sanitize imageUrl', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'card-sanit',
-+      type: 'Card',
-+      props: {
-+        imageUrl: 'javascript:alert(1)',
-+      },
-+    });
-+    fixture.detectChanges();
-+    
-+    const root = fixture.nativeElement.shadowRoot!;
-+    const imgEl = root.querySelector('img');
-+    // Angular URL sanitization should prefix unsafe urls with 'unsafe:' or strip them
-+    const src = imgEl?.getAttribute('src') || '';
-+    expect(src).toBe('unsafe:javascript:alert(1)');
-+  });
-+});
-diff --git a/packages/angular-renderer/src/components/primitives/card/card.component.ts b/packages/angular-renderer/src/components/primitives/card/card.component.ts
-new file mode 100644
-index 0000000..312a935
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/card/card.component.ts
-@@ -0,0 +1,76 @@
-+import {
-+  Component,
-+  input,
-+  ChangeDetectionStrategy,
-+  computed,
-+  ViewEncapsulation,
-+  inject,
-+  SecurityContext,
-+} from '@angular/core';
-+import { DomSanitizer } from '@angular/platform-browser';
-+import { InteractionContract } from '@origo/core';
-+import { OrigoAdapter } from '../../../adapters/web/adapter';
-+
-+export interface CardProps {
-+  title?: string;
-+  subtitle?: string;
-+  imageUrl?: string;
-+  'aria-label'?: string;
-+  'aria-describedby'?: string;
-+}
-+
-+@Component({
-+  selector: 'origo-card',
-+  standalone: true,
-+  templateUrl: './card.component.html',
-+  styleUrls: ['./card.component.scss'],
-+  changeDetection: ChangeDetectionStrategy.OnPush,
-+  encapsulation: ViewEncapsulation.ShadowDom,
-+  host: {
-+    '[class.origo-card]': 'true',
-+    '[attr.data-testid]': 'contract().id',
-+    '[attr.aria-label]': 'computedAriaLabel()',
-+    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
-+  },
-+})
-+export class CardComponent implements OrigoAdapter<CardProps> {
-+  static readonly contractSchema = {
-+    title: 'string',
-+    subtitle: 'string',
-+    imageUrl: 'string',
-+  };
-+  static readonly strictContract = false;
-+
-+  contract = input.required<InteractionContract<CardProps>>();
-+
-+  private sanitizer = inject(DomSanitizer);
-+
-+  computedTitle = computed(() => {
-+    const title = this.contract().props?.title;
-+    return title !== undefined && title !== null ? String(title) : undefined;
-+  });
-+
-+  computedSubtitle = computed(() => {
-+    const subtitle = this.contract().props?.subtitle;
-+    return subtitle !== undefined && subtitle !== null ? String(subtitle) : undefined;
-+  });
-+
-+  computedImageUrl = computed(() => {
-+    const url = this.contract().props?.imageUrl;
-+    if (url === undefined || url === null || url === '') return undefined;
-+    
-+    // Sanitize URL for image source
-+    const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, String(url));
-+    return sanitizedUrl || undefined;
-+  });
-+
-+  computedAriaLabel = computed(() => {
-+    const label = this.contract().props?.['aria-label'];
-+    return label !== undefined && label !== null ? String(label) : undefined;
-+  });
-+
-+  computedAriaDescribedBy = computed(() => {
-+    const desc = this.contract().props?.['aria-describedby'];
-+    return desc !== undefined && desc !== null ? String(desc) : undefined;
-+  });
-+}
-diff --git a/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html
-new file mode 100644
-index 0000000..7d1bc03
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.html
-@@ -0,0 +1,26 @@
-+<div class="origo-data-grid-container" [class.disabled]="computedDisabled()">
-+  <table>
-+    <thead>
-+      <tr>
-+        @for (col of computedColumns(); track col.key) {
-+          <th 
-+            [attr.aria-sort]="col.sortable ? sortDir() : null"
-+            (click)="col.sortable ? onSort(col.key) : null"
-+            [class.sortable]="col.sortable"
-+          >
-+            {{ col.label }}
-+          </th>
-+        }
-+      </tr>
-+    </thead>
-+    <tbody>
-+      @for (row of computedRows(); track row) {
-+        <tr (click)="onRowSelect(row['id'])">
-+          @for (col of computedColumns(); track col.key) {
-+            <td>{{ row[col.key] }}</td>
-+          }
-+        </tr>
-+      }
-+    </tbody>
-+  </table>
-+</div>
-diff --git a/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.scss b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.scss
-new file mode 100644
-index 0000000..8c8c598
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.scss
-@@ -0,0 +1,52 @@
-+:host {
-+  display: block;
-+  width: 100%;
-+}
-+
-+.origo-data-grid-container {
-+  width: 100%;
-+  overflow-x: auto;
-+  border-radius: var(--origo-radius-sm, 4px);
-+  border: 1px solid var(--origo-color-border-default, #ccc);
-+  background-color: var(--origo-color-surface-background, #fff);
-+  
-+  &.disabled {
-+    opacity: var(--origo-opacity-disabled, 0.5);
-+    pointer-events: none;
-+  }
-+}
-+
-+table {
-+  width: 100%;
-+  border-collapse: collapse;
-+  text-align: start;
-+}
-+
-+th, td {
-+  padding-inline-start: var(--origo-spacing-container-padding, 16px);
-+  padding-inline-end: var(--origo-spacing-container-padding, 16px);
-+  padding-block: 12px;
-+  border-bottom: 1px solid var(--origo-color-border-default, #ccc);
-+  color: var(--origo-color-text-primary, #333);
-+}
-+
-+th {
-+  font-family: var(--origo-typography-input-font-family, inherit);
-+  font-size: var(--origo-typography-input-font-size, 14px);
-+  font-weight: 600;
-+  text-align: start;
-+  
-+  &.sortable {
-+    cursor: pointer;
-+    &:hover {
-+      color: var(--origo-color-focus, #0056b3);
-+    }
-+  }
-+}
-+
-+tr {
-+  cursor: pointer;
-+  &:hover {
-+    background-color: rgba(0, 0, 0, 0.04);
-+  }
-+}
-diff --git a/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.spec.ts b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.spec.ts
-new file mode 100644
-index 0000000..8cfba5f
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.spec.ts
-@@ -0,0 +1,145 @@
-+import { ComponentFixture, TestBed } from '@angular/core/testing';
-+import { DataGridComponent } from './data-grid.component';
-+import { provideZonelessChangeDetection } from '@angular/core';
-+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
-+
-+describe('DataGridComponent', () => {
-+  let component: DataGridComponent;
-+  let fixture: ComponentFixture<DataGridComponent>;
-+  let mockAdapterService: jest.Mocked<WebExperienceAdapterService>;
-+
-+  beforeEach(async () => {
-+    mockAdapterService = {
-+      updateState: jest.fn(),
-+    } as unknown as jest.Mocked<WebExperienceAdapterService>;
-+
-+    await TestBed.configureTestingModule({
-+      imports: [DataGridComponent],
-+      providers: [
-+        provideZonelessChangeDetection(),
-+        { provide: WebExperienceAdapterService, useValue: mockAdapterService },
-+      ],
-+    }).compileComponents();
-+
-+    fixture = TestBed.createComponent(DataGridComponent);
-+    component = fixture.componentInstance;
-+  });
-+
-+  it('should create and render with valid contract', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'grid-1',
-+      type: 'DataGrid',
-+      props: {
-+        columns: [
-+          { key: 'id', label: 'ID', sortable: true },
-+          { key: 'name', label: 'Name' },
-+        ],
-+        rows: [
-+          { id: '1', name: 'Alice' },
-+          { id: '2', name: 'Bob' },
-+        ],
-+        'aria-label': 'Users grid',
-+      },
-+    });
-+    fixture.detectChanges();
-+    expect(component).toBeTruthy();
-+    const host = fixture.nativeElement as HTMLElement;
-+    expect(host.getAttribute('data-testid')).toBe('grid-1');
-+    expect(host.getAttribute('aria-label')).toBe('Users grid');
-+    
-+    // Rows should be rendered
-+    const rows = host.shadowRoot!.querySelectorAll('tbody tr');
-+    expect(rows.length).toBe(2);
-+  });
-+
-+  it('should not crash with null/undefined props', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'grid-err',
-+      type: 'DataGrid',
-+      props: null,
-+    });
-+    expect(() => fixture.detectChanges()).not.toThrow();
-+  });
-+
-+  it('should respect maxItems cap of 100', () => {
-+    const rows = Array.from({ length: 150 }).map((_, i) => ({ id: `row-${i}` }));
-+    fixture.componentRef.setInput('contract', {
-+      id: 'grid-max',
-+      type: 'DataGrid',
-+      props: { rows },
-+    });
-+    fixture.detectChanges();
-+    const renderedRows = (fixture.nativeElement as HTMLElement).shadowRoot!.querySelectorAll('tbody tr');
-+    expect(renderedRows.length).toBe(100);
-+  });
-+
-+  it('should block interaction when disabled', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'grid-disabled',
-+      type: 'DataGrid',
-+      props: {
-+        columns: [{ key: 'id', label: 'ID', sortable: true }],
-+        rows: [{ id: '1' }],
-+        disabled: true,
-+      },
-+    });
-+    fixture.detectChanges();
-+
-+    component.onSort('id');
-+    expect(mockAdapterService.updateState).not.toHaveBeenCalled();
-+
-+    component.onRowSelect('1');
-+    expect(mockAdapterService.updateState).not.toHaveBeenCalled();
-+
-+    component.onPageChange(2);
-+    expect(mockAdapterService.updateState).not.toHaveBeenCalled();
-+  });
-+
-+  it('should handle sorting via updateState', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'grid-sort',
-+      type: 'DataGrid',
-+      props: {
-+        columns: [{ key: 'id', label: 'ID', sortable: true }],
-+        rows: [],
-+      },
-+    });
-+    fixture.detectChanges();
-+
-+    component.onSort('id');
-+    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-sort', 'sortKey', 'id');
-+    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-sort', 'sortDir', 'desc');
-+    
-+    // second click flips direction
-+    component.onSort('id');
-+    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-sort', 'sortDir', 'asc');
-+  });
-+
-+  it('should handle pagination via updateState', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'grid-page',
-+      type: 'DataGrid',
-+      props: { rows: [] },
-+    });
-+    fixture.detectChanges();
-+
-+    component.onPageChange(2);
-+    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-page', 'currentPage', 2);
-+  });
-+
-+  it('should handle row actions and sanitize string values', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'grid-row',
-+      type: 'DataGrid',
-+      props: { rows: [{ id: '1' }] },
-+    });
-+    fixture.detectChanges();
-+
-+    component.onRowSelect('<script>alert(1)</script>');
-+    // It should sanitize the output to avoid dispatching harmful strings
-+    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-row', 'selectedRow', expect.any(String));
-+    // The exact sanitized string depends on angular, but definitely not the script tag if HTML sanitize is used
-+    // Actually `selectedRow` is typically an ID.
-+    // Task 2: "Sanitize string values before dispatch."
-+  });
-+});
-diff --git a/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts
-new file mode 100644
-index 0000000..8a39b7a
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts
-@@ -0,0 +1,102 @@
-+import {
-+  Component,
-+  input,
-+  ChangeDetectionStrategy,
-+  computed,
-+  ViewEncapsulation,
-+  inject,
-+  SecurityContext,
-+  signal,
-+} from '@angular/core';
-+import { DomSanitizer } from '@angular/platform-browser';
-+import { InteractionContract } from '@origo/core';
-+import { OrigoAdapter } from '../../../adapters/web/adapter';
-+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
-+
-+export interface DataGridProps {
-+  columns?: Array<{ key: string; label: string; sortable?: boolean }>;
-+  rows?: Array<Record<string, unknown>>;
-+  pageSize?: number;
-+  currentPage?: number;
-+  totalRows?: number;
-+  disabled?: boolean;
-+  'aria-label'?: string;
-+}
-+
-+@Component({
-+  selector: 'origo-data-grid',
-+  standalone: true,
-+  templateUrl: './data-grid.component.html',
-+  styleUrls: ['./data-grid.component.scss'],
-+  changeDetection: ChangeDetectionStrategy.OnPush,
-+  encapsulation: ViewEncapsulation.ShadowDom,
-+  host: {
-+    '[class.origo-data-grid]': 'true',
-+    '[attr.data-testid]': 'contract().id',
-+    '[attr.aria-label]': 'computedAriaLabel()',
-+  },
-+})
-+export class DataGridComponent implements OrigoAdapter<DataGridProps> {
-+  static readonly contractSchema = {
-+    columns: 'array',
-+    rows: 'array',
-+    pageSize: 'number',
-+    currentPage: 'number',
-+    totalRows: 'number',
-+    disabled: 'boolean',
-+  };
-+  static readonly strictContract = false;
-+
-+  contract = input.required<InteractionContract<DataGridProps>>();
-+
-+  private experienceAdapter = inject(WebExperienceAdapterService);
-+  private sanitizer = inject(DomSanitizer);
-+  
-+  // Track sort direction locally for toggling
-+  private sortDir = signal<'asc' | 'desc'>('asc');
-+
-+  computedColumns = computed(() => {
-+    const cols = this.contract().props?.columns;
-+    return Array.isArray(cols) ? cols.filter(c => c != null && c.key != null && c.label != null) : [];
-+  });
-+
-+  computedRows = computed(() => {
-+    const rows = this.contract().props?.rows;
-+    if (!Array.isArray(rows)) return [];
-+    const validRows = rows.filter(r => r != null);
-+    // Hard cap at 100 to prevent DOM thrashing
-+    return validRows.slice(0, 100);
-+  });
-+
-+  computedDisabled = computed(() => !!this.contract().props?.disabled);
-+  
-+  computedAriaLabel = computed(() => {
-+    const label = this.contract().props?.['aria-label'];
-+    return label !== undefined && label !== null ? String(label) : undefined;
-+  });
-+
-+  onSort(key: string) {
-+    if (this.computedDisabled()) return;
-+    
-+    // Toggle sort dir
-+    const nextDir = this.sortDir() === 'asc' ? 'desc' : 'asc';
-+    this.sortDir.set(nextDir);
-+    
-+    this.experienceAdapter.updateState(this.contract().id, 'sortKey', key);
-+    this.experienceAdapter.updateState(this.contract().id, 'sortDir', nextDir);
-+  }
-+
-+  onPageChange(page: number) {
-+    if (this.computedDisabled()) return;
-+    this.experienceAdapter.updateState(this.contract().id, 'currentPage', page);
-+  }
-+
-+  onRowSelect(rowId: unknown) {
-+    if (this.computedDisabled() || rowId == null) return;
-+    
-+    const rawValue = String(rowId);
-+    const sanitizedValue = this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || '';
-+    
-+    this.experienceAdapter.updateState(this.contract().id, 'selectedRow', sanitizedValue);
-+  }
-+}
-diff --git a/packages/angular-renderer/src/components/primitives/list/list.component.html b/packages/angular-renderer/src/components/primitives/list/list.component.html
-new file mode 100644
-index 0000000..c7c94fe
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/list/list.component.html
-@@ -0,0 +1,18 @@
-+<div class="origo-list-container" [class.disabled]="computedDisabled()">
-+  @for (item of computedItems(); track item) {
-+    <div 
-+      class="origo-list-item" 
-+      role="listitem"
-+      (click)="onItemSelect(item['id'])"
-+    >
-+      <div class="origo-list-item-content">
-+        @if (item['title']) {
-+          <div class="title">{{ item['title'] }}</div>
-+        }
-+        @if (item['subtitle']) {
-+          <div class="subtitle">{{ item['subtitle'] }}</div>
-+        }
-+      </div>
-+    </div>
-+  }
-+</div>
-diff --git a/packages/angular-renderer/src/components/primitives/list/list.component.scss b/packages/angular-renderer/src/components/primitives/list/list.component.scss
-new file mode 100644
-index 0000000..7058c59
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/list/list.component.scss
-@@ -0,0 +1,55 @@
-+:host {
-+  display: block;
-+  width: 100%;
-+}
-+
-+.origo-list-container {
-+  width: 100%;
-+  display: flex;
-+  flex-direction: column;
-+  border-radius: var(--origo-radius-sm, 4px);
-+  border: 1px solid var(--origo-color-border-default, #ccc);
-+  background-color: var(--origo-color-surface-background, #fff);
-+  overflow: hidden;
-+  
-+  &.disabled {
-+    opacity: var(--origo-opacity-disabled, 0.5);
-+    pointer-events: none;
-+  }
-+}
-+
-+.origo-list-item {
-+  display: flex;
-+  padding-inline-start: var(--origo-spacing-container-padding, 16px);
-+  padding-inline-end: var(--origo-spacing-container-padding, 16px);
-+  padding-block: 12px;
-+  border-bottom: 1px solid var(--origo-color-border-default, #ccc);
-+  cursor: pointer;
-+  
-+  &:last-child {
-+    border-bottom: none;
-+  }
-+  
-+  &:hover {
-+    background-color: rgba(0, 0, 0, 0.04);
-+  }
-+}
-+
-+.origo-list-item-content {
-+  display: flex;
-+  flex-direction: column;
-+  gap: 4px;
-+  text-align: start;
-+  color: var(--origo-color-text-primary, #333);
-+  font-family: var(--origo-typography-input-font-family, inherit);
-+  
-+  .title {
-+    font-size: var(--origo-typography-input-font-size, 14px);
-+    font-weight: 600;
-+  }
-+  
-+  .subtitle {
-+    font-size: calc(var(--origo-typography-input-font-size, 14px) * 0.85);
-+    opacity: 0.8;
-+  }
-+}
-diff --git a/packages/angular-renderer/src/components/primitives/list/list.component.spec.ts b/packages/angular-renderer/src/components/primitives/list/list.component.spec.ts
-new file mode 100644
-index 0000000..ae5f2d6
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/list/list.component.spec.ts
-@@ -0,0 +1,112 @@
-+import { ComponentFixture, TestBed } from '@angular/core/testing';
-+import { ListComponent } from './list.component';
-+import { provideZonelessChangeDetection } from '@angular/core';
-+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
-+
-+describe('ListComponent', () => {
-+  let component: ListComponent;
-+  let fixture: ComponentFixture<ListComponent>;
-+  let mockAdapterService: jest.Mocked<WebExperienceAdapterService>;
-+
-+  beforeEach(async () => {
-+    mockAdapterService = {
-+      updateState: jest.fn(),
-+    } as unknown as jest.Mocked<WebExperienceAdapterService>;
-+
-+    await TestBed.configureTestingModule({
-+      imports: [ListComponent],
-+      providers: [
-+        provideZonelessChangeDetection(),
-+        { provide: WebExperienceAdapterService, useValue: mockAdapterService },
-+      ],
-+    }).compileComponents();
-+
-+    fixture = TestBed.createComponent(ListComponent);
-+    component = fixture.componentInstance;
-+  });
-+
-+  it('should create and render with valid contract', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'list-1',
-+      type: 'List',
-+      props: {
-+        items: [
-+          { id: '1', title: 'Item 1' },
-+          { id: '2', title: 'Item 2' },
-+        ],
-+        'aria-label': 'My list',
-+      },
-+    });
-+    fixture.detectChanges();
-+    
-+    expect(component).toBeTruthy();
-+    const host = fixture.nativeElement as HTMLElement;
-+    expect(host.getAttribute('data-testid')).toBe('list-1');
-+    expect(host.getAttribute('role')).toBe('list');
-+    expect(host.getAttribute('aria-label')).toBe('My list');
-+    
-+    const items = host.shadowRoot!.querySelectorAll('.origo-list-item');
-+    expect(items.length).toBe(2);
-+    expect(items[0].getAttribute('role')).toBe('listitem');
-+  });
-+
-+  it('should not crash with null/undefined props', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'list-err',
-+      type: 'List',
-+      props: null,
-+    });
-+    expect(() => fixture.detectChanges()).not.toThrow();
-+  });
-+
-+  it('should respect maxItems cap', () => {
-+    const items = Array.from({ length: 15 }).map((_, i) => ({ id: `item-${i}` }));
-+    fixture.componentRef.setInput('contract', {
-+      id: 'list-max',
-+      type: 'List',
-+      props: { items, maxItems: 10 },
-+    });
-+    fixture.detectChanges();
-+    const renderedItems = (fixture.nativeElement as HTMLElement).shadowRoot!.querySelectorAll('.origo-list-item');
-+    expect(renderedItems.length).toBe(10);
-+  });
-+
-+  it('should default to maxItems cap of 100 if omitted', () => {
-+    const items = Array.from({ length: 150 }).map((_, i) => ({ id: `item-${i}` }));
-+    fixture.componentRef.setInput('contract', {
-+      id: 'list-max-def',
-+      type: 'List',
-+      props: { items },
-+    });
-+    fixture.detectChanges();
-+    const renderedItems = (fixture.nativeElement as HTMLElement).shadowRoot!.querySelectorAll('.origo-list-item');
-+    expect(renderedItems.length).toBe(100);
-+  });
-+
-+  it('should handle item selection via updateState and sanitize value', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'list-select',
-+      type: 'List',
-+      props: { items: [{ id: '1', title: 'One' }] },
-+    });
-+    fixture.detectChanges();
-+
-+    component.onItemSelect('1');
-+    expect(mockAdapterService.updateState).toHaveBeenCalledWith('list-select', 'selectedItem', expect.any(String));
-+  });
-+
-+  it('should block interaction when disabled', () => {
-+    fixture.componentRef.setInput('contract', {
-+      id: 'list-disabled',
-+      type: 'List',
-+      props: {
-+        items: [{ id: '1' }],
-+        disabled: true,
-+      },
-+    });
-+    fixture.detectChanges();
-+
-+    component.onItemSelect('1');
-+    expect(mockAdapterService.updateState).not.toHaveBeenCalled();
-+  });
-+});
-diff --git a/packages/angular-renderer/src/components/primitives/list/list.component.ts b/packages/angular-renderer/src/components/primitives/list/list.component.ts
-new file mode 100644
-index 0000000..eec0ed0
---- /dev/null
-+++ b/packages/angular-renderer/src/components/primitives/list/list.component.ts
-@@ -0,0 +1,78 @@
-+import {
-+  Component,
-+  input,
-+  ChangeDetectionStrategy,
-+  computed,
-+  ViewEncapsulation,
-+  inject,
-+  SecurityContext,
-+} from '@angular/core';
-+import { DomSanitizer } from '@angular/platform-browser';
-+import { InteractionContract } from '@origo/core';
-+import { OrigoAdapter } from '../../../adapters/web/adapter';
-+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
-+
-+export interface ListProps {
-+  items?: Array<Record<string, unknown>>;
-+  maxItems?: number;
-+  disabled?: boolean;
-+  'aria-label'?: string;
-+}
-+
-+@Component({
-+  selector: 'origo-list',
-+  standalone: true,
-+  templateUrl: './list.component.html',
-+  styleUrls: ['./list.component.scss'],
-+  changeDetection: ChangeDetectionStrategy.OnPush,
-+  encapsulation: ViewEncapsulation.ShadowDom,
-+  host: {
-+    '[class.origo-list]': 'true',
-+    '[attr.data-testid]': 'contract().id',
-+    '[attr.role]': '"list"',
-+    '[attr.aria-label]': 'computedAriaLabel()',
-+  },
-+})
-+export class ListComponent implements OrigoAdapter<ListProps> {
-+  static readonly contractSchema = {
-+    items: 'array',
-+    maxItems: 'number',
-+    disabled: 'boolean',
-+  };
-+  static readonly strictContract = false;
-+
-+  contract = input.required<InteractionContract<ListProps>>();
-+
-+  private experienceAdapter = inject(WebExperienceAdapterService);
-+  private sanitizer = inject(DomSanitizer);
-+
-+  computedItems = computed(() => {
-+    const items = this.contract().props?.items;
-+    if (!Array.isArray(items)) return [];
-+    
-+    const validItems = items.filter(i => i != null);
-+    
-+    let max = this.contract().props?.maxItems;
-+    if (typeof max !== 'number' || isNaN(max) || max <= 0) {
-+      max = 100;
-+    }
-+    
-+    return validItems.slice(0, max);
-+  });
-+
-+  computedDisabled = computed(() => !!this.contract().props?.disabled);
-+
-+  computedAriaLabel = computed(() => {
-+    const label = this.contract().props?.['aria-label'];
-+    return label !== undefined && label !== null ? String(label) : undefined;
-+  });
-+
-+  onItemSelect(itemId: unknown) {
-+    if (this.computedDisabled() || itemId == null) return;
-+    
-+    const rawValue = String(itemId);
-+    const sanitizedValue = this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || '';
-+    
-+    this.experienceAdapter.updateState(this.contract().id, 'selectedItem', sanitizedValue);
-+  }
-+}
-diff --git a/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts b/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
-index 3ac91a1..03586de 100644
---- a/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
-+++ b/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
-@@ -158,4 +158,55 @@ test.describe('Primitives Accessibility', () => {
-     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
-     expect(accessibilityScanResults.violations).toEqual([]);
-   });
-+
-+  test('DataGrid should not have any automatically detectable accessibility issues', async ({
-+    page,
-+  }) => {
-+    await page.setContent(`
-+      <main>
-+        <div id="host"></div>
-+        <script>
-+          const host = document.getElementById('host');
-+          const shadow = host.attachShadow({mode: 'open'});
-+          shadow.innerHTML = '<div class="origo-data-grid-container"><table aria-label="Data Grid"><thead><tr><th aria-sort="ascending">Col 1</th></tr></thead><tbody><tr><td>Val 1</td></tr></tbody></table></div>';
-+        </script>
-+      </main>
-+    `);
-+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
-+    expect(accessibilityScanResults.violations).toEqual([]);
-+  });
-+
-+  test('List should not have any automatically detectable accessibility issues', async ({
-+    page,
-+  }) => {
-+    await page.setContent(`
-+      <main>
-+        <div id="host"></div>
-+        <script>
-+          const host = document.getElementById('host');
-+          const shadow = host.attachShadow({mode: 'open'});
-+          shadow.innerHTML = '<div class="origo-list-container" role="list" aria-label="List items"><div class="origo-list-item" role="listitem">Item</div></div>';
-+        </script>
-+      </main>
-+    `);
-+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
-+    expect(accessibilityScanResults.violations).toEqual([]);
-+  });
-+
-+  test('Card should not have any automatically detectable accessibility issues', async ({
-+    page,
-+  }) => {
-+    await page.setContent(`
-+      <main>
-+        <div id="host"></div>
-+        <script>
-+          const host = document.getElementById('host');
-+          const shadow = host.attachShadow({mode: 'open'});
-+          shadow.innerHTML = '<div class="origo-card-container"><div class="origo-card-image"><img src="test.png" alt="Test image"/></div><div class="origo-card-content"><div class="origo-card-title">Card</div></div></div>';
-+        </script>
-+      </main>
-+    `);
-+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
-+    expect(accessibilityScanResults.violations).toEqual([]);
-+  });
- });
-diff --git a/packages/angular-renderer/src/index.ts b/packages/angular-renderer/src/index.ts
-index ea9dd66..b441af5 100644
---- a/packages/angular-renderer/src/index.ts
-+++ b/packages/angular-renderer/src/index.ts
-@@ -14,3 +14,6 @@ export * from './components/primitives/hbox/hbox.component';
- export * from './components/primitives/label/label.component';
- export * from './components/primitives/form-field/form-field.component';
- export * from './lib/primitives.provider';
-+export * from './components/primitives/data-grid/data-grid.component';
-+export * from './components/primitives/list/list.component';
-+export * from './components/primitives/card/card.component';
-diff --git a/packages/angular-renderer/src/lib/primitives.provider.ts b/packages/angular-renderer/src/lib/primitives.provider.ts
-index 8204b7a..02c7566 100644
---- a/packages/angular-renderer/src/lib/primitives.provider.ts
-+++ b/packages/angular-renderer/src/lib/primitives.provider.ts
-@@ -7,6 +7,9 @@ import { TextareaComponent } from '../components/primitives/textarea/textarea.co
- import { HBoxComponent } from '../components/primitives/hbox/hbox.component';
- import { LabelComponent } from '../components/primitives/label/label.component';
- import { FormFieldComponent } from '../components/primitives/form-field/form-field.component';
-+import { DataGridComponent } from '../components/primitives/data-grid/data-grid.component';
-+import { ListComponent } from '../components/primitives/list/list.component';
-+import { CardComponent } from '../components/primitives/card/card.component';
- 
- export function provideOrigo9Primitives(): EnvironmentProviders {
-   return makeEnvironmentProviders([
-@@ -20,6 +23,9 @@ export function provideOrigo9Primitives(): EnvironmentProviders {
-         m.set('HBox', HBoxComponent);
-         m.set('Label', LabelComponent);
-         m.set('FormField', FormFieldComponent);
-+        m.set('DataGrid', DataGridComponent);
-+        m.set('List', ListComponent);
-+        m.set('Card', CardComponent);
-         return m;
-       },
-       deps: [RENDERER_REGISTRY],
-diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
-index 1a6fe0a..076e8a4 100644
---- a/tools/test-registry/test-registry.yaml
-+++ b/tools/test-registry/test-registry.yaml
-@@ -465,3 +465,40 @@ test_cases:
-       - retro-8-harden-test-isolation
-     last_result: unknown
-     results: {}
-+  - id: renderer-primitive-data-grid
-+    description: 'Verifies DataGrid primitive rendering and logic'
-+    package: '@origo/angular-renderer'
-+    spec_file: packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.spec.ts
-+    type: unit
-+    affected_stories:
-+      - 9-2-data-presentation-primitives-batch-2
-+    last_result: unknown
-+    results: {}
-+  - id: renderer-primitive-list
-+    description: 'Verifies List primitive rendering and logic'
-+    package: '@origo/angular-renderer'
-+    spec_file: packages/angular-renderer/src/components/primitives/list/list.component.spec.ts
-+    type: unit
-+    affected_stories:
-+      - 9-2-data-presentation-primitives-batch-2
-+    last_result: unknown
-+    results: {}
-+  - id: renderer-primitive-card
-+    description: 'Verifies Card primitive rendering'
-+    package: '@origo/angular-renderer'
-+    spec_file: packages/angular-renderer/src/components/primitives/card/card.component.spec.ts
-+    type: unit
-+    affected_stories:
-+      - 9-2-data-presentation-primitives-batch-2
-+    last_result: unknown
-+    results: {}
-+  - id: renderer-primitives-a11y
-+    description: 'Verifies accessibility of all primitives via axe'
-+    package: '@origo/angular-renderer'
-+    spec_file: packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
-+    type: e2e
-+    affected_stories:
-+      - 9-1-form-layout-primitives-batch-1
-+      - 9-2-data-presentation-primitives-batch-2
-+    last_result: unknown
-+    results: {}
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index e4929dd..7570b39 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -1,5 +1,5 @@
 # generated: 2026-07-29T21:46:02.464968
-# last_updated: 2026-09-22T20:07:00+05:30
+# last_updated: 2026-09-23T21:54:00+05:30
 # project: origo-design
 # project_key: NOKEY
 # tracking_system: file-system
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-07-29T21:46:02.464968
-last_updated: 2026-09-22T21:56:00+05:30
+last_updated: 2026-09-24T14:47:00+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -115,7 +115,7 @@ development_status:
   9-2-data-presentation-primitives-batch-2: done
   9-3-navigation-shell-primitives-batch-3: done
   9-4-accessibility-localization-enforcement: done
-  9-5-advanced-form-primitives-batch-4: backlog
+  9-5-advanced-form-primitives-batch-4: in-progress
   epic-9-retrospective: optional
   epic-10: backlog
   10-1-10-minute-quickstart-guide: backlog
diff --git a/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts b/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
index 14092b3..a0394a2 100644
--- a/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
+++ b/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
@@ -276,4 +276,107 @@ test.describe('Primitives Accessibility', () => {
     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
     expect(accessibilityScanResults.violations).toEqual([]);
   });
+  // Story 9.5 — Switch primitive
+  test('Switch should not have any automatically detectable accessibility issues (default)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="false" /> Notifications</label>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Switch should not have any automatically detectable accessibility issues (checked)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="true" checked /> Notifications</label>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Switch should not have any automatically detectable accessibility issues (disabled)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="false" disabled /> Notifications</label>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  // Story 9.5 — Chip primitive
+  test('Chip should not have any automatically detectable accessibility issues (default)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<button type="button" class="origo-chip" aria-pressed="false">Angular</button>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Chip should not have any automatically detectable accessibility issues (selected)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<button type="button" class="origo-chip origo-chip--selected" aria-pressed="true">Angular</button>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
+
+  test('Chip should not have any automatically detectable accessibility issues (disabled)', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<button type="button" class="origo-chip" aria-pressed="false" disabled>Angular</button>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
 });
diff --git a/packages/angular-renderer/src/lib/primitives.provider.ts b/packages/angular-renderer/src/lib/primitives.provider.ts
index a38a0dd..2f46856 100644
--- a/packages/angular-renderer/src/lib/primitives.provider.ts
+++ b/packages/angular-renderer/src/lib/primitives.provider.ts
@@ -13,7 +13,8 @@ import { CardComponent } from '../components/primitives/card/card.component';
 import { SidebarComponent } from '../components/primitives/sidebar/sidebar.component';
 import { TabsComponent } from '../components/primitives/tabs/tabs.component';
 import { BreadcrumbsComponent } from '../components/primitives/breadcrumbs/breadcrumbs.component';
-
+import { SwitchComponent } from '../components/primitives/switch/switch.component';
+import { ChipComponent } from '../components/primitives/chip/chip.component';
 export function provideOrigo9Primitives(): EnvironmentProviders {
   return makeEnvironmentProviders([
     {
@@ -33,6 +34,8 @@ export function provideOrigo9Primitives(): EnvironmentProviders {
         m.set('Tabs', TabsComponent);
         m.set('Breadcrumbs', BreadcrumbsComponent);
         m.set('Navigation', SidebarComponent);
+        m.set('Switch', SwitchComponent);
+        m.set('Chip', ChipComponent);
         return m;
       },
       deps: [RENDERER_REGISTRY],
diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
index 6ab4268..9c5b3f9 100644
--- a/tools/test-registry/test-registry.yaml
+++ b/tools/test-registry/test-registry.yaml
@@ -545,5 +545,24 @@ test_cases:
       - 9-2-data-presentation-primitives-batch-2
       - 9-3-navigation-shell-primitives-batch-3
       - 9-4-accessibility-localization-enforcement
+      - 9-5-advanced-form-primitives-batch-4
+    last_result: unknown
+    results: {}
+  - id: renderer-primitive-switch
+    description: 'Verifies Switch primitive rendering and logic'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts
+    type: unit
+    affected_stories:
+      - 9-5-advanced-form-primitives-batch-4
+    last_result: unknown
+    results: {}
+  - id: renderer-primitive-chip
+    description: 'Verifies Chip primitive rendering and logic'
+    package: '@origo/angular-renderer'
+    spec_file: packages/angular-renderer/src/components/primitives/chip/chip.component.spec.ts
+    type: unit
+    affected_stories:
+      - 9-5-advanced-form-primitives-batch-4
     last_result: unknown
     results: {}

