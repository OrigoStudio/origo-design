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
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface RadioGroupProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  disabled?: boolean;
  'aria-label'?: string;
  required?: boolean;
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
    '[attr.data-testid]': 'contract().id',
  },
})
export class RadioGroupComponent implements OrigoAdapter<RadioGroupProps> {
  static readonly contractSchema = {
    options: 'array',
    value: 'string',
    disabled: 'boolean',
    required: 'boolean',
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
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      const contractVal = this.contract().props?.value;
      untracked(() =>
        this.value.set(contractVal !== undefined && contractVal !== null ? String(contractVal) : '')
      );
    });
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (!target || !target.checked) return;

    const rawValue = target.value;
    const sanitizedValue = this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || '';

    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
}
