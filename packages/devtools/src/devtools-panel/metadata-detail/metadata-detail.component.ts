import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'origo-devtools-metadata-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-container">
      <h3>Metadata Details</h3>

      <div *ngIf="!metadataSource && !resolutionChain" class="empty-state">
        Select a node in the component tree to view details.
      </div>

      <div *ngIf="metadataSource" class="section">
        <h4>Source Definition</h4>
        <div class="json-viewer">
          <pre>{{ formattedMetadata }}</pre>
        </div>
      </div>

      <div *ngIf="resolutionChain" class="section">
        <h4>Resolution Chain</h4>
        <div class="json-viewer">
          <pre>{{ formattedResolution }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .detail-container {
        padding: 16px;
      }
      h3 {
        margin-top: 0;
        font-size: 14px;
        color: var(--origo-color-text-muted, #666);
      }
      h4 {
        font-size: 13px;
        margin-bottom: 8px;
      }
      .empty-state {
        padding: 24px;
        text-align: center;
        color: var(--origo-color-text-muted, #666);
      }
      .section {
        margin-bottom: 24px;
      }
      .json-viewer {
        background: var(--origo-color-bg-subtle, #f5f5f5);
        border: 1px solid var(--origo-color-border, #e0e0e0);
        border-radius: 4px;
        padding: 12px;
        overflow-x: auto;
      }
      pre {
        margin: 0;
        font-size: 12px;
        font-family: monospace;
      }
    `,
  ],
})
export class MetadataDetailComponent implements OnChanges {
  @Input() metadataSource: unknown;
  @Input() resolutionChain: unknown;

  formattedMetadata = '';
  formattedResolution = '';

  ngOnChanges() {
    this.formattedMetadata = this.safeStringify(this.metadataSource);
    this.formattedResolution = this.safeStringify(this.resolutionChain);
  }

  // Safe stringify with cycle detection for defense against cyclic graph bug (8-1 intel)
  private safeStringify(obj: unknown): string {
    if (!obj) return 'null';

    const cache = new Set();
    try {
      return JSON.stringify(
        obj,
        (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
              return '[Circular]';
            }
            cache.add(value);
          }
          return value;
        },
        2
      );
    } catch {
      return '[Error parsing metadata]';
    }
  }
}
