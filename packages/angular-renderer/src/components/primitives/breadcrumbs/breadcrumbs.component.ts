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

export interface BreadcrumbItem {
  label: string;
  outcomeRef?: string;
}

export interface BreadcrumbsProps {
  items?: Array<BreadcrumbItem>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-breadcrumbs',
  standalone: true,
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-breadcrumbs]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
    role: 'navigation',
  },
})
export class BreadcrumbsComponent implements OrigoAdapter<BreadcrumbsProps> {
  static readonly contractSchema = {
    items: 'array',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<BreadcrumbsProps>>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : 'Breadcrumbs';
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  computedItems = computed(() => {
    const items = this.contract().props?.items;
    if (!Array.isArray(items)) return [];

    return items
      .filter(item => item != null && item.label != null)
      .map(item => {
        return {
          label: String(item.label),
          outcomeRef: item.outcomeRef ? String(item.outcomeRef) : undefined,
        };
      });
  });

  onItemClick(event: Event, item: BreadcrumbItem, isLast: boolean) {
    if (isLast || !item.outcomeRef) {
      event.preventDefault();
      return;
    }

    this.experienceAdapter.updateState(this.contract().id, 'activeOutcome', item.outcomeRef);
  }
}
