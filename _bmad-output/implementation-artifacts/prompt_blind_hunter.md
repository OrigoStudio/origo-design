Invoke the `bmad-review-adversarial-general` skill on this diff:

```diff
diff --git a/packages/devtools/manifest.json b/packages/devtools/manifest.json
new file mode 100644
index 0000000..806a3a4
--- /dev/null
+++ b/packages/devtools/manifest.json
@@ -0,0 +1,24 @@
+{
+  "manifest_version": 3,
+  "name": "Origo DevTools",
+  "version": "0.0.1",
+  "description": "Origo DevTools Inspector UI",
+  "devtools_page": "devtools.html",
+  "background": {
+    "service_worker": "background.js",
+    "type": "module"
+  },
+  "content_scripts": [
+    {
+      "matches": ["<all_urls>"],
+      "js": ["content-script.js"]
+    }
+  ],
+  "web_accessible_resources": [
+    {
+      "resources": ["injected.js"],
+      "matches": ["<all_urls>"]
+    }
+  ],
+  "permissions": ["scripting"]
+}
diff --git a/packages/devtools/project.json b/packages/devtools/project.json
new file mode 100644
index 0000000..0823c74
--- /dev/null
+++ b/packages/devtools/project.json
@@ -0,0 +1,78 @@
+{
+  "name": "devtools",
+  "$schema": "../../node_modules/nx/schemas/project-schema.json",
+  "sourceRoot": "packages/devtools/src",
+  "projectType": "application",
+  "tags": ["type:app", "scope:devtools"],
+  "targets": {
+    "build": {
+      "executor": "@angular-devkit/build-angular:application",
+      "outputs": ["{options.outputPath}"],
+      "options": {
+        "outputPath": "dist/packages/devtools",
+        "index": {
+          "input": "packages/devtools/panel.html",
+          "output": "panel.html"
+        },
+        "browser": "packages/devtools/src/devtools-panel/main.ts",
+        "tsConfig": "packages/devtools/tsconfig.app.json",
+        "assets": [
+          "packages/devtools/manifest.json",
+          "packages/devtools/devtools.html",
+          "packages/devtools/devtools.js"
+        ],
+        "styles": [],
+        "scripts": []
+      },
+      "configurations": {
+        "production": {
+          "budgets": [
+            {
+              "type": "initial",
+              "maximumWarning": "500kb",
+              "maximumError": "1mb"
+            },
+            {
+              "type": "anyComponentStyle",
+              "maximumWarning": "2kb",
+              "maximumError": "4kb"
+            }
+          ],
+          "outputHashing": "all"
+        },
+        "development": {
+          "optimization": false,
+          "extractLicenses": false,
+          "sourceMap": true
+        }
+      },
+      "defaultConfiguration": "production"
+    },
+    "build-scripts": {
+      "executor": "nx:run-commands",
+      "options": {
+        "commands": [
+          "npx esbuild packages/devtools/src/background/background.ts --bundle --outfile=dist/packages/devtools/browser/background.js",
+          "npx esbuild packages/devtools/src/content-script/content-script.ts --bundle --outfile=dist/packages/devtools/browser/content-script.js",
+          "npx esbuild packages/devtools/src/content-script/injected.ts --bundle --outfile=dist/packages/devtools/browser/injected.js"
+        ],
+        "parallel": true
+      }
+    },
+    "lint": {
+      "executor": "@nx/eslint:lint",
+      "outputs": ["{options.outputFile}"],
+      "options": {
+        "lintFilePatterns": ["packages/devtools/**/*.ts", "packages/devtools/**/*.html"]
+      }
+    },
+    "test": {
+      "executor": "nx:run-commands",
+      "outputs": ["{workspaceRoot}/coverage/packages/devtools"],
+      "options": {
+        "command": "vitest run --passWithNoTests",
+        "cwd": "packages/devtools"
+      }
+    }
+  }
+}
diff --git a/packages/devtools/src/background/background.ts b/packages/devtools/src/background/background.ts
new file mode 100644
index 0000000..bb1185d
--- /dev/null
+++ b/packages/devtools/src/background/background.ts
@@ -0,0 +1,50 @@
+const connections: { [tabId: number]: chrome.runtime.Port } = {};
+
+chrome.runtime.onConnect.addListener(port => {
+  if (port.name !== 'origo-devtools-panel') return;
+
+  const extensionListener = (message: any) => {
+    // The original connection event doesn't include the tab ID of the
+    // DevTools page, so we need to send it explicitly.
+    if (message.name === 'init') {
+      connections[message.tabId] = port;
+      return;
+    }
+
+    // Relay message to content script
+    if (message.tabId) {
+      chrome.tabs.sendMessage(message.tabId, message.data);
+    }
+  };
+
+  // Listen to messages sent from the DevTools page
+  port.onMessage.addListener(extensionListener);
+
+  port.onDisconnect.addListener(port => {
+    port.onMessage.removeListener(extensionListener);
+
+    const tabs = Object.keys(connections);
+    for (let i = 0, len = tabs.length; i < len; i++) {
+      if (connections[parseInt(tabs[i])] === port) {
+        delete connections[parseInt(tabs[i])];
+        break;
+      }
+    }
+  });
+});
+
+// Receive message from content script and relay to the devTools page for the current tab
+chrome.runtime.onMessage.addListener((request, sender) => {
+  // Messages from content scripts should have sender.tab set
+  if (sender.tab && sender.tab.id) {
+    const tabId = sender.tab.id;
+    if (tabId in connections) {
+      connections[tabId].postMessage(request);
+    } else {
+      console.log('Tab not found in connection list.');
+    }
+  } else {
+    console.log('sender.tab not defined.');
+  }
+  return true;
+});
diff --git a/packages/devtools/src/content-script/content-script.ts b/packages/devtools/src/content-script/content-script.ts
new file mode 100644
index 0000000..85df402
--- /dev/null
+++ b/packages/devtools/src/content-script/content-script.ts
@@ -0,0 +1,30 @@
+// Inject the script into the main world
+const script = document.createElement('script');
+script.src = chrome.runtime.getURL('injected.js');
+(document.head || document.documentElement).appendChild(script);
+script.onload = () => {
+  script.remove();
+};
+
+// Relay messages from background to injected script
+chrome.runtime.onMessage.addListener(message => {
+  window.postMessage(
+    {
+      source: 'origo-devtools-content-script',
+      payload: message,
+    },
+    '*'
+  );
+  // Return true to indicate we will respond asynchronously, though in this architecture
+  // we actually just send messages back to the background script rather than using the callback
+  return true;
+});
+
+// Relay messages from injected script to background
+window.addEventListener('message', event => {
+  if (event.source !== window || !event.data || event.data.source !== 'origo-devtools-injected') {
+    return;
+  }
+
+  chrome.runtime.sendMessage(event.data);
+});
diff --git a/packages/devtools/src/content-script/injected.ts b/packages/devtools/src/content-script/injected.ts
new file mode 100644
index 0000000..5371a1a
--- /dev/null
+++ b/packages/devtools/src/content-script/injected.ts
@@ -0,0 +1,99 @@
+import type { DevToolsMessage } from '../types/messages';
+import type { OrigoDevToolsAPI } from '@origo/angular-renderer';
+
+// Declare the window variable based on the API type
+declare global {
+  interface Window {
+    __ORIGO_DEVTOOLS__?: OrigoDevToolsAPI;
+  }
+}
+
+// Injected into the main world to access window.__ORIGO_DEVTOOLS__
+window.addEventListener('message', event => {
+  // Only accept messages from same frame
+  if (
+    event.source !== window ||
+    !event.data ||
+    event.data.source !== 'origo-devtools-content-script'
+  ) {
+    return;
+  }
+
+  const message = event.data.payload as DevToolsMessage;
+  const devtools = window.__ORIGO_DEVTOOLS__;
+
+  if (!devtools) {
+    window.postMessage(
+      {
+        source: 'origo-devtools-injected',
+        payload: { type: 'NOT_AVAILABLE' },
+      },
+      '*'
+    );
+    return;
+  }
+
+  try {
+    switch (message.type) {
+      case 'GET_METADATA_SOURCE':
+        window.postMessage(
+          {
+            source: 'origo-devtools-injected',
+            payload: {
+              type: 'METADATA_SOURCE_RESPONSE',
+              payload: devtools.getMetadataSource(message.payload.badlPath),
+            },
+          },
+          '*'
+        );
+        break;
+      case 'GET_RESOLUTION_CHAIN':
+        window.postMessage(
+          {
+            source: 'origo-devtools-injected',
+            payload: {
+              type: 'RESOLUTION_CHAIN_RESPONSE',
+              payload: devtools.getResolutionChain(message.payload.badlPath),
+            },
+          },
+          '*'
+        );
+        break;
+      case 'GET_RENDERING_PATH':
+        window.postMessage(
+          {
+            source: 'origo-devtools-injected',
+            payload: {
+              type: 'RENDERING_PATH_RESPONSE',
+              payload: devtools.getRenderingPath(message.payload.badlPath),
+            },
+          },
+          '*'
+        );
+        break;
+      case 'GET_ERROR_TELEMETRY':
+        window.postMessage(
+          {
+            source: 'origo-devtools-injected',
+            payload: {
+              type: 'ERROR_TELEMETRY_RESPONSE',
+              payload: devtools.getErrorTelemetry(),
+            },
+          },
+          '*'
+        );
+        break;
+      case 'PING':
+        window.postMessage(
+          {
+            source: 'origo-devtools-injected',
+            payload: { type: 'PONG' },
+          },
+          '*'
+        );
+        break;
+    }
+  } catch (e) {
+    console.error('Origo DevTools Injected Script Error:', e);
+  }
+});
diff --git a/packages/devtools/src/types/messages.ts b/packages/devtools/src/types/messages.ts
new file mode 100644
index 0000000..243eff0
--- /dev/null
+++ b/packages/devtools/src/types/messages.ts
@@ -0,0 +1,82 @@
+import type {
+  MetadataSource,
+  ResolutionChain,
+  RenderingPath,
+  ErrorContext,
+} from '@origo/angular-renderer';
+
+export type DevToolsMessageType =
+  | 'GET_METADATA_SOURCE'
+  | 'METADATA_SOURCE_RESPONSE'
+  | 'GET_RESOLUTION_CHAIN'
+  | 'RESOLUTION_CHAIN_RESPONSE'
+  | 'GET_RENDERING_PATH'
+  | 'RENDERING_PATH_RESPONSE'
+  | 'GET_ERROR_TELEMETRY'
+  | 'ERROR_TELEMETRY_RESPONSE'
+  | 'PING'
+  | 'PONG';
+
+export interface BaseMessage {
+  type: DevToolsMessageType;
+  payload?: unknown;
+}
+
+export interface GetMetadataSourceMessage extends BaseMessage {
+  type: 'GET_METADATA_SOURCE';
+  payload: { badlPath: string };
+}
+
+export interface MetadataSourceResponseMessage extends BaseMessage {
+  type: 'METADATA_SOURCE_RESPONSE';
+  payload: MetadataSource | null;
+}
+
+export interface GetResolutionChainMessage extends BaseMessage {
+  type: 'GET_RESOLUTION_CHAIN';
+  payload: { badlPath: string };
+}
+
+export interface ResolutionChainResponseMessage extends BaseMessage {
+  type: 'RESOLUTION_CHAIN_RESPONSE';
+  payload: ResolutionChain | null;
+}
+
+export interface GetRenderingPathMessage extends BaseMessage {
+  type: 'GET_RENDERING_PATH';
+  payload: { badlPath: string };
+}
+
+export interface RenderingPathResponseMessage extends BaseMessage {
+  type: 'RENDERING_PATH_RESPONSE';
+  payload: RenderingPath | null;
+}
+
+export interface GetErrorTelemetryMessage extends BaseMessage {
+  type: 'GET_ERROR_TELEMETRY';
+}
+
+export interface ErrorTelemetryResponseMessage extends BaseMessage {
+  type: 'ERROR_TELEMETRY_RESPONSE';
+  payload: ErrorContext[] | null;
+}
+
+export interface PingMessage extends BaseMessage {
+  type: 'PING';
+}
+
+export interface PongMessage extends BaseMessage {
+  type: 'PONG';
+}
+
+export type DevToolsMessage =
+  | GetMetadataSourceMessage
+  | MetadataSourceResponseMessage
+  | GetResolutionChainMessage
+  | ResolutionChainResponseMessage
+  | GetRenderingPathMessage
+  | RenderingPathResponseMessage
+  | GetErrorTelemetryMessage
+  | ErrorTelemetryResponseMessage
+  | PingMessage
+  | PongMessage;
```
