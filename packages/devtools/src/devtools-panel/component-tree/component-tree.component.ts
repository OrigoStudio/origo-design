import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { RenderingPath } from '@origo/angular-renderer';

interface FlatNode {
  name: string;
  badlPath: string;
  depth: number;
}

@Component({
  selector: 'origo-devtools-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-container">
      <h3>Component Tree</h3>
      <div *ngIf="!renderingPath" class="empty-state">No rendering path data available.</div>

      <div *ngIf="renderingPath" class="tree-content">
        <!-- Flattened list is virtualized-ready -->
        <div class="node" *ngFor="let node of flatTree" [style.padding-left.px]="node.depth * 16">
          <div class="node-header" (click)="selectNode(node.badlPath)">
            <span class="node-name">{{ node.name }}</span>
            <span class="node-path">{{ node.badlPath }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .tree-container {
        padding: 16px;
      }
      h3 {
        margin-top: 0;
        font-size: 14px;
        color: var(--origo-color-text-muted, #666);
      }
      .empty-state {
        padding: 24px;
        text-align: center;
        color: var(--origo-color-text-muted, #666);
      }
      .node-header {
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .node-header:hover {
        background-color: var(--origo-color-bg-hover, #f0f0f0);
      }
      .node-name {
        font-weight: 600;
        margin-right: 8px;
      }
      .node-path {
        font-size: 11px;
        color: var(--origo-color-text-muted, #666);
      }
      .node-depth-limit {
        font-size: 11px;
        color: var(--origo-color-text-muted, #666);
        padding-left: 16px;
        font-style: italic;
      }
    `,
  ],
})
export class ComponentTreeComponent implements OnChanges {
  @Input() renderingPath: RenderingPath | null = null;
  @Output() nodeSelected = new EventEmitter<string>();

  flatTree: FlatNode[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['renderingPath'] && this.renderingPath) {
      this.flatTree = this.flatten(this.renderingPath);
    } else if (!this.renderingPath) {
      this.flatTree = [];
    }
  }

  flatten(node: RenderingPath, depth = 0, seen = new Set<RenderingPath>()): FlatNode[] {
    if (!node || seen.has(node) || typeof node !== 'object') return [];
    seen.add(node);

    // Guard against missing properties or empty string
    if (node.badlPath === undefined || node.badlPath === null || node.badlPath === '') return [];

    const flatNode: FlatNode = { name: node.name || 'Unknown', badlPath: node.badlPath, depth };
    const result = [flatNode];

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        result.push(...this.flatten(child, depth + 1, seen));
      }
    }
    return result;
  }

  selectNode(badlPath: string) {
    if (badlPath) {
      this.nodeSelected.emit(badlPath);
    }
  }
}
