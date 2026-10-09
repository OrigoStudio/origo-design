---
story_id: "1.6"
story_key: 1-6-file-input-and-rich-text-editor
baseline_commit: 5d951a2
---

# Story 1.6: File Input & Rich Text Editor

Status: done

## Story

As a developer,
I want to use specialized form inputs,
So that users can upload files and format text.

## Acceptance Criteria

1. **Given** a form requirement **When** I configure or utilize the delivered components (`FileInput`, `Dropzone`, `RichTextEditor`) **Then** they must bind cleanly to Angular Reactive Forms via `ControlValueAccessor`.
2. **Given** a component instance **When** rendered **Then** it must expose the standard metadata hooks (`permissions`, `rules`, `metadata`, `aria-label`, `aria-describedby`).
3. **Given** a component instance **When** rendered **Then** it must strictly utilize semantic CSS variables (e.g., `var(--origo-color-surface-hover)`) without any hardcoded fallback literals, proving 100% tenant themeability (ADR: AD-6).
4. **Given** a dynamic BADL AST rendering lifecycle **When** children are nested **Then** the components must expose `vc = viewChild.required('vc', { read: ViewContainerRef })` and render `<ng-container #vc></ng-container>` to support the child rendering substrate.
5. **Given** the Definition of Done **When** the story is completed **Then** all new primitives must be registered in `packages/angular-renderer/src/lib/primitives.provider.ts`, exported from `packages/angular-renderer/src/index.ts`, and test suites must be registered in `tools/test-registry/test-registry.yaml`.

## ⚠️ Critical: Existing Code — Read Before Writing Anything

### NEW COMPONENTS TO CREATE
- `FileInputComponent` -> `packages/angular-renderer/src/components/primitives/file-input/` (Registry key: `'FileInput'`)
- `DropzoneComponent` -> `packages/angular-renderer/src/components/primitives/dropzone/` (Registry key: `'Dropzone'`)
- `RichTextEditorComponent` -> `packages/angular-renderer/src/components/primitives/rich-text-editor/` (Registry key: `'RichTextEditor'`)

### EXISTING COMPONENTS / FILES TO UPDATE
- `packages/angular-renderer/src/lib/primitives.provider.ts`: Register `FileInputComponent`, `DropzoneComponent`, `RichTextEditorComponent` in `provideOrigo9Primitives()`.
- `packages/angular-renderer/src/index.ts`: Export all 3 components.
- `tools/test-registry/test-registry.yaml`: Register unit test cases for all 3 components under `@origo/angular-renderer`.

## Tasks / Subtasks

- [ ] **CREATE `FileInputComponent`**
  - [ ] Define `FileInputProps` (`multiple`, `accept`, `maxFileSize`, `uploadUrl`, metadata hooks).
  - [ ] Define Event Outputs: `fileSelect`, `fileRemove`, `fileError`, `clear`, `focus`, `blur`, `uploadStart`, `uploadProgress`, `uploadSuccess`, `uploadError`.
  - [ ] Implement `contractSchema`, `OrigoAdapter<FileInputProps>`, and `ContainerComponent` (`vc` ViewContainerRef).
  - [ ] Implement `ControlValueAccessor` (use `NG_VALUE_ACCESSOR` provider with `forwardRef`).
  - [ ] Sync native `<input type="file">` change events to form state via `onChange(files)` and emit `fileSelect`.
  - [ ] Implement XHR upload logic to `uploadUrl` emitting progress and success/error lifecycle events.
  - [ ] Styling: Use CSS logical properties.

- [ ] **CREATE `DropzoneComponent`**
  - [ ] Define `DropzoneProps` (`multiple`, `accept`, `maxFileSize`, `uploadUrl`, metadata hooks).
  - [ ] Define Event Outputs: `fileSelect`, `fileRemove`, `fileError`, `clear`, `focus`, `blur`, `uploadStart`, `uploadProgress`, `uploadSuccess`, `uploadError`.
  - [ ] Implement `contractSchema`, `OrigoAdapter<DropzoneProps>`, and `ContainerComponent`.
  - [ ] Implement `ControlValueAccessor` with `NG_VALUE_ACCESSOR` provider.
  - [ ] Implement drag-and-drop file upload behavior (`dragover`, `dragleave`, `drop` event handling). Emit `fileSelect` on drop.
  - [ ] Implement XHR upload logic to `uploadUrl` emitting progress and success/error lifecycle events.
  - [ ] Styling: Map `dragover` states explicitly to AD-6 tokens (e.g., `var(--origo-color-surface-hover)`, `var(--origo-color-border-focus)`). No hardcoded HEX.

- [ ] **CREATE `RichTextEditorComponent`**
  - [ ] Define `RichTextEditorProps` (`toolbar`, metadata hooks).
  - [ ] Implement `contractSchema`, `OrigoAdapter<RichTextEditorProps>`, and `ContainerComponent`.
  - [ ] Implement `ControlValueAccessor` with `NG_VALUE_ACCESSOR` provider.
  - [ ] Sync internal editor value to form control, ensuring no infinite loops on `writeValue()`.
  - [ ] Styling: Use CSS logical properties.

- [ ] **UPDATE Registrations, Exports, & Tests**
  - [ ] Register in `primitives.provider.ts` and export from `index.ts`.
  - [ ] Write unit specs for all 3 components covering Shadow DOM piercing and `provideZonelessChangeDetection()`.
  - [ ] Register all specs in `tools/test-registry/test-registry.yaml`.

## Dev Notes

### Architecture & Previous Story Intelligence
| Category | Requirement |
|---|---|
| **Child Substrate** | From 1.5 learnings: All components **MUST** implement `ContainerComponent`, declare `vc = viewChild.required('vc', { read: ViewContainerRef })`, and render `<ng-container #vc></ng-container>`. Omitting this breaks nested component rendering in BADL. |
| **Angular Forms** | Custom inputs must provide `NG_VALUE_ACCESSOR` using `forwardRef(() => ComponentClass)` and implement `ControlValueAccessor` (`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`). |
| **Tokens (AD-6)** | ❌ Forbidden: `border: 1px solid var(--origo-color-border-default, #ccc);`<br>✅ Required: `border: 1px solid var(--origo-color-border-default);` |
| **Testing** | Always use `provideZonelessChangeDetection()` and pierce Shadow DOM: `const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;`. |
| **Dependencies** | (AD-4) Import only `@origostudio/core` + Angular SDK — no cross-renderer imports. |

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6]

### Review Findings

- [x] [Review][Decision] Deprecated document.execCommand in Shadow DOM — document.execCommand fails across Shadow DOM boundaries and is deprecated. How should we replace the rich text formatting logic? (Custom engine vs 3rd party lib)
- [x] [Review][Patch] XSS Vulnerability via Unsanitized innerHTML in RichTextEditorComponent [packages/angular-renderer/src/components/primitives/rich-text-editor/rich-text-editor.component.html:14]
- [x] [Review][Patch] Caret Reset and Focus Collapse on Keystroke in RichTextEditorComponent [packages/angular-renderer/src/components/primitives/rich-text-editor/rich-text-editor.component.ts:95]
- [x] [Review][Patch] Unmanaged XMLHttpRequest bypassing Angular HTTP and Zoneless Change Detection [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:141]
- [x] [Review][Patch] Invisible Input Overlay Blocks Content Projection in DropzoneComponent [packages/angular-renderer/src/components/primitives/dropzone/dropzone.component.scss:18]
- [x] [Review][Patch] Violent Drag-and-Drop State Flickering on dragleave in DropzoneComponent [packages/angular-renderer/src/components/primitives/dropzone/dropzone.component.ts:121]
- [x] [Review][Patch] Failure to Reset Native Input Prevents Re-Selection [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:86]
- [x] [Review][Patch] ControlValueAccessor Desynchronization on Form Reset [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:86]
- [x] [Review][Patch] Dead Output Event Declarations (clear and fileRemove) [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:65]
- [x] [Review][Patch] Completely Unstyled FileInputComponent [packages/angular-renderer/src/components/primitives/file-input/file-input.component.scss:1]
- [x] [Review][Patch] Physical CSS and Hardcoded Motion Literals [packages/angular-renderer/src/components/primitives/dropzone/dropzone.component.scss:11]
- [x] [Review][Patch] Missing aria-label and aria-describedby Metadata Hooks [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:662]
- [x] [Review][Patch] Dead Contract Metadata and Missing coerceContractProps [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts]
- [x] [Review][Patch] Missing File Type/Extension Validation on drop in DropzoneComponent [packages/angular-renderer/src/components/primitives/dropzone/dropzone.component.ts:148]
- [x] [Review][Patch] Missing provideZonelessChangeDetection and Superficial Unit Tests [packages/angular-renderer/src/components/primitives/file-input/file-input.component.spec.ts:583]
- [x] [Review][Patch] Empty FileList handling overwrites this.files [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:108]
- [x] [Review][Patch] maxFileSize=0 constraint bypassed [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:114]
- [x] [Review][Patch] Empty file emits NaN progress and Timeout/abort hanging [packages/angular-renderer/src/components/primitives/file-input/file-input.component.ts:151]
- [x] [Review][Patch] Non-array toolbar prop crash [packages/angular-renderer/src/components/primitives/rich-text-editor/rich-text-editor.component.ts:62]
- [x] [Review][Patch] Copy-Pasted Descriptions in Test Registry [tools/test-registry/test-registry.yaml:1224]
- [x] [Review][Defer] Unrelated Scope Creep in Diff [various specs] — deferred, pre-existing
- [x] [Review][Defer] Negative column breakpoint in GridComponent [packages/angular-renderer/src/components/primitives/grid/grid.component.ts:83] — deferred, pre-existing
