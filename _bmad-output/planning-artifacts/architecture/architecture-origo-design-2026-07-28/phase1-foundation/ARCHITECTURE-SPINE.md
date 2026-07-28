---
name: 'Origo Design — Phase 1: Foundation (Months 1–6)'
type: architecture-spine
purpose: build-substrate
altitude: feature
paradigm: 'Layered Hexagonal with Versioned Language Contract (inherited)'
scope: '@origo/core, @origo/design-tokens, @origo/angular-renderer, @origo/cli, @origo/playground, @origo/devtools v1, docs site'
status: final
created: '2026-07-28'
updated: '2026-07-28'
parent: '../ARCHITECTURE-SPINE.md'
sources:
  - design-artifacts/B-Functional-Requirements/functional-requirements.md (sections 3–7, 13–15, 17–19, 23)
---

# Architecture Spine — Phase 1: Foundation

## Inherited Invariants

| Inherited | From parent | Binds here |
|---|---|---|
| AD-1 Layered Hexagonal paradigm | initiative spine | All packages; no outer ring imports inner implementation |
| AD-2 Nx monorepo + @origo/* packages | initiative spine | Monorepo root; Nx tag rules enforced from day 1 |
| AD-3 @origo/core = grammar only, zero framework deps | initiative spine | @origo/core package.json; Nx boundary tag |
| AD-4 Renderer isolation | initiative spine | @origo/angular-renderer imports only @origo/core |
| AD-5 Extension Contract as only third-party boundary | initiative spine | Extension API surface exported; internals private |
| AD-6 Design tokens at build time | initiative spine | @origo/design-tokens pipeline |
| AD-7 JSON canonical BADL | initiative spine | Validator rejects YAML; CLI emits JSON |
| AD-8 All authoring surfaces output BADL only | initiative spine | CLI, playground |
| AD-9 CapabilityType: Command | Query | initiative spine | @origo/core schema |
| AD-10 Semver grammar versioning + fail-fast | initiative spine | @origo/core; angular-renderer peer dep range |
| AD-11 Telemetry via BADL semantic paths | initiative spine | @origo/angular-renderer telemetry hooks |
| AD-12 Test selectors via metadata_path | initiative spine | @origo/core Entity schema |
| AD-13 Phased additive constraint | initiative spine | Phase 1 grammar frozen before Phase 2 |
| AD-14 No-code deferred to Phase 4 | initiative spine | No no-code surface in Phase 1 |
| AD-15 Experience Adapter = stateless translator | initiative spine | Web Adapter implementation |

---

## Invariants & Rules

### P1-AD-1 — Angular 18 Standalone Components + Signals

- **Binds:** @origo/angular-renderer, all Angular component implementations
- **Prevents:** NgModule lock-in preventing zoneless-compatible rendering; two developers diverging on standalone vs module-based
- **Rule:** Every component in @origo/angular-renderer MUST be a standalone Angular component (standalone: true). Reactivity MUST use Angular Signals (signal(), computed(), effect()) for component-local state. Zone.js is NOT a peer dependency; the renderer MUST be zoneless-compatible. RxJS permitted only for Angular Router and HttpClient integration where no signal equivalent exists.

---

### P1-AD-2 — Style Dictionary v4 as the Token Build Pipeline

- **Binds:** @origo/design-tokens, all token output formats
- **Prevents:** platform token outputs diverging; hand-rolled transforms breaking across upgrade
- **Rule:** @origo/design-tokens uses Style Dictionary v4 as the sole build pipeline. Token source: JSON files in src/tokens/ organized by category. Build outputs (all generated, never hand-authored):
  - dist/css/tokens.css — CSS Custom Properties for web renderers
  - dist/js/tokens.js — ES module (raw values)
  - dist/react-native/tokens.ts — typed RN StyleSheet-compatible values
  - dist/json/tokens.json — flat JSON for tooling (playground, DevTools)
  No renderer references src/; all consumers import from dist/.

---

### P1-AD-3 — Ajv 8 + JSON Schema Draft 2020-12 for BADL Validation

- **Binds:** @origo/core validator module, all BADL schema definitions
- **Prevents:** TypeScript types and runtime validator drifting; two validators producing different results for the same content
- **Rule:** BADL grammar is defined as JSON Schema Draft 2020-12 files in @origo/core/src/schemas/. Ajv 8 (with ajv-formats and ajv-errors) is the runtime validator. TypeScript types are GENERATED from the JSON Schema via json-schema-to-typescript — never hand-authored separately. Generated types are committed and re-validated in CI on every schema change. Schema and types diverging = CI failure.

---

### P1-AD-4 — @origo/core Internal Module Structure

- **Binds:** @origo/core source layout, exported surface
- **Prevents:** contributors placing concerns in wrong modules; consumers coupling to internal paths
- **Rule:** @origo/core is organized into six internal modules. Only root index.ts is public. Internal imports flow inward-only: schemas -> types -> validator; contracts -> types; extension-api -> types.

  src/schemas/       — JSON Schema files (source of truth)
  src/types/         — Generated TS interfaces (never hand-authored)
  src/validator/     — Ajv instance + validate() / validateFile() / validateAll()
  src/versioning/    — Grammar semver utilities + compatibility range checker
  src/contracts/     — Interaction Contract standard library (standard-read, standard-write, high-risk-write, destructive-action)
  src/extension-api/ — ExtensionAPI surface (interfaces only; no impl in Phase 1)
  src/index.ts       — ONLY public export surface

No file outside @origo/core may import from any path other than the package root. Enforced by @typescript-eslint/no-restricted-imports + Nx boundary tags.

---

### P1-AD-5 — Component Composition over Inheritance

- **Binds:** @origo/angular-renderer component architecture
- **Prevents:** consumers forced to subclass or fork base components to customize behaviour
- **Rule:** No renderer component MUST extend another renderer component class. Extension uses Angular @ContentChild/ng-content slots, @Input property composition, or hostDirectives composition. Third parties customize via the Component Registry (FR-EXT-002) — never by extending.

---

### P1-AD-6 — Accessibility Enforcement in CI

- **Binds:** @origo/angular-renderer, all component implementations
- **Prevents:** WCAG 2.1 AA violations shipping undetected
- **Rule:** Every @origo/angular-renderer component MUST have a Playwright component test that runs axe-core against its rendered output. An axe-core violation at AA level MUST fail CI. Token-level color contrast is enforced by a Style Dictionary lint step in the @origo/design-tokens build.

---

### P1-AD-7 — Monaco Editor as the Playground BADL Editor

- **Binds:** @origo/playground editor implementation
- **Prevents:** two contributors choosing incompatible editors; JSON Schema intellisense not wired to the BADL grammar
- **Rule:** @origo/playground uses Monaco Editor for the BADL JSON editor. The BADL JSON Schema from @origo/core MUST be registered with Monaco json.schemas so the editor provides: schema validation, auto-complete, hover docs, and error highlighting. The live preview panel uses the same @origo/core validator and @origo/angular-renderer as production — not a mock.

---

### P1-AD-8 — Starlight (Astro) as the Documentation Site

- **Binds:** apps/docs/ implementation
- **Prevents:** Angular/React SSR complexity in a static docs site; contributors choosing incompatible doc frameworks
- **Rule:** Documentation site uses Starlight (built on Astro). Output: static site, no server-side runtime. The hosted playground is embedded as an iframe island — the only Angular runtime in docs. Deployed to a CDN (no server).

---

### P1-AD-9 — DevTools v1 as Chrome Extension (Manifest V3)

- **Binds:** @origo/devtools Phase 1 implementation
- **Prevents:** DevTools requiring a separate dev server; contributors targeting conflicting extension APIs
- **Rule:** DevTools v1 ships as a Chrome Extension (Manifest V3). Communicates via a page-injected content script that reads from a global __ORIGO_DEVTOOLS__ object exposed by @origo/angular-renderer in development mode only. __ORIGO_DEVTOOLS__ MUST be tree-shaken in production builds (isDevMode() guard). Phase 1 exposes: metadata source file + line, rendering path, property resolution chain, theme resolution chain.

---

## Consistency Conventions

| Concern | Convention |
|---|---|
| Angular component selector prefix | origo- (e.g. origo-button, origo-input) |
| Angular component file structure | name.component.ts + .html + .scss + .spec.ts co-located |
| Signal naming | fooSignal for exposed; computedFoo for derived; onFooChange for effects |
| Design token categories | color, typography, spacing, radius, shadow, motion, breakpoint, opacity, density |
| JSON Schema $id | https://origo.design/schemas/v{major}/{concern}.schema.json |
| metadata_path format | EntityName.FieldName dot notation; stable across renames |
| Component Input grouping | [appearance], [behavior], [validation], [events], [security], [accessibility], [animation], [responsive], [theme], [data] |
| Playground deep-link | /playground?entity=EntityName |
| CLI output | JSON for machine; colored human-readable for interactive terminal |
| Test co-location | *.spec.ts alongside *.ts in same directory |

---

## Stack

| Name | Version |
|---|---|
| TypeScript | 5.5.x strict |
| Nx | 19.x |
| Node.js | 22.x LTS |
| Angular | 18.x (standalone + signals) |
| Style Dictionary | 4.x |
| Ajv | 8.x + ajv-formats 3.x |
| json-schema-to-typescript | 14.x |
| Monaco Editor | 0.50.x |
| Astro + Starlight | 4.x / 0.25.x |
| axe-core | 4.x |
| Playwright | 1.45.x |
| Vitest | 2.x |
| JSON Schema | Draft 2020-12 |

---

## Structural Seed

```
packages/
  design-tokens/
    src/tokens/           # color.json, typography.json, spacing.json, radius.json, shadow.json, motion.json, breakpoint.json, opacity.json, density.json
    src/config/           # style-dictionary.config.js
    dist/css/             # tokens.css
    dist/js/              # tokens.js
    dist/react-native/    # tokens.ts (for Phase 2 RN renderer)
    dist/json/            # tokens.json (tooling)

  core/
    src/schemas/          # JSON Schema Draft 2020-12 (source of truth)
    src/types/            # Generated TS interfaces (CI-validated)
    src/validator/        # ajv-instance.ts, validate.ts, validateFile.ts, validateAll.ts
    src/versioning/       # grammar-version.ts, compatibility-checker.ts
    src/contracts/        # standard-lib.ts (4 standard contracts)
    src/extension-api/    # types.ts, index.ts (interfaces only)
    src/index.ts          # ONLY public export

  angular-renderer/
    src/adapters/web/     # Web Experience Adapter (modal, toast, drawer)
    src/components/
      primitives/         # 25 standalone components (button, input, select, checkbox, radio, switch, chip, avatar, badge, icon, tooltip, progress, skeleton, divider, accordion, tabs, card, alert, toast, dialog, drawer, menu, pagination, spinner, breadcrumb)
    src/devtools/         # devtools-bridge.ts (dev mode only, tree-shaken in prod)
    src/index.ts

  cli/
    src/commands/
      new.ts
      generate/entity.ts, outcome.ts
      validate.ts
    src/index.ts          # Commander.js root

  playground/
    src/editor/           # Monaco Editor + BADL schema registration
    src/preview/          # Live Angular preview (uses @origo/angular-renderer directly)
    src/split-pane/

  devtools/               # Chrome Extension Manifest V3
    manifest.json
    src/devtools-panel/   # Panel UI
    src/content-script/   # Page bridge -> __ORIGO_DEVTOOLS__
    src/background/       # Service worker

apps/
  docs/                   # Starlight/Astro static site
    src/content/docs/     # getting-started/, schema-reference/, components/, cli/
    src/components/       # PlaygroundEmbed.astro
```

---

## Capability → Architecture Map

| Capability / Area | Lives in | Governed by |
|---|---|---|
| BADL schema (Entity, Field, Validation, Permissions, basic Capability, Interaction Contract) | @origo/core/src/schemas/ | P1-AD-3, AD-3, AD-9 |
| TypeScript type generation | @origo/core/src/types/ (generated) | P1-AD-3 |
| BADL validator | @origo/core/src/validator/ | P1-AD-3 |
| Grammar versioning + compatibility check | @origo/core/src/versioning/ | AD-10 |
| Interaction Contract standard library | @origo/core/src/contracts/ | AD-15, AD-9 |
| Extension API surface (interfaces only) | @origo/core/src/extension-api/ | AD-5 |
| Design token source + build pipeline | @origo/design-tokens/ | P1-AD-2, AD-6 |
| Angular primitive components (x25) | @origo/angular-renderer/src/components/primitives/ | P1-AD-1, P1-AD-5, P1-AD-6, AD-4 |
| Web Experience Adapter | @origo/angular-renderer/src/adapters/web/ | AD-15 |
| DevTools bridge (dev mode) | @origo/angular-renderer/src/devtools/ | P1-AD-9 |
| CLI: new + generate + validate | @origo/cli/src/commands/ | AD-7, AD-8 |
| Playground editor | @origo/playground/src/editor/ | P1-AD-7 |
| Playground live preview | @origo/playground/src/preview/ | AD-7, AD-8 |
| Documentation site | apps/docs/ | P1-AD-8 |
| DevTools v1 Chrome Extension | packages/devtools/ | P1-AD-9 |
| Telemetry hooks | @origo/angular-renderer (per component) | AD-11 |
| Accessibility enforcement | @origo/angular-renderer (axe-core in CI) | P1-AD-6 |

---

## Deferred

| Deferred decision | Reason / Revisit condition |
|---|---|
| VS Code extension (BADL IntelliSense, diagnostics) | Phase 2; requires stable Phase 1 JSON Schema |
| External rule engine integration | Phase 2 (Business Rules schema additions) |
| Governance chain + Workflow schema | Phase 2 |
| Form Engine implementation | Phase 2 Angular renderer additions |
| Grid engine substrate (AG Grid vs custom) | Phase 2 spine — see P2-AD-1 |
| Page Generator (full suite) | Phase 2 |
| Hot-reload strategy | Phase 2 |
| React Native renderer architecture | Phase 2 spine |
| Schema importer plugins | Phase 2 CLI additions |
| DevTools v2 permission chain explorer | Phase 2 |
| Firefox extension support | Phase 2+ |
| Multi-locale runtime loading strategy | Phase 2 |
