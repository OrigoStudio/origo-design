---
story_id: "1.4"
story_key: 1-4-date-and-time-controls
baseline_commit: fd66c6e239d23f73c87fac4c82bdc96462611d18
---

# Story 1.4: Date and Time Controls

Status: ready-for-dev

## Story

As a developer,
I want to use comprehensive date/time pickers,
So that users can select temporal data reliably.

## Acceptance Criteria

1. **Given** a temporal data requirement **When** I configure or utilize the delivered components and features **Then** they should interact with a fully keyboard-navigable interface following the W3C ARIA Datepicker / grid pattern (e.g., arrow keys for days, page up/down for months) (ADR: P1-AD-6).
2. **Given** a temporal data requirement **When** I configure or utilize the delivered components and features **Then** the control output binds seamlessly to the Form Engine Substrate using `model<T>()` and `updateState()` without `ControlValueAccessor` (ADR: P2-AD-2).
3. **Given** Date/Time controls **When** selecting values **Then** they must explicitly enforce and display timezone context (standardizing to ISO 8601 UTC at boundaries using native `Date.UTC()` and `.toISOString()`) to prevent cross-locale drifting. Naive `new Date(string)` is forbidden.
4. **Given** any component's stylesheet **When** inspected at build time **Then** zero hardcoded HEX, RGB, or literal `px` values are present — all visual primitives use `var(--origo-*)` tokens exclusively (ADR: AD-6).
5. **Given** any date/time control in an Angular SSR context **When** the component class initializes **Then** zero references to `window`, `document`, or DOM globals appear without `isPlatformBrowser` guards.
6. **Given** a BADL metadata payload **When** configured **Then** it must expose hooks for metadata-driven visibility, permissions, and validation (`permissions`, `rules`, `metadata`).
7. **Given** touch paradigms **When** interacting on mobile devices **Then** virtual keyboards must be explicitly suppressed on custom picker inputs (using `inputmode='none'` or `readonly`). Native `<input type="date">` is forbidden; components must be custom overlays for design consistency across platforms.
8. **Given** component instantiation **When** constructed from a pure JSON metadata payload **Then** it must instantiate correctly using Angular 18 Standalone + Signals (ADR: P1-AD-1).
9. **Given** DateRangePickerComponent **When** selecting a range **Then** it must inherently validate that the start date is chronologically before or equal to the end date.

## ⚠️ Critical: Existing Code — Read Before Writing Anything

**NEW COMPONENTS TO CREATE:**
- `DatePickerComponent` -> `packages/angular-renderer/src/components/primitives/date-picker/` -> `'DatePicker'`
- `TimePickerComponent` -> `packages/angular-renderer/src/components/primitives/time-picker/` -> `'TimePicker'`
- `DateRangePickerComponent` -> `packages/angular-renderer/src/components/primitives/date-range-picker/` -> `'DateRangePicker'`

## Tasks / Subtasks

- [ ] **CREATE `DatePickerComponent`** at `packages/angular-renderer/src/components/primitives/date-picker/` (AC: #1–#8)
  - [ ] Implement `DatePickerProps` and `contractSchema` (properties: format, minDate, maxDate, showTime, timezone).
  - [ ] Implement date resolution using native `Date` and `Intl` APIs (NO third-party date libraries like date-fns or moment).
  - [ ] Register `['DatePicker', DatePickerComponent]` in `primitives.provider.ts` and export.

- [ ] **CREATE `TimePickerComponent`** at `packages/angular-renderer/src/components/primitives/time-picker/` (AC: #1–#8)
  - [ ] Implement `TimePickerProps` and `contractSchema` (properties: hourFormat, stepHour, stepMinute).
  - [ ] Register `['TimePicker', TimePickerComponent]` in `primitives.provider.ts` and export.

- [ ] **CREATE `DateRangePickerComponent`** at `packages/angular-renderer/src/components/primitives/date-range-picker/` (AC: #1–#9)
  - [ ] Implement `DateRangePickerProps` and `contractSchema` accepting array `[Date, Date]` or string equivalents.
  - [ ] Ensure validation logic prevents end date from preceding start date.
  - [ ] Register `['DateRangePicker', DateRangePickerComponent]` in `primitives.provider.ts` and export.

- [ ] **Write/update spec files for all three components**
  - [ ] Pierce Shadow DOM using `fixture.nativeElement.shadowRoot ?? fixture.nativeElement`.
  - [ ] Validate timezone output parsing ensures ISO 8601 UTC boundaries.
  - [ ] Test WAI-ARIA grid patterns and keyboard navigation.

## Dev Notes

### Mandatory Dependency Constraint
**DO NOT install or use any third-party date libraries** (e.g., `date-fns`, `moment`, `dayjs`). You must use native JavaScript `Date` and `Intl` APIs for all temporal manipulations. 

### Timezone Safety
Use explicit ISO 8601 serialization. Ensure dates going up to the parent application are in UTC (`Z` or explicit offset) by utilizing `Date.UTC()` and `.toISOString()`. Using naive `new Date(string)` is strictly prohibited due to local timezone drift.

### Touch Paradigms & Custom Overlays
Virtual keyboards must be explicitly suppressed (`inputmode='none'` / `readonly`). Native `<input type="date">` is strictly forbidden. We must build custom overlay popups for visual consistency.

### Mandatory Component Pattern (OrigoAdapter Contract)
No `@Input()` decorators, no NgModules. Use Signals and pure Component patterns. Use `WebExperienceAdapterService.updateState()`. Do not implement `ControlValueAccessor`.

### Previous Story Intelligence (Stories 1.1, 1.2, 1.3 Review Learnings)
- **Sanitization scope:** `DomSanitizer` must NOT be run on selection values or plain strings.
- **Zero hardcoded CSS:** `var(--origo-color-text-primary, #333)` is forbidden. Use `var(--origo-color-text-primary)` only.
- **`contractSchema` completeness:** Include ALL props (including ARIA and enterprise metadata).
- **Shadow DOM Piercing in Tests:** Always use `fixture.nativeElement.shadowRoot ?? fixture.nativeElement` instead of `shadowRoot!`.

### Architecture Compliance
| AD | Rule |
|---|---|
| AD-4 | Import only `@origostudio/core` + Angular SDK — no cross-renderer imports |
| AD-6 | Zero hardcoded design primitives — only `var(--origo-*)` tokens |
| P1-AD-1 | Angular 18 Standalone + Signals |
| P1-AD-5 | Composition over inheritance — inject `WebExperienceAdapterService`, no base classes |
| P1-AD-6 | axe-core in CI — bind `aria-label`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-activedescendant` |
| P2-AD-2 | Reactive Forms substrate — use `model<T>()` + `updateState()`, NOT `ControlValueAccessor` |
### Review Findings

- [x] [Review][Patch] Arbitrary Unix Epoch Anchoring for Time Values — TimePickerComponent hardcodes date boundaries to 1970-01-01 in confirmTime(). If the component receives an ISO timestamp containing a real calendar date, selecting a time strips the original date entirely and resets it to the 1970 epoch.
- [x] [Review][Patch] Pervasive Design Token and Fallback Violations [date-picker.component.scss]
- [x] [Review][Patch] Widespread Use of Forbidden Naive new Date(string) [date-picker.component.ts]
- [x] [Review][Patch] Incomplete W3C ARIA Keyboard Navigation and Focus Management [date-picker.component.ts]
- [x] [Review][Patch] Unimplemented Component Prop Logic [date-picker.component.ts]
- [x] [Review][Patch] Completely Unenforced minDate and maxDate Bounds [date-picker.component.ts]
- [x] [Review][Patch] Truncated and Malformed 6th Week Grid Generation [date-picker.component.ts]
- [x] [Review][Patch] Fragile and Leaky State Machine in DateRangePickerComponent [date-range-picker.component.ts]
- [x] [Review][Patch] Unchecked Prop Ingestion in DateRangePickerComponent [date-range-picker.component.ts]
- [x] [Review][Patch] Disconnected Form Engine Model Binding in DateRangePickerComponent [date-range-picker.component.ts]
- [x] [Review][Patch] Superficial Unit Tests Bypassing Real UI Interactions [date-picker.component.spec.ts]
- [x] [Review][Patch] Missing Overlay Dismissal and Click-Outside Handlers [date-picker.component.ts]
- [x] [Review][Patch] Omission of Enterprise BADL Metadata and Standard Accessibility Bindings [date-picker.component.ts]
- [x] [Review][Patch] Corrupt Initial State in 12-Hour TimePickerComponent [time-picker.component.ts]
- [x] [Review][Patch] Components retain stale state when contract props are reset [date-picker.component.ts]
- [x] [Review][Patch] Keyboard focus trapped when navigating to empty month [date-picker.component.ts]
- [x] [Review][Patch] Null Start Date handling in DateRangePicker [date-range-picker.component.ts]
- [x] [Review][Patch] DateRangePicker input missing keyboard handlers [date-range-picker.component.ts]
- [x] [Review][Patch] PM hour conversion rolls into next day [time-picker.component.ts]
- [x] [Review][Patch] TimePicker fails to parse plain time strings [time-picker.component.ts]
- [x] [Review][Patch] Missing Central Test Registry Update [tools/test-registry/test-registry.yaml]
