import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SliderComponent, SliderProps } from './slider.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origostudio/core';

interface MockPointerEventInit extends MouseEventInit {
  pointerId?: number;
  pointerType?: string;
}

if (typeof (globalThis as Record<string, unknown>)['PointerEvent'] === 'undefined') {
  (globalThis as Record<string, unknown>)['PointerEvent'] = class PointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, params: MockPointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 1;
      this.pointerType = params.pointerType ?? 'mouse';
    }
  };
}

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;
  let mockAdapter: { updateState: jest.Mock; dispatchCapability: jest.Mock };

  beforeEach(async () => {
    mockAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SliderComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;
  });

  it('should render single slider thumb and progress track with ARIA roles', () => {
    fixture.componentRef.setInput('contract', {
      id: 'slider-1',
      type: 'Slider',
      props: {
        value: 40,
        min: 0,
        max: 100,
        step: 5,
        'aria-label': 'Volume',
      },
    } as InteractionContract<SliderProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const thumb = root.querySelector('[role="slider"]') as HTMLElement;
    expect(thumb).toBeTruthy();
    expect(thumb.getAttribute('aria-valuenow')).toBe('40');
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb.getAttribute('aria-label')).toBe('Volume');

    const progress = root.querySelector('.origo-slider__progress') as HTMLElement;
    expect(progress).toBeTruthy();
  });

  it('should render range slider with two thumbs and interval fill', () => {
    fixture.componentRef.setInput('contract', {
      id: 'slider-range',
      type: 'RangeSlider',
      props: {
        range: true,
        value: [20, 80],
        min: 0,
        max: 100,
        step: 1,
      },
    } as InteractionContract<SliderProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const thumbs = Array.from(root.querySelectorAll('[role="slider"]')) as HTMLElement[];
    expect(thumbs.length).toBe(2);

    expect(thumbs[0].getAttribute('aria-valuenow')).toBe('20');
    expect(thumbs[0].getAttribute('aria-label')).toBe('Minimum value');

    expect(thumbs[1].getAttribute('aria-valuenow')).toBe('80');
    expect(thumbs[1].getAttribute('aria-label')).toBe('Maximum value');
  });

  it('should elevate active thumb z-index when thumbs collide in range mode', () => {
    fixture.componentRef.setInput('contract', {
      id: 'slider-collide',
      type: 'RangeSlider',
      props: {
        range: true,
        value: [50, 50],
        min: 0,
        max: 100,
      },
    } as InteractionContract<SliderProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const thumbs = Array.from(root.querySelectorAll('[role="slider"]')) as HTMLElement[];

    // Lower thumb gets focused
    thumbs[0].dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();

    expect(thumbs[0].style.zIndex).toBe('2');
  });

  it('should support keyboard step navigation on focused thumb', () => {
    const valueChangeSpy = jest.fn();
    component.valueChange.subscribe(valueChangeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'slider-keys',
      type: 'Slider',
      props: {
        value: 10,
        min: 0,
        max: 50,
        step: 5,
      },
    } as InteractionContract<SliderProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const thumb = root.querySelector('[role="slider"]') as HTMLElement;

    // ArrowRight increments by 5 -> 15
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(valueChangeSpy).toHaveBeenCalledWith(15);
    expect(mockAdapter.updateState).toHaveBeenCalledWith('slider-keys', 'value', 15);

    // End sets to max -> 50
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();

    expect(valueChangeSpy).toHaveBeenCalledWith(50);

    // Home sets to min -> 0
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();

    expect(valueChangeSpy).toHaveBeenCalledWith(0);
  });

  it('should handle track click to snap to nearest stepped value', () => {
    const valueChangeSpy = jest.fn();
    component.valueChange.subscribe(valueChangeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'slider-click',
      type: 'Slider',
      props: {
        value: 0,
        min: 0,
        max: 100,
        step: 10,
      },
    } as InteractionContract<SliderProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const track = root.querySelector('.origo-slider__track') as HTMLElement;

    // Mock getBoundingClientRect
    jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 200,
      width: 200,
      top: 0,
      bottom: 20,
      height: 20,
    } as DOMRect);

    // Click at clientX: 70 on a 200px track -> ratio 70/200 = 0.35 -> 35 -> snaps to step 10 -> 40
    track.dispatchEvent(new PointerEvent('pointerdown', { clientX: 70, bubbles: true }));
    fixture.detectChanges();

    expect(valueChangeSpy).toHaveBeenCalledWith(40);
  });

  it('should not update values when disabled or readonly', () => {
    const valueChangeSpy = jest.fn();
    component.valueChange.subscribe(valueChangeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'slider-disabled',
      type: 'Slider',
      props: {
        value: 10,
        min: 0,
        max: 100,
        disabled: true,
      },
    } as InteractionContract<SliderProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const thumb = root.querySelector('[role="slider"]') as HTMLElement;

    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(valueChangeSpy).not.toHaveBeenCalled();
    expect(thumb.getAttribute('aria-disabled')).toBe('true');
  });

  it('should render tooltip bubble when configured', () => {
    fixture.componentRef.setInput('contract', {
      id: 'slider-tooltip',
      type: 'Slider',
      props: {
        value: 75,
        min: 0,
        max: 100,
        tooltip: 'always',
        tooltipPosition: 'top',
      },
    } as InteractionContract<SliderProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const tooltip = root.querySelector('.origo-slider__tooltip') as HTMLElement;
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain('75');
  });
});
