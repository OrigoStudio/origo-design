---
name: retro-10-playground-help-links
epic: retro
status: done
baseline_commit: NO_VCS
---

# retro-10-playground-help-links

> **Origin:** This story comes from `action_items[retro-10-playground-help-links]` in `sprint-status.yaml` — **not** from `epics.md`. Do not search `epics.md` for requirements.

## 📖 Story Foundation

**User Story:**
As a developer using the Playground, I want to easily access documentation from the Playground UI, and I want the documentation URL to be centrally configured so that environment changes don't require widespread code updates.

**Acceptance Criteria:**
- **Given** I am in the Playground application,
  **When** I look at the UI,
  **Then** there is a help/docs link in the header bar that is clearly visible.
- **Given** the application is deployed to different environments,
  **When** building or configuring the application,
  **Then** the docs URL is provided via an `InjectionToken<string>` named `ORIGO_DOCS_URL` declared and exported from `app.config.ts`.
- **Given** I click the help link,
  **When** the action is triggered,
  **Then** I am redirected to the configured docs URL in a new tab with `target="_blank" rel="noopener noreferrer"`.
- **Given** the DoD rules (retro-7),
  **When** implementing the story,
  **Then** `tools/test-registry/test-registry.yaml` is updated with a `retro-10-playground-help-links` entry.

## 👨‍💻 Developer Context & Guardrails

### §1 — InjectionToken Pattern (CRITICAL — no environment files exist)

The playground has **no `environments/` folder** and no existing `InjectionToken`. Use Angular's standalone provider pattern in `app.config.ts`:

```ts
// packages/playground/src/app/app.config.ts
import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideOrigo9Primitives } from '@origostudio/angular-renderer';

export const ORIGO_DOCS_URL = new InjectionToken<string>('ORIGO_DOCS_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideOrigo9Primitives(),
    { provide: ORIGO_DOCS_URL, useValue: 'https://origo.design/docs' },
  ],
};
```

- Token name **`ORIGO_DOCS_URL`** matches the `--origo-color-*` CSS prefix convention.
- Export `ORIGO_DOCS_URL` so specs can import it from one place — do NOT redeclare it.
- Do **not** create `environment.ts` / `environment.prod.ts` — this project does not use that pattern.

### §2 — Header Bar & Template (CRITICAL — do not break the grid)

The current `app.component.html` is a two-pane grid with **no header**. Add a thin header row above the grid.

**`app.component.scss` — add header row to grid:**

```scss
.playground-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr 1fr;   /* header + two stacked panes on mobile */
  height: 100%;
  width: 100%;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;     /* header spans full width + panes side-by-side */
  }
}

.playground-header {
  grid-column: 1 / -1;               /* always full width */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 1rem;
  height: 2.5rem;
  background: var(--origo-color-surface, #ffffff);
  border-bottom: 1px solid var(--origo-color-border, #e0e0e0);

  a.help-link {
    font-size: 0.875rem;
    color: var(--origo-color-text, #333);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
```

**`app.component.html`:**

```html
<div class="playground-layout">
  <header class="playground-header">
    <a class="help-link" [href]="docsUrl" target="_blank" rel="noopener noreferrer">📖 Docs</a>
  </header>
  <div class="editor-pane">
    <origo-badl-editor
      [initialValue]="'{}'"
      (editorContentChange)="onContentChange($event)"
    ></origo-badl-editor>
  </div>
  <div class="preview-pane">
    <origo-playground-preview></origo-playground-preview>
  </div>
</div>
```

**`app.component.ts` — inject `ORIGO_DOCS_URL`:**

```ts
import { Component, inject } from '@angular/core';
import { PreviewService } from '../preview/preview.service';
import { BadlEditorComponent } from '../editor/badl-editor.component';
import { PreviewPaneComponent } from '../preview/preview-pane.component';
import { ORIGO_DOCS_URL } from './app.config';

@Component({
  standalone: true,
  imports: [BadlEditorComponent, PreviewPaneComponent],
  selector: 'origo-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected title = 'playground';
  protected docsUrl = inject(ORIGO_DOCS_URL);
  private previewService = inject(PreviewService);

  public onContentChange(content: string) {
    this.previewService.onContentChange(content);
  }
}
```

### §3 — Fix `app.component.spec.ts` (CRITICAL — will throw `NullInjectorError`)

After `ORIGO_DOCS_URL` is injected by `AppComponent`, every spec that compiles `AppComponent` **must** provide the token or Vitest throws `NullInjectorError`. Update `app.component.spec.ts`:

```ts
import { ORIGO_DOCS_URL } from './app.config';   // add this import

// In beforeEach — add provider:
await TestBed.configureTestingModule({
  imports: [AppComponent, BadlEditorComponent],
  providers: [
    { provide: ORIGO_DOCS_URL, useValue: 'https://test.docs.url' },
  ],
}).compileComponents();

// Add assertion test:
it('should render a help link with the configured docs URL', async () => {
  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const compiled = fixture.nativeElement as HTMLElement;
  const link = compiled.querySelector('a.help-link') as HTMLAnchorElement;
  expect(link).toBeTruthy();
  expect(link.getAttribute('href')).toBe('https://test.docs.url');
  expect(link.getAttribute('target')).toBe('_blank');
  expect(link.getAttribute('rel')).toBe('noopener noreferrer');
});
```

The existing `vi.mock('monaco-editor', ...)` block **must be preserved unchanged**.

### §4 — Test Registry Entry

Append to `tools/test-registry/test-registry.yaml` at the end of `test_cases:`, matching the `retro-10-badl-defaults` manual entry pattern:

```yaml
  - id: retro-10-playground-help-links
    description: 'Verifies Playground header shows a help/docs link opening in a new tab and that the docs URL is provided via ORIGO_DOCS_URL injection token in app.config.ts'
    package: '@origo/playground'
    spec_file: packages/playground/src/app/app.component.html
    type: manual
    affected_stories:
      - retro-10-playground-help-links
    last_result: unknown
    results: {}
```

### Architecture Compliance
- Angular **standalone** component pattern — no NgModules.
- Use `inject()` (not constructor injection) — matches all existing Playground components.
- Styles use `--origo-color-*` CSS custom properties (defined in `packages/playground/src/styles.scss`) — no hard-coded colours except fallback values.
- Test framework: **Vitest** + Angular `TestBed` — preserve `vi.mock('monaco-editor', ...)` in spec.

### File List

| File | Action |
|------|--------|
| `packages/playground/src/app/app.config.ts` | **MODIFY** — add `ORIGO_DOCS_URL` token + provider |
| `packages/playground/src/app/app.component.ts` | **MODIFY** — inject `ORIGO_DOCS_URL` as `docsUrl` |
| `packages/playground/src/app/app.component.html` | **MODIFY** — add `.playground-header` with help link |
| `packages/playground/src/app/app.component.scss` | **MODIFY** — add header row to grid + `.playground-header` styles |
| `packages/playground/src/app/app.component.spec.ts` | **MODIFY** — provide token; add link assertion test |
| `tools/test-registry/test-registry.yaml` | **MODIFY** — append `retro-10-playground-help-links` entry |

## 🗄️ Project Context Reference
- **Project:** origo-design
- **Story:** retro-10-playground-help-links
- **Previous story:** `retro-10-badl-defaults` (see `stories/retro-10-badl-defaults.md` for review patterns)
- **Design tokens in use:** `--origo-color-background`, `--origo-color-text` — `packages/playground/src/styles.scss`

## ✅ Completion Status
- [x] Ultimate context engine analysis completed — comprehensive developer guide created
- [x] Story validated and improved (all 9 issues applied)
- [x] Implementation complete
- [ ] Code review approved

## 📝 Dev Agent Record

### Completion Notes
- Implemented `ORIGO_DOCS_URL` InjectionToken in `app.config.ts`.
- Injected `docsUrl` into `app.component.ts`.
- Added header to `app.component.html` and styles to `app.component.scss`.
- Updated `app.component.spec.ts` with required provider and new tests.
- Appended manual test case to `tools/test-registry/test-registry.yaml`.
- All automated tests pass successfully (`nx test playground`).


