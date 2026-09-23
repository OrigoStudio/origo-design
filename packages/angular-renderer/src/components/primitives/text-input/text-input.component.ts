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
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface TextInputProps {
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
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
  },
})
export class TextInputComponent implements OrigoAdapter<TextInputProps> {
  static readonly contractSchema = {
    value: 'string',
    placeholder: 'string',
    disabled: 'boolean',
    readonly: 'boolean',
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
}
