import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface TagProps {
  value?: string;
  severity?:
    | 'primary'
    | 'secondary'
    | 'info'
    | 'success'
    | 'warn'
    | 'warning'
    | 'error'
    | 'contrast'
    | string;
  icon?: string;
  rounded?: boolean;
  removable?: boolean;
  variant?: 'filled' | 'outlined' | string;
  interactive?: boolean;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const TagContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  value: 'string',
  severity: 'string',
  icon: 'string',
  rounded: 'boolean',
  removable: 'boolean',
  variant: 'string',
  interactive: 'boolean',
} as const;

@Component({
  selector: 'origo-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-tag-host]': 'true',
    '[attr.data-testid]': 'contractId()',
    '[class.origo-tag-host--hidden]': '!isVisible()',
  },
})
export class TagComponent implements OrigoAdapter<TagProps> {
  static readonly contractSchema = TagContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<TagProps>>();

  click = output<MouseEvent>();
  remove = output<void>();

  private experienceAdapter = inject(WebExperienceAdapterService, { optional: true });
  readonly isVisible = signal(true);

  readonly contractId = computed(() => {
    try {
      return this.contract()?.id ?? '';
    } catch {
      return '';
    }
  });

  readonly coercedProps = computed(() => {
    let rawProps: TagProps | undefined;
    try {
      rawProps = this.contract()?.props;
    } catch {
      rawProps = undefined;
    }
    return coerceContractProps<TagProps>(rawProps, TagContractSchema);
  });

  readonly displayValue = computed(() => {
    const v = this.coercedProps().value;
    return v !== undefined && v !== null ? String(v) : '';
  });

  readonly severity = computed(() => {
    const s = this.coercedProps().severity?.toLowerCase() || 'primary';
    return s === 'warn' || s === 'warning' ? 'warning' : s;
  });

  readonly variant = computed(() => {
    return this.coercedProps().variant === 'outlined' ? 'outlined' : 'filled';
  });

  readonly isRounded = computed(() => this.coercedProps().rounded === true);

  readonly isRemovable = computed(() => this.coercedProps().removable === true);

  readonly isInteractive = computed(() => this.coercedProps().interactive === true);

  readonly icon = computed(() => this.coercedProps().icon);

  readonly ariaLabel = computed(() => this.coercedProps()['aria-label']);

  readonly ariaDescribedBy = computed(() => this.coercedProps()['aria-describedby']);

  readonly computedTagClasses = computed(() => {
    const classes = [
      'origo-tag',
      `origo-tag--severity-${this.severity()}`,
      `origo-tag--variant-${this.variant()}`,
    ];
    if (this.isRounded()) classes.push('origo-tag--rounded');
    if (this.isInteractive()) classes.push('origo-tag--interactive');
    if (this.isRemovable()) classes.push('origo-tag--removable');
    return classes.join(' ');
  });

  onClick(event: MouseEvent) {
    if (this.isInteractive()) {
      this.click.emit(event);
      const id = this.contractId();
      if (id) {
        this.experienceAdapter?.dispatchCapability(id, 'click', { event });
      }
    }
  }

  onTagKeyDown(event: KeyboardEvent) {
    if (this.isRemovable() && (event.key === 'Backspace' || event.key === 'Delete')) {
      event.preventDefault();
      this.onRemove(event as unknown as MouseEvent);
    } else if (this.isInteractive() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.onClick(event as unknown as MouseEvent);
    }
  }

  onRemove(event: MouseEvent) {
    event.stopPropagation();
    this.isVisible.set(false);
    this.remove.emit();
    const id = this.contractId();
    if (id) {
      this.experienceAdapter?.updateState(id, 'visible', false);
      this.experienceAdapter?.dispatchCapability(id, 'remove', {});
    }
  }

  onRemoveKeyDown(event: KeyboardEvent) {
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'Backspace' ||
      event.key === 'Delete'
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.onRemove(event as unknown as MouseEvent);
    }
  }
}
