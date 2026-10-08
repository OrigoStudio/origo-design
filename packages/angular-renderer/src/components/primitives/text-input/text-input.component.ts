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

export interface TextInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  variant?: 'outlined' | 'filled' | 'text';
  fluid?: boolean;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
  type?: string;
}

@Component({
  selector: 'origo-text-input',
  standalone: true,
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-text-input]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
    '[class.origo-text-input--fluid]': 'computedFluid()',
    '[class.origo-text-input--outlined]': 'computedVariant() === "outlined"',
    '[class.origo-text-input--filled]': 'computedVariant() === "filled"',
    '[class.origo-text-input--text]': 'computedVariant() === "text"',
  },
})
export class TextInputComponent implements OrigoAdapter<TextInputProps> {
  static readonly contractSchema = {
    value: 'string',
    placeholder: 'string',
    disabled: 'boolean',
    readonly: 'boolean',
    variant: 'string',
    fluid: 'boolean',
    required: 'boolean',
    invalid: 'boolean',
    errorText: 'string',
    helpText: 'string',
    type: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<TextInputProps>>();
  value = model<string>('');

  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedReadonly = computed(() => !!this.contract().props?.readonly);
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

  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
  computedFluid = computed(() => !!this.contract().props?.fluid);
  computedRequired = computed(() => !!this.contract().props?.required);
  computedInvalid = computed(() => !!this.contract().props?.invalid);
  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
  computedType = computed(() => this.contract().props?.type ?? 'text');

  private experienceAdapter = inject(WebExperienceAdapterService);

  constructor() {
    effect(() => {
      const contractVal = this.contract().props?.value;
      untracked(() =>
        this.value.set(contractVal !== undefined && contractVal !== null ? String(contractVal) : '')
      );
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target) return;

    const rawValue = target.value;
    const sanitizedValue = String(rawValue);

    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }

    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }

  onPaste(event: ClipboardEvent) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    event.preventDefault();
    const plain = event.clipboardData?.getData('text/plain') ?? '';
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const newValue = target.value.slice(0, start) + plain + target.value.slice(end);
    target.value = newValue;
    this.value.set(newValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', newValue);
  }
}
