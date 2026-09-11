Invoke the `bmad-review-edge-case-hunter` skill on this diff:

diff --git a/packages/playground/src/app/app.component.spec.ts b/packages/playground/src/app/app.component.spec.ts
index 00e1363..2272514 100644
--- a/packages/playground/src/app/app.component.spec.ts
+++ b/packages/playground/src/app/app.component.spec.ts
@@ -4,7 +4,15 @@ import { BadlEditorComponent } from '../editor/badl-editor.component';
 import { vi } from 'vitest';
 
 vi.mock('monaco-editor', () => ({
-  editor: { create: vi.fn(), createModel: vi.fn() },
+  editor: {
+    create: vi.fn().mockReturnValue({
+      dispose: vi.fn(),
+      onDidChangeModelContent: vi.fn(),
+      setValue: vi.fn(),
+      getValue: vi.fn(),
+    }),
+    createModel: vi.fn(),
+  },
   Uri: { parse: vi.fn() },
   languages: {
     json: {
diff --git a/packages/playground/src/editor/badl-editor.component.spec.ts b/packages/playground/src/editor/badl-editor.component.spec.ts
index 825f238..34cca12 100644
--- a/packages/playground/src/editor/badl-editor.component.spec.ts
+++ b/packages/playground/src/editor/badl-editor.component.spec.ts
@@ -1,4 +1,4 @@
-import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
 import { BadlEditorComponent } from './badl-editor.component';
 import { NgZone, ComponentRef } from '@angular/core';
 import { registerBadlSchema } from './schema-registry';
@@ -10,8 +10,14 @@ vi.mock('./schema-registry', () => ({
 
 // Mock monaco editor create and dispose
 const mockDispose = vi.fn();
+const mockOnDidChangeModelContent = vi.fn();
+const mockSetValue = vi.fn();
+const mockGetValue = vi.fn().mockReturnValue('{}');
 const mockCreate = vi.fn().mockReturnValue({
   dispose: mockDispose,
+  onDidChangeModelContent: mockOnDidChangeModelContent,
+  setValue: mockSetValue,
+  getValue: mockGetValue,
 });
 const mockCreateModel = vi.fn().mockReturnValue({});
 
@@ -41,6 +47,7 @@ describe('BadlEditorComponent', () => {
 
     // reset mocks
     vi.clearAllMocks();
+    localStorage.clear();
   });
 
   it('should create', () => {
@@ -78,4 +85,57 @@ describe('BadlEditorComponent', () => {
 
     expect(mockDispose).toHaveBeenCalled();
   });
+
+  describe('State Persistence', () => {
+    it('should initialize with localStorage draft if valid', () => {
+      localStorage.setItem('origo_playground_draft', JSON.stringify({ valid: 'json' }));
+      componentRef.setInput('initialValue', '{}');
+      fixture.detectChanges();
+
+      expect(mockCreateModel).toHaveBeenCalledWith('{"valid":"json"}', 'json', 'parsed-uri');
+    });
+
+    it('should fallback to initialValue if localStorage has invalid JSON', () => {
+      localStorage.setItem('origo_playground_draft', 'invalid-json');
+      componentRef.setInput('initialValue', '{}');
+      fixture.detectChanges();
+
+      expect(mockCreateModel).toHaveBeenCalledWith('{}', 'json', 'parsed-uri');
+    });
+
+    it('should fallback to initialValue if localStorage access throws SecurityError', () => {
+      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
+        throw new DOMException('SecurityError', 'SecurityError');
+      });
+      componentRef.setInput('initialValue', '{}');
+      fixture.detectChanges();
+
+      expect(mockCreateModel).toHaveBeenCalledWith('{}', 'json', 'parsed-uri');
+      getItemSpy.mockRestore();
+    });
+
+    it('should debounce saving to localStorage', async () => {
+      vi.useFakeTimers();
+      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
+      componentRef.setInput('initialValue', '{}');
+      fixture.detectChanges();
+
+      // Simulate editor content change
+      mockGetValue.mockReturnValue('{"new":"content"}');
+      const changeCallback = mockOnDidChangeModelContent.mock.calls[0][0];
+      changeCallback();
+      fixture.detectChanges();
+      TestBed.flushEffects();
+
+      // Timer is 500ms
+      await vi.advanceTimersByTimeAsync(100);
+      expect(setItemSpy).not.toHaveBeenCalled();
+
+      await vi.advanceTimersByTimeAsync(400); // Total 500
+      expect(setItemSpy).toHaveBeenCalledWith('origo_playground_draft', '{"new":"content"}');
+
+      setItemSpy.mockRestore();
+      vi.useRealTimers();
+    });
+  });
 });
diff --git a/packages/playground/src/editor/badl-editor.component.ts b/packages/playground/src/editor/badl-editor.component.ts
index 69bb956..f0b31e4 100644
--- a/packages/playground/src/editor/badl-editor.component.ts
+++ b/packages/playground/src/editor/badl-editor.component.ts
@@ -8,6 +8,8 @@ import {
   output,
   NgZone,
   inject,
+  signal,
+  effect,
 } from '@angular/core';
 import * as monaco from 'monaco-editor';
 import './monaco-environment'; // MUST be first monaco import — side-effect only
@@ -29,15 +31,45 @@ export class BadlEditorComponent implements AfterViewInit, OnDestroy {
 
   private editor: monaco.editor.IStandaloneCodeEditor | null = null;
   private zone = inject(NgZone);
+  private editorContent = signal<string>('');
+
+  constructor() {
+    effect(onCleanup => {
+      const content = this.editorContent();
+      if (!content) return; // Don't save empty content on initial init
+
+      const timer = setTimeout(() => {
+        try {
+          localStorage.setItem('origo_playground_draft', content);
+        } catch (e) {
+          console.warn('Could not save draft to local storage (Quota or Security Error)', e);
+        }
+      }, 500);
+
+      onCleanup(() => clearTimeout(timer));
+    });
+  }
 
   ngAfterViewInit(): void {
     registerBadlSchema();
     this.zone.runOutsideAngular(() => {
       if (!this.editorContainer?.nativeElement) return;
       try {
+        let savedState = this.initialValue();
+        try {
+          const draft = localStorage.getItem('origo_playground_draft');
+          if (draft) {
+            // Validate it's valid JSON to prevent crash loops
+            JSON.parse(draft);
+            savedState = draft;
+          }
+        } catch (e) {
+          console.warn('Could not restore playground draft, falling back to initialValue', e);
+        }
+
         this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
           model: monaco.editor.createModel(
-            this.initialValue(),
+            savedState,
             'json',
             monaco.Uri.parse('inmemory://model/domain.json')
           ),
@@ -48,11 +80,12 @@ export class BadlEditorComponent implements AfterViewInit, OnDestroy {
         });
 
         // Initial compilation trigger
-        this.editorContentChange.emit(this.initialValue());
+        this.editorContentChange.emit(savedState);
 
         this.editor.onDidChangeModelContent(() => {
           const val = this.editor?.getValue();
           if (val !== undefined) {
+            this.editorContent.set(val);
             this.editorContentChange.emit(val);
           }
         });
