Invoke the bmad-review-edge-case-hunter skill on this diff:

diff --git a/_bmad-output/implementation-artifacts/sprint-status.yaml b/_bmad-output/implementation-artifacts/sprint-status.yaml
index 0ead22c..df5c415 100644
--- a/_bmad-output/implementation-artifacts/sprint-status.yaml
+++ b/_bmad-output/implementation-artifacts/sprint-status.yaml
@@ -41,7 +41,7 @@
 # - Retrospective appends its action items to action_items; sprint-status surfaces open ones
 
 generated: 2026-07-29T21:46:02.464968
-last_updated: 2026-08-10T09:56:05.000000
+last_updated: 2026-08-10T19:56:09.000000
 project: origo-design
 project_key: NOKEY
 tracking_system: file-system
@@ -67,7 +67,7 @@ development_status:
   epic-3: in-progress
   3-1-target-page-json-fixture: done
   3-2-domain-entity-schema-parser: done
-  3-3-canonical-ast-serialization: backlog
+  3-3-canonical-ast-serialization: review
   3-4-ast-validation-engine: backlog
   epic-3-retrospective: optional
   epic-4: backlog
diff --git a/packages/core/src/index.ts b/packages/core/src/index.ts
index 8ac044e..b6de3ee 100644
--- a/packages/core/src/index.ts
+++ b/packages/core/src/index.ts
@@ -1,2 +1,3 @@
 export * from './validator';
 export * from './types/domain';
+export * from './types/ast';
diff --git a/packages/core/src/validator/index.ts b/packages/core/src/validator/index.ts
index fa21fe9..569d18a 100644
--- a/packages/core/src/validator/index.ts
+++ b/packages/core/src/validator/index.ts
@@ -120,3 +120,5 @@ export class BADLValidator {
     return isValid as boolean;
   }
 }
+
+export * from './serializer';
diff --git a/packages/core/src/types/ast.ts b/packages/core/src/types/ast.ts
new file mode 100644
index 0000000..279f176
--- /dev/null
+++ b/packages/core/src/types/ast.ts
@@ -0,0 +1,6 @@
+import { Domain } from './domain';
+
+export interface CanonicalAST {
+  schemaVersion: string;
+  domains: Domain[];
+}
diff --git a/packages/core/src/validator/serializer.ts b/packages/core/src/validator/serializer.ts
new file mode 100644
index 0000000..d851e65
--- /dev/null
+++ b/packages/core/src/validator/serializer.ts
@@ -0,0 +1,65 @@
+import { CanonicalAST } from '../types/ast';
+
+/**
+ * Deep clones and canonically sorts an object/array.
+ */
+function canonicalize(obj: any): any {
+  if (obj === null || typeof obj !== 'object') {
+    return obj;
+  }
+
+  if (Array.isArray(obj)) {
+    // Process children first
+    const mapped = obj.map(item => canonicalize(item));
+    
+    // Determine sort type for this array based on its elements
+    // We sort if elements are objects and have 'id' or 'name' property
+    const hasId = mapped.length > 0 && typeof mapped[0] === 'object' && mapped[0] !== null && 'id' in mapped[0];
+    const hasName = mapped.length > 0 && typeof mapped[0] === 'object' && mapped[0] !== null && 'name' in mapped[0];
+    
+    if (hasId) {
+      mapped.sort((a, b) => {
+        const idA = String(a.id);
+        const idB = String(b.id);
+        return idA.localeCompare(idB);
+      });
+    } else if (hasName) {
+      mapped.sort((a, b) => {
+        const nameA = String(a.name);
+        const nameB = String(b.name);
+        return nameA.localeCompare(nameB);
+      });
+    }
+    
+    return mapped;
+  }
+
+  // It is an object, sort its keys
+  const sortedKeys = Object.keys(obj).sort();
+  const result: Record<string, any> = {};
+  for (const key of sortedKeys) {
+    result[key] = canonicalize(obj[key]);
+  }
+  
+  return result;
+}
+
+/**
+ * Serializes the parsed memory model into a canonical JSON AST.
+ * Enforces `schemaVersion`, stable key ordering, and stable array ordering.
+ * 
+ * @param ast The canonical AST to serialize
+ * @returns Byte-for-byte deterministic JSON string
+ */
+export function serializeAST(ast: CanonicalAST): string {
+  if (!ast || !ast.schemaVersion) {
+    throw new Error('Invalid AST: Missing schemaVersion');
+  }
+
+  const canonical = canonicalize(ast);
+  
+  // Return nicely formatted JSON (or should it be minified?)
+  // For standard AST output, using 2 spaces is typical for readability, 
+  // but minified is also fine. Let's use 2 spaces as standard JSON.
+  return JSON.stringify(canonical, null, 2);
+}
diff --git a/packages/core/src/validator/serializer.spec.ts b/packages/core/src/validator/serializer.spec.ts
new file mode 100644
index 0000000..81620ac
--- /dev/null
+++ b/packages/core/src/validator/serializer.spec.ts
@@ -0,0 +1,155 @@
+import { CanonicalAST } from '../types/ast';
+import { serializeAST } from './serializer';
+
+describe('AST Serializer', () => {
+  it('should embed schemaVersion in the root payload', () => {
+    const ast: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: []
+    };
+    
+    const result = serializeAST(ast);
+    const parsed = JSON.parse(result);
+    expect(parsed.schemaVersion).toBe('1.0.0');
+  });
+
+  it('should guarantee deterministic object key ordering', () => {
+    const ast1 = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Domain 1',
+          version: '1',
+          domain: 'example',
+          entities: []
+        }
+      ]
+    };
+    
+    const ast2 = {
+      domains: [
+        {
+          name: 'Domain 1',
+          id: 'domain-1',
+          domain: 'example',
+          version: '1',
+          entities: []
+        }
+      ],
+      schemaVersion: '1.0.0',
+    };
+
+    // Cast as any because ast1 and ast2 are structured differently in memory
+    const serialized1 = serializeAST(ast1 as any);
+    const serialized2 = serializeAST(ast2 as any);
+
+    expect(serialized1).toBe(serialized2);
+  });
+
+  it('should guarantee array sorting by id', () => {
+    const ast1: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Domain 1',
+          version: '1',
+          domain: 'example',
+          entities: [
+            {
+              id: 'entity-b',
+              name: 'Entity B',
+              fields: []
+            },
+            {
+              id: 'entity-a',
+              name: 'Entity A',
+              fields: []
+            }
+          ]
+        }
+      ]
+    };
+
+    const ast2: CanonicalAST = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Domain 1',
+          version: '1',
+          domain: 'example',
+          entities: [
+            {
+              id: 'entity-a',
+              name: 'Entity A',
+              fields: []
+            },
+            {
+              id: 'entity-b',
+              name: 'Entity B',
+              fields: []
+            }
+          ]
+        }
+      ]
+    };
+
+    const serialized1 = serializeAST(ast1);
+    const serialized2 = serializeAST(ast2);
+
+    expect(serialized1).toBe(serialized2);
+    
+    // Ensure it's sorted alphabetically by ID
+    const parsed = JSON.parse(serialized1);
+    expect(parsed.domains[0].entities[0].id).toBe('entity-a');
+    expect(parsed.domains[0].entities[1].id).toBe('entity-b');
+  });
+
+  it('should guarantee array sorting by name if id is missing', () => {
+    const ast1: any = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Domain 1',
+          version: '1',
+          domain: 'example',
+          entities: [],
+          capabilities: [
+            { name: 'Cap B', type: 'Query', entityId: 'e' },
+            { name: 'Cap A', type: 'Query', entityId: 'e' }
+          ]
+        }
+      ]
+    };
+
+    const ast2: any = {
+      schemaVersion: '1.0.0',
+      domains: [
+        {
+          id: 'domain-1',
+          name: 'Domain 1',
+          version: '1',
+          domain: 'example',
+          entities: [],
+          capabilities: [
+            { name: 'Cap A', type: 'Query', entityId: 'e' },
+            { name: 'Cap B', type: 'Query', entityId: 'e' }
+          ]
+        }
+      ]
+    };
+
+    const serialized1 = serializeAST(ast1);
+    const serialized2 = serializeAST(ast2);
+
+    expect(serialized1).toBe(serialized2);
+    
+    // Ensure it's sorted alphabetically by name
+    const parsed = JSON.parse(serialized1);
+    expect(parsed.domains[0].capabilities[0].name).toBe('Cap A');
+    expect(parsed.domains[0].capabilities[1].name).toBe('Cap B');
+  });
+});

