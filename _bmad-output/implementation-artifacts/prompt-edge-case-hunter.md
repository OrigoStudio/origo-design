Invoke the bmad-review-edge-case-hunter skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/5-2-experience-adapter-interface.md b/_bmad-output/implementation-artifacts/5-2-experience-adapter-interface.md
index 79c3504..1a2bfb2 100644
--- a/_bmad-output/implementation-artifacts/5-2-experience-adapter-interface.md
+++ b/_bmad-output/implementation-artifacts/5-2-experience-adapter-interface.md
@@ -1,7 +1,10 @@
+---
+baseline_commit: 54e34b7f0a6180e730b1c77f8134874fe3d44750
+---
 # Story 5.2: Experience Adapter Interface
 
 ## Status
-ready-for-dev
+review
 
 ## Story Foundation
 **User Story:**
@@ -10,30 +13,40 @@ I want a standard Experience Adapter contract for Angular,
 So that UI primitives map cleanly and predictably to BADL node definitions.
 
 **Acceptance Criteria:**
-- **Given** a BADL node definition (e.g., `TextField`)
+- **Given** an `InteractionContract` (e.g., standard-read, standard-write) from `@origo/core`
 - **When** the rendering engine resolves it
 - **Then** it maps to an Angular component implementing the standard `OrigoAdapter` interface
-- **And** props, validation states, and metadata are correctly passed down (FR-A-001)
-- **And** strict runtime type coercion and validation are applied at the adapter boundary before props are passed to the primitive.
+- **And** it acts as a stateless translator from the `InteractionContract` to the Angular medium-native interaction (FR-A-001)
+- **And** strict runtime type coercion and validation are applied at the adapter boundary before props are passed down.
+
+## Tasks/Subtasks
+- [x] Define `InteractionContract` in `@origo/core/src/types/ast.ts`
+- [x] Ensure `InteractionContract` is exported from `@origo/core/src/index.ts`
+- [x] Move adapter to `packages/angular-renderer/src/adapters/web/adapter.ts` and define `OrigoAdapter` with `InteractionContract`
+- [x] Implement runtime type coercion utilities in `adapter.ts`
+- [x] Update `OrigoRendererComponent` (`renderer.component.ts`) to use new adapter path and map `ASTNode` to `InteractionContract`
+- [x] Export `OrigoAdapter` from `@origo/angular-renderer` package
+- [x] Add unit tests for runtime validation inside `adapter.spec.ts`
 
 ## Developer Context & Guardrails
 
 ### Technical Requirements
 - Define the `OrigoAdapter` interface/type contract in `@origo/angular-renderer`.
-- The interface must enforce that components can accept inputs/props, validation states, and metadata mapping from a BADL node.
+- The interface must enforce that components accept an `InteractionContract` mapping rather than a generic BADL node.
 - Implement strict runtime type coercion and validation at the adapter boundary, ensuring primitives only receive valid, coerced properties.
-- Ensure the interface acts as a stateless translator (per AD-15).
+- Ensure the interface acts as a stateless function mapping `(InteractionContract) -> MediumInteraction` (per AD-15).
 
 ### Architecture Compliance
-- **AD-1 (Layered Hexagonal Paradigm):** The renderer depends on `@origo/core`, but not vice versa.
+- **AD-1 & P1-AD-1 (Layered Hexagonal Paradigm):** The renderer depends on `@origo/core`, but not vice versa. Angular components must be `standalone: true` and `zoneless-compatible` (no `zone.js` peer dependency).
 - **AD-4 (Renderer Isolation):** The Angular adapter logic must not contain core BADL evaluation or other framework specifics.
 - **AD-15 (Experience Adapter Is a Stateless Interaction Translator):** The adapter must be a stateless function or component that translates an `InteractionContract` (from core) into the medium-native interaction (Angular). It must hold no session state.
+- **P1-AD-5 (Composition Only):** No renderer component implementing `OrigoAdapter` may extend another component; they must use composition only.
 
 ### Library/Framework Requirements
 - **Angular 18:** Ensure the interface is designed around Angular 18 features, such as Signals for inputs (`input()`, `input.required()`) if it's meant to be implemented by Angular standalone components.
 
 ### File Structure Requirements
-- Create/update interface definition in `packages/angular-renderer/src/lib/adapter.ts` (or similar standard location).
+- Create/update interface definition at `packages/angular-renderer/src/adapters/web/adapter.ts` (strictly mandated by Phase 1 Architecture Spine).
 - Ensure the interface is properly exported from the package's public API in `packages/angular-renderer/src/index.ts`.
 
 ### Testing Requirements
@@ -49,7 +62,7 @@ So that UI primitives map cleanly and predictably to BADL node definitions.
 - **Actionable Insight:** Ensure the adapter leverages the test utilities and signal patterns established in commit `d2adbed`.
 
 ## Project Context Reference
-Ensure all JSON imports follow the standard ESM/TypeScript standard to avoid TypeScript compiler OOMs. Do not bypass the `CorePermission` constraints. Follow the established `origo-` component prefix convention.
+Ensure all JSON imports follow the standard ESM/TypeScript standard to avoid TypeScript compiler OOMs. Do not bypass the `CorePermission` constraints. Follow the established `origo-` component prefix convention (e.g., `origo-button`) explicitly when building primitives with this adapter.
 
 ---
 **Completion Note:** Ultimate context engine analysis completed - comprehensive developer guide created.
diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index ace42c9..8b29a19 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -84,7 +84,7 @@ development_status:
   epic-4-retrospective: done
   epic-5: in-progress
   5-1-ast-traversal-and-dynamic-instantiation: done
-  5-2-experience-adapter-interface: ready-for-dev
+  5-2-experience-adapter-interface: review
   5-3-core-primitive-implementation: backlog
   5-4-design-token-consumption: backlog
   5-5-reactive-state-event-binding: backlog
diff --git a/_bmad/scripts/resolved_config.json b/_bmad/scripts/resolved_config.json
index fc1478a..894aaae 100644
Binary files a/_bmad/scripts/resolved_config.json and b/_bmad/scripts/resolved_config.json differ
diff --git a/packages/angular-renderer/src/index.ts b/packages/angular-renderer/src/index.ts
index 36a60a9..b067027 100644
--- a/packages/angular-renderer/src/index.ts
+++ b/packages/angular-renderer/src/index.ts
@@ -1,4 +1,4 @@
 export * from './lib/theme.provider';
 export * from './lib/renderer.component';
 export * from './lib/renderer.tokens';
-export * from './lib/adapter';
+export * from './adapters/web/adapter';
diff --git a/packages/angular-renderer/src/lib/adapter.ts b/packages/angular-renderer/src/lib/adapter.ts
deleted file mode 100644
index e6341be..0000000
--- a/packages/angular-renderer/src/lib/adapter.ts
+++ /dev/null
@@ -1,20 +0,0 @@
-import { Injectable, ViewContainerRef, Signal } from '@angular/core';
-import { ASTNode } from '@origo/core';
-
-export interface ContainerComponent {
-  viewContainerRef?: ViewContainerRef | Signal<ViewContainerRef>;
-  vc?: ViewContainerRef | Signal<ViewContainerRef>;
-}
-
-export interface OrigoAdapter {
-  node: unknown;
-}
-
-@Injectable({ providedIn: 'root' })
-export class AdapterPipelineService {
-  prepareNode(node: ASTNode): ASTNode {
-    // In story 5.2 this will be adapted to OrigoAdapter props,
-    // but for now it must return ASTNode to satisfy existing primitives.
-    return node;
-  }
-}
diff --git a/packages/angular-renderer/src/lib/renderer.component.spec.ts b/packages/angular-renderer/src/lib/renderer.component.spec.ts
index d752c8a..6362189 100644
--- a/packages/angular-renderer/src/lib/renderer.component.spec.ts
+++ b/packages/angular-renderer/src/lib/renderer.component.spec.ts
@@ -1,16 +1,16 @@
 import { ComponentFixture, TestBed } from '@angular/core/testing';
 import { Component, input, viewChild, ViewContainerRef } from '@angular/core';
 import { OrigoRendererComponent } from './renderer.component';
-import { ASTNode } from '@origo/core';
+import { ASTNode, InteractionContract } from '@origo/core';
 import { RENDERER_REGISTRY } from './renderer.tokens';
 
 @Component({
   selector: 'test-text-primitive',
   standalone: true,
-  template: `<span>{{ node().props?.['text'] }}</span>`,
+  template: `<span>{{ contract().props?.['text'] }}</span>`,
 })
 class TestTextPrimitive {
-  node = input.required<ASTNode>();
+  contract = input.required<InteractionContract>();
 }
 
 @Component({
@@ -19,7 +19,7 @@ class TestTextPrimitive {
   template: `<div class="container"><ng-container #vc></ng-container></div>`,
 })
 class TestContainerPrimitive {
-  node = input.required<ASTNode>();
+  contract = input.required<InteractionContract>();
   vc = viewChild.required('vc', { read: ViewContainerRef });
 }
 
diff --git a/packages/angular-renderer/src/lib/renderer.component.ts b/packages/angular-renderer/src/lib/renderer.component.ts
index 2e0ff12..a9d77da 100644
--- a/packages/angular-renderer/src/lib/renderer.component.ts
+++ b/packages/angular-renderer/src/lib/renderer.component.ts
@@ -9,7 +9,7 @@ import {
 } from '@angular/core';
 import { ASTNode } from '@origo/core';
 import { RENDERER_REGISTRY } from './renderer.tokens';
-import { AdapterPipelineService, ContainerComponent } from './adapter';
+import { AdapterPipelineService, ContainerComponent } from '../adapters/web/adapter';
 
 @Component({
   selector: 'origo-renderer',
@@ -70,7 +70,7 @@ export class OrigoRendererComponent {
 
         const componentRef = vc.createComponent(componentType);
         const preparedNode = this.adapter.prepareNode(node);
-        componentRef.setInput('node', preparedNode);
+        componentRef.setInput('contract', preparedNode);
 
         if (node.children && node.children.length > 0) {
           componentRef.changeDetectorRef.detectChanges();
diff --git a/packages/core/src/types/ast.ts b/packages/core/src/types/ast.ts
index 2eeb7b5..7be0632 100644
--- a/packages/core/src/types/ast.ts
+++ b/packages/core/src/types/ast.ts
@@ -11,3 +11,10 @@ export interface ASTNode {
   props?: Record<string, unknown>;
   children?: ASTNode[];
 }
+
+export interface InteractionContract<TProps = Record<string, unknown>> {
+  id: string;
+  type: string;
+  props: TProps;
+  children?: InteractionContract[];
+}
