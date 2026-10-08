import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface ButtonProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  label?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  'aria-describedby'?: string;
  loading?: boolean;
  severity?: string;
  variant?: string;
  icon?: string;
  iconPosition?: string;
  badge?: string;
  badgeSeverity?: string;
}

@Component({
  selector: 'origo-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class]': 'computedHostClasses()',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class ButtonComponent implements OrigoAdapter<ButtonProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    label: 'string',
    disabled: 'boolean',
    type: 'string',
    loading: 'boolean',
    severity: 'string',
    variant: 'string',
    icon: 'string',
    iconPosition: 'string',
    badge: 'string',
    badgeSeverity: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ButtonProps>>();

  computedLabel = computed(() => this.contract().props?.label ?? 'Button');
  computedLoading = computed(() => !!this.contract().props?.loading);
  computedDisabled = computed(() => {
    const props = this.contract().props;
    const rulesDisable =
      props?.rules?.['disable'] === true || props?.permissions?.['allow'] === 'false';
    return !!props?.disabled || this.computedLoading() || rulesDisable;
  });

  computedIcon = computed(() => this.contract().props?.icon);
  computedIconPosition = computed(() => this.contract().props?.iconPosition ?? 'left');
  computedBadge = computed(() => this.contract().props?.badge);
  computedBadgeSeverity = computed(() => this.contract().props?.badgeSeverity ?? 'info');

  computedHostClasses = computed(() => {
    const s = this.contract().props?.severity;
    const v = this.contract().props?.variant;
    return ['origo-button', s ? `origo-severity-${s}` : '', v ? `origo-variant-${v}` : '']
      .filter(Boolean)
      .join(' ');
  });
  computedType = computed(() => {
    const type = this.contract().props?.type;
    return type === 'button' || type === 'submit' || type === 'reset' ? type : 'button';
  });
  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null && String(label).trim() !== ''
      ? String(label)
      : undefined;
  });
  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null && String(desc).trim() !== ''
      ? String(desc)
      : undefined;
  });

  action = output<void>();

  private experienceAdapter = inject(WebExperienceAdapterService);

  onClick() {
    if (this.computedDisabled() || this.computedLoading()) return;

    const id = this.contract().id;
    if (!id) return;

    this.experienceAdapter.dispatchCapability(id, 'click');
    this.action.emit();
  }
}
