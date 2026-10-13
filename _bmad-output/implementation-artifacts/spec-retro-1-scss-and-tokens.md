---
title: 'Author Modular SCSS & Design Token Guide'
type: 'chore'
created: '2026-10-12'
baseline_revision: '0bf6bbcddbb06c24f605667f831f6f86a5639a87'
final_revision: '13596c873055530bdb0482eb4a6fdeb6520702d9'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-retro-2026-10-11.md'
warnings: []
---

<intent-contract>

## Intent

**Problem:** During Epic 1, developer code reviews were repeatedly blocked by styling non-compliances, including hardcoded CSS values (hex/px literals), missing `--origo-*` design tokens, and physical CSS properties violating RTL internationalization (AD-6, NFR-I18N-001).

**Approach:** Author a canonical, comprehensive developer guide at `docs/guidelines/scss-and-tokens.md` detailing modular SCSS conventions, the complete `--origo-*` design token inventory with token tiers, CSS logical properties mapping, and explicit anti-pattern comparisons.

## Boundaries & Constraints

**Always:** Author markdown with precise sections covering Architectural Standards (AD-6, NFR-I18N-001), Modular SCSS Rules (Shadow DOM scoping, component encapsulation, BEM-like class naming), Design Token Taxonomy & Reference (`--origo-*`), CSS Logical Properties Reference & Mapping Table, and Concrete Do / Don't Code Examples. Update `_bmad-output/implementation-artifacts/sprint-status.yaml` marking the action item `status: done`.

**Block If:** Missing clarity on token naming schemes or requiring changes to the design-token compilation pipeline itself.

**Never:** Modify existing Angular component styles or change build-time token generation code in `@origo/design-tokens`; this task is exclusively documentation and sprint tracking.

</intent-contract>

## Code Map

- `docs/guidelines/scss-and-tokens.md` -- Target developer guide: Modular SCSS conventions, `--origo-*` token catalog, CSS logical properties, anti-patterns.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Sprint status registry tracking Epic 1 retro action items.
- `_bmad-output/implementation-artifacts/epic-1-retro-2026-10-11.md` -- Context source defining the retrospective decision and success criteria.

## Tasks & Acceptance

**Execution:**

- [x] `docs/guidelines/scss-and-tokens.md` -- Create canonical guide -- Establish developer-facing reference for modular SCSS, token taxonomy, CSS logical properties, and anti-patterns.
- [x] `_bmad-output/implementation-artifacts/sprint-status.yaml` -- Update action item status -- Set `status: done` for the SCSS & token guide action item under `action_items`.

**Acceptance Criteria:**

- Given the repository root, when `docs/guidelines/scss-and-tokens.md` is inspected, then it exists and contains comprehensive sections for Architecture Invariants (AD-6, NFR-I18N-001), Modular SCSS & Shadow DOM styling principles, Design Token Taxonomy (`--origo-*` catalog across color, spacing, radius, typography, transitions, shadows), CSS Logical Properties mapping table, and side-by-side Do/Don't anti-pattern code examples.
- Given `_bmad-output/implementation-artifacts/sprint-status.yaml`, when line 96-99 is inspected, then the action item for authoring `docs/guidelines/scss-and-tokens.md` is marked with `status: done`.

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
Successfully authored the canonical Modular SCSS & Design Token Guide (`docs/guidelines/scss-and-tokens.md`) and updated the sprint status tracking for Epic 1 retrospective action item 1.

### Files Changed
- `docs/guidelines/scss-and-tokens.md`: Author canonical modular SCSS, design token catalog, and CSS logical properties guide with anti-patterns.
- `_bmad-output/implementation-artifacts/sprint-status.yaml`: Update Epic 1 action item 1 status to `done`.
- `_bmad-output/implementation-artifacts/spec-retro-1-scss-and-tokens.md`: Completed spec and review records.

### Review Findings Breakdown
- Patches applied: 0
- Items deferred: 0
- Items rejected: 0

### Follow-up Review Recommendation
`false` (Clean documentation authoring adhering directly to AD-6, NFR-I18N-001, and retro decisions without code changes or regressions).

### Verification
- `git status`: Verified working tree contains new guide file and updated sprint status.
- Manual inspection of `docs/guidelines/scss-and-tokens.md`: Verified all sections (Tokens, Logical properties, Shadow DOM, Anti-patterns, Checklist) are fully populated without placeholders.

### Residual Risks
None.

## Design Notes

The guide must provide immediate developer ergonomics so developers working on Epic 2 and beyond can copy paste valid token variables and logical properties. It must highlight:
1. Architectural Basis: AD-6 (single source of truth for visual primitives, build-time resolution, zero hardcoded values) and NFR-I18N-001 (RTL layout via CSS logical properties).
2. Modular SCSS Structure: Encapsulation with `:host`, BEM naming conventions, clean separation of structural vs visual properties.
3. Design Token Catalog: Base vs Semantic vs Component tokens, default `--origo-*` variable names with fallback syntax `var(--origo-token-name, fallback)`.
4. CSS Logical Properties: Full mapping from physical (`margin-left`, `padding-top`, `top`, `border-right`, `text-align: left`) to logical (`margin-inline-start`, `padding-block-start`, `inset-block-start`, `border-inline-end`, `text-align: start`).
5. Anti-Patterns & Lint Rules: Concrete ❌ Anti-pattern vs ✅ Standard examples for hex colors, pixel dimensions, physical spacing, and missing fallbacks.

## Verification

**Commands:**

- `git status` -- expected: working tree shows new `docs/guidelines/scss-and-tokens.md` and updated `_bmad-output/implementation-artifacts/sprint-status.yaml`.
- Manual inspection of `docs/guidelines/scss-and-tokens.md` to confirm all sections, tables, and code snippets are complete with no placeholders or TBDs.
