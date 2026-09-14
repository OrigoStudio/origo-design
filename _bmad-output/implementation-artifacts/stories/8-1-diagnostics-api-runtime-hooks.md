---
baseline_commit: 01c890e695b63ea41e953142056d71a7d1814596
---

# Story 8-1: Diagnostics API & Runtime Hooks

## Story Foundation

**User Story:**
As a Core Developer,
I want the rendering engine to expose a global diagnostics API,
So that external tools can query the metadata, resolution paths, and error contexts of the active AST.

**Acceptance Criteria:**
- **Given** a running Origo application in development mode
- **When** an external tool calls the `window.__ORIGO_DEVTOOLS__` hook
- **Then** the engine exposes the current AST state, active entities, and detailed error boundary telemetry
- **And** telemetry identifiers MUST use BADL semantic paths, not DOM selectors (FR-OBS-003)
- **And** the API automatically redacts or obfuscates known sensitive fields (e.g. passwords, PII) before exposing state
- **And** the API is completely stripped and hard-disabled in production builds (isDevMode() guard)
- **And** comprehensive end-user documentation for all API hooks and interfaces is created in the docs site (`apps/docs/src/content/docs/reference/diagnostics-api.mdx`), detailing usage recipes, hook signatures, security redactions, and dev vs. prod behavior.

**Business Context:**
Provides the DevTools v1 foundation. Exposes stable runtime diagnostics to external tools without requiring a dev server, serving as the official diagnostics interface for tooling authors and developers.

---

## Developer Context

### Technical Requirements
- **DevTools Bridge Implementation:** Implement in `@origo/angular-renderer/src/devtools/devtools-bridge.ts`.
- **Global API Interface:** Define an explicit `OrigoDevToolsAPI` interface for the `__ORIGO_DEVTOOLS__` payload. This contract must be exportable for consumption by the `packages/devtools` Chrome Extension in Phase 2 and third-party tooling developers.
- **Window Augmentation:** Augment the global `Window` interface with `__ORIGO_DEVTOOLS__: OrigoDevToolsAPI` to prevent TypeScript compilation errors.
- **Production Tree-Shaking:** Guard the bridge initialization strictly with Angular's `isDevMode()`. The bridge MUST NOT instantiate or be included in production bundles.
- **Data Redaction:** Filter sensitive keys (e.g., passwords, PII) before exposing state.
- **Performance:** Ensure state getters and AST queries exposed by the API are lightweight/memoized to prevent performance degradation when dev mode is active.
- **End-User Documentation:** Author comprehensive reference documentation in `apps/docs/src/content/docs/reference/diagnostics-api.mdx` targeted at end users and external tool developers. The documentation MUST cover:
  - Overview of `window.__ORIGO_DEVTOOLS__` and its lifecycle (dev mode only vs. production stripping)
  - Complete API reference for every hook/method (signatures, parameters, and return types)
  - Data structure contracts (`OrigoDevToolsAPI`, `MetadataSource`, `ResolutionChain`, `RenderingPath`, `ErrorContext`)
  - Semantic BADL path query conventions (FR-OBS-003)
  - Automatic redaction rules for sensitive fields (PII, credentials)
  - Practical code examples demonstrating how end users can inspect state from browser DevTools console and automated test suites.

### Expected Data Structures
Implement endpoints returning these shapes:
- `MetadataSource`: `{ file: string, line: number }`
- `ResolutionChain`: Trace of property or theme resolution steps
- `RenderingPath`: Active component hierarchy
- `ErrorContext`: Detailed error boundary telemetry

### Architecture Compliance
- **P1-AD-9 — DevTools v1 as Chrome Extension (Manifest V3):** The bridge provides the API for the Chrome Extension content script.
- **FR-OBS-003 — Telemetry Identifiers:** Active entity and error telemetry MUST use BADL semantic paths, not DOM selectors.

### File Structure Requirements
- `packages/origo-angular-renderer/src/devtools/devtools-bridge.ts` (Bridge implementation and API contract)
- `packages/origo-angular-renderer/src/devtools/index.ts` (Exports for internal/external consumers)
- `apps/docs/src/content/docs/reference/diagnostics-api.mdx` (User-facing reference documentation)

### Testing Requirements
- **Unit Tests:** Verify `__ORIGO_DEVTOOLS__` API returns the expected data shapes.
- **Redaction Tests:** Verify sensitive fields are successfully stripped from the output.
- **Production Guard Tests:** Mock Angular's `isDevMode()` to return `false` and verify the bridge fails to instantiate and exposes no global properties.
- **Documentation Verification:** Verify that the documentation builds cleanly (`nx build docs`) with valid syntax, code samples, and frontmatter.

---

## Project Context Reference
Follow `@origo/core` guidelines and AST validation standards defined in previous epics.

---

## Tasks/Subtasks

- [x] Task 1: Create `OrigoDevToolsAPI` interface and Data Structures
  - [x] Define `MetadataSource`, `ResolutionChain`, `RenderingPath`, and `ErrorContext` types.
  - [x] Define `OrigoDevToolsAPI` interface.
  - [x] Augment the global `Window` interface with `__ORIGO_DEVTOOLS__: OrigoDevToolsAPI`.
- [x] Task 2: Implement the DevTools Bridge
  - [x] Create `@origo/angular-renderer/src/devtools/devtools-bridge.ts`.
  - [x] Implement state getters and AST queries (lightweight/memoized).
  - [x] Ensure telemetry identifiers use BADL semantic paths.
- [x] Task 3: Implement Data Redaction
  - [x] Add logic to filter sensitive keys (e.g., passwords, PII) before exposing state.
- [x] Task 4: Production Tree-Shaking Guard
  - [x] Guard bridge initialization strictly with Angular's `isDevMode()`.
- [x] Task 5: Export DevTools Bridge
  - [x] Create `@origo/angular-renderer/src/devtools/index.ts`.
  - [x] Export necessary contracts for internal/external consumers.
- [x] Task 6: Unit and Integration Tests
  - [x] Verify `__ORIGO_DEVTOOLS__` API returns expected shapes.
  - [x] Verify sensitive fields are stripped.
  - [x] Verify bridge fails to instantiate when `isDevMode()` is false.
- [x] Task 7: End-User Documentation
  - [x] Create `apps/docs/src/content/docs/reference/diagnostics-api.mdx`.
  - [x] Document lifecycle, API reference, data structures, BADL semantics, redaction rules, and practical examples.
  - [x] Verify documentation builds cleanly.

---

## Dev Agent Record

### Implementation Plan
- Implemented `OrigoDevToolsAPI` interface and required data structures (`MetadataSource`, `ResolutionChain`, `RenderingPath`, `ErrorContext`).
- Built the DevTools bridge in `packages/angular-renderer/src/devtools/devtools-bridge.ts` using `isDevMode()` to guard logic.
- Configured a recursive data redaction mechanism filtering known sensitive keys (`password`, `ssn`, `apiKey`, `token`, `secret`) and partial matches.
- Created `index.ts` to export DevTools contracts.
- Created Jest tests (`devtools-bridge.spec.ts`) validating redaction, API shapes, and dev-mode guarding.
- Created the developer reference guide `apps/docs/src/content/docs/reference/diagnostics-api.mdx`.

### Completion Notes
✅ Fully implemented Diagnostics API in Angular renderer.
✅ Tests pass for Redaction, Semantic path retrieval, and devMode guard.
✅ Documentation is ready for end users.

---

## File List
- `packages/angular-renderer/src/devtools/devtools-bridge.ts` (NEW)
- `packages/angular-renderer/src/devtools/index.ts` (NEW)
- `packages/angular-renderer/src/devtools/devtools-bridge.spec.ts` (NEW)
- `apps/docs/src/content/docs/reference/diagnostics-api.mdx` (NEW)

---

## Change Log
- Implemented DevTools bridge API for querying AST state, resolving paths, and fetching error telemetry.
- Created dev mode guards and sensitive field redaction logic.
- Authored reference documentation.
- (Date: 2026-09-14)

---

## Story Completion Status
**Status:** review
**Note:** Ultimate context engine analysis completed - comprehensive developer guide created.
