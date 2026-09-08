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
  styles: [
    `
      .debug-ast {
        padding: 24px;
        overflow: auto;
        height: 100%;
        background: #fafafa;
        font-size: 13px;

        h3 {
          margin-top: 0;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }

        pre {
          background: #ffffff;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #eaeaea;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          color: #111827;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }
      .empty-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        color: #666;
        font-family: sans-serif;
      }
    `,
  ],
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
