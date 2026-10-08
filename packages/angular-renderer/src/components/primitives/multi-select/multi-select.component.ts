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

export interface MultiSelectProps {
  id?: string;
  value?: Array<unknown>;
  options: Array<unknown>;
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  filter?: boolean;
  filterBy?: string;
  filterPlaceholder?: string;
  showToggleAll?: boolean;
  maxSelectedLabels?: number;
  selectedItemsLabel?: string;
  display?: 'comma' | 'chip';
  clearable?: boolean;
  virtualScroll?: boolean;
  itemSize?: number;
  loading?: boolean;
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
  selector: 'origo-multi-select',
  standalone: true,
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-multi-select]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
    '[class.origo-multi-select--fluid]': 'computedFluid()',
    '[class.origo-multi-select--outlined]': 'computedVariant() === "outlined"',
    '[class.origo-multi-select--filled]': 'computedVariant() === "filled"',
    '[class.origo-multi-select--invalid]': 'computedInvalid()',
    '[class.origo-multi-select--disabled]': 'computedDisabled()',
    '[class.origo-multi-select--readonly]': 'computedReadonly()',
  },
})
export class MultiSelectComponent implements OrigoAdapter<MultiSelectProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    options: 'array',
    value: 'array',
    optionLabel: 'string',
    optionValue: 'string',
    placeholder: 'string',
    filter: 'boolean',
    filterBy: 'string',
    filterPlaceholder: 'string',
    showToggleAll: 'boolean',
    maxSelectedLabels: 'number',
    selectedItemsLabel: 'string',
    display: 'string',
    clearable: 'boolean',
    virtualScroll: 'boolean',
    itemSize: 'number',
    loading: 'boolean',
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

  contract = input.required<InteractionContract<MultiSelectProps>>();
  value = model<Array<unknown>>([]);

  isOpen = signal<boolean>(false);
  filterQuery = signal<string>('');
  activeIndex = signal<number>(-1);

  computedNormalizedOptions = computed(() => {
    const props = this.contract().props;
    return normalizeOptions(props?.options, props?.optionLabel, props?.optionValue);
  });

  filteredOptions = computed(() => {
    const opts = this.computedNormalizedOptions();
    if (!this.computedFilter() && !this.filterQuery()) {
      return opts;
    }
    return filterOptions(opts, this.filterQuery(), 'contains');
  });

  computedSelectedOptions = computed(() => {
    const current = new Set(this.value());
    return this.computedNormalizedOptions().filter(opt => current.has(opt.value));
  });

  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? 'Select options');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedReadonly = computed(() => !!this.contract().props?.readonly);
  computedRequired = computed(() => !!this.contract().props?.required);
  computedInvalid = computed(() => !!this.contract().props?.invalid);
  computedFilter = computed(() => !!this.contract().props?.filter);
  computedFilterPlaceholder = computed(
    () => this.contract().props?.filterPlaceholder ?? 'Search...'
  );
  computedShowToggleAll = computed(() => this.contract().props?.showToggleAll ?? true);
  computedClearable = computed(() => !!this.contract().props?.clearable);
  computedDisplay = computed(() => this.contract().props?.display ?? 'comma');
  computedMaxSelectedLabels = computed(() => this.contract().props?.maxSelectedLabels ?? 3);
  computedSelectedItemsLabel = computed(
    () => this.contract().props?.selectedItemsLabel ?? '{0} items selected'
  );
  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
  computedFluid = computed(() => !!this.contract().props?.fluid);
  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
  computedHelpText = computed(() => this.contract().props?.helpText ?? '');

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    if (label !== undefined && label !== null && String(label).trim() !== '') {
      return String(label);
    }
    return this.computedPlaceholder();
  });

  computedAriaDescribedBy = computed(() => {
    const parts: string[] = [];
    const desc = this.contract().props?.['aria-describedby'];
    if (desc) parts.push(String(desc));
    if (this.computedErrorText()) parts.push(`${this.contract().id}-error`);
    if (this.computedHelpText()) parts.push(`${this.contract().id}-help`);
    return parts.length > 0 ? parts.join(' ') : undefined;
  });

  displaySummary = computed(() => {
    const selected = this.computedSelectedOptions();
    const count = selected.length;
    if (count === 0) return '';
    const max = this.computedMaxSelectedLabels();
    if (count <= max) {
      return selected.map(s => s.label).join(', ');
    }
    const template = this.computedSelectedItemsLabel();
    return template.replace('{0}', String(count));
  });

  isAllSelected = computed(() => {
    const filtered = this.filteredOptions().filter(o => !o.disabled);
    if (filtered.length === 0) return false;
    const current = new Set(this.value());
    return filtered.every(o => current.has(o.value));
  });

  private experienceAdapter = inject(WebExperienceAdapterService);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      const contractVal = this.contract().props?.value;
      untracked(() => {
        if (Array.isArray(contractVal)) {
          const current = this.value();
          if (
            current.length !== contractVal.length ||
            !current.every((v, i) => v === contractVal[i])
          ) {
            this.value.set([...contractVal]);
          }
        }
      });
    });
  }

  toggleOpen() {
    if (this.computedDisabled() || this.computedReadonly()) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.filterQuery.set('');
      this.activeIndex.set(0);
    }
  }

  isSelected(opt: NormalizedOption): boolean {
    return this.value().includes(opt.value);
  }

  toggleOption(optionValue: unknown) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    const current = [...this.value()];
    const idx = current.indexOf(optionValue);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(optionValue);
    }
    this.value.set(current);
    this.experienceAdapter.updateState(this.contract().id, 'value', current);
  }

  toggleAll() {
    if (this.computedDisabled() || this.computedReadonly()) return;
    const filtered = this.filteredOptions().filter(o => !o.disabled);
    let nextValue: Array<unknown>;

    if (this.isAllSelected()) {
      const filteredSet = new Set(filtered.map(o => o.value));
      nextValue = this.value().filter(v => !filteredSet.has(v));
    } else {
      const set = new Set(this.value());
      for (const opt of filtered) {
        set.add(opt.value);
      }
      nextValue = Array.from(set);
    }

    this.value.set(nextValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', nextValue);
  }

  removeOption(optionValue: unknown, event?: Event) {
    event?.stopPropagation();
    if (this.computedDisabled() || this.computedReadonly()) return;
    const next = this.value().filter(v => v !== optionValue);
    this.value.set(next);
    this.experienceAdapter.updateState(this.contract().id, 'value', next);
  }

  clear(event?: Event) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    event?.stopPropagation();
    this.value.set([]);
    this.experienceAdapter.updateState(this.contract().id, 'value', []);
  }

  onFilterInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.filterQuery.set(target.value);
    this.activeIndex.set(0);
  }

  onKeydown(event: KeyboardEvent) {
    if (this.computedDisabled() || this.computedReadonly()) return;

    const opts = this.filteredOptions();
    const count = opts.length;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!this.isOpen()) {
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
        if (!this.isOpen()) {
          this.isOpen.set(true);
          this.activeIndex.set(count - 1);
        } else if (count > 0) {
          const prev = (this.activeIndex() - 1 + count) % count;
          this.activeIndex.set(prev);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        const target = event.target as HTMLElement;
        if (event.key === ' ' && target && target.tagName === 'INPUT') {
          return;
        }
        event.preventDefault();
        if (this.isOpen()) {
          const idx = this.activeIndex();
          if (idx >= 0 && idx < count && !opts[idx].disabled) {
            this.toggleOption(opts[idx].value);
          }
        } else {
          this.isOpen.set(true);
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
