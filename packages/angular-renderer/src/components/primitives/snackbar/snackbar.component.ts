import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  viewChild,
  TemplateRef,
  computed,
  signal,
  effect,
  DestroyRef,
  PLATFORM_ID,
  ViewContainerRef,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';
import { OrigoOverlayRef, OrigoGlobalPositionAlignment } from '../../../lib/overlay/overlay.models';

export type SnackbarPosition =
  | 'bottom-center'
  | 'bottom-start'
  | 'bottom-end'
  | 'top-center'
  | 'top-start'
  | 'top-end';

export interface SnackbarProps {
  visible?: boolean;
  message?: string;
  action?: string;
  actionLabel?: string;
  duration?: number;
  life?: number;
  position?: SnackbarPosition;
  severity?: 'info' | 'success' | 'warn' | 'error';
  closable?: boolean;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const SnackbarContractSchema = {
  visible: 'boolean',
  message: 'string',
  action: 'string',
  actionLabel: 'string',
  duration: 'number',
  life: 'number',
  position: 'string',
  severity: 'string',
  closable: 'boolean',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
} as const;

@Component({
  selector: 'origo-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-snackbar-host]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class SnackbarComponent implements OrigoAdapter<SnackbarProps> {
  static readonly contractSchema = SnackbarContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SnackbarProps>>();

  visibleChange = output<boolean>();
  open = output<void>();
  close = output<void>();
  actionClick = output<void>();

  snackbarTemplate = viewChild<TemplateRef<unknown>>('snackbarTemplate');

  private overlayService = inject(OrigoOverlayService);
  private experienceAdapter = inject(WebExperienceAdapterService);
  private destroyRef = inject(DestroyRef);
  private vcr = inject(ViewContainerRef);
  private platformId = inject(PLATFORM_ID);

  private overlayRef: OrigoOverlayRef | null = null;
  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  private lastContractVisible: boolean | null = null;

  readonly isVisible = signal(false);

  readonly coercedProps = computed(() =>
    coerceContractProps<SnackbarProps>(this.contract()?.props, SnackbarContractSchema)
  );

  readonly computedMessage = computed(() => this.coercedProps().message ?? '');

  readonly computedActionLabel = computed(
    () => this.coercedProps().actionLabel ?? this.coercedProps().action ?? ''
  );

  readonly position = computed<SnackbarPosition>(() => {
    return (this.coercedProps().position as SnackbarPosition) || 'bottom-center';
  });

  readonly normalizedSeverity = computed(() => {
    const s = this.coercedProps().severity?.toLowerCase();
    if (s === 'warn' || s === 'warning') return 'warning';
    if (s === 'error') return 'error';
    if (s === 'success') return 'success';
    return 'info';
  });

  readonly severity = computed(() => this.normalizedSeverity());

  readonly isClosable = computed(() => this.coercedProps().closable === true);

  readonly duration = computed(() => {
    const d = this.coercedProps().duration ?? this.coercedProps().life;
    return typeof d === 'number' ? d : 4000;
  });

  readonly ariaLabel = computed(() => this.coercedProps()['aria-label'] || 'Status notification');

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

  readonly role = computed(() => {
    const s = this.normalizedSeverity();
    return s === 'error' || s === 'warning' ? 'alert' : 'status';
  });

  readonly ariaLive = computed(() => {
    const s = this.normalizedSeverity();
    return s === 'error' || s === 'warning' ? 'assertive' : 'polite';
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearTimer();
      if (this.overlayRef) {
        this.overlayRef.dispose();
        this.overlayRef = null;
      }
    });

    effect(
      () => {
        const contractVisible = this.coercedProps().visible === true;
        if (this.lastContractVisible === null) {
          this.lastContractVisible = contractVisible;
          if (contractVisible) {
            this.openSnackbar();
          }
        } else if (this.lastContractVisible !== contractVisible) {
          this.lastContractVisible = contractVisible;
          if (contractVisible) {
            this.openSnackbar();
          } else {
            this.closeSnackbar(false);
          }
        }
      },
      { allowSignalWrites: true }
    );
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isVisible()) {
      this.closeSnackbar();
    }
  }

  openSnackbar(): void {
    if (this.isVisible()) return;
    this.isVisible.set(true);
    this.visibleChange.emit(true);
    this.open.emit();
    if (this.contract()?.id) {
      this.experienceAdapter.updateState(this.contract().id, 'visible', true);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.ensureOverlay();
      this.scheduleDismiss();
    }
  }

  closeSnackbar(notify = true): void {
    this.clearTimer();
    if (!this.isVisible()) return;

    this.isVisible.set(false);

    if (this.overlayRef) {
      this.overlayRef.close();
      this.overlayRef.dispose();
      this.overlayRef = null;
    }

    if (notify) {
      this.visibleChange.emit(false);
      this.close.emit();
      if (this.contract()?.id) {
        this.experienceAdapter.updateState(this.contract().id, 'visible', false);
      }
    }
  }

  onAction(): void {
    this.actionClick.emit();
    if (this.contract()?.id) {
      this.experienceAdapter.dispatchCapability(this.contract().id, 'action', {});
    }
    this.closeSnackbar();
  }

  private scheduleDismiss(): void {
    this.clearTimer();
    const dur = this.duration();
    if (dur > 0) {
      this.autoDismissTimer = setTimeout(() => {
        this.closeSnackbar();
      }, dur);
    }
  }

  private clearTimer(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  private ensureOverlay(): void {
    if (this.overlayRef) return;
    const template = this.snackbarTemplate();
    if (!template) return;

    this.overlayRef = this.overlayService.create({
      position: {
        type: 'global',
        position: this.position() as OrigoGlobalPositionAlignment,
      },
      hasBackdrop: false,
      panelClass: ['origo-overlay-pane--snackbar', 'origo-snackbar-portal'],
      viewContainerRef: this.vcr,
    });

    this.overlayRef.open(template, this.vcr);
  }
}
