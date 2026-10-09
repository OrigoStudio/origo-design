import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  SecurityContext,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, ContainerComponent } from '../../../adapters/web/adapter';

export interface CardProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  variant?: string;
  clickable?: boolean;
  hoverable?: boolean;
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
    '[attr.tabindex]': 'isClickable() ? "0" : null',
    '[attr.role]': '"article"',
    '(keydown.enter)': 'onKeydown($event)',
    '(keydown.space)': 'onKeydown($event)',
    '[class.origo-card--elevation-none]': 'computedElevation() === "none"',
    '[class.origo-card--elevation-sm]': 'computedElevation() === "sm"',
    '[class.origo-card--elevation-md]': 'computedElevation() === "md"',
    '[class.origo-card--elevation-lg]': 'computedElevation() === "lg"',
    '[class.origo-card--hoverable]': 'isHoverable()',
    '[class.origo-card--clickable]': 'isClickable()',
  },
})
export class CardComponent implements OrigoAdapter<CardProps>, ContainerComponent {
  static readonly contractSchema = {
    permissions: 'object',
    rules: 'object',
    metadata: 'object',
    title: 'string',
    subtitle: 'string',
    imageUrl: 'string',
    imageAlt: 'string',
    elevation: 'string',
    variant: 'string',
    clickable: 'boolean',
    hoverable: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<CardProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

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

  computedElevation = computed(() => this.contract().props?.elevation || 'none');

  isClickable = computed(() => {
    const c = this.contract().props?.clickable;
    return c === true || String(c) === 'true';
  });

  isHoverable = computed(() => {
    const h = this.contract().props?.hoverable;
    return h === true || String(h) === 'true';
  });

  onKeydown(event: Event) {
    if (this.isClickable()) {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  }
}
