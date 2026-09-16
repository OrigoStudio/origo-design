Invoke the mad-review-adversarial-general skill on this diff:

```diff
diff --git a/packages/devtools/devtools.html b/packages/devtools/devtools.html
new file mode 100644
index 0000000..95f4d1e
--- /dev/null
+++ b/packages/devtools/devtools.html
@@ -0,0 +1,18 @@
+<!doctype html>
+<html lang="en">
+  <head>
+    <meta charset="utf-8" />
+    <title>Origo DevTools</title>
+    <base href="/" />
+    <meta name="viewport" content="width=device-width, initial-scale=1" />
+  </head>
+  <body>
+    <!-- 
+      We cannot run inline scripts in MV3 extension pages. 
+      The actual devtools panel registration happens here if needed, 
+      or in main.ts. Actually, devtools.html is the devtools_page in manifest,
+      which is invisible. It just creates the panel.
+    -->
+    <script src="devtools.js"></script>
+  </body>
+</html>
diff --git a/packages/devtools/devtools.js b/packages/devtools/devtools.js
new file mode 100644
index 0000000..6dffcd9
--- /dev/null
+++ b/packages/devtools/devtools.js
@@ -0,0 +1,3 @@
+chrome.devtools.panels.create('Origo', '', 'panel.html', function (panel) {
+  console.log('Origo panel created');
+});
diff --git a/packages/devtools/package.json b/packages/devtools/package.json
new file mode 100644
index 0000000..de3825a
--- /dev/null
+++ b/packages/devtools/package.json
@@ -0,0 +1,5 @@
+{
+  "name": "@origo/devtools",
+  "version": "0.0.1",
+  "type": "module"
+}
diff --git a/packages/devtools/panel.html b/packages/devtools/panel.html
new file mode 100644
index 0000000..0208168
--- /dev/null
+++ b/packages/devtools/panel.html
@@ -0,0 +1,12 @@
+<!doctype html>
+<html lang="en">
+  <head>
+    <meta charset="utf-8" />
+    <title>Origo DevTools Panel</title>
+    <base href="/" />
+    <meta name="viewport" content="width=device-width, initial-scale=1" />
+  </head>
+  <body>
+    <origo-devtools-root></origo-devtools-root>
+  </body>
+</html>
diff --git a/packages/devtools/src/devtools-panel/app.component.spec.ts b/packages/devtools/src/devtools-panel/app.component.spec.ts
new file mode 100644
index 0000000..a253b32
--- /dev/null
+++ b/packages/devtools/src/devtools-panel/app.component.spec.ts
@@ -0,0 +1,36 @@
+import { ComponentFixture, TestBed } from '@angular/core/testing';
+import { AppComponent } from './app.component';
+import { vi } from 'vitest';
+
+describe('AppComponent', () => {
+  let component: AppComponent;
+  let fixture: ComponentFixture<AppComponent>;
+
+  beforeEach(async () => {
+    await TestBed.configureTestingModule({
+      imports: [AppComponent],
+    }).compileComponents();
+
+    fixture = TestBed.createComponent(AppComponent);
+    component = fixture.componentInstance;
+
+    // Mock chrome connection
+    global.chrome.runtime.connect = vi.fn().mockReturnValue({
+      postMessage: vi.fn(),
+      onMessage: { addListener: vi.fn() },
+      onDisconnect: { addListener: vi.fn() },
+    });
+
+    fixture.detectChanges();
+  });
+
+  it('should initialize connection on init', () => {
+    expect(chrome.runtime.connect).toHaveBeenCalledWith({
+      name: 'origo-devtools-panel',
+    });
+  });
+
+  it('should have INITIALIZING state initially', () => {
+    expect(component.connectionState()).toBe('INITIALIZING');
+  });
+});
diff --git a/packages/devtools/src/devtools-panel/app.component.ts b/packages/devtools/src/devtools-panel/app.component.ts
new file mode 100644
index 0000000..7e8f79c
--- /dev/null
+++ b/packages/devtools/src/devtools-panel/app.component.ts
@@ -0,0 +1,257 @@
+import { Component, OnInit, signal } from '@angular/core';
+import { CommonModule } from '@angular/common';
+import type { DevToolsMessage, ErrorTelemetryResponseMessage } from '../types/messages';
+import { ComponentTreeComponent } from './component-tree/component-tree.component';
+import { MetadataDetailComponent } from './metadata-detail/metadata-detail.component';
+
+export type ConnectionState = 'INITIALIZING' | 'CONNECTED' | 'NOT_AVAILABLE' | 'CONNECTION_LOST';
+
+@Component({
+  selector: 'origo-devtools-root',
+  standalone: true,
+  imports: [CommonModule, ComponentTreeComponent, MetadataDetailComponent],
+  template: `
+    <div class="devtools-container">
+      <header class="header">
+        <div class="title-group">
+          <h1>Origo DevTools</h1>
+          <button class="icon-btn" (click)="reconnect()" title="Refresh Connection">🔄</button>
+        </div>
+        <span class="status-badge" [class]="connectionState().toLowerCase()">
+          {{ connectionState() }}
+        </span>
+      </header>
+
+      <main class="main-content">
+        <ng-container *ngIf="connectionState() === 'CONNECTED'; else fallback">
+          <div class="split-pane">
+            <div class="tree-pane">
+              <origo-devtools-tree
+                [renderingPath]="renderingPath()"
+                (nodeSelected)="onNodeSelected($event)"
+              ></origo-devtools-tree>
+            </div>
+            <div class="detail-pane">
+              <origo-devtools-metadata-detail
+                [metadataSource]="metadataSource()"
+                [resolutionChain]="resolutionChain()"
+              >
+              </origo-devtools-metadata-detail>
+            </div>
+          </div>
+        </ng-container>
+
+        <ng-template #fallback>
+          <div class="fallback-container">
+            <div *ngIf="connectionState() === 'NOT_AVAILABLE'" class="message not-available">
+              <h2>Origo DevTools Not Available</h2>
+              <p>Please run the application in development mode.</p>
+            </div>
+            <div *ngIf="connectionState() === 'CONNECTION_LOST'" class="message connection-lost">
+              <h2>Connection Lost</h2>
+              <p>Trying to reconnect to the application...</p>
+            </div>
+            <div *ngIf="connectionState() === 'INITIALIZING'" class="message initializing">
+              <h2>Connecting...</h2>
+            </div>
+          </div>
+        </ng-template>
+      </main>
+    </div>
+  `,
+  styles: [
+    `
+      :host {
+        display: block;
+        height: 100vh;
+        font-family: sans-serif;
+        overflow: hidden;
+        background-color: var(--origo-color-bg-base, #ffffff);
+        color: var(--origo-color-text-base, #333333);
+      }
+      .devtools-container {
+        display: flex;
+        flex-direction: column;
+        height: 100%;
+      }
+      .header {
+        padding: 8px 16px;
+        display: flex;
+        align-items: center;
+        justify-content: space-between;
+        border-bottom: 1px solid var(--origo-color-border, #e0e0e0);
+        background-color: var(--origo-color-bg-subtle, #f5f5f5);
+      }
+      .title-group {
+        display: flex;
+        align-items: center;
+        gap: 8px;
+      }
+      .title-group h1 {
+        margin: 0;
+        font-size: 14px;
+        font-weight: 600;
+      }
+      .icon-btn {
+        background: none;
+        border: none;
+        cursor: pointer;
+        font-size: 14px;
+        padding: 4px;
+        border-radius: 4px;
+        display: flex;
+        align-items: center;
+        justify-content: center;
+      }
+      .icon-btn:hover {
+        background-color: var(--origo-color-bg-hover, #e0e0e0);
+      }
+      .status-badge {
+        font-size: 11px;
+        padding: 2px 6px;
+        border-radius: 4px;
+        background: #ccc;
+      }
+      .status-badge.connected {
+        background: #4caf50;
+        color: white;
+      }
+      .status-badge.not_available {
+        background: #f44336;
+        color: white;
+      }
+      .status-badge.connection_lost {
+        background: #ff9800;
+        color: white;
+      }
+      .main-content {
+        flex: 1;
+        overflow: hidden;
+      }
+      .split-pane {
+        display: flex;
+        height: 100%;
+      }
+      .tree-pane {
+        flex: 1;
+        border-right: 1px solid var(--origo-color-border, #e0e0e0);
+        overflow-y: auto;
+      }
+      .detail-pane {
+        flex: 1;
+        overflow-y: auto;
+      }
+      .fallback-container {
+        display: flex;
+        align-items: center;
+        justify-content: center;
+        height: 100%;
+      }
+      .message {
+        text-align: center;
+        padding: 24px;
+        border-radius: 8px;
+        background: var(--origo-color-bg-subtle, #f5f5f5);
+      }
+    `,
+  ],
+})
+export class AppComponent implements OnInit {
+  connectionState = signal<ConnectionState>('INITIALIZING');
+
+  renderingPath = signal<unknown>(null);
+  metadataSource = signal<unknown>(null);
+  resolutionChain = signal<unknown>(null);
+  errorTelemetry = signal<unknown[]>([]);
+
+  private backgroundPageConnection!: chrome.runtime.Port;
+
+  ngOnInit() {
+    this.connectToBackground();
+  }
+
+  reconnect() {
+    this.connectionState.set('INITIALIZING');
+    if (this.backgroundPageConnection) {
+      try {
+        this.backgroundPageConnection.disconnect();
+      } catch (e) {
+        console.warn('Error disconnecting from background page:', e);
+      }
+    }
+    // Small delay to ensure cleanup before reconnecting
+    setTimeout(() => {
+      this.connectToBackground();
+    }, 100);
+  }
+
+  private connectToBackground() {
+    if (typeof chrome === 'undefined' || !chrome.runtime) {
+      this.connectionState.set('NOT_AVAILABLE');
+      return;
+    }
+
+    this.backgroundPageConnection = chrome.runtime.connect({
+      name: 'origo-devtools-panel',
+    });
+
+    this.backgroundPageConnection.postMessage({
+      name: 'init',
+      tabId: chrome.devtools.inspectedWindow.tabId,
+    });
+
+    this.backgroundPageConnection.onMessage.addListener((msg: any) => {
+      if (msg.source === 'origo-devtools-injected') {
+        this.handleMessage(msg.payload as DevToolsMessage);
+      }
+    });
+
+    this.backgroundPageConnection.onDisconnect.addListener(() => {
+      this.connectionState.set('CONNECTION_LOST');
+    });
+
+    // Send a ping to check availability
+    this.sendMessage({ type: 'PING' });
+  }
+
+  private sendMessage(message: unknown) {
+    if (this.backgroundPageConnection) {
+      this.backgroundPageConnection.postMessage({
+        tabId: chrome.devtools.inspectedWindow.tabId,
+        data: message,
+      });
+    }
+  }
+
+  private handleMessage(message: DevToolsMessage) {
+    switch (message.type) {
+      case 'NOT_AVAILABLE' as unknown:
+        this.connectionState.set('NOT_AVAILABLE');
+        break;
+      case 'PONG':
+        this.connectionState.set('CONNECTED');
+        // Initialize by requesting rendering path
+        this.sendMessage({ type: 'GET_RENDERING_PATH', payload: { badlPath: '' } });
+        // Also fetch initial error telemetry
+        this.sendMessage({ type: 'GET_ERROR_TELEMETRY', payload: {} });
+        break;
+      case 'ERROR_TELEMETRY_RESPONSE':
+        this.errorTelemetry.set((message as ErrorTelemetryResponseMessage).payload || []);
+        break;
+      case 'RENDERING_PATH_RESPONSE':
+        this.renderingPath.set(message.payload);
+        break;
+      case 'METADATA_SOURCE_RESPONSE':
+        this.metadataSource.set(message.payload);
+        break;
+      case 'RESOLUTION_CHAIN_RESPONSE':
+        this.resolutionChain.set(message.payload);
+        break;
+    }
+  }
+
+  onNodeSelected(badlPath: string) {
+    this.sendMessage({ type: 'GET_METADATA_SOURCE', payload: { badlPath } });
+    this.sendMessage({ type: 'GET_RESOLUTION_CHAIN', payload: { badlPath } });
+  }
+}
diff --git a/packages/devtools/src/devtools-panel/component-tree/component-tree.component.ts b/packages/devtools/src/devtools-panel/component-tree/component-tree.component.ts
new file mode 100644
index 0000000..3b6a3e0
--- /dev/null
+++ b/packages/devtools/src/devtools-panel/component-tree/component-tree.component.ts
@@ -0,0 +1,94 @@
+import { Component, Input, Output, EventEmitter } from '@angular/core';
+import { CommonModule } from '@angular/common';
+
+@Component({
+  selector: 'origo-devtools-tree',
+  standalone: true,
+  imports: [CommonModule],
+  template: `
+    <div class="tree-container">
+      <h3>Component Tree</h3>
+      <div *ngIf="!renderingPath" class="empty-state">No rendering path data available.</div>
+
+      <div *ngIf="renderingPath" class="tree-content">
+        <!-- In a real implementation this would use a virtualized tree like cdk-tree -->
+        <!-- For Phase 1 we display a simple nested list with depth limits -->
+        <ng-container
+          *ngTemplateOutlet="treeNode; context: { $implicit: renderingPath, depth: 0 }"
+        ></ng-container>
+      </div>
+    </div>
+
+    <ng-template #treeNode let-node let-depth="depth">
+      <div class="node" [style.padding-left.px]="depth * 16">
+        <div class="node-header" (click)="selectNode(node.badlPath)">
+          <span class="node-name">{{ node.name || 'Unknown' }}</span>
+          <span class="node-path">{{ node.badlPath }}</span>
+        </div>
+
+        <div class="node-children" *ngIf="node.children && depth < maxDepth">
+          <ng-container *ngFor="let child of node.children">
+            <ng-container
+              *ngTemplateOutlet="treeNode; context: { $implicit: child, depth: depth + 1 }"
+            ></ng-container>
+          </ng-container>
+        </div>
+        <div class="node-depth-limit" *ngIf="node.children && depth >= maxDepth">
+          [Max depth reached]
+        </div>
+      </div>
+    </ng-template>
+  `,
+  styles: [
+    `
+      .tree-container {
+        padding: 16px;
+      }
+      h3 {
+        margin-top: 0;
+        font-size: 14px;
+        color: var(--origo-color-text-muted, #666);
+      }
+      .empty-state {
+        padding: 24px;
+        text-align: center;
+        color: var(--origo-color-text-muted, #666);
+      }
+      .node-header {
+        cursor: pointer;
+        padding: 4px 8px;
+        border-radius: 4px;
+      }
+      .node-header:hover {
+        background-color: var(--origo-color-bg-hover, #eee);
+      }
+      .node-name {
+        font-weight: 600;
+        margin-right: 8px;
+      }
+      .node-path {
+        font-size: 11px;
+        color: var(--origo-color-text-muted, #666);
+      }
+      .node-depth-limit {
+        font-size: 11px;
+        color: var(--origo-color-text-muted, #666);
+        padding-left: 16px;
+        font-style: italic;
+      }
+    `,
+  ],
+})
+export class ComponentTreeComponent {
+  @Input() renderingPath: unknown;
+  @Output() nodeSelected = new EventEmitter<string>();
+
+  // Defend against cyclic graphs / deep nesting as required by 8-1 intel
+  maxDepth = 50;
+
+  selectNode(badlPath: string) {
+    if (badlPath) {
+      this.nodeSelected.emit(badlPath);
+    }
+  }
+}
diff --git a/packages/devtools/src/devtools-panel/main.ts b/packages/devtools/src/devtools-panel/main.ts
new file mode 100644
index 0000000..bb93e52
--- /dev/null
+++ b/packages/devtools/src/devtools-panel/main.ts
@@ -0,0 +1,4 @@
+import { bootstrapApplication } from '@angular/platform-browser';
+import { AppComponent } from './app.component';
+
+bootstrapApplication(AppComponent).catch(err => console.error(err));
diff --git a/packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts b/packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts
new file mode 100644
index 0000000..e5a9252
--- /dev/null
+++ b/packages/devtools/src/devtools-panel/metadata-detail/metadata-detail.component.ts
@@ -0,0 +1,103 @@
+import { Component, Input, OnChanges } from '@angular/core';
+import { CommonModule } from '@angular/common';
+
+@Component({
+  selector: 'origo-devtools-metadata-detail',
+  standalone: true,
+  imports: [CommonModule],
+  template: `
+    <div class="detail-container">
+      <h3>Metadata Details</h3>
+
+      <div *ngIf="!metadataSource && !resolutionChain" class="empty-state">
+        Select a node in the component tree to view details.
+      </div>
+
+      <div *ngIf="metadataSource" class="section">
+        <h4>Source Definition</h4>
+        <div class="json-viewer">
+          <pre>{{ formattedMetadata }}</pre>
+        </div>
+      </div>
+
+      <div *ngIf="resolutionChain" class="section">
+        <h4>Resolution Chain</h4>
+        <div class="json-viewer">
+          <pre>{{ formattedResolution }}</pre>
+        </div>
+      </div>
+    </div>
+  `,
+  styles: [
+    `
+      .detail-container {
+        padding: 16px;
+      }
+      h3 {
+        margin-top: 0;
+        font-size: 14px;
+        color: var(--origo-color-text-muted, #666);
+      }
+      h4 {
+        font-size: 13px;
+        margin-bottom: 8px;
+      }
+      .empty-state {
+        padding: 24px;
+        text-align: center;
+        color: var(--origo-color-text-muted, #666);
+      }
+      .section {
+        margin-bottom: 24px;
+      }
+      .json-viewer {
+        background: var(--origo-color-bg-subtle, #f5f5f5);
+        border: 1px solid var(--origo-color-border, #e0e0e0);
+        border-radius: 4px;
+        padding: 12px;
+        overflow-x: auto;
+      }
+      pre {
+        margin: 0;
+        font-size: 12px;
+        font-family: monospace;
+      }
+    `,
+  ],
+})
+export class MetadataDetailComponent implements OnChanges {
+  @Input() metadataSource: unknown;
+  @Input() resolutionChain: unknown;
+
+  formattedMetadata = '';
+  formattedResolution = '';
+
+  ngOnChanges() {
+    this.formattedMetadata = this.safeStringify(this.metadataSource);
+    this.formattedResolution = this.safeStringify(this.resolutionChain);
+  }
+
+  // Safe stringify with cycle detection for defense against cyclic graph bug (8-1 intel)
+  private safeStringify(obj: unknown): string {
+    if (!obj) return 'null';
+
+    const cache = new Set();
+    try {
+      return JSON.stringify(
+        obj,
+        (key, value) => {
+          if (typeof value === 'object' && value !== null) {
+            if (cache.has(value)) {
+              return '[Circular]';
+            }
+            cache.add(value);
+          }
+          return value;
+        },
+        2
+      );
+    } catch {
+      return '[Error parsing metadata]';
+    }
+  }
+}
diff --git a/packages/devtools/tsconfig.app.json b/packages/devtools/tsconfig.app.json
new file mode 100644
index 0000000..b516257
--- /dev/null
+++ b/packages/devtools/tsconfig.app.json
@@ -0,0 +1,14 @@
+{
+  "extends": "./tsconfig.json",
+  "compilerOptions": {
+    "outDir": "../../dist/out-tsc",
+    "types": ["chrome"]
+  },
+  "files": [
+    "src/devtools-panel/main.ts",
+    "src/background/background.ts",
+    "src/content-script/content-script.ts"
+  ],
+  "include": ["src/**/*.d.ts", "src/**/*.ts"],
+  "exclude": ["src/**/*.spec.ts", "src/test-setup.ts"]
+}
diff --git a/packages/devtools/tsconfig.json b/packages/devtools/tsconfig.json
new file mode 100644
index 0000000..b7b885d
--- /dev/null
+++ b/packages/devtools/tsconfig.json
@@ -0,0 +1,24 @@
+{
+  "extends": "../../tsconfig.base.json",
+  "compilerOptions": {
+    "module": "esnext",
+    "forceConsistentCasingInFileNames": true,
+    "strict": true,
+    "importHelpers": true,
+    "noImplicitOverride": true,
+    "noImplicitReturns": true,
+    "noFallthroughCasesInSwitch": true,
+    "noPropertyAccessFromIndexSignature": true,
+    "types": ["chrome"]
+  },
+  "files": [],
+  "include": [],
+  "references": [
+    {
+      "path": "./tsconfig.app.json"
+    },
+    {
+      "path": "./tsconfig.spec.json"
+    }
+  ]
+}
diff --git a/packages/devtools/tsconfig.spec.json b/packages/devtools/tsconfig.spec.json
new file mode 100644
index 0000000..0a9aa2f
--- /dev/null
+++ b/packages/devtools/tsconfig.spec.json
@@ -0,0 +1,14 @@
+{
+  "extends": "./tsconfig.json",
+  "compilerOptions": {
+    "outDir": "../../dist/out-tsc",
+    "types": ["vitest/globals", "vitest/importMeta", "vite/client", "node", "chrome"]
+  },
+  "include": [
+    "vite.config.ts",
+    "vitest.config.ts",
+    "src/**/*.spec.ts",
+    "src/**/*.test.ts",
+    "src/**/*.d.ts"
+  ]
+}
```
