import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { DevToolsMessage, ErrorTelemetryResponseMessage } from '../types/messages';
import { ComponentTreeComponent } from './component-tree/component-tree.component';
import { MetadataDetailComponent } from './metadata-detail/metadata-detail.component';
import type {
  RenderingPath,
  MetadataSource,
  ResolutionChain,
  ErrorContext,
} from '@origo/angular-renderer';

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

          <div *ngIf="errorTelemetry().length > 0" class="error-telemetry-pane">
            <h3>Error Telemetry</h3>
            <ul>
              <li *ngFor="let err of errorTelemetry()">
                <strong>{{ err.message }}</strong
                ><br />
                <small>{{ err.badlPath }}</small>
              </li>
            </ul>
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
        background: var(--origo-color-bg-muted, #ccc);
        color: var(--origo-color-text-base, #333);
      }
      .status-badge.connected {
        background: var(--origo-color-success-bg, #4caf50);
        color: var(--origo-color-success-text, white);
      }
      .status-badge.not_available {
        background: var(--origo-color-error-bg, #f44336);
        color: var(--origo-color-error-text, white);
      }
      .status-badge.connection_lost {
        background: var(--origo-color-warning-bg, #ff9800);
        color: var(--origo-color-warning-text, white);
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

  renderingPath = signal<RenderingPath | null>(null);
  metadataSource = signal<MetadataSource | null>(null);
  resolutionChain = signal<ResolutionChain | null>(null);
  errorTelemetry = signal<ErrorContext[]>([]);

  private backgroundPageConnection!: chrome.runtime.Port;
  private reconnectTimeoutId: any;

  ngOnInit() {
    this.connectToBackground();
  }

  reconnect() {
    if (this.connectionState() === 'INITIALIZING') return;
    this.connectionState.set('INITIALIZING');
    if (this.backgroundPageConnection) {
      try {
        this.backgroundPageConnection.disconnect();
      } catch (e) {
        console.warn('Error disconnecting from background page:', e);
      }
    }
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }
    // Small delay to ensure cleanup before reconnecting
    this.reconnectTimeoutId = setTimeout(() => {
      this.connectToBackground();
    }, 100);
  }

  private connectToBackground() {
    if (
      typeof chrome === 'undefined' ||
      !chrome.runtime ||
      typeof chrome.runtime.connect !== 'function'
    ) {
      this.connectionState.set('NOT_AVAILABLE');
      return;
    }

    if (!chrome.devtools?.inspectedWindow) {
      this.connectionState.set('NOT_AVAILABLE');
      return;
    }

    this.backgroundPageConnection = chrome.runtime.connect({
      name: 'origo-devtools-panel',
    });

    try {
      this.backgroundPageConnection.postMessage({
        name: 'init',
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    } catch (e) {
      this.connectionState.set('NOT_AVAILABLE');
      return;
    }

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
    if (this.connectionState() === 'CONNECTION_LOST') return;
    if (this.backgroundPageConnection && chrome.devtools?.inspectedWindow) {
      try {
        this.backgroundPageConnection.postMessage({
          tabId: chrome.devtools.inspectedWindow.tabId,
          data: message,
        });
      } catch (e) {
        console.warn('Failed to send message to background page', e);
      }
    }
  }

  private handleMessage(message: DevToolsMessage) {
    switch (message.type) {
      case 'NOT_AVAILABLE':
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
      default:
        console.warn('Unhandled devtools message type:', message.type);
        break;
    }
  }

  onNodeSelected(badlPath: string) {
    this.sendMessage({ type: 'GET_METADATA_SOURCE', payload: { badlPath } });
    this.sendMessage({ type: 'GET_RESOLUTION_CHAIN', payload: { badlPath } });
  }
}
