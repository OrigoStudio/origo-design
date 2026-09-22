import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  SecurityContext,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface SidebarItem {
  key: string;
  label: string;
  icon?: string;
  outcomeRef: string;
}

export interface SidebarProps {
  items?: Array<SidebarItem>;
  activeOutcome?: string;
  collapsed?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-sidebar]': 'true',
    '[class.origo-sidebar--collapsed]': 'computedCollapsed()',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
    role: 'navigation',
  },
})
export class SidebarComponent implements OrigoAdapter<SidebarProps> {
  static readonly contractSchema = {
    items: 'array',
    collapsed: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SidebarProps>>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);

  computedCollapsed = computed(() => !!this.contract().props?.collapsed);

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : 'Sidebar';
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  computedItems = computed(() => {
    const items = this.contract().props?.items;
    if (!Array.isArray(items)) return [];

    return items
      .filter(
        item => item != null && item.key != null && item.label != null && item.outcomeRef != null
      )
      .map(item => {
        return {
          key: String(item.key),
          label:
            this.sanitizer.sanitize(SecurityContext.HTML, String(item.label)) ||
            String(item.label).replace(/[<>]/g, ''),
          icon: item.icon
            ? this.sanitizer.sanitize(SecurityContext.HTML, String(item.icon)) ||
              String(item.icon).replace(/[<>]/g, '')
            : undefined,
          outcomeRef: String(item.outcomeRef),
        };
      });
  });

  computedActiveOutcome = computed(() => this.contract().props?.activeOutcome);

  onItemClick(item: SidebarItem) {
    if (!item.outcomeRef) return;
    this.experienceAdapter.updateState(this.contract().id, 'activeOutcome', item.outcomeRef);
  }

  onKeyDown(event: KeyboardEvent, item: SidebarItem, index: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item);
      return;
    }

    const host = event.target as HTMLElement;
    const links = Array.from(
      host.closest('.origo-sidebar__list')?.querySelectorAll('.origo-sidebar__link') || []
    );

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = links[index + 1] as HTMLElement;
      if (next) next.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = links[index - 1] as HTMLElement;
      if (prev) prev.focus();
    }
  }
}
