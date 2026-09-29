# Story 10.2: Legacy Migration Strategy Guide

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an Adopting Team Lead,
I want clear documentation on migrating legacy Angular pages to Origo,
so that I can plan our team's transition effectively.

## Acceptance Criteria

1. **Given** the Origo documentation
   **When** I read the "Migration Guide"
   **Then** it provides a clear mapping from standard handwritten Angular HTML/TS to declarative BADL schema concepts (FR-ADOPT-001, FR-ADOPT-002)
2. **And** it explicitly documents escape hatches (e.g., custom adapters or extensions) for migrating legacy components not natively supported by Origo (FR-ADOPT-001).
3. **And** it documents that Origo-rendered pages can coexist with existing non-Origo Angular pages in the same application without conflict (NFR-ADOPT-001).
4. **And** any reference to the ``origo migrate from-code`` CLI command is accompanied by a visible ``:::caution`` note stating it is not yet available and that its output is approximate, requiring developer review (FR-ADOPT-003 / Architecture P3-AD-4).

## Tasks / Subtasks

- [ ] Task 1: Create the Migration Strategy Guide document (AC: 1, 2, 3, 4)
  - [ ] Create a new file: ``docs/src/content/docs/getting-started/migration-guide.mdx`` (MDX format, not ``.md``)
  - [ ] Add a conceptual mapping section: standard handwritten Angular HTML/TS → declarative BADL schema concepts — cover entities, fields, capabilities, interaction contracts
  - [ ] Add a coexistence section: explain that Origo pages can be adopted one-at-a-time and coexist with existing Angular pages in the same router/app shell (NFR-ADOPT-001)
  - [ ] Add an escape-hatches section: custom adapters, extensions, and the upcoming ``origo migrate from-code`` CLI command (see Dev Notes for command spec and required ``:::caution`` wording)
  - [ ] Use Starlight''s built-in Aside syntax (``:::note``, ``:::tip``, ``:::caution``) — never plain Markdown ``>`` blockquotes
  - [ ] Verify Astro/Starlight frontmatter is present: ``title`` and ``description`` fields required
- [ ] Task 2: Wire into Starlight sidebar (``docs/astro.config.mjs``) (AC: 1)
  - [ ] **FIRST: deduplicate the two identical ``Getting Started`` groups** (lines 20–31 in current file — both groups are identical, this is a regression from Story 10.1)
  - [ ] After deduplication, add ``{ label: ''Migration Guide'', link: ''/getting-started/migration-guide/'' }`` to the single ``Getting Started`` items array
  - [ ] Confirm the page is reachable via docs site nav after change
- [ ] Task 3: DoD compliance — Central Test Registry
  - [ ] Open ``tools/test-registry/test-registry.yaml`` and confirm whether any new test scenarios apply to this story
  - [ ] For a documentation-only story there may be no new test cases; if so, add a comment entry to the registry acknowledging Story 10.2 was reviewed and has no automated test scenarios

## Dev Notes

### ⚠️ Prerequisite: Story 10.1 Quickstart Bug Not Yet Fixed

Story 10.1 identified a critical bug in ``quickstart.mdx`` Step 4 (L95): it still instructs the reader to start a local playground server at ``http://localhost:3000``, which is incorrect — the Playground is an embedded iframe on the docs site, no local server required. **Do not cross-link to or reference Step 4 of the Quickstart** until that patch is applied. If referencing the Playground in the migration guide, describe it as "the embedded Playground on the documentation site" without linking to the specific quickstart step.

### ``origo migrate from-code`` — Architecture Context (P3-AD-4)

The ``origo migrate from-code <path>`` command is specified in the Phase 3 architecture spine (P3-AD-4) but **does not yet exist** in ``packages/cli/src/commands/``. Current CLI commands: ``init``, ``new``, ``validate``, ``generate/``. The migration guide must document this command as a **coming escape hatch** with the following mandatory constraints per P3-AD-4:

- Tool uses the TypeScript Compiler API (``ts.createProgram``) to parse existing Angular/React/Vue component source
- Output is BADL entity JSON with every field annotated ``"_generated": true`` and files annotated ``"// APPROXIMATE — developer review required"``
- The tool is a **starting point, not a lossless migration** — this MUST be stated explicitly in the guide
- Because the command does not yet exist, wrap in a ``:::caution`` block: *"The ``origo migrate from-code`` command is planned for a future release and is not yet available."*

### Escape-Hatch Patterns (Architecture Source)

Authoritative sources for escape hatches to document in the guide:

- **Custom Adapters:** Experience Adapters translate Interaction Contracts to medium-specific interactions (Phase 1 Architecture Spine). Teams can write a custom adapter for legacy component patterns not covered by the standard BADL primitives.
- **CLI Template Eject:** Per ADR-002, ``origo generate --eject`` copies internal templates to ``.origo/templates/`` for teams that need to customize boilerplate. [Source: ``docs/src/content/docs/architecture-decisions/002-cli-template-generation-strategy.md``]
- **Extension Points:** Custom capabilities can be declared via the Extension Manifest (Epic 4 / FR-EXT-001–FR-EXT-014) for teams whose legacy components have behaviors outside the standard capability model.

### Sidebar Deduplication (Critical — Regression from Story 10.1)

The current ``docs/astro.config.mjs`` has **two identical ``Getting Started`` groups** (first at lines 20–24, second at lines 27–31). Before adding the migration guide entry, merge them into one:

```js
{
  label: 'Getting Started',
  items: [
    { label: 'Quickstart', link: '/getting-started/quickstart/' },
    { label: 'Testing Protocols', link: '/getting-started/testing-protocols/' },
    { label: 'Migration Guide', link: '/getting-started/migration-guide/' },
  ],
},
```

### Starlight/MDX Formatting Requirements

- **Frontmatter** — Every Starlight page MUST include YAML frontmatter with at minimum: ``title`` and ``description``
- **Aside components** — Use Starlight's built-in Aside syntax: `:::note`, `:::tip`, `:::caution` — do NOT use plain Markdown `>` blockquotes
- **Extension** — File must remain ``.mdx``, not ``.md``
- **Astro + Starlight versions:** 4.x / 0.25.x

### Project Structure Notes

- **Output Path:** ``docs/src/content/docs/getting-started/migration-guide.mdx``
- **Sidebar config:** ``docs/astro.config.mjs`` — note: ``apps/docs`` was relocated to ``docs`` (resolved in Story 10.1)
- **Existing docs structure:** ``getting-started/`` already contains ``quickstart.mdx`` and ``testing-protocols.mdx``

### Cross-Story Context (Epic 10)

- Story 10.1 (prerequisite): Quickstart Guide — Step 4 bug unresolved; do not cross-link to it
- Story 10.2 (this story): Legacy Migration Guide — standalone, no dependency on 10.3 or 10.4
- Story 10.3 (follows this): IDE snippets and boilerplates — may reference migration guide but does not block it
- Story 10.4: Benchmark Validation — uses quickstart (10.1), not migration guide (10.2)

### DoD Compliance

Per ``docs/definition-of-done.md``:
- **ADR/Spike references:** AC #4 references Architecture P3-AD-4 for ``origo migrate from-code``. ADR-002 is referenced in Dev Notes (escape hatch patterns). These satisfy the DoD requirement that technical decisions be linked via ADRs or spikes.
- **Central Test Registry:** ``tools/test-registry/test-registry.yaml`` must be reviewed at story completion (Task 3). This is a documentation-only story; no new automated test cases are expected, but a registry acknowledgment entry is required.

### References

- FR-ADOPT-001: Teams MUST be able to adopt Origo one page at a time; existing pages MUST coexist without conflict
- FR-ADOPT-002: Incremental adoption path MUST be documented as a first-class migration guide
- FR-ADOPT-003: ``@origo/cli`` MUST ship ``origo migrate from-code <path>`` — code-to-BADL migration tool (Phase 3 scope)
- NFR-ADOPT-001: Teams MUST be able to adopt one page at a time; coexist with existing non-Origo pages
- NFR-DX-001: Developer unfamiliar with BADL MUST produce a working rendered page within 10 minutes
- Architecture P3-AD-4: TypeScript Compiler API for Code-to-BADL Migration Analysis [Source: ``_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase3-metadata-platform/ARCHITECTURE-SPINE.md#P3-AD-4``]
- ADR-002: CLI Template Generation Strategy (zero-config + eject pattern) [Source: ``docs/src/content/docs/architecture-decisions/002-cli-template-generation-strategy.md``]
- Epic 10: Onboarding Benchmark & Migration Path
- Story 10.1: 10-Minute Quickstart Guide (prerequisite — Step 4 bug unresolved, do not cross-link)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 (Thinking)

### Debug Log References

N/A

### Completion Notes List

Ultimate context engine analysis completed - comprehensive developer guide created.
✅ Story 10.2 validated and improved: NFR-ADOPT-001 AC added, origo migrate from-code CLI context (P3-AD-4), sidebar deduplication instruction, quickstart Step 4 bug dependency warning, cross-story context, ADR-002 and P3-AD-4 references, DoD test registry task, original AC#3 meta-rule replaced with substantive user-facing criteria.

### File List

- ``docs/src/content/docs/getting-started/migration-guide.mdx`` — NEW: the migration guide document
- ``docs/astro.config.mjs`` — UPDATE: deduplicate duplicate Getting Started groups; add migration-guide entry
- ``tools/test-registry/test-registry.yaml`` — UPDATE: add Story 10.2 registry acknowledgment entry
