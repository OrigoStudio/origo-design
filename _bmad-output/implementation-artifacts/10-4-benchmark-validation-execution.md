---
baseline_commit: current
---
# Story 10.4: Benchmark Validation Execution

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Platform Owner,
I want to validate the onboarding experience with real developers,
So that I can definitively prove we hit our core DX metric.

## Acceptance Criteria

1. **Given** the completed platform (Epics 1-9) and the Quickstart guide (Story 10.1)
   **When** a developer unfamiliar with BADL is asked to build a page using `origo generate page --template list-detail` (ADR-002)
   **Then** they successfully produce a working, rendered Origo page in under 10 minutes (NFR-DX-001, FR-DX-006)
2. **And** the benchmark explicitly requires building a functional form with validation or a basic data view (using the `list-detail` template), rather than a trivial blank page, to prevent metric gaming.
3. **And** the story output MUST include a benchmark report artifact at `docs/src/content/docs/benchmarks/onboarding-10-min.md` documenting: the exact scenario used, the step-by-step execution walkthrough, the time taken per step, whether the 10-minute threshold was met, and any roadblocks encountered.
4. **And** the benchmark report MUST explicitly acknowledge the known Quickstart Step 4 bug (incorrect URL `http://localhost:3000`) and document the workaround applied during the benchmark run.

## Tasks / Subtasks

- [ ] Task 1: Define Benchmark Protocol (AC: 1, 2)
  - [ ] Pre-selected scenario: "Build a User Profile Form" using `origo generate page --template list-detail` (from Story 10.3) as the entry point — DO NOT re-derive the scenario from scratch.
  - [ ] Outline the exact steps: `origo doctor` (env verification) → `origo generate page --template list-detail UserProfile` → edit `schemas/user-profile.json` to add 3 fields with validation → view in Playground.
  - [ ] Document success criteria: time ≤ 10 minutes; form renders in Origo Playground with at least one field validation visually active.
  - [ ] Explicitly note the Step 4 workaround: Quickstart Step 4 instructs `http://localhost:3000` — the correct Playground dev server URL is `http://localhost:4321` (Astro default). Use the correct URL in the benchmark protocol.
- [ ] Task 2: Author Benchmark Report Artifact (AC: 3, 4)
  - [ ] Create `docs/src/content/docs/benchmarks/onboarding-10-min.md` — **NEW** Starlight doc with:
    - Frontmatter: `title: "10-Minute Onboarding Benchmark Report"`, `description: "Execution report validating NFR-DX-001: developer onboarding benchmark."`
    - Section "Benchmark Scenario": scenario name, tools used, success criteria
    - Section "Execution Log": step-by-step narrative with timestamps (e.g., `T+0:00`, `T+2:15`, `T+7:42`)
    - Section "Result": Pass/Fail, total time, notes
    - Section "Known Issues Encountered": document the Step 4 Quickstart bug workaround
  - [ ] This is a **documentation-only** story. Author the report as a first-person narrative walk-through — no code changes to runtime packages are required.
- [ ] Task 3: Wire benchmark report into Starlight sidebar (AC: 3)
  - [ ] Create the `docs/src/content/docs/benchmarks/` directory (does not currently exist).
  - [ ] Update `docs/astro.config.mjs` to add a `benchmarks` sidebar section after `guides` with: `{ label: 'Onboarding Benchmark', link: '/benchmarks/onboarding-10-min/' }`. Match the existing indentation and format exactly.
- [ ] Task 4: Central Test Registry Update (DoD)
  - [ ] Append to `tools/test-registry/test-registry.yaml` under `test_cases`:
    ```yaml
    - id: dx-onboarding-benchmark-10min
      description: 'Validates NFR-DX-001: developer unfamiliar with BADL produces a working rendered page in under 10 minutes using the list-detail template'
      package: '@origo/docs'
      spec_file: docs/src/content/docs/benchmarks/onboarding-10-min.md
      type: manual
      affected_stories:
        - 10-4-benchmark-validation-execution
      last_result: unknown
      results: {}
    ```

## Dev Notes

### ⚠️ This is a Documentation-Only Story

No runtime code changes are required. Deliverables:
1. `docs/src/content/docs/benchmarks/onboarding-10-min.md` — benchmark report
2. `docs/astro.config.mjs` — one sidebar entry added
3. `tools/test-registry/test-registry.yaml` — one entry appended

**❌ DO NOT modify any `packages/` files.**
**❌ DO NOT create new CLI commands** — `origo generate page --template list-detail` already exists from Story 10.3.

### Pre-existing Infrastructure — DO NOT Reinvent

Story 10.3 delivered:
- `origo generate page --template list-detail` → generates `schemas/<name>.json` boilerplate
- `origo generate page --template login` → generates `schemas/<name>.json` for auth flows

The benchmark entry point is `list-detail` — already fully tested and reviewed.

Story 10.1 delivered:
- Quickstart guide at `docs/src/content/docs/getting-started/quickstart.mdx`
- `origo doctor` as the Step 0 environment verification command

### ⚠️ Critical: Quickstart Step 4 Bug

`docs/src/content/docs/getting-started/quickstart.mdx` Step 4 (line ~95) incorrectly instructs `http://localhost:3000`. The correct Playground dev server URL is `http://localhost:4321` (Astro default). The benchmark report MUST document this workaround. **Do NOT fix the quickstart file in this story** — out of scope.

### Starlight Docs Conventions (from Stories 10.1, 10.2)

- Use `.md` extension (not `.mdx`) — existing `guides/` docs use `.md`.
- Asides: `:::note`, `:::tip`, `:::caution` — **never** plain `>` blockquotes.
- Required frontmatter: `title`, `description`.
- Match existing `docs/astro.config.mjs` sidebar format before editing.

### File Structure — [NEW] / [UPDATE] Map

| Status | Path |
|--------|------|
| NEW    | `docs/src/content/docs/benchmarks/onboarding-10-min.md` |
| UPDATE | `docs/astro.config.mjs` |
| UPDATE | `tools/test-registry/test-registry.yaml` |

### DoD Compliance

- **ADR references:** AC #1 explicitly references ADR-002 (CLI Template Generation Strategy — benchmark uses `origo generate page` as the entry point).
- **Test Registry:** Task 4 mandates the `tools/test-registry/test-registry.yaml` update. Entry type is `manual` (benchmark is a documented human execution, not an automated spec file).

### References

- NFR-DX-001: Developer unfamiliar with BADL MUST produce a working rendered page within 10 minutes (`_bmad-output/planning-artifacts/epics.md` line 96).
- FR-DX-006: A developer MUST produce a working rendered page within 10 minutes of first install.
- ADR-002: CLI Template Generation Strategy (zero-config + eject) — `docs/src/content/docs/architecture-decisions/002-cli-template-generation-strategy.md`
- Story 10.1: Quickstart Guide (Step 4 bug — correct URL is `http://localhost:4321`).
- Story 10.2: Legacy Migration Strategy Guide (Starlight aside syntax, DoD pattern).
- Story 10.3: Developer Snippets & Boilerplates — source of `origo generate page --template list-detail`.

## Dev Agent Record

### Agent Model Used
_To be filled by dev agent._

### Debug Log References
N/A

### Completion Notes List
Story rebuilt by :validate pass. Critical issues resolved: concrete output artifact path specified, file structure [NEW]/[UPDATE] table added, Starlight sidebar wiring task (astro.config.mjs) added, Test Registry YAML stub provided, ADR-002 reference moved into AC #1, Quickstart Step 4 bug documented as explicit benchmark protocol step with correct URL (localhost:4321), benchmark scenario pre-selected (list-detail template from Story 10.3), documentation-only scope clarified. Agent model placeholder corrected.

### File List
_To be filled by dev agent on completion._
