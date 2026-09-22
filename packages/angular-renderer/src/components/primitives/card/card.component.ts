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

export interface CardProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-card]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  },
})
export class CardComponent implements OrigoAdapter<CardProps> {
  static readonly contractSchema = {
    title: 'string',
    subtitle: 'string',
    imageUrl: 'string',
    imageAlt: 'string',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<CardProps>>();

  private sanitizer = inject(DomSanitizer);

  computedTitle = computed(() => {
    const title = this.contract().props?.title;
    return title !== undefined && title !== null ? String(title) : undefined;
  });

  computedSubtitle = computed(() => {
    const subtitle = this.contract().props?.subtitle;
    return subtitle !== undefined && subtitle !== null ? String(subtitle) : undefined;
  });

  computedImageUrl = computed(() => {
    const url = this.contract().props?.imageUrl;
    if (url === undefined || url === null || url === '') return undefined;

    // Sanitize URL for image source
    const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, String(url));
    return sanitizedUrl || undefined;
  });

  computedImageAlt = computed(() => {
    const alt = this.contract().props?.imageAlt;
    return alt !== undefined && alt !== null ? String(alt) : '';
  });

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });
}
