import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  signal,
  effect,
  ViewEncapsulation,
  inject,
  viewChildren,
  viewChild,
  ElementRef,
  ViewContainerRef,
  PLATFORM_ID,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface AccordionItem {
  key: string;
  header: string;
  content?: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface AccordionProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  items?: AccordionItem[];
  panels?: AccordionItem[]; // alias for items
  value?: string | string[];
  multiple?: boolean;
  disabled?: boolean;
  lazy?: boolean;
  expandIcon?: string;
  collapseIcon?: string;
}

export const AccordionContractSchema: Record<
  string,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  items: 'array',
  panels: 'array',
  multiple: 'boolean',
  disabled: 'boolean',
  lazy: 'boolean',
  expandIcon: 'string',
  collapseIcon: 'string',
} as const;

@Component({
  selector: 'origo-accordion',
  standalone: true,
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-accordion]': 'true',
    '[class.origo-accordion--disabled]': 'computedDisabled()',
    '[attr.data-testid]': 'contract().id',
  },
})
export class AccordionComponent implements OrigoAdapter<AccordionProps>, IContainerComponent {
  static readonly contractSchema = AccordionContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<AccordionProps>>();
  readonly vc = viewChild('vc', { read: ViewContainerRef });

  headerButtons = viewChildren<ElementRef<HTMLButtonElement>>('headerButton');

  valueChange = output<string | string[]>();
  open = output<string>();
  close = output<string>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private platformId = inject(PLATFORM_ID);

  protected internalExpandedKeys = signal<Set<string>>(new Set());
  protected openedOnceKeys = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const rawVal = this.props().value;
      const isMulti = !!this.props().multiple;
      const initial = new Set<string>();

      if (rawVal !== undefined && rawVal !== null) {
        if (Array.isArray(rawVal)) {
          if (isMulti) {
            rawVal.forEach(k => initial.add(String(k)));
          } else if (rawVal.length > 0) {
            initial.add(String(rawVal[0]));
          }
        } else if (
          (typeof rawVal === 'string' || typeof rawVal === 'number') &&
          String(rawVal).trim() !== ''
        ) {
          initial.add(String(rawVal));
        }
      }

      this.internalExpandedKeys.set(initial);
      this.openedOnceKeys.update(existing => {
        const next = new Set(existing);
        initial.forEach(k => next.add(k));
        return next;
      });
    });
  }

  protected props = computed(() =>
    coerceContractProps<AccordionProps>(this.contract().props, AccordionContractSchema)
  );

  computedAriaLabel = computed(() => {
    const label = this.props()['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.props()['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  computedDisabled = computed(() => {
    return !!this.props().disabled;
  });

  computedItems = computed<AccordionItem[]>(() => {
    const raw = this.props().items ?? this.props().panels;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(item => item != null && item.key != null)
      .map(item => ({
        key: String(item.key),
        header: item.header != null ? String(item.header) : '',
        content: item.content != null ? String(item.content) : undefined,
        icon: item.icon != null ? String(item.icon) : undefined,
        badge: item.badge !== undefined && item.badge !== null ? item.badge : undefined,
        disabled: !!item.disabled,
      }));
  });

  computedExpandIcon = computed(() => this.props().expandIcon);
  computedCollapseIcon = computed(() => this.props().collapseIcon);

  isExpanded(item: AccordionItem): boolean {
    return this.internalExpandedKeys().has(item.key);
  }

  isPanelRendered(item: AccordionItem): boolean {
    if (!this.props().lazy) return true;
    return this.openedOnceKeys().has(item.key) || this.isExpanded(item);
  }

  getHeaderId(item: AccordionItem, index: number): string {
    const baseId = this.contract().id || 'origo-accordion';
    return `${baseId}-header-${item.key || index}`;
  }

  getPanelId(item: AccordionItem, index: number): string {
    const baseId = this.contract().id || 'origo-accordion';
    return `${baseId}-panel-${item.key || index}`;
  }

  togglePanel(item: AccordionItem) {
    if (this.computedDisabled() || item.disabled || !item.key) return;

    const current = new Set(this.internalExpandedKeys());
    const isCurrentlyExpanded = current.has(item.key);
    const isMulti = !!this.props().multiple;
    const contractId = this.contract().id;

    if (isCurrentlyExpanded) {
      current.delete(item.key);
      this.close.emit(item.key);
      if (contractId) {
        this.experienceAdapter.dispatchCapability(contractId, 'close', { key: item.key });
      }
    } else {
      if (!isMulti) {
        current.clear();
      }
      current.add(item.key);
      this.open.emit(item.key);
      if (contractId) {
        this.experienceAdapter.dispatchCapability(contractId, 'open', { key: item.key });
      }
    }

    this.internalExpandedKeys.set(current);
    this.openedOnceKeys.update(set => new Set(set).add(item.key));

    const nextValue: string | string[] = isMulti
      ? Array.from(current)
      : (current.values().next().value ?? '');

    this.valueChange.emit(nextValue);
    if (contractId) {
      this.experienceAdapter.updateState(contractId, 'value', nextValue);
      this.experienceAdapter.dispatchCapability(contractId, 'valueChange', { value: nextValue });
    }
  }

  onHeaderKeydown(event: KeyboardEvent, index: number) {
    const items = this.computedItems();
    if (items.length === 0) return;

    let nextIndex = index;
    if (event.key === 'ArrowDown') {
      nextIndex = index + 1;
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      nextIndex = index - 1;
      event.preventDefault();
    } else if (event.key === 'Home') {
      nextIndex = 0;
      event.preventDefault();
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
      event.preventDefault();
    } else {
      return;
    }

    if (nextIndex < 0) nextIndex = items.length - 1;
    if (nextIndex >= items.length) nextIndex = 0;

    const buttons = this.headerButtons();
    if (buttons && buttons[nextIndex]) {
      buttons[nextIndex].nativeElement.focus();
    }
  }
}
