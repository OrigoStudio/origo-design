---
title: origo-design PRD
status: approved
created: 2026-08-21
updated: 2026-08-21
---

# origo-design PRD

*Draft*
## 1. Product Vision & Goals

**Product Vision:**
Origo Design is a framework-agnostic developer platform for building scalable enterprise applications using a single declarative language (BADL - Business Application Description Language). It strictly separates business logic, capability contracts, and permissions from the presentation layer, allowing developers to generate native UI across multiple mediums (Web, Mobile, AI Agents) from a single unified schema. 

**Core Goals:**
1. **Total Renderer Isolation:** @origo/core remains completely agnostic to UI frameworks, empowering developers to adopt Angular, React Native, or Vue renderers using the exact same BADL schema.
2. **Deterministic & Git-Friendly:** BADL schemas serialize to a strict canonical JSON AST format ensuring stable IDs, predictable diffs, and minimal merge conflicts.
3. **World-Class DX (Developer Experience):** With a powerful CLI, browser-based playground with live compilation, and DevTools, a developer unfamiliar with BADL must be able to produce a working rendered page within 10 minutes of their first install.
4. **Out-of-the-Box Enterprise Quality:** Every generated component automatically enforces WCAG 2.1 AA accessibility, zero-code theme switching via design tokens, role-based security, and predictable semantic telemetry.


## 2. Target Audience & Personas

1. **Application Developer (The Primary Consumer):** Uses the CLI, Playground, and DevTools to author BADL schemas and assemble enterprise applications. They don't need to know the internals of @origo/core or the renderers, but they expect a seamless, fast onboarding experience.
2. **Platform Engineer:** Sets up the Nx monorepo, configures CI pipelines, and maintains the build infrastructure. They care about stable IDs, deterministic diffs, and strict architectural boundaries.
3. **Core / Engine Developer:** Works on @origo/core, the BADL grammar, compiler, and validation engine. They need strict type safety, robust AST traversal, and a pluggable extension architecture.
4. **UX / UI Developer:** Builds the Experience Adapters, renderer components, and manages design tokens. They care about WCAG AA compliance, CSS Custom Properties, and zero-code theming.

## 3. Feature Requirements (Phase 1)

1. **The BADL Compiler & Core (@origo/core)**
   - **Grammar AST:** Strict schema definitions for Entities, Fields, and Capabilities (Commands vs. Queries).
   - **Validation Engine:** Built-in Ajv-based JSON Schema validation ensuring valid BADL files.
   - **Contracts:** Standardized Interaction Contracts and basic Permission resolution.

2. **Design Tokens Engine (@origo/design-tokens)**
   - **Token Resolution:** Build-time generation of CSS Custom Properties for web.
   - **Theme Overrides:** Zero-code theme switching (e.g., Light/Dark mode) relying purely on design token overriding, bypassing component stylesheet hardcoding.

3. **Angular Renderer (@origo/angular-renderer)**
   - **Primitive Library:** 20–25 accessibility-first (WCAG 2.1 AA) presentation components.
   - **Web Experience Adapter:** Translates standard Interaction Contracts into native web Modals/Dialogs.

4. **Developer Tooling (@origo/cli & DevTools)**
   - **CLI Core:** Commands for scaffolding (origo init), scaffolding entities (origo generate entity), and validation (origo validate).
   - **DevTools v1:** Basic browser extension tracking BADL metadata_path telemetry and DOM boundaries.

5. **Playground & Documentation**
   - **Browser Playground:** Web-based BADL editor allowing live preview without a local environment.
   - **Documentation Hub:** First-class reference docs for BADL schema syntax and CLI usage.

## 4. Non-Functional Requirements (NFRs)

1. **Architectural Isolation (AD-1 & AD-4):**
   Strict inward dependency flow must be maintained (Renderers -> Adapters -> @origo/core). No renderer may import framework-specific code into the core, nor can renderers import each other. This is enforced at lint-time via Nx boundaries.
2. **Accessibility (WCAG 2.1 AA):**
   Every generated Angular component in Phase 1 must meet WCAG 2.1 AA compliance out of the box, verified automatically in CI.
3. **Performance & Theming (AD-6):**
   Renderers must resolve design tokens at build time (e.g., as CSS Custom Properties) to ensure zero runtime overhead for theme switching. No hardcoded color/spacing logic is permitted in renderer components.
4. **Performance Thresholds:**
   - **Parser Speed:** BADL JSON parsing and schema validation must complete in <100ms for payloads up to 1MB.
   - **Renderer Overhead:** The AST-to-Component rendering cycle must not introduce more than 50ms overhead compared to native, handcrafted Angular code, guaranteeing 60fps scrolling and fast Time To Interactive (TTI).
5. **Security & Identity:**
   - **IAM Integration:** Must provide out-of-the-box integration paths for standard IAM systems (Auth0, Entra ID) via JWT claims.
   - **Strict RBAC:** BADL Capabilities of type Command must enforce Role-Based Access Control before evaluation, rejecting unauthorized invocations at the core layer.
   - **Injection Prevention:** Since BADL is strictly serialized AST data (JSON), the renderer must strictly sanitize output and prevent all XSS or template injection vectors.
6. **Semantic Observability & Testing (AD-11 & AD-12):**
   Telemetry payloads, test selectors, and e2e scaffolds MUST strictly rely on BADL metadata_path values (e.g., Customer.Name) rather than fragile DOM classes or component IDs.
7. **Backwards Compatibility (AD-13):**
   Any evolution of the BADL grammar post-Phase 1 must be strictly additive. Upgrades must never silently corrupt or require forced manual rewrites of existing valid Phase 1 BADL files.

## 5. Success Metrics (Phase 1)

1. **Time-to-First-Page (TTFP):** A net-new developer can install the CLI, scaffold a BADL entity, and view the rendered page in the Playground within **10 minutes**.
2. **Core Stability:** 100% of CLI-generated and Playground-edited BADL schemas pass the @origo/core Ajv validation.
3. **Performance Limits:** 95th percentile JSON parsing and component hydration overhead remains strictly under **50ms**.
4. **Zero-Regression Architecture:** 0 violations for Nx architectural boundary linting, and 0 accessibility violations for WCAG 2.1 AA in automated CI checks.
5. **Renderer Agnosticism:** The BADL ASTs created in Phase 1 require **zero** manual schema modifications when the Phase 2 React Native renderer is introduced.
