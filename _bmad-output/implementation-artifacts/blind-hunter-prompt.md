Invoke the `bmad-review-adversarial-general` skill on this diff:

```diff
diff --git a/packages/cli/src/commands/init.ts b/packages/cli/src/commands/init.ts
index 48decd4..8be8a45 100644
--- a/packages/cli/src/commands/init.ts
+++ b/packages/cli/src/commands/init.ts
@@ -2,6 +2,7 @@ import { Command } from 'commander';
 import * as fs from 'fs/promises';
 import * as path from 'path';
 import { CliError } from '../utils/errors';
+import { generateOrigoConfig } from '../templates';
 
 export function initCommand(): Command {
   const init = new Command('init')
@@ -49,13 +50,9 @@ export async function initializeProject(
     await fs.mkdir(schemasDir, { recursive: true });
 
     // Create config file securely
-    const config = {
-      version: '1.0',
-      build: { outDir: './dist' },
-      schemas: './schemas',
-    };
+    const configContent = generateOrigoConfig();
 
-    await fs.writeFile(configFile, JSON.stringify(config, null, 2), 'utf-8');
+    await fs.writeFile(configFile, configContent, 'utf-8');
 
     console.log(`Successfully initialized Origo project in ${projectDir}`);
   } catch (error) {
diff --git a/packages/cli/src/templates/index.ts b/packages/cli/src/templates/index.ts
new file mode 100644
--- /dev/null
+++ b/packages/cli/src/templates/index.ts
@@ -0,0 +1,51 @@
+export function generateEntityTemplate(
+  options: { id?: string; name?: string; type?: string } = {}
+): string {
+  const entity = {
+    id: options.id || 'default_entity_id',
+    name: options.name || 'DefaultEntityName',
+    type: options.type || 'object',
+    fields: [],
+    permissions: {
+      read: ['admin'],
+      write: ['admin'],
+    },
+  };
+  return JSON.stringify(entity, null, 2);
+}
+
+export function generateOrigoConfig(options: Record<string, any> = {}): string {
+  const config = {
+    version: '1.0',
+    build: { outDir: './dist' },
+    schemas: './schemas',
+    security: {
+      sandboxEnabled: true,
+      allowNetworkAccess: false,
+      allowFileSystemAccess: false,
+    },
+    ...options,
+  };
+  return JSON.stringify(config, null, 2);
+}
+
+export function generateExtensionTemplate(
+  options: { id?: string; name?: string; version?: string } = {}
+): string {
+  const extension = {
+    id: options.id || 'my-extension',
+    name: options.name || 'My Extension',
+    version: options.version || '1.0.0',
+    capabilities: [],
+    permissions: {
+      required: [],
+      sandbox: {
+        network: false,
+        filesystem: false,
+        process: false,
+      },
+    },
+  };
+  return JSON.stringify(extension, null, 2);
+}
diff --git a/packages/cli/src/templates/index.spec.ts b/packages/cli/src/templates/index.spec.ts
new file mode 100644
--- /dev/null
+++ b/packages/cli/src/templates/index.spec.ts
@@ -0,0 +1,75 @@
+import {
+  generateEntityTemplate,
+  generateOrigoConfig,
+  generateExtensionTemplate,
+} from './index';
+
+describe('Boilerplate Templates', () => {
+  describe('Entity Template', () => {
+    it('should generate valid JSON containing strict RBAC permissions', () => {
+      const templateJson = generateEntityTemplate({
+        id: 'user',
+        name: 'User',
+      });
+      const parsed = JSON.parse(templateJson);
+
+      expect(parsed.id).toBe('user');
+      expect(parsed.name).toBe('User');
+      expect(parsed.type).toBe('object');
+      expect(parsed.fields).toEqual([]);
+
+      // Security requirement: Must have strict RBAC defaults
+      expect(parsed.permissions).toBeDefined();
+      expect(parsed.permissions.read).toEqual(['admin']);
+      expect(parsed.permissions.write).toEqual(['admin']);
+    });
+
+    it('should fail validation (hypothetically) if permissions block is omitted', () => {
+      const templateJson = generateEntityTemplate();
+      const parsed = JSON.parse(templateJson);
+      
+      const validateStrictRBAC = (entity: any) => {
+        if (!entity.permissions || !entity.permissions.read || !entity.permissions.write) {
+          throw new Error('Strict RBAC permissions block is missing');
+        }
+      };
+
+      // Template includes it, so it should pass
+      expect(() => validateStrictRBAC(parsed)).not.toThrow();
+
+      // If omitted, it should throw
+      delete parsed.permissions;
+      expect(() => validateStrictRBAC(parsed)).toThrow('Strict RBAC permissions block is missing');
+    });
+  });
+
+  describe('Origo Config Template', () => {
+    it('should generate valid JSON with secure default config', () => {
+      const templateJson = generateOrigoConfig();
+      const parsed = JSON.parse(templateJson);
+
+      expect(parsed.version).toBe('1.0');
+      expect(parsed.schemas).toBe('./schemas');
+      
+      // Security requirement: Secure defaults
+      expect(parsed.security).toBeDefined();
+      expect(parsed.security.sandboxEnabled).toBe(true);
+      expect(parsed.security.allowNetworkAccess).toBe(false);
+      expect(parsed.security.allowFileSystemAccess).toBe(false);
+    });
+  });
+
+  describe('Extension Template', () => {
+    it('should generate valid JSON with strict sandbox permissions', () => {
+      const templateJson = generateExtensionTemplate();
+      const parsed = JSON.parse(templateJson);
+
+      expect(parsed.id).toBe('my-extension');
+      expect(parsed.permissions).toBeDefined();
+      expect(parsed.permissions.sandbox.network).toBe(false);
+      expect(parsed.permissions.sandbox.filesystem).toBe(false);
+      expect(parsed.permissions.sandbox.process).toBe(false);
+    });
+  });
+});
```
