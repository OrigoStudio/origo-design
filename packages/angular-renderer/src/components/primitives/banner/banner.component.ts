import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  inject,
  viewChild,
  ViewContainerRef,
  computed,
  signal,
  effect,
  DestroyRef,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface BannerAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'text' | string;
}

export interface BannerProps {
  visible?: boolean;
  severity?: 'info' | 'success' | 'warn' | 'error';
  title?: string;
  message?: string;
  text?: string;
  icon?: string;
  closable?: boolean;
  sticky?: boolean;
  fluid?: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
  actions?: BannerAction[];
  life?: number;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const BannerContractSchema = {
  visible: 'boolean',
  severity: 'string',
  title: 'string',
  message: 'string',
  text: 'string',
  icon: 'string',
  closable: 'boolean',
  sticky: 'boolean',
  fluid: 'boolean',
  variant: 'string',
  actions: 'array',
  life: 'number',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
} as const;

@Component({
  selector: 'origo-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-banner-host]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[class.origo-banner--sticky]': 'isSticky()',
    '[class.origo-banner--hidden]': '!isVisible()',
  },
})
export class BannerComponent implements OrigoAdapter<BannerProps>, ContainerComponent {
  static readonly contractSchema = BannerContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<BannerProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });

  visibleChange = output<boolean>();
  close = output<void>();
  action = output<{ action: string; data?: unknown }>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  readonly isVisible = signal(true);

  readonly coercedProps = computed(() =>
    coerceContractProps<BannerProps>(this.contract()?.props, BannerContractSchema)
  );

  readonly normalizedSeverity = computed(() => {
    const s = this.coercedProps().severity?.toLowerCase();
    if (s === 'warn' || s === 'warning') return 'warning';
    if (s === 'error') return 'error';
    if (s === 'success') return 'success';
    return 'info';
  });

  readonly computedTitle = computed(() => this.coercedProps().title);

  readonly computedMessage = computed(
    () => this.coercedProps().message ?? this.coercedProps().text ?? ''
  );

  readonly computedVariant = computed(() => this.coercedProps().variant || 'standard');

  readonly isClosable = computed(() => this.coercedProps().closable === true);

  readonly isSticky = computed(() => this.coercedProps().sticky === true);

  readonly isFluid = computed(() => this.coercedProps().fluid !== false);

  readonly actions = computed(() => this.coercedProps().actions ?? []);

  readonly customIcon = computed(() => this.coercedProps().icon);

  readonly ariaLabel = computed(() => {
    return this.coercedProps()['aria-label'] || this.computedTitle() || 'System announcement';
  });

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

  readonly ariaLive = computed(() => {
    const s = this.normalizedSeverity();
    return s === 'error' || s === 'warning' ? 'assertive' : 'polite';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());

    effect(() => {
      const props = this.coercedProps();
      const contractVisible = props.visible !== false;
      this.isVisible.set(contractVisible);

      this.clearTimer();

      if (contractVisible && props.life && props.life > 0 && isPlatformBrowser(this.platformId)) {
        this.autoDismissTimer = setTimeout(() => {
          this.onClose();
        }, props.life);
      }
    });
  }

  private clearTimer(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  onClose(): void {
    this.clearTimer();
    this.isVisible.set(false);
    this.visibleChange.emit(false);
    this.close.emit();
    this.experienceAdapter.updateState(this.contract().id, 'visible', false);
  }

  onActionClick(act: BannerAction): void {
    this.action.emit({ action: act.action, data: act });
    this.experienceAdapter.dispatchCapability(this.contract().id, act.action, act);
  }
}
