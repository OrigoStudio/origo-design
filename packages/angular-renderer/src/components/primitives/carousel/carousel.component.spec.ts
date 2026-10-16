import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarouselComponent, CarouselProps } from './carousel.component';
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

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  let mockAdapter: { updateState: jest.Mock; dispatchCapability: jest.Mock };

  beforeEach(async () => {
    mockAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
  });

  it('should create and implement ContainerComponent with optional ViewContainerRef vc', () => {
    fixture.componentRef.setInput('contract', {
      id: 'car-1',
      type: 'Carousel',
      props: {
        items: [],
      },
    } as InteractionContract<CarouselProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.vc).toBeDefined();
  });

  it('should render items, navigators, indicator dots, and bind ARIA roles', () => {
    fixture.componentRef.setInput('contract', {
      id: 'car-aria',
      type: 'Carousel',
      props: {
        items: [
          { id: 'item-1', title: 'Card 1' },
          { id: 'item-2', title: 'Card 2' },
          { id: 'item-3', title: 'Card 3' },
        ],
        numVisible: 1,
        'aria-label': 'Featured Products',
      },
    } as InteractionContract<CarouselProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const region = root.querySelector('[role="region"]');
    expect(region).toBeTruthy();
    expect(region.getAttribute('aria-roledescription')).toBe('carousel');
    expect(region.getAttribute('aria-label')).toBe('Featured Products');

    const slides = Array.from(
      root.querySelectorAll('[aria-roledescription="slide"]')
    ) as HTMLElement[];
    expect(slides.length).toBe(3);
    expect(slides[0].getAttribute('aria-label')).toBe('Slide 1 of 3');

    const tablist = root.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();

    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLElement[];
    expect(tabs.length).toBe(3);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should navigate next and previous pages, emitting pageChange and synchronizing state', () => {
    const pageChangeSpy = jest.fn();
    component.pageChange.subscribe(pageChangeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'car-nav',
      type: 'Carousel',
      props: {
        items: ['A', 'B', 'C', 'D'],
        numVisible: 1,
        numScroll: 1,
      },
    } as InteractionContract<CarouselProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const nextBtn = root.querySelector('.origo-carousel__nav-next') as HTMLButtonElement;
    const prevBtn = root.querySelector('.origo-carousel__nav-prev') as HTMLButtonElement;

    // Initially at page 0, prev should be disabled (non-circular)
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);

    // Click next
    nextBtn.click();
    fixture.detectChanges();

    expect(pageChangeSpy).toHaveBeenCalledWith(1);
    expect(mockAdapter.updateState).toHaveBeenCalledWith('car-nav', 'page', 1);
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith('car-nav', 'pageChange', {
      page: 1,
    });
    expect(prevBtn.disabled).toBe(false);
  });

  it('should wrap pages in circular mode', () => {
    fixture.componentRef.setInput('contract', {
      id: 'car-circular',
      type: 'Carousel',
      props: {
        items: ['A', 'B', 'C'],
        numVisible: 1,
        circular: true,
      },
    } as InteractionContract<CarouselProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const prevBtn = root.querySelector('.origo-carousel__nav-prev') as HTMLButtonElement;
    const nextBtn = root.querySelector('.origo-carousel__nav-next') as HTMLButtonElement;

    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(false);

    // Prev from page 0 should wrap to page 2 (last)
    prevBtn.click();
    fixture.detectChanges();

    const tabs = Array.from(root.querySelectorAll('[role="tab"]')) as HTMLElement[];
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
  });

  it('should support pointer swipe gestures to advance slides', () => {
    const pageChangeSpy = jest.fn();
    component.pageChange.subscribe(pageChangeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'car-swipe',
      type: 'Carousel',
      props: {
        items: ['Item 1', 'Item 2', 'Item 3'],
      },
    } as InteractionContract<CarouselProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const track = root.querySelector('.origo-carousel__viewport') as HTMLElement;

    // Swipe left (startX: 100, endX: 40 -> deltaX: -60 < -40 threshold in LTR)
    track.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, bubbles: true }));
    track.dispatchEvent(new PointerEvent('pointerup', { clientX: 40, bubbles: true }));
    fixture.detectChanges();

    expect(pageChangeSpy).toHaveBeenCalledWith(1);
  });

  it('should navigate on keyboard arrow events', () => {
    const pageChangeSpy = jest.fn();
    component.pageChange.subscribe(pageChangeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'car-keys',
      type: 'Carousel',
      props: {
        items: ['Item 1', 'Item 2', 'Item 3'],
      },
    } as InteractionContract<CarouselProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const viewport = root.querySelector('.origo-carousel__viewport') as HTMLElement;

    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(pageChangeSpy).toHaveBeenCalledWith(1);
  });

  it('should support item click emission', () => {
    const itemClickSpy = jest.fn();
    component.itemClick.subscribe(itemClickSpy);

    const items = [{ id: '1', name: 'Alpha' }];
    fixture.componentRef.setInput('contract', {
      id: 'car-item-click',
      type: 'Carousel',
      props: {
        items,
      },
    } as InteractionContract<CarouselProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const slide = root.querySelector('.origo-carousel__item') as HTMLElement;
    slide.click();
    fixture.detectChanges();

    expect(itemClickSpy).toHaveBeenCalledWith({ item: items[0], index: 0 });
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith('car-item-click', 'itemClick', {
      item: items[0],
      index: 0,
    });
  });
});
