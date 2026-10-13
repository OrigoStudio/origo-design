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
  signal,
  DestroyRef,
  HostListener,
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

let tooltipCounter = 0;

export interface TooltipProps {
  content?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
  trigger?: 'hover' | 'focus' | 'both' | 'manual';
  offset?: [number, number];
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const TooltipContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  content: 'string',
  position: 'string',
  showDelay: 'number',
  hideDelay: 'number',
  disabled: 'boolean',
  trigger: 'string',
  offset: 'array',
} as const;

function getTooltipConnectedPosition(
  position = 'top',
  customOffset?: [number, number]
): {
  originX: OrigoOverlayOriginX;
  originY: OrigoOverlayOriginY;
  overlayX: OrigoOverlayOriginX;
  overlayY: OrigoOverlayOriginY;
  offset: [number, number];
} {
  switch (position) {
    case 'bottom':
      return {
        originX: 'center',
        originY: 'bottom',
        overlayX: 'center',
        overlayY: 'top',
        offset: customOffset ?? [0, 6],
      };
    case 'left':
      return {
        originX: 'start',
        originY: 'center',
        overlayX: 'end',
        overlayY: 'center',
        offset: customOffset ?? [-6, 0],
      };
    case 'right':
      return {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offset: customOffset ?? [6, 0],
      };
    case 'top':
    default:
      return {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offset: customOffset ?? [0, -6],
      };
  }
}

@Component({
  selector: 'origo-tooltip',
  standalone: true,
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-tooltip-host]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class TooltipComponent implements OrigoAdapter<TooltipProps>, ContainerComponent {
  static readonly contractSchema = TooltipContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<TooltipProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });

  triggerWrapper = viewChild<ElementRef<HTMLElement>>('triggerWrapper');
  tooltipTemplate = viewChild('tooltipTemplate', { read: TemplateRef });

  visibleChange = output<boolean>();
  show = output<void>();
  hide = output<void>();

  private overlayService = inject(OrigoOverlayService);
  private destroyRef = inject(DestroyRef);
  private vcr = inject(ViewContainerRef);
  private experienceAdapter = inject(WebExperienceAdapterService);

  private readonly id = ++tooltipCounter;
  readonly tooltipId = `origo-tooltip-${this.id}`;

  private overlayRef: OrigoOverlayRef | null = null;
  readonly isTooltipOpen = signal(false);
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  coercedProps = computed(() =>
    coerceContractProps<TooltipProps>(this.contract()?.props ?? {}, TooltipContractSchema)
  );

  computedContent = computed(() => this.coercedProps().content);
  computedPosition = computed(() => this.coercedProps().position ?? 'top');
  computedShowDelay = computed(() => this.coercedProps().showDelay ?? 150);
  computedHideDelay = computed(() => this.coercedProps().hideDelay ?? 150);
  computedDisabled = computed(() => !!this.coercedProps().disabled);
  computedTrigger = computed(() => this.coercedProps().trigger ?? 'both');
  computedOffset = computed(() => this.coercedProps().offset);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cleanup();
    });
  }

  isOpen(): boolean {
    return this.isTooltipOpen();
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    this.clearTimers();
    this.hideTooltip();
  }

  onMouseEnter(): void {
    const tr = this.computedTrigger();
    if (tr === 'hover' || tr === 'both') {
      this.scheduleShow();
    }
  }

  onMouseLeave(): void {
    const tr = this.computedTrigger();
    if (tr === 'hover' || tr === 'both') {
      this.scheduleHide();
    }
  }

  onFocusIn(): void {
    const tr = this.computedTrigger();
    if (tr === 'focus' || tr === 'both') {
      this.scheduleShow();
    }
  }

  onFocusOut(): void {
    const tr = this.computedTrigger();
    if (tr === 'focus' || tr === 'both') {
      this.scheduleHide();
    }
  }

  private scheduleShow(): void {
    if (this.computedDisabled() || !this.computedContent()) {
      return;
    }

    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    if (this.isTooltipOpen()) return;

    const delay = this.computedShowDelay();
    if (delay <= 0) {
      this.showTooltip();
    } else {
      this.showTimer = setTimeout(() => {
        this.showTooltip();
      }, delay);
    }
  }

  private scheduleHide(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (!this.isTooltipOpen()) return;

    const delay = this.computedHideDelay();
    if (delay <= 0) {
      this.hideTooltip();
    } else {
      this.hideTimer = setTimeout(() => {
        this.hideTooltip();
      }, delay);
    }
  }

  showTooltip(): void {
    if (this.isTooltipOpen() || this.computedDisabled() || !this.computedContent()) return;

    const tpl = this.tooltipTemplate();
    const trigger = this.triggerWrapper()?.nativeElement;
    if (!tpl || !trigger) return;

    const pos = getTooltipConnectedPosition(this.computedPosition(), this.computedOffset());

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
      panelClass: [
        'origo-overlay-pane--tooltip',
        'origo-overlay-pane--connected',
        `origo-overlay-pane--tooltip-${this.computedPosition()}`,
      ],
      closeOnOutsideClick: false,
      closeOnEscape: true,
      viewContainerRef: this.vcr,
    };

    this.overlayRef = this.overlayService.create(config, this.destroyRef);
    this.overlayRef.open(tpl, this.vcr);
    this.isTooltipOpen.set(true);

    this.visibleChange.emit(true);
    this.show.emit();
    this.experienceAdapter.updateState(this.contract().id, 'visible', true);
    this.experienceAdapter.dispatchCapability(this.contract().id, 'show', undefined);

    this.overlayRef.afterClosed().then(() => {
      if (this.isTooltipOpen()) {
        this.isTooltipOpen.set(false);
        this.visibleChange.emit(false);
        this.hide.emit();
        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
        this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', undefined);
      }
    });
  }

  hideTooltip(): void {
    if (!this.isTooltipOpen()) return;
    this.isTooltipOpen.set(false);

    if (this.overlayRef?.isOpen) {
      this.overlayRef.close();
    }

    this.visibleChange.emit(false);
    this.hide.emit();
    this.experienceAdapter.updateState(this.contract().id, 'visible', false);
    this.experienceAdapter.dispatchCapability(this.contract().id, 'hide', undefined);
  }

  private clearTimers(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private cleanup(): void {
    this.clearTimers();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isTooltipOpen.set(false);
  }
}
