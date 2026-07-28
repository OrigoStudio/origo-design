---
name: 'Origo Design — Phase 3: Metadata Platform (Months 13–18)'
type: architecture-spine
purpose: build-substrate
altitude: feature
paradigm: 'Layered Hexagonal with Versioned Language Contract (inherited)'
scope: 'Business Outcomes, Completion Signals, full Extension Contract activation, metadata modularity + versioning + migration, AI Agent Adapter, BADL JSON Schema for AI tooling, Observability, semantic test selectors, code-to-BADL migration, Vue + React Web renderers'
status: final
created: '2026-07-28'
updated: '2026-07-28'
parent: '../ARCHITECTURE-SPINE.md'
sources:
  - design-artifacts/B-Functional-Requirements/functional-requirements.md (sections 3, 12, 13, 16, 18, 20, 21, 22, 23)
---

# Architecture Spine — Phase 3: Metadata Platform

## Inherited Invariants

| Inherited | From parent | Binds here |
|---|---|---|
| AD-1 through AD-15 | initiative spine | All — unchanged and binding |
| P1-AD-1 Angular 18 Standalone + Signals | Phase 1 spine | Vue renderer follows its own idiom (Vue 3 Composition API); React Web renderer follows React conventions; Angular additions follow P1-AD-1 |
| P1-AD-3 Ajv 8 + JSON Schema Draft 2020-12 | Phase 1 spine | Business Outcomes schema additions use same validator |
| P1-AD-4 @origo/core internal module structure | Phase 1 spine | New module (outcomes/) follows same layout pattern |
| P2-AD-5 CLI importer plugin architecture | Phase 2 spine | origo migrate from-code follows the same Commander plugin pattern |
| P2-AD-6 Page Generator override architecture | Phase 2 spine | Test scaffold generation integrates with Page Generator |

---

## Invariants & Rules

### P3-AD-1 — Extension Contract: Synchronous Manifest Validation + Async Lifecycle

- **Binds:** @origo/core extension-api/ (fully activated), all extension implementations
- **Prevents:** extensions with incompatible grammar versions silently activating; extension initialization blocking the application startup path; dependency cycles going undetected
- **Rule:** The extension activation protocol has two phases:
  (1) SYNCHRONOUS — manifest validation and dependency graph resolution run before any extension code executes. @origo/core validates: manifest schema completeness, grammar_version_range compatibility (semver range check against current grammar version), renderer_api_range compatibility, dependency existence, and absence of cyclic dependencies. Any failure produces a human-readable CompatibilityReport and BLOCKS activation — extensions do not partially activate.
  (2) ASYNC — once validation passes, the lifecycle (Initialize -> Configure -> Validate -> Activate -> Deactivate -> Dispose) executes asynchronously with a configurable timeout per phase. Extensions that exceed the timeout are deactivated and reported. Extensions communicate only through the public ExtensionAPI surface (AD-5); any attempt to import from @origo/core internal paths throws at module resolution time.

---

### P3-AD-2 — AI Agent Adapter: OpenAI Function-Calling Compatible JSON Protocol

- **Binds:** @origo/react-native-renderer (or separate @origo/ai-adapter package), AI Agent Adapter implementation
- **Prevents:** the AI Adapter being tied to a specific LLM vendor; two contributors implementing incompatible challenge/response schemas
- **Rule:** The AI Agent Adapter translates an Interaction Contract into an **OpenAI function-calling compatible JSON schema** for the challenge, and accepts a structured JSON response as the agent's answer. The challenge schema MUST be a valid OpenAI tool definition (name, description, parameters: JSON Schema object). The response is validated against the Interaction Contract's requirements (confirmation, reason, authentication level) by @origo/core before the capability is allowed to proceed. The Adapter is vendor-agnostic: it does not call any LLM API directly — it produces the challenge JSON and validates the response JSON. LLM API integration is the host application's responsibility (FR-A-005, FR-AI-003).

---

### P3-AD-3 — Observability: OpenTelemetry-Compatible Event Format

- **Binds:** all renderer telemetry hooks (Phase 1 stubs; fully implemented in Phase 3)
- **Prevents:** telemetry being incompatible with standard observability infrastructure; two renderers emitting different event shapes
- **Rule:** All telemetry events (page.render, page.ready, capability.invoke, capability.complete, validation.fail, permission.deny, accessibility.violation) MUST be emitted as **OpenTelemetry spans** when an OTel-compatible sink is registered, or as plain structured JSON objects when no sink is present. Event payloads MUST include: event name, BADL semantic path identifier, timestamp, and optional metadata. The telemetry sink registry accepts any sink implementing the OtelSink interface: `record(span: OtelSpan): void`. @origo/core exports the OtelSink interface; no OTel SDK is bundled — consumers opt in by registering a sink.

---

### P3-AD-4 — TypeScript Compiler API for Code-to-BADL Migration Analysis

- **Binds:** @origo/cli origo migrate from-code implementation
- **Prevents:** migration tool coupling to non-portable regex parsing; AST analysis being inconsistent across Angular/React/Vue code patterns
- **Rule:** `origo migrate from-code <path>` uses the **TypeScript Compiler API** (`ts.createProgram`) to parse existing Angular/React/Vue component source. It extracts: component inputs as candidate Entity fields, template bindings as candidate field labels, validators as candidate validation declarations, and permission guards as candidate permission declarations. Output is BADL entity JSON with every generated field annotated `"_generated": true` and every file annotated with `"// APPROXIMATE — developer review required"` (FR-ADOPT-003). The tool MUST be explicitly documented as a starting point, not a lossless migration.

---

### P3-AD-5 — Vue 3 Composition API + script setup for @origo/vue-renderer

- **Binds:** @origo/vue-renderer component architecture
- **Prevents:** Options API legacy patterns being introduced; two contributors using incompatible Vue component styles
- **Rule:** Every component in @origo/vue-renderer MUST use Vue 3 **Composition API with `<script setup>` SFCs**. Reactivity MUST use `ref()` / `computed()` / `watch()`. Props are defined via `defineProps<{...}>()`. The Vue renderer imports only `@origo/core` (types and validator) and Vue 3. It MUST NOT import Angular, React, or React Native packages. Component selectors use the `origo-` prefix in kebab-case within templates; the component registration uses PascalCase (e.g. `OrigoButton`).

---

### P3-AD-6 — Metadata Modularity: Split-File Resolution at Build Time

- **Binds:** @origo/core/src/metadata/ (new module), @origo/cli origo validate
- **Prevents:** large monolithic entity files causing merge conflicts; split files drifting from the resolved model at runtime
- **Rule:** BADL content MAY be split across per-concern files (Customer.entity.json, Customer.capabilities.json, Customer.rules.json, etc.). `@origo/core` exports a `resolveMetadata(contentDir: string): Promise<ResolvedBadlModel>` function that merges split files into a single validated in-memory model. Resolution happens at build time (for production) and on file-save (for hot-reload). The resolved in-memory model is the canonical runtime representation — split files are never read directly by renderers. Array ordering in BADL is semantically insignificant (AD-7 convention); the resolver MUST NOT impose an ordering requirement.

---

### P3-AD-7 — BADL JSON Schema Published as Formal AI Artifact

- **Binds:** @origo/core (new export: badl.schema.json), VS Code extension, AI tooling consumers
- **Prevents:** LLMs generating syntactically invalid BADL; IDE tooling and AI tooling using different schema sources
- **Rule:** @origo/core MUST export a single consolidated `badl.schema.json` (JSON Schema Draft 2020-12) covering the full BADL grammar at its current major version. This file MUST be: (a) served at `https://origo.design/schemas/v{major}/badl.schema.json` for URL-based schema registration; (b) bundled in `@origo/core/dist/badl.schema.json` for offline use; (c) registered with Monaco Editor in @origo/playground; (d) usable as an OpenAI function-calling parameters schema for AI generators. The schema MUST be auto-generated from the same JSON Schema source files as the runtime validator — it is not hand-authored separately (FR-AI-004).

---

## Consistency Conventions

| Concern | Convention |
|---|---|
| Extension manifest filename | origo-extension.manifest.json in the extension package root |
| Extension type enum values | Renderer, ExperienceAdapter, ComponentRegistry, Validator, RuleEngine, GovernanceProvider, DataProvider, Importer, Exporter, ThemeProvider, TelemetryProvider, AIProvider, CLICommand, StudioExtension, DevToolsExtension |
| AI Agent challenge schema key | origo_challenge (OpenAI tool name) |
| Observability sink registration | OtelSinkRegistry.register(sinkName, sinkInstance) — per-application, not per-component |
| BADL schema URL pattern | https://origo.design/schemas/v{major}/{concern}.schema.json |
| Migration tool output annotation | "// APPROXIMATE — developer review required" on every generated BADL file |
| Vue component file structure | ComponentName.vue (SFC) co-located with ComponentName.spec.ts |
| React Web component file structure | ComponentName.tsx + ComponentName.test.tsx co-located |
| Metadata split-file merge key | Entity id field is the merge key; duplicate ids in a domain = validation error |
| Completion Signal expression | JSON Logic expression evaluated against the business state snapshot |

---

## Stack

| Name | Version |
|---|---|
| Vue | 3.4.x |
| React | 18.x |
| React DOM | 18.x |
| TypeScript Compiler API | 5.5.x (bundled with TypeScript) |
| OpenTelemetry JS SDK | 1.x (peer dep, not bundled) |
| JSON Logic (js-jsonlogic) | 2.x |
| @origo/cli-migrate-from-code | new package Phase 3 |

---

## Structural Seed

```
packages/
  core/
    src/
      outcomes/           # Business Outcomes schema + Completion Signal evaluator
        outcome.schema.json
        completion-signal.ts   # JSON Logic evaluator for Completion Signals
      metadata/           # Metadata modularity: split-file resolver + merger
        resolver.ts        # resolveMetadata(contentDir): Promise<ResolvedBadlModel>
        merger.ts          # Merge strategy: id-keyed, order-agnostic
        hot-reload.ts      # Emit resolved model on file save (used by CLI serve)
      extension-api/      # FULLY ACTIVATED in Phase 3 (was interfaces-only in Phase 1)
        manifest.ts        # ExtensionManifest schema + validator
        lifecycle.ts       # ExtensionLifecycle: Initialize -> Configure -> Validate -> Activate -> Deactivate -> Dispose
        capability-negotiation.ts
        dependency-resolver.ts   # Topological sort + cycle detection
        compatibility-report.ts  # Human-readable CompatibilityReport
        registry.ts        # ExtensionRegistry: register(), activate(), deactivate()
      versioning/         # Extended: migration tool framework
        migration-runner.ts
        migration-manifest.ts
    dist/
      badl.schema.json    # Consolidated AI artifact (auto-generated, not hand-authored)

  angular-renderer/
    src/
      adapters/ai-agent/  # AI Agent Adapter (OpenAI function-calling compatible)
        ai-adapter.ts
        challenge-builder.ts
        response-validator.ts
      observability/
        otel-sink-registry.ts
        telemetry-emitter.ts    # Shared by all engines; emits OTel spans or JSON
      testing/
        test-scaffold-generator.ts   # Generates *.spec.ts for generated pages
        badl-selector.ts             # metadata_path -> Playwright locator helper

  vue-renderer/           # @origo/vue-renderer (new package)
    src/
      components/primitives/  # Vue 3 SFCs: OrigoButton.vue, OrigoInput.vue, etc.
      adapters/web/            # Vue-specific Web Adapter
      index.ts

  react-web-renderer/     # @origo/react-web-renderer (new package)
    src/
      components/primitives/  # React TSX: OrigoButton.tsx, OrigoInput.tsx, etc.
      adapters/web/            # React-specific Web Adapter
      index.ts

  cli/
    src/
      commands/
        migrate/
          from-code.ts    # TypeScript Compiler API analysis + BADL generation
          schema-version.ts  # origo migrate <grammar-version>
        export/
          yaml.ts         # origo export yaml (YAML conversion, not stored)
```

---

## Capability → Architecture Map

| Capability / Area | Lives in | Governed by |
|---|---|---|
| Business Outcomes schema | @origo/core/src/outcomes/ | AD-9, P1-AD-3, AD-13 |
| Completion Signal evaluator (JSON Logic) | @origo/core/src/outcomes/completion-signal.ts | AD-9 |
| Metadata split-file resolver | @origo/core/src/metadata/resolver.ts | P3-AD-6, AD-7 |
| Metadata hot-reload bridge | @origo/core/src/metadata/hot-reload.ts | P3-AD-6 |
| Full extension contract activation | @origo/core/src/extension-api/ | P3-AD-1, AD-5 |
| Extension manifest + validation | @origo/core/src/extension-api/manifest.ts | P3-AD-1 |
| Extension lifecycle engine | @origo/core/src/extension-api/lifecycle.ts | P3-AD-1 |
| Dependency resolver + cycle detection | @origo/core/src/extension-api/dependency-resolver.ts | P3-AD-1 |
| BADL JSON Schema artifact (AI tooling) | @origo/core/dist/badl.schema.json | P3-AD-7, AD-7 |
| Grammar migration tooling | @origo/core/src/versioning/migration-runner.ts + @origo/cli migrate | AD-10, AD-13 |
| YAML export (conversion-only) | @origo/cli/src/commands/export/yaml.ts | AD-7 |
| AI Agent Adapter | @origo/angular-renderer/src/adapters/ai-agent/ | P3-AD-2, AD-15 |
| Observability sink registry + OTel emitter | @origo/angular-renderer/src/observability/ | P3-AD-3, AD-11 |
| Test scaffold generator | @origo/angular-renderer/src/testing/test-scaffold-generator.ts | AD-12 |
| BADL semantic selector helper | @origo/angular-renderer/src/testing/badl-selector.ts | AD-12 |
| Code-to-BADL migration (origo migrate from-code) | @origo/cli/src/commands/migrate/from-code.ts | P3-AD-4, AD-7, AD-8 |
| Vue renderer (primitives + Web Adapter) | @origo/vue-renderer/ | P3-AD-5, AD-4 |
| React Web renderer (primitives + Web Adapter) | @origo/react-web-renderer/ | AD-4 |

---

## Deferred

| Deferred decision | Reason / Revisit condition |
|---|---|
| Long-running workflow runtime execution | Phase 4 — persistence provider abstraction, saga pattern, Temporal.io evaluation |
| Offline storage strategy | Phase 4 spine |
| Plugin marketplace (registry, signing, discovery) | Phase 4 spine |
| Visual page builder | Phase 4 spine |
| No-code authoring layer | Phase 4 — AD-14 constraint lifts only after Phase 3 grammar stability proven |
| AI page generation (model strategy, provider) | Phase 4 — AIProvider extension type is registered in Phase 3; implementation in Phase 4 |
| Blazor + Flutter renderers | Phase 4+ (lower priority than marketplace and no-code) |
| CLI Adapter (terminal prompt interactions) | Phase 4 |
