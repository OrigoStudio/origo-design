import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface ProgressBarProps {
  value?: number;
  mode?: 'determinate' | 'indeterminate';
  showValue?: boolean;
  max?: number;
  label?: string;
  unit?: string;
  severity?: 'primary' | 'info' | 'success' | 'warn' | 'warning' | 'error' | string;
  height?: string;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const ProgressBarContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  value: 'number',
  mode: 'string',
  showValue: 'boolean',
  max: 'number',
  label: 'string',
  unit: 'string',
  severity: 'string',
  height: 'string',
} as const;

@Component({
  selector: 'origo-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class]': 'computedHostClasses()',
    '[attr.data-testid]': 'contract().id',
    role: 'progressbar',
    '[attr.aria-valuenow]': "mode() === 'determinate' ? clampedValue() : null",
    '[attr.aria-valuemin]': "mode() === 'determinate' ? '0' : null",
    '[attr.aria-valuemax]': "mode() === 'determinate' ? safeMax() : null",
    '[attr.aria-label]': "computedLabel() || 'Progress'",
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[style.--origo-progress-height]': 'computedHeight()',
  },
})
export class ProgressBarComponent implements OrigoAdapter<ProgressBarProps> {
  static readonly contractSchema = ProgressBarContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ProgressBarProps>>();

  complete = output<void>();
  valueChange = output<number>();

  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
  private hasCompleted = false;
  private lastReportedValue: number | null = null;
  private lastContractId: string | null = null;

  readonly coercedProps = computed(() =>
    coerceContractProps<ProgressBarProps>(this.contract()?.props, ProgressBarContractSchema)
  );

  readonly mode = computed(() => {
    return this.coercedProps().mode === 'indeterminate' ? 'indeterminate' : 'determinate';
  });

  readonly safeMax = computed(() => {
    const m = this.coercedProps().max;
    if (typeof m === 'boolean') return 100;
    const num = Number(m);
    return !isNaN(num) && num > 0 ? num : 100;
  });

  readonly clampedValue = computed(() => {
    const v = this.coercedProps().value;
    if (typeof v === 'boolean') return 0;
    const num = v !== undefined && v !== null ? Number(v) : 0;
    return Math.min(Math.max(isNaN(num) ? 0 : num, 0), this.safeMax());
  });

  readonly percentage = computed(() => {
    return (this.clampedValue() / this.safeMax()) * 100;
  });

  readonly showValue = computed(() => {
    if (this.mode() === 'indeterminate') return false;
    return this.coercedProps().showValue ?? true;
  });

  readonly computedLabel = computed(() => {
    return this.coercedProps().label ?? this.coercedProps()['aria-label'];
  });

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

  readonly unit = computed(() => this.coercedProps().unit ?? '%');

  readonly formattedValue = computed(() => {
    if (this.unit() === '%') {
      return `${Math.round(this.percentage())}%`;
    }
    return `${this.clampedValue()}${this.unit()}`;
  });

  readonly computedHeight = computed(() => {
    return this.coercedProps().height;
  });

  readonly computedSeverityClass = computed(() => {
    const s = this.coercedProps().severity?.toLowerCase() || 'primary';
    const normalized = s === 'warn' || s === 'warning' ? 'warning' : s;
    return `origo-progress-bar--severity-${normalized}`;
  });

  readonly computedHostClasses = computed(() => {
    const classes = ['origo-progress-bar-host', this.computedSeverityClass()];
    if (this.mode() === 'indeterminate') {
      classes.push('origo-progress-bar--indeterminate');
    }
    return classes.join(' ');
  });

  constructor() {
    effect(() => {
      const val = this.clampedValue();
      const max = this.safeMax();
      const currentMode = this.mode();
      const contractId = this.contract()?.id ?? null;

      if (this.lastContractId !== contractId) {
        this.lastContractId = contractId;
        this.hasCompleted = currentMode === 'determinate' && val >= max && max > 0;
        this.lastReportedValue = val;
        return;
      }

      if (currentMode === 'indeterminate') {
        this.hasCompleted = false;
      }

      // Subsequent changes
      if (this.lastReportedValue !== val) {
        this.lastReportedValue = val;
        untracked(() => {
          this.valueChange.emit(val);
          if (contractId) {
            this.experienceAdapter?.updateState(contractId, 'value', val);
          }
        });
      }

      if (currentMode === 'determinate' && val >= max && max > 0) {
        if (!this.hasCompleted) {
          this.hasCompleted = true;
          untracked(() => {
            this.complete.emit();
            if (contractId) {
              this.experienceAdapter?.dispatchCapability(contractId, 'complete', {
                value: val,
                max,
              });
            }
          });
        }
      } else if (val < max || currentMode === 'indeterminate') {
        this.hasCompleted = false;
      }
    });
  }
}
