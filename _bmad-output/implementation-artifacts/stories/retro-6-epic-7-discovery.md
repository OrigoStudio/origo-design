---
baseline_commit: HEAD
---

# Story: Epic 7 Discovery & Research Phase (retro-6-epic-7-discovery)

Status: review

## Story

As a Core Developer,
I want to conduct a technical spike on running AST compilation/validation in a web worker under strict CSP constraints,
So that Epic 7 (`@origo/playground`) is unblocked with a concrete, evidence-based architecture decision before implementation begins.

## Acceptance Criteria

1. **Given** a browser web worker environment with a restrictive CSP (`default-src 'self'`; no `unsafe-eval`, no `unsafe-inline`, no data URIs)
   **When** `BADLValidator` and `validateAST` from `@origo/core` are imported and executed inside the worker
   **Then** the worker successfully compiles and validates `packages/core/src/schemas/__fixtures__/target-page.json` (the real-world User Management BADL fixture from Story 3.1) without throwing CSP violations
2. **And** any blocking issues — specifically `eval`, `new Function`, dynamic `import()`, synchronous XHR, or global `window`/`document` references inside `@origo/core` — are identified by name, file location, and the specific CSP directive they violate
3. **And** Monaco Editor's own web worker requirements (`editor.worker`, `json.worker`) are assessed for CSP compatibility — because Monaco spawns workers internally and these must also satisfy the same restrictive CSP
4. **And** a spike report ADR is produced at `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` following the format of the Phase 1 Architecture Spine decisions (Binding · Prevents · Rule), documenting the recommended approach (or blocker mitigations) for Epic 7 implementation

## Developer Context

This is a **time-boxed research spike**, not a feature implementation. The output is an ADR document and a proof-of-concept harness — not production code. The spike directly unblocks the Epic 7 stories (`7-1-web-based-editor-component`, `7-2-live-compilation-rendering-pipeline`, `7-3-live-preview-latency-optimization`) and its findings will be the architectural contract for that epic.

### What Epic 7 Is Building (Scope of This Spike)

Epic 7 delivers `@origo/playground` (`packages/playground/`) — a browser-based BADL editor with live rendered output. Architecture binding **P1-AD-7** mandates:

- **Monaco Editor** as the BADL JSON editor (registered with `json.schemas` pointing to `@origo/core`'s `badl.schema.json`)
- The **live preview panel** must run the same `@origo/core` validator and `@origo/angular-renderer` as production — not a mock
- The playground is embedded as an **iframe island** inside the Starlight docs site (P1-AD-8), which means the compilation pipeline runs in a sandboxed iframe with a restrictive CSP (AC from Story 7.2 explicitly requires this)

The core research question is: **can `@origo/core`'s compiler/validator run inside a browser Web Worker (inside that CSP-restricted iframe) without modification?** If not, what specific changes are needed?

### Key @origo/core Exports to Probe

From `packages/core/` (imported as `@origo/core` within the Nx monorepo):

```typescript
import { BADLValidator, validateAST } from '@origo/core';
// BADLValidator: instantiate, call .validateDomain(rawJsonString) → returns EnhancedErrorObject[] | null
// validateAST: call validateAST(parsedDomain) → returns ValidationError[]
```

These are the same two entry points used by `@origo/cli` in Story 6.2. The spike must verify they are safe to call from a worker context (`self` not `window`).

### Spike Test Payload

Use `packages/core/src/schemas/__fixtures__/target-page.json` as the BADL payload for the spike. This is a complete User Management domain fixture (User, Role, Department entities with full capabilities) established in Story 3.1 — it is the canonical integration-test payload for the compiler and represents realistic complexity.

### Known Risk: Monaco's Own Worker Loading

Monaco Editor internally spawns its own workers (`editor.worker.js`, `json.worker.js`). Under strict CSP (`worker-src 'self'`), these workers must be served from the same origin as a `.js` file — inline blob URLs or `data:` worker creation will be blocked. The spike MUST assess whether the Monaco bundler configuration (likely via Vite or webpack) can produce workers that satisfy `worker-src 'self'` without `unsafe-eval`.

### Spike Deliverable — ADR Format

Produce `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` using the same format as `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md` entries:

```markdown
### AD-[N] — Web Worker CSP Strategy for @origo/playground

- **Binds:** @origo/playground live-preview compilation pipeline
- **Prevents:** [describe what failure this prevents]
- **Rule:** [the binding decision — e.g. "Use Comlink + dedicated worker bundle; configure Vite worker plugin with inline: false to satisfy worker-src 'self'"]

#### Findings
- @origo/core CSP compatibility: [pass | fail — list specific violations if any]
- Monaco worker CSP compatibility: [pass | fail — list specific issues]
- Recommended mitigation for any blockers: [concrete steps]
```

## Dev Agent Guardrails

### Technical Requirements

- **Spike scope only:** Do NOT implement Epic 7 production code. The deliverable is the ADR document + a minimal proof-of-concept harness (e.g., a standalone HTML file or a Jest environment that runs the compiler in a `worker_threads` context).
- **Target environment:** Modern browser Web Worker (or `worker_threads` in Node for the harness), with CSP `default-src 'self'; script-src 'self'; worker-src 'self'` — no `unsafe-eval`, no `unsafe-inline`.
- **Test payload:** MUST use `packages/core/src/schemas/__fixtures__/target-page.json` — not a toy schema.
- **No new npm dependencies without justification** in the ADR.

### Architecture Compliance

- **P1-AD-7** (`_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md#P1-AD-7`): Monaco Editor is mandated for the playground editor; its worker compatibility must be assessed.
- **P1-AD-8** (same file, `#P1-AD-8`): Playground is embedded as an iframe island in the Starlight docs site; this iframe will carry a restrictive CSP.
- **AD-3** (`ARCHITECTURE-SPINE.md`): `@origo/core` has zero framework dependencies — it should theoretically be worker-safe, but this must be verified empirically.
- **AD-8**: All authoring surfaces output BADL only — the spike must not introduce any authoring path that bypasses this.
- Web workers MUST NOT directly manipulate DOM or depend on `window`; only `self` is available.

### Anti-Patterns — DO NOT DO

- ❌ Do NOT implement full Epic 7 features (editor UI, Angular renderer wiring, latency optimisation) — spike only.
- ❌ Do NOT create production-grade code in `packages/playground/` as part of this spike.
- ❌ Do NOT add `unsafe-eval` or `unsafe-inline` to any CSP as a "solution" — the spike must prove compatibility without relaxing CSP.
- ❌ Do NOT use a toy BADL schema — use the real `target-page.json` fixture to surface real-world issues.

### Relationship to Other Open Action Items

This spike runs in parallel with `retro-6-security-remediation` (path traversal fixes in `@origo/cli`). If the spike reveals that `@origo/core` itself has security issues (e.g., internal `eval` usage), coordinate findings with the security remediation track before Epic 7 starts.

## Project Context Reference

- **Project**: origo-design
- **Action Item**: `retro-6-epic-7-discovery` (sprint-status.yaml, line 178) — currently `in-progress`
- **Epic this unblocks**: Epic 7 — Browser-Based BADL Playground (`@origo/playground`) — stories 7-1, 7-2, 7-3 all `backlog`
- **Core package**: `packages/core/` → `@origo/core` — exports `BADLValidator`, `validateAST`
- **Spike payload**: `packages/core/src/schemas/__fixtures__/target-page.json`
- **ADR output**: `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`
- **Relevant architecture**: `_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md` (P1-AD-7, P1-AD-8)
- **Owner**: Charlie

## Tasks/Subtasks

- [x] **Task 1: Audit `@origo/core` for Web Worker Compatibility**
  - [x] Search `packages/core/src/` for usage of `eval`, `new Function`, `window`, `document`, `XMLHttpRequest`, dynamic `import()` — document each finding with file + line
  - [x] Verify `BADLValidator` and `validateAST` reference only `self`-compatible globals
  - [x] Run the compiler against `packages/core/src/schemas/__fixtures__/target-page.json` in a `worker_threads` harness (Node) to confirm it executes without runtime errors as a baseline
- [x] **Task 2: Assess Monaco Editor Worker CSP Compatibility**
  - [x] Document Monaco's worker registration pattern (`MonacoEnvironment.getWorkerUrl`) and whether it produces inline blob URLs or `src 'self'` file URLs
  - [x] Determine whether Vite (or the project bundler) can output Monaco workers as standalone `.js` files satisfying `worker-src 'self'`
  - [x] Document the exact bundler configuration change needed (e.g., `@monaco-editor/loader` configuration, Vite `worker.format: 'es'`)
- [x] **Task 3: Produce Proof-of-Concept Harness**
  - [x] Create a minimal standalone harness (e.g., `tools/spikes/epic7-worker-csp/`) that loads `@origo/core` in a browser worker and compiles `target-page.json` — include a CSP meta tag matching the target policy
  - [x] Record whether it passes or produces CSP violations (use browser DevTools console for evidence)
- [x] **Task 4: Write ADR**
  - [x] Document all findings in `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` using the format specified in the Acceptance Criteria
  - [x] Include the concrete recommended approach (or blockers + mitigations) for Stories 7.1–7.3

## Dev Agent Record

### Completion Notes
- Audited `@origo/core` and verified it contains no browser globals that violate CSP (e.g. `eval`, `window`).
- Successfully executed the core compiler in a node worker harness against the real `target-page.json` fixture.
- Created browser harness and bundled worker to confirm standard worker instantiation complies with strict CSP `worker-src 'self'`.
- Documented Monaco Editor Vite integration to prevent blob URL CSP violations.
- Wrote ADR resolving the spike.

### File List
- `tools/spikes/epic7-worker-csp/node-worker-harness.ts`
- `tools/spikes/epic7-worker-csp/index.html`
- `tools/spikes/epic7-worker-csp/worker.js`
- `tools/spikes/epic7-worker-csp/run-browser.js`
- `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`

### Change Log
- Added node and browser web worker test harnesses for Epic 7 CSP research
- Documented spike findings in ADR for Epic 7 Architecture compliance
