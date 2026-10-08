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
import { SelectProps } from '../select/select.component';
import { normalizeOptions, filterOptions } from '../select/selection-utils';

export type ComboboxProps = SelectProps;

@Component({
  selector: 'origo-combobox',
  standalone: true,
  templateUrl: './combobox.component.html',
  styleUrls: ['./combobox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-combobox]': 'true',
    '[attr.data-testid]': 'contract().id ?? ""',
    '[class.origo-combobox--fluid]': 'computedFluid()',
    '[class.origo-combobox--outlined]': 'computedVariant() === "outlined"',
    '[class.origo-combobox--filled]': 'computedVariant() === "filled"',
    '[class.origo-combobox--invalid]': 'computedInvalid()',
    '[class.origo-combobox--disabled]': 'computedDisabled()',
    '[class.origo-combobox--readonly]': 'computedReadonly()',
  },
})
export class ComboboxComponent implements OrigoAdapter<ComboboxProps> {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    options: 'array',
    value: 'string',
    optionLabel: 'string',
    optionValue: 'string',
    optionGroupLabel: 'string',
    optionGroupChildren: 'string',
    placeholder: 'string',
    filter: 'boolean',
    filterBy: 'string',
    filterMatchMode: 'string',
    filterPlaceholder: 'string',
    editable: 'boolean',
    clearable: 'boolean',
    appendTo: 'string',
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

  contract = input.required<InteractionContract<ComboboxProps>>();
  value = model<unknown>('');

  inputValue = signal<string>('');
  isOpen = signal<boolean>(false);
  activeIndex = signal<number>(-1);

  computedNormalizedOptions = computed(() => {
    const props = this.contract().props;
    return normalizeOptions(
      props?.options,
      props?.optionLabel,
      props?.optionValue,
      props?.optionGroupLabel,
      props?.optionGroupChildren
    );
  });

  filteredOptions = computed(() => {
    const opts = this.computedNormalizedOptions();
    const query = this.inputValue();
    if (!query) return opts;
    const mode = this.contract().props?.filterMatchMode ?? 'contains';
    return filterOptions(opts, query, mode);
  });

  computedPlaceholder = computed(() => this.contract().props?.placeholder ?? '');
  computedDisabled = computed(() => !!this.contract().props?.disabled);
  computedReadonly = computed(() => !!this.contract().props?.readonly);
  computedRequired = computed(() => !!this.contract().props?.required);
  computedInvalid = computed(() => !!this.contract().props?.invalid);
  computedClearable = computed(() => !!this.contract().props?.clearable);
  computedVariant = computed(() => this.contract().props?.variant ?? 'outlined');
  computedFluid = computed(() => !!this.contract().props?.fluid);
  computedErrorText = computed(() => this.contract().props?.errorText ?? '');
  computedHelpText = computed(() => this.contract().props?.helpText ?? '');

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    if (label !== undefined && label !== null && String(label).trim() !== '') {
      return String(label);
    }
    return this.computedPlaceholder() || 'Combobox';
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
          const match = this.computedNormalizedOptions().find(o => o.value === contractVal);
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
    this.value.set(text);
    this.isOpen.set(true);
    this.activeIndex.set(0);
    this.experienceAdapter.updateState(this.contract().id, 'value', text);
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
    this.value.set(newValue);
    this.isOpen.set(true);
    this.activeIndex.set(0);
    this.experienceAdapter.updateState(this.contract().id, 'value', newValue);
  }

  toggleOpen() {
    if (this.computedDisabled() || this.computedReadonly()) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.activeIndex.set(0);
    }
  }

  selectOption(optionValue: unknown) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    const match = this.computedNormalizedOptions().find(o => o.value === optionValue);
    this.value.set(optionValue);
    this.inputValue.set(match ? match.label : String(optionValue ?? ''));
    this.isOpen.set(false);
    this.experienceAdapter.updateState(this.contract().id, 'value', optionValue);
  }

  clear(event?: Event) {
    if (this.computedDisabled() || this.computedReadonly()) return;
    event?.stopPropagation();
    this.value.set('');
    this.inputValue.set('');
    this.isOpen.set(false);
    this.experienceAdapter.updateState(this.contract().id, 'value', '');
  }

  onKeydown(event: KeyboardEvent) {
    if (this.computedDisabled() || this.computedReadonly()) return;

    const opts = this.filteredOptions();
    const count = opts.length;

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
          if (idx >= 0 && idx < count && !opts[idx].disabled) {
            this.selectOption(opts[idx].value);
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
