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

export interface SelectProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  required?: boolean;
}

@Component({
  selector: 'origo-select',
  standalone: true,
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-select]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class SelectComponent implements OrigoAdapter<SelectProps> {
  static readonly contractSchema = {
    options: 'array',
    value: 'string',
    disabled: 'boolean',
    placeholder: 'string',
    required: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SelectProps>>();
  value = model<string>('');

  computedOptions = computed(() => {
    const opts = this.contract().props?.options;
    return Array.isArray(opts) ? opts : [];
  });
  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedRequired = computed(() => !!this.contract().props?.required);
  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });
  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
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
    const target = event.target as HTMLSelectElement | null;
    if (!target) return;

    const rawValue = target.value;
    const sanitizedValue = this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || '';

    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }

    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
}
