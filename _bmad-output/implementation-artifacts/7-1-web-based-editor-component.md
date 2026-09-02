# Story 7.1: Web-Based Editor Component

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Developer,
I want a browser-based code editor within the Origo application,
So that I can author BADL schemas without needing a local IDE setup.

## Acceptance Criteria

1. [AC-1] Given the Playground application, When I navigate to the editor view, Then a code editor (Monaco) is initialized.
2. [AC-2] And it connects to a Web Worker to provide real schema validation, Intellisense, and autocomplete rather than just basic syntax highlighting.

## Tasks / Subtasks

- [ ] Task 1: Scaffold `@origo/playground` package (AC: 1, 2)
  - [ ] Scaffold playground library in `packages/playground` using Nx standalone conventions
  - [ ] Configure `vite.config.ts` or `angular.json` for web workers (No CDN Loaders)
- [ ] Task 2: Implement Editor Component (AC: 1)
  - [ ] Implement Editor Angular Component (`<origo-playground-editor>`) using Monaco Editor natively
  - [ ] Ensure explicit bundled workers instantiation in the component using Vite/Angular native module worker syntax (`new Worker(new URL('...', import.meta.url))`)
- [ ] Task 3: Integrate Language Server / Web Worker (AC: 2)
  - [ ] Import `badl.schema.json` statically at build time from `@origo/core/src/schemas/` or generated dist
  - [ ] Register `badl.schema.json` directly via `monaco.languages.json.jsonDefaults.setDiagnosticsOptions`
  - [ ] Setup `comlink` for typed RPC communication between the main UI thread and the Web Worker (if applicable).
- [ ] Task 4: Accessibility and Testing
  - [ ] axe-core Playwright test ensuring WCAG 2.1 AA compliance
  - [ ] Ensure the editor is rendered properly within an iframe sandboxed environment

## Dev Notes

**CRITICAL IMPLEMENTATION GUARDRAILS (PREVENT DISASTERS):**
- **Architecture Standard (P1-AD-7):** MUST use Monaco Editor for the BADL JSON editor.
- **CSP Restrictions (AD-9):** Monaco workers MUST be explicitly bundled and instantiated using `new Worker(new URL('...', import.meta.url))` to satisfy `worker-src 'self'`. **DO NOT** use `@monaco-editor/loader`'s default CDN approach as it requires external scripts and blobs which violate CSP in the docs iframe.
- **Schema Validation:** `badl.schema.json` MUST be statically imported and registered via Monaco's `jsonDefaults.setDiagnosticsOptions`. No dynamic remote schema fetching under strict `connect-src 'self'`.
- **Framework Constraint (P1-AD-1):** `@origo/playground` components MUST be Angular 18 Standalone Components (`standalone: true`) using Signals. No `zone.js` peer dependency.
- **Performance Constraints:** Ensure zero DOM-locking during worker instantiation.
- **Web Intelligence (Latest Tech):** When integrating Monaco with Angular 18 + Vite, use manual `MonacoEnvironment` configuration defining `getWorker` function in the entry point to point to Vite-resolved worker paths (`?worker`). Avoid wrapper libraries that hide worker setup if they use `blob:` URLs.

### Project Structure Notes
- Packages reside in `packages/playground/`
- Component structure: `src/editor/` containing Monaco Editor + BADL schema registration
- Strictly follow `origo-` selector prefix and input groupings conventions.

### References
- [Source: _bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md#P1-AD-7]
- [Source: _bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 7.1]

## Dev Agent Record

### Agent Model Used

Gemini 3.1 Pro (High)

### Debug Log References

### Completion Notes List

### File List
