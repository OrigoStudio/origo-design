import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  SecurityContext,
  ElementRef,
  viewChildren,
  viewChild,
  ViewContainerRef,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  closable?: boolean;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tabs?: Array<TabItem>;
  items?: Array<TabItem>;
  activeTab?: string;
  value?: string;
  orientation?: 'horizontal' | 'vertical';
  scrollable?: boolean;
  lazy?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const TabsContractSchema: Record<
  keyof TabsProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  tabs: 'array',
  items: 'array',
  activeTab: 'string',
  value: 'string',
  orientation: 'string',
  scrollable: 'boolean',
  lazy: 'boolean',
  'aria-label': 'string',
  'aria-describedby': 'string',
};

@Component({
  selector: 'origo-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-tabs]': 'true',
    '[class.origo-tabs--vertical]': "computedOrientation() === 'vertical'",
    '[attr.data-testid]': 'contract().id',
  },
})
export class TabsComponent implements OrigoAdapter<TabsProps>, IContainerComponent {
  static readonly contractSchema = TabsContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<TabsProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  valueChange = output<string>();
  tabChange = output<TabItem>();
  tabClose = output<string>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);

  protected props = computed(() =>
    coerceContractProps<TabsProps>(this.contract().props, TabsContractSchema)
  );

  computedAriaLabel = computed(() => {
    const label = this.props()['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.props()['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  computedOrientation = computed<'horizontal' | 'vertical'>(() => {
    return this.props().orientation === 'vertical' ? 'vertical' : 'horizontal';
  });

  computedScrollable = computed<boolean>(() => {
    return !!this.props().scrollable;
  });

  computedTabs = computed<TabItem[]>(() => {
    const rawTabs = this.props().items ?? this.props().tabs;
    if (!Array.isArray(rawTabs)) return [];

    return rawTabs
      .filter(tab => tab != null && tab.key != null && tab.label != null)
      .map(tab => ({
        key: String(tab.key),
        label:
          this.sanitizer.sanitize(SecurityContext.HTML, String(tab.label)) ||
          String(tab.label).replace(/[<>]/g, ''),
        icon: tab.icon ? String(tab.icon) : undefined,
        closable: !!tab.closable,
        badge: tab.badge !== undefined && tab.badge !== null ? String(tab.badge) : undefined,
        disabled: !!tab.disabled,
      }));
  });

  computedActiveTab = computed<string | undefined>(() => {
    const active = this.props().value ?? this.props().activeTab;
    if (active) return active;
    const tabs = this.computedTabs();
    return tabs.length > 0 ? tabs[0].key : undefined;
  });

  onTabClick(tab: TabItem) {
    if (tab.disabled || !tab.key) return;

    this.experienceAdapter.updateState(this.contract().id, 'activeTab', tab.key);
    this.experienceAdapter.updateState(this.contract().id, 'value', tab.key);

    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'valueChange', tab.key);
      this.experienceAdapter.dispatchCapability(contractId, 'tabChange', tab);
    }

    this.valueChange.emit(tab.key);
    this.tabChange.emit(tab);
  }

  onTabClose(event: Event, tab: TabItem) {
    event.stopPropagation();
    event.preventDefault();

    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'tabClose', tab.key);
    }

    this.tabClose.emit(tab.key);
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const tabs = this.computedTabs();
    if (tabs.length === 0) return;

    let nextIndex = index;
    const isVertical = this.computedOrientation() === 'vertical';

    const isRtl =
      isPlatformBrowser(this.platformId) &&
      typeof window !== 'undefined' &&
      event.target instanceof Element
        ? window.getComputedStyle(event.target).direction === 'rtl'
        : false;

    if (!isVertical) {
      if (event.key === 'ArrowRight') {
        nextIndex = isRtl ? index - 1 : index + 1;
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        nextIndex = isRtl ? index + 1 : index - 1;
        event.preventDefault();
      } else if (event.key === 'Home') {
        nextIndex = 0;
        event.preventDefault();
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
        event.preventDefault();
      }
    } else {
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
        nextIndex = tabs.length - 1;
        event.preventDefault();
      }
    }

    if (nextIndex < 0) nextIndex = tabs.length - 1;
    if (nextIndex >= tabs.length) nextIndex = 0;

    if (nextIndex !== index) {
      setTimeout(() => {
        const buttons = this.tabButtons();
        if (buttons && buttons[nextIndex]) {
          buttons[nextIndex].nativeElement.focus();
        }
      });
    }
  }
}
