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
  computed,
  effect,
  DestroyRef,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
import {
  OrigoOverlayConfig,
  OrigoOverlayRef,
  OrigoOverlayOriginX,
  OrigoOverlayOriginY,
} from '../../../lib/overlay/overlay.models';

export interface PopoverProps {
  visible?: boolean;
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';
  dismissible?: boolean;
  closeOnEscape?: boolean;
  showClose?: boolean;
  offset?: [number, number];
  title?: string;
  data?: unknown;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const PopoverContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  visible: 'boolean',
  placement: 'string',
  dismissible: 'boolean',
  closeOnEscape: 'boolean',
  showClose: 'boolean',
  title: 'string',
  offset: 'array',
  data: 'object',
} as const;

function getConnectedPosition(
  placement = 'bottom',
  customOffset?: [number, number]
): {
  originX: OrigoOverlayOriginX;
  originY: OrigoOverlayOriginY;
  overlayX: OrigoOverlayOriginX;
  overlayY: OrigoOverlayOriginY;
  offset: [number, number];
} {
  switch (placement) {
    case 'top':
      return {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offset: customOffset ?? [0, -8],
      };
    case 'top-start':
      return {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom',
        offset: customOffset ?? [0, -8],
      };
    case 'top-end':
      return {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom',
        offset: customOffset ?? [0, -8],
      };
    case 'left':
      return {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        offset: customOffset ?? [-8, 0],
      };
    case 'left-start':
      return {
        originX: 'start',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'top',
        offset: customOffset ?? [-8, 0],
      };
    case 'left-end':
      return {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'bottom',
        offset: customOffset ?? [-8, 0],
      };
    case 'right':
      return {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offset: customOffset ?? [8, 0],
      };
    case 'right-start':
      return {
        originX: 'end',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offset: customOffset ?? [8, 0],
      };
    case 'right-end':
      return {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'bottom',
        offset: customOffset ?? [8, 0],
      };
    case 'bottom-start':
      return {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offset: customOffset ?? [0, 8],
      };
    case 'bottom-end':
      return {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top',
        offset: customOffset ?? [0, 8],
      };
    case 'bottom':
    default:
      return {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offset: customOffset ?? [0, 8],
      };
  }
}

@Component({
  selector: 'origo-popover',
  standalone: true,
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-popover-host]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class PopoverComponent implements OrigoAdapter<PopoverProps>, ContainerComponent {
  static readonly contractSchema = PopoverContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<PopoverProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });

  triggerWrapper = viewChild<ElementRef<HTMLElement>>('triggerWrapper');
  popoverTemplate = viewChild('popoverTemplate', { read: TemplateRef });

  visibleChange = output<boolean>();
  open = output<void>();
  close = output<void>();
  action = output<unknown>();

  private overlayService = inject(OrigoOverlayService);
  private destroyRef = inject(DestroyRef);
  private vcr = inject(ViewContainerRef);
  private experienceAdapter = inject(WebExperienceAdapterService);

  private overlayRef: OrigoOverlayRef | null = null;
  private isPopoverOpen = false;

  coercedProps = computed(() =>
    coerceContractProps<PopoverProps>(this.contract()?.props ?? {}, PopoverContractSchema)
  );

  computedVisible = computed(() => !!this.coercedProps().visible);
  computedPlacement = computed(() => this.coercedProps().placement ?? 'bottom');
  computedDismissible = computed(() => this.coercedProps().dismissible !== false);
  computedCloseOnEscape = computed(() => this.coercedProps().closeOnEscape !== false);
  computedShowClose = computed(() => !!this.coercedProps().showClose);
  computedOffset = computed(() => this.coercedProps().offset);
  computedTitle = computed(() => this.coercedProps().title);

  computedAriaLabel = computed(() => {
    const label = this.contract()?.props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : 'Popover';
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract()?.props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  constructor() {
    effect(() => {
      const visible = this.computedVisible();
      if (visible && !this.isPopoverOpen) {
        this.openPopover();
      } else if (!visible && this.isPopoverOpen) {
        this.closePopover(false);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  isOpen(): boolean {
    return this.isPopoverOpen;
  }

  toggle(): void {
    if (this.isPopoverOpen) {
      this.closePopover(true);
    } else {
      this.openPopover();
    }
  }

  openPopover(): void {
    if (this.isPopoverOpen) return;

    const tpl = this.popoverTemplate();
    const trigger = this.triggerWrapper()?.nativeElement;
    if (!tpl || !trigger) return;

    const pos = getConnectedPosition(this.computedPlacement(), this.computedOffset());

    const config: OrigoOverlayConfig = {
      position: {
        type: 'connected',
        target: trigger,
        originX: pos.originX,
        originY: pos.originY,
        overlayX: pos.overlayX,
        overlayY: pos.overlayY,
        offset: pos.offset,
        autoRepositionOnResize: true,
      },
      hasBackdrop: false,
      panelClass: ['origo-overlay-pane--popover', 'origo-overlay-pane--connected'],
      closeOnOutsideClick: this.computedDismissible(),
      closeOnEscape: this.computedCloseOnEscape(),
      viewContainerRef: this.vcr,
    };

    this.overlayRef = this.overlayService.create(config, this.destroyRef);
    this.overlayRef.open(tpl, this.vcr);
    this.isPopoverOpen = true;

    this.visibleChange.emit(true);
    this.open.emit();
    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
    this.experienceAdapter.dispatchCapability(this.contract().id, 'open', undefined);

    this.overlayRef.afterClosed().then(result => {
      if (this.isPopoverOpen) {
        this.isPopoverOpen = false;
        this.visibleChange.emit(false);
        this.close.emit();
        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
        this.experienceAdapter.dispatchCapability(this.contract().id, 'close', result);
      }
    });
  }

  closePopover(notify = true): void {
    if (!this.isPopoverOpen) return;
    this.isPopoverOpen = false;

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

  private cleanup(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isPopoverOpen = false;
  }
}
