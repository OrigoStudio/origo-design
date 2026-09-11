---
baseline_commit: 587d5f0c25c573b11a33302f376fb4eb98387db9
---
# Story: retro-7-test-registry-backfill
Epic: retro-7
Status: ready-for-dev

## Story

As a QA Lead (Dana) and Developer,
I want to backfill the Central Test Registry with all tests introduced in Epic 7,
So that the registry remains the single source of truth for repository test coverage and regression tracking.

## Acceptance Criteria

1. [AC-1] **Playground Unit Specs Added**: All 7 unit `.spec.ts` files under `packages/playground/src/` are registered in `tools/test-registry/test-registry.yaml`.
2. [AC-2] **Playground E2E Specs Added**: Both Playwright `.spec.ts` files under `packages/playground/e2e/` are registered.
3. [AC-3] **Benchmark Specs Added**: Both `.spec.ts` files under `tools/benchmarks/` are registered.
4. [AC-4] **Validator Updated**: `tools/test-registry/validate-registry.ts` has `@origo/playground` and `tools` added to `VALID_PACKAGES` before any entries use those values.
5. [AC-5] **Schema Compliance**: Every new entry has valid `id` (kebab-case), `description`, `package`, `spec_file` (POSIX forward slashes, relative, exists on disk), `type`, `affected_stories` (non-empty, valid keys), `last_result: unknown`, `results: {}`.
6. [AC-6] **Validation Passes**: `npm run validate:registry` exits with code `0` and no errors.

## Tasks / Subtasks

- [ ] **Task 1: Update `VALID_PACKAGES` in validate-registry.ts FIRST**
  - [ ] Open `tools/test-registry/validate-registry.ts`
  - [ ] Add `'@origo/playground'` and `'tools'` to the `VALID_PACKAGES` Set (lines 12-18)
  - [ ] Save file — do this BEFORE touching `test-registry.yaml` or validation will immediately fail

- [ ] **Task 2: Append playground unit test entries to test-registry.yaml**
  - [ ] Append the 7 playground unit entries from the YAML block in Dev Notes below
  - [ ] Run `npm run validate:registry` — fix any errors before continuing

- [ ] **Task 3: Append playground e2e test entries**
  - [ ] Append the 2 playground e2e entries from the YAML block in Dev Notes below
  - [ ] Run `npm run validate:registry` — confirm pass

- [ ] **Task 4: Append benchmark test entries**
  - [ ] Append the 2 benchmark entries from the YAML block in Dev Notes below
  - [ ] Run `npm run validate:registry` — confirm final pass with 39 total entries

## Dev Notes

### CRITICAL GUARDRAILS

- **Update `VALID_PACKAGES` FIRST** — Task 1 must complete before Task 2. The validator is invoked on the full file and any entry with an unknown package fails immediately with a confusing error message.
- **POSIX forward slashes only** — `spec_file` must use `/`. The validator explicitly rejects `\` (Windows backslashes) and absolute paths.
- **Playground E2E tests use Playwright, not Vitest** — `packages/playground/e2e/*.spec.ts` use `@playwright/test` and are run via `nx run playground:e2e`. Do NOT attempt to run them with `nx run playground:test`. Register as `type: e2e`.
- **Benchmark specs belong to Epic 1, not Epic 7** — `perf-runner.spec.ts` and `heavy-ast-fixture.spec.ts` describe `NFR-PERF-002`, which was the acceptance criterion for Story `1-3-performance-benchmark-harness-nfr-perf-002`. Use that story key, not a Epic 7 key.
- **`badl-editor.component.spec.ts` spans three stories** — introduced in `7-1`, extended in `retro-7-state-persistence` (localStorage persistence effect tests), and extended again in `retro-7-resolve-debt` (reactive inputs tests). All three must appear in `affected_stories`.

### Files Being Modified

- **`tools/test-registry/validate-registry.ts`** <- UPDATE FIRST
  - **Change:** Add `'@origo/playground'` and `'tools'` to `VALID_PACKAGES` Set at lines 12-18.
  - **Preserve:** All existing validation rules, patterns, and logic.

- **`tools/test-registry/test-registry.yaml`** <- APPEND ONLY
  - **Change:** Append 11 new test entries after the existing 28 entries (after line 277).
  - **Preserve:** All 28 existing entries and the file header/schema comments. Do NOT re-sort or reformat.

### validate-registry.ts — VALID_PACKAGES Change

Current (lines 12-18):
```typescript
const VALID_PACKAGES = new Set([
  '@origo/cli',
  '@origo/core',
  '@origo/design-tokens',
  '@origo/angular-renderer',
  'origo-e2e',
]);
```

Replace with:
```typescript
const VALID_PACKAGES = new Set([
  '@origo/cli',
  '@origo/core',
  '@origo/design-tokens',
  '@origo/angular-renderer',
  '@origo/playground',
  'origo-e2e',
  'tools',
]);
```

### Pre-Built YAML — Playground Unit Tests (Task 2)

Append verbatim after the last entry in `test-registry.yaml`:

```yaml
  - id: playground-app-component
    description: 'Verifies AppComponent bootstrap and editor/preview layout wiring'
    package: '@origo/playground'
    spec_file: packages/playground/src/app/app.component.spec.ts
    type: unit
    affected_stories:
      - 7-1-web-based-editor-component
    last_result: unknown
    results: {}
  - id: playground-badl-editor-component
    description: 'Verifies BadlEditorComponent Monaco integration, state persistence, and reactive inputs'
    package: '@origo/playground'
    spec_file: packages/playground/src/editor/badl-editor.component.spec.ts
    type: unit
    affected_stories:
      - 7-1-web-based-editor-component
      - retro-7-state-persistence
      - retro-7-resolve-debt
    last_result: unknown
    results: {}
  - id: playground-schema-registry
    description: 'Verifies static BADL schema registration for Monaco language features'
    package: '@origo/playground'
    spec_file: packages/playground/src/editor/schema-registry.spec.ts
    type: unit
    affected_stories:
      - 7-1-web-based-editor-component
    last_result: unknown
    results: {}
  - id: playground-preview-pane-component
    description: 'Verifies PreviewPaneComponent iframe sandboxing and message relay'
    package: '@origo/playground'
    spec_file: packages/playground/src/preview/preview-pane.component.spec.ts
    type: unit
    affected_stories:
      - 7-2-live-compilation-rendering-pipeline
    last_result: unknown
    results: {}
  - id: playground-preview-root-component
    description: 'Verifies PreviewRootComponent renderer bootstrap inside the sandboxed iframe'
    package: '@origo/playground'
    spec_file: packages/playground/src/preview/preview-root.component.spec.ts
    type: unit
    affected_stories:
      - 7-2-live-compilation-rendering-pipeline
    last_result: unknown
    results: {}
  - id: playground-preview-service
    description: 'Verifies PreviewService compilation dispatch and result broadcast'
    package: '@origo/playground'
    spec_file: packages/playground/src/preview/preview.service.spec.ts
    type: unit
    affected_stories:
      - 7-2-live-compilation-rendering-pipeline
    last_result: unknown
    results: {}
  - id: playground-compiler-worker
    description: 'Verifies CompilerWorker AST compilation and error reporting in an isolated worker context'
    package: '@origo/playground'
    spec_file: packages/playground/src/workers/compiler.worker.spec.ts
    type: unit
    affected_stories:
      - 7-2-live-compilation-rendering-pipeline
      - retro-7-resolve-debt
    last_result: unknown
    results: {}
```

### Pre-Built YAML — Playground E2E Tests (Task 3)

```yaml
  - id: playground-e2e-preview-latency
    description: 'E2E: verifies live preview updates within 500ms of last keystroke under latency optimization'
    package: '@origo/playground'
    spec_file: packages/playground/e2e/preview-latency.spec.ts
    type: e2e
    affected_stories:
      - 7-3-live-preview-latency-optimization
    last_result: unknown
    results: {}
  - id: playground-e2e-state-persistence
    description: 'E2E: verifies editor content persists to localStorage and restores on page reload'
    package: '@origo/playground'
    spec_file: packages/playground/e2e/state-persistence.spec.ts
    type: e2e
    affected_stories:
      - retro-7-state-persistence
    last_result: unknown
    results: {}
```

### Pre-Built YAML — Benchmark Tests (Task 4)

```yaml
  - id: tools-perf-runner
    description: 'Performance benchmark harness measuring AST compilation throughput (NFR-PERF-002)'
    package: 'tools'
    spec_file: tools/benchmarks/perf-runner.spec.ts
    type: perf
    affected_stories:
      - 1-3-performance-benchmark-harness-nfr-perf-002
    last_result: unknown
    results: {}
  - id: tools-heavy-ast-fixture
    description: 'Generates and validates large synthetic AST fixtures for performance benchmarking (NFR-PERF-002)'
    package: 'tools'
    spec_file: tools/benchmarks/fixtures/heavy-ast-fixture.spec.ts
    type: perf
    affected_stories:
      - 1-3-performance-benchmark-harness-nfr-perf-002
    last_result: unknown
    results: {}
```

### Previous Story Intelligence

From `retro-6-central-test-registry` (direct precedent):
- The validator checks if `spec_file` exists on disk using `path.join(REPO_ROOT, tc.spec_file)`. A single wrong path character causes a hard failure with a misleading message.
- IDs must pass `/^[a-z0-9]+(-[a-z0-9]+)*$/` — no uppercase, no leading/trailing hyphens, no dots.
- Story key regex is `/^(\d+(\.\d+)?(-\d+)*-[\w-]+|retro-[\w.-]+)$/` — all keys used in this story are valid.
- Final count after this story: 28 existing + 11 new = **39 total entries**.

### References

- [Source: tools/test-registry/validate-registry.ts] — live validation script
- [Source: tools/test-registry/test-registry.yaml] — registry being extended
- [Source: _bmad-output/implementation-artifacts/retro-6-central-test-registry.md] — precedent story
- [Source: _bmad-output/implementation-artifacts/epic-7-retro-2026-09-11.md] — action item origin
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml] — story key authoritative source

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

- `tools/test-registry/validate-registry.ts` [MODIFY]
- `tools/test-registry/test-registry.yaml` [MODIFY]

### Review Findings
