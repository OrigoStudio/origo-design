import { Component, input, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';

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
  host: {
    '[class.origo-text-input]': 'true',
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

  computedValue = computed(() => this.contract().props?.value ?? '');
  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedReadonly = computed(() => !!this.contract().props?.readonly);
  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] as string | undefined);
  computedAriaDescribedBy = computed(
    () => this.contract().props?.['aria-describedby'] as string | undefined
  );

  valueChange = output<string>();

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valueChange.emit(target.value);
  }
}
