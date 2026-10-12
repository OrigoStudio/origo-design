import {
  Injectable,
  inject,
  PLATFORM_ID,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Overlay, OverlayConfig, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

export interface SpikeOverlayOptions {
  triggerElement?: HTMLElement | ElementRef<HTMLElement>;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  panelClass?: string | string[];
  themeScope?: string; // e.g. 'theme-light', 'theme-dark'
  destroyRef?: DestroyRef;
}

export interface SpikeOverlayInstance {
  readonly overlayRef: OverlayRef | null;
  readonly isOpen: boolean;
  open(template: TemplateRef<unknown>, vcr: ViewContainerRef): void;
  close(): void;
  dispose(): void;
}

@Injectable({
  providedIn: 'root',
})
export class SpikeOverlayService {
  private readonly overlay = inject(Overlay, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /**
   * Helper to pierce Shadow DOM boundaries and find the true activeElement
   */
  getDeepActiveElement(): Element | null {
    if (!this.isBrowser || !this.document) {
      return null;
    }
    let active = this.document.activeElement;
    while (active && active.shadowRoot && active.shadowRoot.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  /**
   * Creates an SSR-safe overlay instance bound to a trigger element and Shadow DOM
   */
  create(options: SpikeOverlayOptions = {}): SpikeOverlayInstance {
    if (!this.isBrowser || !this.overlay) {
      // Safe SSR no-op
      return {
        overlayRef: null,
        isOpen: false,
        open: () => {
          /* no-op on server */
        },
        close: () => {
          /* no-op on server */
        },
        dispose: () => {
          /* no-op on server */
        },
      };
    }

    const triggerEl =
      options.triggerElement instanceof ElementRef
        ? options.triggerElement.nativeElement
        : options.triggerElement;

    // Capture originating active element (piercing shadowRoot if inside shadow DOM)
    let previousFocusedElement: HTMLElement | null = null;

    let positionStrategy = this.overlay.position().global().centerHorizontally().centerVertically();
    if (triggerEl) {
      const positions: ConnectedPosition[] = [
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 4,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -4,
        },
      ];
      positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(triggerEl)
        .withPositions(positions)
        .withPush(false);
    }

    const panelClasses = ['origo-overlay-pane'];
    if (options.themeScope) {
      panelClasses.push(options.themeScope);
    }
    if (options.panelClass) {
      if (Array.isArray(options.panelClass)) {
        panelClasses.push(...options.panelClass);
      } else {
        panelClasses.push(options.panelClass);
      }
    }

    const config = new OverlayConfig({
      positionStrategy,
      hasBackdrop: false,
      panelClass: panelClasses,
      disposeOnNavigation: true,
    });

    const cdkOverlayRef = this.overlay.create(config);
    let openState = false;
    let documentClickListener: ((e: MouseEvent) => void) | null = null;
    let documentKeydownListener: ((e: KeyboardEvent) => void) | null = null;

    const cleanupListeners = () => {
      if (documentClickListener && this.document) {
        this.document.removeEventListener('click', documentClickListener, true);
        documentClickListener = null;
      }
      if (documentKeydownListener && this.document) {
        this.document.removeEventListener('keydown', documentKeydownListener, true);
        documentKeydownListener = null;
      }
    };

    const instance: SpikeOverlayInstance = {
      get overlayRef() {
        return cdkOverlayRef;
      },
      get isOpen() {
        return openState;
      },
      open: (template: TemplateRef<unknown>, vcr: ViewContainerRef) => {
        if (openState) return;

        previousFocusedElement = this.getDeepActiveElement() as HTMLElement | null;

        const portal = new TemplatePortal(template, vcr);
        cdkOverlayRef.attach(portal);
        openState = true;

        const overlayPane = cdkOverlayRef.overlayElement;

        // Shadow DOM-Aware Outside Click Handler via event.composedPath()
        if (options.closeOnOutsideClick !== false && this.document) {
          documentClickListener = (event: MouseEvent) => {
            if (!openState) return;

            // CRITICAL: composedPath() pierces Shadow DOM boundaries
            const path = event.composedPath ? event.composedPath() : [];

            const isInsideOverlay =
              overlayPane &&
              (path.includes(overlayPane) || overlayPane.contains(event.target as Node));
            const isInsideTrigger =
              triggerEl && (path.includes(triggerEl) || triggerEl.contains(event.target as Node));

            if (!isInsideOverlay && !isInsideTrigger) {
              instance.close();
            }
          };

          // Attach with capture phase to detect event before local stoppers
          this.document.addEventListener('click', documentClickListener, true);
        }

        // Keyboard Handling (Escape & Focus Trap)
        if (this.document) {
          documentKeydownListener = (event: KeyboardEvent) => {
            if (!openState) return;

            if (options.closeOnEscape !== false && event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              instance.close();
              return;
            }

            if (options.trapFocus && event.key === 'Tab' && overlayPane) {
              const focusables = overlayPane.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
              );
              if (focusables.length === 0) return;

              const first = focusables[0];
              const last = focusables[focusables.length - 1];
              const active = this.getDeepActiveElement();

              if (event.shiftKey) {
                if (active === first || !overlayPane.contains(active)) {
                  event.preventDefault();
                  last.focus();
                }
              } else {
                if (active === last || !overlayPane.contains(active)) {
                  event.preventDefault();
                  first.focus();
                }
              }
            }
          };

          this.document.addEventListener('keydown', documentKeydownListener, true);
        }

        // Initial Focus into Overlay if trapFocus is enabled
        if (options.trapFocus && overlayPane) {
          setTimeout(() => {
            const firstFocusable = overlayPane.querySelector<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (firstFocusable) {
              firstFocusable.focus();
            }
          }, 0);
        }
      },

      close: () => {
        if (!openState) return;
        cleanupListeners();
        if (cdkOverlayRef.hasAttached()) {
          cdkOverlayRef.detach();
        }
        openState = false;

        // Restore focus to originating trigger inside Shadow DOM
        if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
          previousFocusedElement.focus();
        }
      },

      dispose: () => {
        instance.close();
        cdkOverlayRef.dispose();
      },
    };

    // Auto-cleanup on caller DestroyRef
    if (options.destroyRef) {
      options.destroyRef.onDestroy(() => {
        instance.dispose();
      });
    }

    return instance;
  }
}
