import { Component, HostListener, signal, ChangeDetectorRef, inject } from '@angular/core';
import { CanonicalAST } from '@origo/core';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'origo-preview-root',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  template: `
    @if (ast()) {
      <div class="debug-ast">
        <h3>Compiled AST (No UI Primitives Registered Yet)</h3>
        <pre>{{ ast() | json }}</pre>
      </div>
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
  private cdr = inject(ChangeDetectorRef);

  @HostListener('window:message', ['$event'])
  onMessage(event: MessageEvent) {
    if (event.data?.type === 'RENDER_AST') {
      this.ast.set(event.data.ast);
      this.cdr.detectChanges();
    }
  }
}
