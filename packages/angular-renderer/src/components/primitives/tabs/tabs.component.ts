import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  SecurityContext,
  ElementRef,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs?: Array<TabItem>;
  activeTab?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-tabs',
  standalone: true,
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-tabs]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class TabsComponent implements OrigoAdapter<TabsProps> {
  static readonly contractSchema = {
    tabs: 'array',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<TabsProps>>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);

  @ViewChildren('tabButton') tabButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  computedTabs = computed(() => {
    const tabs = this.contract().props?.tabs;
    if (!Array.isArray(tabs)) return [];

    return tabs
      .filter(tab => tab != null && tab.key != null && tab.label != null)
      .map(tab => {
        return {
          key: String(tab.key),
          label:
            this.sanitizer.sanitize(SecurityContext.HTML, String(tab.label)) ||
            String(tab.label).replace(/[<>]/g, ''),
          disabled: !!tab.disabled,
        };
      });
  });

  computedActiveTab = computed(() => {
    const active = this.contract().props?.activeTab;
    if (active) return active;
    const tabs = this.computedTabs();
    return tabs.length > 0 ? tabs[0].key : undefined;
  });

  onTabClick(tab: TabItem) {
    if (tab.disabled || !tab.key) return;
    this.experienceAdapter.updateState(this.contract().id, 'activeTab', tab.key);
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const tabs = this.computedTabs();
    if (tabs.length === 0) return;

    let nextIndex = index;
    const isRtl =
      typeof window !== 'undefined' && event.target instanceof Element
        ? window.getComputedStyle(event.target).direction === 'rtl'
        : false;

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

    if (nextIndex < 0) nextIndex = tabs.length - 1;
    if (nextIndex >= tabs.length) nextIndex = 0;

    if (nextIndex !== index) {
      setTimeout(() => {
        const buttons = this.tabButtons?.toArray();
        if (buttons && buttons[nextIndex]) {
          buttons[nextIndex].nativeElement.focus();
        }
      });
    }
  }
}
