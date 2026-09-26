---
baseline_commit: 9775c0b6f6f218eb7354c487c08cb2e459488d79
---
# Story retro-9: playwright-component-testing

Status: in-progress

## Story

As a developer,
I want to upgrade the Playwright testing harness to mount actual Angular components instead of raw HTML fixtures,
so that we can accurately verify Shadow DOM accessibility and prevent recurring PR feedback on missed ARIA issues.

## Acceptance Criteria

1. `@playwright/experimental-ct-angular` is installed and listed as a dev dependency in `package.json` (root).
2. A `playwright-ct` Nx target exists in `packages/angular-renderer/project.json` and is runnable via `nx run angular-renderer:playwright-ct`.
3. `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` is **deleted** — all coverage it provided is replaced by per-component `*.component.pw.ts` files.
4. Every one of the 18 primitive component directories has a co-located `*.component.pw.ts` file that imports from `@playwright/experimental-ct-angular` and mounts the real Angular component.
5. All `*.component.pw.ts` tests run `AxeBuilder` against the mounted component and `expect(violations).toEqual([])`.
6. `nx run angular-renderer:playwright-ct --headed` and `--headless` both pass with zero failures.

## Current State — What Exists Today

> **Critical context for developer. Do NOT re-invent; extend and fix what's already here.**

### The Good — Correct Pattern Already Established (3 files)

The correct component-mounting pattern already exists and must be used as the reference template:

- `packages/angular-renderer/src/components/primitives/button/button.component.pw.ts` ✅
- `packages/angular-renderer/src/components/primitives/text-input/text-input.component.pw.ts` ✅
- `packages/angular-renderer/src/components/primitives/vbox/vbox.component.pw.ts` ✅

**Reference pattern from `button.component.pw.ts`:**
```typescript
import { test, expect } from '@playwright/experimental-ct-angular';
import { ButtonComponent } from './button.component';
import AxeBuilder from '@axe-core/playwright';

test.describe('ButtonComponent Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ mount, page }) => {
    await mount(ButtonComponent, {
      props: {
        contract: { id: '3', type: 'button', props: { label: 'Submit' } } as never,
      },
    });
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### The Bad — Raw HTML Fixture File (THE PRIMARY TARGET)

`packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` — **383 lines** — imports from `@playwright/test` (NOT `@playwright/experimental-ct-angular`) and uses `page.setContent()` with manually constructed Shadow DOM HTML. **This entire file must be deleted.**

It currently covers (in raw HTML): Button, TextInput, Select, Checkbox, RadioGroup, Textarea, FormField, HBox, Label, DataGrid, List, Card, Sidebar, Tabs, Breadcrumbs, VBox, Switch (3 variants), Chip (3 variants).

### The Gap — Missing Infrastructure

1. **`@playwright/experimental-ct-angular` is NOT in `package.json`** — it is imported by 3 files but never installed. The package name changed: the correct current package is `@playwright/experimental-ct-angular`. Verify the exact package name and install it.
2. **No `playwright-ct` Nx target in `project.json`** — `packages/angular-renderer/project.json` has no target to run the CT tests. Must add one.
3. **15 primitive component directories have no `*.component.pw.ts` file:**
   - `breadcrumbs/` — add `breadcrumbs.component.pw.ts`
   - `card/` — add `card.component.pw.ts`
   - `checkbox/` — add `checkbox.component.pw.ts`
   - `chip/` — add `chip.component.pw.ts`
   - `data-grid/` — add `data-grid.component.pw.ts`
   - `form-field/` — add `form-field.component.pw.ts`
   - `hbox/` — add `hbox.component.pw.ts`
   - `label/` — add `label.component.pw.ts`
   - `list/` — add `list.component.pw.ts`
   - `radio-group/` — add `radio-group.component.pw.ts`
   - `select/` — add `select.component.pw.ts`
   - `sidebar/` — add `sidebar.component.pw.ts`
   - `switch/` — add `switch.component.pw.ts`
   - `tabs/` — add `tabs.component.pw.ts`
   - `textarea/` — add `textarea.component.pw.ts`

## Technical Requirements & Architecture Compliance

### Hard Rules (from `P1-AD-6` — Accessibility Enforcement in CI)
- Every `@origo/angular-renderer` component MUST have a Playwright component test running `axe-core` against its rendered output.
- An axe-core violation at AA level MUST fail CI.
- All components are Angular standalone (`standalone: true`) — `@playwright/experimental-ct-angular` handles bootstrapping automatically.

### Stack Versions
| Package | Version |
|---|---|
| `@playwright/test` | `^1.36.0` (installed, `1.62.1` resolved) |
| `@axe-core/playwright` | `^4.13.0` (installed) |
| `@playwright/experimental-ct-angular` | To be installed — verify compatible version with resolved `@playwright/test@1.62.1` |
| Angular | 18.x (standalone + signals) |

### File Locations
- **Config:** `packages/angular-renderer/playwright-ct.config.ts` — already exists and correct. `testMatch: /.*\.pw\.ts/`, `testDir: './src'`, `ctPort: 3100`.
- **Tests:** co-located alongside each component as `<name>.component.pw.ts` (matches existing `*.spec.ts` co-location convention).
- **Nx target:** `packages/angular-renderer/project.json` needs a `playwright-ct` target added.

### Installing `@playwright/experimental-ct-angular`
```bash
npm install --save-dev @playwright/experimental-ct-angular
```
Verify the exact version resolves alongside `@playwright/test@1.62.1`. They must match major versions.

### Adding the Nx Target
Add to `packages/angular-renderer/project.json` under `"targets"`:
```json
"playwright-ct": {
  "executor": "nx:run-commands",
  "options": {
    "command": "npx playwright test --config=packages/angular-renderer/playwright-ct.config.ts",
    "cwd": "{workspaceRoot}"
  }
}
```

### Contract Shape for New Components
Each component accepts a `contract` input typed as `InteractionContract<TProps>`. Use the same `as never` cast pattern as `button.component.pw.ts` if the exact props type is complex. Inspect each component's `.component.ts` file to find the exported props interface and use it where available (see `text-input.component.pw.ts` for the typed example).

## Tasks

- [ ] **1. Install package:** `npm install --save-dev @playwright/experimental-ct-angular` — verify compatible version with `@playwright/test@1.62.1`.
- [ ] **2. Add Nx target:** Add `playwright-ct` target to `packages/angular-renderer/project.json`.
- [ ] **3. Create missing `*.component.pw.ts` files** for the 15 components listed above. Use `button.component.pw.ts` as the reference template.
- [ ] **4. Delete `primitives.a11y.pw.ts`** — remove `packages/angular-renderer/src/components/primitives/primitives.a11y.pw.ts` entirely.
- [ ] **5. Run suite:** `nx run angular-renderer:playwright-ct` — all 18 component tests must pass. Fix any violations.
- [ ] **6. Update Central Test Registry:** Add a `retro-9-playwright-component-testing` entry to `tools/test-registry/test-registry.yaml`.

## Anti-Patterns to Avoid

- ❌ Do NOT use `page.setContent()` — this is the raw fixture pattern being removed.
- ❌ Do NOT import from `@playwright/test` in any `*.pw.ts` file — must use `@playwright/experimental-ct-angular`.
- ❌ Do NOT create a single monolithic test file — one `*.component.pw.ts` per component, co-located.
- ❌ Do NOT guess component props shapes — read each component's `.component.ts` file first.
- ❌ Do NOT skip the Nx target — tests must be runnable via `nx run angular-renderer:playwright-ct`.
