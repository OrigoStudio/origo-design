# Sprint Change Proposal

## 1. Issue Summary
- **Trigger**: The Implementation Readiness Assessment flagged critical structural violations in the project's Epics.
- **Problem**: Epics 2.5 and 3.5 are purely technical milestones ("Tech Debt" and "Retro Prep") that do not deliver direct user value. BMad methodology requires Epics to represent user-facing value.
- **Evidence**: `epics.md` contains Epic 2.5 (Epic 2 Tech Debt & Documentation) and Epic 3.5 (Epic 3 Retro Prep Sprint), both of which consist entirely of internal chores rather than functional capabilities.

## 2. Impact Analysis
- **Epic Impact**: Epics 2.5 and 3.5 need to be dismantled. Their underlying stories (e.g., versioning strategy, documentation, JSON import standards, defensive AST traversal) are still necessary but must be re-homed.
- **Story Impact**: Stories 2.5.1, 2.5.2, 2.5.3, 3.5.1, 3.5.2, and 3.5.3 will be converted to Chores/Stories within Epic 2 and Epic 3, or absorbed into Epic 3 and Epic 4 as prerequisites.
- **Artifact Conflicts**: `epics.md` and `sprint-status.yaml` will need updates to reflect the removed epics and re-homed stories. The PRD (`functional-requirements.md`) and `product-brief.md` are **NOT** impacted, as these are implementation-level structural changes.

## 3. Recommended Approach
- **Selected Approach**: Option 1 (Direct Adjustment)
- **Rationale**: The work contained in Epics 2.5 and 3.5 is essential (addressing tech debt and defensive traversal). Instead of dropping the work, we convert these standalone technical epics into Chores or Pre-requisite Stories attached to the existing functional Epics (Epic 2, 3, and 4). This aligns the project structure with BMad best practices without altering the MVP scope or losing critical technical work.
- **Effort Estimate**: Low
- **Risk Level**: Low

## 4. Detailed Change Proposals

### Artifact: `epics.md`

**Proposal 1: Dismantle Epic 2.5**
- **Action**: Remove "Epic 2.5: Epic 2 Tech Debt & Documentation".
- **Re-home**: Move Story 2.5.1 (Versioning), 2.5.2 (Docs), and 2.5.3 (Theme Provider Tech Debt) into **Epic 2** as final completion stories, or into **Epic 3** as prerequisite chores.

**Proposal 2: Dismantle Epic 3.5**
- **Action**: Remove "Epic 3.5: Epic 3 Retro Prep Sprint".
- **Re-home**: Move Story 3.5.1 (Semantic Versioning), 3.5.2 (JSON Import Standard), and 3.5.3 (Defensive AST Traversal) into **Epic 3** as final stories, or into **Epic 4** as prerequisite chores.

### Artifact: `sprint-status.yaml`
- **Action**: Remove references to Epics 2.5 and 3.5 and update the active story list to match the new structure in `epics.md`.

## 5. Implementation Handoff
- **Scope**: Minor (Direct Adjustment)
- **Handoff Recipient**: Developer Agent
- **Responsibilities**: Execute the exact text replacements in `epics.md` and `sprint-status.yaml` to restructure the epics.
