---
name: 'Origo Design — Phase 2: Business UI (Months 7–12)'
type: architecture-spine
purpose: build-substrate
altitude: feature
paradigm: 'Layered Hexagonal with Versioned Language Contract (inherited)'
scope: '@origo/core (Workflows, Rules, Governance), @origo/angular-renderer (Form/Grid/Layout/Nav/Page engines), @origo/react-native-renderer, hot-reload, DevTools v2, CLI importers'
status: final
created: '2026-07-28'
updated: '2026-07-28'
parent: '../ARCHITECTURE-SPINE.md'
sources:
  - design-artifacts/B-Functional-Requirements/functional-requirements.md (sections 5, 8, 10, 14, 15, 17, 22, 23)
---

# Architecture Spine — Phase 2: Business UI

## Inherited Invariants

| Inherited | From parent | Binds here |
|---|---|---|
| AD-1 through AD-15 | initiative spine | All — unchanged and binding |
| P1-AD-1 Angular 18 Standalone + Signals | Phase 1 spine | All angular-renderer additions in Phase 2 follow the same model |
| P1-AD-3 Ajv 8 + JSON Schema Draft 2020-12 | Phase 1 spine | Phase 2 schema additions (Workflow, Rules, Governance) use same validator |
| P1-AD-4 @origo/core internal module structure | Phase 1 spine | New modules (workflow/, rules/, governance/) follow the same layout pattern |
| P1-AD-5 Component composition over inheritance | Phase 1 spine | Form Engine, Grid Engine, Layout Engine components follow composition model |
| P1-AD-6 Accessibility enforcement in CI | Phase 1 spine | All Phase 2 components pass axe-core in CI |
| P1-AD-2 Style Dictionary token pipeline | Phase 1 spine | React Native renderer consumes dist/react-native/tokens.ts |

---

## Invariants & Rules

### P2-AD-1 — AG Grid Community as the Grid Engine Substrate

- **Binds:** @origo/angular-renderer Grid Engine implementation
- **Prevents:** two contributors building incompatible grid strategies; virtual scrolling implemented inconsistently
- **Rule:** The Grid Engine wraps **AG Grid Community Edition** (free tier, Apache 2.0) as its underlying grid substrate. @origo/angular-renderer exposes an origo-grid component that translates BADL Entity + Capability definitions into AG Grid ColumnDefs, RowData bindings, and action bars. AG Grid internals MUST NOT be exposed to consumer applications — the consumer API is BADL-only. The BADL-to-AG Grid translation layer is isolated in a single GridAdapter service within @origo/angular-renderer. If AG Grid Community is ever replaced, only GridAdapter changes. Features required in Phase 2: sorting, filtering, grouping, column chooser, frozen columns, inline edit, batch edit, tree grid, aggregation, export, print, responsive mode, virtual scrolling (AG Grid row virtualization), infinite scrolling (AG Grid infinite row model), row actions, bulk actions, keyboard navigation, accessibility, column templates, cell templates.

---

### P2-AD-2 — Angular Reactive Forms as the Form Engine Substrate

- **Binds:** @origo/angular-renderer Form Engine implementation
- **Prevents:** two contributors using template-driven vs reactive forms inconsistently; dynamic form validation not being type-safe
- **Rule:** The Form Engine uses Angular **Reactive Forms** (FormGroup / FormControl / FormArray) as its substrate. BADL Entity field definitions are translated to a FormGroup by a FormBuilder service. Dynamic visibility (show/hide fields based on other field values) MUST be implemented as computed signals derived from FormControl valueChanges converted to signals (toSignal()). Multi-step wizard flows MUST be modelled as an array of FormGroups controlled by a WizardStateMachine that exposes a signal for the active step index. Template-driven forms MUST NOT be used in the Form Engine.

---

### P2-AD-3 — Chokidar + WebSocket for Hot-Reload (Dev Mode Only)

- **Binds:** @origo/cli dev server, @origo/angular-renderer hot-reload client
- **Prevents:** two contributors implementing incompatible file-watching strategies; hot-reload shipping in production bundles
- **Rule:** Hot-reload operates via: (1) Chokidar watches the BADL content directory for file saves; (2) the Origo CLI dev server sends a targeted WebSocket notification containing the changed file path and its new parsed content; (3) the renderer receives the notification and re-renders only affected page sections within 500ms (FR-PERF-003). Hot-reload infrastructure is guarded by isDevMode() and MUST be tree-shaken from production bundles. The WebSocket server is part of @origo/cli (origo serve command); the client is part of @origo/angular-renderer.

---

### P2-AD-4 — React Native Renderer: Expo SDK Compatible

- **Binds:** @origo/react-native-renderer architecture
- **Prevents:** renderer requiring a bare React Native workflow that excludes Expo users; two contributors choosing incompatible RN navigation and styling strategies
- **Rule:** @origo/react-native-renderer MUST be compatible with Expo SDK (managed and bare workflow) without ejecting. Styling MUST use React Native StyleSheet exclusively — no third-party styling libraries — consuming @origo/design-tokens/dist/react-native/tokens.ts. Navigation integration: the renderer defines a NavigationContract but delegates actual navigation to the host application via a NavigationAdapter callback — it MUST NOT declare a hard dependency on React Navigation or Expo Router. The Mobile Experience Adapter (bottom sheet, swipe, haptic) lives in @origo/react-native-renderer/src/adapters/mobile/.

---

### P2-AD-5 — CLI Importer Architecture: Commander Plugins

- **Binds:** @origo/cli importer commands (origo import openapi, prisma, efcore, sqlserver, postgres, mysql, jsonschema)
- **Prevents:** importers being a runtime dependency; a new importer requiring modification of @origo/cli core
- **Rule:** Schema importers are **Commander.js subcommand plugins** loaded dynamically by @origo/cli. Each importer lives in a separate npm package (e.g. @origo/cli-import-openapi) and is registered by adding it to origo.config.json plugins[]. The importer interface is: `import(sourcePath: string, options: ImportOptions): Promise<BadlEntityFile[]>`. Importers MUST output BADL entity JSON files only — they MUST NOT modify @origo/core or any renderer. Every importer MUST annotate generated fields with `"_generated": true` to signal developer review required (FR-E-004).

---

### P2-AD-6 — Page Generator Override Architecture (Three Levels)

- **Binds:** @origo/angular-renderer Page Generator, all generated pages
- **Prevents:** generated pages requiring forking to customise; override mechanisms being inconsistent across page types
- **Rule:** Every generated page supports exactly three override levels, resolved in priority order (highest first):
  1. **Page-level** — consumer provides a fully custom Angular component registered in the Page Registry under the entity+page-type key; receives resolved BADL as @Input
  2. **Section-level** — consumer registers a custom component for a named page section (e.g. FormSection, DetailHeader) via the SectionRegistry
  3. **Component-level** — consumer registers a custom component for a specific field or action via the Component Registry (FR-EXT-002)
  No override level requires forking the generated template. All three registries are part of the Extension API surface (AD-5).

---

### P2-AD-7 — DevTools v2: Permission Chain as Interactive Trace Tree

- **Binds:** @origo/devtools Phase 2 additions, @origo/angular-renderer permission resolution
- **Prevents:** "Why is this disabled?" being an opaque system; developers unable to trace permission chains without server logs
- **Rule:** DevTools v2 extends the __ORIGO_DEVTOOLS__ bridge to expose the full permission resolution chain for any selected element: each permission condition (role check, state check, compound condition) MUST be recorded as a trace node with: condition text, evaluated value, resolution source (BADL file + line), and pass/fail status. The DevTools panel renders this as an interactive expandable tree (FR-DX-002). The chain MUST include business rules in scope for the active capability.

---

## Consistency Conventions

| Concern | Convention |
|---|---|
| Grid Engine BADL binding | Entity + CapabilityType:Query supplies columns; CapabilityType:Command capabilities become row/bulk actions |
| Form Engine field ordering | Follows BADL Entity field array order; overridable via field.displayOrder property |
| Wizard step identity | Step = a named FormGroup; steps array is BADL-declared, not hardcoded |
| React Native component prefix | OrigoButton, OrigoInput etc. (PascalCase, Origo- prefix) |
| Importer output path | ./origo-entities/<Domain>/<EntityName>.entity.json |
| Hot-reload WebSocket port | 4200 (Origo CLI dev server default; configurable via origo.config.json) |
| Override registry key | <EntityName>:<PageType> for page-level; <EntityName>:<SectionName> for section-level |
| Permission trace node ID | <permission-id>:<condition-index> |

---

## Stack

| Name | Version |
|---|---|
| AG Grid Community | 32.x |
| Chokidar | 4.x |
| ws (WebSocket server) | 8.x |
| React Native | 0.74.x |
| Expo SDK | 51.x |
| Commander.js | 12.x |
| OpenAPI parser (@readme/openapi-parser) | 2.x |
| Prisma introspection (prisma CLI) | 5.x |

---

## Structural Seed

```
packages/
  core/
    src/
      rules/              # Business Rule schema + inline evaluator
        rule.schema.json
        inline-evaluator.ts
        external-rule-ref.ts
      governance/         # Governance chain schema + inline resolver
        governance.schema.json
        approval-chain.ts
        external-governance-ref.ts
      workflow/           # Workflow schema (sequential, branch, parallel, human-approval)
        workflow.schema.json
        workflow.types.ts # Generated TS types

  angular-renderer/
    src/
      adapters/web/       # Phase 1 — extended with progress + interruptible patterns
      engines/
        form/
          form-builder.service.ts    # BADL Entity -> FormGroup translation
          wizard-state-machine.ts    # Multi-step wizard signal controller
          dynamic-visibility.ts      # Computed signals for field visibility
          form-engine.component.ts   # origo-form standalone component
        grid/
          grid-adapter.service.ts    # BADL -> AG Grid ColumnDefs translation
          grid-engine.component.ts   # origo-grid standalone component (wraps AG Grid)
          column-template.directive.ts
          cell-template.directive.ts
        layout/
          layout-engine.component.ts # origo-layout; exposes named ng-content slots
          layouts/                   # Authentication, Dashboard, Admin, MasterDetail, Wizard, Settings, Profile, Landing, Analytics, Blank, SplitView, Workspace
        navigation/
          navigation-engine.component.ts
          nav-permission.directive.ts # Hides/disables nodes per permission
        page-generator/
          page-registry.ts           # Page-level override registry
          section-registry.ts        # Section-level override registry
          pages/
            list-page.component.ts
            create-page.component.ts
            update-page.component.ts
            detail-page.component.ts
            import-page.component.ts
            bulk-edit.component.ts
      hot-reload/
        hot-reload-client.ts         # WebSocket client (dev mode only, tree-shaken)

  react-native-renderer/
    src/
      adapters/mobile/    # Mobile Experience Adapter (bottom sheet, swipe, haptic)
      components/primitives/         # RN equivalents of Phase 1 Angular primitives
      tokens/             # Consumes @origo/design-tokens/dist/react-native/tokens.ts
      navigation/         # NavigationContract + NavigationAdapter callback
      index.ts

  cli/
    src/
      commands/
        import/           # Dynamic importer plugin loader
          loader.ts       # Reads origo.config.json plugins[]
        serve.ts          # Dev server: Chokidar + WebSocket hot-reload server

  devtools/               # Chrome Extension MV3 — Phase 2 additions
    src/devtools-panel/   # Permission trace tree view
```

---

## Capability → Architecture Map

| Capability / Area | Lives in | Governed by |
|---|---|---|
| Business Rules schema (inline + external engine ref) | @origo/core/src/rules/ | AD-9, P1-AD-3, AD-13 |
| Workflow schema (sequential, branch, parallel, human-approval) | @origo/core/src/workflow/ | AD-13, P1-AD-3 |
| Governance chain schema (inline + external provider ref) | @origo/core/src/governance/ | AD-13, P1-AD-3 |
| Angular Form Engine (BADL -> Reactive Forms) | @origo/angular-renderer/src/engines/form/ | P2-AD-2, P1-AD-1, P1-AD-5 |
| Angular Grid Engine (BADL -> AG Grid) | @origo/angular-renderer/src/engines/grid/ | P2-AD-1, P1-AD-1 |
| Layout Engine (predefined slot-based layouts) | @origo/angular-renderer/src/engines/layout/ | P1-AD-5, AD-4 |
| Navigation Engine (permission-gated nodes) | @origo/angular-renderer/src/engines/navigation/ | AD-9, P1-AD-1 |
| Page Generator (List, Create, Update, Detail, Import, Bulk Edit) | @origo/angular-renderer/src/engines/page-generator/ | P2-AD-6, AD-12 |
| Page/Section/Component registries | @origo/angular-renderer/src/engines/page-generator/ | AD-5, P2-AD-6 |
| Hot-reload client | @origo/angular-renderer/src/hot-reload/ | P2-AD-3 |
| Hot-reload dev server | @origo/cli/src/commands/serve.ts | P2-AD-3 |
| React Native primitive components | @origo/react-native-renderer/src/components/ | P2-AD-4, AD-4, P1-AD-6 |
| Mobile Experience Adapter | @origo/react-native-renderer/src/adapters/mobile/ | AD-15, P2-AD-4 |
| Schema importer CLI plugins | @origo/cli-import-{openapi,prisma,efcore,sqlserver,...} | P2-AD-5, AD-7, AD-8 |
| DevTools v2: permission trace tree | @origo/devtools (Phase 2 panel extension) | P2-AD-7, AD-11 |
| origo serve (dev server command) | @origo/cli/src/commands/serve.ts | P2-AD-3 |

---

## Deferred

| Deferred decision | Reason / Revisit condition |
|---|---|
| Business Outcomes schema (root of BADL hierarchy) | Phase 3 — Completion Signals depend on stable Capability + Workflow schema |
| Full extension contract activation (manifest, lifecycle, capability negotiation) | Phase 3 spine — P3-AD-1 |
| AI Agent Adapter | Phase 3 |
| BADL JSON Schema for AI tooling | Phase 3; depends on stable full grammar |
| Observability event bus implementation | Phase 3 |
| Test scaffold generation | Phase 3 |
| origo migrate from-code | Phase 3 |
| Vue renderer + React Web renderer | Phase 3 |
| Long-running workflow runtime execution | Phase 4 (schema designed here; runtime deferred) |
| Offline storage strategy | Phase 4 |
| Plugin marketplace | Phase 4 |
| Visual builder | Phase 4 |
