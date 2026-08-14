import { Injectable, ViewContainerRef, Signal } from '@angular/core';
import { ASTNode } from '@origo/core';

export interface ContainerComponent {
  viewContainerRef?: ViewContainerRef | Signal<ViewContainerRef>;
  vc?: ViewContainerRef | Signal<ViewContainerRef>;
}

export interface OrigoAdapter {
  node: unknown;
}

@Injectable({ providedIn: 'root' })
export class AdapterPipelineService {
  prepareNode(node: ASTNode): ASTNode {
    // In story 5.2 this will be adapted to OrigoAdapter props,
    // but for now it must return ASTNode to satisfy existing primitives.
    return node;
  }
}
