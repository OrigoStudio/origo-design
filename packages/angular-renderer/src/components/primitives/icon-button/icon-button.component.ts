import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface IconButtonProps {
  icon?: string;
  label?: string;
  tooltip?: string;
  severity?: string;
  variant?: string;
  rounded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  permissions?: any;
  rules?: any;
  metadata?: any;
}

@Component({
  selector: 'origo-icon-button',
  standalone: true,
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class]': 'computedHostClasses()',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class IconButtonComponent implements OrigoAdapter<IconButtonProps> {
  static readonly contractSchema = {
    icon: 'string',
    label: 'string',
    tooltip: 'string',
    severity: 'string',
    variant: 'string',
    rounded: 'boolean',
    loading: 'boolean',
    disabled: 'boolean',
    'aria-label': 'string',
    'aria-describedby': 'string',
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<IconButtonProps>>();

  computedIcon = computed(() => this.contract().props?.icon ?? '');
  computedLoading = computed(() => !!this.contract().props?.loading);
  computedDisabled = computed(() => {
    const props = this.contract().props;
    const rulesDisable = props?.rules?.disable === true || props?.permissions?.allow === false;
    return !!props?.disabled || this.computedLoading() || rulesDisable;
  });

  computedAriaLabel = computed(() => {
    const p = this.contract().props;
    const v = p?.['aria-label'] || p?.label;
    return v ? String(v) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const v = this.contract().props?.['aria-describedby'];
    return v ? String(v) : undefined;
  });

  computedHostClasses = computed(() => {
    const s = this.contract().props?.severity;
    const v = this.contract().props?.variant;
    const rounded = this.contract().props?.rounded;
    return [
      'origo-icon-button',
      s ? `origo-severity-${s}` : '',
      v ? `origo-variant-${v}` : '',
      rounded ? 'origo-rounded' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  private experienceAdapter = inject(WebExperienceAdapterService);

  onClick() {
    if (this.computedDisabled() || this.computedLoading()) return;
    const id = this.contract().id;
    if (!id) return;
    this.experienceAdapter.dispatchCapability(id, 'click');
  }
}
