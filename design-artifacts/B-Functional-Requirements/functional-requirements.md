---
title: "Origo Design — Functional Requirements"
status: draft
version: "0.1"
created: 2026-07-26
source: "Product Brief (design-artifacts/A-Product-Brief/product-brief.md) + Brainstorm Session (2026-07-25)"
author: Patel
---

# Origo Design — Functional Requirements

> **Audience:** Technical co-founders, engineering leads, architects.
> **Status:** Draft — `[OPEN]` tags mark decisions that require explicit resolution before architecture begins.

---

## 1. Product Definition & Scope

### 1.1 What This Is Not

- **Not** a UI component library (though renderer packages ship component libraries)
- **Not** a CRUD generator
- **Not** a runtime-specific framework
- **Not** a low-code visual builder (in Phase 1–3)
- **Not** a platform whose core concept is "TextBox" or "Dropdown"

### 1.2 What This Is

Origo Design is a **Business Application Description Language (BADL) with a renderer ecosystem.**

Its core abstraction is a framework-agnostic, technology-neutral metadata contract that describes how organizations achieve business outcomes — not how pixels are arranged on a screen.

| Layer | Package | Responsibility |
|---|---|---|
| BADL Grammar | `@origo/core` | Schema, validator, versioning, type system for business application metadata |
| Renderers | `@origo/[framework]-renderer` | Framework-specific packages that consume BADL and produce UI |
| Studio | `@origo/studio`, `@origo/cli` | Tooling: CLI, visual designer, AI page generator, DevTools |

### 1.3 Target Consumers

- Enterprise application developers building ERP, CRM, HRMS, Banking, Insurance, Healthcare, and Admin portals
- Platform teams building internal application frameworks on top of Origo
- AI agents generating application descriptions (BADL as AI output format)

> **[OPEN — OQ-01]** Is there a self-service no-code persona in scope for v1, or developer-first exclusively?

---

## 2. Architecture Philosophy

### 2.1 The BADL Hierarchy

Every concern in Origo is anchored to exactly one of six layers. Each layer has a single responsibility and is ignorant of everything below it.

```
Business Outcomes       — What the organization is trying to achieve
        |
Capabilities            — Atomic operations that advance an outcome
        |
Business Rules          — Invariants and constraints governing capabilities
        |
Interaction Contracts   — What an interaction REQUIRES (not HOW it appears)
        |
Experience Adapters     — How each medium satisfies the interaction contract
        |
Renderers               — Framework-specific UI production
```

Angular, React Native, Web, Voice, and AI agents all live at the bottom. They are **renderers and adapters, not architecture.**

### 2.2 The Three Concerns That Must Never Be Conflated

| Concern | Describes | Examples |
|---|---|---|
| **Business Intent** | What the business wants to accomplish | "Approve Invoice", "Hire Employee" |
| **Interaction Intent** | What the interaction requires to succeed | "Confirmation Required, Authentication Level = Strong" |
| **Presentation** | How the medium renders the interaction | Modal, Bottom Sheet, Voice prompt, [y/N] |

A capability is stable across decades. The medium that expresses it changes continuously.

```
"Approve Invoice"  ->  2005: Desktop modal
                   ->  2015: Mobile bottom sheet
                   ->  2020: Voice "Are you sure?"
                   ->  2025: AI structured challenge
                   ->  2030: Spatial eye-tracking confirmation
```

The same Interaction Contract satisfies all of them.

### 2.3 Grammar vs. Content

- **BADL Grammar** (`@origo/core`): versioned like a language standard. Major version = breaking schema change. Community-governed.
- **BADL Content**: a specific organization's domain model. Versioned like an API. Private to each team.

---

## 3. @origo/core — Business Outcomes

**FR-O-001:** The BADL schema MUST support declaring Business Outcomes as first-class entities, distinct from capabilities.

**FR-O-002:** Each Business Outcome MUST declare:
- `id` — unique, stable identifier (stable across renames)
- `name` — human-readable label (localization key)
- `description` — what the organization achieves when fulfilled
- `domain` — business domain (e.g., `Procurement`, `Finance`, `HR`)
- `capabilities[]` — capabilities that realize this outcome
- `completion_signal` — verifiable state predicate proving the outcome was achieved
- `risk_level` — Low / Medium / High / Critical

**FR-O-003:** Business Outcomes MUST support two realization modes:
- **Simple** — maps 1:1 to a single capability
- **Composite** — realized through a Workflow (ordered, branching sequence of capabilities)

**FR-O-004:** Completion signals MUST be evaluatable at runtime without human intervention, enabling: automated outcome verification, AI agent confirmation, and business-level monitoring in business language (not server logs).

**FR-O-005:** The schema MUST support grouping outcomes by domain, enabling semantic indexing at 5,000+ page scale.

---

## 4. @origo/core — Capability Contracts

**FR-C-001:** Each Capability MUST declare:
- `id`, `name`, `description`
- `outcome_ref[]` — which outcomes this capability advances
- `preconditions[]` — state predicates MUST be true before execution
- `postconditions[]` — state predicates guaranteed after successful execution
- `permissions[]` — roles or policies that authorize execution
- `risk_level` — Low / Medium / High / Critical
- `interaction_contract_ref` — governing Interaction Contract
- `async` — Boolean; whether this capability resolves later (approval workflows, batch jobs)

**FR-C-002:** Preconditions and postconditions MUST be:
- Evaluated at runtime to gate execution
- Surfaced in DevTools as human-readable explanations
- Usable in automated testing as assertions

**FR-C-003:** The schema MUST support asynchronous capabilities (e.g., approval workflows resolving hours later).

> **[OPEN — OQ-02]** Does the Capability layer need explicit CQRS support — Commands and Queries as distinct typed constructs?

---

## 5. @origo/core — Business Rules & Invariants

> Business rules are the most durable thing in any system. They outlast frameworks, UI paradigms, and databases. BADL must treat them as first-class citizens, not as validators attached to fields.

**FR-R-001:** Business rules MUST be declared as domain invariants, **separate from field-level validation:**

```
# Domain Invariant — governs capability execution
InvoiceApproval.Approver != InvoiceApproval.Creator

# Field Validator — governs data input (component layer, NOT here)
Invoice.Amount: required, min=0.01
```

**FR-R-002:** Each Business Rule MUST have:
- `id` — referenceable by ID in DevTools explanations (e.g., `BR-120`)
- `description` — human-readable statement
- `scope[]` — which capabilities or outcomes this rule governs
- `enforcement` — Hard (blocks execution) / Soft (warns, logs) / Audit (records violation)

**FR-R-003:** Business rules MUST be evaluatable independently of the renderer. The renderer has **no authority to override a Hard rule.**

**FR-R-004:** The schema MUST support rule composition: compound rules with AND / OR / NOT.

> **[OPEN — OQ-03]** Should rules support references to an external rule engine (e.g., Drools), or must they be expressible inline in BADL?

---

## 6. @origo/core — Interaction Contracts

> An Interaction Contract describes **what an interaction REQUIRES**, not how it appears. It is renderer-agnostic and medium-agnostic.

**FR-I-001:** Interaction Contracts MUST be declared at the BADL level, separate from any presentation concern.

**FR-I-002:** Each Interaction Contract MUST support:

| Property | Type | Description |
|---|---|---|
| `confirmation_required` | Boolean | Adapter MUST obtain explicit user confirmation before capability executes |
| `reason_required` | Boolean | User must supply free-text justification |
| `authentication_level` | Enum | None / Standard / Strong / Biometric |
| `feedback_required` | Boolean | Adapter MUST surface success/failure to the user |
| `progress_required` | Boolean | Adapter MUST surface progress for async capabilities |
| `interruptible` | Boolean | Whether the user may cancel mid-execution |
| `undo_allowed` | Boolean | Whether the outcome can be reversed after execution |
| `expected_completion_ms` | Number | Advisory; adapter uses this to choose spinner vs. background notification |
| `accessibility_level` | Enum | WCAG AA (default) / AAA |

**FR-I-003:** Interaction Contracts MUST be shareable — a single contract can be referenced by multiple capabilities.

**FR-I-004:** `@origo/core` MUST ship a standard library of common Interaction Contracts:
- `standard-read` — no confirmation, standard auth, feedback optional
- `standard-write` — no confirmation, standard auth, feedback required
- `high-risk-write` — confirmation required, strong auth, feedback required, not interruptible
- `destructive-action` — confirmation required, reason required, strong auth, undo not allowed

---

## 7. @origo/core — Domain Model (Entities, Value Objects)

**FR-E-001:** BADL MUST support declaring the domain model: Entities, Value Objects, Enumerations, and their relationships.

**FR-E-002:** Each Entity field MUST support:
- `type` — primitive or reference to another Entity / Value Object
- `label` — localization key or default text
- `validation[]` — field-level validators (required, min, max, pattern, custom)
- `metadata_path` — stable semantic identifier for test selectors (e.g., `Customer.Name`, `Invoice.Total`)

**FR-E-003:** Entity definitions MUST be consumable independently by the Form Engine, Grid Engine, and AI agents — without modification per consumer.

> **[OPEN — OQ-06]** Should BADL entity definitions be importable from OpenAPI/Swagger, Prisma, or database ERD schemas?

---

## 8. @origo/core — Workflows

**FR-W-001:** Workflows express Composite Business Outcomes — ordered, branching sequences of capabilities.

**FR-W-002:** Each Workflow MUST support:
- Sequential steps
- Conditional branching (if/else on state predicates)
- Parallel execution gates (multiple capabilities must all complete before proceeding)
- Human approval steps (pauses pending role-based approval)
- Timeout and escalation handling

**FR-W-003:** Workflow state MUST be inspectable at runtime by DevTools, AI agents, and governance systems.

> **[OPEN — OQ-07]** Are long-running workflows (days/weeks, persistent state) in scope for Phase 1–3, or deferred to Phase 4?

---

## 9. @origo/core — Permissions

**FR-P-001:** Permissions MUST be declarable at multiple scopes: Outcome, Capability, Entity, Entity Field, and Interaction Contract.

**FR-P-002:** Permission declarations MUST NOT depend on any specific IAM / RBAC provider. They declare **what role or policy is required**; the adapter resolves it against the application's identity system.

**FR-P-003:** The permission system MUST support:
- Role-based conditions: `Role == Accountant`
- State-based conditions: `Invoice.Status == Posted`
- Compound conditions: `Role == Accountant AND Invoice.Status == Posted`

**FR-P-004:** Permission resolution MUST be fully traceable — DevTools MUST reconstruct the full resolution chain showing every condition that contributed to the decision.

---

## 10. @origo/core — Governance & Audit

> Governance answers not just "what happened?" but "who had the authority to make it happen, and who is accountable if it was wrong?" This is a first-class concern for regulated industries.

**FR-G-001:** BADL MUST support declaring a governance chain for capabilities and outcomes with elevated `risk_level`.

**FR-G-002:** A governance chain MUST capture:
- Required approvers (roles and/or named actors)
- Approval sequence (sequential vs. parallel)
- Minimum approvals required
- Approval timeout and escalation path
- Audit evidence requirements (what the system must record to prove the outcome was achieved)

> **[OPEN — OQ-04]** Governance chain: inline spec within BADL, or reference to an external governance policy service?

**FR-G-003:** Every capability execution MUST produce a structured audit record: actor, timestamp, precondition state at execution, outcome state after execution, and governance chain satisfied.

**FR-G-004:** Audit records MUST be structured for both machine consumption (indexable by compliance tools) and human review.

---

## 11. @origo/core — Localization & Navigation

**FR-L-001:** All human-readable strings in BADL MUST be expressed as localization keys, not inline literals.

**FR-L-002:** Localization resources MUST be separate files per locale, loadable at runtime without recompiling.

**FR-L-003:** RTL layout direction MUST be derivable from the locale definition — not hardcoded in any component.

**FR-N-001:** Navigation structure MUST be expressible in BADL as a mapping from Business Outcomes / Domains to navigation nodes.

**FR-N-002:** Navigation nodes MUST respect the permission system — hidden or disabled if the user lacks permission for all capabilities it exposes.

**FR-N-003:** Navigation MUST be renderer-agnostic; the specific navigation component is an adapter decision.

---

## 12. Metadata Management

### 12.1 Modularity

**FR-M-001:** A Business Domain's metadata MUST be expressible as multiple files split by concern:

```
Customer/
  Customer.outcome.json
  Customer.capabilities.json
  Customer.rules.json
  Customer.entity.json
  Customer.interactions.json
  Customer.permissions.json
  Customer.localization.en.json
  Customer.localization.ar.json
  Customer.navigation.json
```

**FR-M-002:** BADL tooling MUST support merging split files into a resolved in-memory model at build time and hot-reload time.

### 12.2 Versioning

**FR-M-003:** BADL content MUST support semantic versioning. Grammar version and content version are tracked independently.

**FR-M-004:** A grammar major version change MUST include a migration tool that transforms content from the prior major version.

**FR-M-005:** Renderers MUST declare grammar version compatibility. A renderer MUST fail gracefully — not silently corrupt — if loaded with an incompatible grammar version.

### 12.3 Git-Friendliness

**FR-M-006:** The canonical on-disk representation MUST be structured to minimize merge conflicts:
- Each entity, capability, rule, and interaction contract MUST be independently addressable
- Array ordering MUST NOT be semantically significant
- IDs MUST be stable across renames (a rename is a label change, not an ID change)

> **[OPEN — OQ-05]** Should BADL support YAML as an alternative to JSON?

### 12.4 Hot Reload

**FR-M-007:** A metadata file save MUST trigger re-render of affected pages within 500ms without recompiling the application.

---

## 13. Experience Adapters

**FR-A-001:** Each Experience Adapter implements one protocol:
- **Input:** Interaction Contract (what is required)
- **Output:** Medium-specific interaction (how it is fulfilled)

**FR-A-002:** The adapter protocol MUST be extensible — third parties MUST implement custom adapters for new mediums without modifying `@origo/core`.

**FR-A-003:** The adapter for a given medium MUST be replaceable without any BADL content changes.

**FR-A-004:** Phase 1 ships: Web Adapter (modal, toast, drawer) and Mobile Adapter (bottom sheet, swipe, haptic).

**FR-A-005:** Phase 3 ships: AI Agent Adapter (structured JSON challenge/response for LLM tool-calling).

**FR-A-006:** Phase 4 ships: CLI Adapter (terminal prompts).

---

## 14. Renderers

### 14.1 Renderer Contract

**FR-Rend-001:** A renderer is a framework-specific package that consumes resolved BADL (post-adapter) and produces framework-native UI.

**FR-Rend-002:** Renderers MUST NOT contain business logic, permission logic, or interaction contract resolution logic.

**FR-Rend-003:** Adding a new renderer MUST require only implementing the renderer contract against `@origo/core` types — no changes to `@origo/core`.

**FR-Rend-004:** Delivery plan:

| Phase | Package |
|---|---|
| Phase 1 | `@origo/angular-renderer` |
| Phase 2 | `@origo/react-native-renderer` |
| Phase 3 | `@origo/vue-renderer`, `@origo/react-web-renderer` |
| Phase 4 | `@origo/blazor-renderer`, `@origo/flutter-renderer` |

### 14.2 Component Standards

**FR-Rend-005:** Every component in every renderer MUST support the following by default, without additional configuration:
- Accessibility (WCAG 2.1 AA minimum)
- Localization (labels, validation messages, date/number formats)
- RTL layout direction
- Field-level validation (hooked into BADL validation declarations)
- Permission-based visibility and interactability
- Loading / Error / Empty states
- Responsive layout (mobile / tablet / desktop breakpoints)
- Dark mode and High Contrast mode
- Keyboard navigation
- Telemetry hooks (render time, interaction events, accessibility violations)

**FR-Rend-006:** Components MUST be composable, not inheritance-based — extension uses wrapping, slotting, or composition; never subclassing or forking.

### 14.3 Form Engine

**FR-Rend-007:** The Form Engine MUST render a complete form from an Entity definition + field validators + Interaction Contract, without additional template code.

**FR-Rend-008:** Forms MUST support: dynamic visibility, dynamic validation, and multi-step wizard flows.

**FR-Rend-009:** Form submission MUST invoke a Capability — which enforces preconditions, business rules, and governance before persisting.

### 14.4 Data Grid Engine

**FR-Rend-010:** The Grid Engine MUST render a full data grid from an Entity definition + capability definitions, supporting:

Sorting · Filtering · Grouping · Column chooser · Frozen columns · Inline edit · Batch edit · Tree grid · Aggregation · Export · Print · Responsive mode · Virtual scrolling · Infinite scrolling · Row actions · Bulk actions · Keyboard navigation · Accessibility · Column templates · Cell templates

**FR-Rend-011:** Row and bulk actions MUST map to Capabilities. Permission checks MUST hide/disable actions based on the current user's permissions.

### 14.5 Page Generator

**FR-Rend-012:** The Page Generator MUST produce the following pages automatically from an Entity + Outcome definition:

| Page | Description |
|---|---|
| List Page | Grid + search + filters + actions |
| Create Page | Form + capability invocation |
| Update Page | Form pre-filled with entity state |
| Detail Page | Read-only view + audit trail |
| Import Page | Bulk entity creation from file |
| Export | CSV, Excel, PDF |
| Bulk Edit | Multi-record update |

**FR-Rend-013:** Every generated page MUST be overridable at three levels without forking the template or losing upgrade compatibility:
1. **Component-level** — replace a specific component for a specific field/action
2. **Section-level** — replace a section (e.g., form section of a Detail Page)
3. **Page-level** — provide a fully custom page that still receives resolved BADL as input

---

## 15. Developer Experience

### 15.1 DevTools

**FR-DX-001:** Origo MUST ship DevTools exposing, for any selected element on a generated page:
- Metadata source file and line
- Rendering path (renderer -> adapter -> component chain)
- Property resolution (which metadata property set this value, and from where it was inherited)
- Theme resolution (which design token resolved to this visual value)
- Validation chain (which validators are active, passing/failing, and why)
- Permission chain (which permission declarations determined this element's state)
- Business rule chain (which rules are in scope for the active capability)

**FR-DX-002:** DevTools MUST support the **"Why is this disabled?"** query — selecting any disabled field or action MUST display a human-readable explanation chain:

```
Disabled because:
  Role = Accountant
  Invoice.Status = Posted
  Permission = Invoice.Edit
  Business Rule = BR-120
```

### 15.2 CLI

**FR-DX-003:** `@origo/cli` MUST support:

| Command | Description |
|---|---|
| `origo new` | Scaffold a new Origo project with chosen renderer |
| `origo generate entity <name>` | Generate entity metadata file(s) |
| `origo generate outcome <name>` | Generate outcome + capability stubs |
| `origo generate page <entity>` | Generate Page Generator page suite |
| `origo validate` | Validate all BADL content against grammar |
| `origo diff <grammar-version>` | Show what BADL changes would break current content |
| `origo migrate <grammar-version>` | Run grammar migration |

### 15.3 Playground & Onboarding

**FR-DX-004:** `@origo/playground` MUST provide a browser-based BADL editor with live preview — metadata changes update the rendered output in real time.

**FR-DX-005:** The playground MUST be hosted at the documentation site URL — no install required.

**FR-DX-006:** A developer unfamiliar with BADL MUST produce a working rendered page within **10 minutes of first install.** This is a stated onboarding benchmark.

---

## 16. Observability

**FR-OBS-001:** Every generated page MUST emit the following telemetry events by default:

| Event | Payload |
|---|---|
| `page.render` | Time from metadata resolution to first meaningful paint |
| `page.ready` | Time to interactive |
| `capability.invoke` | Capability ID, actor, precondition state at invocation |
| `capability.complete` | Capability ID, outcome state, duration |
| `validation.fail` | Rule ID, field metadata path |
| `permission.deny` | Permission ID, actor, capability attempted |
| `accessibility.violation` | WCAG rule, element metadata path |

**FR-OBS-002:** Telemetry hooks MUST be pluggable — routable to any analytics, monitoring, or logging system without modifying BADL content.

**FR-OBS-003:** Telemetry identifiers MUST use BADL semantic paths (e.g., `Customer.ApproveCredit`) — not DOM selectors — so telemetry remains stable across renderer upgrades.

---

## 17. Performance & Scalability

**FR-PERF-001:** Applications with 5,000+ pages MUST have initial load time determined only by pages loaded, not total page count. Metadata MUST be lazy-loaded by domain or outcome.

**FR-PERF-002:** BADL grammar validation at build time MUST complete in under 30 seconds for a 500-entity, 5,000-page application.

**FR-PERF-003:** Hot-reload of a single changed metadata file MUST trigger re-render within 500ms.

**FR-PERF-004:** The renderer MUST support virtual rendering for large grids (10,000+ rows) without leaking virtualization concerns into BADL metadata.

**FR-PERF-005:** Design tokens MUST be resolved at build time, not at runtime.

---

## 18. Extensibility

**FR-EXT-001:** Every generated page, section, and component MUST be overridable at three levels (see FR-Rend-013) without forking and without losing upgrade compatibility.

**FR-EXT-002:** A **component registry** MUST allow teams to register custom components under a type name. BADL references the type; the registry resolves to the implementation.

**FR-EXT-003:** Custom validators MUST be registerable by name and invokable from BADL validation declarations without modifying `@origo/core`.

**FR-EXT-004:** Custom Experience Adapters MUST be registerable for new medium types.

**FR-EXT-005:** Data providers (REST, GraphQL, local, offline) MUST be pluggable. BADL MUST NOT hardcode any API protocol.

**FR-EXT-006:** Theme overrides MUST be achievable through design token overrides alone — no forking of component stylesheets.

---

## 19. Theme & Design Token System

**FR-THEME-001:** The design token system MUST cover: color (semantic), typography, spacing, border radius, elevation/shadow, animation/motion, breakpoints, opacity, density.

**FR-THEME-002:** All colors MUST be referenced by semantic token (`--color-surface-primary`) — never by primitive value (`#ffffff`).

**FR-THEME-003:** Theme switching (light / dark / high contrast / custom) MUST require zero application code changes — only token override files.

**FR-THEME-004:** White-labeling (replacing all branding tokens for a client) MUST require only a token override file and MUST complete in under one hour for a trained developer.

**FR-THEME-005:** The same design token definitions MUST be consumable by all renderers — one token file produces Angular styles, React Native StyleSheet values, and future renderer styles without duplication.

---

## 20. AI Integration (Phase 3+)

**FR-AI-001:** BADL MUST be the native output format for AI agents generating application descriptions. An AI MUST generate BADL content — not framework-specific component code.

**FR-AI-002:** The `@origo/core` validator MUST be usable by AI agents — generated BADL MUST be validatable before being loaded into a renderer, preventing silent corruption.

**FR-AI-003:** AI agents MUST be able to execute capabilities through the AI Agent Adapter using a structured protocol — they MUST NOT need to simulate UI interaction.

**FR-AI-004:** `@origo/core` MUST ship a formal JSON Schema definition consumable by AI tools (IDE plugins, LLMs, code completion engines) for schema-aware BADL authoring.

> **[OPEN — OQ-09]** Phase 4 visual builder: drag-and-drop editor writing BADL, or metadata-first (CLI + direct file authoring) as primary authoring mode?

---

## 21. Testing

**FR-TEST-001:** Every generated page MUST be testable using BADL semantic paths as selectors (e.g., `Customer.Name`, `Invoice.ApproveCapability`) — without CSS selectors or XPath.

**FR-TEST-002:** Test selectors MUST be stable across renderer upgrades — a test written for renderer v1 MUST work on v2 if the BADL metadata is unchanged.

**FR-TEST-003:** Capability completion signals MUST be usable as test assertions — a test asserts that a Business Outcome was achieved by verifying its completion signal, not by inspecting DOM state.

**FR-TEST-004:** The Page Generator MUST optionally generate a test scaffold alongside each generated page, covering:
- Happy path capability invocation
- Permission denial scenarios
- Business rule violation scenarios
- Validation failure scenarios

---

## 22. Adoption & Migration

**FR-ADOPT-001:** Teams MUST be able to adopt Origo one page at a time. Existing pages in an Angular or React Native application MUST coexist with Origo-rendered pages without conflict.

**FR-ADOPT-002:** The incremental adoption path MUST be documented as a first-class migration guide.

> **[OPEN — OQ-08]** Should Origo ship a code-to-BADL migration tool that analyzes existing component code and generates approximate BADL metadata?

---

## 23. Phased Delivery

### Phase 1 — Foundation (Months 1–6)

- `@origo/core`: BADL grammar — Entity, Field, Validation, Permissions, basic Capabilities, Interaction Contract standard library
- Design token system + Theme Engine
- `@origo/angular-renderer`: 20–25 primitive components, Web Experience Adapter
- `@origo/cli`: `new`, `generate entity`, `validate`
- Documentation site + hosted Playground
- DevTools v1: metadata source + property resolution

### Phase 2 — Business UI (Months 7–12)

- `@origo/core`: Workflows, Business Rules & Invariants, Governance chain
- `@origo/angular-renderer`: Form Engine, Grid Engine, Layout Engine, Navigation Engine, Page Generator (List, Create, Update, Detail)
- `@origo/react-native-renderer`: core + Mobile Experience Adapter
- Hot reload
- DevTools v2: permission chain + "Why is this disabled?" explainer

### Phase 3 — Metadata Platform (Months 13–18)

- `@origo/core`: Business Outcomes (root), Completion Signals, full Governance chain
- Metadata modularity (split-file), versioning, migration tooling, Git-diff optimization
- AI Agent Adapter
- BADL JSON Schema for AI tooling
- Observability hooks
- Semantic test selectors + test scaffold generation

### Phase 4 — Enterprise & AI (Months 19–24)

- Visual page builder (writes BADL)
- AI page generation from entity definitions
- Offline support
- Plugin / component marketplace
- CLI Adapter
- `@origo/vue-renderer`, `@origo/react-web-renderer`

---

## 24. Open Questions

> These require explicit resolution before architecture begins. Each blocks one or more downstream decisions.

| ID | Question | Blocks |
|---|---|---|
| **OQ-01** | Is there a self-service no-code persona in v1 scope, or developer-first only? | Scope, Studio roadmap |
| **OQ-02** | Does Capability layer need explicit CQRS (Command vs. Query types)? | @origo/core schema design |
| **OQ-03** | Should business rules support external rule engine references, or inline-only? | Rules architecture |
| **OQ-04** | Governance chain: inline spec in BADL, or reference to external governance policy? | Governance architecture |
| **OQ-05** | Should BADL support YAML as alternative to JSON? | Tooling, parsing, CLI |
| **OQ-06** | Should BADL entity definitions be importable from OpenAPI, Prisma, or DB schemas? | Adoption, CLI |
| **OQ-07** | Long-running workflows (days/weeks) in scope for Phase 1–3? | Workflow design |
| **OQ-08** | Should Origo ship a code-to-BADL migration tool for brownfield projects? | Adoption |
| **OQ-09** | Phase 4 visual builder: drag-and-drop writing BADL, or metadata-first primary? | Studio roadmap |
