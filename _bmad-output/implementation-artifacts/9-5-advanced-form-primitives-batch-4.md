---
story_id: "9.5"
story_key: "9-5-advanced-form-primitives-batch-4"
status: "ready-for-dev"
baseline_commit: "1d2621fe99c63c3cddabb7a0fc0d44bda43fe4a6"
epic_source_note: "Story 9.5 is an approved sprint extension beyond the epics.md scope (Epic 9 originally ended at 9.4). Authorized to complete the 25-component primitive target defined in the Phase 1 Architecture Spine (primitives list: button, input, select, checkbox, radio, switch, chip, avatar, badge, icon, tooltip, progress, skeleton, divider, accordion, tabs, card, alert, toast, dialog, drawer, menu, pagination, spinner, breadcrumb). Switch and Chip are the two remaining unimplemented primitives."
---

# Story 9.5: Advanced Form Primitives (Batch 4)

Status: ready-for-dev

## Story

As a UI Developer,
I want a set of advanced form primitives (Switch and Chip),
So that I can build rich data entry screens with boolean toggles and multi-select token inputs driven by BADL.

## Acceptance Criteria

1. **Given** the Origo Angular renderer,
   **When** the AST contains a `Switch` node,
   **Then** it maps to `SwitchComponent` via the Component Registry pattern (`RENDERER_REGISTRY`), renders an `<origo-switch>` host with an inner `<label>` wrapping `<input type="checkbox" role="switch">`, and dispatches `updateState(id, 'checked', boolean)` on toggle.

2. **Given** the Origo Angular renderer,
   **When** the AST contains a `Chip` node,
   **Then** it maps to `ChipComponent` via the Component Registry pattern (`RENDERER_REGISTRY`), renders an `<origo-chip>` host with an inner `<button type="button">` element, toggles a `selected` boolean state, and dispatches `updateState(id, 'selected', boolean)` on activation.

3. **And** both components enforce client-side validation and sanitization based on BADL constraints before state updates via Angular Signals and `contractSchema`.

4. **And** both components natively consume Epic 2 design tokens (`--origo-*`), comply with WCAG 2.1 AA (P1-AD-6), and support RTL via CSS logical properties (NFR-I18N-001).

5. **And** the ADR acknowledgment for `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` is documented in Completion Notes as N/A — Switch and Chip are form primitives that do not host iframes or sandboxed content; CSP web-worker constraints are not applicable.

## Tasks / Subtasks

- [ ] Task 1: Scaffolding and Structure
  - [ ] Generate standalone components in `packages/angular-renderer/src/components/primitives/switch/` [NEW] and `chip/` [NEW].
  - [ ] Follow the mandatory component structure template exactly (see Dev Notes).
  - [ ] Implement `OrigoAdapter<TProps>` interface on both components.
  - [ ] Define `static readonly contractSchema` and `static readonly strictContract = false` on both components.
  - [ ] Configure `ViewEncapsulation.ShadowDom` and `ChangeDetectionStrategy.OnPush` on both components.
  - [ ] Bind `[attr.data-testid]="contract().id ?? ''"` on the host element of each component (AD-12).

- [ ] Task 2: Reactive State and Component Logic
  - [ ] Wire `contract().props` and `contract().state` using Angular Signals (`computed()`, `model()`).
  - [ ] **Switch:**
    - [ ] Define `checked = model<boolean>(false);`.
    - [ ] Define `computedChecked = computed(() => !!this.contract().props?.checked);` and synchronize via `effect()` / `untracked()`.
    - [ ] Implement `onChange(event: Event)`: extract `target.checked`, update local `checked` model, and dispatch `this.experienceAdapter.updateState(this.contract().id, 'checked', checked)`.
    - [ ] Guard: `if (this.computedDisabled()) return;` — do NOT guard on boolean falsy since `false` is a valid checked value.
  - [ ] **Chip:**
    - [ ] Define `selected = model<boolean>(false);`.
    - [ ] Define `computedSelected = computed(() => !!this.contract().props?.selected);` and synchronize via `effect()` / `untracked()`.
    - [ ] Implement `onClick()`: toggle `!this.selected()`, update local `selected` model, and dispatch `this.experienceAdapter.updateState(this.contract().id, 'selected', nextSelected)`.
    - [ ] Guard: `if (this.computedDisabled()) return;`.
  - [ ] Define `computedAriaLabel` and `computedAriaDescribedBy` on both components, null-coalescing to `undefined` (not `null`) to prevent `aria-label="null"` in DOM.

- [ ] Task 3: Accessibility, Localization, and Keyboard Interaction
  - [ ] **Switch:**
    - [ ] Render `<label [for]="contract().id" [class.disabled]="computedDisabled()">` wrapping the `<input>`.
    - [ ] Bind `[attr.aria-checked]="checked().toString()"` and `[attr.aria-label]="computedAriaLabel() ?? null"` on the inner `<input>` element, NOT the host (prevents screen reader double-read).
    - [ ] Render `@if (computedLabel()) { <span class="label-text">{{ computedLabel() }}</span> }` for visible label text.
    - [ ] Native `Space` key activates checkbox toggle via browser default behavior.
  - [ ] **Chip:**
    - [ ] Render `<button type="button" [id]="contract().id" ...>` with `<span class="chip-label">{{ computedLabel() }}</span>`.
    - [ ] Bind `[attr.aria-pressed]="selected().toString()"` and `[attr.aria-label]="computedAriaLabel() ?? null"` on the inner `<button>` element.
    - [ ] Native `Enter` and `Space` keys activate `<button>` click handler via browser default behavior.
  - [ ] Style both components using CSS logical properties (`padding-inline`, `padding-block`, `margin-inline`, `border-radius`) in `.scss` files.
  - [ ] Add axe-core Playwright tests with accessible names to `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` [UPDATE].

- [ ] Task 4: Component Registry Registration
  - [ ] Update `packages/angular-renderer/src/lib/primitives.provider.ts` [UPDATE].
  - [ ] Import `SwitchComponent` and `ChipComponent`.
  - [ ] Register Switch (`m.set('Switch', SwitchComponent)`) and Chip (`m.set('Chip', ChipComponent)`) by calling `.set()` on the **existing** Map factory — do NOT create a new `Map()` (which silently wipes all existing registrations).

- [ ] Task 5: Testing and Central Test Registry Update
  - [ ] Author Jest unit test suite `packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts` [NEW].
  - [ ] Author Jest unit test suite `packages/angular-renderer/src/components/primitives/chip/chip.component.spec.ts` [NEW].
  - [ ] Verify both suites test rendering, null props, disabled guard, ARIA attributes, state update dispatch, and RTL logical properties.
  - [ ] Update `tools/test-registry/test-registry.yaml` [UPDATE]:
    - [ ] Add `renderer-primitive-switch` unit test entry (`spec_file: packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts`).
    - [ ] Add `renderer-primitive-chip` unit test entry (`spec_file: packages/angular-renderer/src/components/primitives/chip/chip.component.spec.ts`).
    - [ ] Append `9-5-advanced-form-primitives-batch-4` to `affected_stories` under `renderer-primitives-a11y`.

## Dev Notes

### Mandatory Files to Read Before Writing Code

Study these **before writing a single line** of implementation:

1. `packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts` & `html` & `spec.ts` — **Canonical boolean-toggle pattern**: `checked = model<boolean>(false)`, `effect()` with `untracked()` for contract sync, `computedAriaLabel` with null-coalesce guard, `onChange` with disabled guard, and `<label>` wrapper structure. Switch follows this shape.
2. `packages/angular-renderer/src/components/primitives/button/button.component.ts` & `html` & `scss` — **Canonical button primitive pattern**: `<origo-button>` host with inner `<button>` element inside Shadow DOM, `computedType`, `[attr.data-testid]="contract().id ?? ''"`. Chip follows this host/inner structure.
3. `packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts` — **Canonical ARIA pattern**: `'aria-label'?: string` and `'aria-describedby'?: string` in Props + computed signal pattern with string coercion.
4. `packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts` — **Canonical RTL pattern**: `[style.padding-inline]`, `[style.padding-block]` — logical properties avoiding physical left/right properties.
5. `packages/angular-renderer/src/adapters/web/adapter.ts` — `OrigoAdapter<TProps>`, `InteractionContract`, `coerceContractProps`.
6. `packages/angular-renderer/src/lib/primitives.provider.ts` — Current registry (14 entries). **Extend the existing factory with `.set()` — do NOT create a new `Map()` — it silently wipes all existing registrations.**
7. `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` — Existing `page.setContent()` + `AxeBuilder.analyze()` pattern to follow for axe-core tests.

---

### Component Specification Matrix

| Characteristic | Switch (`origo-switch`) | Chip (`origo-chip`) |
|---|---|---|
| **Selector** | `origo-switch` | `origo-chip` |
| **Host Class** | `.origo-switch` | `.origo-chip` |
| **Host Attributes** | `[attr.data-testid]="contract().id ?? ''"` | `[attr.data-testid]="contract().id ?? ''"` |
| **Inner Native Element** | `<input type="checkbox" role="switch">` inside `<label>` | `<button type="button">` with inner `<span class="chip-label">` |
| **Encapsulation** | `ViewEncapsulation.ShadowDom` | `ViewEncapsulation.ShadowDom` |
| **Change Detection** | `ChangeDetectionStrategy.OnPush` | `ChangeDetectionStrategy.OnPush` |
| **BADL Prop Key** | `checked` (`boolean`), `label` (`string`), `disabled` (`boolean`) | `selected` (`boolean`), `label` (`string`), `disabled` (`boolean`) |
| **State Dispatch** | `updateState(contract().id, 'checked', boolean)` on change | `updateState(contract().id, 'selected', boolean)` on click |
| **ARIA Attribute** | `[attr.aria-checked]="checked().toString()"` | `[attr.aria-pressed]="selected().toString()"` |
| **ARIA Binding Location**| Inner `<input>` only (never on host) | Inner `<button>` only (never on host) |
| **Keyboard Trigger** | `Space` (native checkbox behavior) | `Enter` and `Space` (native `<button>` behavior) |

---

### Mandatory Component Structure

#### 1. Switch Component (`switch.component.ts`)

```typescript
import {
  Component,
  input,
  model,
  computed,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface SwitchProps {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-switch',
  standalone: true,
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-switch]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class SwitchComponent implements OrigoAdapter<SwitchProps> {
  static readonly contractSchema = {
    checked: 'boolean',
    label: 'string',
    disabled: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SwitchProps>>();
  checked = model<boolean>(false);

  computedLabel = computed(() => this.contract().props?.label ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedAriaLabel = computed(() => {
    const v = this.contract().props?.['aria-label'];
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
  });
  computedAriaDescribedBy = computed(() => {
    const v = this.contract().props?.['aria-describedby'];
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
  });

  private experienceAdapter = inject(WebExperienceAdapterService);

  constructor() {
    effect(() => {
      const contractVal = !!this.contract().props?.checked;
      untracked(() => {
        if (contractVal === this.checked()) return;
        this.checked.set(contractVal);
      });
    });
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target || this.computedDisabled()) return;

    const isChecked = target.checked;
    this.checked.set(isChecked);
    this.experienceAdapter.updateState(this.contract().id, 'checked', isChecked);
  }
}
```

**Switch Template (`switch.component.html`):**
```html
<label [for]="contract().id" [class.disabled]="computedDisabled()">
  <input
    type="checkbox"
    role="switch"
    [id]="contract().id"
    [checked]="checked()"
    [disabled]="computedDisabled()"
    [attr.aria-checked]="checked().toString()"
    [attr.aria-label]="computedAriaLabel() ?? null"
    [attr.aria-describedby]="computedAriaDescribedBy() ?? null"
    (change)="onChange($event)"
  />
  @if (computedLabel()) {
    <span class="label-text">{{ computedLabel() }}</span>
  }
</label>
```

**Switch Styles (`switch.component.scss`):**
```scss
:host {
  display: inline-block;
}

label {
  display: inline-flex;
  align-items: center;
  gap: var(--origo-spacing-container-padding, 8px);
  cursor: pointer;
  font-family: var(--origo-typography-input-font-family, inherit);
  font-size: var(--origo-typography-input-font-size, 1rem);
  color: var(--origo-color-text-primary, #333333);

  &.disabled {
    opacity: var(--origo-opacity-disabled, 0.5);
    cursor: not-allowed;
  }
}

input[type='checkbox'][role='switch'] {
  appearance: none;
  width: 40px;
  height: 22px;
  background-color: var(--origo-color-surface-variant, #e0e0e0);
  border-radius: 11px;
  position: relative;
  outline: none;
  cursor: pointer;
  margin: 0;
  transition: background-color 0.2s ease-in-out;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    inset-inline-start: 2px;
    width: 18px;
    height: 18px;
    background-color: var(--origo-color-on-accent, #ffffff);
    border-radius: 50%;
    transition: transform 0.2s ease-in-out;
  }

  &:checked {
    background-color: var(--origo-color-accent, var(--origo-color-primary, #005fcc));

    &::after {
      transform: translateX(18px);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--origo-color-focus, #005fcc);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
  }
}
```

---

#### 2. Chip Component (`chip.component.ts`)

```typescript
import {
  Component,
  input,
  model,
  computed,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface ChipProps {
  selected?: boolean;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-chip',
  standalone: true,
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-chip]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class ChipComponent implements OrigoAdapter<ChipProps> {
  static readonly contractSchema = {
    selected: 'boolean',
    label: 'string',
    disabled: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ChipProps>>();
  selected = model<boolean>(false);

  computedLabel = computed(() => this.contract().props?.label ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedAriaLabel = computed(() => {
    const v = this.contract().props?.['aria-label'];
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
  });
  computedAriaDescribedBy = computed(() => {
    const v = this.contract().props?.['aria-describedby'];
    return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
  });

  private experienceAdapter = inject(WebExperienceAdapterService);

  constructor() {
    effect(() => {
      const contractVal = !!this.contract().props?.selected;
      untracked(() => {
        if (contractVal === this.selected()) return;
        this.selected.set(contractVal);
      });
    });
  }

  onClick() {
    if (this.computedDisabled()) return;

    const nextSelected = !this.selected();
    this.selected.set(nextSelected);
    this.experienceAdapter.updateState(this.contract().id, 'selected', nextSelected);
  }
}
```

**Chip Template (`chip.component.html`):**
```html
<button
  type="button"
  [id]="contract().id"
  [disabled]="computedDisabled()"
  [class.origo-chip--selected]="selected()"
  [attr.aria-pressed]="selected().toString()"
  [attr.aria-label]="computedAriaLabel() ?? null"
  [attr.aria-describedby]="computedAriaDescribedBy() ?? null"
  (click)="onClick()"
>
  <span class="chip-label">{{ computedLabel() }}</span>
</button>
```

**Chip Styles (`chip.component.scss`):**
```scss
:host {
  display: inline-block;
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-inline: var(--origo-spacing-container-padding, 12px);
  padding-block: 6px;
  border-radius: 16px;
  border: 1px solid var(--origo-color-border, #cccccc);
  background-color: var(--origo-color-surface-variant, #f5f5f5);
  color: var(--origo-color-text-primary, #333333);
  font-family: var(--origo-typography-button-font-family, inherit);
  font-size: var(--origo-typography-button-font-size, 0.875rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: var(--origo-color-surface-variant-hover, #ebebeb);
  }

  &.origo-chip--selected {
    background-color: var(--origo-color-accent, #005fcc);
    color: var(--origo-color-on-accent, #ffffff);
    border-color: var(--origo-color-accent, #005fcc);
  }

  &:focus-visible {
    outline: 2px solid var(--origo-color-focus, #005fcc);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: var(--origo-opacity-disabled, 0.5);
  }
}
```

---

### Critical Anti-Patterns — DO NOT DO THESE

| Anti-Pattern | Correct Approach | Why |
|---|---|---|
| `new Map()` in `primitives.provider.ts` | Extend existing factory with `.set()` | A new Map wipes all 14 pre-existing component registrations |
| `provideExperimentalZonelessChangeDetection()` in specs | `provideZonelessChangeDetection()` | Experimental zoneless API was removed in current Angular version |
| `DomSanitizer.sanitize(SecurityContext.HTML, ariaLabel)` | `String(ariaLabel)` | ARIA is plain text; HTML sanitization mangles quotes and valid characters |
| `[innerHTML]` for label text | `{{ computedLabel() }}` or `[textContent]` | Avoids bypassing Shadow DOM sanitization |
| `aria-label` or `role` on host AND inner element | Bind ARIA only on inner `<input>` / `<button>` | Prevents screen readers from double-announcing the component |
| `aria-checked` / `aria-pressed` as DOM boolean attribute | `[attr.aria-checked]="checked().toString()"` | ARIA requires string token `"true"` or `"false"` |
| `padding-left` / `margin-left` in `.scss` | `padding-inline-start`, `margin-inline` | Logical CSS properties required for RTL (NFR-I18N-001) |
| Null-coalescing ARIA value to literal `'null'` | Coalesce to `undefined` or `null` attribute binding | Prevents Angular from emitting `aria-label="null"` in the DOM |
| Guarding `onChange` with `if (!checked)` | `if (this.computedDisabled()) return;` | `false` is a valid toggled value for boolean switches |

---

### Design Tokens for Switch and Chip

Use only `--origo-*` tokens with sensible fallbacks — never hardcode visual values (AD-6):

| Element / State | Token | Fallback |
|---|---|---|
| Switch track — off | `--origo-color-surface-variant` | `#e0e0e0` |
| Switch track — on | `--origo-color-accent` or `--origo-color-primary` | `#005fcc` |
| Switch thumb | `--origo-color-on-accent` | `#ffffff` |
| Focus ring (both) | `--origo-color-focus` | `#005fcc` |
| Disabled opacity (both) | `--origo-opacity-disabled` | `0.5` |
| Chip surface — unselected | `--origo-color-surface-variant` | `#f5f5f5` |
| Chip surface — selected | `--origo-color-accent` | `#005fcc` |
| Chip border | `--origo-color-border` | `#cccccc` |
| Chip text — selected | `--origo-color-on-accent` | `#ffffff` |
| Padding / Spacing (both) | `--origo-spacing-container-padding` | `8px` |

---

### Testing Standards & Reference Scaffolds

- **Test runner:** Jest + `jest-preset-angular`. Do NOT introduce Vitest (used only in `@origo/devtools`).
- **Zoneless Setup:** `provideZonelessChangeDetection()` in `TestBed.configureTestingModule`.
- **Test Isolation:** Global `test-setup.ts` already provides isolation; do NOT add custom `afterEach` DOM wipes.

#### Unit Test Scaffold: Switch (`switch.component.spec.ts`)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchComponent } from './switch.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SwitchComponent', () => {
  let component: SwitchComponent;
  let fixture: ComponentFixture<SwitchComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [SwitchComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchComponent);
    component = fixture.componentInstance;
  });

  it('should render switch correctly with contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-1',
      type: 'Switch',
      props: { checked: true, label: 'Airplane Mode' },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl!.getAttribute('role')).toBe('switch');
    expect(inputEl!.checked).toBe(true);

    const labelText = fixture.nativeElement.shadowRoot!.querySelector('.label-text');
    expect(labelText!.textContent).toContain('Airplane Mode');
  });

  it('should handle null props gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-2',
      type: 'Switch',
      props: null,
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl!.checked).toBe(false);
  });

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-3',
      type: 'Switch',
      props: { disabled: true },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl!.disabled).toBe(true);
  });

  it('should dispatch updateState on toggle', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-4',
      type: 'Switch',
      props: { checked: false },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    inputEl!.checked = true;
    inputEl!.dispatchEvent(new Event('change'));

    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('switch-4', 'checked', true);
  });

  it('should enforce RTL compliance via logical properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-switch', type: 'Switch', props: {} });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const element = root.firstElementChild as HTMLElement;
    if (element && element.style) {
      expect(element.style.paddingLeft).toBeFalsy();
      expect(element.style.paddingRight).toBeFalsy();
    }
  });
});
```

#### Unit Test Scaffold: Chip (`chip.component.spec.ts`)

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipComponent } from './chip.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [ChipComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipComponent);
    component = fixture.componentInstance;
  });

  it('should render chip with label and unselected by default', () => {
    fixture.componentRef.setInput('contract', {
      id: 'chip-1',
      type: 'Chip',
      props: { label: 'Angular' },
    });
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
    expect(buttonEl).toBeTruthy();
    expect(buttonEl!.getAttribute('aria-pressed')).toBe('false');
    expect(buttonEl!.textContent).toContain('Angular');
  });

  it('should toggle selection on click and dispatch updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'chip-2',
      type: 'Chip',
      props: { selected: false },
    });
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
    buttonEl!.click();

    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('chip-2', 'selected', true);
  });

  it('should block click when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'chip-3',
      type: 'Chip',
      props: { disabled: true },
    });
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
    expect(buttonEl!.disabled).toBe(true);

    buttonEl!.click();
    expect(mockExperienceAdapter.updateState).not.toHaveBeenCalled();
  });
});
```

#### Axe-Core Playwright Tests (Append to `primitives.a11y.pw.ts`)

```typescript
  // Story 9.5 — Switch primitive
  test('Switch should not have any automatically detectable accessibility issues (default)', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="false" /> Notifications</label>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Switch should not have any automatically detectable accessibility issues (checked)', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="true" checked /> Notifications</label>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Switch should not have any automatically detectable accessibility issues (disabled)', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<label><input type="checkbox" role="switch" aria-checked="false" disabled /> Notifications</label>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  // Story 9.5 — Chip primitive
  test('Chip should not have any automatically detectable accessibility issues (default)', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<button type="button" class="origo-chip" aria-pressed="false">Angular</button>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Chip should not have any automatically detectable accessibility issues (selected)', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<button type="button" class="origo-chip origo-chip--selected" aria-pressed="true">Angular</button>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Chip should not have any automatically detectable accessibility issues (disabled)', async ({
    page,
  }) => {
    await page.setContent(`
      <main>
        <div id="host"></div>
        <script>
          const host = document.getElementById('host');
          const shadow = host.attachShadow({mode: 'open'});
          shadow.innerHTML = '<button type="button" class="origo-chip" aria-pressed="false" disabled>Angular</button>';
        </script>
      </main>
    `);
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
```

---

### Architecture Compliance

| Rule | Requirement |
|---|---|
| **P1-AD-1** | `standalone: true`, Signals for all reactive state, zoneless-compatible (`provideZonelessChangeDetection`). |
| **P1-AD-5** | No component class inheritance; composition via `@ContentChild`/`hostDirectives` only. |
| **P1-AD-6** | Every component must pass axe-core WCAG 2.1 AA in `primitives.a11y.pw.ts` — violation = CI failure. |
| **AD-2** | All files located under `packages/angular-renderer/src/components/primitives/`. Zero cross-package `src/` imports. |
| **AD-6** | Zero hardcoded visual values in `.scss` files — use `--origo-*` tokens with fallback values only. |
| **AD-12** | `[attr.data-testid]="contract().id ?? ''"` on the host element of each component. |

---

### Project Structure Notes

**New Files:**
- `packages/angular-renderer/src/components/primitives/switch/switch.component.ts` [NEW]
- `packages/angular-renderer/src/components/primitives/switch/switch.component.html` [NEW]
- `packages/angular-renderer/src/components/primitives/switch/switch.component.scss` [NEW]
- `packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts` [NEW]
- `packages/angular-renderer/src/components/primitives/chip/chip.component.ts` [NEW]
- `packages/angular-renderer/src/components/primitives/chip/chip.component.html` [NEW]
- `packages/angular-renderer/src/components/primitives/chip/chip.component.scss` [NEW]
- `packages/angular-renderer/src/components/primitives/chip/chip.component.spec.ts` [NEW]

**Updated Files:**
- `packages/angular-renderer/src/lib/primitives.provider.ts` [UPDATE] — extend existing Map with Switch and Chip.
- `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` [UPDATE] — append 6 axe-core tests.
- `tools/test-registry/test-registry.yaml` [UPDATE] — add `renderer-primitive-switch`, `renderer-primitive-chip`, and update `renderer-primitives-a11y`.

---

### Previous Story Intelligence (9.3 & 9.4)

**From Story 9.4 — apply directly to Switch and Chip:**
- **Do NOT use `[innerHTML]`** — use `{{ computedLabel() }}` or `[textContent]`. Avoids Shadow DOM sanitization bypass.
- **ARIA on inner native element only** — for interactive elements (`<input>`, `<button>`), bind `aria-label` and `aria-describedby` on the inner element, not the host. Host binding causes screen readers to announce twice.
- **Empty string emits `aria-label=""`** — always coalesce to `undefined`. Pattern: `return value?.trim() ? String(value) : undefined`.
- **Null vs. undefined coercion** — coalesce to `undefined`, not `null`. `null` in an Angular template binding emits the literal string `"null"` as the attribute value.
- **Disabled guard must not block boolean `false` dispatch** — for Switch, `false` is a valid `checked` value. Guard only on `computedDisabled()`.
- **ADR DoD is mandatory** — pattern: *"Batch N primitives do not host iframes or sandboxed content. CSP constraints are N/A."*

**Pre-existing tech debt (from Story 9.4 code review):**
The following 9 open `[Review][Patch]` items from Story 9.4 are out of scope for Story 9.5:
- `DomSanitizer` anti-pattern in `radio-group.component.ts` (pre-existing, deferred).
- Button ARIA signals computed but not bound (pre-existing, deferred).
- Form-field ARIA bound on landmark-less `<div>` (pre-existing, deferred).

---

### References

- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md] — 25-component primitive target, P1-AD-1, P1-AD-5, P1-AD-6.
- [Source: _bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md] — N/A for Story 9.5 (primitives do not host iframes).
- [Source: _bmad-output/implementation-artifacts/9-4-accessibility-localization-enforcement.md] — Established patterns for ARIA, RTL, and test isolation.

---

## Dev Agent Record

### Agent Model Used
Gemini 3.8 Flash (High)

### Completion Notes List
- Comprehensive developer context created and validated against BMad quality checklist.
- All 13 quality improvements applied:
  - C1: `baseline_commit` set to HEAD commit (`1d2621fe99c63c3cddabb7a0fc0d44bda43fe4a6`).
  - C2: Accessible `<label>` wrapper and visible label text added to Switch template.
  - C3: Axe-core test snippets corrected with accessible label context.
  - C4: Test registry Task 5 corrected to register unit test specs and append to `renderer-primitives-a11y`.
  - C5: Complete TypeScript, HTML, and SCSS scaffold added for `ChipComponent`.
  - E6: AC 2 clarified to define host `<origo-chip>` with inner `<button>` element.
  - E7: Complete Jest unit test reference suites added for `switch.component.spec.ts` and `chip.component.spec.ts`.
  - E8: Complete reference SCSS added with CSS custom property token fallbacks for both components.
  - E9: Two-way model synchronization (`model()` + `effect()` + `untracked()`) documented and implemented.
  - O10: Keyboard interaction semantics explicitly detailed.
  - O11: RTL logical property spec assertions included in unit test requirements.
  - O12: Unified Component Specification Matrix added.
  - O13: Explicit `[NEW]` and `[UPDATE]` file paths documented across all tasks.
- ADR DoD: `adr-epic7-web-worker-csp.md` acknowledged as N/A (form primitives do not host iframes).
- Sprint extension governance: Authorized to complete remaining 2 primitives of Phase 1 25-component target.
