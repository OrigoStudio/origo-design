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
  SecurityContext,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface InputNumberProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  value?: number;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
  variant?: 'outlined' | 'filled' | 'text';
  fluid?: boolean;
}

@Component({
  selector: 'origo-input-number',
  standalone: true,
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-input-number]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[class.origo-input-number--fluid]': 'computedFluid()',
    '[class.origo-input-number--outlined]': 'computedVariant() === "outlined"',
    '[class.origo-input-number--filled]': 'computedVariant() === "filled"',
    '[class.origo-input-number--text]': 'computedVariant() === "text"',
  },
})
export class InputNumberComponent implements OrigoAdapter<InputNumberProps> {
  static readonly contractSchema: Record<
    string,
    'string' | 'number' | 'boolean' | 'object' | 'array'
  > = {
    value: 'number',
    placeholder: 'string',
    disabled: 'boolean',
    readonly: 'boolean',
    min: 'number',
    max: 'number',
    step: 'number',
    required: 'boolean',
    invalid: 'boolean',
    errorText: 'string',
    helpText: 'string',
    variant: 'string',
    fluid: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<InputNumberProps>>();
  value = model<number | undefined>(undefined);

  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedReadonly = computed(() => !!this.contract().props?.readonly);
  computedMin = computed(() => this.contract().props?.min);
  computedMax = computed(() => this.contract().props?.max);
  computedStep = computed(() => this.contract().props?.step);
  computedRequired = computed(() => !!this.contract().props?.required);
  computedInvalid = computed(() => !!this.contract().props?.invalid);
  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
  computedFluid = computed(() => !!this.contract().props?.fluid);
  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
  computedHelpText = computed(() => this.contract().props?.helpText ?? '');

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

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      const props = this.contract().props;
      const coerced = props
        ? coerceContractProps<Record<string, unknown>>(props, InputNumberComponent.contractSchema)
        : {};
      const contractVal = coerced['value'];

      const parsedVal = typeof contractVal === 'number' ? contractVal : undefined;
      untracked(() => {
        if (parsedVal === this.value()) return;
        this.value.set(parsedVal);
      });
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target || this.computedDisabled() || this.computedReadonly()) return;

    const rawValue = target.value;
    const sanitizedValue =
      this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || '';

    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }

    const numValue = sanitizedValue === '' ? undefined : Number(sanitizedValue);

    // Check if it's a valid number. If not, don't update state but let the user type
    if (sanitizedValue !== '' && isNaN(Number(sanitizedValue))) {
      return;
    }

    this.value.set(numValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', numValue);
  }
}
