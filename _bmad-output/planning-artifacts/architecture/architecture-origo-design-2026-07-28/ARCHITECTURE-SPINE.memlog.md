# Architecture Spine — Memlog
# Origo Design — Full Platform (Phase 1–4)
# Altitude: initiative | Purpose: build-substrate
# Started: 2026-07-28

| # | type | text |
|---|------|------|
| 1 | event | Run initialized. Scope: Origo Design full platform Phase 1–4. Altitude: initiative. Fast path requested by Patel (brief full-platform spine → detailed per-phase spines to follow). |
| 2 | constraint | Source: functional-requirements.md v0.3. All 10 open questions resolved. Status: architecture-ready. All FRs treated as binding inputs. |
| 3 | decision | AD-1 Paradigm — Layered Hexagonal with Versioned Language Contract. BADL grammar is the innermost hexagonal core (language standard). All six layers (Outcomes → Capabilities → Rules → Interaction Contracts → Experience Adapters → Renderers) map to concentric dependency rings. Nothing inside the core depends on a renderer; nothing in a renderer imports from another renderer. |
| 4 | decision | AD-2 Monorepo — Nx-managed monorepo. Single repo; packages published independently as @origo/* scoped npm packages. Build graph enforced by Nx project.json tag-based boundaries. Prevents circular imports; prevents renderers sharing private internals. |
| 5 | decision | AD-3 @origo/core owns the BADL grammar: schema, type system, validator, versioning. Zero runtime framework dependencies. It is the only package renderers import for type contracts. |
| 6 | decision | AD-4 Renderer isolation — Each @origo/[framework]-renderer depends only on @origo/core. Renderer packages MUST NOT import each other. BADL content never contains framework-specific constructs. |
| 7 | decision | AD-5 Extension contract as architecture boundary — @origo/core ships the formal extension API surface (FR-EXT-007–014). Third-party packages communicate only through this surface. Core internals are not exported. |
| 8 | decision | AD-6 Design token pipeline — @origo/design-tokens is the single source of truth for all visual primitives. Tokens resolved at BUILD TIME. No renderer hardcodes a color, spacing, or radius value. |
| 9 | decision | AD-7 Metadata canonicality — JSON is canonical on-disk BADL. YAML is conversion-only. All authoring surfaces write JSON. |
| 10 | decision | AD-8 Authoring stack ordering — All surfaces output BADL only; no surface may produce renderer-specific code. Chain: CLI → VS Code Ext → AI Generator → Visual Builder → Import Wizards → BADL → @origo/core. |
| 11 | decision | AD-9 CapabilityType: Command vs Query — first-class schema property. Commands carry permissions, rules, governance, completion signals. Queries carry filters, projections, caching, pagination. Merging rejected categorically. |
| 12 | decision | AD-10 Semantic versioning — grammar uses semver; major = breaking + migration tool required. Renderers declare grammar version compatibility ranges. Fail fast on incompatible version; never silently corrupt. |
| 13 | decision | AD-11 Telemetry via BADL semantic paths — all telemetry IDs use metadata_path (e.g. Customer.ApproveCredit), never DOM selectors. Hooks are pluggable. |
| 14 | decision | AD-12 Test selector stability — selectors use BADL metadata_path values. Tests for renderer v1 must pass on v2 if BADL is unchanged. |
| 15 | decision | AD-13 Phased additive constraint — Phase 1 grammar decisions are frozen before Phase 2 starts. Phase 2–4 extensions are additive only; MUST NOT require breaking changes to prior-phase content. |
| 16 | decision | AD-14 No-code deferral — no Phase 1–3 grammar decision made to accommodate non-developer authoring. No-code layer built on stable BADL in Phase 4 only. |
| 17 | decision | AD-15 Experience Adapter protocol — stateless translators; input = Interaction Contract, output = medium interaction. Replaceable without BADL content changes. Seam between @origo/core semantics and rendering. |
| 18 | assumption | [ASSUMPTION] Nx chosen as monorepo tool — web-verified actively maintained 2026, strong TS boundary enforcement for Angular-first monorepo. Turborepo considered; rejected for weaker boundary control. |
| 19 | assumption | [ASSUMPTION] npm public registry for @origo/* scoped packages. No org-private registry mandated at this altitude. |
| 20 | event | Spine distilled from memlog entries 1–19. This memlog is the authority; ARCHITECTURE-SPINE.md is the distillation. |
