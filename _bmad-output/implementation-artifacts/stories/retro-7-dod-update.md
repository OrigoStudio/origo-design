---
baseline_commit: bcef7cfb61624423eeb3efda3309a7aede170364
---
# Story retro.7: dod-update

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer (Alice),
I want to update the Definition of Done (DoD) and pull request templates,
so that test registries are updated when story implementations conclude, explicit reference logging is required in story acceptance criteria, and we prevent future regressions.

## Acceptance Criteria

1. Create or update the primary Definition of Done document at `docs/definition-of-done.md` to include explicit requirements for Test Registry updates and ADR/Spike reference logging.
2. Update the Pull Request template at `.github/pull_request_template.md` (create if it doesn't exist) to include mandatory checkboxes for the new DoD rules.
3. Ensure the DoD is prominently linked from `README.md` and/or `docs/index.md` so that developers can easily discover it.

## Tasks / Subtasks

- [x] Task 1: Create or update the Definition of Done at `docs/definition-of-done.md`. (AC: 1)
  - [x] Subtask 1.1: Add the following exact requirement: "All technical decisions and edge cases must be documented and linked via Architectural Decision Records (ADRs) or technical spikes in the story's Acceptance Criteria."
  - [x] Subtask 1.2: Add the following exact requirement: "The Central Test Registry (`tools/test-registry/test-registry.yaml`) MUST be updated with all new or modified test cases at the conclusion of story implementation."
- [x] Task 2: Create or update the Pull Request template at `.github/pull_request_template.md`. (AC: 2)
  - [x] Subtask 2.1: Add a mandatory checklist item: `[ ] I have updated the Central Test Registry (tools/test-registry/test-registry.yaml) with all affected tests.`
  - [x] Subtask 2.2: Add a mandatory checklist item: `[ ] I have included explicit references to relevant ADRs or technical spikes in the story acceptance criteria.`
- [x] Task 3: Wire the DoD into project documentation. (AC: 3)
  - [x] Subtask 3.1: Add a link to `docs/definition-of-done.md` in the project's root `README.md` (e.g., under a "Contributing" or "Development" section).

### Review Findings

- [x] [Review][Patch] PR template lacks a link to the holistic DoD document. [.github/pull_request_template.md]
- [x] [Review][Patch] retro-6 stories moved to done but action-item statuses not updated / unprompted changes. [_bmad-output/implementation-artifacts/sprint-status.yaml:123-125]
- [x] [Review][Patch] Non-Standard Status Value in `action_items` Table. [_bmad-output/implementation-artifacts/sprint-status.yaml:208]
- [x] [Review][Patch] No N/A option for documentation-only changes with no tests in PR template. [.github/pull_request_template.md]
- [x] [Review][Patch] ADR/spike link requirement unguarded for stories with no AC section. [docs/definition-of-done.md:9]
- [x] [Review][Defer] DoD has no versioning, date, or change history. [docs/definition-of-done.md] — deferred, pre-existing
- [x] [Review][Defer] Checklist boxes are not enforced by CI. [.github/pull_request_template.md] — deferred, pre-existing

## Dev Notes

- **Critical Context:** During Epic 7, we experienced regressions because test registry updates were skipped. The Central Test Registry (`tools/test-registry/test-registry.yaml`) is the single source of truth for test cases across the monorepo, and skipping updates breaks our quality gates. The DoD must enforce this behavior aggressively.
- **Reference Logging:** Maintaining context across implementation and review is critical. Developers should be linking back to Architectural Decision Records (ADRs) and Spikes in the Acceptance Criteria to avoid context loss.
- **Strict Adherence:** Do not invent new DoD rules; only add the ones specified in the Tasks.
- If `docs/definition-of-done.md` or `.github/pull_request_template.md` do not exist, create them as standard markdown files and ensure their directories exist.

### Project Structure Notes

- `docs/definition-of-done.md` (Primary DoD document)
- `.github/pull_request_template.md` (GitHub PR checklist template)
- `README.md` (Root documentation entry point)

### References

- Retrospective Action Item: `retro-7-dod-update` from Epic 7
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml#L208]
- Central Test Registry: `tools/test-registry/test-registry.yaml`

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (High)

### Debug Log References

### Completion Notes List

- Created `docs/definition-of-done.md` to define standard requirements for ADR/Spike linking and Central Test Registry updates.
- Created `.github/pull_request_template.md` with checkboxes for these requirements to ensure they are checked on PR creation.
- Updated `README.md` to link directly to the new Definition of Done document.

### File List

- `docs/definition-of-done.md`
- `.github/pull_request_template.md`
- `README.md`
- `_bmad-output/implementation-artifacts/stories/retro-7-dod-update.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
