import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'origo-devtools-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-container">
      <h3>Component Tree</h3>
      <div *ngIf="!renderingPath" class="empty-state">No rendering path data available.</div>

      <div *ngIf="renderingPath" class="tree-content">
        <!-- In a real implementation this would use a virtualized tree like cdk-tree -->
        <!-- For Phase 1 we display a simple nested list with depth limits -->
        <ng-container
          *ngTemplateOutlet="treeNode; context: { $implicit: renderingPath, depth: 0 }"
        ></ng-container>
      </div>
    </div>

    <ng-template #treeNode let-node let-depth="depth">
      <div class="node" [style.padding-left.px]="depth * 16">
        <div class="node-header" (click)="selectNode(node.badlPath)">
          <span class="node-name">{{ node.name || 'Unknown' }}</span>
          <span class="node-path">{{ node.badlPath }}</span>
        </div>

        <div class="node-children" *ngIf="node.children && depth < maxDepth">
          <ng-container *ngFor="let child of node.children">
            <ng-container
              *ngTemplateOutlet="treeNode; context: { $implicit: child, depth: depth + 1 }"
            ></ng-container>
          </ng-container>
        </div>
        <div class="node-depth-limit" *ngIf="node.children && depth >= maxDepth">
          [Max depth reached]
        </div>
      </div>
    </ng-template>
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
        background-color: var(--origo-color-bg-hover, #eee);
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
export class ComponentTreeComponent {
  @Input() renderingPath: unknown;
  @Output() nodeSelected = new EventEmitter<string>();

  // Defend against cyclic graphs / deep nesting as required by 8-1 intel
  maxDepth = 50;

  selectNode(badlPath: string) {
    if (badlPath) {
      this.nodeSelected.emit(badlPath);
    }
  }
}
