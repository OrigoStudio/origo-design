You are an Acceptance Auditor. Review the provided diff against `_bmad-output/implementation-artifacts/stories/5.5-4-verify-core-compiler-source-map-preservation.md` and any loaded context docs. Check for: violations of acceptance criteria, deviations from spec intent, missing implementation of specified behavior, contradictions between spec constraints and actual code. Output findings as a Markdown list. Each finding: one-line title, which AC/constraint it violates, and evidence from the diff.

Diff:
diff --git a/packages/core/package-lock.json b/packages/core/package-lock.json
index 45232f2..61a388e 100644
--- a/packages/core/package-lock.json
+++ b/packages/core/package-lock.json
@@ -1,21 +1,23 @@
 {
   "name": "@origo/core",
-  "version": "0.0.5",
+  "version": "0.0.17",
   "lockfileVersion": 3,
   "requires": true,
   "packages": {
     "": {
       "name": "@origo/core",
-      "version": "0.0.5",
+      "version": "0.0.17",
       "dependencies": {
         "ajv": "^8.17.1",
         "ajv-errors": "^3.0.0",
         "ajv-formats": "^3.0.1",
         "json-schema-to-typescript": "^14.1.0",
-        "semver": "^7.8.5",
+        "json-source-map": "^0.6.1",
+        "semver": "^7.7.4",
         "tslib": "^2.3.0"
       },
       "devDependencies": {
+        "@types/json-source-map": "^0.6.0",
         "@types/semver": "^7.8.0"
       }
     },
@@ -75,6 +77,13 @@
       "integrity": "sha512-5+fP8P8MFNC+AyZCDxrB2pkZFPGzqQWUzpSeuuVLvm8VMcorNYavBqoFcxK8bQz4Qsbn4oUEEem4wDLfcysGHA==",
       "license": "MIT"
     },
+    "node_modules/@types/json-source-map": {
+      "version": "0.6.0",
+      "resolved": "https://registry.npmjs.org/@types/json-source-map/-/json-source-map-0.6.0.tgz",
+      "integrity": "sha512-5RTx9KQi42g0knHvHM9+f6V5B17S22ZFyoDfabgHLhnWa/5ST1UCDpuda/AaUIyHX1pLxwFZKcScM2sytz9OEQ==",
+      "dev": true,
+      "license": "MIT"
+    },
     "node_modules/@types/lodash": {
       "version": "4.17.25",
       "resolved": "https://registry.npmjs.org/@types/lodash/-/lodash-4.17.25.tgz",
@@ -548,6 +557,12 @@
       "integrity": "sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==",
       "license": "MIT"
     },
+    "node_modules/json-source-map": {
+      "version": "0.6.1",
+      "resolved": "https://registry.npmjs.org/json-source-map/-/json-source-map-0.6.1.tgz",
+      "integrity": "sha512-1QoztHPsMQqhDq0hlXY5ZqcEdUzxQEIxgFkKl4WUp2pgShObl+9ovi4kRh2TfvAfxAoHOJ9vIMEqk3k4iex7tg==",
+      "license": "MIT"
+    },
     "node_modules/lodash": {
       "version": "4.18.1",
       "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.18.1.tgz",
diff --git a/packages/core/package.json b/packages/core/package.json
index b744a5b..c5c776b 100644
--- a/packages/core/package.json
+++ b/packages/core/package.json
@@ -10,10 +10,12 @@
     "ajv-errors": "^3.0.0",
     "ajv-formats": "^3.0.1",
     "json-schema-to-typescript": "^14.1.0",
+    "json-source-map": "^0.6.1",
     "semver": "^7.7.4",
     "tslib": "^2.3.0"
   },
   "devDependencies": {
+    "@types/json-source-map": "^0.6.0",
     "@types/semver": "^7.8.0"
   }
 }
diff --git a/packages/core/src/validator/index.spec.ts b/packages/core/src/validator/index.spec.ts
index 3c2f8ea..003bf3d 100644
--- a/packages/core/src/validator/index.spec.ts
+++ b/packages/core/src/validator/index.spec.ts
@@ -164,5 +164,28 @@ describe('BADLValidator', () => {
         validator.validateEntity(objA, { maxDepth: 10 });
       }).toThrow('Maximum depth exceeded. Possible circular dependency detected.');
     });
+
+    it('should correctly attach line and column numbers to errors when parsing from a JSON string', () => {
+      const invalidJsonString = `{
+  "id": "entity-invalid",
+  "name": "Invalid",
+  "fields": [
+    {
+      "id": "field-1",
+      "name": "missing-type-and-label"
+    }
+  ]
+}`;
+      const isValid = validator.validateEntity(invalidJsonString);
+      expect(isValid).toBe(false);
+      expect(validator.errors).toBeDefined();
+      expect(validator.errors?.length).toBeGreaterThan(0);
+      
+      const errorWithContext = validator.errors?.find(e => e.context?.line !== undefined);
+      expect(errorWithContext).toBeDefined();
+      expect(errorWithContext?.context?.line).toBeDefined();
+      expect(errorWithContext?.context?.column).toBeDefined();
+      expect(errorWithContext?.code).toBeDefined();
+    });
   });
 });
diff --git a/packages/core/src/validator/index.ts b/packages/core/src/validator/index.ts
index 6360a0e..094d140 100644
--- a/packages/core/src/validator/index.ts
+++ b/packages/core/src/validator/index.ts
@@ -1,6 +1,7 @@
-import Ajv, { ErrorObject } from 'ajv/dist/2020';
+import Ajv, { ErrorObject, AnySchemaObject } from 'ajv/dist/2020';
 import addFormats from 'ajv-formats';
 import addErrors from 'ajv-errors';
+import { parse as parseJSONWithSourceMap } from 'json-source-map';
 import * as domainSchema from '../schemas/domain.schema.json';
 import * as entitySchema from '../schemas/entity.schema.json';
 import * as capabilitySchema from '../schemas/capability.schema.json';
@@ -12,9 +13,18 @@ export interface ValidatorOptions {
   maxDepth?: number;
 }
 
+export interface EnhancedErrorObject extends ErrorObject {
+  code?: string;
+  context?: {
+    line?: number;
+    column?: number;
+    [key: string]: any;
+  };
+}
+
 export class BADLValidator {
   private ajv: Ajv;
-  public errors: ErrorObject[] | null | undefined = null;
+  public errors: EnhancedErrorObject[] | null | undefined = null;
 
   constructor() {
     this.ajv = new Ajv({
@@ -92,7 +102,10 @@ export class BADLValidator {
 
   validateDomain(data: unknown, options: ValidatorOptions = {}): boolean {
     this.errors = null;
+    let jsonString: string | undefined;
+
     if (typeof data === 'string') {
+      jsonString = data;
       try {
         data = JSON.parse(data);
       } catch {
@@ -103,6 +116,7 @@ export class BADLValidator {
             instancePath: '',
             schemaPath: '',
             params: {},
+            code: 'parse'
           },
         ];
         return false;
@@ -120,13 +134,41 @@ export class BADLValidator {
     }
 
     const isValid = validate(data);
-    this.errors = isValid ? null : validate.errors;
+    
+    if (!isValid && validate.errors) {
+      let sourceMapPointers: Record<string, any> | undefined;
+      if (jsonString) {
+        try {
+          sourceMapPointers = parseJSONWithSourceMap(jsonString).pointers;
+        } catch {
+          // Ignore parsing errors for source maps if initial parse succeeded
+        }
+      }
+
+      this.errors = validate.errors.map(err => {
+        const newErr: EnhancedErrorObject = { ...err, code: err.keyword };
+        if (sourceMapPointers && err.instancePath && sourceMapPointers[err.instancePath]) {
+          const pointer = sourceMapPointers[err.instancePath];
+          newErr.context = {
+            line: pointer.value.line,
+            column: pointer.value.column,
+          };
+        }
+        return newErr;
+      });
+    } else {
+      this.errors = null;
+    }
+    
     return isValid as boolean;
   }
 
   validateEntity(data: unknown, options: ValidatorOptions = {}): boolean {
     this.errors = null;
+    let jsonString: string | undefined;
+
     if (typeof data === 'string') {
+      jsonString = data;
       try {
         data = JSON.parse(data);
       } catch {
@@ -137,6 +179,7 @@ export class BADLValidator {
             instancePath: '',
             schemaPath: '',
             params: {},
+            code: 'parse'
           },
         ];
         return false;
@@ -154,7 +197,32 @@ export class BADLValidator {
     }
 
     const isValid = validate(data);
-    this.errors = isValid ? null : validate.errors;
+    
+    if (!isValid && validate.errors) {
+      let sourceMapPointers: Record<string, any> | undefined;
+      if (jsonString) {
+        try {
+          sourceMapPointers = parseJSONWithSourceMap(jsonString).pointers;
+        } catch {
+          // Ignore parsing errors for source maps if initial parse succeeded
+        }
+      }
+
+      this.errors = validate.errors.map(err => {
+        const newErr: EnhancedErrorObject = { ...err, code: err.keyword };
+        if (sourceMapPointers && err.instancePath && sourceMapPointers[err.instancePath]) {
+          const pointer = sourceMapPointers[err.instancePath];
+          newErr.context = {
+            line: pointer.value.line,
+            column: pointer.value.column,
+          };
+        }
+        return newErr;
+      });
+    } else {
+      this.errors = null;
+    }
+    
     return isValid as boolean;
   }
 }
