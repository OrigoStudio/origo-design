---
status: ready-for-dev
story_id: 1.1
story_key: 1-1-nx-workspace-bootstrap
epic: 1
---

# Story 1.1: Nx Workspace Bootstrap

## 1. Story Foundation

**User Story Statement:**
As a Platform Engineer,
I want to initialize the Origo Nx monorepo with standard tooling,
So that all packages share a consistent build and dependency environment.

**Acceptance Criteria:**
**Given** a clean repository
**When** the developer sets up the workspace
**Then** an Nx workspace is created using Angular 18 (Standalone/Signals)
**And** standard linting (ESLint) and testing (Jest/Playwright) tools are configured.

## 2. Developer Context

**Technical Requirements:**
- **P1-AD-1:** Angular 18 Standalone Components only (`standalone: true`); Signals for reactivity; zoneless-compatible (no zone.js peer dep). RxJS permitted only for Angular Router and HttpClient where no signal equivalent exists.
- **AD-2:** Single Nx monorepo. Each `packages/*` directory is an independent npm package published under the `@origo/` scope. Nx `project.json` boundary tags enforce architecture dependency rules at lint time.
- Greenfield project: first story MUST be Nx monorepo bootstrap + CI pipeline.

**Architecture Compliance:**
- Ensure the Nx workspace uses version 19.x.
- Node.js version is 22 LTS.
- The project follows the layered hexagonal paradigm, although this story only sets up the monorepo root.
- The workspace must be generated using `@nx/angular` assuming standalone applications.

**Library/Framework Requirements:**
- **Nx:** Version 19.x. Create an Angular workspace with `--standalone` flags if applicable.
- **Angular:** Version 18.x (standalone + signals).
- **TypeScript:** 5.5.x strict mode.
- **Linting:** ESLint with standard rules.
- **Testing:** Jest for unit tests, Playwright for e2e.

**File Structure Requirements:**
The workspace should output a basic structure similar to:
```text
origo-design/
  packages/
  apps/
  tools/
  nx.json
  package.json
```

**Testing Requirements:**
Ensure that basic tests scaffolded by Nx (`jest` for lib/apps) and e2e (`playwright`) run successfully and pass out of the box.

## 3. Project Context Reference
- **Project Name:** origo-design
- **Architecture SPINE:** Layered Hexagonal with Versioned Language Contract

## 4. Final Status Update
- Ultimate context engine analysis completed - comprehensive developer guide created.
