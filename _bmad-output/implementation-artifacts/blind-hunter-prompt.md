Invoke the `bmad-review-adversarial-general` skill on this diff:

```diff
diff --git a/packages/playground/src/preview/preview-root.component.spec.ts b/packages/playground/src/preview/preview-root.component.spec.ts
index 84b8a3e..ae8a89c 100644
--- a/packages/playground/src/preview/preview-root.component.spec.ts
+++ b/packages/playground/src/preview/preview-root.component.spec.ts
@@ -1,7 +1,8 @@
 import { ComponentFixture, TestBed } from '@angular/core/testing';
 import { PreviewRootComponent } from './preview-root.component';
-import { Component, Input } from '@angular/core';
-import { OrigoRendererComponent } from '@origostudio/angular-renderer';
+import { Component, Input, provideZonelessChangeDetection } from '@angular/core';
+import { OrigoRendererComponent, WebExperienceAdapterService } from '@origostudio/angular-renderer';
+import { vi } from 'vitest';
 
 // Mock OrigoRendererComponent to avoid needing to provide all its dependencies
 @Component({
@@ -16,10 +17,19 @@ class MockOrigoRendererComponent {
 describe('PreviewRootComponent', () => {
   let component: PreviewRootComponent;
   let fixture: ComponentFixture<PreviewRootComponent>;
+  let mockExperienceService: any;
 
   beforeEach(async () => {
+    mockExperienceService = {
+      getState: vi.fn()
+    };
+
     await TestBed.configureTestingModule({
       imports: [PreviewRootComponent],
+      providers: [
+        provideZonelessChangeDetection(),
+        { provide: WebExperienceAdapterService, useValue: mockExperienceService }
+      ]
     })
       .overrideComponent(PreviewRootComponent, {
         remove: { imports: [OrigoRendererComponent] },
@@ -39,4 +49,72 @@ describe('PreviewRootComponent', () => {
   it('should initialize with null ast', () => {
     expect(component.ast()).toBeNull();
   });
+
+  it('should contain DataGrid for entities when activeOutcome is entities', () => {
+    mockExperienceService.getState.mockImplementation((store: string, key: string) => {
+      if (store === 'main-sidebar' && key === 'activeOutcome') return 'entities';
+      return null;
+    });
+    
+    component.ast.set({
+      domains: [{
+        name: 'TestDomain',
+        entities: [{ name: 'User', fields: [] }, { name: 'Account', fields: [] }],
+        capabilities: []
+      }]
+    } as any);
+
+    const node = component.uiNode();
+    expect(node).toBeTruthy();
+    const contentVBox = node?.children?.find((c: any) => c.id === 'content-vbox');
+    const entityGrid = contentVBox?.children?.find((c: any) => c.id === 'entity-grid');
+    expect(entityGrid).toBeDefined();
+    expect(entityGrid.type).toBe('DataGrid');
+    expect(entityGrid.props.rows.length).toBe(2);
+    expect(entityGrid.props.rows[0].name).toBe('User');
+  });
+
+  it('should contain DataGrid/List or Card for capabilities when activeOutcome is capabilities', () => {
+    mockExperienceService.getState.mockImplementation((store: string, key: string) => {
+      if (store === 'main-sidebar' && key === 'activeOutcome') return 'capabilities';
+      return null;
+    });
+
+    component.ast.set({
+      domains: [{
+        name: 'TestDomain',
+        entities: [],
+        capabilities: [{ name: 'Cap1' }]
+      }]
+    } as any);
+
+    const node = component.uiNode();
+    const contentVBox = node?.children?.find((c: any) => c.id === 'content-vbox');
+    const capabilitiesList = contentVBox?.children?.find((c: any) => c.id === 'capabilities-list');
+    expect(capabilitiesList).toBeDefined();
+    expect(capabilitiesList.type).toBe('DataGrid');
+  });
+
+  it('should not throw and should render Card when capabilities is empty', () => {
+    mockExperienceService.getState.mockImplementation((store: string, key: string) => {
+      if (store === 'main-sidebar' && key === 'activeOutcome') return 'capabilities';
+      return null;
+    });
+
+    // Domain has no capabilities
+    component.ast.set({
+      domains: [{
+        name: 'TestDomain',
+        entities: []
+      }]
+    } as any);
+
+    expect(() => {
+      const node = component.uiNode();
+      const contentVBox = node?.children?.find((c: any) => c.id === 'content-vbox');
+      const capabilitiesCard = contentVBox?.children?.find((c: any) => c.id === 'capabilities-card');
+      expect(capabilitiesCard).toBeDefined();
+      expect(capabilitiesCard.type).toBe('Card');
+    }).not.toThrow();
+  });
 });
diff --git a/packages/playground/src/preview/preview-root.component.ts b/packages/playground/src/preview/preview-root.component.ts
index c75ee76..ef4f818 100644
--- a/packages/playground/src/preview/preview-root.component.ts
+++ b/packages/playground/src/preview/preview-root.component.ts
@@ -28,13 +28,157 @@ export class PreviewRootComponent {
 
     const domain = data.domains[0];
     const entities = domain.entities || [];
-    const fields = entities[0]?.fields || [];
+    const capabilities = domain.capabilities || [];
 
     const activeOutcome =
       (this.experience.getState('main-sidebar', 'activeOutcome') as string) || 'home';
     const activeTab = (this.experience.getState('tabs', 'activeTab') as string) || 'overview';
 
-    // Create a showcase UI AST that uses Epic 9 primitives to visualize the BADL Domain
+    let contentChildren: ASTNode[];
+
+    if (activeOutcome === 'entities') {
+      contentChildren = [
+        {
+          id: 'entity-grid',
+          type: 'DataGrid',
+          props: {
+            'aria-label': 'Entities Grid',
+            columns: [
+              { key: 'name', label: 'Entity Name' },
+              { key: 'fieldCount', label: 'Fields' },
+            ],
+            rows: entities.map(e => ({ name: e.name, fieldCount: e.fields?.length ?? 0 })),
+          },
+        },
+      ];
+    } else if (activeOutcome === 'capabilities') {
+      contentChildren = capabilities.length
+        ? [
+            {
+              id: 'capabilities-list',
+              type: 'DataGrid',
+              props: {
+                'aria-label': 'Capabilities',
+                columns: [
+                  { key: 'name', label: 'Capability Name' }
+                ],
+                rows: capabilities.map(c => ({ name: c.name || '-' })),
+              },
+            },
+          ]
+        : [
+            {
+              id: 'capabilities-card',
+              type: 'Card',
+              props: {
+                title: 'No Capabilities',
+                subtitle: 'No capabilities are defined for this domain.',
+              },
+            },
+          ];
+    } else {
+      contentChildren = [
+        {
+          id: 'entity-card',
+          type: 'Card',
+          props: {
+            title: 'Domain Configuration',
+            subtitle: 'Manage core settings for this domain',
+          },
+        },
+        {
+          id: 'form-vbox',
+          type: 'vbox',
+          props: { gap: '15px' },
+          children: [
+            {
+              id: 'form-hbox',
+              type: 'HBox',
+              props: { gap: '15px' },
+              children: [
+                {
+                  id: 'ff-status',
+                  type: 'FormField',
+                  props: { label: 'Status' },
+                  children: [{ id: 'switch-status', type: 'Switch', props: { checked: true } }],
+                },
+                {
+                  id: 'ff-version',
+                  type: 'FormField',
+                  props: { label: 'Version' },
+                  children: [
+                    {
+                      id: 'chip-version',
+                      type: 'Chip',
+                      props: { text: domain.version || '1.0' },
+                    },
+                  ],
+                },
+              ],
+            },
+            {
+              id: 'ff-desc',
+              type: 'FormField',
+              props: { label: 'Description' },
+              children: [
+                {
+                  id: 'textarea-desc',
+                  type: 'Textarea',
+                  props: { placeholder: 'Enter description' },
+                },
+              ],
+            },
+            {
+              id: 'ff-type',
+              type: 'FormField',
+              props: { label: 'Type' },
+              children: [
+                {
+                  id: 'select-type',
+                  type: 'Select',
+                  props: {
+                    options: [
+                      { value: 'core', label: 'Core' },
+                      { value: 'plugin', label: 'Plugin' },
+                    ],
+                  },
+                },
+              ],
+            },
+            {
+              id: 'ff-radio',
+              type: 'FormField',
+              props: { label: 'Environment' },
+              children: [
+                {
+                  id: 'radio-env',
+                  type: 'RadioGroup',
+                  props: {
+                    options: [
+                      { value: 'dev', label: 'Development' },
+                      { value: 'prod', label: 'Production' },
+                    ],
+                  },
+                },
+              ],
+            },
+            {
+              id: 'ff-check',
+              type: 'FormField',
+              props: { label: 'Enable Validation' },
+              children: [
+                {
+                  id: 'check-val',
+                  type: 'Checkbox',
+                  props: { checked: true, label: 'Strict mode' },
+                },
+              ],
+            },
+          ],
+        },
+      ];
+    }
+
     return {
       id: 'root-hbox',
       type: 'HBox',
@@ -79,117 +223,7 @@ export class PreviewRootComponent {
                 ],
               },
             },
-            {
-              id: 'entity-grid',
-              type: 'DataGrid',
-              props: {
-                'aria-label': 'Entities Grid',
-                columns: [
-                  { key: 'name', label: 'Name' },
-                  { key: 'type', label: 'Type' },
-                  { key: 'label', label: 'Label' },
-                ],
-                rows: fields.map(f => ({ name: f.name, type: f.type, label: f.label || '-' })),
-              },
-            },
-            {
-              id: 'entity-card',
-              type: 'Card',
-              props: {
-                title: 'Domain Configuration',
-                subtitle: 'Manage core settings for this domain',
-              },
-            },
-            {
-              id: 'form-vbox',
-              type: 'vbox',
-              props: { gap: '15px' },
-              children: [
-                {
-                  id: 'form-hbox',
-                  type: 'HBox',
-                  props: { gap: '15px' },
-                  children: [
-                    {
-                      id: 'ff-status',
-                      type: 'FormField',
-                      props: { label: 'Status' },
-                      children: [{ id: 'switch-status', type: 'Switch', props: { checked: true } }],
-                    },
-                    {
-                      id: 'ff-version',
-                      type: 'FormField',
-                      props: { label: 'Version' },
-                      children: [
-                        {
-                          id: 'chip-version',
-                          type: 'Chip',
-                          props: { text: domain.version || '1.0' },
-                        },
-                      ],
-                    },
-                  ],
-                },
-                {
-                  id: 'ff-desc',
-                  type: 'FormField',
-                  props: { label: 'Description' },
-                  children: [
-                    {
-                      id: 'textarea-desc',
-                      type: 'Textarea',
-                      props: { placeholder: 'Enter description' },
-                    },
-                  ],
-                },
-                {
-                  id: 'ff-type',
-                  type: 'FormField',
-                  props: { label: 'Type' },
-                  children: [
-                    {
-                      id: 'select-type',
-                      type: 'Select',
-                      props: {
-                        options: [
-                          { value: 'core', label: 'Core' },
-                          { value: 'plugin', label: 'Plugin' },
-                        ],
-                      },
-                    },
-                  ],
-                },
-                {
-                  id: 'ff-radio',
-                  type: 'FormField',
-                  props: { label: 'Environment' },
-                  children: [
-                    {
-                      id: 'radio-env',
-                      type: 'RadioGroup',
-                      props: {
-                        options: [
-                          { value: 'dev', label: 'Development' },
-                          { value: 'prod', label: 'Production' },
-                        ],
-                      },
-                    },
-                  ],
-                },
-                {
-                  id: 'ff-check',
-                  type: 'FormField',
-                  props: { label: 'Enable Validation' },
-                  children: [
-                    {
-                      id: 'check-val',
-                      type: 'Checkbox',
-                      props: { checked: true, label: 'Strict mode' },
-                    },
-                  ],
-                },
-              ],
-            },
+            ...contentChildren,
           ],
         },
       ],
diff --git a/tools/test-registry/test-registry.yaml b/tools/test-registry/test-registry.yaml
index 7a8ae51..d210e3a 100644
--- a/tools/test-registry/test-registry.yaml
+++ b/tools/test-registry/test-registry.yaml
@@ -835,3 +835,10 @@ test_cases:
       - retro-10-iframe-scroll
     last_result: unknown
     results: {}
+  - id: playground-outcome-navigation
+    description: "Playground preview renders distinct content per sidebar outcome (Home, Entities, Capabilities)"
+    package: "@origo/playground"
+    spec_file: "packages/playground/src/preview/preview-root.component.spec.ts"
+    type: unit
+    affected_stories: ["retro-10-renderer-ux"]
+    last_result: unknown
```
