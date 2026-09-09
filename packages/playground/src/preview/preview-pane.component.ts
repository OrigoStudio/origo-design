import { Component, ElementRef, effect, inject, viewChild, signal, OnDestroy } from '@angular/core';
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
export class PreviewPaneComponent implements OnDestroy {
  private previewService = inject(PreviewService);
  private iframe = viewChild.required<ElementRef<HTMLIFrameElement>>('previewIframe');
  private isIframeLoaded = signal(false);
  private loadTimeoutId?: number;

  constructor() {
    // Timeout to prevent silent hang if iframe load event drops
    this.loadTimeoutId = window.setTimeout(() => {
      if (!this.isIframeLoaded()) {
        const contentWindow = this.iframe().nativeElement.contentWindow;
        if (!contentWindow) {
          console.error('Iframe contentWindow unavailable after timeout');
          return;
        }
        console.warn('Iframe load timeout reached, assuming loaded.');
        this.isIframeLoaded.set(true);
      }
    }, 5000);

    effect(() => {
      const ast = this.previewService.compiledAstSignal();
      const iframeEl = this.iframe().nativeElement;
      const loaded = this.isIframeLoaded();

      if (iframeEl.contentWindow && loaded) {
        // Send AST (or null to clear) to iframe
        iframeEl.contentWindow.postMessage({ type: 'RENDER_AST', ast }, window.location.origin);
      }
    });
  }

  onIframeLoad() {
    this.isIframeLoaded.set(true);
  }

  ngOnDestroy() {
    if (this.loadTimeoutId !== undefined) {
      window.clearTimeout(this.loadTimeoutId);
    }
  }
}
