import { DestroyRef, ElementRef, TemplateRef, Type, ViewContainerRef } from '@angular/core';
import { OverlayRef as CdkOverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { OrigoOverlayConfig, OrigoOverlayContent, OrigoOverlayRef } from './overlay.models';

export const ORIGO_OVERLAY_FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

export function getDeepActiveElement(doc: Document | null): Element | null {
  if (!doc) return null;
  let active = doc.activeElement;
  while (active && active.shadowRoot && active.shadowRoot.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

export class OrigoNoopOverlayRef<T = unknown> implements OrigoOverlayRef<T> {
  readonly id: string;
  readonly isOpen = false;

  constructor(id = 'noop-overlay') {
    this.id = id;
  }

  open(): void {
    /* No-op in SSR */
  }

  close(): void {
    /* No-op in SSR */
  }

  afterClosed(): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  updatePosition(): void {
    /* No-op in SSR */
  }

  addPanelClass(): void {
    /* No-op in SSR */
  }

  removePanelClass(): void {
    /* No-op in SSR */
  }

  updateSize(): void {
    /* No-op in SSR */
  }

  dispose(): void {
    /* No-op in SSR */
  }
}

export class OrigoOverlayRefImpl<T = unknown> implements OrigoOverlayRef<T> {
  readonly id: string;
  private _isOpen = false;
  private previousFocusedElement: HTMLElement | null = null;

  private afterClosedResolve!: (value: T | undefined) => void;
  private afterClosedPromise: Promise<T | undefined>;

  private documentClickListener: ((e: MouseEvent) => void) | null = null;
  private documentKeydownListener: ((e: KeyboardEvent) => void) | null = null;
  private backdropSub: Subscription | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private initialFocusTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    id: string,
    private readonly cdkOverlayRef: CdkOverlayRef,
    private readonly config: OrigoOverlayConfig,
    private readonly document: Document | null,
    destroyRef?: DestroyRef
  ) {
    this.id = id;
    this.afterClosedPromise = new Promise<T | undefined>(resolve => {
      this.afterClosedResolve = resolve;
    });

    if (destroyRef) {
      destroyRef.onDestroy(() => {
        this.dispose();
      });
    }

    // Auto-reposition on target resize if requested
    if (
      this.config.position.type === 'connected' &&
      this.config.position.autoRepositionOnResize !== false &&
      typeof ResizeObserver !== 'undefined'
    ) {
      const targetEl =
        this.config.position.target instanceof ElementRef
          ? this.config.position.target.nativeElement
          : this.config.position.target;

      if (targetEl) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this._isOpen) {
            this.updatePosition();
          }
        });
        this.resizeObserver.observe(targetEl);
      }
    }
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  open(content?: OrigoOverlayContent, viewContainerRef?: ViewContainerRef): void {
    if (this._isOpen) return;

    if (!content && !this.cdkOverlayRef.hasAttached()) {
      throw new Error(
        '[OrigoOverlayRef] Content is required to open overlay. Provide a TemplateRef or Component Type.'
      );
    }

    this.previousFocusedElement = getDeepActiveElement(this.document) as HTMLElement | null;
    const effectiveVcr = viewContainerRef ?? this.config.viewContainerRef;

    if (content) {
      if (content instanceof TemplateRef) {
        if (!effectiveVcr) {
          throw new Error(
            '[OrigoOverlayRef] Opening a TemplateRef requires a ViewContainerRef. Provide it in OrigoOverlayConfig.viewContainerRef or open(template, viewContainerRef).'
          );
        }
        const portal = new TemplatePortal(content, effectiveVcr);
        this.cdkOverlayRef.attach(portal);
      } else {
        const portal = new ComponentPortal(content as Type<unknown>, effectiveVcr ?? null);
        this.cdkOverlayRef.attach(portal);
      }
    }

    this._isOpen = true;
    this.syncTriggerAria(true);
    this.setupListeners();
  }

  private setupListeners(): void {
    const overlayPane = this.cdkOverlayRef.overlayElement;

    // 1. Backdrop click
    if (this.config.hasBackdrop && this.config.closeOnBackdropClick !== false) {
      this.backdropSub = this.cdkOverlayRef.backdropClick().subscribe(() => {
        this.close();
      });
    }

    // 2. Outside click with event.composedPath() Shadow DOM piercing
    if (this.config.closeOnOutsideClick !== false && this.document) {
      const triggerEl =
        this.config.position.type === 'connected'
          ? this.config.position.target instanceof ElementRef
            ? this.config.position.target.nativeElement
            : this.config.position.target
          : null;

      this.documentClickListener = (event: MouseEvent) => {
        if (!this._isOpen) return;

        // Piercing Shadow DOM boundary via composedPath()
        const path = event.composedPath ? event.composedPath() : [];

        const isInsideOverlay =
          overlayPane && (path.includes(overlayPane) || overlayPane.contains(event.target as Node));
        const isInsideTrigger =
          triggerEl && (path.includes(triggerEl) || triggerEl.contains(event.target as Node));

        if (!isInsideOverlay && !isInsideTrigger) {
          this.close();
        }
      };

      this.document.addEventListener('click', this.documentClickListener, true);
    }

    // 3. Keydown handling (Escape & Focus Trap)
    if (this.document) {
      this.documentKeydownListener = (event: KeyboardEvent) => {
        if (!this._isOpen) return;

        if (this.config.closeOnEscape !== false && event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          this.close();
          return;
        }

        if (this.config.trapFocus && event.key === 'Tab' && overlayPane) {
          const focusables = overlayPane.querySelectorAll<HTMLElement>(
            ORIGO_OVERLAY_FOCUSABLE_SELECTOR
          );
          if (focusables.length === 0) return;

          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const active = getDeepActiveElement(this.document);

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

      this.document.addEventListener('keydown', this.documentKeydownListener, true);
    }

    // 4. Initial Focus
    if (this.config.trapFocus && overlayPane) {
      this.initialFocusTimeout = setTimeout(() => {
        if (!this._isOpen) return;
        const firstFocusable = overlayPane.querySelector<HTMLElement>(
          ORIGO_OVERLAY_FOCUSABLE_SELECTOR
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 0);
    }
  }

  private cleanupListeners(): void {
    if (this.initialFocusTimeout) {
      clearTimeout(this.initialFocusTimeout);
      this.initialFocusTimeout = null;
    }
    if (this.documentClickListener && this.document) {
      this.document.removeEventListener('click', this.documentClickListener, true);
      this.documentClickListener = null;
    }
    if (this.documentKeydownListener && this.document) {
      this.document.removeEventListener('keydown', this.documentKeydownListener, true);
      this.documentKeydownListener = null;
    }
    if (this.backdropSub) {
      this.backdropSub.unsubscribe();
      this.backdropSub = null;
    }
  }

  private syncTriggerAria(open: boolean): void {
    const triggerEl =
      this.config.position.type === 'connected'
        ? this.config.position.target instanceof ElementRef
          ? this.config.position.target.nativeElement
          : this.config.position.target
        : null;

    if (triggerEl && typeof triggerEl.setAttribute === 'function') {
      triggerEl.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && !triggerEl.hasAttribute('aria-controls')) {
        triggerEl.setAttribute('aria-controls', this.id);
      }
    }
  }

  close(result?: T): void {
    if (!this._isOpen) return;

    this.cleanupListeners();
    this.syncTriggerAria(false);
    if (this.cdkOverlayRef.hasAttached()) {
      this.cdkOverlayRef.detach();
    }
    this._isOpen = false;

    // Restore focus into originating element (pierces Shadow DOM)
    if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
      this.previousFocusedElement.focus();
    }

    this.afterClosedResolve(result);
  }

  afterClosed(): Promise<T | undefined> {
    return this.afterClosedPromise;
  }

  updatePosition(): void {
    this.cdkOverlayRef.updatePosition();
  }

  addPanelClass(classes: string | string[]): void {
    this.cdkOverlayRef.addPanelClass(classes);
  }

  removePanelClass(classes: string | string[]): void {
    this.cdkOverlayRef.removePanelClass(classes);
  }

  updateSize(sizeConfig: {
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
  }): void {
    this.cdkOverlayRef.updateSize(sizeConfig);
  }

  dispose(): void {
    this.close();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.cdkOverlayRef.dispose();
  }
}
