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

export interface TextareaProps {
  value?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  required?: boolean;
}

@Component({
  selector: 'origo-textarea',
  standalone: true,
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-textarea]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class TextareaComponent implements OrigoAdapter<TextareaProps> {
  static readonly contractSchema = {
    value: 'string',
    placeholder: 'string',
    rows: 'number',
    disabled: 'boolean',
    readonly: 'boolean',
    required: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<TextareaProps>>();
  value = model<string>('');

  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
  computedRows = computed(() => {
    const rows = this.contract().props?.rows;
    return typeof rows === 'number' && rows > 0 ? Math.max(1, Math.round(rows)) : 3;
  });
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedReadonly = computed(() => !!this.contract().props?.readonly);
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
      const parsedVal =
        contractVal !== undefined && contractVal !== null ? String(contractVal) : '';
      untracked(() => {
        if (parsedVal === this.value()) return;
        this.value.set(parsedVal);
      });
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) return;

    const rawValue = target.value;
    const sanitizedValue =
      this.sanitizer.sanitize(SecurityContext.NONE, rawValue) || rawValue || '';

    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }

    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
}
