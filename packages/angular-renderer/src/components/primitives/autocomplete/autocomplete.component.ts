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
  signal,
  PLATFORM_ID,
  HostListener,
  ElementRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { NormalizedOption, normalizeOptions, filterOptions } from '../select/selection-utils';

export interface AutocompleteProps {
  id?: string;
  value?: unknown;
  suggestions?: Array<unknown>;
  minQueryLength?: number;
  delay?: number;
  multiple?: boolean;
  forceSelection?: boolean;
  optionLabel?: string;
  optionValue?: string;
  completeOnFocus?: boolean;
  virtualScroll?: boolean;
  loading?: boolean;
  placeholder?: string;
  clearable?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  invalid?: boolean;
  errorText?: string;
  helpText?: string;
  variant?: 'outlined' | 'filled';
  fluid?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

@Component({
  selector: 'origo-autocomplete',
  standalone: true,
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-autocomplete]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
    '[class.origo-autocomplete--fluid]': 'computedFluid()',
    '[class.origo-autocomplete--outlined]': 'computedVariant() === "outlined"',
    '[class.origo-autocomplete--filled]': 'computedVariant() === "filled"',
    '[class.origo-autocomplete--invalid]': 'computedInvalid()',
    '[class.origo-autocomplete--disabled]': 'computedDisabled()',
    '[class.origo-autocomplete--readonly]': 'computedReadonly()',
  },
})
export class AutocompleteComponent implements OrigoAdapter<AutocompleteProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    suggestions: 'array',
    value: 'string',
    minQueryLength: 'number',
    delay: 'number',
    multiple: 'boolean',
    forceSelection: 'boolean',
    optionLabel: 'string',
    optionValue: 'string',
    completeOnFocus: 'boolean',
    virtualScroll: 'boolean',
    loading: 'boolean',
    placeholder: 'string',
    clearable: 'boolean',
    disabled: 'boolean',
    readonly: 'boolean',
    required: 'boolean',
    invalid: 'boolean',
    errorText: 'string',
    helpText: 'string',
    variant: 'string',
    fluid: 'boolean',
    'aria-label': 'string',
    'aria-describedby': 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<AutocompleteProps>>();
  value = model<unknown>('');

  inputValue = signal<string>('');
  query = signal<string>('');
  isOpen = signal<boolean>(false);
  activeIndex = signal<number>(-1);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  computedNormalizedSuggestions = computed(() => {
    const props = this.contract().props;
    return normalizeOptions(props?.suggestions, props?.optionLabel, props?.optionValue);
  });

  filteredSuggestions = computed(() => {
    const suggestions = this.computedNormalizedSuggestions();
    const q = this.query();
    if (!q) return suggestions;
    return filterOptions(suggestions, q, 'contains');
  });

  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
  computedMinQueryLength = computed(() => this.contract().props?.minQueryLength ?? 1);
  computedDelay = computed(() => this.contract().props?.delay ?? 300);
  computedForceSelection = computed(() => !!this.contract().props?.forceSelection);
  computedClearable = computed(() => !!this.contract().props?.clearable);
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedReadonly = computed(() => !!this.contract().props?.readonly);
  computedRequired = computed(() => !!this.contract().props?.required);
  computedInvalid = computed(() => !!this.contract().props?.invalid);
  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
  computedFluid = computed(() => !!this.contract().props?.fluid);
  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
  computedHelpText = computed(() => this.contract().props?.helpText ?? '');

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    if (label !== undefined && label !== null && String(label).trim() !== '') {
      return String(label);
    }
    return this.computedPlaceholder() || 'Autocomplete';
  });

  computedAriaDescribedBy = computed(() => {
    const parts: string[] = [];
    const desc = this.contract().props?.['aria-describedby'];
    if (desc) parts.push(String(desc));
    if (this.computedErrorText()) parts.push(`${this.contract().id}-error`);
    if (this.computedHelpText()) parts.push(`${this.contract().id}-help`);
    return parts.length > 0 ? parts.join(' ') : undefined;
  });

  private experienceAdapter = inject(WebExperienceAdapterService);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      const contractVal = this.contract().props?.value;
      untracked(() => {
        if (contractVal !== undefined && contractVal !== this.value()) {
          this.value.set(contractVal);
          // Sync input display
          const match = this.computedNormalizedSuggestions().find(s => s.value === contractVal);
          this.inputValue.set(match ? match.label : String(contractVal ?? ''));
        }
      });
    });
  }

  onInput(event: Event) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    const target = event.target as HTMLInputElement;
    const text = target.value;
    this.inputValue.set(text);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.query.set(text);
      if (text.length >= this.computedMinQueryLength()) {
        this.isOpen.set(true);
        this.activeIndex.set(0);
      } else {
        this.isOpen.set(false);
      }
    }, this.computedDelay());
  }

  onPaste(event: ClipboardEvent) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    event.preventDefault();
    const plain = event.clipboardData?.getData('text/plain') ?? '';
    const target = event.target as HTMLInputElement;
    if (!target) return;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const newValue = target.value.slice(0, start) + plain + target.value.slice(end);
    target.value = newValue;
    this.inputValue.set(newValue);
    this.query.set(newValue);
    if (newValue.length >= this.computedMinQueryLength()) {
      this.isOpen.set(true);
      this.activeIndex.set(0);
    }
  }

  onFocus() {
    if (
      this.contract().props?.completeOnFocus &&
      !this.computedDisabled() &&
      !this.computedReadonly()
    ) {
      this.isOpen.set(true);
      this.activeIndex.set(0);
    }
  }

  onBlur() {
    if (this.computedForceSelection()) {
      const currentText = this.inputValue().trim().toLowerCase();
      const match = this.computedNormalizedSuggestions().find(
        s => s.label.toLowerCase() === currentText
      );
      if (match) {
        this.selectSuggestion(match);
      } else {
        // Revert to existing value or clear
        const existing = this.computedNormalizedSuggestions().find(s => s.value === this.value());
        if (existing) {
          this.inputValue.set(existing.label);
        } else {
          this.value.set('');
          this.inputValue.set('');
        }
      }
    }
  }

  selectSuggestion(suggestion: NormalizedOption) {
    if (this.computedDisabled() || this.computedReadonly() || suggestion.disabled) return;
    this.value.set(suggestion.value);
    this.inputValue.set(suggestion.label);
    this.isOpen.set(false);
    this.experienceAdapter.updateState(this.contract().id, 'value', suggestion.value);
  }

  clear(event?: Event) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    event?.stopPropagation();
    this.value.set('');
    this.inputValue.set('');
    this.query.set('');
    this.isOpen.set(false);
    this.experienceAdapter.updateState(this.contract().id, 'value', '');
  }

  onKeydown(event: KeyboardEvent) {
    if (this.computedDisabled() || this.computedReadonly()) return;

    const list = this.filteredSuggestions();
    const count = list.length;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isOpen() && count > 0) {
          this.isOpen.set(true);
          this.activeIndex.set(0);
        } else if (count > 0) {
          const next = (this.activeIndex() + 1) % count;
          this.activeIndex.set(next);
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!this.isOpen() && count > 0) {
          this.isOpen.set(true);
          this.activeIndex.set(count - 1);
        } else if (count > 0) {
          const prev = (this.activeIndex() - 1 + count) % count;
          this.activeIndex.set(prev);
        }
        break;
      }
      case 'Enter': {
        if (this.isOpen()) {
          event.preventDefault();
          const idx = this.activeIndex();
          if (idx >= 0 && idx < count && !list[idx].disabled) {
            this.selectSuggestion(list[idx]);
          }
        }
        break;
      }
      case 'Escape': {
        if (this.isOpen()) {
          event.preventDefault();
          this.isOpen.set(false);
        }
        break;
      }
      case 'Tab': {
        if (this.isOpen()) {
          this.isOpen.set(false);
        }
        break;
      }
      case 'Home': {
        if (this.isOpen() && count > 0) {
          event.preventDefault();
          this.activeIndex.set(0);
        }
        break;
      }
      case 'End': {
        if (this.isOpen() && count > 0) {
          event.preventDefault();
          this.activeIndex.set(count - 1);
        }
        break;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
    if (!clickedInside && this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}
