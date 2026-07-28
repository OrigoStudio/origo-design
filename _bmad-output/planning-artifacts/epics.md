---
stepsCompleted: ["step-01-validate-prerequisites", "step-02-design-epics", "step-03-create-stories"]
inputDocuments:
  - "design-artifacts/B-Functional-Requirements/functional-requirements.md"
  - "design-artifacts/A-Product-Brief/product-brief.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase1-foundation/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase2-business-ui/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase3-metadata-platform/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/architecture/architecture-origo-design-2026-07-28/phase4-enterprise-ai/ARCHITECTURE-SPINE.md"
  - "_bmad-output/planning-artifacts/implementation-readiness-report-2026-07-28.md"
scope: "Phase 1 only (Months 1-6)"
---

# Origo Design — Phase 1 Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Origo Design Phase 1 (Foundation, Months 1–6), decomposing the Phase 1 requirements from the Functional Requirements (v0.3) and Phase 1 Architecture Spine into implementable stories. The core constraint is **AD-8**: all authoring surfaces output BADL only; all renderers consume BADL only.

---

## Requirements Inventory

### Functional Requirements (Phase 1 Scope)

- FR-C-001: Each Capability MUST declare: id, name, description, type (Command|Query), outcome_ref[], preconditions[], postconditions[], permissions[], risk_level, interaction_contract_ref, async
- FR-C-002: Preconditions and postconditions MUST be evaluatable at runtime, surfaced in DevTools, and usable in automated testing
- FR-C-003: Schema MUST support asynchronous capabilities
- FR-C-004: Command/Query behavioral contracts MUST NOT be conflated
- FR-I-001: Interaction Contracts MUST be declared at BADL level, separate from presentation
- FR-I-002: Each Interaction Contract MUST support: confirmation_required, reason_required, authentication_level, feedback_required, progress_required, interruptible, undo_allowed, expected_completion_ms, accessibility_level
- FR-I-003: Interaction Contracts MUST be shareable across multiple capabilities
- FR-I-004: @origo/core MUST ship standard library: standard-read, standard-write, high-risk-write, destructive-action
- FR-E-001: BADL MUST support declaring Entities, Value Objects, Enumerations, and relationships
- FR-E-002: Each Entity field MUST support: type, label, validation[], metadata_path
- FR-E-003: Entity definitions MUST be consumable independently by Form Engine, Grid Engine, and AI agents
- FR-P-001: Permissions MUST be declarable at: Outcome, Capability, Entity, Entity Field, and Interaction Contract scopes
- FR-P-002: Permission declarations MUST NOT depend on any specific IAM/RBAC provider
- FR-P-003: Permission system MUST support: role-based, state-based, and compound conditions
- FR-L-001: All human-readable strings in BADL MUST be expressed as localization keys
- FR-L-003: RTL layout direction MUST be derivable from locale definition
- FR-N-001: Navigation structure MUST be expressible in BADL as a mapping from Business Outcomes/Domains to navigation nodes
- FR-N-003: Navigation MUST be renderer-agnostic
- FR-M-005: Renderers MUST declare grammar version compatibility and fail gracefully on incompatible version
- FR-M-006: Canonical on-disk format: stable IDs across renames; array ordering semantically insignificant; minimal merge conflicts
- FR-M-008: Canonical format is JSON; YAML supported as conversion format only
- FR-A-001: Each Experience Adapter: input = Interaction Contract, output = medium-specific interaction
- FR-A-002: Adapter protocol MUST be extensible for new mediums without modifying @origo/core
- FR-A-003: Adapter for a given medium MUST be replaceable without BADL content changes
- FR-A-004: Phase 1 ships: Web Adapter (modal, toast, drawer)
- FR-Rend-001: A renderer is a framework-specific package consuming resolved BADL and producing framework-native UI
- FR-Rend-002: Renderers MUST NOT contain business logic, permission logic, or interaction contract resolution logic
- FR-Rend-003: Adding a new renderer MUST require only implementing the renderer contract — no changes to @origo/core
- FR-Rend-004: Phase 1 delivers Angular renderer
- FR-Rend-005: Every renderer component MUST support by default: accessibility (WCAG 2.1 AA), localization, RTL, field validation, permission visibility, loading/error/empty states, responsive layout, dark/high-contrast mode, keyboard navigation, telemetry hooks
- FR-Rend-006: Components MUST be composable, not inheritance-based
- FR-DX-001: DevTools MUST expose for any selected element: metadata source, rendering path, property resolution, theme resolution
- FR-DX-002: DevTools MUST support "Why is this disabled?" query (Phase 2 — permission chain; Phase 1: rendering path and property resolution)
- FR-DX-003: CLI MUST support: origo new, origo generate entity, origo validate
- FR-DX-004: @origo/playground MUST provide a browser-based BADL editor with live preview
- FR-DX-005: Playground MUST be hosted at documentation site URL — no install required
- FR-DX-006: A developer MUST produce a working rendered page within 10 minutes of first install
- FR-OBS-003: Telemetry identifiers MUST use BADL semantic paths, not DOM selectors
- FR-EXT-001: Every generated page/section/component MUST be overridable at three levels without forking (interfaces defined Phase 1; implementations Phase 2)
- FR-EXT-002: Component registry MUST allow teams to register custom components by type name
- FR-EXT-006: Theme overrides MUST be achievable through design token overrides alone
- FR-THEME-001: Design token system MUST cover: color, typography, spacing, border radius, elevation/shadow, animation/motion, breakpoints, opacity, density
- FR-THEME-002: All colors MUST use semantic tokens, never primitive values
- FR-THEME-003: Theme switching MUST require zero application code changes
- FR-THEME-004: White-labeling MUST require only a token override file, completable in under one hour by a trained developer
- FR-THEME-005: Same token definitions MUST be consumable by all renderers
- FR-AI-005: All authoring surfaces MUST produce BADL only (AD-8 — applies to CLI and playground in Phase 1)
- FR-TEST-002: Test selectors MUST be stable across renderer upgrades
- FR-ADOPT-001: Teams MUST be able to adopt Origo one page at a time; existing pages MUST coexist without conflict
- FR-ADOPT-002: Incremental adoption path MUST be documented as a first-class migration guide

### Non-Functional Requirements (Phase 1 Scope)

- NFR-PERF-002: BADL grammar validation at build time MUST complete in under 30 seconds for a 500-entity application
- NFR-PERF-003: Hot-reload of a single changed metadata file MUST trigger re-render within 500ms (architecture defined P1; implementation P2)
- NFR-PERF-005: Design tokens MUST be resolved at build time, not at runtime
- NFR-ACC-001: Every renderer component MUST achieve WCAG 2.1 AA minimum
- NFR-I18N-001: RTL layout direction MUST be derivable from locale definition
- NFR-DX-001: Developer unfamiliar with BADL MUST produce a working rendered page within 10 minutes of first install
- NFR-SEC-001: Extensions MUST explicitly declare required permissions; hosts MAY deny or sandbox (API surface defined P1; activation P3)
- NFR-VER-001: Grammar major version MUST ship with migration tool; renderers fail fast on incompatible version
- NFR-GIT-001: IDs MUST be stable across renames; array ordering semantically insignificant; minimal merge conflicts
- NFR-ADOPT-001: Teams MUST be able to adopt one page at a time; coexist with existing non-Origo pages

### Additional Requirements (from Phase 1 Architecture Spine)

- P1-AD-1: Angular 18 Standalone Components only (standalone: true); Signals for reactivity; zoneless-compatible (no zone.js peer dep)
- P1-AD-2: Style Dictionary v4 as the ONLY token build pipeline; 4 output formats (CSS, JS, RN, JSON); no renderer references src/
- P1-AD-3: Ajv 8 + JSON Schema Draft 2020-12; TypeScript types GENERATED from schema (never hand-authored); divergence = CI failure
- P1-AD-4: @origo/core MUST have exactly 6 internal modules: schemas/, types/, validator/, versioning/, contracts/, extension-api/; only index.ts is public
- P1-AD-5: No renderer component MUST extend another component (composition only)
- P1-AD-6: Every component MUST have axe-core Playwright test; AA violation = CI failure
- P1-AD-7: Monaco Editor for playground; BADL JSON Schema registered with Monaco json.schemas for full intellisense
- P1-AD-8: Starlight (Astro) for docs site; static output only; playground embedded as iframe
- P1-AD-9: Chrome Extension Manifest V3; __ORIGO_DEVTOOLS__ object; tree-shaken in production
- Nx 19.x monorepo with tag-based boundary enforcement at lint time (AD-2)
- @typescript-eslint/no-restricted-imports enforcing no cross-package internal path imports (P1-AD-4)
- Component selector prefix: origo- (e.g. origo-button, origo-input)
- Component Input grouping: [appearance], [behavior], [validation], [events], [security], [accessibility], [animation], [responsive], [theme], [data]
- JSON Schema $id format: https://origo.design/schemas/v{major}/{concern}.schema.json
- metadata_path format: EntityName.FieldName (dot notation, stable across renames)
- Greenfield project: first story MUST be Nx monorepo bootstrap + CI pipeline
- 25 primitive Angular standalone components to ship in Phase 1

### UX Design Requirements

N/A — Origo Design is a developer platform. Developer-facing surfaces (CLI, playground, DevTools, docs) are fully specified in FR-DX-001 through FR-DX-006 and serve as the UX specification. Component visual design emerges from design token decisions + WCAG AA enforcement.

### FR Coverage Map

FR-C-001: Epic 4 - Capability Schema definition
FR-C-002: Epic 4 - Pre/postconditions evaluation support
FR-C-003: Epic 4 - Async capability support
FR-C-004: Epic 4 - Command/Query behavioral separation
FR-I-001: Epic 4 - Interaction Contract schema definition
FR-I-002: Epic 4 - Interaction Contract fields
FR-I-003: Epic 4 - Interaction Contract reusability
FR-I-004: Epic 4 - Standard library of Interaction Contracts
FR-E-001: Epic 3 - Entity and Value Object schema definition
FR-E-002: Epic 3 - Entity field properties
FR-E-003: Epic 3 - Entity consumption rules
FR-P-001: Epic 4 - Permission scoping rules
FR-P-002: Epic 4 - Provider-agnostic permissions
FR-P-003: Epic 4 - Permission conditions (role/state)
FR-L-001: Epic 9 - Localization key resolution in renderer
FR-L-003: Epic 9 - RTL direction rendering
FR-N-001: Epic 9 - Navigation structure rendering
FR-N-003: Epic 9 - Renderer-agnostic navigation rules
FR-M-005: Epic 4 - Grammar version compatibility checks
FR-M-006: Epic 3 - Canonical on-disk format rules
FR-M-008: Epic 3 - JSON as canonical format
FR-A-001: Epic 5 - Experience Adapter inputs/outputs
FR-A-002: Epic 5 - Adapter protocol extensibility
FR-A-003: Epic 5 - Replaceable adapters
FR-A-004: Epic 9 - Web Adapter delivery
FR-Rend-001: Epic 5 - Renderer framework contract
FR-Rend-002: Epic 5 - Renderer logic constraints
FR-Rend-003: Epic 5 - New renderer implementation rules
FR-Rend-004: Epic 9 - Angular renderer package
FR-Rend-005: Epic 9 - Renderer component defaults (WCAG, l10n, etc)
FR-Rend-006: Epic 9 - Component composition rules
FR-DX-001: Epic 8 - DevTools element inspection
FR-DX-002: Epic 8 - DevTools disabled trace
FR-DX-003: Epic 6 - CLI commands (new, generate, validate)
FR-DX-004: Epic 7 - Playground live preview
FR-DX-005: Epic 10 - Playground hosted on docs site
FR-DX-006: Epic 10 - 10-minute onboarding benchmark
FR-OBS-003: Epic 8 - Telemetry identifiers via BADL paths
FR-EXT-001: Epic 4 - Three-level override interfaces
FR-EXT-002: Epic 4 - Component registry
FR-EXT-006: Epic 4 - Theme overrides via tokens
FR-THEME-001: Epic 2 - Design token categories
FR-THEME-002: Epic 2 - Semantic token usage
FR-THEME-003: Epic 2 - Zero-code theme switching
FR-THEME-004: Epic 2 - White-labeling via token file
FR-THEME-005: Epic 2 - Token consumption by renderers
FR-AI-005: Epic 6 - CLI and playground output format
FR-TEST-002: Epic 4 - Test selector stability
FR-ADOPT-001: Epic 10 - Page-by-page adoption support
FR-ADOPT-002: Epic 10 - Incremental adoption migration guide

NFR-PERF-002: Epic 1 - Validation performance benchmarks in CI
NFR-PERF-003: Epic 7 - Playground hot-reload performance
NFR-PERF-005: Epic 2 - Token resolution timing
NFR-ACC-001: Epic 9 - WCAG 2.1 AA renderer compliance
NFR-I18N-001: Epic 9 - RTL derivation rules
NFR-DX-001: Epic 10 - 10-minute onboarding execution
NFR-SEC-001: Epic 4 - Extension permission declaration
NFR-VER-001: Epic 4 - Grammar version migration tool rules
NFR-GIT-001: Epic 1 - Stable IDs and array ordering enforcement
NFR-ADOPT-001: Epic 10 - Coexistence with existing pages

---

## Epic List

### Epic 1: Workspace Initialization, CI, & Docs Foundation
[Developer can scaffold a new Origo project, enforce package boundaries, run CI checks, and author documentation in Starlight from day one]
**FRs covered:** NFR-PERF-002, NFR-GIT-001

#### Story 1.1: Nx Workspace Bootstrap

As a Platform Engineer,
I want to initialize the Origo Nx monorepo with standard tooling,
So that all packages share a consistent build and dependency environment.

**Acceptance Criteria:**

**Given** a clean repository
**When** the developer sets up the workspace
**Then** an Nx workspace is created using Angular 18 (Standalone/Signals)
**And** standard linting (ESLint) and testing (Jest/Playwright) tools are configured.

#### Story 1.2: CI Pipeline & Git Hooks (NFR-GIT-001)

As a Platform Engineer,
I want a CI pipeline and git hooks configured,
So that code boundaries, formatting, and stable ID rules are enforced automatically.

**Acceptance Criteria:**

**Given** a developer is committing code or opening a PR
**When** the Git hooks or GitHub Actions pipeline runs
**Then** linting, unit tests, and build targets execute
**And** standard formatting (Prettier) is enforced to ensure Git diff stability (NFR-GIT-001)
**And** branch protection rules are explicitly required on the main branch to prevent bypassing CI checks.

#### Story 1.3: Performance Benchmark Harness (NFR-PERF-002)

As a Platform Engineer,
I want a performance testing harness integrated into CI,
So that we can measure BADL validation speeds and prevent regressions.

**Acceptance Criteria:**

**Given** a new PR is opened
**When** the CI pipeline runs
**Then** a performance benchmark suite executes against a standardized heavy payload (e.g., 10,000-node AST)
**And** the pipeline fails if there is a statistically significant relative performance regression compared to the `main` branch baseline (NFR-PERF-002).

#### Story 1.4: Documentation Site (Starlight)

As a Platform Engineer,
I want a Starlight documentation site in the monorepo,
So that we can author developer documentation alongside the code from day one.

**Acceptance Criteria:**

**Given** the Origo monorepo
**When** I run `nx serve docs` (or the equivalent target)
**Then** a Starlight documentation site is served locally.

### Epic 2: Design Token Pipeline (@origo/design-tokens)
[Developer can manage design tokens, output them for web/mobile, and apply theme overrides without code changes]
**FRs covered:** FR-THEME-001, FR-THEME-002, FR-THEME-003, FR-THEME-004, FR-THEME-005, NFR-PERF-005

#### Story 2.1: Design Token Schema Foundation

As a UX Engineer,
I want to define a standardized JSON schema for design tokens (base and semantic),
So that we have a single source of truth for colors, typography, and spacing.

**Acceptance Criteria:**

**Given** a new Origo project
**When** I define base colors and semantic roles (e.g., `color.primary`, `color.surface`) in the design token configuration
**Then** the schema validates correctly, enforcing a clear separation between base properties and semantic application (FR-THEME-001, 002).

#### Story 2.2: Token Compilation Pipeline

As a UX Engineer,
I want a pipeline that compiles JSON tokens into CSS variables,
So that the web renderer can consume them natively without heavy JS parsing.

**Acceptance Criteria:**

**Given** a valid token JSON file
**When** I run the token build script
**Then** a CSS file is generated containing standard CSS Custom Properties using an industry-standard engine (e.g., Style Dictionary)
**And** the output is correctly namespaced to prevent style bleed.

#### Story 2.3: Zero-Code Theme Overrides

As a Platform Consumer,
I want to provide a runtime `theme.json` override file,
So that I can white-label the application dynamically without changing code.

**Acceptance Criteria:**

**Given** a deployed Origo application
**When** a `theme.json` configuration is provided that overrides specific semantic tokens
**Then** the application's appearance updates at runtime (FR-THEME-003, 004)
**And** all inputs are sanitized to prevent CSS injection vulnerabilities
**And** any missing or invalid tokens safely fall back to the base theme without breaking the UI.

#### Story 2.4: Token Resolution & Consumption Contract

As a Platform Engineer,
I want the token injection mechanism to resolve efficiently,
So that theme switching and initial rendering do not cause UI jank.

**Acceptance Criteria:**

**Given** the Origo web adapter
**When** the generated CSS variables are applied to the DOM root
**Then** tokens are available for consumption by the renderer (FR-THEME-005)
**And** resolution timing passes the performance benchmark limits defined in NFR-PERF-005.

### Epic 3: BADL Domain & Validation Engine (@origo/core)
[Developer can define Domains and Entities in BADL and validate them to canonical JSON AST. MUST be driven by a real-world target page JSON fixture and requires 100% test coverage for the AST parser.]
**FRs covered:** FR-E-001, FR-E-002, FR-E-003, FR-M-006, FR-M-008

#### Story 3.1: Target Page JSON Fixture

As a Core Developer,
I want to define a static JSON representation of a complex real-world Origo page,
So that I have a tangible target for the BADL schema to compile against.

**Acceptance Criteria:**

**Given** the Origo repository
**When** I examine the test fixtures
**Then** there is a complete JSON AST representing a full CRUD screen with multiple nested entities and relationships
**And** this fixture serves as the ultimate integration test for the compiler.

#### Story 3.2: Domain & Entity Schema Parser

As a Core Developer,
I want to implement the parser for BADL Domains and Entities,
So that developers can define business objects and their properties.

**Acceptance Criteria:**

**Given** a valid BADL string containing `Domain` and `Entity` definitions
**When** the compiler parses it
**Then** the schema correctly extracts field properties (FR-E-001, FR-E-002)
**And** it enforces depth-limiting and catches infinite circular entity dependencies to prevent stack overflows
**And** the parser has 100% test coverage.

#### Story 3.3: Canonical AST Serialization

As a Core Developer,
I want the compiler to serialize the parsed memory model into a canonical JSON AST,
So that downstream tools can consume a standardized format.

**Acceptance Criteria:**

**Given** a parsed BADL memory model
**When** I run the serialization step
**Then** the output is a strict JSON AST (FR-M-008)
**And** it embeds an explicit `schemaVersion` in the root payload
**And** it conforms exactly to the canonical on-disk format rules (FR-M-006).

#### Story 3.4: AST Validation Engine

As a Core Developer,
I want a validation engine that runs against the generated AST,
So that illegal entity relationships and invalid consumption rules are caught at compile-time.

**Acceptance Criteria:**

**Given** an invalid BADL entity definition (e.g., circular DAG relationships)
**When** the validation engine processes the AST
**Then** it throws a descriptive compilation error preventing cyclic dependencies (FR-E-003)
**And** the validation engine has 100% test coverage.

### Epic 4: Core Behaviors & Extensibility (@origo/core)
[Developer can define Capabilities, Contracts, and Permissions in BADL, and declare extension compatibility and interfaces. MUST be driven by a real-world target page JSON fixture and requires 100% test coverage for the validation engine.]
**FRs covered:** FR-C-001, FR-C-002, FR-C-003, FR-C-004, FR-I-001, FR-I-002, FR-I-003, FR-I-004, FR-P-001, FR-P-002, FR-P-003, FR-M-005, FR-EXT-001, FR-EXT-002, FR-EXT-006, FR-TEST-002, NFR-SEC-001, NFR-VER-001

#### Story 4.1: Capabilities Schema Parsing

As a Core Developer,
I want the BADL parser to understand Capabilities,
So that developers can define what actions (e.g., `Create`, `Update`, `Publish`) are allowed on Entities.

**Acceptance Criteria:**

**Given** a BADL schema with `Capability` definitions
**When** the compiler parses it
**Then** it successfully maps the capabilities to their target entities
**And** it enforces a strict vocabulary of core capability verbs (CRUD+L) to prevent naming fragmentation
**And** includes these relationships in the canonical JSON AST.

#### Story 4.2: Contracts and Implementations

As a Core Developer,
I want the BADL parser to support Contracts,
So that developers can define abstract interfaces that multiple Entities or Plugins must fulfill.

**Acceptance Criteria:**

**Given** a BADL schema defining a `Contract` and an `Entity` implementing it
**When** the validation engine runs
**Then** it verifies that the Entity provides all required fields and capabilities defined by the Contract
**And** performs cross-boundary capability verification to ensure the Entity can fulfill behavioral requirements
**And** throws a compilation error if the contract is breached.

#### Story 4.3: Security and Permissions Engine

As a Core Developer,
I want the BADL parser to process Permission rules,
So that access control is codified statically at the schema level.

**Acceptance Criteria:**

**Given** a BADL schema with Role-based permissions mapped to Capabilities
**When** the validation engine runs
**Then** it validates the security relationships
**And** throws a fatal compilation error for any unsecured capabilities enforcing a fail-closed policy (NFR-SEC-001).

#### Story 4.4: Extensibility and Plugin Schema

As a Core Developer,
I want the BADL parser to support Extension and Plugin definitions,
So that the system knows which external plugins are allowed to implement which contracts.

**Acceptance Criteria:**

**Given** an `Extension` definition mapping a plugin to a Contract
**When** the parser runs
**Then** it adds the extension metadata to the AST
**And** the engine validates any semantic versioning requirements purely against a local manifest or lockfile with zero network calls (NFR-VER-001).

#### Story 4.5: Behavior Validation Suite

As a Core Developer,
I want 100% test coverage on the expanded validation engine,
So that invalid capability/contract setups are guaranteed to be caught at compile-time.

**Acceptance Criteria:**

**Given** the expanded validation engine
**When** the unit and integration test suite runs
**Then** coverage is 100% for the behavior validation logic (FR-TEST-002)
**And** the tests include validation against the complex real-world target page JSON fixture from Epic 3.

### Epic 5: Angular Rendering Pipeline (@origo/angular-renderer)
[Developer can render the BADL AST through a framework-native composition pipeline using Experience Adapters (starts with a representative slice of 3 primitives—layout, input, action—to unblock downstream and MUST consume tokens from Epic 2)]
**FRs covered:** FR-Rend-001, FR-Rend-002, FR-Rend-003, FR-A-001, FR-A-002, FR-A-003

#### Story 5.1: AST Traversal and Dynamic Instantiation

As a UI Developer,
I want a rendering engine that recursively traverses a BADL JSON AST,
So that Angular components can be dynamically instantiated based on the metadata without hardcoding templates.

**Acceptance Criteria:**

**Given** a compiled JSON AST
**When** it is passed to the core `<origo-renderer>` component
**Then** the engine recursively reads the tree of nodes and prepares them for the adapter pipeline
**And** it employs chunked rendering or yield-to-main-thread techniques to prevent locking the browser during massive AST traversals.

#### Story 5.2: Experience Adapter Interface

As a UI Developer,
I want a standard Experience Adapter contract for Angular,
So that UI primitives map cleanly and predictably to BADL node definitions.

**Acceptance Criteria:**

**Given** a BADL node definition (e.g., `TextField`)
**When** the rendering engine resolves it
**Then** it maps to an Angular component implementing the standard `OrigoAdapter` interface
**And** props, validation states, and metadata are correctly passed down (FR-A-001)
**And** strict runtime type coercion and validation are applied at the adapter boundary before props are passed to the primitive.

#### Story 5.3: Core Primitive Implementation

As a UI Developer,
I want a vertical slice of core primitives (Layout, Input, Action),
So that I can test the full end-to-end rendering flow against real UI elements.

**Acceptance Criteria:**

**Given** the complex target page fixture from Epic 3
**When** the renderer processes it
**Then** it successfully renders at least one Layout container (e.g., `VBox`), one Input (e.g., `TextInput`), and one Action (e.g., `Button`) (FR-Rend-002).

#### Story 5.4: Design Token Consumption

As a UI Developer,
I want the rendering primitives to natively consume Design Tokens,
So that the UI automatically respects the active theme generated in Epic 2.

**Acceptance Criteria:**

**Given** the CSS custom properties generated by the Design Token pipeline
**When** the Angular primitives render
**Then** they correctly apply the semantic tokens (e.g., `var(--origo-color-surface)`) for styling, ensuring zero-code theming works out of the box (FR-Rend-003)
**And** the primitives enforce strict CSS encapsulation (e.g., Shadow DOM) to prevent global style bleed from the host application.

#### Story 5.5: Reactive State & Event Binding

As a UI Developer,
I want the renderer to wire up Angular Signals to BADL state,
So that user interactions correctly update the model and trigger actions.

**Acceptance Criteria:**

**Given** an Input and a Button primitive rendered from AST
**When** the user types in the input and clicks the button
**Then** the local state is reactively updated via Angular Signals
**And** the input is explicitly sanitized before state updates to prevent XSS attacks
**And** the corresponding BADL capability or action is dispatched to the core engine (FR-A-002, 003).

### Epic 6: Developer CLI (@origo/cli)
[Developer can generate entities, scaffold projects, and validate BADL schemas locally from the terminal]
**FRs covered:** FR-DX-003, FR-AI-005

#### Story 6.1: CLI Initialization and Scaffolding

As a Developer,
I want an `origo init` command,
So that I can quickly scaffold a new BADL project with the correct file structure.

**Acceptance Criteria:**

**Given** the installed Origo CLI
**When** I run `origo init my-project`
**Then** it generates a base project directory with a standard `origo.json` config and a `/schemas` folder ready for BADL files
**And** the generated boilerplate is secure-by-default, containing zero hardcoded secrets or permissive CORS defaults.

#### Story 6.2: Local Schema Validation

As a Developer,
I want an `origo validate` command,
So that I can verify my BADL schemas locally without needing to run the full application.

**Acceptance Criteria:**

**Given** a directory containing BADL schema files
**When** I run `origo validate`
**Then** the CLI passes the files through the core compiler (built in Epics 3/4)
**And** it reports any syntax or semantic errors in the console with helpful file and line number references (FR-DX-003)
**And** the underlying compiler explicitly preserves source map and line number offsets to make this reporting possible.

#### Story 6.3: Entity Generator Boilerplate

As a Developer,
I want an `origo generate entity` command,
So that I don't have to write boilerplate BADL schema by hand.

**Acceptance Criteria:**

**Given** an initialized Origo project
**When** I run `origo generate entity User`
**Then** it creates a `user.badl` file with standard entity scaffolding, a primary key, and common metadata stubs
**And** it safely aborts without overwriting if the file already exists (unless `--force` is provided)
**And** the generator architecture is explicitly designed to accept external plugins or LLM prompts for future AI integration (FR-AI-005).

### Epic 7: Browser-Based BADL Playground (@origo/playground)
[Developer can write BADL in a browser editor with intellisense and instantly see live rendered output]
**FRs covered:** FR-DX-004, NFR-PERF-003

#### Story 7.1: Web-Based Editor Component

As a Developer,
I want a browser-based code editor within the Origo application,
So that I can author BADL schemas without needing a local IDE setup.

**Acceptance Criteria:**

**Given** the Playground application
**When** I navigate to the editor view
**Then** a code editor (e.g., Monaco) is initialized
**And** it connects to a Language Server (LSP) or Web Worker to provide real schema validation, Intellisense, and autocomplete rather than just basic syntax highlighting.

#### Story 7.2: Live Compilation & Rendering Pipeline

As a Developer,
I want the playground editor to instantly render the BADL I type,
So that I can see immediate visual feedback for my schema changes.

**Acceptance Criteria:**

**Given** the Playground editor
**When** I type valid BADL syntax
**Then** the browser runs the core compiler (from Epics 3/4) to generate an AST
**And** passes that AST to the Angular rendering pipeline (from Epic 5) to update the live preview pane
**And** the rendered preview pane executes inside a strictly sandboxed iframe with a restrictive CSP to prevent self-XSS attacks
**And** if the BADL is invalid, compiler errors are displayed gracefully instead of crashing the app (FR-DX-004).

#### Story 7.3: Live Preview Latency Optimization

As a Developer,
I want the live preview to update smoothly without lagging,
So that my typing experience is not degraded by heavy compilations.

**Acceptance Criteria:**

**Given** the Playground editor with a complex real-world schema loaded
**When** I type continuously
**Then** the preview updates within the required latency threshold (NFR-PERF-003)
**And** the debouncing mechanism explicitly absorbs burst inputs (e.g. deleting the whole file) and mass error streams safely without thrashing the DOM or crashing the browser tab.

### Epic 8: Diagnostics & DevTools (@origo/devtools)
[Developer can inspect metadata sources, rendering paths, and property resolutions directly in their browser DevTools]
**FRs covered:** FR-DX-001, FR-DX-002, FR-OBS-003

#### Story 8.1: Diagnostics API & Runtime Hooks

As a Core Developer,
I want the rendering engine to expose a global diagnostics API,
So that external tools can query the metadata, resolution paths, and error contexts of the active AST.

**Acceptance Criteria:**

**Given** a running Origo application in development mode
**When** an external tool calls the `window.__ORIGO_DEVTOOLS__` (or equivalent) hook
**Then** the engine exposes the current AST state, active entities, and detailed error boundary telemetry (FR-OBS-003, FR-DX-001)
**And** the API automatically redacts or obfuscates known sensitive fields (e.g. passwords, PII) before exposing state
**And** the API is completely stripped and hard-disabled in production builds to prevent state dumping.

#### Story 8.2: DevTools Inspector UI

As a Developer,
I want a DevTools panel (or in-app overlay),
So that I can visually inspect the metadata powering any rendered component on the screen.

**Acceptance Criteria:**

**Given** the Origo application is running
**When** I open the Origo DevTools inspector
**Then** I can view the active component tree
**And** I can trace any rendered element back to its exact BADL source entity, including its specific runtime execution context (e.g. iteration indices)
**And** the Inspector UI is strictly read-only for Phase 1 to prevent scope creep (FR-DX-002).

### Epic 9: Primitive Component Library (@origo/angular-renderer)
[Developer has access to all 25 primitive components with full localization, RTL, accessibility, and theme support (delivered iteratively in batches for early visual QA)]
**FRs covered:** FR-Rend-004, FR-Rend-005, FR-Rend-006, FR-L-001, FR-L-003, FR-N-001, FR-N-003, FR-A-004, NFR-ACC-001, NFR-I18N-001

#### Story 9.1: Form & Layout Primitives (Batch 1)

As a UI Developer,
I want the foundational form and layout primitives (e.g., TextInput, Select, VBox, HBox),
So that I can build standard data entry screens from BADL.

**Acceptance Criteria:**

**Given** the Origo Angular renderer
**When** the AST contains Form or Layout nodes
**Then** they map to the correct `OrigoAdapter` components using a Component Registry pattern rather than hardcoded switches (FR-Rend-004, FR-L-001, FR-L-003)
**And** Input primitives aggressively enforce client-side validation and sanitization based on BADL constraints before state updates
**And** they natively consume the Epic 2 design tokens.

#### Story 9.2: Data Presentation Primitives (Batch 2)

As a UI Developer,
I want a set of data presentation primitives (e.g., DataGrid, List, Card),
So that I can display collections of entities dynamically.

**Acceptance Criteria:**

**Given** the Origo Angular renderer
**When** the AST contains DataGrid or List nodes
**Then** they map to the correct components (FR-Rend-005)
**And** they handle pagination, sorting, and row-level actions driven by BADL state
**And** list components strictly mandate DOM virtualization or hard pagination limits to prevent DOM thrashing on large datasets.

#### Story 9.3: Navigation & Shell Primitives (Batch 3)

As a UI Developer,
I want a set of navigation primitives (e.g., Sidebar, Tabs, Breadcrumbs),
So that I can build application shells and routing menus.

**Acceptance Criteria:**

**Given** the Origo Angular renderer
**When** the AST contains Navigation nodes
**Then** they map to the correct components (FR-Rend-006, FR-N-001, FR-N-003)
**And** they accurately track and update the active route state.

#### Story 9.4: Accessibility & Localization Enforcement

As a UX Engineer,
I want all primitives to strictly enforce accessibility and localization standards,
So that applications are inclusive and support global audiences out of the box.

**Acceptance Criteria:**

**Given** the Origo primitive library
**When** the application is audited
**Then** all components comply with WCAG 2.1 AA standards (NFR-ACC-001)
**And** the primitives explicitly support propagating ARIA context (e.g., `aria-label`, `aria-describedby`) from the AST down to the native DOM elements
**And** they render correctly in Right-To-Left (RTL) orientation when the locale demands it (NFR-I18N-001).

### Epic 10: Onboarding Benchmark & Migration Path
[Developer unfamiliar with BADL can migrate an existing page and produce a working Origo page within 10 minutes]
**FRs covered:** FR-DX-005, FR-DX-006, FR-ADOPT-001, FR-ADOPT-002, NFR-DX-001

#### Story 10.1: 10-Minute Quickstart Guide

As a New Developer,
I want a step-by-step Quickstart tutorial,
So that I can successfully create a "Hello World" BADL page from scratch in under 10 minutes.

**Acceptance Criteria:**

**Given** the Starlight documentation site (from Epic 1)
**When** I follow the "Quickstart" guide
**Then** I am successfully guided through CLI initialization, writing a basic schema, and viewing it in the Playground (FR-DX-005)
**And** the guide includes an explicit environment verification step (e.g., `origo doctor`) as Step 0 to eliminate local setup friction before writing code.

#### Story 10.2: Legacy Migration Strategy Guide

As an Adopting Team Lead,
I want clear documentation on migrating legacy Angular pages to Origo,
So that I can plan our team's transition effectively.

**Acceptance Criteria:**

**Given** the Origo documentation
**When** I read the "Migration Guide"
**Then** it provides a clear mapping from standard handwritten Angular HTML/TS to declarative BADL schema concepts (FR-ADOPT-001, FR-ADOPT-002)
**And** it explicitly documents escape hatches (e.g., custom adapters or extensions) for migrating legacy components that are not natively supported by Origo.

#### Story 10.3: Developer Snippets & Boilerplates

As a New Developer,
I want editor snippets and ready-made templates for common patterns,
So that I don't have to start from a blank screen.

**Acceptance Criteria:**

**Given** my IDE or the Origo CLI
**When** I want to create a standard "List-Detail" or "Login" view
**Then** I can trigger a snippet or template that generates the best-practice BADL boilerplate (FR-DX-006)
**And** all generated snippets and templates undergo a strict security audit to guarantee secure-by-default patterns (especially for Auth/Login flows).

#### Story 10.4: Benchmark Validation Execution

As a Platform Owner,
I want to validate the onboarding experience with real developers,
So that I can definitively prove we hit our core DX metric.

**Acceptance Criteria:**

**Given** the completed platform (Epics 1-9) and the Quickstart guide
**When** a developer unfamiliar with BADL is asked to build a page
**Then** they successfully produce a working, rendered Origo page in under 10 minutes (NFR-DX-001)
**And** the benchmark explicitly requires building a functional form with validation or a basic data view, rather than a trivial blank page, to prevent metric gaming.
