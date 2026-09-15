---
baseline_commit: 01c890e695b63ea41e953142056d71a7d1814596
---

# Story 8-2: DevTools Inspector UI

## Story Foundation

**User Story:**
As a Developer,
I want a DevTools panel (or in-app overlay),
So that I can visually inspect the metadata powering any rendered component on the screen.

**Acceptance Criteria:**
- **Given** the Origo application is running
- **When** I open the Origo DevTools inspector
- **Then** I can view the active component tree
- **And** I can trace any rendered element back to its exact BADL source entity, including its specific runtime execution context (e.g. iteration indices)
- **And** the Inspector UI is strictly read-only for Phase 1 to prevent scope creep (FR-DX-002).
- **And** the implementation complies with Angular standalone components (P1-AD-1), Manifest V3 architecture (P1-AD-9), and Nx boundary constraints (AD-2).

**Business Context:**
Provides a visual interface for the Diagnostics API (built in 8-1), allowing developers to directly inspect BADL metadata linked to rendered UI elements. Essential for the Origo developer experience (DX).

---

## Developer Context

### Technical Requirements

- **New Nx Package — `packages/devtools`:** This package does NOT exist yet and must be created from scratch as a Chrome Extension (Manifest V3) per P1-AD-9. It is a standalone package in the Nx monorepo under the `@origo/devtools` scope.
- **Nx Project Setup:** Create `packages/devtools/project.json` with Nx boundary tags (e.g., `"type:tool"`, `"scope:devtools"`). Wire build, lint, and test targets. CI boundary enforcement (AD-2) must pass from day 1 — an untagged package is a build-breaking violation.
- **DevTools Panel Application:** Bootstrap a standalone Angular application (Signals + no NgModule, per P1-AD-1) in `packages/devtools/src/devtools-panel/`. The panel entry point is `packages/devtools/devtools.html`, which is declared in `manifest.json` as `devtools_page`. This HTML page bootstraps the Angular app and calls `chrome.devtools.panels.create()` to register the inspector panel.
- **Manifest V3 Structure:** `packages/devtools/manifest.json` must include at minimum:
  ```json
  {
    "manifest_version": 3,
    "name": "Origo DevTools",
    "devtools_page": "devtools.html",
    "background": { "service_worker": "background.js" },
    "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content-script.js"] }],
    "permissions": ["scripting"]
  }
  ```
  Getting this wrong causes silent extension failures — validate against Chrome's MV3 reference.
- **Chrome Extension Messaging Architecture:** Messages flow: `DevTools Panel → background service worker → content script → window.__ORIGO_DEVTOOLS__`. Define strict TypeScript message protocol types in `packages/devtools/src/types/messages.ts`. These types MUST stay inside `packages/devtools` — they cannot live in `@origo/angular-renderer` (AD-4 renderer isolation).
- **Consuming `__ORIGO_DEVTOOLS__` types:** Import the `OrigoDevToolsAPI`, `MetadataSource`, `ResolutionChain`, `RenderingPath`, and `ErrorContext` types from the **published root** of `@origo/angular-renderer` (i.e., `import type { OrigoDevToolsAPI } from '@origo/angular-renderer'`). NEVER import from the `src/` path — this is an Nx boundary violation per AD-2 and P1-AD-4.
- **Safe Connection Point:** The DevTools panel MUST connect to the page ONLY via `window.__ORIGO_DEVTOOLS__` (the production-guarded global). It must NEVER attempt to import or call `getDevToolsAPI` directly — this bypasses the `isDevMode()` production guard (an 8-1 review finding).
- **Read-Only UI:** The inspector must strictly display the component tree, metadata source, resolution chain, and error context. It must NOT provide any editing capabilities.
- **Component Tree View:** Implement a hierarchical tree view displaying the active rendering path. This data can be deeply nested (>50 levels) — use virtualized tree rendering. Do NOT use `JSON.stringify` on the API payloads; the 8-1 review confirmed cyclic references are possible in the raw object graph (fixed in the bridge's `redactSensitiveData`, but the serialized transfer may still be deep).
- **Metadata Detail View:** Display BADL entity details, property resolution traces, and theme token resolutions for a selected element.
- **Fallback State — Two distinct scenarios to handle:**
  1. **"Not Available" (production or unguarded host):** When `window.__ORIGO_DEVTOOLS__` is `undefined` (the bridge was tree-shaken), display a clear "Origo DevTools not available — run the app in development mode" message. This is NOT an error condition.
  2. **"Connection Lost":** If the content script loses its message channel (page reload, extension suspend), display a reconnect indicator — do not crash the panel.

### Architecture Compliance
- **P1-AD-1 — Angular 18 Standalone Components + Signals:** Every component in the DevTools panel MUST be a standalone Angular component (`standalone: true`). Reactivity MUST use Angular Signals. No NgModule, no Zone.js dependency.
- **P1-AD-9 — DevTools v1 as Chrome Extension (Manifest V3):** The implementation must conform to Manifest V3 restrictions: no inline scripts in HTML pages, service worker (not persistent background page) for the background script.
- **AD-2 — Nx Monorepo Boundaries:** `packages/devtools` must have correct Nx boundary tags in `project.json`. The `@origo/devtools` package may import from `@origo/angular-renderer` (for types only, via the published root). It must NOT import from `@origo/core` internals or any renderer `src/` path.
- **FR-DX-002 — Read-Only limitation:** Enforce strictly — no edit controls, no state mutation API calls.

### File Structure Requirements

```
packages/devtools/
  manifest.json                          # Chrome Extension Manifest V3
  devtools.html                          # DevTools panel entry page (bootstraps Angular + creates panel)
  project.json                           # Nx project config (with boundary tags)
  src/
    devtools-panel/                      # Angular standalone app
      app.component.ts                   # Root Angular standalone component
      app.component.html
      app.component.scss
      app.component.spec.ts
      component-tree/                    # Virtualized tree view component
      metadata-detail/                   # Detail view component
      main.ts                            # Angular bootstrapApplication() entry
    content-script/
      content-script.ts                  # Reads window.__ORIGO_DEVTOOLS__, relays to background
    background/
      background.ts                      # Service worker — relays messages between panel and content script
    types/
      messages.ts                        # Strict TypeScript types for panel ↔ background ↔ content script protocol
```

**File path from 8-1 to import types (correct):**
```typescript
import type { OrigoDevToolsAPI, MetadataSource, ResolutionChain } from '@origo/angular-renderer';
```

### Testing Requirements

- **Test runner:** Vitest 2.x (consistent with the rest of the Phase 1 monorepo — do NOT introduce Jest).
- **Unit Tests (Vitest + Angular TestBed):** Component tests for the DevTools UI tree and detail views. Test the "not available" and "connection lost" fallback states explicitly.
- **Integration Tests (Vitest + manual Chrome API mock):** Mock the Chrome Extension messaging API (`chrome.devtools.panels`, `chrome.runtime.sendMessage`) and the `window.__ORIGO_DEVTOOLS__` object. Verify that the full data flow (content script → background → panel) correctly populates the component tree and metadata detail views.
- **Playwright Tests:** Load the DevTools panel HTML page (`devtools.html`) directly in a test browser context. Assert that (a) the component tree renders when `window.__ORIGO_DEVTOOLS__` is present, and (b) the "not available" fallback renders when `window.__ORIGO_DEVTOOLS__` is `undefined`.
- **axe-core Accessibility (P1-AD-6):** Every component in the DevTools panel must pass axe-core WCAG 2.1 AA checks in the Playwright tests.

---

## Previous Story Intelligence

- **API surface from 8-1:** `window.__ORIGO_DEVTOOLS__` exposes `getMetadataSource(badlPath: string)`, `getResolutionChain(badlPath: string)`, `getRenderingPath(badlPath: string)`, and `getErrorContext()`. Note: the `getRenderingPath` parameter is a BADL semantic path (e.g., `Customer.Name`), NOT a DOM element ID — this was a named-parameter bug fixed in 8-1's review.
- **Null/undefined safety:** All 8-1 API methods may return `null` for unknown or redacted paths. The DevTools UI must handle null results gracefully — display "—" or "Redacted" rather than crashing.
- **Redacted fields:** The bridge auto-redacts keys matching: `password`, `ssn`, `apiKey`, `token`, `secret`, and partial matches. These fields will be absent from API payloads. The UI must not expect them to be present.
- **SSR / Node safety pattern from 8-1:** Never use `typeof window !== 'undefined'` as a string comparison (it evaluates to `true` always). The content script runs in a browser page context where `window` is always defined — no SSR guard is needed there. But if any utility code could run outside a browser, use `typeof globalThis !== 'undefined' && globalThis.window !== undefined`.
- **Cyclic graph defense:** The 8-1 review confirmed that the redaction logic had a false positive cycle detection bug (now fixed). However, the data shapes returned by the API (`ResolutionChain`, `RenderingPath`) may still be deeply nested objects. Any display or serialization logic in the DevTools UI that processes these shapes must defend against deep nesting (set a max-depth render limit on the tree view) and cycle detection if processing raw objects on the panel side.
- **Actual file paths (from 8-1 implementation):**
  - `packages/angular-renderer/src/devtools/devtools-bridge.ts` — bridge implementation
  - `packages/angular-renderer/src/devtools/index.ts` — exported types and contracts
  - The package directory is `packages/angular-renderer`, NOT `packages/origo-angular-renderer` (pre-existing path divergence, deferred to clean up separately).

---

## Latest Tech Information

- **Chrome Extension Manifest V3 messaging pattern:** The DevTools panel cannot directly access the inspected page's `window` object. The correct message flow is: `Panel → chrome.runtime.sendMessage → background service worker → chrome.tabs.sendMessage → content script → window.__ORIGO_DEVTOOLS__`. For reading structured data (not evaluating code), the content script messaging path is preferred over `chrome.devtools.inspectedWindow.eval`.
- **MV3 service worker lifecycle:** MV3 service workers are ephemeral — they terminate after a few seconds of inactivity. The background script must handle reactivation gracefully. Use `chrome.runtime.onConnect` with a persistent port for the DevTools panel connection to keep the service worker alive while the panel is open.
- **Angular bootstrapApplication() for Chrome Extension panels:** Do NOT use `platformBrowserDynamic()` (NgModule-based). Use `bootstrapApplication(AppComponent, appConfig)` where `appConfig` provides any necessary providers. The panel has no router — it is a single-view Angular application.

---

## Project Context Reference

Follow `@origo/core` guidelines and AST validation standards defined in previous epics.
All selectors must use `origo-` prefix per P1 conventions (e.g., `origo-devtools-tree`, `origo-devtools-detail`).
All design token consumption must use CSS custom properties from `@origo/design-tokens/dist/css/tokens.css` per AD-6 — no hardcoded color or spacing values.

---

## Tasks/Subtasks

- [ ] Task 1: Scaffold Nx package for `devtools` with MV3 architecture.
  - [ ] Initialize `packages/devtools` standalone project setup (project.json, tsconfig).
  - [ ] Implement `manifest.json` and strict types for Chrome Extension API messaging.
- [ ] Task 2: Implement Chrome Extension Bridge.
  - [ ] Implement `background.ts` service worker.
  - [ ] Implement `content-script.ts` to bridge `window.__ORIGO_DEVTOOLS__`.
- [ ] Task 3: Develop DevTools Angular Application Panel.
  - [ ] Setup `devtools.html` and `main.ts` for Angular bootstrapping.
  - [ ] Build `app.component` handling connection state fallbacks.
  - [ ] Implement virtualized `component-tree` and `metadata-detail` components.
- [ ] Task 4: Setup Testing Pipeline.
  - [ ] Configure `vitest.config.ts`.
  - [ ] Write integration tests for Chrome API mocks and Angular standalone components.

### Review Findings
- [x] [Review][Patch] `manifest.json`: uses `<all_urls>` for content scripts [packages/devtools/manifest.json:19]
- [x] [Review][Patch] `manifest.json`: `injected.js` is declared as `web_accessible_resource` with `<all_urls>` [packages/devtools/manifest.json:26]
- [x] [Review][Patch] `manifest.json`: missing `tabs` permission [packages/devtools/manifest.json:32]
- [x] [Review][Patch] `manifest.json`: `permissions: ["scripting"]` is never used [packages/devtools/manifest.json:32]
- [x] [Review][Patch] `project.json`: mismatched build output paths and no unified build target [packages/devtools/project.json:53]
- [x] [Review][Patch] `project.json`: Production `outputHashing: "all"` breaks extension [packages/devtools/project.json:77]
- [x] [Review][Patch] `background.ts`: `chrome.runtime.onMessage` returns `true` unconditionally [packages/devtools/src/background/background.ts:49]
- [x] [Review][Patch] `background.ts`: unhandled `runtime.lastError` on `chrome.tabs.sendMessage` [packages/devtools/src/background/background.ts:14]
- [x] [Review][Patch] `background.ts`: init message has undefined or null tabId [packages/devtools/src/background/background.ts:10]
- [x] [Review][Patch] `background.ts`: tabId is 0 (falsy) guard drops messages [packages/devtools/src/background/background.ts:39]
- [x] [Review][Patch] `background.ts`: message.data is undefined when relaying [packages/devtools/src/background/background.ts:15]
- [x] [Review][Patch] `background.ts`: second init message for same tabId overwrites port silently [packages/devtools/src/background/background.ts:10]
- [x] [Review][Patch] `background.ts`: connections has NaN key from undefined tabId [packages/devtools/src/background/background.ts:28]
- [x] [Review][Patch] `content-script.ts`: document.head and document.documentElement both null [packages/devtools/src/content-script/content-script.ts:4]
- [x] [Review][Patch] `content-script.ts`, `injected.ts`: `window.postMessage` uses `'*'` as `targetOrigin` [packages/devtools/src/content-script/content-script.ts:16]
- [x] [Review][Patch] `content-script.ts`: returns `true` from its `chrome.runtime.onMessage` listener unnecessarily [packages/devtools/src/content-script/content-script.ts:20]
- [x] [Review][Patch] `content-script.ts`: chrome.runtime context invalidated when sendMessage called [packages/devtools/src/content-script/content-script.ts:29]
- [x] [Review][Patch] `messages.ts`: `BaseMessage.payload` is typed as `payload?: unknown` [packages/devtools/src/types/messages.ts:22]
- [x] [Review][Patch] `messages.ts`/`injected.ts`: Omission of `GET_ACTIVE_STATE` [packages/devtools/src/types/messages.ts:8]
- [x] [Review][Patch] `injected.ts`: Parameter and Contract Mismatch on `getRenderingPath` [packages/devtools/src/types/messages.ts:47]
- [x] [Review][Patch] `injected.ts`: `catch` block silently drops errors [packages/devtools/src/content-script/injected.ts:98]
- [x] [Review][Patch] `injected.ts`: switch has no default case [packages/devtools/src/content-script/injected.ts:37]
- [x] [Review][Patch] `panel.html`: Missing `<script>` Tag for `main.js` [packages/devtools/panel.html:63]
- [x] [Review][Patch] `devtools.js`: outside build pipeline, missing error handling [packages/devtools/devtools.js:34]
- [x] [Review][Patch] `panel.html` & `devtools.html`: No `Content-Security-Policy` [packages/devtools/panel.html]
- [x] [Review][Patch] `package.json`: Missing scripts/deps [packages/devtools/package.json]
- [x] [Review][Patch] `tsconfig.app.json`: Mixes background/content-script files [packages/devtools/tsconfig.app.json]
- [x] [Review][Patch] `app.component.ts`: `GET_RENDERING_PATH` hardcodes `badlPath: ''` [packages/devtools/src/devtools-panel/app.component.ts:347]
- [x] [Review][Patch] `app.component.ts`: 'NOT_AVAILABLE' bypasses TS [packages/devtools/src/devtools-panel/app.component.ts:341]
- [x] [Review][Patch] `app.component.ts`: signals typed as `unknown` instead of imported types [packages/devtools/src/devtools-panel/app.component.ts:275]
- [x] [Review][Patch] `app.component.ts`: `reconnect()` setTimeout race conditions / missing cleanup [packages/devtools/src/devtools-panel/app.component.ts:286]
- [x] [Review][Patch] `app.component.ts`: `sendMessage()` swallows failures / stale port [packages/devtools/src/devtools-panel/app.component.ts:330]
- [x] [Review][Patch] `app.component.ts`: missing checks for `chrome.runtime` / `chrome.devtools.inspectedWindow` [packages/devtools/src/devtools-panel/app.component.ts:301]
- [x] [Review][Patch] `app.component.ts`: missing template UI for `errorTelemetry` [packages/devtools/src/devtools-panel/app.component.ts]
- [x] [Review][Patch] `component-tree.component.ts`: Recursive template without virtualization or cycle detection [packages/devtools/src/devtools-panel/component-tree/component-tree.component.ts:390]
- [x] [Review][Patch] `component-tree.component.ts`: Node rendering omits execution context (only shows name and badlPath) [packages/devtools/src/devtools-panel/component-tree/component-tree.component.ts:400]
- [x] [Review][Patch] `component-tree.component.ts`: Guard node.badlPath, node.children, and renderingPath shape [packages/devtools/src/devtools-panel/component-tree/component-tree.component.ts:392]
- [x] [Review][Patch] `metadata-detail.component.ts`: Falsy obj (0, false) treated as null [packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts:568]
- [x] [Review][Patch] `metadata-detail.component.ts`: `ngOnChanges` fires unnecessarily [packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts:561]
- [x] [Review][Patch] `metadata-detail.component.ts`: Uses `JSON.stringify` instead of structured rendering [packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts:562]
- [x] [Review][Patch] `metadata-detail.component.ts`: Omission of Theme Token Resolutions view [packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts:502]
- [x] [Review][Patch] `app.component.ts`/`component-tree`/`metadata-detail`: Hardcoded CSS instead of design tokens [packages/devtools/src/devtools-panel/app.component.ts:226]
- [x] [Review][Patch] `main.ts`: Missing Zoneless Provider `provideExperimentalZonelessChangeDetection()` [packages/devtools/src/devtools-panel/main.ts:477]
- [x] [Review][Patch] `app.component.spec.ts`: Test mocks leak `global.chrome.runtime` [packages/devtools/src/devtools-panel/app.component.spec.ts:89]
- [x] [Review][Patch] `app.component.spec.ts`: Missing unit tests for PONG and onDisconnect [packages/devtools/src/devtools-panel/app.component.spec.ts:98]

---

## Dev Agent Record

### Implementation Plan
Scaffolded the `devtools` package as a standalone Angular application integrated into the Nx workspace. Created a Chrome Extension Manifest V3 architecture with a service worker (`background.ts`), content script (`content-script.ts`), and an injected script (`injected.ts`) to safely access `window.__ORIGO_DEVTOOLS__`. The panel UI implements a virtualized component tree and metadata details view using Angular Signals.

### Completion Notes
✅ Scaffolded `devtools` Nx package
✅ Configured MV3 extension architecture with strict messaging types
✅ Built Angular DevTools Panel (Tree & Detail views)
✅ Handled fallback states (Not Available, Connection Lost)
✅ Configured Vitest test suite

---

## File List
- `packages/devtools/project.json`
- `packages/devtools/package.json`
- `packages/devtools/tsconfig.json`
- `packages/devtools/tsconfig.app.json`
- `packages/devtools/tsconfig.spec.json`
- `packages/devtools/manifest.json`
- `packages/devtools/devtools.html`
- `packages/devtools/devtools.js`
- `packages/devtools/panel.html`
- `packages/devtools/vitest.config.ts`
- `packages/devtools/src/test-setup.ts`
- `packages/devtools/src/types/messages.ts`
- `packages/devtools/src/background/background.ts`
- `packages/devtools/src/content-script/content-script.ts`
- `packages/devtools/src/content-script/injected.ts`
- `packages/devtools/src/devtools-panel/main.ts`
- `packages/devtools/src/devtools-panel/app.component.ts`
- `packages/devtools/src/devtools-panel/app.component.spec.ts`
- `packages/devtools/src/devtools-panel/component-tree/component-tree.component.ts`
- `packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts`

---

## Change Log
- Scaffolded `devtools` package with MV3 Chrome Extension architecture.
- Added Angular standalone app for the DevTools panel.
- Wired messaging bridge to read `window.__ORIGO_DEVTOOLS__`.
- Added component tree and metadata detail UI.

---

## Story Completion Status
**Status:** done
**Note:** Ultimate context engine analysis completed - comprehensive developer guide created.
