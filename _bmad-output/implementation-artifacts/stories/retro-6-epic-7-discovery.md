---
baseline_commit: HEAD
---

# Story: Epic 7 Discovery & Research Phase (retro-6-epic-7-discovery)

Status: ready-for-dev

## Story

As a Core Developer,
I want to conduct a technical spike on running AST compilation/validation in a web worker under strict CSP constraints,
So that we are prepared for Epic 7 (Browser-Based BADL Playground).

## Acceptance Criteria

1. **Given** a web worker environment with strict CSP constraints
   **When** the AST compiler is loaded and executed
   **Then** it successfully compiles and validates BADL JSON payloads
2. **And** any blocking issues (e.g. `eval`, `new Function`, synchronous XHR) are identified and documented
3. **And** a brief spike report or architectural decision record (ADR) is produced detailing the approach for Epic 7.

## Dev Agent Guardrails

### Technical Requirements
- Target execution environment is a modern browser Web Worker.
- Must strictly adhere to CSP constraints (no `unsafe-eval`, no `unsafe-inline`).
- AST validation logic comes from `@origo/core` developed in Epics 3/4.

### Architecture Compliance
- Web workers must not directly manipulate DOM or depend on `window`.
- Follows the Phase 1 Architecture Spine guidelines for Epic 7 preparation.

## Project Context Reference
- **Project**: origo-design
- **Epic**: Epic 7 Preparation (Action Item from Epic 6 Retro)
- **Owner**: Charlie
