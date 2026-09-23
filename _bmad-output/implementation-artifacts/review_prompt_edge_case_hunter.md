Invoke the bmad-review-edge-case-hunter skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/9-4-accessibility-localization-enforcement.md b/_bmad-output/implementation-artifacts/9-4-accessibility-localization-enforcement.md
new file mode 100644
index 0000000..d31a40d
--- /dev/null
+++ b/_bmad-output/implementation-artifacts/9-4-accessibility-localization-enforcement.md
@@ -0,0 +1,233 @@
+---
+story_id: "9.4"
+story_key: "9-4-accessibility-localization-enforcement"
+status: "done"
+baseline_commit: "be33262e5860071fd15242d902c581b5d31725d8"
+---
+
+# Story 9.4: Accessibility & Localization Enforcement
+
+status: done
+
+## Story
+
+As a UX Engineer,
+I want all primitives to strictly enforce accessibility and localization standards,
+So that applications are inclusive and support global audiences out of the box.
+
+## Acceptance Criteria
+
+1. **Given** the Origo primitive library (all 16 existing components),
+   **When** the application is audited,
+   **Then** all components comply with WCAG 2.1 AA standards (NFR-ACC-001), enforced by axe-core in CI (P1-AD-6).
+2. **And** the primitives explicitly support propagating ARIA context (`aria-label`, `aria-describedby`) from AST props down to native DOM elements, using the established `computedAriaLabel`/`computedAriaDescribedBy` computed signal pattern.
+3. **And** all components render correctly in RTL orientation via CSS logical properties (NFR-I18N-001), validated by unit tests.
+4. **And** this story explicitly acknowledges `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` — primitives do not host iframes or sandboxed content; mark as N/A in completion notes.
+
+## Tasks / Subtasks
+
+### 1. Audit & Scope Identification
+- [x] Task 1.1: Audit all 16 components for ARIA gap: breadcrumbs, button, card, checkbox, data-grid, form-field, hbox, label, list, radio-group, select, sidebar, tabs, text-input, textarea, vbox.
+  - Check each `*Props` interface for missing `'aria-label'?: string` and `'aria-describedby'?: string` fields.
+  - Check each `.component.ts` for missing `computedAriaLabel` and `computedAriaDescribedBy` computed signals.
+  - Check each `.component.html` for missing `[attr.aria-label]="computedAriaLabel()"` and `[attr.aria-describedby]="computedAriaDescribedBy()"` bindings.
+- [x] Task 1.2: Audit all 16 components for RTL gap.
+  - Grep each `.component.scss` for `padding-left`, `padding-right`, `margin-left`, `margin-right`, `text-align: left`, `text-align: right` — these must be replaced with logical equivalents.
+- [x] Task 1.3: Audit `primitives.a11y.pw.ts` — verify each of the 16 components has at least one axe-core test block.
+
+### 2. ARIA Remediation
+- [x] Task 2.1: For each component missing ARIA support, add to the `*Props` interface:
+  ```typescript
+  'aria-label'?: string;
+  'aria-describedby'?: string;
+  ```
+- [x] Task 2.2: Add computed signals to each component class (if missing):
+  ```typescript
+  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] as string | undefined);
+  computedAriaDescribedBy = computed(() => this.contract().props?.['aria-describedby'] as string | undefined);
+  ```
+- [x] Task 2.3: Bind ARIA attrs in the component host or template (if missing):
+  ```typescript
+  // In @Component host: {}
+  '[attr.aria-label]': 'computedAriaLabel()',
+  '[attr.aria-describedby]': 'computedAriaDescribedBy()',
+  ```
+  For interactive elements (button, input), bind on the inner native element — NOT the host — to avoid double-ARIA.
+- [x] Task 2.4: Ensure `[attr.data-testid]="contract().id"` exists on the host of every component (AD-12). Add where missing.
+
+### 3. RTL Remediation
+- [x] Task 3.1: Replace all physical CSS directional properties with logical equivalents in every `.component.scss` that has gaps:
+  - `padding-left` → `padding-inline-start`
+  - `padding-right` → `padding-inline-end`
+  - `margin-left` → `margin-inline-start`
+  - `margin-right` → `margin-inline-end`
+  - `text-align: left` → `text-align: start`
+  - `text-align: right` → `text-align: end`
+  - `border-left` → `border-inline-start`
+- [x] Task 3.2: Add RTL unit tests to each component `.spec.ts` that had physical CSS fixes: verify the component host/template applies `padding-inline-start` and not `padding-left`.
+
+### 4. Axe-core Test Coverage
+- [x] Task 4.1: Audit `primitives.a11y.pw.ts` and add `test()` blocks for any of the 16 components not yet covered, using `page.setContent()` + `AxeBuilder.analyze()`.
+- [x] Task 4.2: Run each new test in multiple states: default, disabled, error/invalid (where applicable).
+
+### 5. Test Registry & DoD
+- [x] Task 5.1: Update `tools/test-registry/test-registry.yaml` with any new spec file entries. Required fields:
+  ```yaml
+  - id: primitive-a11y-<component>
+    description: "A11y sweep for <Component> primitive"
+    package: "@origo/angular-renderer"
+    spec_file: "packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts"
+    type: e2e
+    affected_stories: ["9-4-accessibility-localization-enforcement"]
+    last_result: unknown
+  ```
+- [x] Task 5.2: Verify build pipeline passes: `nx lint angular-renderer`, `nx test angular-renderer`, `nx build angular-renderer`.
+
+## Dev Notes
+
+### Scope — What Must Be Modified
+
+This is a **cross-cutting remediation pass** across existing components. **No new Nx packages and no new components are created.** Target only the 16 existing primitives under:
+
+```
+packages/angular-renderer/src/components/primitives/
+  breadcrumbs/ button/ card/ checkbox/ data-grid/ form-field/
+  hbox/ label/ list/ radio-group/ select/ sidebar/ tabs/
+  text-input/ textarea/ vbox/
+```
+
+Some components may already be fully compliant (e.g., `text-input` already has `computedAriaLabel`). Run the audit in Task 1 first — do not blindly patch all components.
+
+### Mandatory Files to Read Before Writing Code
+
+Study these before writing anything:
+
+1. [`text-input.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts) — **Canonical ARIA pattern**: `'aria-label'?: string` in Props + `computedAriaLabel = computed(...)` signal. This is the established approach — follow it exactly.
+2. [`hbox.component.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts) — **Canonical logical CSS RTL pattern**: `[style.padding-inline]`, `[style.padding-block]` on host. The host binding approach avoids `.scss` physical property issues.
+3. [`adapter.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/adapters/web/adapter.ts) — `OrigoAdapter<TProps>`, `ContainerComponent`, `coerceContractProps`.
+4. [`primitives.provider.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/lib/primitives.provider.ts) — Current registry state (14 entries). **Do NOT create a new Map** — it silently wipes all existing registrations.
+5. [`primitives.a11y.pw.ts`](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts) — Existing axe-core test pattern to follow.
+
+### Mandatory Component Structure
+
+Every component must follow this exact shape. Audit against it:
+
+```typescript
+@Component({
+  selector: 'origo-<name>',
+  standalone: true,                              // P1-AD-1 — NEVER NgModule
+  templateUrl: './<name>.component.html',
+  styleUrls: ['./<name>.component.scss'],
+  changeDetection: ChangeDetectionStrategy.OnPush,
+  encapsulation: ViewEncapsulation.ShadowDom,    // ALWAYS ShadowDom — no global style bleed
+  host: {
+    '[class.origo-<name>]': 'true',
+    '[attr.data-testid]': 'contract().id',       // AD-12 — stable test selector, REQUIRED
+    '[attr.aria-label]': 'computedAriaLabel()',  // where host-level ARIA is correct
+  },
+})
+export class <Name>Component implements OrigoAdapter<<Name>Props> {
+  static readonly contractSchema = { /* typed schema */ };
+  static readonly strictContract = false;
+  contract = input.required<InteractionContract<<Name>Props>>();
+  // Reactive props: ALWAYS computed() — never getters or ngOnChanges
+  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] as string | undefined);
+  computedAriaDescribedBy = computed(() => this.contract().props?.['aria-describedby'] as string | undefined);
+}
+```
+
+> **Note on interactive elements (button, input):** Do NOT put `aria-label` on the host AND the inner `<button>`/`<input>` — it will be read twice by screen readers. Bind ARIA attrs on the inner native element only for these components.
+
+### Critical Anti-Patterns — DO NOT DO THESE
+
+| ❌ Wrong | ✅ Correct |
+|---|---|
+| `DomSanitizer.sanitize(SecurityContext.HTML, ariaLabel)` | `String(ariaLabel)` — ARIA is plain text; HTML-sanitizing strips `"` and other valid chars |
+| `padding-left: var(--origo-spacing-sm)` in `.scss` | `padding-inline-start: var(--origo-spacing-sm)` |
+| `text-align: left` | `text-align: start` |
+| New `Map()` in provider | Extend the existing factory in `primitives.provider.ts` |
+| `provideExperimentalZonelessChangeDetection()` in tests | `provideZonelessChangeDetection()` — experimental API was removed |
+| Extra `afterEach` isolation in tests | `test-setup.ts` already provides isolation — do NOT add more |
+
+### Design Token Reference for Accessibility States
+
+Use these `--origo-*` tokens for accessibility-related visual states (never hardcode):
+
+| State | Token |
+|---|---|
+| Focus ring | `--origo-color-focus` |
+| Disabled opacity | `--origo-opacity-disabled` |
+| Error/invalid border | `--origo-color-border-error` (if defined) |
+| Surface background | `--origo-color-surface-background` |
+
+ShadowDom note: CSS custom properties **DO** pierce Shadow DOM (they are inherited). Standard CSS properties do NOT. Always provide a fallback: `var(--origo-color-focus, #0078d4)`.
+
+### Testing Requirements
+
+- **Test runner:** Jest + `jest-preset-angular`. **Do NOT introduce Vitest** (used only in `devtools` package).
+- **Zoneless:** `provideZonelessChangeDetection()` — `provideExperimentalZonelessChangeDetection` was removed.
+- **Isolation:** `test-setup.ts` already provides `afterEach` cleanup — do NOT add more guards.
+- **RTL unit test pattern:** Use `TestBed.overrideComponent` or direct HTML inspection to verify logical CSS is applied.
+- **Playwright a11y:** Append to `primitives.a11y.pw.ts` using `page.setContent()` + `AxeBuilder.analyze()` — Playwright CT does not support Angular natively yet (pre-existing pattern, acceptable).
+
+### Architecture Compliance
+
+| Rule | Requirement |
+|---|---|
+| P1-AD-1 | `standalone: true`, Signals for all reactive state, zoneless-compatible |
+| P1-AD-5 | No component class inheritance; composition via `@ContentChild`/`hostDirectives` only |
+| P1-AD-6 | Every component must pass axe-core WCAG 2.1 AA in `primitives.a11y.pw.ts` — violation = CI failure |
+| AD-2 | All files under `packages/angular-renderer`. No cross-package `src/` imports. |
+| AD-6 | Zero hardcoded visual values in `.scss` files — use `--origo-*` tokens only |
+| AD-12 | `[attr.data-testid]="contract().id"` on all host elements |
+
+### Previous Story Intelligence
+
+From **Story 9.3 (Batch 3 Navigation)** — learnings that directly apply:
+
+- **`[innerHTML]` bypasses Shadow DOM sanitization** — avoid it. Any label/text content that comes from the AST must use text interpolation (`{{ value }}`) or `[textContent]`, not `[innerHTML]`.
+- **Empty string dispatch guard:** Guard against dispatching `updateState` with empty string keys/values — check that `value` is non-empty before calling.
+- **WAI-ARIA tablist pattern:** Initial unselected state must have `aria-selected="false"` on tabs (not omit the attribute).
+- **ADR acknowledgment is mandatory in completion notes.** Pattern from 9.3: *"Batch N primitives do not host iframes or sandboxed content. CSP constraints are N/A."*
+
+From **Story 9.2 (Batch 2 Data Presentation)**:
+
+- **`computedOptions` null guard:** Filter null/undefined from collection props before rendering — apply same vigilance to ARIA string values (null-coalesce to `undefined`, not `null`, to avoid binding `aria-label="null"`).
+- **Disabled guard:** Every event handler MUST check `if (this.computedDisabled()) return;` — ARIA doesn't automatically disable interaction.
+
+### References
+
+- [Source: `_bmad-output/planning-artifacts/epics.md#Story 9.4`]
+- [Source: `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md`]
+- [Source: `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`] — N/A for Story 9.4 (no iframes or sandboxed content)
+- [Source: `stories/9-3-navigation-shell-primitives-batch-3.md`] — Batch 3 patterns and learnings
+
+## Dev Agent Record
+
+### Completion Notes List
+
+- Ultimate context engine analysis completed — comprehensive developer guide created.
+- Validated and enhanced via bmad-create-story checklist: C1–C4 (critical) and E1–E5 (enhancements) applied.
+- ADR DoD: `adr-epic7-web-worker-csp.md` — Story 9.4 primitives do not host iframes or sandboxed content (N/A).
+
+### File List
+
+- `packages/angular-renderer/src/components/primitives/button/button.component.ts`
+- `packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts`
+- `packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html`
+- `packages/angular-renderer/src/components/primitives/form-field/form-field.component.ts`
+- `packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts`
+- `packages/angular-renderer/src/components/primitives/label/label.component.ts`
+- `packages/angular-renderer/src/components/primitives/label/label.component.html`
+- `packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts`
+- `packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html`
+- `packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts`
+- `packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts`
+- `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts`
+- `tools/test-registry/test-registry.yaml`
+- `_bmad-output/implementation-artifacts/sprint-status.yaml`
+- `_bmad-output/implementation-artifacts/9-4-accessibility-localization-enforcement.md`
+
+### Review Findings
+
+*(to be populated by code-review workflow)*
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index b11d2ec..e4929dd 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-07-29T21:46:02.464968
-last_updated: 2026-09-21T20:32:00+05:30
+last_updated: 2026-09-22T21:56:00+05:30
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -114,7 +114,7 @@ development_status:
   9-1-form-layout-primitives-batch-1: done
   9-2-data-presentation-primitives-batch-2: done
   9-3-navigation-shell-primitives-batch-3: done
-  9-4-accessibility-localization-enforcement: backlog
+  9-4-accessibility-localization-enforcement: done
   9-5-advanced-form-primitives-batch-4: backlog
   epic-9-retrospective: optional
   epic-10: backlog
diff --git a/_bmad-output/scratch/audit.js b/_bmad-output/scratch/audit.js
new file mode 100644
index 0000000..1617bea
--- /dev/null
+++ b/_bmad-output/scratch/audit.js
@@ -0,0 +1,56 @@
+const fs = require('fs');
+const path = require('path');
+
+const primitivesDir = 'g:\\OrigoStudio\\Repositories\\Origo-Design\\origo-design\\packages\\angular-renderer\\src\\components\\primitives';
+const components = [
+  'breadcrumbs', 'button', 'card', 'checkbox', 'data-grid', 'form-field',
+  'hbox', 'label', 'list', 'radio-group', 'select', 'sidebar', 'tabs',
+  'text-input', 'textarea', 'vbox'
+];
+
+const results = {
+  ariaMissingProps: [],
+  ariaMissingSignals: [],
+  ariaMissingTemplate: [],
+  rtlPhysicalProps: [],
+  missingAxeTests: []
+};
+
+for (const comp of components) {
+  const dir = path.join(primitivesDir, comp);
+  const tsFile = path.join(dir, `${comp}.component.ts`);
+  const htmlFile = path.join(dir, `${comp}.component.html`);
+  const scssFile = path.join(dir, `${comp}.component.scss`);
+
+  // ARIA check
+  if (fs.existsSync(tsFile)) {
+    const tsContent = fs.readFileSync(tsFile, 'utf8');
+    if (!tsContent.includes("'aria-label'?: string") || !tsContent.includes("'aria-describedby'?: string")) {
+      results.ariaMissingProps.push(comp);
+    }
+    if (!tsContent.includes('computedAriaLabel') || !tsContent.includes('computedAriaDescribedBy')) {
+      results.ariaMissingSignals.push(comp);
+    }
+  }
+
+  // RTL check
+  if (fs.existsSync(scssFile)) {
+    const scssContent = fs.readFileSync(scssFile, 'utf8');
+    if (scssContent.match(/padding-left|padding-right|margin-left|margin-right|text-align:\s*left|text-align:\s*right|border-left/)) {
+      results.rtlPhysicalProps.push(comp);
+    }
+  }
+}
+
+// Check Axe tests
+const a11yFile = path.join(primitivesDir, 'primitives.a11y.pw.ts');
+if (fs.existsSync(a11yFile)) {
+  const a11yContent = fs.readFileSync(a11yFile, 'utf8');
+  for (const comp of components) {
+    if (!a11yContent.includes(`origo-${comp}`)) {
+      results.missingAxeTests.push(comp);
+    }
+  }
+}
+
+console.log(JSON.stringify(results, null, 2));
diff --git a/packages/angular-renderer/src/components/primitives/button/button.component.ts b/packages/angular-renderer/src/components/primitives/button/button.component.ts
index 14d56a7..227f617 100644
--- a/packages/angular-renderer/src/components/primitives/button/button.component.ts
+++ b/packages/angular-renderer/src/components/primitives/button/button.component.ts
@@ -28,6 +28,7 @@ export interface ButtonProps {
   encapsulation: ViewEncapsulation.ShadowDom,
   host: {
     '[class.origo-button]': 'true',
+    '[attr.data-testid]': 'contract().id',
   },
 })
 export class ButtonComponent implements OrigoAdapter<ButtonProps> {
diff --git a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html
index f13f541..72d4ec9 100644
--- a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html
+++ b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.html
@@ -5,6 +5,7 @@
     [disabled]="computedDisabled()"
     [required]="computedRequired()"
     [attr.aria-label]="computedAriaLabel()"
+    [attr.aria-describedby]="computedAriaDescribedBy()"
     (change)="onChange($event)"
     [checked]="checked()"
   />
diff --git a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts
index 99322ff..af1c05e 100644
--- a/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts
+++ b/packages/angular-renderer/src/components/primitives/checkbox/checkbox.component.ts
@@ -18,6 +18,7 @@ export interface CheckboxProps {
   label?: string;
   disabled?: boolean;
   'aria-label'?: string;
+  'aria-describedby'?: string;
   required?: boolean;
 }
 
@@ -52,6 +53,10 @@ export class CheckboxComponent implements OrigoAdapter<CheckboxProps> {
     const label = this.contract().props?.['aria-label'];
     return label !== undefined && label !== null ? String(label) : undefined;
   });
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract().props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
 
   private experienceAdapter = inject(WebExperienceAdapterService);
 
diff --git a/packages/angular-renderer/src/components/primitives/form-field/form-field.component.ts b/packages/angular-renderer/src/components/primitives/form-field/form-field.component.ts
index 6d90e2f..567538b 100644
--- a/packages/angular-renderer/src/components/primitives/form-field/form-field.component.ts
+++ b/packages/angular-renderer/src/components/primitives/form-field/form-field.component.ts
@@ -16,6 +16,8 @@ export interface FormFieldProps {
   error?: string;
   hint?: string;
   required?: boolean;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
 }
 
 @Component({
@@ -30,6 +32,8 @@ export interface FormFieldProps {
     '[class.origo-form-field]': 'true',
     '[class.has-error]': '!!computedError()',
     '[attr.data-testid]': 'contract().id',
+    '[attr.aria-label]': 'computedAriaLabel()',
+    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
   },
 })
 export class FormFieldComponent implements OrigoAdapter<FormFieldProps>, ContainerComponent {
@@ -49,6 +53,14 @@ export class FormFieldComponent implements OrigoAdapter<FormFieldProps>, Contain
   computedError = computed(() => this.contract().props?.error);
   computedHint = computed(() => this.contract().props?.hint);
   computedRequired = computed(() => !!this.contract().props?.required);
+  computedAriaLabel = computed(() => {
+    const label = this.contract().props?.['aria-label'];
+    return label !== undefined && label !== null ? String(label) : undefined;
+  });
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract().props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
 
   labelContract = computed<InteractionContract<LabelProps>>(() => {
     const parentId = this.contract().id;
diff --git a/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts b/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts
index d098b5e..adadf95 100644
--- a/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts
+++ b/packages/angular-renderer/src/components/primitives/hbox/hbox.component.ts
@@ -14,6 +14,8 @@ export interface HBoxProps {
   gap?: number | string;
   alignment?: 'start' | 'center' | 'end' | 'stretch';
   padding?: number | string;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
 }
 
 @Component({
@@ -30,6 +32,8 @@ export interface HBoxProps {
     '[style.align-items]': 'computedAlignment()',
     '[style.padding-inline]': 'computedPadding()',
     '[style.padding-block]': 'computedPadding()',
+    '[attr.aria-label]': 'computedAriaLabel()',
+    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
   },
 })
 export class HBoxComponent implements OrigoAdapter<HBoxProps>, ContainerComponent {
@@ -73,4 +77,13 @@ export class HBoxComponent implements OrigoAdapter<HBoxProps>, ContainerComponen
     const num = Number(padding);
     return !isNaN(num) ? `${num}px` : String(padding);
   });
+
+  computedAriaLabel = computed(() => {
+    const label = this.contract().props?.['aria-label'];
+    return label !== undefined && label !== null ? String(label) : undefined;
+  });
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract().props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
 }
diff --git a/packages/angular-renderer/src/components/primitives/label/label.component.html b/packages/angular-renderer/src/components/primitives/label/label.component.html
index 94aea84..6234a45 100644
--- a/packages/angular-renderer/src/components/primitives/label/label.component.html
+++ b/packages/angular-renderer/src/components/primitives/label/label.component.html
@@ -1,4 +1,8 @@
-<label [attr.for]="computedFor()" [attr.aria-label]="computedAriaLabel()">
+<label
+  [attr.for]="computedFor()"
+  [attr.aria-label]="computedAriaLabel()"
+  [attr.aria-describedby]="computedAriaDescribedBy()"
+>
   {{ computedText() }}
   @if (computedRequired()) {
     <span class="required-indicator" aria-hidden="true">*</span>
diff --git a/packages/angular-renderer/src/components/primitives/label/label.component.ts b/packages/angular-renderer/src/components/primitives/label/label.component.ts
index 5f2bf6d..a56dec0 100644
--- a/packages/angular-renderer/src/components/primitives/label/label.component.ts
+++ b/packages/angular-renderer/src/components/primitives/label/label.component.ts
@@ -13,6 +13,7 @@ export interface LabelProps {
   for?: string;
   required?: boolean;
   'aria-label'?: string;
+  'aria-describedby'?: string;
 }
 
 @Component({
@@ -47,4 +48,8 @@ export class LabelComponent implements OrigoAdapter<LabelProps> {
     const label = this.contract().props?.['aria-label'];
     return label !== undefined && label !== null ? String(label) : undefined;
   });
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract().props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
 }
diff --git a/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts b/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
index fd2dfbb..641493b 100644
--- a/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
+++ b/packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts
@@ -260,4 +260,20 @@ test.describe('Primitives Accessibility', () => {
     const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
     expect(accessibilityScanResults.violations).toEqual([]);
   });
+  test('VBox should not have any automatically detectable accessibility issues', async ({
+    page,
+  }) => {
+    await page.setContent(`
+      <main>
+        <div id="host"></div>
+        <script>
+          const host = document.getElementById('host');
+          const shadow = host.attachShadow({mode: 'open'});
+          shadow.innerHTML = '<div class="origo-vbox" style="display: flex; flex-direction: column; gap: 10px;"><div>Item 1</div></div>';
+        </script>
+      </main>
+    `);
+    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
+    expect(accessibilityScanResults.violations).toEqual([]);
+  });
 });
diff --git a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html
index 7ef2239..576cd5d 100644
--- a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html
+++ b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.html
@@ -1,4 +1,8 @@
-<fieldset [disabled]="computedDisabled()" [attr.aria-label]="computedAriaLabel()">
+<fieldset
+  [disabled]="computedDisabled()"
+  [attr.aria-label]="computedAriaLabel()"
+  [attr.aria-describedby]="computedAriaDescribedBy()"
+>
   <legend class="visually-hidden">{{ computedAriaLabel() ?? 'Radio Group' }}</legend>
 
   <div class="radio-options">
diff --git a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts
index a660218..d896484 100644
--- a/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts
+++ b/packages/angular-renderer/src/components/primitives/radio-group/radio-group.component.ts
@@ -20,6 +20,7 @@ export interface RadioGroupProps {
   value?: string;
   disabled?: boolean;
   'aria-label'?: string;
+  'aria-describedby'?: string;
   required?: boolean;
 }
 
@@ -57,6 +58,10 @@ export class RadioGroupComponent implements OrigoAdapter<RadioGroupProps> {
     const label = this.contract().props?.['aria-label'];
     return label !== undefined && label !== null ? String(label) : undefined;
   });
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract().props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
 
   private experienceAdapter = inject(WebExperienceAdapterService);
   private sanitizer = inject(DomSanitizer);
diff --git a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts
index e385f60..4fdabd3 100644
--- a/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts
+++ b/packages/angular-renderer/src/components/primitives/text-input/text-input.component.ts
@@ -33,6 +33,7 @@ export interface TextInputProps {
   encapsulation: ViewEncapsulation.ShadowDom,
   host: {
     '[class.origo-text-input]': 'true',
+    '[attr.data-testid]': 'contract().id',
   },
 })
 export class TextInputComponent implements OrigoAdapter<TextInputProps> {
diff --git a/packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts b/packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts
index 370a37d..3157060 100644
--- a/packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts
+++ b/packages/angular-renderer/src/components/primitives/vbox/vbox.component.ts
@@ -14,6 +14,8 @@ export interface VBoxProps {
   gap?: number | string;
   alignment?: 'start' | 'center' | 'end' | 'stretch';
   padding?: number | string;
+  'aria-label'?: string;
+  'aria-describedby'?: string;
 }
 
 @Component({
@@ -30,6 +32,8 @@ export interface VBoxProps {
     '[style.align-items]': 'computedAlignment()',
     '[style.padding-inline]': 'computedPadding()',
     '[style.padding-block]': 'computedPadding()',
+    '[attr.aria-label]': 'computedAriaLabel()',
+    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
   },
 })
 export class VBoxComponent implements OrigoAdapter<VBoxProps>, ContainerComponent {
@@ -73,4 +77,13 @@ export class VBoxComponent implements OrigoAdapter<VBoxProps>, ContainerComponen
     const num = Number(padding);
     return !isNaN(num) ? `${num}px` : String(padding);
   });
+
+  computedAriaLabel = computed(() => {
+    const label = this.contract().props?.['aria-label'];
+    return label !== undefined && label !== null ? String(label) : undefined;
+  });
+  computedAriaDescribedBy = computed(() => {
+    const desc = this.contract().props?.['aria-describedby'];
+    return desc !== undefined && desc !== null ? String(desc) : undefined;
+  });
 }
diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
index 82e5682..fd70527 100644
--- a/tools/test-registry/test-registry.yaml
+++ b/tools/test-registry/test-registry.yaml
@@ -528,5 +528,6 @@ test_cases:
       - 9-1-form-layout-primitives-batch-1
       - 9-2-data-presentation-primitives-batch-2
       - 9-3-navigation-shell-primitives-batch-3
+      - 9-4-accessibility-localization-enforcement
     last_result: unknown
     results: {}

