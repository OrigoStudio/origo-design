import {
  Component,
  input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large' | string;
  strokeWidth?: number | string;
  label?: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'contrast'
    | 'success'
    | 'warn'
    | 'warning'
    | 'error'
    | string;
  animationDuration?: string;
  fill?: string;
  fluid?: boolean;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const SpinnerContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  size: 'string',
  strokeWidth: 'number',
  label: 'string',
  variant: 'string',
  animationDuration: 'string',
  fill: 'string',
  fluid: 'boolean',
} as const;

@Component({
  selector: 'origo-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-spinner-host]': 'true',
    '[attr.data-testid]': 'contract().id',
    role: 'status',
    'aria-live': 'polite',
    '[attr.aria-label]': 'computedLabel()',
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[class.origo-spinner--fluid]': 'isFluid()',
    '[class]': 'computedVariantClass()',
    '[style.--origo-spinner-size]': 'computedSize()',
    '[style.--origo-spinner-duration]': 'computedDuration()',
  },
})
export class SpinnerComponent implements OrigoAdapter<SpinnerProps> {
  static readonly contractSchema = SpinnerContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SpinnerProps>>();

  readonly coercedProps = computed(() =>
    coerceContractProps<SpinnerProps>(this.contract()?.props, SpinnerContractSchema)
  );

  readonly computedSize = computed(() => {
    const s = this.coercedProps().size;
    if (s === 'small') return '1rem';
    if (s === 'large') return '3rem';
    if (s === 'medium') return '2rem';
    if (typeof s === 'string' && s.trim()) return s;
    return '2rem';
  });

  readonly computedStrokeWidth = computed(() => {
    const sw = this.coercedProps().strokeWidth;
    if (sw !== undefined && sw !== null && !isNaN(Number(sw))) {
      return Number(sw);
    }
    return 4;
  });

  readonly computedLabel = computed(() => {
    const label = this.coercedProps().label ?? this.coercedProps()['aria-label'];
    return label && label.trim() ? label : 'Loading...';
  });

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

  readonly computedDuration = computed(() => {
    return this.coercedProps().animationDuration || '1s';
  });

  readonly computedFill = computed(() => {
    return this.coercedProps().fill || 'none';
  });

  readonly isFluid = computed(() => {
    return this.coercedProps().fluid === true;
  });

  readonly computedVariantClass = computed(() => {
    const v = this.coercedProps().variant?.toLowerCase() || 'primary';
    const normalized = v === 'warn' || v === 'warning' ? 'warning' : v;
    return `origo-spinner--variant-${normalized}`;
  });
}
