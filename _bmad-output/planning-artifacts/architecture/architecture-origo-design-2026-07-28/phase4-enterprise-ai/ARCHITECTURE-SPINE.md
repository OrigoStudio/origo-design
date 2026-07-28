---
name: 'Origo Design — Phase 4: Enterprise & AI (Months 19–24)'
type: architecture-spine
purpose: build-substrate
altitude: feature
paradigm: 'Layered Hexagonal with Versioned Language Contract (inherited)'
scope: 'No-code authoring, Visual page builder, Long-running workflow runtime, AI page generation, Offline support, Plugin marketplace, CLI Adapter, @origo/blazor-renderer stub, @origo/flutter-renderer stub'
status: final
created: '2026-07-28'
updated: '2026-07-28'
parent: '../ARCHITECTURE-SPINE.md'
sources:
  - design-artifacts/B-Functional-Requirements/functional-requirements.md (sections 8, 18, 20, 23 Phase 4)
---

# Architecture Spine — Phase 4: Enterprise & AI

## Inherited Invariants

| Inherited | From parent | Binds here |
|---|---|---|
| AD-1 through AD-15 | initiative spine | All — binding. AD-14 constraint (no-code deferred) LIFTS in Phase 4. |
| P1-AD-1 Angular 18 Standalone + Signals | Phase 1 spine | Visual builder UI is Angular-based |
| P1-AD-3 Ajv 8 + JSON Schema Draft 2020-12 | Phase 1 spine | All Phase 4 grammar additions (if any) use same validator |
| P2-AD-6 Page Generator three-level override | Phase 2 spine | Visual builder interacts with existing override registries |
| P3-AD-1 Extension contract: sync manifest + async lifecycle | Phase 3 spine | Plugin marketplace extensions go through the same contract |
| P3-AD-2 AI Agent Adapter: OpenAI function-calling compatible | Phase 3 spine | AI page generator uses AIProvider extension type registered via this contract |
| P3-AD-3 Observability: OpenTelemetry-compatible | Phase 3 spine | Long-running workflow runtime emits OTel spans |
| P3-AD-6 Metadata modularity: split-file resolver | Phase 3 spine | Visual builder writes split BADL files via the same resolver |
| P3-AD-7 BADL JSON Schema as formal AI artifact | Phase 3 spine | AI page generator consumes badl.schema.json as its output contract |

---

## Invariants & Rules

### P4-AD-1 — Long-Running Workflow Runtime: Provider Abstraction (Temporal-Compatible)

- **Binds:** @origo/workflow-runtime (new package), long-running Workflow schema (designed Phase 2)
- **Prevents:** the runtime being locked to a single workflow engine vendor; in-memory workflow state being lost on process restart
- **Rule:** Long-running workflow runtime uses a **WorkflowRuntimeProvider** abstraction. The provider interface wraps the durable execution primitives: `startWorkflow()`, `signalWorkflow()`, `queryWorkflow()`, `scheduleTimeout()`, `compensate()`. Phase 4 ships one built-in provider: **Temporal.io** (open-source, self-hostable). The abstraction MUST also accommodate a fallback **LocalProvider** (in-process, non-persistent; for development and testing only). Additional providers (Azure Durable Functions, AWS Step Functions) are registered as @origo/cli WorkflowRuntimeProvider extensions. BADL Workflow definitions are compiled to Temporal Workflow definitions by a @origo/workflow-runtime/src/compilers/temporal/ compiler — the BADL schema is never modified to accommodate Temporal-specific concepts.

---

### P4-AD-2 — Offline First: Workbox (Service Worker) + IndexedDB (Entity Data)

- **Binds:** @origo/angular-renderer (offline mode), @origo/react-native-renderer (offline mode)
- **Prevents:** offline strategy being inconsistent between web and mobile renderers; offline capability polluting the core BADL schema
- **Rule:** Web offline support uses **Workbox** for service worker management (precaching BADL content + design tokens; stale-while-revalidate for API calls). Entity data is persisted in **IndexedDB** via a DataProvider extension of type DataProvider that declares `capabilities: ["offline", "sync"]`. React Native offline uses AsyncStorage for entity data and a background sync queue. BADL schema MUST NOT contain offline-specific fields — offline is a DataProvider concern, not a grammar concern. The sync conflict resolution strategy is last-write-wins by default; the DataProvider extension MAY declare an alternative merge strategy.

---

### P4-AD-3 — Plugin Marketplace: npm-Compatible Registry with Origo Manifest Validation

- **Binds:** @origo/marketplace package (new), extension publishing workflow
- **Prevents:** marketplace bypassing the Phase 3 extension contract; plugins activating without security review; the marketplace being a separate incompatible ecosystem
- **Rule:** The plugin marketplace is an **npm-compatible registry** (can be self-hosted via Verdaccio or use the public npm registry under the @origo-community/* scope). Every published extension MUST: (1) include a valid origo-extension.manifest.json (P3-AD-1 format); (2) pass @origo/core manifest validation before listing; (3) declare all permissions it requires (FR-EXT-014). The marketplace UI (part of @origo/studio) fetches the registry, displays extension metadata, and installs via `origo extension install <name>`. Package signing (npm provenance) is required for Tier 1 (Origo official) extensions; recommended for community extensions.

---

### P4-AD-4 — Visual Page Builder: BADL-Only Output via the Existing Authoring Stack

- **Binds:** @origo/studio visual builder implementation
- **Prevents:** the visual builder creating a parallel metadata format that bypasses @origo/core; the builder becoming a code generator instead of a BADL authoring surface
- **Rule:** The Visual Page Builder is a drag-and-drop Angular application within @origo/studio that writes BADL JSON files only — it is one BADL authoring surface among several (AD-8 — inherited, reinforced). The builder's output MUST be: (a) valid against @origo/core's BADL validator, (b) written to the same content directory as CLI-authored BADL, and (c) immediately loadable by @origo/angular-renderer without transformation. The builder reads and writes existing split-file BADL (P3-AD-6). It MUST NOT produce Angular templates, component code, or any file that is not a BADL JSON document.

---

### P4-AD-5 — AI Page Generation: Provider-Agnostic via AIProvider Extension

- **Binds:** @origo/studio AI generator UI, AIProvider extension type (registered in Phase 3 manifest)
- **Prevents:** AI page generation being hard-coded to a specific LLM provider; two contributors implementing incompatible generation strategies
- **Rule:** AI page generation works via the AIProvider extension type. The AIProvider extension implements the interface: `generate(entityDescription: string, domain: string): Promise<BadlEntityFile[]>`. Phase 4 ships one reference AIProvider implementation: `@origo/ai-provider-openai` (uses the OpenAI Responses API; requires an API key). Consumers may register alternative AIProviders (local LLMs, Azure OpenAI, Anthropic) as extensions. The generation pipeline is: user describes the entity in natural language -> @origo/studio sends it to the registered AIProvider -> AIProvider returns candidate BADL files -> @origo/core validates the BADL -> the validated files are written to the content directory. The Visual Builder opens for developer review before files are committed. No generation pipeline step MUST produce framework-specific code.

---

### P4-AD-6 — No-Code Authoring Layer: Constraint Lifts, Built on Stable BADL

- **Binds:** @origo/studio no-code authoring UI design
- **Prevents:** no-code authoring compromising the grammar designed for developers; non-developer authoring being inconsistent with developer-authored BADL
- **Rule:** AD-14 constraint lifts for Phase 4. The no-code authoring layer is built as a guided form-over-BADL surface within @origo/studio: it presents a developer-designed Business Outcome / Capability / Entity structure in simplified vocabulary for non-technical authors. It MUST still produce valid BADL output via @origo/core validator — it is a presentation layer over BADL, not a separate metadata format. Non-developer authors operate within BADL structures pre-scaffolded by developers. They configure values (labels, field lists, permission roles); they do not invent new schema constructs.

---

### P4-AD-7 — CLI Adapter: terminal prompt pattern for capability invocation

- **Binds:** @origo/cli-adapter (new package), CLI Adapter implementation
- **Prevents:** CLI Adapter being a standalone tool that reimplements capability logic; capability invocation via CLI bypassing @origo/core business rules
- **Rule:** The CLI Adapter follows AD-15 (stateless translator). Input: Interaction Contract. Output: readline/inquirer terminal prompts matching the contract requirements (confirmation -> [y/N], reason -> free-text input, authentication_level -> env var or keychain lookup). The CLI Adapter invokes capabilities via @origo/core — not by shell scripting. All business rules, permissions, and governance chains still apply. Used for: CI/CD pipeline capability invocations, headless batch operations, developer tooling.

---

## Consistency Conventions

| Concern | Convention |
|---|---|
| Temporal workflow ID | origo-wf-{entityId}-{capabilityId}-{timestamp} |
| WorkflowRuntimeProvider registration | WorkflowRuntimeProviderRegistry.register(providerName, providerInstance) |
| Offline sync queue key | origo-sync-{entityType}-{recordId} |
| Marketplace extension scope | @origo-community/* for community; @origo/* for official |
| Visual builder output directory | Same as CLI-authored BADL content directory (configurable in origo.config.json) |
| AI generation review flow | Generate -> Validate -> Open in Visual Builder -> Developer commits |
| No-code author role | Configured in BADL permissions (e.g. Role == ContentAuthor); not a platform-level role |
| CLI Adapter confirmation prompt | [y/N] format; case-insensitive; N is default for destructive-action contracts |
| Long-running workflow compensation log | Stored in Temporal workflow history; accessible via DevTools v3 |

---

## Stack

| Name | Version |
|---|---|
| Temporal.io (workflow runtime) | 1.x (server, self-hostable) |
| @temporalio/client + worker | 1.x (Node.js SDK) |
| Workbox | 7.x |
| IndexedDB (browser native) | — |
| Verdaccio (self-hosted npm registry, optional) | 5.x |
| Inquirer.js (CLI Adapter terminal prompts) | 10.x |
| OpenAI Node SDK | 4.x (reference AIProvider; peer dep) |

---

## Structural Seed

```
packages/
  workflow-runtime/                   # @origo/workflow-runtime (new)
    src/
      providers/
        temporal/                     # Temporal.io WorkflowRuntimeProvider
          temporal-provider.ts
          temporal-workflow-compiler.ts  # BADL Workflow -> Temporal workflow
        local/                        # In-process dev/test provider
          local-provider.ts
      runtime-registry.ts             # WorkflowRuntimeProvider registration
      workflow-executor.ts            # Capability lifecycle integrations

  studio/                             # @origo/studio (significantly expanded)
    src/
      visual-builder/
        canvas/                       # Drag-drop page canvas (Angular)
        component-palette/            # Component registry browser
        properties-panel/             # BADL field inspector + editor
        badl-writer.ts                # Writes validated BADL files to content dir
      no-code/
        guided-outcome-wizard/        # Non-developer Outcome/Capability wizard
        field-configurator/           # Simplified field configuration UI
        vocabulary-adapter.ts         # Developer BADL vocabulary -> simplified labels
      ai-generator/
        generation-dialog.ts          # User intent -> AIProvider -> BADL files
        provider-registry.ts          # AIProvider extension registration
        review-handoff.ts             # Opens generated BADL in Visual Builder
      marketplace/
        marketplace-ui/               # Browse, search, install extensions
        registry-client.ts            # npm registry API client
        installer.ts                  # origo extension install <name>

  cli-adapter/                        # @origo/cli-adapter (new)
    src/
      adapters/cli/
        cli-adapter.ts                # InteractionContract -> terminal prompts
        prompt-builder.ts             # Inquirer.js question builder
        auth-resolver.ts              # authentication_level -> env var / keychain

  angular-renderer/
    src/
      offline/
        service-worker-registrar.ts   # Workbox registration + precache config
        indexeddb-data-provider.ts    # DataProvider extension for offline entity data
        sync-queue.ts                 # Offline mutation queue + background sync

  react-native-renderer/
    src/
      offline/
        async-storage-provider.ts     # DataProvider extension for RN offline
        sync-queue.ts

  core/
    src/
      versioning/                     # Migration tooling extended: BADL -> v{n+1} automated migrations
```

---

## Capability → Architecture Map

| Capability / Area | Lives in | Governed by |
|---|---|---|
| Long-running workflow runtime (Temporal) | @origo/workflow-runtime/ | P4-AD-1, AD-13 |
| WorkflowRuntimeProvider abstraction | @origo/workflow-runtime/src/runtime-registry.ts | P4-AD-1, AD-5 |
| BADL Workflow -> Temporal compiler | @origo/workflow-runtime/src/providers/temporal/ | P4-AD-1 |
| Visual page builder (drag-drop canvas) | @origo/studio/src/visual-builder/ | P4-AD-4, AD-8, AD-14 |
| No-code authoring guided wizard | @origo/studio/src/no-code/ | P4-AD-6, AD-14 |
| AI page generation pipeline | @origo/studio/src/ai-generator/ | P4-AD-5, AD-8, P3-AD-7 |
| AIProvider extension interface | @origo/core/src/extension-api/ (Phase 3 type; Phase 4 reference impl) | AD-5, P4-AD-5 |
| @origo/ai-provider-openai (reference) | separate package | P4-AD-5, AD-5 |
| Plugin marketplace UI + installer | @origo/studio/src/marketplace/ | P4-AD-3 |
| Web offline: Workbox + IndexedDB | @origo/angular-renderer/src/offline/ | P4-AD-2, AD-5 |
| RN offline: AsyncStorage + sync queue | @origo/react-native-renderer/src/offline/ | P4-AD-2, AD-5 |
| CLI Adapter (terminal prompts) | @origo/cli-adapter/ | P4-AD-7, AD-15 |
| Grammar migration automated tooling (v1 -> v2) | @origo/core/src/versioning/ + @origo/cli migrate | AD-10, AD-13 |

---

## Deferred

| Deferred decision | Reason / Revisit condition |
|---|---|
| @origo/blazor-renderer | Post-Phase 4; .NET ecosystem requires separate C# implementation strategy |
| @origo/flutter-renderer | Post-Phase 4; Dart ecosystem; evaluate community demand first |
| Multi-tenant marketplace governance (extension review board, security audit pipeline) | Post-Phase 4; depends on actual marketplace adoption volume |
| Temporal Cloud vs self-hosted recommendation | Deferred to deployment guidance docs; both are compatible with P4-AD-1 |
| AI page generation fine-tuning on BADL corpus | Post-Phase 4; requires production BADL corpus and telemetry data from Phase 1–3 deployments |
| Offline conflict resolution beyond last-write-wins | Provider extension responsibility; operational CRDT strategy deferred to consuming org |
| Spatial / AR adapter (eye-tracking, voice) | Not in roadmap; possible via Experience Adapter contract (AD-15) if demand emerges |
