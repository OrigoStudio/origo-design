---
story_id: "9.4"
story_key: "9-4-accessibility-localization-enforcement"
status: "ready-for-dev"
---

# Story 9.4: Accessibility & Localization Enforcement

Status: ready-for-dev

## Story

As a UX Engineer,
I want all primitives to strictly enforce accessibility and localization standards,
So that applications are inclusive and support global audiences out of the box.

## Acceptance Criteria

1. **Given** the Origo primitive library (all 16 existing components),
   **When** the application is audited,
   **Then** all components comply with WCAG 2.1 AA standards (NFR-ACC-001), enforced by axe-core in CI (P1-AD-6).
2. **And** the primitives explicitly support propagating ARIA context (`aria-label`, `aria-describedby`) from AST props down to native DOM elements, using the established `computedAriaLabel`/`computedAriaDescribedBy` computed signal pattern.
3. **And** all components render correctly in RTL orientation via CSS logical properties (NFR-I18N-001), validated by unit tests.
4. **And** this story explicitly acknowledges `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` — primitives do not host iframes or sandboxed content; mark as N/A in completion notes.

## Tasks / Subtasks

### 1. Audit & Scope Identification
- [ ] Task 1.1: Audit all 16 components for ARIA gap: breadcrumbs, button, card, checkbox, data-grid, form-field, hbox, label, list, radio-group, select, sidebar, tabs, text-input, textarea, vbox.
  - Check each `*Props` interface for missing `'aria-label'?: string` and `'aria-describedby'?: string` fields.
  - Check each `.component.ts` for missing `computedAriaLabel` and `computedAriaDescribedBy` computed signals.
  - Check each `.component.html` for missing `[attr.aria-label]="computedAriaLabel()"` and `[attr.aria-describedby]="computedAriaDescribedBy()"` bindings.
- [ ] Task 1.2: Audit all 16 components for RTL gap.
  - Grep each `.component.scss` for `padding-left`, `padding-right`, `margin-left`, `margin-right`, `text-align: left`, `text-align: right` — these must be replaced with logical equivalents.
- [ ] Task 1.3: Audit `primitives.a11y.pw.ts` — verify each of the 16 components has at least one axe-core test block.

### 2. ARIA Remediation
- [ ] Task 2.1: For each component missing ARIA support, add to the `*Props` interface:
  ```typescript
  'aria-label'?: string;
  'aria-describedby'?: string;
  ```
- [ ] Task 2.2: Add computed signals to each component class (if missing):
  ```typescript
  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] as string | undefined);
  computedAriaDescribedBy = computed(() => this.contract().props?.['aria-describedby'] as string | undefined);
  ```
- [ ] Task 2.3: Bind ARIA attrs in the component host or template (if missing):
  ```typescript
  // In @Component host: {}
  '[attr.aria-label]': 'computedAriaLabel()',
  '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  ```
  For interactive elements (button, input), bind on the inner native element — NOT the host — to avoid double-ARIA.
- [ ] Task 2.4: Ensure `[attr.data-testid]="contract().id"` exists on the host of every component (AD-12). Add where missing.

### 3. RTL Remediation
- [ ] Task 3.1: Replace all physical CSS directional properties with logical equivalents in every `.component.scss` that has gaps:
  - `padding-left` → `padding-inline-start`
  - `padding-right` → `padding-inline-end`
  - `margin-left` → `margin-inline-start`
  - `margin-right` → `margin-inline-end`
  - `text-align: left` → `text-align: start`
  - `text-align: right` → `text-align: end`
  - `border-left` → `border-inline-start`
- [ ] Task 3.2: Add RTL unit tests to each component `.spec.ts` that had physical CSS fixes: verify the component host/template applies `padding-inline-start` and not `padding-left`.

### 4. Axe-core Test Coverage
- [ ] Task 4.1: Audit `primitives.a11y.pw.ts` and add `test()` blocks for any of the 16 components not yet covered, using `page.setContent()` + `AxeBuilder.analyze()`.
- [ ] Task 4.2: Run each new test in multiple states: default, disabled, error/invalid (where applicable).

### 5. Test Registry & DoD
- [ ] Task 5.1: Update `tools/test-registry/test-registry.yaml` with any new spec file entries. Required fields:
  ```yaml
  - id: primitive-a11y-<component>
    description: "A11y sweep for <Component> primitive"
    package: "@origo/angular-renderer"
    spec_file: "packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts"
    type: e2e
    affected_stories: ["9-4-accessibility-localization-enforcement"]
    last_result: unknown
  ```
- [ ] Task 5.2: Verify build pipeline passes: `nx lint angular-renderer`, `nx test angular-renderer`, `nx build angular-renderer`.

## Dev Notes

### Scope — What Must Be Modified

This is a **cross-cutting remediation pass** across existing components. **No new Nx packages and no new components are created.** Target only the 16 existing primitives under:

```
packages/angular-renderer/src/components/primitives/
  breadcrumbs/ button/ card/ checkbox/ data-grid/ form-field/
  hbox/ label/ list/ radio-group/ select/ sidebar/ tabs/
  text-input/ textarea/ vbox/
```

Some components may already be fully compliant (e.g., `text-input` already has `computedAriaLabel`). Run the audit in Task 1 first — do not blindly patch all components.

### Mandatory Files to Read Before Writing Code

Study these before writing anything:

1. [`text-input.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts) — **Canonical ARIA pattern**: `'aria-label'?: string` in Props + `computedAriaLabel = computed(...)` signal. This is the established approach — follow it exactly.
2. [`hbox.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts) — **Canonical logical CSS RTL pattern**: `[style.padding-inline]`, `[style.padding-block]` on host. The host binding approach avoids `.scss` physical property issues.
3. [`adapter.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/adapters/web/adapter.ts) — `OrigoAdapter<TProps>`, `ContainerComponent`, `coerceContractProps`.
4. [`primitives.provider.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/lib/primitives.provider.ts) — Current registry state (14 entries). **Do NOT create a new Map** — it silently wipes all existing registrations.
5. [`primitives.a11y.pw.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts) — Existing axe-core test pattern to follow.

### Mandatory Component Structure

Every component must follow this exact shape. Audit against it:

```typescript
@Component({
  selector: 'origo-<name>',
  standalone: true,                              // P1-AD-1 — NEVER NgModule
  templateUrl: './<name>.component.html',
  styleUrls: ['./<name>.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,    // ALWAYS ShadowDom — no global style bleed
  host: {
    '[class.origo-<name>]': 'true',
    '[attr.data-testid]': 'contract().id',       // AD-12 — stable test selector, REQUIRED
    '[attr.aria-label]': 'computedAriaLabel()',  // where host-level ARIA is correct
  },
})
export class <Name>Component implements OrigoAdapter<<Name>Props> {
  static readonly contractSchema = { /* typed schema */ };
  static readonly strictContract = false;
  contract = input.required<InteractionContract<<Name>Props>>();
  // Reactive props: ALWAYS computed() — never getters or ngOnChanges
  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] as string | undefined);
  computedAriaDescribedBy = computed(() => this.contract().props?.['aria-describedby'] as string | undefined);
}
```

> **Note on interactive elements (button, input):** Do NOT put `aria-label` on the host AND the inner `<button>`/`<input>` — it will be read twice by screen readers. Bind ARIA attrs on the inner native element only for these components.

### Critical Anti-Patterns — DO NOT DO THESE

| ❌ Wrong | ✅ Correct |
|---|---|
| `DomSanitizer.sanitize(SecurityContext.HTML, ariaLabel)` | `String(ariaLabel)` — ARIA is plain text; HTML-sanitizing strips `"` and other valid chars |
| `padding-left: var(--origo-spacing-sm)` in `.scss` | `padding-inline-start: var(--origo-spacing-sm)` |
| `text-align: left` | `text-align: start` |
| New `Map()` in provider | Extend the existing factory in `primitives.provider.ts` |
| `provideExperimentalZonelessChangeDetection()` in tests | `provideZonelessChangeDetection()` — experimental API was removed |
| Extra `afterEach` isolation in tests | `test-setup.ts` already provides isolation — do NOT add more |

### Design Token Reference for Accessibility States

Use these `--origo-*` tokens for accessibility-related visual states (never hardcode):

| State | Token |
|---|---|
| Focus ring | `--origo-color-focus` |
| Disabled opacity | `--origo-opacity-disabled` |
| Error/invalid border | `--origo-color-border-error` (if defined) |
| Surface background | `--origo-color-surface-background` |

ShadowDom note: CSS custom properties **DO** pierce Shadow DOM (they are inherited). Standard CSS properties do NOT. Always provide a fallback: `var(--origo-color-focus, #0078d4)`.

### Testing Requirements

- **Test runner:** Jest + `jest-preset-angular`. **Do NOT introduce Vitest** (used only in `devtools` package).
- **Zoneless:** `provideZonelessChangeDetection()` — `provideExperimentalZonelessChangeDetection` was removed.
- **Isolation:** `test-setup.ts` already provides `afterEach` cleanup — do NOT add more guards.
- **RTL unit test pattern:** Use `TestBed.overrideComponent` or direct HTML inspection to verify logical CSS is applied.
- **Playwright a11y:** Append to `primitives.a11y.pw.ts` using `page.setContent()` + `AxeBuilder.analyze()` — Playwright CT does not support Angular natively yet (pre-existing pattern, acceptable).

### Architecture Compliance

| Rule | Requirement |
|---|---|
| P1-AD-1 | `standalone: true`, Signals for all reactive state, zoneless-compatible |
| P1-AD-5 | No component class inheritance; composition via `@ContentChild`/`hostDirectives` only |
| P1-AD-6 | Every component must pass axe-core WCAG 2.1 AA in `primitives.a11y.pw.ts` — violation = CI failure |
| AD-2 | All files under `packages/angular-renderer`. No cross-package `src/` imports. |
| AD-6 | Zero hardcoded visual values in `.scss` files — use `--origo-*` tokens only |
| AD-12 | `[attr.data-testid]="contract().id"` on all host elements |

### Previous Story Intelligence

From **Story 9.3 (Batch 3 Navigation)** — learnings that directly apply:

- **`[innerHTML]` bypasses Shadow DOM sanitization** — avoid it. Any label/text content that comes from the AST must use text interpolation (`{{ value }}`) or `[textContent]`, not `[innerHTML]`.
- **Empty string dispatch guard:** Guard against dispatching `updateState` with empty string keys/values — check that `value` is non-empty before calling.
- **WAI-ARIA tablist pattern:** Initial unselected state must have `aria-selected="false"` on tabs (not omit the attribute).
- **ADR acknowledgment is mandatory in completion notes.** Pattern from 9.3: *"Batch N primitives do not host iframes or sandboxed content. CSP constraints are N/A."*

From **Story 9.2 (Batch 2 Data Presentation)**:

- **`computedOptions` null guard:** Filter null/undefined from collection props before rendering — apply same vigilance to ARIA string values (null-coalesce to `undefined`, not `null`, to avoid binding `aria-label="null"`).
- **Disabled guard:** Every event handler MUST check `if (this.computedDisabled()) return;` — ARIA doesn't automatically disable interaction.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.4`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md`]
- [Source: `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`] — N/A for Story 9.4 (no iframes or sandboxed content)
- [Source: `stories/9-3-navigation-shell-primitives-batch-3.md`] — Batch 3 patterns and learnings

## Dev Agent Record

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- Validated and enhanced via bmad-create-story checklist: C1–C4 (critical) and E1–E5 (enhancements) applied.
- ADR DoD: `adr-epic7-web-worker-csp.md` — Story 9.4 primitives do not host iframes or sandboxed content (N/A).

### File List

*(to be populated by dev agent on completion)*

### Review Findings

*(to be populated by code-review workflow)*
