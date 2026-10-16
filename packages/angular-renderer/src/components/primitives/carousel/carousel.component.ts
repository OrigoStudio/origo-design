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
  viewChild,
  ElementRef,
  ViewContainerRef,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface CarouselResponsiveOption {
  breakpoint: string;
  numVisible: number;
  numScroll: number;
}

export interface CarouselItem {
  id?: string;
  title?: string;
  content?: string;
  image?: string;
  [key: string]: unknown;
}

export interface CarouselProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  items?: unknown[];
  value?: unknown[]; // alias for items
  numVisible?: number;
  numScroll?: number;
  orientation?: 'horizontal' | 'vertical';
  circular?: boolean;
  autoplay?: boolean;
  interval?: number;
  page?: number;
  responsiveOptions?: CarouselResponsiveOption[];
  showNavigators?: boolean;
  showIndicators?: boolean;
  pauseOnHover?: boolean;
}

export const CarouselContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  items: 'array',
  value: 'array',
  numVisible: 'number',
  numScroll: 'number',
  orientation: 'string',
  circular: 'boolean',
  autoplay: 'boolean',
  interval: 'number',
  page: 'number',
  responsiveOptions: 'array',
  showNavigators: 'boolean',
  showIndicators: 'boolean',
  pauseOnHover: 'boolean',
} as const;

@Component({
  selector: 'origo-carousel',
  standalone: true,
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-carousel]': 'true',
    '[class.origo-carousel--vertical]': "computedOrientation() === 'vertical'",
    '[attr.data-testid]': 'contract().id',
    '[style.--carousel-num-visible]': 'effectiveNumVisible()',
  },
})
export class CarouselComponent implements OrigoAdapter<CarouselProps>, IContainerComponent {
  static readonly contractSchema = CarouselContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<CarouselProps>>();
  readonly vc = viewChild('vc', { read: ViewContainerRef });
  readonly viewportEl = viewChild<ElementRef<HTMLElement>>('viewport');

  pageChange = output<number>();
  itemClick = output<{ item: unknown; index: number }>();
  play = output<void>();
  pause = output<void>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  protected currentPage = signal<number>(0);
  protected responsiveNumVisible = signal<number | null>(null);
  protected responsiveNumScroll = signal<number | null>(null);

  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private isHovered = false;
  private startX = 0;
  private startY = 0;
  private isSwiping = false;

  constructor() {
    effect(() => {
      const p = this.props().page;
      if (typeof p === 'number' && !isNaN(p)) {
        const safePage = Math.max(0, Math.min(Math.floor(p), this.totalPages() - 1));
        this.currentPage.set(safePage);
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      // Visibility change handler
      const onVisibilityChange = () => {
        if (this.document.visibilityState === 'hidden') {
          this.pauseAutoplayInternal();
        } else if (this.computedAutoplay() && !this.isHovered) {
          this.startAutoplayInternal();
        }
      };

      this.document.addEventListener('visibilitychange', onVisibilityChange);
      this.destroyRef.onDestroy(() => {
        this.document.removeEventListener('visibilitychange', onVisibilityChange);
        this.stopAutoplayInternal();
      });

      // Responsive options breakpoint watcher
      effect(() => {
        const options = this.props().responsiveOptions;
        if (Array.isArray(options) && options.length > 0 && typeof window !== 'undefined') {
          const checkBreakpoints = () => {
            let matchedOption: CarouselResponsiveOption | null = null;
            for (const opt of options) {
              if (opt && opt.breakpoint) {
                const query = `(max-width: ${opt.breakpoint})`;
                if (window.matchMedia(query).matches) {
                  matchedOption = opt;
                }
              }
            }
            if (matchedOption) {
              this.responsiveNumVisible.set(matchedOption.numVisible);
              this.responsiveNumScroll.set(matchedOption.numScroll);
            } else {
              this.responsiveNumVisible.set(null);
              this.responsiveNumScroll.set(null);
            }
          };

          checkBreakpoints();
          window.addEventListener('resize', checkBreakpoints);
          this.destroyRef.onDestroy(() => window.removeEventListener('resize', checkBreakpoints));
        }
      });

      // Autoplay activation
      effect(() => {
        const autoplay = this.computedAutoplay();
        if (autoplay) {
          this.startAutoplayInternal();
        } else {
          this.stopAutoplayInternal();
        }
      });
    }
  }

  protected props = computed(() =>
    coerceContractProps<CarouselProps>(this.contract().props, CarouselContractSchema)
  );

  computedItems = computed<unknown[]>(() => {
    const raw = this.props().items ?? this.props().value;
    return Array.isArray(raw) ? raw : [];
  });

  totalItems = computed(() => this.computedItems().length);

  computedNumVisible = computed(() => {
    const v = this.props().numVisible;
    return typeof v === 'number' && v > 0 ? Math.floor(v) : 1;
  });

  computedNumScroll = computed(() => {
    const s = this.props().numScroll;
    return typeof s === 'number' && s > 0 ? Math.floor(s) : 1;
  });

  effectiveNumVisible = computed(() => {
    return this.responsiveNumVisible() ?? this.computedNumVisible();
  });

  effectiveNumScroll = computed(() => {
    return this.responsiveNumScroll() ?? this.computedNumScroll();
  });

  computedOrientation = computed<'horizontal' | 'vertical'>(() => {
    return this.props().orientation === 'vertical' ? 'vertical' : 'horizontal';
  });

  computedCircular = computed(() => !!this.props().circular);
  computedAutoplay = computed(() => !!this.props().autoplay);

  computedInterval = computed(() => {
    const i = this.props().interval;
    return typeof i === 'number' && i >= 500 ? i : 3000;
  });

  computedShowNavigators = computed(() => this.props().showNavigators !== false);
  computedShowIndicators = computed(() => this.props().showIndicators !== false);
  computedPauseOnHover = computed(() => this.props().pauseOnHover !== false);

  computedAriaLabel = computed(() => {
    return this.props()['aria-label'] || 'Content Carousel';
  });

  computedAriaDescribedBy = computed(() => {
    return this.props()['aria-describedby'];
  });

  totalPages = computed(() => {
    const n = this.totalItems();
    if (n <= 0) return 1;
    const v = this.effectiveNumVisible();
    const s = this.effectiveNumScroll();
    return Math.max(1, Math.ceil((n - v + s) / s));
  });

  pagesArray = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i);
  });

  computedTrackTransform = computed(() => {
    const page = this.currentPage();
    const isVertical = this.computedOrientation() === 'vertical';

    if (isVertical) {
      return `translate3d(0, -${page * 100}%, 0)`;
    }

    const isRtl = this.isRtlElement();
    const xOffset = isRtl ? `${page * 100}%` : `-${page * 100}%`;
    return `translate3d(${xOffset}, 0, 0)`;
  });

  setPage(nextPage: number) {
    const total = this.totalPages();
    const clamped = Math.max(0, Math.min(nextPage, total - 1));
    this.currentPage.set(clamped);

    this.pageChange.emit(clamped);
    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.updateState(contractId, 'page', clamped);
      this.experienceAdapter.dispatchCapability(contractId, 'pageChange', { page: clamped });
    }
  }

  stepNext(isAutoplay = false) {
    const total = this.totalPages();
    const curr = this.currentPage();

    if (this.computedCircular()) {
      this.setPage((curr + 1) % total);
    } else if (curr < total - 1) {
      this.setPage(curr + 1);
    } else if (isAutoplay) {
      this.setPage(0);
    }
  }

  stepPrev() {
    const total = this.totalPages();
    const curr = this.currentPage();

    if (this.computedCircular()) {
      this.setPage((curr - 1 + total) % total);
    } else if (curr > 0) {
      this.setPage(curr - 1);
    }
  }

  onItemClick(item: unknown, index: number) {
    this.itemClick.emit({ item, index });
    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'itemClick', { item, index });
    }
  }

  onPointerDown(event: PointerEvent) {
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.isSwiping = true;
  }

  onPointerUp(event: PointerEvent) {
    if (!this.isSwiping) return;
    this.isSwiping = false;

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    if (this.computedOrientation() === 'horizontal') {
      if (Math.abs(deltaX) >= 40) {
        const isRtl = this.isRtlElement(event.currentTarget as Element);
        if (isRtl) {
          if (deltaX > 0) this.stepNext();
          else this.stepPrev();
        } else {
          if (deltaX < 0) this.stepNext();
          else this.stepPrev();
        }
      }
    } else {
      if (Math.abs(deltaY) >= 40) {
        if (deltaY < 0) this.stepNext();
        else this.stepPrev();
      }
    }
  }

  onPointerCancel() {
    this.isSwiping = false;
  }

  onKeydown(event: KeyboardEvent) {
    const isVertical = this.computedOrientation() === 'vertical';

    if (isVertical) {
      if (event.key === 'ArrowDown') {
        this.stepNext();
        event.preventDefault();
      } else if (event.key === 'ArrowUp') {
        this.stepPrev();
        event.preventDefault();
      }
    } else {
      const isRtl = this.isRtlElement(event.currentTarget as Element);
      if (event.key === 'ArrowRight') {
        if (isRtl) this.stepPrev();
        else this.stepNext();
        event.preventDefault();
      } else if (event.key === 'ArrowLeft') {
        if (isRtl) this.stepNext();
        else this.stepPrev();
        event.preventDefault();
      }
    }

    if (event.key === 'Home') {
      this.setPage(0);
      event.preventDefault();
    } else if (event.key === 'End') {
      this.setPage(this.totalPages() - 1);
      event.preventDefault();
    }
  }

  onMouseEnter() {
    if (this.computedPauseOnHover()) {
      this.isHovered = true;
      this.pauseAutoplayInternal();
    }
  }

  onMouseLeave() {
    if (this.computedPauseOnHover()) {
      this.isHovered = false;
      if (this.computedAutoplay()) {
        this.startAutoplayInternal();
      }
    }
  }

  onFocusIn() {
    if (this.computedPauseOnHover()) {
      this.isHovered = true;
      this.pauseAutoplayInternal();
    }
  }

  onFocusOut() {
    if (this.computedPauseOnHover()) {
      this.isHovered = false;
      if (this.computedAutoplay()) {
        this.startAutoplayInternal();
      }
    }
  }

  private startAutoplayInternal() {
    if (!isPlatformBrowser(this.platformId) || !this.computedAutoplay()) return;
    this.stopAutoplayInternal();
    this.autoplayTimer = setInterval(() => this.stepNext(true), this.computedInterval());
    this.play.emit();
    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'play');
    }
  }

  private pauseAutoplayInternal() {
    this.stopAutoplayInternal();
  }

  private stopAutoplayInternal() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
      this.pause.emit();
      const contractId = this.contract().id;
      if (contractId) {
        this.experienceAdapter.dispatchCapability(contractId, 'pause');
      }
    }
  }

  asObject(item: unknown): Record<string, unknown> | null {
    return item && typeof item === 'object' ? (item as Record<string, unknown>) : null;
  }

  getItemTitle(item: unknown): string | null {
    const obj = this.asObject(item);
    return obj && obj['title'] ? String(obj['title']) : null;
  }

  getItemContent(item: unknown): string | null {
    const obj = this.asObject(item);
    return obj && obj['content'] ? String(obj['content']) : null;
  }

  getItemImage(item: unknown): string | null {
    const obj = this.asObject(item);
    return obj && obj['image'] ? String(obj['image']) : null;
  }

  private isRtlElement(target?: Element): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return false;
    }
    const el = target ?? this.viewportEl()?.nativeElement;
    return el instanceof Element ? window.getComputedStyle(el).direction === 'rtl' : false;
  }
}
