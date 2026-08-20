import {
  Component,
  input,
  inject,
  ViewContainerRef,
  effect,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { ASTNode } from '@origo/core';
import { RENDERER_REGISTRY } from './renderer.tokens';
import { AdapterPipelineService, ContainerComponent } from '../adapters/web/adapter';

@Component({
  selector: 'origo-renderer',
  standalone: true,
  template: `<ng-container #vc></ng-container>`,
})
export class OrigoRendererComponent {
  node = input.required<ASTNode>();
  private registry = inject(RENDERER_REGISTRY, { optional: true }) ?? new Map();
  private vc = viewChild.required('vc', { read: ViewContainerRef });
  private destroyRef = inject(DestroyRef);
  private adapter = inject(AdapterPipelineService);
  private renderId = 0;
  private isDestroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => (this.isDestroyed = true));
    effect(() => {
      const n = this.node();
      const container = this.vc();
      const currentId = ++this.renderId;
      container.clear();
      if (n) {
        this.renderTree(n, container, currentId);
      }
    });
  }

  private async renderTree(rootNode: ASTNode, rootVc: ViewContainerRef, traversalId: number) {
    const queue: { node: ASTNode; vc: ViewContainerRef }[] = [{ node: rootNode, vc: rootVc }];
    const CHUNK_SIZE = 50;
    const visited = new Set<string>();

    while (queue.length > 0) {
      if (this.isDestroyed || traversalId !== this.renderId) return;
      let processed = 0;

      while (queue.length > 0 && processed < CHUNK_SIZE) {
        const item = queue.shift();
        if (!item) continue;
        processed++;
        const { node, vc } = item;

        if (visited.has(node.id)) continue;
        visited.add(node.id);

        const componentType = this.registry.get(node.type);

        if (!componentType) {
          console.warn(`No primitive found for node type: ${node.type}`);
          if (node.children && node.children.length > 0) {
            for (const child of node.children) {
              if (child) queue.push({ node: child, vc });
            }
          }
          continue;
        }

        const componentRef = vc.createComponent(componentType);

        // Extract optional schema/strict mode if defined on the component class
        const schema = (componentType as unknown as Record<string, unknown>)['contractSchema'] as
          | Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>
          | undefined;
        const strict =
          (componentType as unknown as Record<string, unknown>)['strictContract'] === true;

        const preparedNode = this.adapter.prepareNode(node, schema, strict);

        if ('contract' in (componentRef.instance as Record<string, unknown>)) {
          componentRef.setInput('contract', preparedNode);
        } else {
          console.warn(
            `Component for ${node.type} does not implement OrigoAdapter (missing 'contract' input).`
          );
        }

        if (node.children && node.children.length > 0) {
          componentRef.changeDetectorRef.detectChanges();
          const instance = componentRef.instance as ContainerComponent;
          let childVc = instance.vc || instance.viewContainerRef;

          if (typeof childVc === 'function') {
            childVc = childVc();
          }

          if (childVc) {
            for (const child of node.children) {
              if (child) queue.push({ node: child, vc: childVc });
            }
          } else {
            console.warn(
              `Component for ${node.type} has children but does not expose a ViewContainerRef as 'vc'`
            );
          }
        } else {
          componentRef.changeDetectorRef.markForCheck();
        }
      }

      if (queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  }
}
