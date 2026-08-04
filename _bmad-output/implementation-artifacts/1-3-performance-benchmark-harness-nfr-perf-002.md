---
status: review
baseline_commit: 91818855461dfac04a7db84a293a7dd115d5a98a
story_id: 1.3
story_key: 1-3-performance-benchmark-harness-nfr-perf-002
epic: 1
---

# Story 1.3: Performance Benchmark Harness (NFR-PERF-002)

Status: review

## Story

As a Platform Engineer,
I want a performance testing harness integrated into CI,
so that we can measure BADL validation speeds and prevent regressions.

## Acceptance Criteria

1. **Given** a new PR is opened
   **When** the CI pipeline runs
   **Then** a performance benchmark suite executes against a standardized heavy payload (e.g., 10,000-node AST representing a 500-entity application).
2. **Given** the performance benchmark suite executes
   **When** validation speed and memory metrics are evaluated
   **Then** the CI pipeline fails if there is a statistically significant relative performance regression compared to the `main` branch baseline (NFR-PERF-002) or if total validation time exceeds 30 seconds.

## Tasks / Subtasks

- [x] Task 1: Implement Standardized Heavy BADL Payload Generator (AC: #1)
  - [x] Create `tools/benchmarks/fixtures/heavy-ast-fixture.ts` that dynamically generates a 10,000-node BADL AST payload (simulating 500 entities with fields, capabilities, contracts, and permissions).
  - [x] Ensure payload generation is deterministic and reproducible across benchmark runs.
- [x] Task 2: Implement Performance Benchmark Runner (AC: #1, #2)
  - [x] Create `tools/benchmarks/perf-runner.ts` using `node:perf_hooks` for high-precision timing of BADL validation runs.
  - [x] Implement metrics collection (execution time, ops/sec, memory heap usage, p50/p95 latency).
  - [x] Support generating and reading baseline metric files (`.perf-baseline.json`).
- [x] Task 3: Implement Regression & SLA Gate Logic (AC: #2)
  - [x] Create `tools/benchmarks/compare-baseline.ts` to compare current run metrics against baseline.
  - [x] Set regression tolerance threshold (e.g. max 15% relative regression) and hard SLA ceiling (30 seconds for 500-entity equivalent).
  - [x] Exit with non-zero code and actionable console report when performance regressions are detected.
- [x] Task 4: Add Benchmark Command to `package.json` & Nx (AC: #1)
  - [x] Add `"perf:benchmark"` script to `package.json` pointing to the runner.
  - [x] Validate script execution with `npm run perf:benchmark`.
- [x] Task 5: Integrate Performance Gate Step in GitHub Actions Workflow (AC: #1, #2)
  - [x] Update `.github/workflows/ci.yml` with a step `Run Performance Benchmark Harness (NFR-PERF-002)`.
  - [x] Configure CI step to run benchmark and fail on regression.

## Dev Notes

- **NFR-PERF-002 Requirement:** BADL grammar validation at build time MUST complete in under 30 seconds for a 500-entity application.
- **Ajv 8 Validation Performance Isolation:** Distinguish between schema compilation time (`ajv.compile()`) and instance validation time (`validate(payload)`). Benchmark runner should measure both independently.
- **Regression Detection Rules:**
  - Hard limit: Validation duration > 30,000ms → Fail.
  - Relative limit: Validation duration > `baseline * 1.15` (15% slower than main) → Fail.
- **Node Environment:** Use Node 22 LTS native `performance.now()` and `v8.getHeapStatistics()`.

### Project Structure Notes

- Benchmark suite files placed in `tools/benchmarks/`.
- Baseline output file saved as `.perf-baseline.json` at repository root.
- CI workflow file `.github/workflows/ci.yml` updated with the new execution step.

### References

- [Functional & Non-Functional Requirements: NFR-PERF-002](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/epics.md#L80)
- [Architecture Spine: P1-AD-3 Ajv 8 Validation Rules](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md#L63)
- [Story 1.1 Nx Workspace Bootstrap](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/implementation-artifacts/1-1-nx-workspace-bootstrap.md)
- [Story 1.2 CI Pipeline & Git Hooks](file:///g:/OrigoStudio/Repositories/Origo-Design/origo-design/_bmad-output/implementation-artifacts/1-2-ci-pipeline-git-hooks-nfr-git-001.md)

## Dev Agent Guardrails

### Technical Requirements

- Node.js 22 LTS compatibility.
- Zero external runtime dependencies added for benchmarking (used Node.js built-ins: `perf_hooks`, `fs`, `path`).
- Deterministic seed for payload generation to ensure consistent test payloads.
- Clear error output on performance regression with percentage delta and threshold metrics.

### Architecture Compliance

- **AD-3 Compliance:** Validator benchmark tests against `@origo/core` schemas only, with zero framework dependencies.
- **AD-7 Compliance:** Test payload must be valid canonical BADL JSON format.
- **AD-2 Compliance:** Tools directory structure integrated into Nx monorepo root without violating package boundaries.

### Library/Framework Requirements

- `ts-node` (available via devDependencies).
- Standard Node `perf_hooks`.

### File Structure Requirements

```text
origo-design/
  tools/
    benchmarks/
      fixtures/
        heavy-ast-fixture.ts
      perf-runner.ts
      compare-baseline.ts
      run-tests.ts
  .perf-baseline.json
  .github/workflows/ci.yml (updated)
  package.json (updated)
```

### Testing Requirements

- Execute `npm run perf:benchmark` locally and verify benchmark output and `.perf-baseline.json` generation.
- Ensure Prettier and ESLint rules pass on all new benchmark scripts.

## Previous Story Intelligence

### Learnings from Stories 1.1 & 1.2:

- **Environment & Dependency management:** `npm ci --no-audit` is used in GitHub Actions. Avoid introducing native module dependencies that require compilation.
- **Formatting and Linting enforcement:** Husky pre-commit hooks enforce `prettier --write` and `nx lint --fix`. Ensure new benchmark TS files adhere to strict formatting.
- **CI Pipeline integration:** GitHub Actions `.github/workflows/ci.yml` handles PR checks. Ensure the new benchmark step runs after build/test steps and has explicit status reporting.

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (High)

### Debug Log References

- `npm run perf:benchmark` successfully executed baseline comparison and passed SLA checks (`0.462 ms/iter` for 115,505 AST nodes).
- `npm run perf:test` executed self-tests verifying generator determinism, metric collection, and SLA gate failure/success paths.
- Added JIT warmup iterations in `perf-runner.ts` to stabilize execution time across cold/warm Node process invocations.

### Completion Notes List

- ✅ Implemented `heavy-ast-fixture.ts` generating a 115,505-node BADL AST payload across 500 entities.
- ✅ Implemented `perf-runner.ts` measuring validation duration, ops/sec, memory heap, p50/p95 latencies with JIT warmup.
- ✅ Implemented `compare-baseline.ts` enforcing 15% relative regression threshold and 30s NFR-PERF-002 SLA ceiling.
- ✅ Configured `"perf:benchmark"` and `"perf:test"` scripts in `package.json`.
- ✅ Integrated `Run Performance Benchmark Harness (NFR-PERF-002)` step in `.github/workflows/ci.yml`.
- ✅ All self-tests passed and Prettier formatting verified.
- ✅ **Review Follow-up:** Integrated `ajv` into `perf-runner.ts` and successfully distinguished schema compilation time (`ajv.compile()`) from instance validation time.
- ✅ **Review Follow-up:** Fixed `npm test` pipeline failure by converting `"test"` script from `nx test` to `nx run-many -t test` for empty workspaces.
- ✅ **Review Follow-up:** Refactored `run-tests.ts` to use Node.js `assert` module for standardized unit test assertions rather than ad-hoc console logs.

### File List

- `tools/benchmarks/fixtures/heavy-ast-fixture.ts` (new)
- `tools/benchmarks/fixtures/heavy-ast-fixture.spec.ts` (new)
- `tools/benchmarks/perf-runner.ts` (new)
- `tools/benchmarks/perf-runner.spec.ts` (new)
- `tools/benchmarks/compare-baseline.ts` (new)
- `tools/benchmarks/run-tests.ts` (new)
- `.perf-baseline.json` (new)
- `package.json` (modified)
- `tsconfig.base.json` (modified)
- `.github/workflows/ci.yml` (modified)
- `_bmad-output/implementation-artifacts/1-3-performance-benchmark-harness-nfr-perf-002.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

## Change Log

- Initialized performance benchmark suite with 500-entity 10,000+ node BADL AST payload.
- Integrated baseline comparator with 15% regression limit and 30s SLA ceiling.
- Added CI step in GitHub Actions `.github/workflows/ci.yml`.
