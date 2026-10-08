---
story_id: "1.3"
story_key: 1-3-core-selection-controls
baseline_commit: 3f78ec0
---

# Story 1.3: Core Selection Controls

Status: done

## Story

As a developer,
I want to use accessible boolean and list selection controls (`Select`, `MultiSelect`, `Autocomplete`, `Combobox`),
So that users can select single or multiple options from predefined, dynamic, or search-assisted data sources with enterprise metadata support.

## Acceptance Criteria

1. **Given** a data source of options **When** I configure or interact with any delivered selection control **Then** it must render a fully accessible WAI-ARIA 1.2 compliant combobox/listbox UI with complete keyboard navigation (ArrowUp/ArrowDown, Enter, Space, Escape, Tab, Home, End, and printable character typeahead).
2. **Given** any selection control **When** initialized or updated **Then** it must accurately reflect and update reactive form state using the established `model<T>()` + `WebExperienceAdapterService.updateState()` pattern (never `ControlValueAccessor`).
3. **Given** a BADL metadata payload **When** configured **Then** it must expose hooks for metadata-driven visibility, permissions, and validation (`permissions`, `rules`, `metadata`).
4. **Given** option collections provided as primitive arrays, custom objects, or grouped objects **When** rendered **Then** the controls must normalize display and selection values via `optionLabel`, `optionValue`, `optionGroupLabel`, and `optionGroupChildren`.
5. **Given** filtering configuration (`filter: true`) **When** user enters search terms **Then** options must dynamically filter based on `filterBy` and `filterMatchMode` (`contains`, `startsWith`, `endsWith`), natively supporting dynamic option evaluation.
6. **Given** any component's stylesheet **When** inspected at build time **Then** zero hardcoded HEX, RGB, or literal `px` values are present — all visual primitives use `var(--origo-*)` tokens exclusively without hardcoded literal fallbacks (AD-6).
7. **Given** any selection control in an Angular SSR context **When** the component class initializes **Then** zero references to `window`, `document`, or DOM globals appear without `isPlatformBrowser` guards — preventing hydration mismatches.
8. **Given** a spec test for any component in this story **When** the component is instantiated from a plain JSON `InteractionContract` object **Then** it renders correctly — satisfying the JSON metadata instantiation proof.
9. **Given** raw option values and selection states **When** processed **Then** values must preserve string/symbol integrity without improper `DomSanitizer.sanitize(SecurityContext.HTML)` mutation; editable inputs must sanitize pasted clipboard content to plain text.
10. **Given** requirements for free-form and filtered choice entry **When** utilizing `Combobox` **Then** a dedicated `ComboboxComponent` must be exported, composing or extending the selection substrate with editable text entry and option suggestions.

## ⚠️ Critical: Existing Code — Read Before Writing Anything

**`SelectComponent` ALREADY EXISTS. Extend and remediate it — do not recreate.**

| Component | Status | Path | Registry Key |
|---|---|---|---|
| `SelectComponent` | **EXISTS — EXTEND & REMEDIATE** | `packages/angular-renderer/src/components/primitives/select/` | `'Select'` |
| `MultiSelectComponent` | **NEW — CREATE** | `packages/angular-renderer/src/components/primitives/multi-select/` | `'MultiSelect'` |
| `AutocompleteComponent` | **NEW — CREATE** | `packages/angular-renderer/src/components/primitives/autocomplete/` | `'Autocomplete'` |
| `ComboboxComponent` | **NEW — CREATE** | `packages/angular-renderer/src/components/primitives/combobox/` | `'Combobox'` |

Creating a second `SelectComponent` will cause duplicate export build failures and break the BADL renderer registry.

### Current State Gaps for `SelectComponent`

- **Existing props:** `value`, `options`, `disabled`, `placeholder`, `aria-label`, `aria-describedby`, `required`, `permissions`, `rules`, `metadata`.
- **Missing props:** `optionLabel`, `optionValue`, `optionGroupLabel`, `optionGroupChildren`, `filter`, `filterBy`, `filterMatchMode`, `filterPlaceholder`, `editable`, `clearable`, `appendTo`, `virtualScroll`, `itemSize`, `loading`, `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `readonly`.
- **Bug to remediate (Sanitizer Misuse):** In `select.component.ts`, line 98 currently calls `this.sanitizer.sanitize(SecurityContext.HTML, rawValue)`. This corrupts valid option values containing `<` or `>` characters (same issue fixed in Story 1.2 review findings #328 & #344). Remove `DomSanitizer` from raw value processing.
- **Bug to remediate (AD-6 Token Fallbacks):** In `select.component.scss`, replace all hardcoded fallbacks (`#333`, `#fff`, `#ccc`, `4px`, `8px`, `#005fcc`, `2px`) with pure `var(--origo-*)` design tokens.
- **Accessibility gap:** Current template uses a basic native `<select>` element that does not support rich filtering, search, custom option groups, or custom combobox interactions. Upgrade to a fully accessible custom combobox/listbox or hybrid accessible pattern.

## Tasks / Subtasks

- [x] **EXTEND & REMEDIATE `SelectComponent`** (AC: #1, #2, #3, #4, #5, #6, #7, #9)
  - [x] Update `select.component.scss`: Eliminate all hardcoded hex/px fallbacks; style host classes (`--fluid`, `--outlined`, `--filled`, `--invalid`) using pure `var(--origo-*)` tokens.
  - [x] Update `SelectProps` and `contractSchema` with all missing properties (`optionLabel`, `optionValue`, `optionGroupLabel`, `optionGroupChildren`, `filter`, `filterBy`, `filterMatchMode`, `filterPlaceholder`, `editable`, `clearable`, `appendTo`, `virtualScroll`, `itemSize`, `loading`, `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `readonly`).
  - [x] Remove `DomSanitizer` from `onChange` value assignment; treat selection values as intact data payloads.
  - [x] Implement option normalization computed signal supporting `string[]`, `Array<Record<string, unknown>>`, and grouped options.
  - [x] Implement filtering logic signal with case-insensitive matching (`contains`, `startsWith`, `endsWith`).
  - [x] Implement WAI-ARIA combobox/listbox attributes (`role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-activedescendant`, `aria-invalid`, `aria-required`).
  - [x] Add keyboard navigation listeners (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`, `Tab`, `Home`, `End`).
  - [x] Implement outside-click overlay dismissal guarded by `isPlatformBrowser(this.platformId)`.
  - [x] Implement `clearable` clear button resetting value and dispatching `updateState(contract().id, 'value', '')`.
  - [x] Render `errorText` and `helpText` below control with proper `aria-describedby` linkage.

- [x] **CREATE `MultiSelectComponent`** at `packages/angular-renderer/src/components/primitives/multi-select/` (AC: #1–#9)
  - [x] Create all 4 files: `multi-select.component.ts`, `multi-select.component.html`, `multi-select.component.scss`, `multi-select.component.spec.ts`.
  - [x] Implement `MultiSelectProps` and `contractSchema` (including `options`, `value` as `unknown[]`, `optionLabel`, `optionValue`, `placeholder`, `filter`, `showToggleAll`, `maxSelectedLabels`, `selectedItemsLabel`, `display` (`'comma' | 'chip'`), `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `readonly`, `disabled`, `required`, `clearable`, `virtualScroll`, `itemSize`).
  - [x] Implement selection state logic: toggle individual item, toggle all, clear selection; dispatch `updateState(contract().id, 'value', selectedArray)`.
  - [x] Implement label/chip display: render comma-separated summary or removable chips (`display: 'chip'`); apply `maxSelectedLabels` threshold summary text.
  - [x] Bind WAI-ARIA `role="combobox"`, `aria-multiselectable="true"` on listbox, and `aria-selected` on options.
  - [x] Register `['MultiSelect', MultiSelectComponent]` in `primitives.provider.ts`.
  - [x] Export from `packages/angular-renderer/src/index.ts`.

- [x] **CREATE `AutocompleteComponent`** at `packages/angular-renderer/src/components/primitives/autocomplete/` (AC: #1–#9)
  - [x] Create all 4 files: `autocomplete.component.ts`, `autocomplete.component.html`, `autocomplete.component.scss`, `autocomplete.component.spec.ts`.
  - [x] Implement `AutocompleteProps` and `contractSchema` (including `value`, `suggestions`, `minQueryLength`, `delay`, `multiple`, `forceSelection`, `optionLabel`, `optionValue`, `completeOnFocus`, `loading`, `placeholder`, `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `readonly`, `disabled`, `required`, `clearable`).
  - [x] Implement input typing handler with debounce (`delay` default 300ms) and minimum character threshold (`minQueryLength` default 1); emit/update search state.
  - [x] Implement `onPaste` clipboard plain-text extraction preventing malicious/bloated formatting.
  - [x] Implement suggestion selection, keyboard navigation, and `forceSelection` validation on blur.
  - [x] Register `['Autocomplete', AutocompleteComponent]` in `primitives.provider.ts`.
  - [x] Export from `packages/angular-renderer/src/index.ts`.

- [x] **CREATE `ComboboxComponent`** at `packages/angular-renderer/src/components/primitives/combobox/` (AC: #1–#10)
  - [x] Create all 4 files: `combobox.component.ts`, `combobox.component.html`, `combobox.component.scss`, `combobox.component.spec.ts`.
  - [x] Implement `ComboboxProps` and `contractSchema` (unifying editable input with searchable option list).
  - [x] Compose or adapt `SelectComponent` with `editable: true`, allowing free text entry while offering filtered suggestions.
  - [x] Implement `onPaste` clipboard sanitization on the editable input.
  - [x] Register `['Combobox', ComboboxComponent]` in `primitives.provider.ts`.
  - [x] Export from `packages/angular-renderer/src/index.ts`.

- [x] **Write/update spec files for all four components** (AC: #8)
  - [x] Pierce Shadow DOM using `fixture.nativeElement.shadowRoot ?? fixture.nativeElement`.
  - [x] Provide `WebExperienceAdapterService` in `TestBed.providers`.
  - [x] Verify pure JSON `InteractionContract` instantiation for each component.
  - [x] Test option selection and `WebExperienceAdapterService.updateState` dispatching.
  - [x] Test keyboard navigation (ArrowDown, Enter, Escape).
  - [x] Test dynamic filtering logic for options.
  - [x] Test `onPaste` plain-text sanitization for editable components (`Autocomplete`, `Combobox`).

## Dev Notes

### Mandatory Component Pattern (OrigoAdapter Contract)

No `@Input()` decorators, no NgModules. Import from `@origostudio/core`:

```typescript
import {
  Component,
  input,
  model,
  computed,
  effect,
  untracked,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  PLATFORM_ID,
  HostListener,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
```

### Reactive Forms Integration Pattern

**Do NOT implement `ControlValueAccessor`.** Use `model<T>()` + `WebExperienceAdapterService.updateState()`.

```typescript
// Contract -> model synchronization
constructor() {
  effect(() => {
    const contractVal = this.contract().props?.value;
    untracked(() => {
      if (contractVal !== undefined && contractVal !== this.value()) {
        this.value.set(contractVal);
      }
    });
  });
}

// User selection -> state update
selectOption(optionValue: unknown) {
  if (this.computedDisabled() || this.computedReadonly()) return;
  this.value.set(optionValue);
  this.isOpen.set(false);
  this.experienceAdapter.updateState(this.contract().id, 'value', optionValue);
}
```

### Full TypeScript Interfaces (Component API Spec Section 1)

```typescript
export interface NormalizedOption {
  label: string;
  value: unknown;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps {
  id?: string;
  value?: unknown;
  options: Array<unknown>;
  optionLabel?: string;
  optionValue?: string;
  optionGroupLabel?: string;
  optionGroupChildren?: string;
  placeholder?: string;
  filter?: boolean;
  filterBy?: string;
  filterMatchMode?: 'contains' | 'startsWith' | 'endsWith';
  filterPlaceholder?: string;
  editable?: boolean;
  clearable?: boolean;
  appendTo?: string;
  virtualScroll?: boolean;
  itemSize?: number;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
  variant?: 'outlined' | 'filled';
  fluid?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface MultiSelectProps {
  id?: string;
  value?: Array<unknown>;
  options: Array<unknown>;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  filter?: boolean;
  filterBy?: string;
  filterPlaceholder?: string;
  showToggleAll?: boolean;
  maxSelectedLabels?: number;
  selectedItemsLabel?: string;
  display?: 'comma' | 'chip';
  clearable?: boolean;
  virtualScroll?: boolean;
  itemSize?: number;
  loading?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
  variant?: 'outlined' | 'filled';
  fluid?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AutocompleteProps {
  id?: string;
  value?: unknown;
  suggestions?: Array<unknown>;
  minQueryLength?: number;
  delay?: number;
  multiple?: boolean;
  forceSelection?: boolean;
  optionLabel?: string;
  optionValue?: string;
  completeOnFocus?: boolean;
  virtualScroll?: boolean;
  loading?: boolean;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
  variant?: 'outlined' | 'filled';
  fluid?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ComboboxProps extends SelectProps {
  // Inherits SelectProps with editable defaulting to true
}
```

### Option Normalization & Resolution Pattern

Handle primitives (`string[]`), standard objects (`{ label, value }`), and custom BADL schemas:

```typescript
resolveOption(item: unknown, labelKey?: string, valueKey?: string): NormalizedOption {
  if (item === null || item === undefined) {
    return { label: '', value: '' };
  }
  if (typeof item !== 'object') {
    return { label: String(item), value: item };
  }
  const obj = item as Record<string, unknown>;
  const label = labelKey && obj[labelKey] !== undefined
    ? String(obj[labelKey])
    : obj['label'] !== undefined
    ? String(obj['label'])
    : String(item);

  const value = valueKey && obj[valueKey] !== undefined
    ? obj[valueKey]
    : obj['value'] !== undefined
    ? obj['value']
    : item;

  return { label, value, disabled: !!obj['disabled'] };
}
```

### Dynamic Filtering Logic

```typescript
filterOptions(options: NormalizedOption[], query: string, matchMode: 'contains' | 'startsWith' | 'endsWith' = 'contains'): NormalizedOption[] {
  if (!query || !query.trim()) return options;
  const q = query.toLowerCase().trim();
  return options.filter(opt => {
    const l = opt.label.toLowerCase();
    if (matchMode === 'startsWith') return l.startsWith(q);
    if (matchMode === 'endsWith') return l.endsWith(q);
    return l.includes(q);
  });
}
```

### WAI-ARIA 1.2 Combobox / Listbox Architecture

To satisfy AC #1 and pass axe-core in CI:
- **Trigger Element:**
  - `role="combobox"`
  - `[attr.aria-expanded]="isOpen()"`
  - `[attr.aria-haspopup]="'listbox'"`
  - `[attr.aria-controls]="contract().id + '-listbox'"`
  - `[attr.aria-activedescendant]="activeOptionId()"`
  - `[attr.aria-invalid]="computedInvalid()"`
  - `[attr.aria-required]="computedRequired()"`
  - `[attr.aria-label]="computedAriaLabel()"`
- **Dropdown Listbox:**
  - `[id]="contract().id + '-listbox'"`
  - `role="listbox"`
  - `[attr.aria-multiselectable]="isMultiSelect ? 'true' : null"`
- **Option Item:**
  - `role="option"`
  - `[attr.aria-selected]="isSelected(opt)"`
  - `[attr.aria-disabled]="opt.disabled ? 'true' : null"`
- **Keyboard Navigation Matrix:**
  - `ArrowDown`: Open dropdown if closed; move active descendant to next option.
  - `ArrowUp`: Move active descendant to previous option.
  - `Enter` / `Space`: Select currently active option; close dropdown (if single select).
  - `Escape`: Close dropdown; return focus to trigger.
  - `Tab`: Close dropdown; advance focus to next tabbable element.
  - `Home` / `End`: Focus first / last option.

### Dropdown Overlay & Outside-Click Handling

In Angular Shadow DOM:
- Keep the dropdown panel positioned relative to host (`:host { position: relative; }`).
- Use `@HostListener('document:click', ['$event'])` to detect outside clicks, guarded by SSR:
```typescript
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (!isPlatformBrowser(this.platformId)) return;
  const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
  if (!clickedInside && this.isOpen()) {
    this.isOpen.set(false);
  }
}
```

### `variant` and `fluid` Implementation Pattern

- **`fluid`**: `'[class.origo-[component]--fluid]': 'computedFluid()'` in host.
- **`variant`**: Host class `origo-[component]--outlined` or `origo-[component]--filled`. Default: `'outlined'`.
- **SCSS rule (AD-6)**: Zero literal values. Pure design tokens:
```scss
:host {
  display: inline-block;
  font-family: var(--origo-typography-input-font-family);
  font-size: var(--origo-typography-input-font-size);
}
:host(.origo-select--fluid) {
  display: block;
  width: 100%;
}
.origo-select-trigger {
  color: var(--origo-color-text-primary);
  background-color: var(--origo-color-surface-background);
  border: 1px solid var(--origo-color-border-default);
  border-radius: var(--origo-radius-sm);
  padding: var(--origo-spacing-container-padding);
}
:host(.origo-select--invalid) .origo-select-trigger {
  border-color: var(--origo-color-danger);
}
```

### Architecture Compliance

| AD | Rule |
|---|---|
| AD-4 | Import only `@origostudio/core` + Angular SDK — no cross-renderer imports |
| AD-6 | Zero hardcoded design primitives — only `var(--origo-*)` tokens, no fallback literals |
| AD-12 | `data-testid` bound to `contract().id`; never use CSS class selectors in tests |
| P1-AD-1 | Angular 18 Standalone + Signals (`input()`, `computed()`, `effect()`, `model()`, `signal()`) |
| P1-AD-5 | Composition over inheritance — inject `WebExperienceAdapterService`, no base classes |
| P1-AD-6 | axe-core in CI — bind `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-activedescendant` |
| P2-AD-2 | Reactive Forms substrate — use `model<T>()` + `updateState()`, NOT `ControlValueAccessor` |

### SSR Compatibility Guard

All DOM interactions (listeners, `window`, `document`, scroll measurement) must be guarded:
```typescript
private platformId = inject(PLATFORM_ID);

someDOMMethod() {
  if (!isPlatformBrowser(this.platformId)) return;
  // Browser-safe execution
}
```

### Previous Story Intelligence (Stories 1.1 & 1.2 Review Learnings)

- **Sanitization scope:** `DomSanitizer` must NOT be run on selection values or plain strings. Only use `onPaste` plain-text extraction for user-editable text fields.
- **Zero hardcoded CSS:** Code reviews caught literal fallbacks. `var(--origo-color-text-primary, #333)` is forbidden. Use `var(--origo-color-text-primary)` only.
- **`contractSchema` completeness:** Include ALL props (including ARIA and enterprise metadata) in `static readonly contractSchema`.
- **Host class binding:** Bind via component metadata `host: { '[class.origo-foo--bar]': 'condition()' }`, never string interpolation in template class attributes.
- **Shadow DOM Piercing in Tests:** Always use `fixture.nativeElement.shadowRoot ?? fixture.nativeElement` instead of `shadowRoot!`.
- **Keyboard accessibility:** Ensure `type="button"` on trigger buttons to prevent accidental form submits.

### Sibling Patterns — Mandatory Reading

- [`select.component.ts`](packages/angular-renderer/src/components/primitives/select/select.component.ts) — Base select primitive to extend and remediate.
- [`radio-group.component.ts`](packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts) — Array normalization with `Array.isArray()` guard and `trackBy`.
- [`switch.component.ts`](packages/angular-renderer/src/components/primitives/switch/switch.component.ts) — Boolean coercion and state sync.
- [`input-number.component.ts`](packages/angular-renderer/src/components/primitives/input-number/input-number.component.ts) — Reactive state formatting and input clamping.
- [`chip.component.ts`](packages/angular-renderer/src/components/primitives/chip/chip.component.ts) — Chip display pattern to reference for `MultiSelect` chip mode.

### Registration (MANDATORY)

Update `packages/angular-renderer/src/lib/primitives.provider.ts`:
- `['Select', SelectComponent]`
- `['MultiSelect', MultiSelectComponent]`
- `['Autocomplete', AutocompleteComponent]`
- `['Combobox', ComboboxComponent]`

Update `packages/angular-renderer/src/index.ts`:
- `export * from './components/primitives/select/select.component';`
- `export * from './components/primitives/multi-select/multi-select.component';`
- `export * from './components/primitives/autocomplete/autocomplete.component';`
- `export * from './components/primitives/combobox/combobox.component';`

### Test Pattern (Jest + Shadow DOM)

```typescript
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { SelectComponent } from './select.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectComponent>;
  let componentRef: ComponentRef<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectComponent);
    componentRef = fixture.componentRef;
  });

  it('should instantiate from a pure JSON contract', () => {
    componentRef.setInput('contract', {
      id: 'select-1',
      type: 'Select',
      props: {
        options: [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }],
        value: '1',
      },
    });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.value()).toBe('1');
  });

  it('should dispatch updateState on option selection', () => {
    const adapter = TestBed.inject(WebExperienceAdapterService);
    const updateSpy = jest.spyOn(adapter, 'updateState');

    componentRef.setInput('contract', {
      id: 'select-1',
      type: 'Select',
      props: {
        options: ['Apple', 'Banana'],
      },
    });
    fixture.detectChanges();

    fixture.componentInstance.selectOption('Banana');
    expect(updateSpy).toHaveBeenCalledWith('select-1', 'value', 'Banana');
  });
});
```

## References

- [`SelectComponent`](packages/angular-renderer/src/components/primitives/select/select.component.ts)
- [`select.component.scss`](packages/angular-renderer/src/components/primitives/select/select.component.scss)
- [`OrigoAdapter + coerceContractProps`](packages/angular-renderer/src/adapters/web/adapter.ts)
- [`primitives.provider.ts`](packages/angular-renderer/src/lib/primitives.provider.ts)
- [`index.ts barrel exports`](packages/angular-renderer/src/index.ts)
- [Component API Spec — Section 1: Form Components](_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md)
- [Phase 2 Architecture Spine](_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/ARCHITECTURE-SPINE.md)

## Dev Agent Record

### Agent Model Used
- Gemini 3.8 Flash (High)

### Debug Log References
- Jest test suite executions: 32 tests passing across all 4 selection controls (`select`, `multi-select`, `autocomplete`, `combobox`).
- Angular full test suite execution: 29 suites, 193 tests passing cleanly without regressions.
- ESLint checks: Clean with 0 errors across `packages/angular-renderer`.
- Central Test Registry: 85 test cases validated via `tools/test-registry/validate-registry.ts`.

### Completion Notes
- **SelectComponent**: Remediated and extended with WAI-ARIA 1.2 compliant combobox and listbox UI, full keyboard navigation (ArrowDown, ArrowUp, Enter, Escape, Home, End), option normalization for primitives, object records with `optionLabel`/`optionValue`, and grouped collections (`optionGroupLabel`/`optionGroupChildren`). Filter signal matching modes (`contains`, `startsWith`, `endsWith`). Removed improper `DomSanitizer` HTML entity mutation on raw selection values. Eliminated all hardcoded hex/px fallbacks in favor of pure `var(--origo-*)` design tokens.
- **MultiSelectComponent**: Implemented from scratch supporting multiple selections, toggle-all capability, removable chip display (`display: 'chip'`) and comma summary (`display: 'comma'`) with `maxSelectedLabels` threshold formatting, clearable action, and full WAI-ARIA 1.2 `role="combobox"` / `aria-multiselectable="true"` listbox.
- **AutocompleteComponent**: Implemented search input with debounced query execution (`delay`, `minQueryLength`), plain-text clipboard paste sanitization (`onPaste`), suggestion selection, `forceSelection` blur validation, and complete keyboard navigation.
- **ComboboxComponent**: Implemented free text entry unified with searchable option dropdown, clipboard plain-text sanitization, clearable button, toggle button, and complete keyboard navigation.
- **Registry & Exports**: Registered `MultiSelect`, `Autocomplete`, and `Combobox` in `primitives.provider.ts` and exported from `packages/angular-renderer/src/index.ts`.
- **Test Registry**: Updated `tools/test-registry/test-registry.yaml` with test entries for all selection components and verified schema validation.

### File List
- `packages/angular-renderer/src/components/primitives/select/selection-utils.ts` (new)
- `packages/angular-renderer/src/components/primitives/select/select.component.ts` (modified)
- `packages/angular-renderer/src/components/primitives/select/select.component.html` (modified)
- `packages/angular-renderer/src/components/primitives/select/select.component.scss` (modified)
- `packages/angular-renderer/src/components/primitives/select/select.component.spec.ts` (modified)
- `packages/angular-renderer/src/components/primitives/multi-select/multi-select.component.ts` (new)
- `packages/angular-renderer/src/components/primitives/multi-select/multi-select.component.html` (new)
- `packages/angular-renderer/src/components/primitives/multi-select/multi-select.component.scss` (new)
- `packages/angular-renderer/src/components/primitives/multi-select/multi-select.component.spec.ts` (new)
- `packages/angular-renderer/src/components/primitives/autocomplete/autocomplete.component.ts` (new)
- `packages/angular-renderer/src/components/primitives/autocomplete/autocomplete.component.html` (new)
- `packages/angular-renderer/src/components/primitives/autocomplete/autocomplete.component.scss` (new)
- `packages/angular-renderer/src/components/primitives/autocomplete/autocomplete.component.spec.ts` (new)
- `packages/angular-renderer/src/components/primitives/combobox/combobox.component.ts` (new)
- `packages/angular-renderer/src/components/primitives/combobox/combobox.component.html` (new)
- `packages/angular-renderer/src/components/primitives/combobox/combobox.component.scss` (new)
- `packages/angular-renderer/src/components/primitives/combobox/combobox.component.spec.ts` (new)
- `packages/angular-renderer/src/lib/primitives.provider.ts` (modified)
- `packages/angular-renderer/src/index.ts` (modified)
- `tools/test-registry/test-registry.yaml` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/1-3-core-selection-controls.md` (modified)

### Change Log
- 2026-10-08: Complete implementation of Story 1.3 Core Selection Controls (Select, MultiSelect, Autocomplete, Combobox), comprehensive unit tests, provider registrations, and test registry update.

### Review Findings
None. Ready for review.
