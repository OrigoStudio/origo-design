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
  PLATFORM_ID,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractionContract } from '@origostudio/core';

import { isPlatformBrowser } from '@angular/common';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface TextareaProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  value?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  readonly?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  required?: boolean;
  variant?: 'outlined' | 'filled' | 'text';
  fluid?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
  autoResize?: boolean;
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
    '[class.origo-textarea--fluid]': 'computedFluid()',
    '[class.origo-textarea--outlined]': 'computedVariant() === "outlined"',
    '[class.origo-textarea--filled]': 'computedVariant() === "filled"',
    '[class.origo-textarea--text]': 'computedVariant() === "text"',
  },
})
export class TextareaComponent implements OrigoAdapter<TextareaProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    value: 'string',
    placeholder: 'string',
    rows: 'number',
    disabled: 'boolean',
    readonly: 'boolean',
    required: 'boolean',
    variant: 'string',
    fluid: 'boolean',
    invalid: 'boolean',
    errorText: 'string',
    helpText: 'string',
    autoResize: 'boolean',
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

  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
  computedFluid = computed(() => !!this.contract().props?.fluid);
  computedInvalid = computed(() => !!this.contract().props?.invalid);
  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
  computedHelpText = computed(() => this.contract().props?.helpText ?? '');
  computedAutoResize = computed(() => !!this.contract().props?.autoResize);

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

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
    if (!target || this.computedDisabled() || this.computedReadonly()) return;

    const rawValue = target.value;
    const sanitizedValue =
      this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || '';

    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }

    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);

    if (this.computedAutoResize() && isPlatformBrowser(this.platformId)) {
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  }

  onPaste(event: ClipboardEvent) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    event.preventDefault();
    const plain = event.clipboardData?.getData('text/plain') ?? '';
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) return;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const newValue = target.value.slice(0, start) + plain + target.value.slice(end);

    target.value = newValue;
    this.value.set(newValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', newValue);

    if (this.computedAutoResize() && isPlatformBrowser(this.platformId)) {
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  }
}
