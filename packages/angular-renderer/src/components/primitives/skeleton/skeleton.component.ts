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

export interface SkeletonProps {
  shape?: 'rectangle' | 'circle';
  width?: string;
  height?: string;
  size?: string;
  borderRadius?: string;
  animation?: 'shimmer' | 'pulse' | 'none';
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const SkeletonContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  shape: 'string',
  width: 'string',
  height: 'string',
  size: 'string',
  borderRadius: 'string',
  animation: 'string',
} as const;

@Component({
  selector: 'origo-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-skeleton-host]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.role]': "ariaLabel() ? 'status' : null",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-describedby]': 'ariaDescribedBy()',
    '[style.inline-size]': 'computedWidth()',
    '[style.block-size]': 'computedHeight()',
  },
})
export class SkeletonComponent implements OrigoAdapter<SkeletonProps> {
  static readonly contractSchema = SkeletonContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SkeletonProps>>();

  readonly coercedProps = computed(() =>
    coerceContractProps<SkeletonProps>(this.contract()?.props, SkeletonContractSchema)
  );

  readonly shape = computed(() => {
    return this.coercedProps().shape === 'circle' ? 'circle' : 'rectangle';
  });

  readonly computedWidth = computed(() => {
    const props = this.coercedProps();
    if (props.size && props.size.trim()) return props.size;
    if (this.shape() === 'circle') return props.width || '2.5rem';
    return props.width || '100%';
  });

  readonly computedHeight = computed(() => {
    const props = this.coercedProps();
    if (props.size && props.size.trim()) return props.size;
    if (this.shape() === 'circle') return props.height || '2.5rem';
    return props.height || '1rem';
  });

  readonly computedBorderRadius = computed(() => {
    const props = this.coercedProps();
    if (props.borderRadius && props.borderRadius.trim()) return props.borderRadius;
    if (this.shape() === 'circle') return '50%';
    return 'var(--origo-radius-md, 0.375rem)';
  });

  readonly animation = computed(() => {
    const anim = this.coercedProps().animation;
    if (anim === 'pulse') return 'pulse';
    if (anim === 'none') return 'none';
    return 'shimmer';
  });

  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);
}
