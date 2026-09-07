import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { PreviewService } from './preview.service';
import { CommonModule } from '@angular/common';
import { ErrorDisplayComponent } from './error-display.component';

@Component({
  selector: 'origo-playground-preview',
  standalone: true,
  imports: [CommonModule, ErrorDisplayComponent],
  templateUrl: './preview-pane.component.html',
  styleUrl: './preview-pane.component.scss',
})
export class PreviewPaneComponent {
  private previewService = inject(PreviewService);
  private iframe = viewChild.required<ElementRef<HTMLIFrameElement>>('previewIframe');

  constructor() {
    effect(() => {
      const ast = this.previewService.compiledAst();
      const iframeEl = this.iframe().nativeElement;
      if (ast && iframeEl.contentWindow) {
        // Send AST to iframe
        iframeEl.contentWindow.postMessage({ type: 'RENDER_AST', ast }, window.location.origin);
      }
    });
  }
}
