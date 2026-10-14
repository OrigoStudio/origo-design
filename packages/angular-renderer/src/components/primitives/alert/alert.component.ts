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

export interface AlertAction {
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'text' | string;
}

export interface AlertProps {
  visible?: boolean;
  severity?: 'info' | 'success' | 'warn' | 'warning' | 'error';
  title?: string;
  message?: string;
  text?: string;
  icon?: string;
  closable?: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
  actions?: AlertAction[];
  life?: number;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const AlertContractSchema = {
  visible: 'boolean',
  severity: 'string',
  title: 'string',
  message: 'string',
  text: 'string',
  icon: 'string',
  closable: 'boolean',
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
  selector: 'origo-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-alert-host]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[class.origo-alert--hidden]': '!isVisible()',
  },
})
export class AlertComponent implements OrigoAdapter<AlertProps>, ContainerComponent {
  static readonly contractSchema = AlertContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<AlertProps>>();
  vc = viewChild('vc', { read: ViewContainerRef });

  close = output<void>();
  action = output<{ action: string; data?: unknown }>();
  visibleChange = output<boolean>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  readonly isVisible = signal(true);

  readonly coercedProps = computed(() =>
    coerceContractProps<AlertProps>(this.contract()?.props, AlertContractSchema)
  );

  readonly normalizedSeverity = computed(() => {
    const sev = this.coercedProps().severity?.toLowerCase();
    if (sev === 'warn' || sev === 'warning') return 'warning';
    if (sev === 'error') return 'error';
    if (sev === 'success') return 'success';
    return 'info';
  });

  readonly computedVariant = computed(() => this.coercedProps().variant || 'standard');

  readonly computedTitle = computed(() => this.coercedProps().title);

  readonly computedMessage = computed(
    () => this.coercedProps().message ?? this.coercedProps().text ?? ''
  );

  readonly isClosable = computed(() => this.coercedProps().closable === true);

  readonly actions = computed(() => this.coercedProps().actions ?? []);

  readonly customIcon = computed(() => this.coercedProps().icon);

  readonly role = computed(() => {
    const sev = this.normalizedSeverity();
    return sev === 'error' || sev === 'warning' ? 'alert' : 'status';
  });

  readonly ariaLive = computed(() => {
    const sev = this.normalizedSeverity();
    return sev === 'error' || sev === 'warning' ? 'assertive' : 'polite';
  });

  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

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

  onActionClick(act: AlertAction): void {
    this.action.emit({ action: act.action, data: act });
    this.experienceAdapter.dispatchCapability(this.contract().id, act.action, act);
  }
}
