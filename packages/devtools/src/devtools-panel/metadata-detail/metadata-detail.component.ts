import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { MetadataSource, ResolutionChain } from '@origo/angular-renderer';

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
        <div class="data-table-container">
          <table class="data-table">
            <tbody>
              <tr *ngFor="let row of flatMetadata">
                <td class="key-col">{{ row.path }}</td>
                <td class="val-col">{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div *ngIf="resolutionChain" class="section">
        <h4>Resolution Chain</h4>
        <div class="data-table-container">
          <table class="data-table">
            <tbody>
              <tr *ngFor="let row of flatResolution">
                <td class="key-col">{{ row.path }}</td>
                <td class="val-col">{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Adding placeholder for theme token resolutions -->
      <div class="section">
        <h4>Theme Token Resolutions</h4>
        <div class="empty-state">No theme tokens mapped to this element.</div>
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
      .data-table-container {
        background: var(--origo-color-bg-subtle, #f5f5f5);
        border: 1px solid var(--origo-color-border, #e0e0e0);
        border-radius: 4px;
        overflow-x: auto;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-family: var(--origo-font-mono, monospace);
        font-size: var(--origo-font-size-sm, 12px);
      }
      .data-table td {
        padding: 4px 8px;
        border-bottom: 1px solid var(--origo-color-border-subtle, #eee);
      }
      .data-table tr:last-child td {
        border-bottom: none;
      }
      .key-col {
        font-weight: 600;
        color: var(--origo-color-text-muted, #666);
        white-space: nowrap;
      }
      .val-col {
        color: var(--origo-color-text-base, #333);
        word-break: break-all;
      }
    `,
  ],
})
export class MetadataDetailComponent implements OnChanges {
  @Input() metadataSource: MetadataSource | null = null;
  @Input() resolutionChain: ResolutionChain | null = null;

  flatMetadata: { path: string; value: string }[] = [];
  flatResolution: { path: string; value: string }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['metadataSource']) {
      this.flatMetadata = this.flattenObject(this.metadataSource);
    }
    if (changes['resolutionChain']) {
      this.flatResolution = this.flattenObject(this.resolutionChain);
    }
  }

  // Flattens an object to an array of paths and values to avoid recursive templates and cycle bugs
  private flattenObject(
    obj: unknown,
    prefix = '',
    seen = new Set(),
    result: { path: string; value: string }[] = []
  ): { path: string; value: string }[] {
    if (obj === null || obj === undefined) {
      if (prefix) result.push({ path: prefix, value: String(obj) });
      return result;
    }

    if (typeof obj !== 'object') {
      result.push({ path: prefix, value: String(obj) });
      return result;
    }

    if (seen.has(obj)) {
      result.push({ path: prefix, value: '[Circular]' });
      return result;
    }
    seen.add(obj);

    const isArray = Array.isArray(obj);
    const keys = Object.keys(obj as any);

    if (keys.length === 0) {
      result.push({ path: prefix, value: isArray ? '[]' : '{}' });
    } else {
      for (const key of keys) {
        const val = (obj as any)[key];
        const newPrefix = prefix ? (isArray ? `${prefix}[${key}]` : `${prefix}.${key}`) : key;
        this.flattenObject(val, newPrefix, seen, result);
      }
    }

    seen.delete(obj);
    return result;
  }
}
