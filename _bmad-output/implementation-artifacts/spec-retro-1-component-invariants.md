---
title: 'Author Component Invariants & ShadowDOM Checklist'
type: 'chore'
created: '2026-10-12'
baseline_revision: 'c52e63f2055d159207198bdeb4bce804484c196f'
status: 'in-review'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-retro-2026-10-11.md'
  - '{project-root}/docs/guidelines/scss-and-tokens.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** During Epic 1, developer code reviews were repeatedly blocked by preventable architectural omissions in Angular components, including missing `ViewEncapsulation.ShadowDom`, omission of `ChangeDetectionStrategy.OnPush`, lack of runtime `contractSchema` validation, and incorrect Shadow DOM event testing.

**Approach:** Author a canonical, comprehensive developer guide and checklist at `docs/guidelines/component-invariants.md` defining mandatory Angular 18 component invariants (`ShadowDom`, `OnPush`, Signals, BADL contract hooks, Container slots, Accessibility), complete golden examples, and testing patterns.

## Boundaries & Constraints

**Always:** Author markdown with precise sections covering Architectural Standards (P1-AD-1, P1-AD-5, P1-AD-6, AD-4), the 6 Non-Negotiable Component Invariants, Golden Component Implementations (Primitive & Container), Shadow DOM Testing Patterns, Anti-Patterns (Do/Don't), and a PR Pre-Flight Checklist. Update `_bmad-output/implementation-artifacts/sprint-status.yaml` marking Epic 1 action item 2 `status: done`.

**Block If:** Decisions requiring changes to core architectural contracts in `@origostudio/core` or modifying Angular renderer runtime interfaces.

**Never:** Modify existing Angular component source code or test suites; this task is exclusively documentation and sprint tracking.

</intent-contract>

## Code Map

- `docs/guidelines/component-invariants.md` -- Target developer guide: Component invariants, Shadow DOM checklist, golden code patterns, testing standards.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Sprint status registry tracking Epic 1 retro action items.
- `_bmad-output/implementation-artifacts/epic-1-retro-2026-10-11.md` -- Context source defining the retrospective decision and success criteria.

## Tasks & Acceptance

**Execution:**

- [x] `docs/guidelines/component-invariants.md` -- Create canonical guide -- Establish developer-facing reference and checklist for component invariants, Shadow DOM, Signals, and BADL contracts.
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Update action item status -- Set `status: done` for the Component Invariants checklist action item under `action_items`.

**Acceptance Criteria:**

- Given the repository root, when `docs/guidelines/component-invariants.md` is inspected, then it exists and contains comprehensive sections for Architectural Invariants (P1-AD-1, P1-AD-5, P1-AD-6), the 6 Non-Negotiable Invariants (`ViewEncapsulation.ShadowDom`, `ChangeDetectionStrategy.OnPush`, Signals reactivity, BADL `OrigoAdapter` & `contractSchema`, Container composition, Accessibility/Telemetry host bindings), Golden Component Examples, Shadow DOM testing patterns with `fixture.nativeElement.shadowRoot`, Do/Don't anti-patterns, and a PR Pre-Flight Checklist.
- Given `_bmad-output/implementation-artifacts/sprint-status.yaml`, when lines 100-103 are inspected, then the action item for authoring `docs/guidelines/component-invariants.md` is marked with `status: done`.

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
Successfully authored the canonical Component Invariants & Shadow DOM Checklist (`docs/guidelines/component-invariants.md`) and updated sprint status tracking for Epic 1 retrospective action item 2.

### Files Changed
- `docs/guidelines/component-invariants.md`: Author canonical guide covering the 6 non-negotiable component invariants, golden examples, Shadow DOM testing patterns, anti-patterns, and PR checklist.
- `_bmad-output/implementation-artifacts/sprint-status.yaml`: Update Epic 1 action item 2 status to `done`.
- `_bmad-output/implementation-artifacts/spec-retro-1-component-invariants.md`: Completed spec, review logs, and auto-run results.

### Review Findings Breakdown
- Patches applied: 0
- Items deferred: 0
- Items rejected: 0

### Follow-up Review Recommendation
`false` (Clean documentation authoring adhering directly to P1-AD-1, P1-AD-5, P1-AD-6, and retro decisions without code changes or regressions).

### Verification
- `git status`: Verified working tree contains new guide file, updated sprint status, and spec artifact.
- Manual inspection of `docs/guidelines/component-invariants.md`: Verified all sections (Invariants, Golden Examples, Testing, Anti-patterns, Checklist) are fully populated without placeholders.

### Residual Risks
None.

## Design Notes

The component invariants guide must serve as the primary pre-flight manual for engineers implementing primitives in Epic 2 and beyond. It must detail:
1. Architectural Basis: P1-AD-1 (Angular 18 Standalone, zoneless Signals), P1-AD-5 (Composition over inheritance), P1-AD-6 (WCAG 2.1 AA accessibility), AD-4 (Renderer isolation), AD-11/AD-12 (Telemetry & Test selectors via `metadata_path` / `contract.id`).
2. The 6 Non-Negotiable Invariants:
   - Encapsulation: Strict `ViewEncapsulation.ShadowDom` preventing style leaks.
   - Change Detection: `ChangeDetectionStrategy.OnPush` required for high performance and zoneless support.
   - Reactivity: Signals (`input.required<InteractionContract<TProps>>()`, `computed()`, `model()`, `output()`), zero unmanaged RxJS subscriptions.
   - BADL Contract & Schema: Implementation of `OrigoAdapter<TProps>`, declaration of `static readonly contractSchema` and `static readonly strictContract = false`, usage of `coerceContractProps()`.
   - Structural Composition: Implementation of `ContainerComponent` with `viewChild('vc', { read: ViewContainerRef })` and `<ng-content>` / `<ng-container #vc>` slots.
   - Host Bindings & A11y: `[attr.data-testid]="contract().id"`, ARIA attributes (`aria-label`, `aria-describedby`, roles), keyboard handlers.
3. Golden Reference Implementations: Full code snippets for both an Action/Control Primitive (`origo-button`) and a Container/Layout Primitive (`origo-card`).
4. Shadow DOM Testing: Penetrating shadow boundaries in unit tests via `fixture.nativeElement.shadowRoot ?? fixture.nativeElement`, setting signal inputs via `componentRef.setInput('contract', ...)`.
5. Anti-Patterns & Pitfalls: Detailed ❌ Anti-pattern vs ✅ Standard comparisons.
6. PR Pre-Flight Checklist: Interactive markdown checklist for code review compliance.

## Verification

**Manual checks (if no CLI):**

- Verify `docs/guidelines/component-invariants.md` exists and contains all 6 invariants, 2 golden patterns, testing guidelines, anti-patterns, and checklist without any placeholders.
- Verify `_bmad-output/implementation-artifacts/sprint-status.yaml` has `status: done` for action item 2 of Epic 1.
- Run `git status` to verify clean repository status and exact file modifications.
