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

export interface ListProps {
  items?: Array<Record<string, unknown>>;
  maxItems?: number;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-list',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-list]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.role]': '"list"',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  },
})
export class ListComponent implements OrigoAdapter<ListProps> {
  static readonly contractSchema = {
    items: 'array',
    maxItems: 'number',
    disabled: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<ListProps>>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);

  computedItems = computed(() => {
    const items = this.contract().props?.items;
    if (!Array.isArray(items)) return [];

    const validItems = items.filter(i => i != null);

    let max = this.contract().props?.maxItems;
    if (typeof max !== 'number' || isNaN(max) || max <= 0) {
      max = 100;
    }

    return validItems.slice(0, max);
  });

  computedDisabled = computed(() => !!this.contract().props?.disabled);

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  onItemSelect(itemId: unknown) {
    if (this.computedDisabled() || itemId == null) return;

    const rawValue = String(itemId);
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, rawValue);
    const sanitizedValue =
      sanitized != null && sanitized !== '' ? sanitized : rawValue.replace(/[<>]/g, '');

    this.experienceAdapter.updateState(this.contract().id, 'selectedItem', sanitizedValue);
  }
}
