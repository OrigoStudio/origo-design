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
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { InteractionContract } from '@origostudio/core';
import { OrigoAdapter, coerceContractProps } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface SliderProps {
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
  value?: number | [number, number];
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  readonly?: boolean;
  tooltip?: 'none' | 'always' | 'focus' | 'hover';
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const SliderContractSchema = {
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
  min: 'number',
  max: 'number',
  step: 'number',
  range: 'boolean',
  orientation: 'string',
  disabled: 'boolean',
  readonly: 'boolean',
  tooltip: 'string',
  tooltipPosition: 'string',
} as const;

@Component({
  selector: 'origo-slider',
  standalone: true,
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-slider]': 'true',
    '[class.origo-slider--vertical]': "computedOrientation() === 'vertical'",
    '[class.origo-slider--disabled]': 'computedDisabled()',
    '[class.origo-slider--readonly]': 'computedReadonly()',
    '[attr.data-testid]': 'contract().id',
  },
})
export class SliderComponent implements OrigoAdapter<SliderProps> {
  static readonly contractSchema = SliderContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<SliderProps>>();
  readonly trackEl = viewChild<ElementRef<HTMLElement>>('track');

  valueChange = output<number | [number, number]>();
  slideStart = output<number | [number, number]>();
  slide = output<number | [number, number]>();
  slideEnd = output<number | [number, number]>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  protected currentValue = signal<number>(0);
  protected valLower = signal<number>(0);
  protected valUpper = signal<number>(100);

  protected activeThumb = signal<'single' | 'lower' | 'upper' | null>(null);
  protected hoveredThumb = signal<'single' | 'lower' | 'upper' | null>(null);
  protected isDragging = signal<boolean>(false);

  private moveListener: ((e: PointerEvent) => void) | null = null;
  private upListener: ((e: PointerEvent) => void) | null = null;
  private cachedIsRtl = false;

  constructor() {
    effect(() => {
      const raw = this.props().value;
      const isRange = !!this.props().range;
      const min = this.computedMin();
      const max = this.computedSafeMax();

      if (isRange) {
        if (Array.isArray(raw) && raw.length >= 2) {
          const l = this.clampAndStep(Number(raw[0]));
          const u = this.clampAndStep(Number(raw[1]));
          this.valLower.set(Math.min(l, u));
          this.valUpper.set(Math.max(l, u));
        } else if (typeof raw === 'number' && !isNaN(raw)) {
          const v = this.clampAndStep(raw);
          this.valLower.set(min);
          this.valUpper.set(v);
        } else {
          this.valLower.set(min);
          this.valUpper.set(max);
        }
      } else {
        if (typeof raw === 'number' && !isNaN(raw)) {
          this.currentValue.set(this.clampAndStep(raw));
        } else if (Array.isArray(raw) && raw.length > 0) {
          this.currentValue.set(this.clampAndStep(Number(raw[0])));
        } else {
          this.currentValue.set(min);
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      this.cleanupDragListeners();
    });
  }

  protected props = computed(() =>
    coerceContractProps<SliderProps>(this.contract().props, SliderContractSchema)
  );

  computedMin = computed(() => {
    const m = this.props().min;
    return typeof m === 'number' && !isNaN(m) ? m : 0;
  });

  computedSafeMax = computed(() => {
    const m = this.props().max;
    const min = this.computedMin();
    return typeof m === 'number' && !isNaN(m) && m > min ? m : min + 100;
  });

  computedStep = computed(() => {
    const s = this.props().step;
    return typeof s === 'number' && s > 0 ? s : 1;
  });

  computedRange = computed(() => !!this.props().range);

  computedOrientation = computed<'horizontal' | 'vertical'>(() => {
    return this.props().orientation === 'vertical' ? 'vertical' : 'horizontal';
  });

  computedDisabled = computed(() => !!this.props().disabled);
  computedReadonly = computed(() => !!this.props().readonly);

  computedTooltip = computed(() => this.props().tooltip || 'hover');

  computedTooltipPosition = computed(() => {
    return (
      this.props().tooltipPosition || (this.computedOrientation() === 'vertical' ? 'right' : 'top')
    );
  });

  computedAriaLabel = computed(() => this.props()['aria-label']);
  computedAriaDescribedBy = computed(() => this.props()['aria-describedby']);

  clampAndStep(val: number): number {
    const min = this.computedMin();
    const max = this.computedSafeMax();
    const step = this.computedStep();

    let stepped = min + Math.round((val - min) / step) * step;
    const stepStr = step.toString();
    const decimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
    stepped = Number(stepped.toFixed(decimals));
    return Math.max(min, Math.min(stepped, max));
  }

  valToPercent(val: number): number {
    const min = this.computedMin();
    const max = this.computedSafeMax();
    if (max <= min) return 0;
    const p = ((val - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, p));
  }

  singlePercent = computed(() => this.valToPercent(this.currentValue()));
  lowerPercent = computed(() => this.valToPercent(this.valLower()));
  upperPercent = computed(() => this.valToPercent(this.valUpper()));

  lowerZIndex = computed(() => {
    if (this.valLower() === this.valUpper()) {
      return this.activeThumb() === 'lower' || this.hoveredThumb() === 'lower' ? 2 : 1;
    }
    return 1;
  });

  upperZIndex = computed(() => {
    if (this.valLower() === this.valUpper()) {
      return this.activeThumb() === 'upper' || this.hoveredThumb() === 'upper' ? 2 : 1;
    }
    return 1;
  });

  progressStyle = computed(() => {
    const isVertical = this.computedOrientation() === 'vertical';
    if (!this.computedRange()) {
      const p = this.singlePercent();
      return isVertical
        ? { 'inset-block-end': '0%', 'block-size': `${p}%` }
        : { 'inset-inline-start': '0%', 'inline-size': `${p}%` };
    } else {
      const start = this.lowerPercent();
      const size = Math.max(0, this.upperPercent() - start);
      return isVertical
        ? { 'inset-block-end': `${start}%`, 'block-size': `${size}%` }
        : { 'inset-inline-start': `${start}%`, 'inline-size': `${size}%` };
    }
  });

  singleThumbStyle = computed(() => {
    const isVertical = this.computedOrientation() === 'vertical';
    const p = this.singlePercent();
    return isVertical ? { 'inset-block-end': `${p}%` } : { 'inset-inline-start': `${p}%` };
  });

  lowerThumbStyle = computed(() => {
    const isVertical = this.computedOrientation() === 'vertical';
    const p = this.lowerPercent();
    const z = this.lowerZIndex();
    return isVertical
      ? { 'inset-block-end': `${p}%`, 'z-index': `${z}` }
      : { 'inset-inline-start': `${p}%`, 'z-index': `${z}` };
  });

  upperThumbStyle = computed(() => {
    const isVertical = this.computedOrientation() === 'vertical';
    const p = this.upperPercent();
    const z = this.upperZIndex();
    return isVertical
      ? { 'inset-block-end': `${p}%`, 'z-index': `${z}` }
      : { 'inset-inline-start': `${p}%`, 'z-index': `${z}` };
  });

  isTooltipVisible(thumbType: 'single' | 'lower' | 'upper'): boolean {
    const mode = this.computedTooltip();
    if (mode === 'none') return false;
    if (mode === 'always') return true;
    if (mode === 'focus') return this.activeThumb() === thumbType;
    if (mode === 'hover') {
      return this.hoveredThumb() === thumbType || this.activeThumb() === thumbType;
    }
    return false;
  }

  onThumbFocus(type: 'single' | 'lower' | 'upper') {
    this.activeThumb.set(type);
  }

  onThumbBlur() {
    if (!this.isDragging()) {
      this.activeThumb.set(null);
    }
  }

  onThumbMouseEnter(type: 'single' | 'lower' | 'upper') {
    this.hoveredThumb.set(type);
  }

  onThumbMouseLeave() {
    this.hoveredThumb.set(null);
  }

  onTrackPointerDown(event: PointerEvent) {
    if (this.computedDisabled() || this.computedReadonly()) return;

    const clickedVal = this.getValueFromPointer(event);
    if (!this.computedRange()) {
      this.setSingleValue(clickedVal);
    } else {
      const l = this.valLower();
      const u = this.valUpper();
      if (l === u) {
        if (clickedVal < l) this.setLowerValue(clickedVal);
        else this.setUpperValue(clickedVal);
      } else {
        const distL = Math.abs(clickedVal - l);
        const distU = Math.abs(clickedVal - u);
        if (distL <= distU) this.setLowerValue(clickedVal);
        else this.setUpperValue(clickedVal);
      }
    }
  }

  onThumbPointerDown(event: PointerEvent, type: 'single' | 'lower' | 'upper') {
    if (this.computedDisabled() || this.computedReadonly()) return;

    event.stopPropagation();
    event.preventDefault();

    this.activeThumb.set(type);
    this.isDragging.set(true);

    const track = this.trackEl()?.nativeElement;
    this.cachedIsRtl = track ? this.isRtlElement(track) : false;

    const startVal = this.getCurrentValuePayload();
    this.slideStart.emit(startVal);
    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'slideStart', { value: startVal });
    }

    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      this.cleanupDragListeners();

      this.moveListener = (e: PointerEvent) => {
        const newVal = this.getValueFromPointer(e, this.cachedIsRtl);
        if (type === 'single') {
          this.setSingleValue(newVal, false);
        } else if (type === 'lower') {
          this.setLowerValue(newVal, false);
        } else if (type === 'upper') {
          this.setUpperValue(newVal, false);
        }

        const currentPayload = this.getCurrentValuePayload();
        this.slide.emit(currentPayload);
        if (contractId) {
          this.experienceAdapter.dispatchCapability(contractId, 'slide', { value: currentPayload });
        }
      };

      this.upListener = () => {
        this.cleanupDragListeners();
        this.isDragging.set(false);

        const endVal = this.getCurrentValuePayload();
        this.slideEnd.emit(endVal);
        if (contractId) {
          this.experienceAdapter.dispatchCapability(contractId, 'slideEnd', { value: endVal });
        }
      };

      this.document.addEventListener('pointermove', this.moveListener);
      this.document.addEventListener('pointerup', this.upListener);
      this.document.addEventListener('pointercancel', this.upListener);
    }
  }

  private cleanupDragListeners() {
    if (this.moveListener) {
      this.document.removeEventListener('pointermove', this.moveListener);
      this.moveListener = null;
    }
    if (this.upListener) {
      this.document.removeEventListener('pointerup', this.upListener);
      this.document.removeEventListener('pointercancel', this.upListener);
      this.upListener = null;
    }
  }

  onThumbKeydown(event: KeyboardEvent, type: 'single' | 'lower' | 'upper') {
    if (this.computedDisabled() || this.computedReadonly()) return;

    const step = this.computedStep();
    const largeStep = step * 10;
    const min = this.computedMin();
    const max = this.computedSafeMax();

    let handled = false;
    let targetVal =
      type === 'single'
        ? this.currentValue()
        : type === 'lower'
          ? this.valLower()
          : this.valUpper();

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        targetVal += step;
        handled = true;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        targetVal -= step;
        handled = true;
        break;
      case 'PageUp':
        targetVal += largeStep;
        handled = true;
        break;
      case 'PageDown':
        targetVal -= largeStep;
        handled = true;
        break;
      case 'Home':
        targetVal = type === 'upper' ? this.valLower() : min;
        handled = true;
        break;
      case 'End':
        targetVal = type === 'lower' ? this.valUpper() : max;
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      if (type === 'single') {
        this.setSingleValue(targetVal);
      } else if (type === 'lower') {
        this.setLowerValue(targetVal);
      } else if (type === 'upper') {
        this.setUpperValue(targetVal);
      }
    }
  }

  private setSingleValue(val: number, emitChange = true) {
    const clamped = this.clampAndStep(val);
    this.currentValue.set(clamped);

    if (emitChange) {
      this.valueChange.emit(clamped);
      const contractId = this.contract().id;
      if (contractId) {
        this.experienceAdapter.updateState(contractId, 'value', clamped);
        this.experienceAdapter.dispatchCapability(contractId, 'valueChange', { value: clamped });
      }
    }
  }

  private setLowerValue(val: number, emitChange = true) {
    const stepped = this.clampAndStep(val);
    const clamped = Math.min(stepped, this.valUpper());
    this.valLower.set(clamped);

    if (emitChange) {
      const payload: [number, number] = [clamped, this.valUpper()];
      this.valueChange.emit(payload);
      const contractId = this.contract().id;
      if (contractId) {
        this.experienceAdapter.updateState(contractId, 'value', payload);
        this.experienceAdapter.dispatchCapability(contractId, 'valueChange', { value: payload });
      }
    }
  }

  private setUpperValue(val: number, emitChange = true) {
    const stepped = this.clampAndStep(val);
    const clamped = Math.max(stepped, this.valLower());
    this.valUpper.set(clamped);

    if (emitChange) {
      const payload: [number, number] = [this.valLower(), clamped];
      this.valueChange.emit(payload);
      const contractId = this.contract().id;
      if (contractId) {
        this.experienceAdapter.updateState(contractId, 'value', payload);
        this.experienceAdapter.dispatchCapability(contractId, 'valueChange', { value: payload });
      }
    }
  }

  private getCurrentValuePayload(): number | [number, number] {
    return this.computedRange() ? [this.valLower(), this.valUpper()] : this.currentValue();
  }

  private getValueFromPointer(event: PointerEvent, cachedRtl?: boolean): number {
    const track = this.trackEl()?.nativeElement;
    if (!track) return this.computedMin();

    const rect = track.getBoundingClientRect();
    const min = this.computedMin();
    const max = this.computedSafeMax();
    const isVertical = this.computedOrientation() === 'vertical';

    let ratio: number;
    if (isVertical) {
      const safeHeight = rect.height > 0 ? rect.height : 1;
      ratio = (rect.bottom - event.clientY) / safeHeight;
    } else {
      const safeWidth = rect.width > 0 ? rect.width : 1;
      const isRtl = cachedRtl !== undefined ? cachedRtl : this.isRtlElement(track);
      if (isRtl) {
        ratio = (rect.right - event.clientX) / safeWidth;
      } else {
        ratio = (event.clientX - rect.left) / safeWidth;
      }
    }

    ratio = Math.max(0, Math.min(1, ratio));
    return this.clampAndStep(min + ratio * (max - min));
  }

  private isRtlElement(el: Element): boolean {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') {
      return false;
    }
    return window.getComputedStyle(el).direction === 'rtl';
  }
}
