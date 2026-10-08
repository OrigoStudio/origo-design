Invoke the bmad-review-adversarial-general skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/1-2-core-input-controls.md b/_bmad-output/implementation-artifacts/1-2-core-input-controls.md
new file mode 100644
index 0000000..04d9d40
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/1-2-core-input-controls.md
@@ -0,0 +1,324 @@
+---
+story_id: "1.2"
+story_key: 1-2-core-input-controls
+baseline_commit: 450e384f384ac1d239f0ece384e438ee430745f5
+---
+
+# Story 1.2: Core Input Controls
+
+Status: ready-for-dev
+
+## Story
+
+As a developer,
+I want to use standard text-based input controls (`TextInput`, `Textarea`, `InputNumber`, `Checkbox`, `RadioGroup`, `Switch`),
+So that users can enter standard data types.
+
+## Acceptance Criteria
+
+1. **Given** an Angular reactive form **When** I configure or utilize the delivered components and features **Then** the input must accurately reflect and update the reactive form state using the established `model<T>()` + `updateState` pattern (not ControlValueAccessor).
+2. **Given** any of the controls **When** utilized **Then** it must support standard API properties (`readonly`, `disabled`, `variant`, `fluid`).
+3. **Given** a BADL metadata payload **When** configured **Then** it must expose hooks for metadata-driven visibility and validation (`permissions`, `rules`, `metadata`).
+4. **Given** any input component in an Angular SSR context **When** the component class initializes **Then** zero references to `window`, `document`, or any DOM global appear — preventing hydration mismatches.
+5. **Given** any component's stylesheet **When** inspected at build time **Then** zero hardcoded HEX, RGB, or literal `px` values are present — all visual primitives use `var(--origo-*)` tokens exclusively (AD-6).
+6. **Given** a spec test for any component in this story **When** the component is instantiated from a plain JSON `InteractionContract` object **Then** it renders correctly — satisfying the JSON metadata instantiation proof.
+7. **Given** user input in text inputs **When** a user pastes content **Then** they must natively intercept `onPaste` to strip malicious or bloated formatting (Clipboard Sanitization). Applies to `TextInput` and `Textarea` only; not `Checkbox`, `RadioGroup`, or `Switch`.
+8. **Given** dynamically injected text/HTML **When** rendered **Then** it must strictly use Angular's `DomSanitizer` with `SecurityContext.HTML` (XSS Protection). See `TextareaComponent` for the established pattern.
+
+## ⚠️ Critical: Existing Code — Read Before Writing Anything
+
+**Five of the six components ALREADY EXIST. Extend them — do not recreate.**
+
+| Component | Status | Path | Registry Key |
+|---|---|---|---|
+| `TextInputComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/text-input/` | `'TextInput'` |
+| `TextareaComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/textarea/` | `'Textarea'` |
+| `CheckboxComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/checkbox/` | `'Checkbox'` |
+| `RadioGroupComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/radio-group/` | `'RadioGroup'` |
+| `SwitchComponent` | **EXISTS — EXTEND** | `packages/angular-renderer/src/components/primitives/switch/` | `'Switch'` |
+| `InputNumberComponent` | **NEW — CREATE** | `packages/angular-renderer/src/components/primitives/input-number/` | `'InputNumber'` |
+
+Creating a second `TextInputComponent` or `CheckboxComponent` will cause duplicate export build failures and break the BADL renderer registry.
+
+### Current State Gaps (must add to each existing component)
+
+- **`TextInputComponent`** has: `value`, `placeholder`, `disabled`, `readonly`. **Missing:** `variant`, `fluid`, `required`, `invalid`, `errorText`, `helpText`, `type`, `onPaste` handler.
+- **`TextareaComponent`** has: `value`, `placeholder`, `rows`, `disabled`, `readonly`, `required`, `DomSanitizer` in `onInput`. **Missing:** `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `autoResize`, `onPaste` handler.
+- **`CheckboxComponent`** has: `checked`, `label`, `disabled`, `required`. **Missing:** `variant`, `fluid`, `invalid`, `errorText`, `indeterminate`.
+- **`RadioGroupComponent`** has: `options[]`, `value`, `disabled`, `required`. **Missing:** `variant`, `fluid`, `invalid`, `errorText`, `orientation`.
+- **`SwitchComponent`** has: `checked`, `label`, `disabled`, uses `coerceContractProps`. **Missing:** `variant`, `fluid`, `readonly`.
+
+## Tasks / Subtasks
+
+- [ ] **EXTEND `TextInputComponent`** (AC: #1, #2, #5, #7)
+  - [ ] Add `variant`, `fluid`, `required`, `invalid`, `errorText`, `helpText`, `type` to `TextInputProps` + `contractSchema`
+  - [ ] Add computed signals for new props; apply `fluid`/`variant` via host class bindings
+  - [ ] Implement `onPaste(event: ClipboardEvent)` — strip HTML/RTF, keep plain text (see pattern below)
+  - [ ] Bind `[attr.aria-invalid]`, `[attr.aria-required]`; render `errorText`/`helpText` in template
+- [ ] **EXTEND `TextareaComponent`** (AC: #1, #2, #5, #7)
+  - [ ] Add `variant`, `fluid`, `invalid`, `errorText`, `helpText`, `autoResize` to props + schema
+  - [ ] Implement `onPaste(event: ClipboardEvent)` — same clipboard sanitization pattern
+  - [ ] Implement `autoResize` logic (adjust `rows` on `onInput` using `scrollHeight` — guard with `isPlatformBrowser`)
+- [ ] **EXTEND `CheckboxComponent`** (AC: #1, #2, #5)
+  - [ ] Add `variant`, `fluid`, `invalid`, `errorText`, `indeterminate` to props + schema
+  - [ ] Add `computedIndeterminate`; bind `[indeterminate]="computedIndeterminate()"` on native `<input>`
+  - [ ] Apply `fluid` via host class; bind `[attr.aria-invalid]`
+- [ ] **EXTEND `RadioGroupComponent`** (AC: #1, #2, #5)
+  - [ ] Add `variant`, `fluid`, `invalid`, `errorText`, `orientation` to props + schema
+  - [ ] Add `computedOrientation`; apply via host class; bind `[attr.role]="'radiogroup'"`, `[attr.aria-invalid]`
+- [ ] **EXTEND `SwitchComponent`** (AC: #1, #2, #5)
+  - [ ] Add `variant`, `fluid`, `readonly` to props + schema
+  - [ ] Guard `onChange()` to return early if `computedReadonly()` is true
+- [ ] **CREATE `InputNumberComponent`** at `packages/angular-renderer/src/components/primitives/input-number/` (AC: #1–#6)
+  - [ ] Create all 4 files: `.ts`, `.html`, `.scss`, `.spec.ts`
+  - [ ] Implement full `InputNumberProps` (see API spec section below)
+  - [ ] Register `['InputNumber', InputNumberComponent]` in `primitives.provider.ts`
+  - [ ] Export from `packages/angular-renderer/src/index.ts`
+- [ ] **Write/update spec files for all six components** (AC: #6)
+  - [ ] Use `fixture.nativeElement.shadowRoot ?? fixture.nativeElement` to pierce ShadowDom
+  - [ ] Use `jest.spyOn`; include `WebExperienceAdapterService` in `TestBed.providers`
+  - [ ] JSON metadata instantiation test in each spec
+  - [ ] `onPaste` stripping test for `TextInput` and `Textarea`
+
+## Dev Notes
+
+### Mandatory Component Pattern (OrigoAdapter Contract)
+
+No `@Input()` decorators, no NgModules. Import from `@origostudio/core` (not `@origo/core`):
+
+```typescript
+import { Component, input, model, computed, effect, untracked, ChangeDetectionStrategy, ViewEncapsulation, inject } from '@angular/core';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+```
+
+### Reactive Forms Integration Pattern
+
+**Do NOT implement `ControlValueAccessor`.** This project uses `model<T>()` + `WebExperienceAdapterService.updateState()`. The BADL renderer subscribes externally — components do not wire to `FormControl` directly.
+
+Pattern (established in all existing primitives):
+```typescript
+// Contract → model sync
+constructor() {
+  effect(() => {
+    const contractVal = this.contract().props?.value;
+    const parsed = contractVal != null ? String(contractVal) : '';
+    untracked(() => { if (parsed === this.value()) return; this.value.set(parsed); });
+  });
+}
+// User interaction → state update
+onInput(event: Event) {
+  const target = event.target as HTMLInputElement | null;
+  if (!target || this.computedDisabled() || this.computedReadonly()) return;
+  this.value.set(target.value);
+  this.experienceAdapter.updateState(this.contract().id, 'value', target.value);
+}
+```
+
+### `onPaste` Clipboard Sanitization Pattern
+
+Apply to `TextInput` and `Textarea` only. Extract plain text from clipboard — discards all HTML/RTF:
+
+```typescript
+onPaste(event: ClipboardEvent) {
+  if (this.computedDisabled() || this.computedReadonly()) return;
+  event.preventDefault();
+  const plain = event.clipboardData?.getData('text/plain') ?? '';
+  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
+  if (!target) return;
+  const start = target.selectionStart ?? target.value.length;
+  const end = target.selectionEnd ?? target.value.length;
+  const newValue = target.value.slice(0, start) + plain + target.value.slice(end);
+  target.value = newValue;
+  this.value.set(newValue);
+  this.experienceAdapter.updateState(this.contract().id, 'value', newValue);
+}
+```
+
+### `InputNumber` — Full API Spec (section 1.3 of Component API Spec)
+
+```typescript
+export interface InputNumberProps {
+  value?: number;
+  min?: number;
+  max?: number;
+  step?: number;
+  minFractionDigits?: number;
+  maxFractionDigits?: number;
+  useGrouping?: boolean;    // thousands separator via Intl.NumberFormat
+  locale?: string;          // e.g. 'en-US', 'de-DE'
+  prefix?: string;          // text before value (e.g. '$')
+  suffix?: string;          // text after value (e.g. 'kg')
+  showButtons?: boolean;    // increment/decrement steppers
+  disabled?: boolean;
+  readonly?: boolean;
+  required?: boolean;
+  invalid?: boolean;
+  variant?: 'outlined' | 'filled' | 'text';
+  fluid?: boolean;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+}
+```
+
+Use native `<input type="number">`. Enforce `min`/`max` on `onInput`/`onBlur`. Format display with `Intl.NumberFormat` on blur (not live — avoids cursor issues). Dispatch `updateState(id, 'value', numericValue)`.
+
+### `variant` and `fluid` Implementation Pattern
+
+- **`fluid`**: `'[class.origo-[component]--fluid]': 'computedFluid()'` in host. SCSS: `.origo-[component]--fluid { display: block; width: 100%; }`
+- **`variant`**: Host class per variant. Style exclusively with `var(--origo-*)` tokens:
+  ```scss
+  :host(.origo-text-input--outlined) input { border: 1px solid var(--origo-color-border-default); }
+  :host(.origo-text-input--filled) input  { background: var(--origo-color-surface-subtle); border: none; }
+  ```
+- Default variant: `'outlined'` when not provided.
+
+### `readonly` Scope
+
+| Component | Has `readonly` | Action |
+|---|---|---|
+| `TextInputComponent` | ✅ Yes | Verify template binds `[attr.readonly]` |
+| `TextareaComponent` | ✅ Yes | Guards `onInput` — verify |
+| `CheckboxComponent` | ❌ No | Do NOT add — not applicable to boolean controls |
+| `RadioGroupComponent` | ❌ No | Do NOT add |
+| `SwitchComponent` | ❌ No | **Add** — guard `onChange()` |
+| `InputNumberComponent` | ❌ New | **Add from start** |
+
+### Architecture Compliance
+
+| AD | Rule |
+|---|---|
+| AD-4 | Import only `@origostudio/core` + Angular SDK — no cross-renderer imports |
+| AD-6 | Zero hardcoded design primitives — only `var(--origo-*)` tokens |
+| AD-12 | `data-testid` bound to `contract().id`; never use CSS class selectors in tests |
+| P1-AD-1 | Angular 18 Standalone + Signals (`input()`, `computed()`, `effect()`, `model()`) |
+| P1-AD-5 | Composition over inheritance — inject `WebExperienceAdapterService`, no base classes |
+| P1-AD-6 | axe-core in CI — bind `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required` |
+| P2-AD-2 | Reactive Forms substrate — use `model<T>()` + `updateState()`, NOT `ControlValueAccessor` |
+
+### SSR Compatibility Guard
+
+Any DOM access (e.g., `scrollHeight` for `autoResize`) must be guarded:
+
+```typescript
+import { PLATFORM_ID } from '@angular/core';
+import { isPlatformBrowser } from '@angular/common';
+
+private platformId = inject(PLATFORM_ID);
+
+someMethod() {
+  if (!isPlatformBrowser(this.platformId)) return;
+  // safe DOM access here
+}
+```
+
+### File Structure
+
+```
+packages/angular-renderer/src/components/primitives/
+  text-input/        ← EXISTS — extend only
+  textarea/          ← EXISTS — extend only
+  checkbox/          ← EXISTS — extend only
+  radio-group/       ← EXISTS — extend only
+  switch/            ← EXISTS — extend only
+  input-number/      ← NEW (create all 4 files)
+```
+
+Do NOT create components in `src/lib/`. Do NOT add `.pw.ts` Playwright files.
+
+### Registration (MANDATORY for InputNumber)
+
+**`primitives.provider.ts`:** `['InputNumber', InputNumberComponent]`
+**`index.ts`:** `export * from './components/primitives/input-number/input-number.component';`
+
+### Test Pattern (Jest + ShadowDom)
+
+```typescript
+import { TestBed, ComponentFixture } from '@angular/core/testing';
+import { ComponentRef } from '@angular/core';
+import { TextInputComponent } from './text-input.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+describe('TextInputComponent', () => {
+  let fixture: ComponentFixture<TextInputComponent>;
+  let componentRef: ComponentRef<TextInputComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [TextInputComponent],
+      providers: [WebExperienceAdapterService],
+    }).compileComponents();
+    fixture = TestBed.createComponent(TextInputComponent);
+    componentRef = fixture.componentRef;
+  });
+
+  it('should instantiate from a pure JSON contract', () => {
+    componentRef.setInput('contract', { id: 'input-1', type: 'TextInput', props: { value: 'hello' } });
+    fixture.detectChanges();
+    expect(fixture.componentInstance).toBeTruthy();
+  });
+
+  it('should strip HTML formatting on paste', () => {
+    componentRef.setInput('contract', { id: 'input-1', type: 'TextInput', props: {} });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const input = root.querySelector('input') as HTMLInputElement;
+    const dt = new DataTransfer();
+    dt.setData('text/html', '<b>bold text</b>');
+    dt.setData('text/plain', 'bold text');
+    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt }));
+    expect(fixture.componentInstance.value()).toBe('bold text');
+  });
+});
+```
+
+### Previous Story Intelligence
+
+From Story 1.1 (`1-1-core-buttons-and-actions`) — confirmed review findings to prevent same mistakes:
+
+- **Zero hardcoded CSS:** Review caught hardcoded literal values. Use only `var(--origo-*)` tokens.
+- **Accessibility:** Review caught missing WAI-ARIA roles. Verify `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`. Fallback `aria-label` to `label` prop if not explicitly set.
+- **Explicit input `type`:** Review caught missing `type="button"`. For inputs: always set `type="text"`, `type="number"`, `type="checkbox"` explicitly.
+- **`contractSchema`:** Review caught missing props. Include ALL props (including ARIA) in the `static readonly contractSchema`.
+- **Host class string interpolation:** Do not interpolate inside `class` attribute — use `host: { '[class.origo-foo]': 'true' }`.
+- **Shadow DOM styling:** CSS custom property tokens pierce shadow boundaries — no workarounds needed.
+- **`indeterminate` on checkbox:** Bind as JS property `[indeterminate]`, not as HTML attribute.
+
+### Sibling Patterns — Mandatory Reading
+
+- [`switch.component.ts`](packages/angular-renderer/src/components/primitives/switch/switch.component.ts) — `coerceContractProps` + `effect()` sync pattern for booleans
+- [`textarea.component.ts`](packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts) — `DomSanitizer` + `SecurityContext.HTML` XSS pattern
+- [`radio-group.component.ts`](packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts) — `options[]` array with `Array.isArray()` guard
+- [`chip.component.ts`](packages/angular-renderer/src/components/primitives/chip/chip.component.ts) — `model<boolean>()` + `updateState` for stateful toggle
+
+### Latest Tech Information
+
+- **`model<T>()`:** Use for all stateful components (not `signal()`). Established pattern across all existing primitives.
+- **`Intl.NumberFormat`:** Web-native API — no external library needed. Call in `onBlur` (not `onInput`) to avoid cursor position issues.
+- **`coerceContractProps`:** From `../../../adapters/web/adapter`. Use when type-coercing boolean/number props from JSON contract (see `SwitchComponent`).
+
+## References
+
+- [`TextInputComponent`](packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts)
+- [`TextareaComponent`](packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts)
+- [`CheckboxComponent`](packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts)
+- [`RadioGroupComponent`](packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts)
+- [`SwitchComponent`](packages/angular-renderer/src/components/primitives/switch/switch.component.ts)
+- [`OrigoAdapter + coerceContractProps`](packages/angular-renderer/src/adapters/web/adapter.ts)
+- [`primitives.provider.ts`](packages/angular-renderer/src/lib/primitives.provider.ts)
+- [`index.ts barrel exports`](packages/angular-renderer/src/index.ts)
+- [Component API Spec — Section 1: Form Components](_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/Origo-Design-Component-API-Specification.md)
+- [Phase 2 Architecture Spine](_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/ARCHITECTURE-SPINE.md)
+
+## Dev Agent Record
+
+### Agent Model Used
+
+### Debug Log References
+
+### Completion Notes
+
+### File List
+
+### Review Findings
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index 2713ce2..98371c6 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-10-07T19:00:21+05:30
-last_updated: 2026-10-07T20:23:45+05:30
+last_updated: 2026-10-08T10:24:37+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -50,7 +50,7 @@ story_location: '{project-root}/_bmad-output/implementation-artifacts/stories'
 development_status:
   epic-1: in-progress
   1-1-core-buttons-and-actions: done
-  1-2-core-input-controls: backlog
+  1-2-core-input-controls: in-progress
   1-3-core-selection-controls: backlog
   1-4-date-and-time-controls: backlog
   1-5-application-layout-primitives: backlog
diff --git a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html
index 72d4ec9..6a60612 100644
--- a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html
+++ b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html
@@ -1,16 +1,25 @@
-<label [for]="contract().id" [class.disabled]="computedDisabled()">
-  <input
-    type="checkbox"
-    [id]="contract().id"
-    [disabled]="computedDisabled()"
-    [required]="computedRequired()"
-    [attr.aria-label]="computedAriaLabel()"
-    [attr.aria-describedby]="computedAriaDescribedBy()"
-    (change)="onChange($event)"
-    [checked]="checked()"
-  />
-  <span class="label-text">{{ computedLabel() }}</span>
-  @if (computedRequired()) {
-    <span class="required-indicator" aria-hidden="true">*</span>
+<div class="origo-checkbox__wrapper">
+  <label [for]="contract().id" [class.disabled]="computedDisabled()">
+    <input
+      type="checkbox"
+      [id]="contract().id"
+      [disabled]="computedDisabled()"
+      [required]="computedRequired()"
+      [attr.aria-label]="computedAriaLabel()"
+      [attr.aria-describedby]="computedAriaDescribedBy()"
+      [attr.aria-invalid]="computedInvalid() ? 'true' : null"
+      (change)="onChange($event)"
+      [checked]="checked()"
+    />
+    <span class="label-text">{{ computedLabel() }}</span>
+    @if (computedRequired()) {
+      <span class="required-indicator" aria-hidden="true">*</span>
+    }
+  </label>
+  @if (computedErrorText()) {
+    <div class="origo-checkbox__error">{{ computedErrorText() }}</div>
   }
-</label>
+  @if (computedHelpText()) {
+    <div class="origo-checkbox__help">{{ computedHelpText() }}</div>
+  }
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.scss b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.scss
index fcdf467..8a100e1 100644
--- a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.scss
+++ b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.scss
@@ -2,28 +2,33 @@
   display: block;
 }
 
+.origo-checkbox__wrapper {
+  display: flex;
+  flex-direction: column;
+}
+
 label {
   display: inline-flex;
   align-items: center;
-  gap: var(--origo-spacing-container-padding, 8px);
+  gap: var(--origo-spacing-container-padding);
   cursor: pointer;
-  font-family: var(--origo-typography-input-font-family, inherit);
-  font-size: var(--origo-typography-input-font-size, 1rem);
-  color: var(--origo-color-text-primary, #333);
+  font-family: var(--origo-typography-input-font-family);
+  font-size: var(--origo-typography-input-font-size);
+  color: var(--origo-color-text-primary);
 
   &.disabled {
-    opacity: var(--origo-opacity-disabled, 0.5);
+    opacity: var(--origo-opacity-disabled);
     cursor: not-allowed;
   }
 }
 
 input[type='checkbox'] {
   margin: 0;
-  accent-color: var(--origo-color-focus, #005fcc);
+  accent-color: var(--origo-color-focus);
 
   &:focus-visible {
-    outline: 2px solid var(--origo-color-focus, #005fcc);
-    outline-offset: 2px;
+    outline: var(--origo-border-width-thick) solid var(--origo-color-focus);
+    outline-offset: var(--origo-border-width-thick);
   }
 
   &:disabled {
@@ -32,5 +37,16 @@ input[type='checkbox'] {
 }
 
 .required-indicator {
-  color: var(--origo-color-error, #d32f2f);
+  color: var(--origo-color-error);
+}
+
+.origo-checkbox__error {
+  color: var(--origo-color-text-danger);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
+.origo-checkbox__help {
+  color: var(--origo-color-text-muted);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
 }
diff --git a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.spec.ts b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.spec.ts
index d6a0dab..244c872 100644
--- a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.spec.ts
+++ b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.spec.ts
@@ -111,4 +111,31 @@ describe('CheckboxComponent', () => {
       expect(element.style.marginRight).toBeFalsy();
     }
   });
+
+  it('should render errorText and helpText', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'Checkbox',
+      props: { errorText: 'Error message', helpText: 'Help message' },
+    });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const errorEl = root.querySelector('.origo-checkbox__error');
+    const helpEl = root.querySelector('.origo-checkbox__help');
+    expect(errorEl).toBeTruthy();
+    expect(errorEl?.textContent?.trim()).toBe('Error message');
+    expect(helpEl).toBeTruthy();
+    expect(helpEl?.textContent?.trim()).toBe('Help message');
+  });
+
+  it('should bind aria-invalid based on invalid prop', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'Checkbox',
+      props: { invalid: true },
+    });
+    fixture.detectChanges();
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl!.getAttribute('aria-invalid')).toBe('true');
+  });
 });
diff --git a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts
index d3f7dd1..975694c 100644
--- a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts
+++ b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts
@@ -20,6 +20,9 @@ export interface CheckboxProps {
   'aria-label'?: string;
   'aria-describedby'?: string;
   required?: boolean;
+  invalid?: boolean;
+  errorText?: string;
+  helpText?: string;
 }
 
 @Component({
@@ -40,6 +43,9 @@ export class CheckboxComponent implements OrigoAdapter<CheckboxProps> {
     label: 'string',
     disabled: 'boolean',
     required: 'boolean',
+    invalid: 'boolean',
+    errorText: 'string',
+    helpText: 'string',
   };
   static readonly strictContract = false;
 
@@ -62,6 +68,10 @@ export class CheckboxComponent implements OrigoAdapter<CheckboxProps> {
       : undefined;
   });
 
+  computedInvalid = computed(() => !!this.contract().props?.invalid);
+  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
+  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
+
   private experienceAdapter = inject(WebExperienceAdapterService);
 
   constructor() {
diff --git a/packages/angular-renderer/src/components/primitives/input-number/input-number.component.html b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.html
new file mode 100644
index 0000000..63de9cd
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.html
@@ -0,0 +1,24 @@
+<div class="origo-input-number__wrapper">
+  <input
+    type="number"
+    [id]="contract().id"
+    [disabled]="computedDisabled()"
+    [readonly]="computedReadonly()"
+    [required]="computedRequired()"
+    [attr.min]="computedMin()"
+    [attr.max]="computedMax()"
+    [attr.step]="computedStep()"
+    [attr.placeholder]="computedPlaceholder()"
+    [attr.aria-label]="computedAriaLabel()"
+    [attr.aria-describedby]="computedAriaDescribedBy()"
+    [attr.aria-invalid]="computedInvalid() ? 'true' : null"
+    (input)="onInput($event)"
+    [value]="value() ?? ''"
+  />
+</div>
+@if (computedErrorText()) {
+  <div class="origo-input-number__error">{{ computedErrorText() }}</div>
+}
+@if (computedHelpText()) {
+  <div class="origo-input-number__help">{{ computedHelpText() }}</div>
+}
diff --git a/packages/angular-renderer/src/components/primitives/input-number/input-number.component.scss b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.scss
new file mode 100644
index 0000000..c44d505
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.scss
@@ -0,0 +1,80 @@
+:host {
+  display: inline-block;
+}
+
+:host(.origo-input-number--fluid) {
+  display: block;
+  width: 100%;
+}
+
+.origo-input-number__wrapper {
+  display: flex;
+  flex-direction: column;
+}
+
+input {
+  box-sizing: border-box;
+  width: 100%;
+  background-color: var(--origo-color-surface-background);
+  color: var(--origo-color-text-primary);
+  padding: var(--origo-spacing-container-padding);
+  border: var(--origo-border-width-default) solid var(--origo-color-border-default);
+  border-radius: var(--origo-radius-sm);
+  box-shadow: var(--origo-shadow-sm);
+  font-family: var(--origo-typography-input-font-family);
+  font-size: var(--origo-typography-input-font-size);
+  font-weight: var(--origo-typography-input-font-weight);
+  line-height: var(--origo-typography-input-line-height);
+  transition: all var(--origo-duration-fast) ease-in-out;
+
+  &::placeholder {
+    color: var(--origo-color-text-muted);
+  }
+
+  &:hover:not(:disabled):not([readonly]) {
+    border-color: var(--origo-color-border-hover);
+  }
+
+  &:active:not(:disabled):not([readonly]) {
+    border-color: var(--origo-color-border-active);
+  }
+
+  &:focus,
+  &:focus-visible {
+    outline: var(--origo-border-width-thick) solid var(--origo-color-focus);
+    outline-offset: var(--origo-border-offset-negative);
+    border-color: var(--origo-color-focus);
+  }
+
+  &:disabled {
+    cursor: not-allowed;
+    opacity: var(--origo-opacity-disabled);
+    background-color: var(--origo-color-surface-disabled);
+    color: var(--origo-color-text-disabled);
+  }
+
+  &[readonly] {
+    background-color: var(--origo-color-surface-readonly);
+  }
+}
+
+:host(.origo-input-number--filled) input {
+  background-color: var(--origo-color-surface-subtle);
+  border: none;
+}
+
+:host(.origo-input-number--text) input {
+  background-color: transparent;
+  border: none;
+}
+
+.origo-input-number__error {
+  color: var(--origo-color-text-danger);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
+.origo-input-number__help {
+  color: var(--origo-color-text-muted);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
diff --git a/packages/angular-renderer/src/components/primitives/input-number/input-number.component.spec.ts b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.spec.ts
new file mode 100644
index 0000000..e3e538d
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.spec.ts
@@ -0,0 +1,150 @@
+/* eslint-disable @typescript-eslint/no-non-null-assertion */
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { InputNumberComponent } from './input-number.component';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+import { provideZonelessChangeDetection } from '@angular/core';
+
+describe('InputNumberComponent', () => {
+  let component: InputNumberComponent;
+  let fixture: ComponentFixture<InputNumberComponent>;
+  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;
+
+  beforeEach(async () => {
+    mockExperienceAdapter = {
+      updateState: jest.fn(),
+      dispatchCapability: jest.fn(),
+    } as unknown as jest.Mocked<WebExperienceAdapterService>;
+
+    await TestBed.configureTestingModule({
+      imports: [InputNumberComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
+      ],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(InputNumberComponent);
+    component = fixture.componentInstance;
+  });
+
+  it('should render correctly with valid contract', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'input-num-1',
+      type: 'InputNumber',
+      props: {
+        value: 42,
+        placeholder: 'Enter a number',
+        disabled: true,
+        readonly: true,
+        required: true,
+        min: 0,
+        max: 100,
+        step: 5,
+      },
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl).toBeTruthy();
+    expect(inputEl!.id).toBe('input-num-1');
+    expect(inputEl!.value).toBe('42');
+    expect(inputEl!.getAttribute('placeholder')).toBe('Enter a number');
+    expect(inputEl!.getAttribute('min')).toBe('0');
+    expect(inputEl!.getAttribute('max')).toBe('100');
+    expect(inputEl!.getAttribute('step')).toBe('5');
+    expect(inputEl!.disabled).toBe(true);
+    expect(inputEl!.readOnly).toBe(true);
+    expect(inputEl!.required).toBe(true);
+  });
+
+  it('should handle null props gracefully', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'input-num-2',
+      type: 'InputNumber',
+      props: null,
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl).toBeTruthy();
+    expect(inputEl!.value).toBe('');
+  });
+
+  it('should bind ARIA attributes', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'input-num-3',
+      type: 'InputNumber',
+      props: { 'aria-label': 'My Number', 'aria-describedby': 'desc-1', invalid: true },
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl!.getAttribute('aria-label')).toBe('My Number');
+    expect(inputEl!.getAttribute('aria-describedby')).toBe('desc-1');
+    expect(inputEl!.getAttribute('aria-invalid')).toBe('true');
+  });
+
+  it('should dispatch state update on valid input', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'input-num-4',
+      type: 'InputNumber',
+      props: { value: 10 },
+    });
+    fixture.detectChanges();
+
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    inputEl!.value = '25';
+    inputEl!.dispatchEvent(new Event('input'));
+
+    expect(component.value()).toBe(25);
+    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('input-num-4', 'value', 25);
+  });
+
+  it('should ignore invalid number inputs', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'input-num-5',
+      type: 'InputNumber',
+      props: { value: 10 },
+    });
+    fixture.detectChanges();
+
+    // Mock an event where the browser might somehow provide a non-number string,
+    // or simulate validity.badInput if we check it.
+    component.onInput({
+      target: { value: 'not-a-number' } as unknown as HTMLInputElement,
+    } as unknown as Event);
+
+    expect(component.value()).toBe(10); // remains unchanged
+    expect(mockExperienceAdapter.updateState).not.toHaveBeenCalled();
+  });
+
+  it('should apply variant and fluid classes to host', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'input-num-6',
+      type: 'InputNumber',
+      props: { variant: 'filled', fluid: true },
+    });
+    fixture.detectChanges();
+
+    expect(fixture.nativeElement.classList.contains('origo-input-number--filled')).toBe(true);
+    expect(fixture.nativeElement.classList.contains('origo-input-number--fluid')).toBe(true);
+  });
+
+  it('should render errorText and helpText', () => {
+    fixture.componentRef.setInput('contract', {
+      id: 'input-num-7',
+      type: 'InputNumber',
+      props: { errorText: 'Error', helpText: 'Help' },
+    });
+    fixture.detectChanges();
+
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const errorEl = root.querySelector('.origo-input-number__error');
+    const helpEl = root.querySelector('.origo-input-number__help');
+
+    expect(errorEl).toBeTruthy();
+    expect(errorEl?.textContent?.trim()).toBe('Error');
+    expect(helpEl).toBeTruthy();
+    expect(helpEl?.textContent?.trim()).toBe('Help');
+  });
+});
diff --git a/packages/angular-renderer/src/components/primitives/input-number/input-number.component.ts b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.ts
new file mode 100644
index 0000000..b8df9e6
--- /dev/null
+++ b/packages/angular-renderer/src/components/primitives/input-number/input-number.component.ts
@@ -0,0 +1,143 @@
+import {
+  Component,
+  input,
+  model,
+  ChangeDetectionStrategy,
+  computed,
+  ViewEncapsulation,
+  inject,
+  effect,
+  untracked,
+  SecurityContext,
+} from '@angular/core';
+import { DomSanitizer } from '@angular/platform-browser';
+import { InteractionContract } from '@origostudio/core';
+import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
+import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
+
+export interface InputNumberProps {
+  value?: number;
+  placeholder?: string;
+  disabled?: boolean;
+  readonly?: boolean;
+  min?: number;
+  max?: number;
+  step?: number;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+  required?: boolean;
+  invalid?: boolean;
+  errorText?: string;
+  helpText?: string;
+  variant?: 'outlined' | 'filled' | 'text';
+  fluid?: boolean;
+}
+
+@Component({
+  selector: 'origo-input-number',
+  standalone: true,
+  templateUrl: './input-number.component.html',
+  styleUrls: ['./input-number.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,
+  host: {
+    '[class.origo-input-number]': 'true',
+    '[attr.data-testid]': 'contract().id',
+    '[class.origo-input-number--fluid]': 'computedFluid()',
+    '[class.origo-input-number--outlined]': 'computedVariant() === "outlined"',
+    '[class.origo-input-number--filled]': 'computedVariant() === "filled"',
+    '[class.origo-input-number--text]': 'computedVariant() === "text"',
+  },
+})
+export class InputNumberComponent implements OrigoAdapter<InputNumberProps> {
+  static readonly contractSchema: Record<
+    string,
+    'string' | 'number' | 'boolean' | 'object' | 'array'
+  > = {
+    value: 'number',
+    placeholder: 'string',
+    disabled: 'boolean',
+    readonly: 'boolean',
+    min: 'number',
+    max: 'number',
+    step: 'number',
+    required: 'boolean',
+    invalid: 'boolean',
+    errorText: 'string',
+    helpText: 'string',
+    variant: 'string',
+    fluid: 'boolean',
+  };
+  static readonly strictContract = false;
+
+  contract = input.required<InteractionContract<InputNumberProps>>();
+  value = model<number | undefined>(undefined);
+
+  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
+  computedDisabled = computed(() => !!this.contract().props?.disabled);
+  computedReadonly = computed(() => !!this.contract().props?.readonly);
+  computedMin = computed(() => this.contract().props?.min);
+  computedMax = computed(() => this.contract().props?.max);
+  computedStep = computed(() => this.contract().props?.step);
+  computedRequired = computed(() => !!this.contract().props?.required);
+  computedInvalid = computed(() => !!this.contract().props?.invalid);
+  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
+  computedFluid = computed(() => !!this.contract().props?.fluid);
+  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
+  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
+
+  computedAriaLabel = computed(() => {
+    const label = this.contract().props?.['aria-label'];
+    return label !== undefined && label !== null && String(label).trim() !== ''
+      ? String(label)
+      : undefined;
+  });
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract().props?.['aria-describedby'];
+    return desc !== undefined && desc !== null && String(desc).trim() !== ''
+      ? String(desc)
+      : undefined;
+  });
+
+  private experienceAdapter = inject(WebExperienceAdapterService);
+  private sanitizer = inject(DomSanitizer);
+
+  constructor() {
+    effect(() => {
+      const props = this.contract().props;
+      const coerced = props
+        ? coerceContractProps<Record<string, unknown>>(props, InputNumberComponent.contractSchema)
+        : {};
+      const contractVal = coerced['value'];
+
+      const parsedVal = typeof contractVal === 'number' ? contractVal : undefined;
+      untracked(() => {
+        if (parsedVal === this.value()) return;
+        this.value.set(parsedVal);
+      });
+    });
+  }
+
+  onInput(event: Event) {
+    const target = event.target as HTMLInputElement | null;
+    if (!target || this.computedDisabled() || this.computedReadonly()) return;
+
+    const rawValue = target.value;
+    const sanitizedValue =
+      this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || '';
+
+    if (target.value !== sanitizedValue) {
+      target.value = sanitizedValue;
+    }
+
+    const numValue = sanitizedValue === '' ? undefined : Number(sanitizedValue);
+
+    // Check if it's a valid number. If not, don't update state but let the user type
+    if (sanitizedValue !== '' && isNaN(Number(sanitizedValue))) {
+      return;
+    }
+
+    this.value.set(numValue);
+    this.experienceAdapter.updateState(this.contract().id, 'value', numValue);
+  }
+}
diff --git a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html
index fd145b1..f729c78 100644
--- a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html
+++ b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html
@@ -1,4 +1,8 @@
-<fieldset [disabled]="computedDisabled()" [attr.aria-describedby]="computedAriaDescribedBy()">
+<fieldset
+  [disabled]="computedDisabled()"
+  [attr.aria-describedby]="computedAriaDescribedBy()"
+  [attr.aria-invalid]="computedInvalid() ? 'true' : null"
+>
   <legend class="visually-hidden">{{ computedAriaLabel() ?? 'Radio Group' }}</legend>
 
   <div class="radio-options">
@@ -18,3 +22,9 @@
     }
   </div>
 </fieldset>
+@if (computedErrorText()) {
+  <div class="origo-radio-group__error">{{ computedErrorText() }}</div>
+}
+@if (computedHelpText()) {
+  <div class="origo-radio-group__help">{{ computedHelpText() }}</div>
+}
diff --git a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.scss b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.scss
index 98090b8..5ce0384 100644
--- a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.scss
+++ b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.scss
@@ -8,7 +8,7 @@ fieldset {
   margin: 0;
 
   &:disabled {
-    opacity: var(--origo-opacity-disabled, 0.5);
+    opacity: var(--origo-opacity-disabled);
 
     .radio-label {
       cursor: not-allowed;
@@ -30,25 +30,36 @@ fieldset {
 .radio-options {
   display: flex;
   flex-direction: column;
-  gap: var(--origo-spacing-container-padding, 8px);
+  gap: var(--origo-spacing-container-padding);
 }
 
 .radio-label {
   display: inline-flex;
   align-items: center;
-  gap: var(--origo-spacing-container-padding, 8px);
+  gap: var(--origo-spacing-container-padding);
   cursor: pointer;
-  font-family: var(--origo-typography-input-font-family, inherit);
-  font-size: var(--origo-typography-input-font-size, 1rem);
-  color: var(--origo-color-text-primary, #333);
+  font-family: var(--origo-typography-input-font-family);
+  font-size: var(--origo-typography-input-font-size);
+  color: var(--origo-color-text-primary);
 }
 
 input[type='radio'] {
   margin: 0;
-  accent-color: var(--origo-color-focus, #005fcc);
+  accent-color: var(--origo-color-focus);
 
   &:focus-visible {
-    outline: 2px solid var(--origo-color-focus, #005fcc);
-    outline-offset: 2px;
+    outline: var(--origo-border-width-thick) solid var(--origo-color-focus);
+    outline-offset: var(--origo-border-width-thick);
   }
 }
+
+.origo-radio-group__error {
+  color: var(--origo-color-text-danger);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
+.origo-radio-group__help {
+  color: var(--origo-color-text-muted);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
diff --git a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.spec.ts b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.spec.ts
index 5ec38a9..e018962 100644
--- a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.spec.ts
+++ b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.spec.ts
@@ -117,4 +117,31 @@ describe('RadioGroupComponent', () => {
       expect(element.style.marginRight).toBeFalsy();
     }
   });
+
+  it('should render errorText and helpText', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'RadioGroup',
+      props: { errorText: 'Error message', helpText: 'Help message' },
+    });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const errorEl = root.querySelector('.origo-radio-group__error');
+    const helpEl = root.querySelector('.origo-radio-group__help');
+    expect(errorEl).toBeTruthy();
+    expect(errorEl?.textContent?.trim()).toBe('Error message');
+    expect(helpEl).toBeTruthy();
+    expect(helpEl?.textContent?.trim()).toBe('Help message');
+  });
+
+  it('should bind aria-invalid based on invalid prop', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'RadioGroup',
+      props: { invalid: true },
+    });
+    fixture.detectChanges();
+    const fieldset = fixture.nativeElement.shadowRoot!.querySelector('fieldset');
+    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
+  });
 });
diff --git a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts
index 65ebb55..10985d5 100644
--- a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts
+++ b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts
@@ -20,6 +20,9 @@ export interface RadioGroupProps {
   'aria-label'?: string;
   'aria-describedby'?: string;
   required?: boolean;
+  invalid?: boolean;
+  errorText?: string;
+  helpText?: string;
 }
 
 @Component({
@@ -40,6 +43,9 @@ export class RadioGroupComponent implements OrigoAdapter<RadioGroupProps> {
     value: 'string',
     disabled: 'boolean',
     required: 'boolean',
+    invalid: 'boolean',
+    errorText: 'string',
+    helpText: 'string',
   };
   static readonly strictContract = false;
 
@@ -65,6 +71,10 @@ export class RadioGroupComponent implements OrigoAdapter<RadioGroupProps> {
       : undefined;
   });
 
+  computedInvalid = computed(() => !!this.contract().props?.invalid);
+  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
+  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
+
   private experienceAdapter = inject(WebExperienceAdapterService);
 
   constructor() {
diff --git a/packages/angular-renderer/src/components/primitives/switch/switch.component.html b/packages/angular-renderer/src/components/primitives/switch/switch.component.html
index 04e722a..d32ee06 100644
--- a/packages/angular-renderer/src/components/primitives/switch/switch.component.html
+++ b/packages/angular-renderer/src/components/primitives/switch/switch.component.html
@@ -1,16 +1,25 @@
-<label [for]="contract().id" [class.disabled]="computedDisabled()">
-  <input
-    type="checkbox"
-    role="switch"
-    [id]="contract().id"
-    [checked]="checked()"
-    [disabled]="computedDisabled()"
-    [attr.aria-checked]="checked().toString()"
-    [attr.aria-label]="computedAriaLabel() ?? undefined"
-    [attr.aria-describedby]="computedAriaDescribedBy() ?? undefined"
-    (change)="onChange($event)"
-  />
-  @if (computedLabel()) {
-    <span class="label-text">{{ computedLabel() }}</span>
+<div class="origo-switch__wrapper">
+  <label [for]="contract().id" [class.disabled]="computedDisabled()">
+    <input
+      type="checkbox"
+      role="switch"
+      [id]="contract().id"
+      [checked]="checked()"
+      [disabled]="computedDisabled()"
+      [attr.aria-checked]="checked().toString()"
+      [attr.aria-label]="computedAriaLabel() ?? undefined"
+      [attr.aria-describedby]="computedAriaDescribedBy() ?? undefined"
+      [attr.aria-invalid]="computedInvalid() ? 'true' : null"
+      (change)="onChange($event)"
+    />
+    @if (computedLabel()) {
+      <span class="label-text">{{ computedLabel() }}</span>
+    }
+  </label>
+  @if (computedErrorText()) {
+    <div class="origo-switch__error">{{ computedErrorText() }}</div>
   }
-</label>
+  @if (computedHelpText()) {
+    <div class="origo-switch__help">{{ computedHelpText() }}</div>
+  }
+</div>
diff --git a/packages/angular-renderer/src/components/primitives/switch/switch.component.scss b/packages/angular-renderer/src/components/primitives/switch/switch.component.scss
index 60b1f96..220705b 100644
--- a/packages/angular-renderer/src/components/primitives/switch/switch.component.scss
+++ b/packages/angular-renderer/src/components/primitives/switch/switch.component.scss
@@ -2,35 +2,40 @@
   display: inline-block;
 }
 
+.origo-switch__wrapper {
+  display: flex;
+  flex-direction: column;
+}
+
 label {
   display: inline-flex;
   align-items: center;
-  gap: var(--origo-spacing-container-padding, 8px);
+  gap: var(--origo-spacing-container-padding);
   cursor: pointer;
-  font-family: var(--origo-typography-input-font-family, inherit);
-  font-size: var(--origo-typography-input-font-size, 1rem);
-  color: var(--origo-color-text-primary, #333333);
+  font-family: var(--origo-typography-input-font-family);
+  font-size: var(--origo-typography-input-font-size);
+  color: var(--origo-color-text-primary);
 
   &.disabled {
-    opacity: var(--origo-opacity-disabled, 0.5);
+    opacity: var(--origo-opacity-disabled);
     cursor: not-allowed;
   }
 }
 
 input[type='checkbox'][role='switch'] {
   appearance: none;
-  width: var(--origo-switch-track-width, 40px);
-  height: var(--origo-switch-track-height, 22px);
-  background-color: var(--origo-color-surface-variant, #e0e0e0);
-  border-radius: var(--origo-radius-switch-track, 11px);
+  width: var(--origo-switch-track-width);
+  height: var(--origo-switch-track-height);
+  background-color: var(--origo-color-surface-variant);
+  border-radius: var(--origo-radius-switch-track);
   position: relative;
   outline: none;
   cursor: pointer;
   margin: 0;
-  transition: background-color 0.2s ease-in-out;
+  transition: background-color var(--origo-duration-fast) ease-in-out;
 
   &:hover:not(:disabled) {
-    background-color: var(--origo-color-surface-variant-hover, #d0d0d0);
+    background-color: var(--origo-color-surface-variant-hover);
   }
 
   &::after {
@@ -38,29 +43,40 @@ input[type='checkbox'][role='switch'] {
     position: absolute;
     top: 2px;
     inset-inline-start: 2px;
-    width: var(--origo-switch-thumb-size, 18px);
-    height: var(--origo-switch-thumb-size, 18px);
-    background-color: var(--origo-color-on-accent, #ffffff);
+    width: var(--origo-switch-thumb-size);
+    height: var(--origo-switch-thumb-size);
+    background-color: var(--origo-color-on-accent);
     border-radius: 50%;
     transition:
-      inset-inline-start 0.2s ease-in-out,
-      transform 0.2s ease-in-out;
+      inset-inline-start var(--origo-duration-fast) ease-in-out,
+      transform var(--origo-duration-fast) ease-in-out;
   }
 
   &:checked {
-    background-color: var(--origo-color-accent, var(--origo-color-primary, #005fcc));
+    background-color: var(--origo-color-accent);
 
     &::after {
-      inset-inline-start: calc(100% - var(--origo-switch-thumb-size, 18px) - 2px);
+      inset-inline-start: calc(100% - var(--origo-switch-thumb-size) - 2px);
     }
   }
 
   &:focus-visible {
-    outline: 2px solid var(--origo-color-focus, #005fcc);
-    outline-offset: 2px;
+    outline: var(--origo-border-width-thick) solid var(--origo-color-focus);
+    outline-offset: var(--origo-border-width-thick);
   }
 
   &:disabled {
     cursor: not-allowed;
   }
 }
+
+.origo-switch__error {
+  color: var(--origo-color-text-danger);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
+.origo-switch__help {
+  color: var(--origo-color-text-muted);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
diff --git a/packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts b/packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts
index 9ed18bf..a0ae1fc 100644
--- a/packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts
+++ b/packages/angular-renderer/src/components/primitives/switch/switch.component.spec.ts
@@ -96,4 +96,31 @@ describe('SwitchComponent', () => {
     expect(style.paddingLeft).toBe('');
     expect(style.paddingRight).toBe('');
   });
+
+  it('should render errorText and helpText', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'Switch',
+      props: { errorText: 'Error message', helpText: 'Help message' },
+    });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const errorEl = root.querySelector('.origo-switch__error');
+    const helpEl = root.querySelector('.origo-switch__help');
+    expect(errorEl).toBeTruthy();
+    expect(errorEl?.textContent?.trim()).toBe('Error message');
+    expect(helpEl).toBeTruthy();
+    expect(helpEl?.textContent?.trim()).toBe('Help message');
+  });
+
+  it('should bind aria-invalid based on invalid prop', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'Switch',
+      props: { invalid: true },
+    });
+    fixture.detectChanges();
+    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
+    expect(inputEl!.getAttribute('aria-invalid')).toBe('true');
+  });
 });
diff --git a/packages/angular-renderer/src/components/primitives/switch/switch.component.ts b/packages/angular-renderer/src/components/primitives/switch/switch.component.ts
index c08f2d9..3dcdd7c 100644
--- a/packages/angular-renderer/src/components/primitives/switch/switch.component.ts
+++ b/packages/angular-renderer/src/components/primitives/switch/switch.component.ts
@@ -19,6 +19,9 @@ export interface SwitchProps {
   disabled?: boolean;
   'aria-label'?: string;
   'aria-describedby'?: string;
+  invalid?: boolean;
+  errorText?: string;
+  helpText?: string;
 }
 
 @Component({
@@ -41,6 +44,9 @@ export class SwitchComponent implements OrigoAdapter<SwitchProps> {
     checked: 'boolean',
     label: 'string',
     disabled: 'boolean',
+    invalid: 'boolean',
+    errorText: 'string',
+    helpText: 'string',
   };
   static readonly strictContract = false;
 
@@ -58,6 +64,10 @@ export class SwitchComponent implements OrigoAdapter<SwitchProps> {
     return v !== undefined && v !== null && String(v).trim() !== '' ? String(v) : undefined;
   });
 
+  computedInvalid = computed(() => !!this.contract().props?.invalid);
+  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
+  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
+
   private experienceAdapter = inject(WebExperienceAdapterService);
 
   constructor() {
diff --git a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.html b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.html
index d5aa6bb..d7a68ca 100644
--- a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.html
+++ b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.html
@@ -1,10 +1,21 @@
-<input
-  type="text"
-  [value]="value()"
-  (input)="onInput($event)"
-  [placeholder]="computedPlaceholder()"
-  [disabled]="computedDisabled()"
-  [readonly]="computedReadonly()"
-  [attr.aria-label]="computedAriaLabel()"
-  [attr.aria-describedby]="computedAriaDescribedBy()"
-/>
+<div class="origo-text-input__wrapper">
+  <input
+    [attr.type]="computedType()"
+    [value]="value()"
+    (input)="onInput($event)"
+    (paste)="onPaste($event)"
+    [placeholder]="computedPlaceholder()"
+    [disabled]="computedDisabled()"
+    [readonly]="computedReadonly()"
+    [attr.aria-label]="computedAriaLabel()"
+    [attr.aria-describedby]="computedAriaDescribedBy()"
+    [attr.aria-invalid]="computedInvalid() ? 'true' : null"
+    [attr.aria-required]="computedRequired() ? 'true' : null"
+  />
+</div>
+@if (computedErrorText()) {
+  <div class="origo-text-input__error">{{ computedErrorText() }}</div>
+}
+@if (computedHelpText()) {
+  <div class="origo-text-input__help">{{ computedHelpText() }}</div>
+}
diff --git a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.scss b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.scss
index 9a48a6c..0129ee4 100644
--- a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.scss
+++ b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.scss
@@ -1,42 +1,68 @@
 :host {
   display: inline-block;
 }
+:host(.origo-text-input--fluid) {
+  display: block;
+  width: 100%;
+}
+.origo-text-input__wrapper {
+  display: flex;
+  flex-direction: column;
+}
 input {
   box-sizing: border-box;
   width: 100%;
   background-color: var(--origo-color-surface-background);
   color: var(--origo-color-text-primary);
   padding: var(--origo-spacing-container-padding);
-  border: var(--origo-border-width-default, 1px) solid var(--origo-color-border-default, #ccc);
-  border-radius: var(--origo-radius-sm, 4px);
-  box-shadow: var(--origo-shadow-sm, none);
-  font-family: var(--origo-typography-input-font-family, inherit);
-  font-size: var(--origo-typography-input-font-size, inherit);
-  font-weight: var(--origo-typography-input-font-weight, inherit);
-  line-height: var(--origo-typography-input-line-height, inherit);
-  transition: all 0.2s ease-in-out;
+  border: var(--origo-border-width-default) solid var(--origo-color-border-default);
+  border-radius: var(--origo-radius-sm);
+  box-shadow: var(--origo-shadow-sm);
+  font-family: var(--origo-typography-input-font-family);
+  font-size: var(--origo-typography-input-font-size);
+  font-weight: var(--origo-typography-input-font-weight);
+  line-height: var(--origo-typography-input-line-height);
+  transition: all var(--origo-duration-fast) ease-in-out;
+}
+:host(.origo-text-input--filled) input {
+  background-color: var(--origo-color-surface-subtle);
+  border: none;
+}
+:host(.origo-text-input--text) input {
+  background-color: transparent;
+  border: none;
 }
 input::placeholder {
-  color: var(--origo-color-text-muted, #777);
+  color: var(--origo-color-text-muted);
 }
 input:hover:not(:disabled):not([readonly]) {
-  border-color: var(--origo-color-border-hover, #999);
+  border-color: var(--origo-color-border-hover);
 }
 input:active:not(:disabled):not([readonly]) {
-  border-color: var(--origo-color-border-active, #666);
+  border-color: var(--origo-color-border-active);
 }
 input:focus,
 input:focus-visible {
-  outline: 2px solid var(--origo-color-focus, #005fcc);
-  outline-offset: -1px;
-  border-color: var(--origo-color-focus, #005fcc);
+  outline: var(--origo-border-width-thick) solid var(--origo-color-focus);
+  outline-offset: var(--origo-border-offset-negative);
+  border-color: var(--origo-color-focus);
 }
 input:disabled {
   cursor: not-allowed;
-  opacity: var(--origo-opacity-disabled, 0.5);
-  background-color: var(--origo-color-surface-disabled, #eee);
-  color: var(--origo-color-text-disabled, #999);
+  opacity: var(--origo-opacity-disabled);
+  background-color: var(--origo-color-surface-disabled);
+  color: var(--origo-color-text-disabled);
 }
 input[readonly] {
-  background-color: var(--origo-color-surface-readonly, #f9f9f9);
+  background-color: var(--origo-color-surface-readonly);
+}
+.origo-text-input__error {
+  color: var(--origo-color-text-danger);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
+.origo-text-input__help {
+  color: var(--origo-color-text-muted);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
 }
diff --git a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.spec.ts b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.spec.ts
index ddc563d..af0f5a8 100644
--- a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.spec.ts
+++ b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.spec.ts
@@ -104,4 +104,70 @@ describe('TextInputComponent', () => {
       expect(element.style.marginRight).toBeFalsy();
     }
   });
+
+  it('should apply variant and fluid classes to host', () => {
+    componentRef.setInput('contract', {
+      id: '1',
+      type: 'TextInput',
+      props: { variant: 'filled', fluid: true },
+    });
+    fixture.detectChanges();
+    expect(fixture.nativeElement.classList.contains('origo-text-input--filled')).toBe(true);
+    expect(fixture.nativeElement.classList.contains('origo-text-input--fluid')).toBe(true);
+  });
+
+  it('should render errorText and helpText', () => {
+    componentRef.setInput('contract', {
+      id: '1',
+      type: 'TextInput',
+      props: { errorText: 'Error occurred', helpText: 'Some help' },
+    });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const errorEl = root.querySelector('.origo-text-input__error');
+    const helpEl = root.querySelector('.origo-text-input__help');
+    expect(errorEl).toBeTruthy();
+    expect(errorEl?.textContent?.trim()).toBe('Error occurred');
+    expect(helpEl).toBeTruthy();
+    expect(helpEl?.textContent?.trim()).toBe('Some help');
+  });
+
+  it('should bind aria-invalid and aria-required based on invalid and required props', () => {
+    componentRef.setInput('contract', {
+      id: '1',
+      type: 'TextInput',
+      props: { invalid: true, required: true },
+    });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const input = root.querySelector('input') as HTMLInputElement;
+    expect(input.getAttribute('aria-invalid')).toBe('true');
+    expect(input.getAttribute('aria-required')).toBe('true');
+  });
+
+  it('should bind type attribute correctly', () => {
+    componentRef.setInput('contract', {
+      id: '1',
+      type: 'TextInput',
+      props: { type: 'password' },
+    });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const input = root.querySelector('input') as HTMLInputElement;
+    expect(input.getAttribute('type')).toBe('password');
+  });
+
+  it('should strip HTML formatting on paste', () => {
+    componentRef.setInput('contract', { id: '1', type: 'TextInput', props: {} });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const input = root.querySelector('input') as HTMLInputElement;
+    const dt = {
+      getData: (type: string) => (type === 'text/plain' ? 'bold text' : '<b>bold text</b>'),
+    } as unknown as DataTransfer;
+    const pasteEvent = new Event('paste') as any;
+    pasteEvent.clipboardData = dt;
+    input.dispatchEvent(pasteEvent);
+    expect(component.value()).toBe('bold text');
+  });
 });
diff --git a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts
index 291ddca..ac25736 100644
--- a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts
+++ b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts
@@ -20,6 +20,13 @@ export interface TextInputProps {
   readonly?: boolean;
   'aria-label'?: string;
   'aria-describedby'?: string;
+  variant?: 'outlined' | 'filled' | 'text';
+  fluid?: boolean;
+  required?: boolean;
+  invalid?: boolean;
+  errorText?: string;
+  helpText?: string;
+  type?: string;
 }
 
 @Component({
@@ -32,6 +39,10 @@ export interface TextInputProps {
   host: {
     '[class.origo-text-input]': 'true',
     '[attr.data-testid]': 'contract().id ?? ""',
+    '[class.origo-text-input--fluid]': 'computedFluid()',
+    '[class.origo-text-input--outlined]': 'computedVariant() === "outlined"',
+    '[class.origo-text-input--filled]': 'computedVariant() === "filled"',
+    '[class.origo-text-input--text]': 'computedVariant() === "text"',
   },
 })
 export class TextInputComponent implements OrigoAdapter<TextInputProps> {
@@ -40,6 +51,13 @@ export class TextInputComponent implements OrigoAdapter<TextInputProps> {
     placeholder: 'string',
     disabled: 'boolean',
     readonly: 'boolean',
+    variant: 'string',
+    fluid: 'boolean',
+    required: 'boolean',
+    invalid: 'boolean',
+    errorText: 'string',
+    helpText: 'string',
+    type: 'string',
   };
   static readonly strictContract = false;
 
@@ -62,6 +80,14 @@ export class TextInputComponent implements OrigoAdapter<TextInputProps> {
       : undefined;
   });
 
+  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
+  computedFluid = computed(() => !!this.contract().props?.fluid);
+  computedRequired = computed(() => !!this.contract().props?.required);
+  computedInvalid = computed(() => !!this.contract().props?.invalid);
+  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
+  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
+  computedType = computed(() => this.contract().props?.type ?? 'text');
+
   private experienceAdapter = inject(WebExperienceAdapterService);
 
   constructor() {
@@ -87,4 +113,18 @@ export class TextInputComponent implements OrigoAdapter<TextInputProps> {
     this.value.set(sanitizedValue);
     this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
   }
+
+  onPaste(event: ClipboardEvent) {
+    if (this.computedDisabled() || this.computedReadonly()) return;
+    event.preventDefault();
+    const plain = event.clipboardData?.getData('text/plain') ?? '';
+    const target = event.target as HTMLInputElement | null;
+    if (!target) return;
+    const start = target.selectionStart ?? target.value.length;
+    const end = target.selectionEnd ?? target.value.length;
+    const newValue = target.value.slice(0, start) + plain + target.value.slice(end);
+    target.value = newValue;
+    this.value.set(newValue);
+    this.experienceAdapter.updateState(this.contract().id, 'value', newValue);
+  }
 }
diff --git a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.html b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.html
index 9cfae93..15b1d16 100644
--- a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.html
+++ b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.html
@@ -1,12 +1,22 @@
-<textarea
-  [id]="contract().id"
-  [disabled]="computedDisabled()"
-  [readonly]="computedReadonly()"
-  [required]="computedRequired()"
-  [attr.placeholder]="computedPlaceholder()"
-  [attr.rows]="computedRows()"
-  [attr.aria-label]="computedAriaLabel()"
-  [attr.aria-describedby]="computedAriaDescribedBy()"
-  (input)="onInput($event)"
-  [value]="value()"
-></textarea>
+<div class="origo-textarea__wrapper">
+  <textarea
+    [id]="contract().id"
+    [disabled]="computedDisabled()"
+    [readonly]="computedReadonly()"
+    [required]="computedRequired()"
+    [attr.placeholder]="computedPlaceholder()"
+    [attr.rows]="computedRows()"
+    [attr.aria-label]="computedAriaLabel()"
+    [attr.aria-describedby]="computedAriaDescribedBy()"
+    [attr.aria-invalid]="computedInvalid() ? 'true' : null"
+    (input)="onInput($event)"
+    (paste)="onPaste($event)"
+    [value]="value()"
+  ></textarea>
+</div>
+@if (computedErrorText()) {
+  <div class="origo-textarea__error">{{ computedErrorText() }}</div>
+}
+@if (computedHelpText()) {
+  <div class="origo-textarea__help">{{ computedHelpText() }}</div>
+}
diff --git a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.scss b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.scss
index c04ac73..405b9db 100644
--- a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.scss
+++ b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.scss
@@ -1,31 +1,69 @@
 :host {
-  display: block;
+  display: inline-block;
 }
-
-textarea {
+:host(.origo-textarea--fluid) {
   display: block;
   width: 100%;
-  font-family: var(--origo-typography-input-font-family, inherit);
-  font-size: var(--origo-typography-input-font-size, 1rem);
-  color: var(--origo-color-text-primary, #333);
-  background-color: var(--origo-color-surface-background, #fff);
-  border: 1px solid var(--origo-color-border-default, #ccc);
-  border-radius: var(--origo-radius-sm, 4px);
-  padding: var(--origo-spacing-container-padding, 8px);
+}
+.origo-textarea__wrapper {
+  display: flex;
+  flex-direction: column;
+}
+textarea {
   box-sizing: border-box;
+  width: 100%;
   resize: vertical;
-
-  &:focus {
-    outline: 2px solid var(--origo-color-focus, #005fcc);
-    outline-offset: 2px;
-  }
-
-  &:disabled {
-    opacity: var(--origo-opacity-disabled, 0.5);
-    cursor: not-allowed;
-  }
-
-  &[readonly] {
-    background-color: var(--origo-color-surface-readonly, #f9f9f9);
-  }
+  background-color: var(--origo-color-surface-background);
+  color: var(--origo-color-text-primary);
+  padding: var(--origo-spacing-container-padding);
+  border: var(--origo-border-width-default) solid var(--origo-color-border-default);
+  border-radius: var(--origo-radius-sm);
+  box-shadow: var(--origo-shadow-sm);
+  font-family: var(--origo-typography-input-font-family);
+  font-size: var(--origo-typography-input-font-size);
+  font-weight: var(--origo-typography-input-font-weight);
+  line-height: var(--origo-typography-input-line-height);
+  transition: all var(--origo-duration-fast) ease-in-out;
+}
+:host(.origo-textarea--filled) textarea {
+  background-color: var(--origo-color-surface-subtle);
+  border: none;
+}
+:host(.origo-textarea--text) textarea {
+  background-color: transparent;
+  border: none;
+}
+textarea::placeholder {
+  color: var(--origo-color-text-muted);
+}
+textarea:hover:not(:disabled):not([readonly]) {
+  border-color: var(--origo-color-border-hover);
+}
+textarea:active:not(:disabled):not([readonly]) {
+  border-color: var(--origo-color-border-active);
+}
+textarea:focus,
+textarea:focus-visible {
+  outline: var(--origo-border-width-thick) solid var(--origo-color-focus);
+  outline-offset: var(--origo-border-offset-negative);
+  border-color: var(--origo-color-focus);
+}
+textarea:disabled {
+  cursor: not-allowed;
+  opacity: var(--origo-opacity-disabled);
+  background-color: var(--origo-color-surface-disabled);
+  color: var(--origo-color-text-disabled);
+}
+textarea[readonly] {
+  background-color: var(--origo-color-surface-readonly);
+}
+.origo-textarea__error {
+  color: var(--origo-color-text-danger);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
+}
+.origo-textarea__help {
+  color: var(--origo-color-text-muted);
+  font-size: var(--origo-typography-caption-font-size);
+  margin-top: var(--origo-spacing-xs);
 }
diff --git a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.spec.ts b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.spec.ts
index 96ca2f6..b2cb1e6 100644
--- a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.spec.ts
+++ b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.spec.ts
@@ -112,4 +112,55 @@ describe('TextareaComponent', () => {
       expect(element.style.marginRight).toBeFalsy();
     }
   });
+
+  it('should apply variant and fluid classes to host', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'Textarea',
+      props: { variant: 'filled', fluid: true },
+    });
+    fixture.detectChanges();
+    expect(fixture.nativeElement.classList.contains('origo-textarea--filled')).toBe(true);
+    expect(fixture.nativeElement.classList.contains('origo-textarea--fluid')).toBe(true);
+  });
+
+  it('should render errorText and helpText', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'Textarea',
+      props: { errorText: 'Error message', helpText: 'Help message' },
+    });
+    fixture.detectChanges();
+    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
+    const errorEl = root.querySelector('.origo-textarea__error');
+    const helpEl = root.querySelector('.origo-textarea__help');
+    expect(errorEl).toBeTruthy();
+    expect(errorEl?.textContent?.trim()).toBe('Error message');
+    expect(helpEl).toBeTruthy();
+    expect(helpEl?.textContent?.trim()).toBe('Help message');
+  });
+
+  it('should bind aria-invalid based on invalid prop', () => {
+    fixture.componentRef.setInput('contract', {
+      id: '1',
+      type: 'Textarea',
+      props: { invalid: true },
+    });
+    fixture.detectChanges();
+    const textareaEl = fixture.nativeElement.shadowRoot!.querySelector('textarea');
+    expect(textareaEl!.getAttribute('aria-invalid')).toBe('true');
+  });
+
+  it('should strip HTML formatting on paste', () => {
+    fixture.componentRef.setInput('contract', { id: '1', type: 'Textarea', props: {} });
+    fixture.detectChanges();
+    const textareaEl = fixture.nativeElement.shadowRoot!.querySelector('textarea');
+    const dt = {
+      getData: (type: string) => (type === 'text/plain' ? 'bold text' : '<b>bold text</b>'),
+    } as unknown as DataTransfer;
+    const pasteEvent = new Event('paste') as any;
+    pasteEvent.clipboardData = dt;
+    textareaEl!.dispatchEvent(pasteEvent);
+    expect(component.value()).toBe('bold text');
+  });
 });
diff --git a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts
index bfba6dd..0371ba6 100644
--- a/packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts
+++ b/packages/angular-renderer/src/components/primitives/textarea/textarea.component.ts
@@ -12,6 +12,8 @@ import {
 } from '@angular/core';
 import { DomSanitizer } from '@angular/platform-browser';
 import { InteractionContract } from '@origostudio/core';
+import { PLATFORM_ID } from '@angular/core';
+import { isPlatformBrowser } from '@angular/common';
 import { OrigoAdapter } from '../../../adapters/web/adapter';
 import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
 
@@ -24,6 +26,12 @@ export interface TextareaProps {
   'aria-label'?: string;
   'aria-describedby'?: string;
   required?: boolean;
+  variant?: 'outlined' | 'filled' | 'text';
+  fluid?: boolean;
+  invalid?: boolean;
+  errorText?: string;
+  helpText?: string;
+  autoResize?: boolean;
 }
 
 @Component({
@@ -36,6 +44,10 @@ export interface TextareaProps {
   host: {
     '[class.origo-textarea]': 'true',
     '[attr.data-testid]': 'contract().id',
+    '[class.origo-textarea--fluid]': 'computedFluid()',
+    '[class.origo-textarea--outlined]': 'computedVariant() === "outlined"',
+    '[class.origo-textarea--filled]': 'computedVariant() === "filled"',
+    '[class.origo-textarea--text]': 'computedVariant() === "text"',
   },
 })
 export class TextareaComponent implements OrigoAdapter<TextareaProps> {
@@ -46,6 +58,12 @@ export class TextareaComponent implements OrigoAdapter<TextareaProps> {
     disabled: 'boolean',
     readonly: 'boolean',
     required: 'boolean',
+    variant: 'string',
+    fluid: 'boolean',
+    invalid: 'boolean',
+    errorText: 'string',
+    helpText: 'string',
+    autoResize: 'boolean',
   };
   static readonly strictContract = false;
 
@@ -69,8 +87,16 @@ export class TextareaComponent implements OrigoAdapter<TextareaProps> {
     return desc !== undefined && desc !== null ? String(desc) : undefined;
   });
 
+  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
+  computedFluid = computed(() => !!this.contract().props?.fluid);
+  computedInvalid = computed(() => !!this.contract().props?.invalid);
+  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
+  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
+  computedAutoResize = computed(() => !!this.contract().props?.autoResize);
+
   private experienceAdapter = inject(WebExperienceAdapterService);
   private sanitizer = inject(DomSanitizer);
+  private platformId = inject(PLATFORM_ID);
 
   constructor() {
     effect(() => {
@@ -98,5 +124,33 @@ export class TextareaComponent implements OrigoAdapter<TextareaProps> {
 
     this.value.set(sanitizedValue);
     this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
+
+    if (this.computedAutoResize() && isPlatformBrowser(this.platformId)) {
+      target.style.height = 'auto';
+      target.style.height = `${target.scrollHeight}px`;
+    }
+  }
+
+  onPaste(event: ClipboardEvent) {
+    if (this.computedDisabled() || this.computedReadonly()) return;
+    event.preventDefault();
+    const plain = event.clipboardData?.getData('text/plain') ?? '';
+    const target = event.target as HTMLTextAreaElement | null;
+    if (!target) return;
+    const start = target.selectionStart ?? target.value.length;
+    const end = target.selectionEnd ?? target.value.length;
+    const newValue = target.value.slice(0, start) + plain + target.value.slice(end);
+
+    const sanitizedValue =
+      this.sanitizer.sanitize(SecurityContext.HTML, newValue) || newValue || '';
+
+    target.value = sanitizedValue;
+    this.value.set(sanitizedValue);
+    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
+
+    if (this.computedAutoResize() && isPlatformBrowser(this.platformId)) {
+      target.style.height = 'auto';
+      target.style.height = `${target.scrollHeight}px`;
+    }
   }
 }
diff --git a/packages/angular-renderer/src/index.ts b/packages/angular-renderer/src/index.ts
index fa7874e..d1a6659 100644
--- a/packages/angular-renderer/src/index.ts
+++ b/packages/angular-renderer/src/index.ts
@@ -24,3 +24,4 @@ export * from './components/primitives/sidebar/sidebar.component';
 export * from './components/primitives/tabs/tabs.component';
 export * from './components/primitives/breadcrumbs/breadcrumbs.component';
 export * from './adapters/web/experience-adapter.service';
+export * from './components/primitives/input-number/input-number.component';
diff --git a/packages/angular-renderer/src/lib/primitives.provider.ts b/packages/angular-renderer/src/lib/primitives.provider.ts
index dbdc957..b66e8ab 100644
--- a/packages/angular-renderer/src/lib/primitives.provider.ts
+++ b/packages/angular-renderer/src/lib/primitives.provider.ts
@@ -21,6 +21,7 @@ import { ChipComponent } from '../components/primitives/chip/chip.component';
 import { TextInputComponent } from '../components/primitives/text-input/text-input.component';
 import { ButtonComponent } from '../components/primitives/button/button.component';
 import { VBoxComponent } from '../components/primitives/vbox/vbox.component';
+import { InputNumberComponent } from '../components/primitives/input-number/input-number.component';
 
 export function provideOrigo9Primitives(): EnvironmentProviders {
   const registryMap = new Map<string, unknown>([
@@ -46,6 +47,7 @@ export function provideOrigo9Primitives(): EnvironmentProviders {
     ['TextInput', TextInputComponent],
     ['Button', ButtonComponent],
     ['VBox', VBoxComponent],
+    ['InputNumber', InputNumberComponent],
     ['vbox', VBoxComponent], // For backward compatibility with 'vbox' in preview-root
   ]);
 

