import { Component, ElementRef, effect, inject, viewChild, signal } from '@angular/core';
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
  private isIframeLoaded = signal(false);

  constructor() {
    effect(() => {
      const ast = this.previewService.compiledAstSignal();
      const iframeEl = this.iframe().nativeElement;
      const loaded = this.isIframeLoaded();

      if (ast && iframeEl.contentWindow && loaded) {
        // Send AST to iframe
        iframeEl.contentWindow.postMessage({ type: 'RENDER_AST', ast }, window.location.origin);
      }
    });
  }

  onIframeLoad() {
    this.isIframeLoaded.set(true);
  }
}
