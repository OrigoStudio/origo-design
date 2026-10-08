import {
  Component,
  input,
  model,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  effect,
  untracked,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface RadioGroupProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  options: Array<{ value: string; label: string }>;
  value?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
}

@Component({
  selector: 'origo-radio-group',
  standalone: true,
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-radio-group]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
  },
})
export class RadioGroupComponent implements OrigoAdapter<RadioGroupProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    options: 'array',
    value: 'string',
    disabled: 'boolean',
    required: 'boolean',
    invalid: 'boolean',
    errorText: 'string',
    helpText: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<RadioGroupProps>>();
  value = model<string>('');

  computedOptions = computed(() => {
    const opts = this.contract().props?.options;
    return Array.isArray(opts) ? opts : [];
  });
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedRequired = computed(() => !!this.contract().props?.required);
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

  computedInvalid = computed(() => !!this.contract().props?.invalid);
  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
  computedHelpText = computed(() => this.contract().props?.helpText ?? '');

  private experienceAdapter = inject(WebExperienceAdapterService);

  constructor() {
    effect(() => {
      const contractVal = this.contract().props?.value;
      const parsedVal =
        contractVal !== undefined && contractVal !== null ? String(contractVal) : '';
      untracked(() => {
        if (parsedVal === this.value()) return;
        this.value.set(parsedVal);
      });
    });
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target || !target.checked || this.computedDisabled()) return;

    const rawValue = target.value;
    const sanitizedValue = String(rawValue);

    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
}
