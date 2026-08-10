Invoke the mad-review-edge-case-hunter skill on this diff:

`diff
diff --git a/packages/core/src/validator/index.ts b/packages/core/src/validator/index.ts
index 569d18a..e62f0a6 100644
--- a/packages/core/src/validator/index.ts
+++ b/packages/core/src/validator/index.ts
@@ -122,3 +122,4 @@ export class BADLValidator {
 }
 
 export * from './serializer';
+export * from './ast-validator';
diff --git a/packages/core/src/validator/ast-validator.ts b/packages/core/src/validator/ast-validator.ts
new file mode 100644
index 0000000..4f61ddf
--- /dev/null
+++ b/packages/core/src/validator/ast-validator.ts
@@ -0,0 +1,67 @@
+import { CanonicalAST } from '../types/ast';
+
+export function validateAST(ast: CanonicalAST): void {
+  const entityMap = new Map<string, string>();
+  
+  // First pass: Collect all entities to ensure unique IDs and for quick lookup
+  for (const domain of ast.domains) {
+    for (const entity of domain.entities) {
+      if (entityMap.has(entity.id)) {
+        throw new Error(`Duplicate entity ID found: ${entity.id}`);
+      }
+      entityMap.set(entity.id, entity.name);
+    }
+  }
+
+  // Second pass: Validate field references and detect cycles
+  const adjList = new Map<string, string[]>();
+  
+  for (const domain of ast.domains) {
+    for (const entity of domain.entities) {
+      const dependencies: string[] = [];
+      for (const field of entity.fields) {
+        if (field.references) {
+          if (!entityMap.has(field.references)) {
+            throw new Error(`Invalid consumption rule: Entity "${field.references}" referenced by field "${field.id}" does not exist`);
+          }
+          dependencies.push(field.references);
+        }
+      }
+      adjList.set(entity.id, dependencies);
+    }
+  }
+
+  // Detect cycles using DFS
+  const visited = new Set<string>();
+  const visiting = new Set<string>();
+
+  function dfs(nodeId: string, path: string[]) {
+    if (visiting.has(nodeId)) {
+      // Cycle detected
+      const cyclePath = [...path, nodeId].join(' -> ');
+      throw new Error(`Circular dependency detected: ${cyclePath}`);
+    }
+    
+    if (visited.has(nodeId)) {
+      return;
+    }
+
+    visiting.add(nodeId);
+    path.push(nodeId);
+
+    const deps = adjList.get(nodeId) || [];
+    for (const dep of deps) {
+      dfs(dep, path);
+    }
+
+    path.pop();
+    visiting.delete(nodeId);
+    visited.add(nodeId);
+  }
+
+  for (const entityId of entityMap.keys()) {
+    if (!visited.has(entityId)) {
+      dfs(entityId, []);
+    }
+  }
+}
diff --git a/packages/core/src/validator/ast-validator.spec.ts b/packages/core/src/validator/ast-validator.spec.ts
new file mode 100644
index 0000000..b3788ad
--- /dev/null
+++ b/packages/core/src/validator/ast-validator.spec.ts
@@ -0,0 +1,181 @@
+import { CanonicalAST } from '../types/ast';
+import { validateAST } from './ast-validator';
+
+describe('AST Validation Engine', () => {
+  it('should pass a valid Canonical AST', () => {
+    const ast: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Core',
+          version: '1.0.0',
+          domain: 'core',
+          entities: [
+            {
+              id: 'entity-1',
+              name: 'User',
+              fields: [
+                {
+                  id: 'field-1',
+                  name: 'id',
+                  type: 'string',
+                  label: 'User ID',
+                  validation: [],
+                  metadata_path: ''
+                }
+              ]
+            }
+          ]
+        }
+      ]
+    };
+    expect(() => validateAST(ast)).not.toThrow();
+  });
+
+  it('should detect a circular dependency between two entities', () => {
+    const ast: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Core',
+          version: '1.0.0',
+          domain: 'core',
+          entities: [
+            {
+              id: 'entity-1',
+              name: 'User',
+              fields: [
+                {
+                  id: 'field-1',
+                  name: 'profileId',
+                  type: 'string',
+                  references: 'entity-2',
+                  label: 'Profile',
+                  validation: [],
+                  metadata_path: ''
+                }
+              ]
+            },
+            {
+              id: 'entity-2',
+              name: 'Profile',
+              fields: [
+                {
+                  id: 'field-2',
+                  name: 'userId',
+                  type: 'string',
+                  references: 'entity-1',
+                  label: 'User',
+                  validation: [],
+                  metadata_path: ''
+                }
+              ]
+            }
+          ]
+        }
+      ]
+    };
+    expect(() => validateAST(ast)).toThrow(/Circular dependency detected: entity-1 -> entity-2 -> entity-1/);
+  });
+
+  it('should detect a self-referencing circular dependency', () => {
+    const ast: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Core',
+          version: '1.0.0',
+          domain: 'core',
+          entities: [
+            {
+              id: 'entity-1',
+              name: 'Category',
+              fields: [
+                {
+                  id: 'field-1',
+                  name: 'parent',
+                  type: 'string',
+                  references: 'entity-1',
+                  label: 'Parent Category',
+                  validation: [],
+                  metadata_path: ''
+                }
+              ]
+            }
+          ]
+        }
+      ]
+    };
+    expect(() => validateAST(ast)).toThrow(/Circular dependency detected: entity-1 -> entity-1/);
+  });
+
+  it('should throw an error for missing referenced entities', () => {
+    const ast: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Core',
+          version: '1.0.0',
+          domain: 'core',
+          entities: [
+            {
+              id: 'entity-1',
+              name: 'Order',
+              fields: [
+                {
+                  id: 'field-1',
+                  name: 'customerId',
+                  type: 'string',
+                  references: 'entity-missing',
+                  label: 'Customer',
+                  validation: [],
+                  metadata_path: ''
+                }
+              ]
+            }
+          ]
+        }
+      ]
+    };
+    expect(() => validateAST(ast)).toThrow(/Invalid consumption rule: Entity "entity-missing" referenced by field "field-1" does not exist/);
+  });
+
+  it('should throw an error if multiple domains declare the same entity ID (if unique entity IDs are required globally)', () => {
+    const ast: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Core',
+          version: '1.0.0',
+          domain: 'core',
+          entities: [
+            {
+              id: 'entity-1',
+              name: 'User',
+              fields: []
+            }
+          ]
+        },
+        {
+          id: 'domain-2',
+          name: 'Auth',
+          version: '1.0.0',
+          domain: 'auth',
+          entities: [
+            {
+              id: 'entity-1',
+              name: 'AnotherUser',
+              fields: []
+            }
+          ]
+        }
+      ]
+    };
+    expect(() => validateAST(ast)).toThrow(/Duplicate entity ID found: entity-1/);
+  });
+});

`
