import {
  Component,
  input,
  model,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  SecurityContext,
  effect,
  untracked,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
  computedAriaLabel = computed(() => this.contract().props?.['aria-label'] as string | undefined);
  computedAriaDescribedBy = computed(
    () => this.contract().props?.['aria-describedby'] as string | undefined
  );

  private sanitizer = inject(DomSanitizer);
  private experienceAdapter = inject(WebExperienceAdapterService);

  constructor() {
    effect(() => {
      const contractVal = this.contract().props?.value;
      if (contractVal !== undefined) {
        untracked(() => this.value.set(String(contractVal)));
      }
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const rawValue = target.value;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || '';

    this.value.set(sanitized);

    if (rawValue !== sanitized) {
      target.value = sanitized;
    }

    this.experienceAdapter.updateState(this.contract().id, 'value', sanitized);
  }
}
