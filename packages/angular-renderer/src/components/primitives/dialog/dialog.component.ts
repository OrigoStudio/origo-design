import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  viewChild,
  ViewContainerRef,
  TemplateRef,
  ElementRef,
  signal,
  computed,
  effect,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
import { OrigoOverlayConfig, OrigoOverlayRef } from '../../../lib/overlay/overlay.models';

let dialogCounter = 0;

export interface DialogProps {
  visible?: boolean;
  header?: string;
  modal?: boolean;
  closable?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  maximized?: boolean;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  position?: 'center' | 'top' | 'bottom' | 'start' | 'end';
  blockScroll?: boolean;
  data?: unknown;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const DialogContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  visible: 'boolean',
  header: 'string',
  modal: 'boolean',
  closable: 'boolean',
  closeOnEscape: 'boolean',
  dismissableMask: 'boolean',
  draggable: 'boolean',
  resizable: 'boolean',
  maximizable: 'boolean',
  maximized: 'boolean',
  width: 'string',
  height: 'string',
  minWidth: 'string',
  minHeight: 'string',
  maxWidth: 'string',
  maxHeight: 'string',
  position: 'string',
  blockScroll: 'boolean',
  data: 'object',
} as const;

@Component({
  selector: 'origo-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-dialog-host]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class DialogComponent implements OrigoAdapter<DialogProps>, ContainerComponent {
  static readonly contractSchema = DialogContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<DialogProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });

  dialogTemplate = viewChild('dialogTemplate', { read: TemplateRef });
  dialogElement = viewChild<ElementRef<HTMLElement>>('dialogElement');

  visibleChange = output<boolean>();
  open = output<void>();
  close = output<void>();
  maximize = output<boolean>();
  restore = output<void>();
  dragEnd = output<{ x: number; y: number }>();
  resizeEnd = output<{ width: number; height: number }>();

  private overlayService = inject(OrigoOverlayService);
  private destroyRef = inject(DestroyRef);
  private vcr = inject(ViewContainerRef);
  private experienceAdapter = inject(WebExperienceAdapterService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  private readonly id = ++dialogCounter;
  readonly headerId = `origo-dialog-header-${this.id}`;
  readonly contentId = `origo-dialog-content-${this.id}`;

  private overlayRef: OrigoOverlayRef | null = null;
  private isOpen = false;
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  isMaximized = signal(false);
  dragPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  private isDragging = false;
  private dragStartCoords = { x: 0, y: 0 };
  private initialDragPos = { x: 0, y: 0 };
  private pointerMoveListener: ((e: PointerEvent) => void) | null = null;
  private pointerUpListener: ((e: PointerEvent) => void) | null = null;

  coercedProps = computed(() =>
    coerceContractProps<DialogProps>(this.contract()?.props ?? {}, DialogContractSchema)
  );

  computedVisible = computed(() => !!this.coercedProps().visible);
  computedHeader = computed(() => this.coercedProps().header);
  computedModal = computed(() => this.coercedProps().modal !== false);
  computedClosable = computed(() => this.coercedProps().closable !== false);
  computedCloseOnEscape = computed(() => this.coercedProps().closeOnEscape !== false);
  computedDismissableMask = computed(() => !!this.coercedProps().dismissableMask);
  computedDraggable = computed(() => !!this.coercedProps().draggable);
  computedResizable = computed(() => !!this.coercedProps().resizable);
  computedMaximizable = computed(() => !!this.coercedProps().maximizable);

  computedWidth = computed(() => this.coercedProps().width ?? '560px');
  computedHeight = computed(() => this.coercedProps().height ?? 'auto');
  computedMinWidth = computed(() => this.coercedProps().minWidth);
  computedMinHeight = computed(() => this.coercedProps().minHeight);
  computedMaxWidth = computed(() => this.coercedProps().maxWidth ?? '90vw');
  computedMaxHeight = computed(() => this.coercedProps().maxHeight ?? '90vh');
  computedPosition = computed(
    () =>
      (this.coercedProps().position as 'center' | 'top' | 'bottom' | 'start' | 'end') ?? 'center'
  );

  computedAriaLabel = computed(() => {
    const label = this.contract()?.props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract()?.props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  constructor() {
    effect(() => {
      const visible = this.computedVisible();
      if (visible && !this.isOpen) {
        this.openDialog();
      } else if (!visible && this.isOpen) {
        this.closeDialog(false);
      }
    });

    effect(() => {
      const maxProp = this.coercedProps().maximized;
      if (maxProp !== undefined) {
        this.isMaximized.set(!!maxProp);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  private openDialog(): void {
    if (this.isOpen) return;

    const tpl = this.dialogTemplate();
    if (!tpl) return;

    const config: OrigoOverlayConfig = {
      position: {
        type: 'global',
        position: this.computedPosition(),
        width: this.isMaximized() ? '100vw' : this.computedWidth(),
        height: this.isMaximized() ? '100vh' : this.computedHeight(),
        minWidth: this.isMaximized() ? '100vw' : this.computedMinWidth(),
        minHeight: this.isMaximized() ? '100vh' : this.computedMinHeight(),
        maxWidth: this.isMaximized() ? '100vw' : this.computedMaxWidth(),
        maxHeight: this.isMaximized() ? '100vh' : this.computedMaxHeight(),
      },
      hasBackdrop: this.computedModal(),
      backdropClass: 'origo-dialog-backdrop',
      panelClass: [
        'origo-overlay-pane--dialog',
        'origo-overlay-pane--modal',
        ...(this.isMaximized() ? ['origo-overlay-pane--maximized'] : []),
      ],
      closeOnBackdropClick: this.computedDismissableMask(),
      closeOnOutsideClick: this.computedDismissableMask(),
      closeOnEscape: this.computedCloseOnEscape(),
      trapFocus: this.computedModal(),
      viewContainerRef: this.vcr,
    };

    this.overlayRef = this.overlayService.create(config, this.destroyRef);
    this.overlayRef.open(tpl, this.vcr);
    this.isOpen = true;

    this.open.emit();
    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
    this.experienceAdapter.dispatchCapability(this.contract().id, 'open', undefined);

    this.setupResizeObserver();

    this.overlayRef.afterClosed().then(result => {
      if (this.isOpen) {
        this.isOpen = false;
        this.cleanupDrag();
        this.visibleChange.emit(false);
        this.close.emit();
        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
        this.experienceAdapter.dispatchCapability(this.contract().id, 'close', result);
      }
    });
  }

  private closeDialog(notify = true): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.cleanupDrag();

    if (this.overlayRef?.isOpen) {
      this.overlayRef.close();
    }

    if (notify) {
      this.visibleChange.emit(false);
      this.close.emit();
      this.experienceAdapter.updateState(this.contract().id, 'visible', false);
      this.experienceAdapter.dispatchCapability(this.contract().id, 'close', undefined);
    }
  }

  onClose(): void {
    this.closeDialog(true);
  }

  toggleMaximize(): void {
    const next = !this.isMaximized();
    this.isMaximized.set(next);

    if (this.overlayRef?.isOpen) {
      if (next) {
        this.overlayRef.addPanelClass?.('origo-overlay-pane--maximized');
        this.overlayRef.updateSize?.({
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
        });
      } else {
        this.overlayRef.removePanelClass?.('origo-overlay-pane--maximized');
        this.overlayRef.updateSize?.({
          width: this.computedWidth(),
          height: this.computedHeight(),
          maxWidth: this.computedMaxWidth(),
          maxHeight: this.computedMaxHeight(),
        });
      }
      this.overlayRef.updatePosition();
    }

    if (next) {
      this.maximize.emit(true);
      this.experienceAdapter.dispatchCapability(this.contract().id, 'maximize', true);
    } else {
      this.restore.emit();
      this.experienceAdapter.dispatchCapability(this.contract().id, 'restore', undefined);
    }
  }

  onHeaderPointerDown(event: PointerEvent): void {
    if (!this.computedDraggable() || this.isMaximized() || event.button !== 0) {
      return;
    }

    // Do not initiate dragging if clicking close or maximize buttons
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      return;
    }

    if (!isPlatformBrowser(this.platformId) || !this.document) {
      return;
    }

    this.cleanupDragListeners();
    this.isDragging = true;
    this.dragStartCoords = { x: event.clientX, y: event.clientY };
    this.initialDragPos = { ...this.dragPosition() };

    this.pointerMoveListener = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.dragStartCoords.x;
      const dy = e.clientY - this.dragStartCoords.y;
      this.dragPosition.set({
        x: this.initialDragPos.x + dx,
        y: this.initialDragPos.y + dy,
      });
    };

    this.pointerUpListener = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const finalPos = this.dragPosition();
      this.dragEnd.emit(finalPos);
      this.experienceAdapter.dispatchCapability(this.contract().id, 'dragEnd', finalPos);
      this.cleanupDragListeners();
    };

    this.document.addEventListener('pointermove', this.pointerMoveListener);
    this.document.addEventListener('pointerup', this.pointerUpListener);
  }

  private setupResizeObserver(): void {
    if (!isPlatformBrowser(this.platformId) || typeof ResizeObserver === 'undefined') {
      return;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      if (!this.isOpen) return;
      const el = this.dialogElement()?.nativeElement;
      if (!el) return;

      let initial = true;
      this.resizeObserver = new ResizeObserver(entries => {
        if (initial) {
          initial = false;
          return;
        }
        if (this.isMaximized()) return;
        for (const entry of entries) {
          const dims = {
            width: Math.round(entry.contentRect.width),
            height: Math.round(entry.contentRect.height),
          };
          this.resizeEnd.emit(dims);
          this.experienceAdapter.dispatchCapability(this.contract().id, 'resizeEnd', dims);
        }
      });

      this.resizeObserver.observe(el);
    }, 0);
  }

  private cleanupDrag(): void {
    this.isDragging = false;
    this.cleanupDragListeners();
  }

  private cleanupDragListeners(): void {
    if (this.pointerMoveListener && this.document) {
      this.document.removeEventListener('pointermove', this.pointerMoveListener);
      this.pointerMoveListener = null;
    }
    if (this.pointerUpListener && this.document) {
      this.document.removeEventListener('pointerup', this.pointerUpListener);
      this.pointerUpListener = null;
    }
  }

  private cleanup(): void {
    this.cleanupDrag();
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isOpen = false;
  }
}
