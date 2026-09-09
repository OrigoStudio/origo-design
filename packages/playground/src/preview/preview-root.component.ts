import { Component, HostListener, signal, computed } from '@angular/core';
import { CanonicalAST, ASTNode } from '@origo/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { OrigoRendererComponent } from '@origo/angular-renderer';

@Component({
  selector: 'origo-root',
  standalone: true,
  imports: [CommonModule, JsonPipe, OrigoRendererComponent],
  template: `
    @if (ast(); as validAst) {
      <div class="debug-ast">
        <h3>Compiled AST (No UI Primitives Registered Yet)</h3>
        <pre>{{ validAst | json }}</pre>
      </div>
      @if (uiNode(); as node) {
        <origo-renderer [node]="node" />
      }
    } @else {
      <div class="empty-state">Waiting for compilation...</div>
    }
  `,
  styleUrl: './preview-root.component.scss',
})
export class PreviewRootComponent {
  public ast = signal<CanonicalAST | null>(null);

  public uiNode = computed<ASTNode | null>(() => {
    const data = this.ast();
    if (!data) return null;
    return {
      id: 'root-vbox',
      type: 'vbox',
      children: [],
    };
  });

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) {
      return;
    }
    if (event.data?.type === 'RENDER_AST') {
      this.ast.set(event.data.ast);
    }
  }
}
