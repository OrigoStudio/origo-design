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

export interface FabProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  icon?: string;
  label?: string;
  severity?: string;
  loading?: boolean;
  disabled?: boolean;
  position?: 'bottom-right' | 'bottom-left';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-fab',
  standalone: true,
  templateUrl: './floating-action-button.component.html',
  styleUrls: ['./floating-action-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class]': 'computedHostClasses()',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class FloatingActionButtonComponent implements OrigoAdapter<FabProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    icon: 'string',
    label: 'string',
    severity: 'string',
    loading: 'boolean',
    disabled: 'boolean',
    position: 'string',
    'aria-label': 'string',
    'aria-describedby': 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<FabProps>>();

  computedIcon = computed(() => this.contract().props?.icon ?? '');
  computedLabel = computed(() => this.contract().props?.label ?? '');
  computedLoading = computed(() => !!this.contract().props?.loading);
  computedDisabled = computed(() => {
    const props = this.contract().props;
    const rulesDisable =
      props?.rules?.['disable'] === true || props?.permissions?.['allow'] === 'false';
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
    const rawP = this.contract().props?.position;
    const p = ['bottom-left', 'bottom-right'].includes(rawP as string) ? rawP : 'bottom-right';
    return ['origo-fab', s ? `origo-severity-${s}` : '', `origo-position-${p}`]
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
