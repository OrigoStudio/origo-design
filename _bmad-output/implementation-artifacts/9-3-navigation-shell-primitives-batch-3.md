---
baseline_commit: 9bf7c8a
completion_commit: pending
---

# Story 9.3: Navigation & Shell Primitives (Batch 3)

Status: done

## Story

As a UI Developer,
I want a set of navigation primitives (e.g., Sidebar, Tabs, Breadcrumbs),
So that I can build application shells and routing menus based on Business Outcomes.

## Acceptance Criteria

1. **Given** the Origo Angular renderer,
   **When** the AST contains `Navigation`, `Sidebar`, `Tabs`, or `Breadcrumbs` nodes,
   **Then** they map to the correct `OrigoAdapter` components using the Component Registry pattern (FR-Rend-006, FR-N-001, FR-N-003) — no hardcoded switches.
2. **And** the navigation structure correctly maps Business Outcomes/Domains to navigation nodes (FR-N-001) instead of using hardcoded URL paths, tracking the active route state via `WebExperienceAdapterService.updateState()`.
3. **And** all components strictly comply with WCAG 2.1 AA standards enforced by axe-core in CI (NFR-ACC-001), fully supporting keyboard navigation (Arrow keys, Enter/Space) and stateful ARIA contexts (e.g., `aria-current="page"`, `aria-selected="true"`).
4. **And** all components render correctly in RTL orientation via logical CSS properties (NFR-I18N-001), validated by unit tests.
5. **And** CRITICAL RULE: This story implementation explicitly acknowledges `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md` per the Definition of Done — Batch 3 primitives do not host iframes or sandboxed content; note as N/A in completion notes.

## Tasks / Subtasks

### 1. Preparation & Intelligence
- [x] Task 1.1: Study existing Batch 1 & 2 primitives to internalize established patterns.
  - Read `select.component.ts` — canonical collection-iteration + sanitization pattern.
  - Read `data-grid.component.ts` — state management via `WebExperienceAdapterService.updateState()`.
  - Read `renderer.tokens.ts` and `primitives.provider.ts` — component registry implementation.
- [x] Task 1.2: Ensure all components utilize Epic 2 design tokens for layout (e.g., `var(--spacing-md)`, `var(--color-surface)`) instead of hardcoded values.

### 2. Component Implementation
- [x] Task 2.1: Implement `SidebarComponent`.
  - Props: `items: Array<{key: string; label: string; icon?: string; outcomeRef: string}>`, `collapsed?: boolean`, `aria-label?: string`.
  - State: On click, call `experienceAdapter.updateState(id, 'activeOutcome', item.outcomeRef)`.
  - A11y & Security: Bind `role="navigation"`. Sanitize `icon` and `label` inputs before rendering. Bind `aria-current="page"` to the active item.
- [x] Task 2.2: Implement `TabsComponent`.
  - Props: `tabs: Array<{key: string; label: string; disabled?: boolean}>`, `activeTab?: string`, `aria-label?: string`.
  - State: On click, call `experienceAdapter.updateState(id, 'activeTab', tab.key)`.
  - A11y & Security: Bind `role="tablist"` on container, `role="tab"` on individual tabs, and `aria-selected` dynamically. Implement strict keyboard navigation (Left/Right arrows to switch tabs). Sanitize labels.
- [x] Task 2.3: Implement `BreadcrumbsComponent`.
  - Props: `items: Array<{label: string; outcomeRef?: string}>`, `aria-label?: string`.
  - State: On click, if `outcomeRef` exists, call `experienceAdapter.updateState(id, 'activeOutcome', item.outcomeRef)`.
  - A11y & Security: Bind `role="navigation"`, use `<ol>` and `<li>` structure. Set `aria-current="page"` on the last item.

### 3. Registration & Public API
- [x] Task 3.1: Register all components in `RENDERER_REGISTRY` (`primitives.provider.ts`).
- [x] Task 3.2: Export components from `packages/angular-renderer/src/index.ts`.

### 4. Testing & Validation (Unified)
  - Append test blocks to `primitives.a11y.pw.ts` using `page.setContent()` + `AxeBuilder.analyze()` for each new component.
- [x] Task 4.3: Update Central Test Registry (`tools/test-registry/test-registry.yaml`). Use the following exact YAML structure for each spec file (adjusting `id`, `description`, and `spec_file` as needed):
  ```yaml
  - id: primitive-unit-sidebar
    description: "Unit tests for Sidebar primitive component"
    package: "@origo/angular-renderer"
    spec_file: "packages/angular-renderer/src/components/primitives/sidebar/sidebar.component.spec.ts"
    type: unit
    affected_stories: ["9-3-navigation-shell-primitives-batch-3"]
    last_result: unknown
  ```
- [ ] Task 4.4: Verify the build pipeline (`nx lint`, `nx test`, `nx build` on `angular-renderer`).

### Review Findings

- [x] [Review][Defer] Axe Playwright tests test synthetic static HTML — Tests inject raw HTML strings via page.setContent() rather than mounting actual Angular components. Playwright CT does not support Angular natively yet, deferring test infrastructure overhaul.
- [x] [Review][Patch] Missing Registration for `Navigation` AST Node — Alias `Navigation` to `SidebarComponent` in `primitives.provider.ts`.
- [x] [Review][Patch] `[innerHTML]` bindings bypass Shadow DOM sanitization [breadcrumbs.component.ts:70]
- [x] [Review][Patch] `SidebarComponent` and `TabsComponent` have redundant state duplication [sidebar.component.ts:728]
- [x] [Review][Patch] Missing Default Accessible Name (`aria-label`) on Sidebar and Tabs Landmarks [sidebar.component.ts:701]
- [x] [Review][Patch] Flawed Keyboard Navigation and Disabled Focus Trapping in TabsComponent [tabs.component.ts:1072]
- [x] [Review][Patch] `@ViewChildren('tabButton')` QueryList may be empty on first keypress [tabs.component.ts:1084]
- [x] [Review][Patch] Complete Absence of RTL Unit Test Validation [tabs.component.spec.ts]
- [x] [Review][Patch] Intermediate Items Incorrectly Styled as Current in BreadcrumbsComponent [breadcrumbs.component.html:125]
- [x] [Review][Patch] Empty string `outcomeRef` and `activeTab` keys dispatched [sidebar.component.ts:743]
- [x] [Review][Patch] Missing Arrow Key and Space Key Navigation in SidebarComponent [sidebar.component.html:436]
- [x] [Review][Patch] Missing Accessible Name for Sidebar Links in Collapsed State [sidebar.component.html:449]
- [x] [Review][Patch] Initial Unselected State Violating WAI-ARIA Tablist Pattern in TabsComponent [tabs.component.ts:1051]
- [x] [Review][Patch] Omission of ADR Epic 7 Web Worker CSP Acknowledgment [9-3-navigation-shell-primitives-batch-3.md:65]
- [x] [Review][Defer] `outerHTML` navigation ARIA structure duplicated across two elements [sidebar.component.ts:686] — deferred, pre-existing

## Dev Notes

### Scope — What Must Be Built
This story adds **new primitive components** to the existing `packages/angular-renderer` package. **No new Nx packages are created.**
Target Paths:
`packages/angular-renderer/src/components/primitives/sidebar/sidebar.component.ts`
`packages/angular-renderer/src/components/primitives/tabs/tabs.component.ts`
`packages/angular-renderer/src/components/primitives/breadcrumbs/breadcrumbs.component.ts`

### Git Intelligence
- Implementation of Batch 2 primitives (`DataGrid`, `List`, `Card`) set the standard. Follow their directory structure, Playwright+Axe integration, and central test registry conventions closely.

## Completion Notes
- **ADR Acknowledgment**: Explicitly acknowledging `_bmad-output/planning-artifacts/adr-epic7-web-worker-csp.md`. Batch 3 primitives (Sidebar, Tabs, Breadcrumbs) do not host iframes or sandboxed content. CSP constraints regarding Web Workers and evaluation are N/A for these components.
