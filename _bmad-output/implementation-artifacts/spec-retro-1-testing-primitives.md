---
title: 'Author Test Quality & ShadowDOM Interaction Guide'
type: 'chore'
created: '2026-10-12'
baseline_revision: 'fee62064d4a6a35eb28ba2e2ad628ed9aae8d3ed'
final_revision: 'cab1c33eae5a1663fc9d2a0647d494f784cc0dbd'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-retro-2026-10-11.md'
  - '{project-root}/docs/guidelines/component-invariants.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** During Epic 1, developer code reviews and QA passes were frequently hindered by superficial test suites that bypassed real Shadow DOM interactions, relied on brittle shallow mocks of component methods, or queried elements outside the `shadowRoot`, hiding critical event delegation and style encapsulation regressions.

**Approach:** Author a canonical, comprehensive developer and QA guide at `docs/guidelines/testing-primitives.md` establishing concrete standards for real `shadowRoot` DOM event simulation vs mocking, Angular 18 Signal input testing (`componentRef.setInput`), accessibility test execution with Playwright and axe-core, test isolation lifecycle rules, anti-patterns, and a PR testing checklist.

## Boundaries & Constraints

**Always:** Author markdown with comprehensive sections covering Architectural Testing Standards (P1-AD-1, P1-AD-6, AD-11, AD-12), Shadow DOM Boundary Piercing (`fixture.nativeElement.shadowRoot ?? fixture.nativeElement`), Real DOM Event Simulation (click, input/sanitize, keyboard, composed custom events) vs Mocking Anti-Patterns, Signal & Contract State Verification (`componentRef.setInput`, zoneless change detection), Accessibility Testing with `@axe-core/playwright` and `@jscutlery/playwright-ct-angular`, Test Lifecycle Isolation & Central Registry Hygiene (`test-registry.yaml`), Side-by-Side Do/Don't Anti-Patterns, and a QA PR Pre-Flight Testing Checklist. Update `_bmad-output/implementation-artifacts/sprint-status.yaml` marking Epic 1 action item 3 `status: done`.

**Block If:** Decisions requiring changes to core architectural contracts in `@origostudio/core`, modifying Jest/Playwright framework configurations, or altering production Angular renderer code.

**Never:** Modify existing Angular component source code or change production packages; this task is exclusively testing documentation and sprint status tracking.

</intent-contract>

## Code Map

- `docs/guidelines/testing-primitives.md` -- Target developer and QA guide: Test quality, Shadow DOM interaction patterns, real event simulation, accessibility verification, test hygiene.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Sprint status registry tracking Epic 1 retro action items.
- `_bmad-output/implementation-artifacts/epic-1-retro-2026-10-11.md` -- Context source defining the retrospective decision and success criteria.
- `docs/guidelines/component-invariants.md` -- Sibling guide detailing component invariants and golden component patterns.

## Tasks & Acceptance

**Execution:**

- [x] `docs/guidelines/testing-primitives.md` -- Create canonical guide -- Establish developer and QA reference for Shadow DOM event testing, Signal assertions, accessibility audits, and test hygiene.
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Update action item status -- Set `status: done` for the Test Quality & Shadow DOM Interaction Guide action item under `action_items`.

**Acceptance Criteria:**

- Given the repository root, when `docs/guidelines/testing-primitives.md` is inspected, then it exists and contains comprehensive sections for Architectural Standards (P1-AD-1, P1-AD-6, AD-11, AD-12), Shadow DOM Boundary Piercing (`fixture.nativeElement.shadowRoot ?? fixture.nativeElement`), Real DOM Event Simulation vs Mocking (click, input, keyboard, composed custom events), Signal Contract Testing (`componentRef.setInput`, `provideZonelessChangeDetection`), Playwright Component Accessibility Testing (`@axe-core/playwright`), Test Isolation & Central Registry Hygiene (`test-registry.yaml`), Side-by-side Do/Don't Anti-Patterns, and a QA PR Pre-Flight Testing Checklist.
- Given `_bmad-output/implementation-artifacts/sprint-status.yaml`, when lines 104-107 are inspected, then the action item for authoring `docs/guidelines/testing-primitives.md` is marked with `status: done`.

## Spec Change Log

## Review Triage Log

### 2026-10-12 — Review pass

- intent_gap: 0
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 0
- addressed_findings:
  - none

## Auto Run Result

### Summary
Successfully authored the canonical Test Quality & Shadow DOM Interaction Guide (`docs/guidelines/testing-primitives.md`) and updated sprint status tracking for Epic 1 retrospective action item 3.

### Files Changed
- `docs/guidelines/testing-primitives.md`: Author canonical guide covering Shadow DOM piercing, real DOM event simulation, Signal testing, Playwright component accessibility audits, test isolation, anti-patterns, and PR checklist.
- `_bmad-output/implementation-artifacts/sprint-status.yaml`: Update Epic 1 action item 3 status to `done`.
- `_bmad-output/implementation-artifacts/spec-retro-1-testing-primitives.md`: Completed spec, review logs, and auto-run results.

### Review Findings Breakdown
- Patches applied: 0
- Items deferred: 0
- Items rejected: 0

### Follow-up Review Recommendation
`false` (Clean documentation authoring adhering directly to P1-AD-1, P1-AD-6, AD-11, AD-12, and retro decisions without code changes or regressions).

### Verification
- `git status`: Verified working tree contains new guide file, updated sprint status, and spec artifact.
- `npm run validate:registry`: Verified central test registry passes with 95 test cases verified.
- Manual inspection of `docs/guidelines/testing-primitives.md`: Verified all sections (Standards, Shadow DOM piercing, Real DOM simulation, Golden patterns, Isolation & registry, Anti-patterns, Checklist) are fully populated without placeholders.

### Residual Risks
None.

## Design Notes

The test quality and Shadow DOM guide must serve as the primary pre-flight manual for developers and QA engineers in Epic 2 and beyond. It must detail:
1. Architectural Basis:
   - P1-AD-1 (Angular 18 Standalone, zoneless signals testing, `provideZonelessChangeDetection()`).
   - P1-AD-6 (Accessibility enforcement in CI via Playwright component testing and axe-core).
   - AD-11 (Telemetry via BADL semantic paths / spying on `WebExperienceAdapterService.dispatchCapability`).
   - AD-12 (Test selectors via `metadata_path` / `[attr.data-testid]="contract().id"`).
2. Piercing Shadow DOM Boundaries:
   - Why `fixture.debugElement.query(By.css(...))` fails when `ViewEncapsulation.ShadowDom` is active.
   - Canonical querying pattern: `const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement`.
   - Querying nested slotted content, `<ng-content>`, and `#vc` ViewContainerRef projections.
3. Real DOM Event Simulation vs Mocking:
   - Native DOM events: `element.click()`, `element.dispatchEvent(new Event('input'))`, `element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))`.
   - Event bubbling and boundary composition (`bubbles: true, composed: true`).
   - Why calling component class methods directly (`component.onClick()`) is an anti-pattern that conceals template wiring regressions.
   - Verification of contract synchronization, sanitized inputs (e.g. XSS payloads), and capability dispatch.
4. Signal Inputs & Reactivity:
   - Setting inputs using `componentRef.setInput('contract', { id: '...', type: '...', props: { ... } })`.
   - Triggering change detection via `fixture.detectChanges()`.
   - Testing defensive contract handling with null/undefined props.
5. Accessibility & Playwright Component Testing (`.pw.ts`):
   - `@jscutlery/playwright-ct-angular` setup with `mount(Component, { props: ... })`.
   - Integration with `@axe-core/playwright` and rules disabled for isolated component mounts (`document-title`, `html-has-lang`, `landmark-one-main`, etc.).
   - Testing keyboard interaction, ARIA roles, and attributes.
6. Test Isolation, Lifecycle & Test Registry:
   - Proper scoping of mocks in `beforeEach` and cleanup via `afterEach` (`jest.restoreAllMocks()`, `document.body.innerHTML = ''`).
   - Registration of test cases in `tools/test-registry/test-registry.yaml` and validation with `npm run validate:registry`.
7. Side-by-Side Anti-Patterns:
   - Clear comparison tables of ❌ Anti-pattern vs ✅ Standard pattern.
8. PR Pre-Flight Testing Checklist:
   - Copy-paste checklist for developers and QA engineers.

## Verification

**Commands:**

- `npm run validate:registry` -- expected: Central test registry validation passes with 95 test cases verified.
- `git status` -- expected: working tree shows new `docs/guidelines/testing-primitives.md`, updated `_bmad-output/implementation-artifacts/sprint-status.yaml`, and spec artifact.

**Manual checks (if no CLI):**

- Verify `docs/guidelines/testing-primitives.md` exists and contains all required sections without any placeholders or TBDs.
- Verify `_bmad-output/implementation-artifacts/sprint-status.yaml` has `status: done` for action item 3 of Epic 1.
