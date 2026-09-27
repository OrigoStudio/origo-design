---
baseline_commit: HEAD
---
# Story retro-9: a11y-rtl-knowledge-transfer

Status: ready-for-dev

## Story

As a developer,
I want to author a canonical guide on ARIA semantics and CSS Logical Properties for the Origo angular-renderer codebase,
so that the team has a binding reference that prevents recurring PR feedback on accessibility and RTL violations.

## Acceptance Criteria

1. `docs/src/content/docs/guides/accessibility-and-rtl.md` is created with valid Starlight frontmatter (`title:` and `description:` fields).
2. The guide's **ARIA section** documents the specific Angular attribute-binding patterns used in `@origo/angular-renderer` — `[attr.aria-label]`, `[attr.aria-describedby]`, `[attr.role]` — with `ButtonComponent` and `DataGridComponent` used as concrete, copy-paste reference examples.
3. The guide's **CSS Logical Properties section** explains *why* logical properties are required for RTL layout (i.e., locale-driven `dir` attribute toggling) and provides a complete mapping table: `margin-left/right` → `margin-inline-start/end`, `padding-top/bottom` → `padding-block-start/end`, `left/right` → `inset-inline-start/end`, etc.
4. Every code snippet in the guide has a clear ❌ **Incorrect** and ✅ **Correct** pairing so developers immediately see the anti-pattern and the fix side-by-side.
5. The guide references `P1-AD-6` (Accessibility Enforcement in CI) as the source of ARIA requirements and `NFR-I18N-001` as the source of CSS Logical Properties requirements, with a note that violations fail CI.
6. An ADR is created at `docs/src/content/docs/architecture-decisions/003-a11y-rtl-authoring-standard.md` following the project ADR format (see existing ADRs: `001-json-import-standard.md`, `002-cli-template-generation-strategy.md`) with sections: **Binding · Prevents · Rule**.
7. The new guide is registered in `docs/astro.config.mjs` under the `Guides` sidebar group: `{ label: 'Accessibility & RTL Guide', link: '/guides/accessibility-and-rtl/' }`.
8. The Central Test Registry (`tools/test-registry/test-registry.yaml`) is updated with a `retro-9-a11y-rtl-knowledge-transfer` entry (documentation story — no automated tests; mark as `type: documentation`).

## Technical Requirements & Architecture Compliance

### Architectural Bindings This Story Codifies

- **P1-AD-6 — Accessibility Enforcement in CI:** Every `@origo/angular-renderer` component MUST have a Playwright component test running `axe-core` against its rendered output. An axe-core violation at WCAG 2.1 AA level MUST fail CI. The guide must explain *how* ARIA attributes enable these tests to pass.
- **NFR-I18N-001 — RTL Layout via CSS Logical Properties:** RTL layout direction is derived from the locale definition (`FR-L-003`). Components MUST use CSS Logical Properties — never physical `left`/`right` — so that `dir="rtl"` on an ancestor element automatically mirrors layout without any component code change.

### Docs Site Technical Constraints (Critical — Developer will fail without this)

- **Content root:** All documentation served by the Starlight site lives at `docs/src/content/docs/**`. Files placed anywhere else (e.g., `docs/*.md`, root `docs/*.md`) are NOT rendered.
- **Frontmatter:** Every `.md` file under `docs/src/content/docs/` requires a YAML frontmatter block:
  ```yaml
  ---
  title: Accessibility & RTL Authoring Guide
  description: Binding ARIA semantics and CSS Logical Properties standards for @origo/angular-renderer components.
  ---
  ```
- **Sidebar registration:** New pages must be explicitly added to `docs/astro.config.mjs` under the correct sidebar group. The Guides group currently lists four items — add the new guide as the fifth. See [astro.config.mjs](../../../../../docs/astro.config.mjs) for the exact structure.
- **ADR location:** ADRs live at `docs/src/content/docs/architecture-decisions/` and are auto-generated in the sidebar (no manual registration needed). Use `001-json-import-standard.md` as the format reference.

### ARIA Patterns Already Established in the Codebase

Document *these exact patterns* — do not invent new ones:

```typescript
// ✅ Correct — ARIA attributes bound reactively from contract props
@HostBinding('attr.aria-label') get ariaLabel() { return this.contract().props['aria-label'] ?? null; }
@HostBinding('attr.aria-describedby') get ariaDescribedBy() { return this.contract().props['aria-describedby'] ?? null; }
```
```html
<!-- ✅ Correct — template binding equivalent -->
<ng-container [attr.aria-label]="contract().props['aria-label']">
```

Reference files to read before writing the ARIA section:
- `packages/angular-renderer/src/components/primitives/button/button.component.ts`
- `packages/angular-renderer/src/components/primitives/data-grid/data-grid.component.ts`

### CSS Logical Properties: The Full Mapping

The guide's mapping table must cover at minimum:

| Physical (❌ Forbidden) | Logical (✅ Required) |
|---|---|
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
| `padding-top` / `padding-bottom` | `padding-block-start` / `padding-block-end` |
| `left` / `right` (positioning) | `inset-inline-start` / `inset-inline-end` |
| `border-left` / `border-right` | `border-inline-start` / `border-inline-end` |
| `text-align: left` / `right` | `text-align: start` / `end` |
| `float: left` / `right` | `float: inline-start` / `inline-end` |

### ADR Format (003)

Follow the same micro-format used in existing Phase 1 architecture decisions:

```markdown
## <Decision Title>

**Binding.** [What is now the enforced rule]
**Prevents.** [What failure/PR feedback this eliminates]
**Rule.** [The precise, actionable constraint for developers]
```

## Tasks

- [ ] **1. Read reference components** — `button.component.ts` and `data-grid.component.ts` to extract the actual ARIA binding patterns used. Do NOT guess or invent.
- [ ] **2. Create guide** — `docs/src/content/docs/guides/accessibility-and-rtl.md` with valid Starlight frontmatter, ARIA section (with ❌/✅ examples from real components), and CSS Logical Properties section (with mapping table and ❌/✅ examples).
- [ ] **3. Create ADR** — `docs/src/content/docs/architecture-decisions/003-a11y-rtl-authoring-standard.md` using Binding · Prevents · Rule format. Reference P1-AD-6 and NFR-I18N-001.
- [ ] **4. Register in sidebar** — Add `{ label: 'Accessibility & RTL Guide', link: '/guides/accessibility-and-rtl/' }` to the `Guides` items array in `docs/astro.config.mjs`.
- [ ] **5. Update Test Registry** — Add `retro-9-a11y-rtl-knowledge-transfer` to `tools/test-registry/test-registry.yaml` with `type: documentation`.

## Anti-Patterns to Avoid

- ❌ Do NOT place the `.md` file at `docs/accessibility-and-rtl.md` (root-level) — it will not be served by the docs site.
- ❌ Do NOT omit Starlight frontmatter — the build will silently fail to render the page.
- ❌ Do NOT forget to add the page to `astro.config.mjs` sidebar — it will be unreachable from the navigation.
- ❌ Do NOT write generic ARIA documentation — base all examples on actual `@origo/angular-renderer` component code.
- ❌ Do NOT use physical CSS properties (`left`, `margin-left`, etc.) in the ✅ correct examples.
- ❌ Do NOT skip the ADR — this story's DoD requires an ADR/spike reference in the Acceptance Criteria (see `docs/definition-of-done.md`).
