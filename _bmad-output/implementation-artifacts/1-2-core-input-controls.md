---
story_id: "1.2"
story_key: 1-2-core-input-controls
baseline_commit: 450e384f384ac1d239f0ece384e438ee430745f5
---

# Story 1.2: Core Input Controls

Status: done

## Story

As a developer,
I want to use standard text-based input controls (`TextInput`, `Textarea`, `InputNumber`, `Checkbox`, `RadioGroup`, `Switch`),
So that users can enter standard data types.

## Acceptance Criteria

1. **Given** an Angular reactive form **When** I configure or utilize the delivered components and features **Then** the input must accurately reflect and update the reactive form state using the established `model<T>()` + `updateState` pattern (not ControlValueAccessor).
2. **Given** any of the controls **When** utilized **Then** it must support standard API properties (`readonly`, `disabled`, `variant`, `fluid`).
3. **Given** a BADL metadata payload **When** configured **Then** it must expose hooks for metadata-driven visibility and validation (`permissions`, `rules`, `metadata`).
4. **Given** any input component in an Angular SSR context **When** the component class initializes **Then** zero references to `window`, `document`, or any DOM global appear — preventing hydration mismatches.
5. **Given** any component's stylesheet **When** inspected at build time **Then** zero hardcoded HEX, RGB, or literal `px` values are present — all visual primitives use `var(--origo-*)` tokens exclusively (AD-6).
6. **Given** a spec test for any component in this story **When** the component is instantiated from a plain JSON `InteractionContract` object **Then** it renders correctly — satisfying the JSON metadata instantiation proof.
7. **Given** user input in text inputs **When** a user pastes content **Then** they must natively intercept `onPaste` to strip malicious or bloated formatting (Clipboard Sanitization). Applies to `TextInput` and `Textarea` only; not `Checkbox`, `RadioGroup`, or `Switch`.
8. **Given** dynamically injected text/HTML **When** rendered **Then** it must strictly use Angular's `DomSanitizer` with `SecurityContext.HTML` (XSS Protection). See `TextareaComponent` for the established pattern.

## ⚠️ Critical: Existing Code — Read Before Writing Anything

**Five of the six components ALREADY EXIST. Extend them — do not recreate.**

| Component | Status | Path | Registry Key |
|---|---|---|---|
| `TextInputComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/text-input/` | `'TextInput'` |
| `TextareaComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/textarea/` | `'Textarea'` |
| `CheckboxComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/checkbox/` | `'Checkbox'` |
| `RadioGroupComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/radio-group/` | `'RadioGroup'` |
| `SwitchComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/switch/` | `'Switch'` |
| `InputNumberComponent` | **NEW — CREATE** | `packages/angular-renderer/src/components/primitives/input-number/` | `'InputNumber'` |

Creating a second `TextInputComponent` or `CheckboxComponent` will cause duplicate export build failures and break the BADL renderer registry.

### Current State Gaps (must add to each existing component)

- **`TextInputComponent`** has: `value`, `placeholder`, `disabled`, `readonly`. **Missing:** `variant`, `fluid`, `required`, `invalid`, `errorText`, `helpText`, `type`, `onPaste` handler.
- **`TextareaComponent`** has: `value`, `placeholder`, `rows`, `disabled`, `readonly`, `required`, `DomSanitizer` in `onInput`. **Missing:** `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `autoResize`, `onPaste` handler.
- **`CheckboxComponent`** has: `checked`, `label`, `disabled`, `required`. **Missing:** `variant`, `fluid`, `invalid`, `errorText`, `indeterminate`.
- **`RadioGroupComponent`** has: `options[]`, `value`, `disabled`, `required`. **Missing:** `variant`, `fluid`, `invalid`, `errorText`, `orientation`.
- **`SwitchComponent`** has: `checked`, `label`, `disabled`, uses `coerceContractProps`. **Missing:** `variant`, `fluid`, `readonly`.

## Tasks / Subtasks

- [ ] **EXTEND `TextInputComponent`** (AC: #1, #2, #5, #7)
  - [ ] Add `variant`, `fluid`, `required`, `invalid`, `errorText`, `helpText`, `type` to `TextInputProps` + `contractSchema`
  - [ ] Add computed signals for new props; apply `fluid`/`variant` via host class bindings
  - [ ] Implement `onPaste(event: ClipboardEvent)` — strip HTML/RTF, keep plain text (see pattern below)
  - [ ] Bind `[attr.aria-invalid]`, `[attr.aria-required]`; render `errorText`/`helpText` in template
- [ ] **EXTEND `TextareaComponent`** (AC: #1, #2, #5, #7)
  - [ ] Add `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `autoResize` to props + schema
  - [ ] Implement `onPaste(event: ClipboardEvent)` — same clipboard sanitization pattern
  - [ ] Implement `autoResize` logic (adjust `rows` on `onInput` using `scrollHeight` — guard with `isPlatformBrowser`)
- [ ] **EXTEND `CheckboxComponent`** (AC: #1, #2, #5)
  - [ ] Add `variant`, `fluid`, `invalid`, `errorText`, `indeterminate` to props + schema
  - [ ] Add `computedIndeterminate`; bind `[indeterminate]="computedIndeterminate()"` on native `<input>`
  - [ ] Apply `fluid` via host class; bind `[attr.aria-invalid]`
- [ ] **EXTEND `RadioGroupComponent`** (AC: #1, #2, #5)
  - [ ] Add `variant`, `fluid`, `invalid`, `errorText`, `orientation` to props + schema
  - [ ] Add `computedOrientation`; apply via host class; bind `[attr.role]="'radiogroup'"`, `[attr.aria-invalid]`
- [ ] **EXTEND `SwitchComponent`** (AC: #1, #2, #5)
  - [ ] Add `variant`, `fluid`, `readonly` to props + schema
  - [ ] Guard `onChange()` to return early if `computedReadonly()` is true
- [ ] **CREATE `InputNumberComponent`** at `packages/angular-renderer/src/components/primitives/input-number/` (AC: #1–#6)
  - [ ] Create all 4 files: `.ts`, `.html`, `.scss`, `.spec.ts`
  - [ ] Implement full `InputNumberProps` (see API spec section below)
  - [ ] Register `['InputNumber', InputNumberComponent]` in `primitives.provider.ts`
  - [ ] Export from `packages/angular-renderer/src/index.ts`
- [ ] **Write/update spec files for all six components** (AC: #6)
  - [ ] Use `fixture.nativeElement.shadowRoot ?? fixture.nativeElement` to pierce ShadowDom
  - [ ] Use `jest.spyOn`; include `WebExperienceAdapterService` in `TestBed.providers`
  - [ ] JSON metadata instantiation test in each spec
  - [ ] `onPaste` stripping test for `TextInput` and `Textarea`

## Dev Notes

### Mandatory Component Pattern (OrigoAdapter Contract)

No `@Input()` decorators, no NgModules. Import from `@origostudio/core` (not `@origo/core`):

```typescript
import { Component, input, model, computed, effect, untracked, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
```

### Reactive Forms Integration Pattern

**Do NOT implement `ControlValueAccessor`.** This project uses `model<T>()` + `WebExperienceAdapterService.updateState()`. The BADL renderer subscribes externally — components do not wire to `FormControl` directly.

Pattern (established in all existing primitives):
```typescript
// Contract → model sync
constructor() {
  effect(() => {
    const contractVal = this.contract().props?.value;
    const parsed = contractVal != null ? String(contractVal) : '';
    untracked(() => { if (parsed === this.value()) return; this.value.set(parsed); });
  });
}
// User interaction → state update
onInput(event: Event) {
  const target = event.target as HTMLInputElement | null;
  if (!target || this.computedDisabled() || this.computedReadonly()) return;
  this.value.set(target.value);
  this.experienceAdapter.updateState(this.contract().id, 'value', target.value);
}
```

### `onPaste` Clipboard Sanitization Pattern

Apply to `TextInput` and `Textarea` only. Extract plain text from clipboard — discards all HTML/RTF:

```typescript
onPaste(event: ClipboardEvent) {
  if (this.computedDisabled() || this.computedReadonly()) return;
  event.preventDefault();
  const plain = event.clipboardData?.getData('text/plain') ?? '';
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  if (!target) return;
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  const newValue = target.value.slice(0, start) + plain + target.value.slice(end);
  target.value = newValue;
  this.value.set(newValue);
  this.experienceAdapter.updateState(this.contract().id, 'value', newValue);
}
```

### `InputNumber` — Full API Spec (section 1.3 of Component API Spec)

```typescript
export interface InputNumberProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  useGrouping?: boolean;    // thousands separator via Intl.NumberFormat
  locale?: string;          // e.g. 'en-US', 'de-DE'
  prefix?: string;          // text before value (e.g. '$')
  suffix?: string;          // text after value (e.g. 'kg')
  showButtons?: boolean;    // increment/decrement steppers
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  variant?: 'outlined' | 'filled' | 'text';
  fluid?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

Use native `<input type="number">`. Enforce `min`/`max` on `onInput`/`onBlur`. Format display with `Intl.NumberFormat` on blur (not live — avoids cursor issues). Dispatch `updateState(id, 'value', numericValue)`.

### `variant` and `fluid` Implementation Pattern

- **`fluid`**: `'[class.origo-[component]--fluid]': 'computedFluid()'` in host. SCSS: `.origo-[component]--fluid { display: block; width: 100%; }`
- **`variant`**: Host class per variant. Style exclusively with `var(--origo-*)` tokens:
  ```scss
  :host(.origo-text-input--outlined) input { border: 1px solid var(--origo-color-border-default); }
  :host(.origo-text-input--filled) input  { background: var(--origo-color-surface-subtle); border: none; }
  ```
- Default variant: `'outlined'` when not provided.

### `readonly` Scope

| Component | Has `readonly` | Action |
|---|---|---|
| `TextInputComponent` | ✅ Yes | Verify template binds `[attr.readonly]` |
| `TextareaComponent` | ✅ Yes | Guards `onInput` — verify |
| `CheckboxComponent` | ❌ No | Do NOT add — not applicable to boolean controls |
| `RadioGroupComponent` | ❌ No | Do NOT add |
| `SwitchComponent` | ❌ No | **Add** — guard `onChange()` |
| `InputNumberComponent` | ❌ New | **Add from start** |

### Architecture Compliance

| AD | Rule |
|---|---|
| AD-4 | Import only `@origostudio/core` + Angular SDK — no cross-renderer imports |
| AD-6 | Zero hardcoded design primitives — only `var(--origo-*)` tokens |
| AD-12 | `data-testid` bound to `contract().id`; never use CSS class selectors in tests |
| P1-AD-1 | Angular 18 Standalone + Signals (`input()`, `computed()`, `effect()`, `model()`) |
| P1-AD-5 | Composition over inheritance — inject `WebExperienceAdapterService`, no base classes |
| P1-AD-6 | axe-core in CI — bind `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required` |
| P2-AD-2 | Reactive Forms substrate — use `model<T>()` + `updateState()`, NOT `ControlValueAccessor` |

### SSR Compatibility Guard

Any DOM access (e.g., `scrollHeight` for `autoResize`) must be guarded:

```typescript
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

private platformId = inject(PLATFORM_ID);

someMethod() {
  if (!isPlatformBrowser(this.platformId)) return;
  // safe DOM access here
}
```

### File Structure

```
packages/angular-renderer/src/components/primitives/
  text-input/        ← EXISTS — extend only
  textarea/          ← EXISTS — extend only
  checkbox/          ← EXISTS — extend only
  radio-group/       ← EXISTS — extend only
  switch/            ← EXISTS — extend only
  input-number/      ← NEW (create all 4 files)
```

Do NOT create components in `src/lib/`. Do NOT add `.pw.ts` Playwright files.

### Registration (MANDATORY for InputNumber)

**`primitives.provider.ts`:** `['InputNumber', InputNumberComponent]`
**`index.ts`:** `export * from './components/primitives/input-number/input-number.component';`

### Test Pattern (Jest + ShadowDom)

```typescript
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { TextInputComponent } from './text-input.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('TextInputComponent', () => {
  let fixture: ComponentFixture<TextInputComponent>;
  let componentRef: ComponentRef<TextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();
    fixture = TestBed.createComponent(TextInputComponent);
    componentRef = fixture.componentRef;
  });

  it('should instantiate from a pure JSON contract', () => {
    componentRef.setInput('contract', { id: 'input-1', type: 'TextInput', props: { value: 'hello' } });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should strip HTML formatting on paste', () => {
    componentRef.setInput('contract', { id: 'input-1', type: 'TextInput', props: {} });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const dt = new DataTransfer();
    dt.setData('text/html', '<b>bold text</b>');
    dt.setData('text/plain', 'bold text');
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt }));
    expect(fixture.componentInstance.value()).toBe('bold text');
  });
});
```

### Previous Story Intelligence

From Story 1.1 (`1-1-core-buttons-and-actions`) — confirmed review findings to prevent same mistakes:

- **Zero hardcoded CSS:** Review caught hardcoded literal values. Use only `var(--origo-*)` tokens.
- **Accessibility:** Review caught missing WAI-ARIA roles. Verify `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`. Fallback `aria-label` to `label` prop if not explicitly set.
- **Explicit input `type`:** Review caught missing `type="button"`. For inputs: always set `type="text"`, `type="number"`, `type="checkbox"` explicitly.
- **`contractSchema`:** Review caught missing props. Include ALL props (including ARIA) in the `static readonly contractSchema`.
- **Host class string interpolation:** Do not interpolate inside `class` attribute — use `host: { '[class.origo-foo]': 'true' }`.
- **Shadow DOM styling:** CSS custom property tokens pierce shadow boundaries — no workarounds needed.
- **`indeterminate` on checkbox:** Bind as JS property `[indeterminate]`, not as HTML attribute.

### Sibling Patterns — Mandatory Reading

- [`switch.component.ts`](packages/angular-renderer/src/components/primitives/switch/switch.component.ts) — `coerceContractProps` + `effect()` sync pattern for booleans
- [`textarea.component.ts`](packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts) — `DomSanitizer` + `SecurityContext.HTML` XSS pattern
- [`radio-group.component.ts`](packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts) — `options[]` array with `Array.isArray()` guard
- [`chip.component.ts`](packages/angular-renderer/src/components/primitives/chip/chip.component.ts) — `model<boolean>()` + `updateState` for stateful toggle

### Latest Tech Information

- **`model<T>()`:** Use for all stateful components (not `signal()`). Established pattern across all existing primitives.
- **`Intl.NumberFormat`:** Web-native API — no external library needed. Call in `onBlur` (not `onInput`) to avoid cursor position issues.
- **`coerceContractProps`:** From `../../../adapters/web/adapter`. Use when type-coercing boolean/number props from JSON contract (see `SwitchComponent`).

## References

- [`TextInputComponent`](packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts)
- [`TextareaComponent`](packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts)
- [`CheckboxComponent`](packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts)
- [`RadioGroupComponent`](packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts)
- [`SwitchComponent`](packages/angular-renderer/src/components/primitives/switch/switch.component.ts)
- [`OrigoAdapter + coerceContractProps`](packages/angular-renderer/src/adapters/web/adapter.ts)
- [`primitives.provider.ts`](packages/angular-renderer/src/lib/primitives.provider.ts)
- [`index.ts barrel exports`](packages/angular-renderer/src/index.ts)
- [Component API Spec — Section 1: Form Components](_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md)
- [Phase 2 Architecture Spine](_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/ARCHITECTURE-SPINE.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes

### File List

### Review Findings

### Review Findings

- [x] [Review][Patch] Remove DomSanitizer from InputNumberComponent (incorrect for type="number") and fix null-fallback vulnerability [input-number.component.ts:onInput]
- [x] [Review][Patch] Prevent wiping value mid-typing in InputNumberComponent when target.validity?.badInput is true [input-number.component.ts:onInput]
- [x] [Review][Patch] Clamp InputNumberComponent value to min/max in onInput and onBlur [input-number.component.ts:onInput]
- [x] [Review][Patch] Implement missing showButtons stepper UI, prefix, suffix, minFractionDigits, maxFractionDigits, useGrouping, locale in InputNumberComponent [input-number.component.ts]
- [x] [Review][Patch] Apply Intl.NumberFormat on blur for InputNumberComponent [input-number.component.ts]
- [x] [Review][Patch] Bind native [required] and [attr.aria-required] in InputNumberComponent [input-number.component.html]
- [x] [Review][Patch] Move @if (computedErrorText()) inside wrapper in InputNumberComponent template [input-number.component.html]
- [x] [Review][Patch] Add fallback for computedAriaLabel in InputNumberComponent to prevent axe-core failure [input-number.component.ts]
- [x] [Review][Patch] Implement missing variant, fluid, and readonly (with onChange guard) in SwitchComponent [switch.component.ts]
- [x] [Review][Patch] Replace literal px offsets with --origo-* tokens in SwitchComponent SCSS [switch.component.scss]
- [x] [Review][Patch] Implement missing variant, fluid, and indeterminate property binding in CheckboxComponent [checkbox.component.ts]
- [x] [Review][Patch] Implement missing variant, fluid, orientation (prop/class), and role="radiogroup" in RadioGroupComponent [radio-group.component.ts]
- [x] [Review][Patch] Implement missing BADL metadata hooks (permissions, rules, metadata) across all six delivered components
- [x] [Review][Patch] Fix TextInputComponent missing DomSanitizer XSS protection [text-input.component.ts]
- [x] [Review][Patch] Add disabled/readonly guards in TextInputComponent.onInput [text-input.component.ts]
- [x] [Review][Patch] Fix TextInputComponent data-testid empty string fallback [text-input.component.ts]
- [x] [Review][Patch] Fix TextareaComponent onPaste incorrectly applying DomSanitizer to plain-text, which strips valid < or > chars [textarea.component.ts]
- [x] [Review][Patch] Refactor TextareaComponent.autoResize to adjust rows instead of direct target.style.height mutation [textarea.component.ts]
- [x] [Review][Patch] Fix textarea.component.scss regression: restore display: block instead of inline-block [textarea.component.scss]
- [x] [Review][Patch] Remove duplicate PLATFORM_ID import in TextareaComponent [textarea.component.ts]
- [x] [Review][Patch] Fix tests across all components: use new ClipboardEvent instead of new Event('paste')
- [x] [Review][Patch] Fix tests across all components: use fixture.nativeElement.shadowRoot ?? fixture.nativeElement instead of unsafe shadowRoot!
