import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { DevToolsMessage, ErrorTelemetryResponseMessage } from '../types/messages';
import { ComponentTreeComponent } from './component-tree/component-tree.component';
import { MetadataDetailComponent } from './metadata-detail/metadata-detail.component';

export type ConnectionState = 'INITIALIZING' | 'CONNECTED' | 'NOT_AVAILABLE' | 'CONNECTION_LOST';

@Component({
  selector: 'origo-devtools-root',
  standalone: true,
  imports: [CommonModule, ComponentTreeComponent, MetadataDetailComponent],
  template: `
    <div class="devtools-container">
      <header class="header">
        <div class="title-group">
          <h1>Origo DevTools</h1>
          <button class="icon-btn" (click)="reconnect()" title="Refresh Connection">🔄</button>
        </div>
        <span class="status-badge" [class]="connectionState().toLowerCase()">
          {{ connectionState() }}
        </span>
      </header>

      <main class="main-content">
        <ng-container *ngIf="connectionState() === 'CONNECTED'; else fallback">
          <div class="split-pane">
            <div class="tree-pane">
              <origo-devtools-tree
                [renderingPath]="renderingPath()"
                (nodeSelected)="onNodeSelected($event)"
              ></origo-devtools-tree>
            </div>
            <div class="detail-pane">
              <origo-devtools-metadata-detail
                [metadataSource]="metadataSource()"
                [resolutionChain]="resolutionChain()"
              >
              </origo-devtools-metadata-detail>
            </div>
          </div>
        </ng-container>

        <ng-template #fallback>
          <div class="fallback-container">
            <div *ngIf="connectionState() === 'NOT_AVAILABLE'" class="message not-available">
              <h2>Origo DevTools Not Available</h2>
              <p>Please run the application in development mode.</p>
            </div>
            <div *ngIf="connectionState() === 'CONNECTION_LOST'" class="message connection-lost">
              <h2>Connection Lost</h2>
              <p>Trying to reconnect to the application...</p>
            </div>
            <div *ngIf="connectionState() === 'INITIALIZING'" class="message initializing">
              <h2>Connecting...</h2>
            </div>
          </div>
        </ng-template>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        font-family: sans-serif;
        overflow: hidden;
        background-color: var(--origo-color-bg-base, #ffffff);
        color: var(--origo-color-text-base, #333333);
      }
      .devtools-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .header {
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--origo-color-border, #e0e0e0);
        background-color: var(--origo-color-bg-subtle, #f5f5f5);
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .title-group h1 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
      .icon-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .icon-btn:hover {
        background-color: var(--origo-color-bg-hover, #e0e0e0);
      }
      .status-badge {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 4px;
        background: #ccc;
      }
      .status-badge.connected {
        background: #4caf50;
        color: white;
      }
      .status-badge.not_available {
        background: #f44336;
        color: white;
      }
      .status-badge.connection_lost {
        background: #ff9800;
        color: white;
      }
      .main-content {
        flex: 1;
        overflow: hidden;
      }
      .split-pane {
        display: flex;
        height: 100%;
      }
      .tree-pane {
        flex: 1;
        border-right: 1px solid var(--origo-color-border, #e0e0e0);
        overflow-y: auto;
      }
      .detail-pane {
        flex: 1;
        overflow-y: auto;
      }
      .fallback-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
      .message {
        text-align: center;
        padding: 24px;
        border-radius: 8px;
        background: var(--origo-color-bg-subtle, #f5f5f5);
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  connectionState = signal<ConnectionState>('INITIALIZING');

  renderingPath = signal<unknown>(null);
  metadataSource = signal<unknown>(null);
  resolutionChain = signal<unknown>(null);
  errorTelemetry = signal<unknown[]>([]);

  private backgroundPageConnection!: chrome.runtime.Port;

  ngOnInit() {
    this.connectToBackground();
  }

  reconnect() {
    this.connectionState.set('INITIALIZING');
    if (this.backgroundPageConnection) {
      try {
        this.backgroundPageConnection.disconnect();
      } catch (e) {
        console.warn('Error disconnecting from background page:', e);
      }
    }
    // Small delay to ensure cleanup before reconnecting
    setTimeout(() => {
      this.connectToBackground();
    }, 100);
  }

  private connectToBackground() {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      this.connectionState.set('NOT_AVAILABLE');
      return;
    }

    this.backgroundPageConnection = chrome.runtime.connect({
      name: 'origo-devtools-panel',
    });

    this.backgroundPageConnection.postMessage({
      name: 'init',
      tabId: chrome.devtools.inspectedWindow.tabId,
    });

    this.backgroundPageConnection.onMessage.addListener((msg: any) => {
      if (msg.source === 'origo-devtools-injected') {
        this.handleMessage(msg.payload as DevToolsMessage);
      }
    });

    this.backgroundPageConnection.onDisconnect.addListener(() => {
      this.connectionState.set('CONNECTION_LOST');
    });

    // Send a ping to check availability
    this.sendMessage({ type: 'PING' });
  }

  private sendMessage(message: unknown) {
    if (this.backgroundPageConnection) {
      this.backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        data: message,
      });
    }
  }

  private handleMessage(message: DevToolsMessage) {
    switch (message.type) {
      case 'NOT_AVAILABLE' as unknown:
        this.connectionState.set('NOT_AVAILABLE');
        break;
      case 'PONG':
        this.connectionState.set('CONNECTED');
        // Initialize by requesting rendering path
        this.sendMessage({ type: 'GET_RENDERING_PATH', payload: { badlPath: '' } });
        // Also fetch initial error telemetry
        this.sendMessage({ type: 'GET_ERROR_TELEMETRY', payload: {} });
        break;
      case 'ERROR_TELEMETRY_RESPONSE':
        this.errorTelemetry.set((message as ErrorTelemetryResponseMessage).payload || []);
        break;
      case 'RENDERING_PATH_RESPONSE':
        this.renderingPath.set(message.payload);
        break;
      case 'METADATA_SOURCE_RESPONSE':
        this.metadataSource.set(message.payload);
        break;
      case 'RESOLUTION_CHAIN_RESPONSE':
        this.resolutionChain.set(message.payload);
        break;
    }
  }

  onNodeSelected(badlPath: string) {
    this.sendMessage({ type: 'GET_METADATA_SOURCE', payload: { badlPath } });
    this.sendMessage({ type: 'GET_RESOLUTION_CHAIN', payload: { badlPath } });
  }
}
