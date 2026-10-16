import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionComponent, AccordionProps, AccordionItem } from './accordion.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origostudio/core';

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;
  let mockAdapter: { updateState: jest.Mock; dispatchCapability: jest.Mock };

  beforeEach(async () => {
    mockAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AccordionComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
  });

  it('should create and implement ContainerComponent with optional ViewContainerRef vc', () => {
    fixture.componentRef.setInput('contract', {
      id: 'acc-1',
      type: 'Accordion',
      props: {
        items: [],
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.vc).toBeDefined();
  });

  it('should render panel headers, badges, icons and bind WAI-ARIA roles', () => {
    const items: AccordionItem[] = [
      { key: 'panel-1', header: 'Section 1', content: 'Content 1', badge: 'New', icon: 'star' },
      { key: 'panel-2', header: 'Section 2', content: 'Content 2' },
    ];

    fixture.componentRef.setInput('contract', {
      id: 'acc-aria',
      type: 'Accordion',
      props: {
        items,
        value: 'panel-1',
        'aria-label': 'Sample Accordion',
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const container = root.querySelector('.origo-accordion__container');
    expect(container).toBeTruthy();

    const headers = Array.from(
      root.querySelectorAll('.origo-accordion__header-btn')
    ) as HTMLButtonElement[];
    expect(headers.length).toBe(2);

    // First header should be expanded
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[0].getAttribute('aria-controls')).toContain('panel-1');
    expect(headers[0].textContent).toContain('Section 1');
    expect(headers[0].textContent).toContain('New');

    // First panel
    const panels = Array.from(root.querySelectorAll('[role="region"]')) as HTMLElement[];
    expect(panels.length).toBe(2);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(headers[0].id);

    // Second header should be collapsed
    expect(headers[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('should support panels alias and multi-item value array', () => {
    fixture.componentRef.setInput('contract', {
      id: 'acc-alias',
      type: 'Accordion',
      props: {
        panels: [
          { key: 'p1', header: 'Panel 1', content: 'Body 1' },
          { key: 'p2', header: 'Panel 2', content: 'Body 2' },
        ],
        value: ['p1', 'p2'],
        multiple: true,
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const headers = Array.from(
      root.querySelectorAll('.origo-accordion__header-btn')
    ) as HTMLButtonElement[];
    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should toggle panel open and close on header click and emit valueChange, open, close', () => {
    const valueChangeSpy = jest.fn();
    const openSpy = jest.fn();
    const closeSpy = jest.fn();

    component.valueChange.subscribe(valueChangeSpy);
    component.open.subscribe(openSpy);
    component.close.subscribe(closeSpy);

    fixture.componentRef.setInput('contract', {
      id: 'acc-toggle',
      type: 'Accordion',
      props: {
        items: [
          { key: 'a', header: 'A', content: 'Content A' },
          { key: 'b', header: 'B', content: 'Content B' },
        ],
        value: 'a',
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const headers = Array.from(
      root.querySelectorAll('.origo-accordion__header-btn')
    ) as HTMLButtonElement[];

    // Click header B to open B (and close A since multiple is false)
    headers[1].click();
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledWith('b');
    expect(valueChangeSpy).toHaveBeenCalledWith('b');
    expect(mockAdapter.updateState).toHaveBeenCalledWith('acc-toggle', 'value', 'b');
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith('acc-toggle', 'open', { key: 'b' });

    // Click header B again to collapse it
    headers[1].click();
    fixture.detectChanges();

    expect(closeSpy).toHaveBeenCalledWith('b');
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith('acc-toggle', 'close', {
      key: 'b',
    });
  });

  it('should support multiple open panels when multiple is true', () => {
    fixture.componentRef.setInput('contract', {
      id: 'acc-multi',
      type: 'Accordion',
      props: {
        items: [
          { key: 'a', header: 'A', content: 'Content A' },
          { key: 'b', header: 'B', content: 'Content B' },
        ],
        multiple: true,
        value: ['a'],
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const headers = Array.from(
      root.querySelectorAll('.origo-accordion__header-btn')
    ) as HTMLButtonElement[];

    // Click B
    headers[1].click();
    fixture.detectChanges();

    expect(headers[0].getAttribute('aria-expanded')).toBe('true');
    expect(headers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('should guard against interaction when accordion or panel is disabled', () => {
    const openSpy = jest.fn();
    component.open.subscribe(openSpy);

    fixture.componentRef.setInput('contract', {
      id: 'acc-disabled',
      type: 'Accordion',
      props: {
        items: [
          { key: 'a', header: 'A', content: 'Content A', disabled: true },
          { key: 'b', header: 'B', content: 'Content B' },
        ],
        disabled: false,
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const headers = Array.from(
      root.querySelectorAll('.origo-accordion__header-btn')
    ) as HTMLButtonElement[];

    // Try clicking disabled panel A
    headers[0].click();
    fixture.detectChanges();

    expect(openSpy).not.toHaveBeenCalled();
    expect(headers[0].getAttribute('aria-disabled')).toBe('true');
  });

  it('should support keyboard navigation across accordion headers', () => {
    fixture.componentRef.setInput('contract', {
      id: 'acc-keys',
      type: 'Accordion',
      props: {
        items: [
          { key: 'p1', header: 'P1' },
          { key: 'p2', header: 'P2' },
          { key: 'p3', header: 'P3' },
        ],
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const headers = Array.from(
      root.querySelectorAll('.origo-accordion__header-btn')
    ) as HTMLButtonElement[];

    const focusSpy1 = jest.spyOn(headers[1], 'focus');
    const focusSpy2 = jest.spyOn(headers[2], 'focus');
    const focusSpy0 = jest.spyOn(headers[0], 'focus');

    // ArrowDown on header 0 moves focus to header 1
    headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(focusSpy1).toHaveBeenCalled();

    // ArrowUp on header 0 wraps focus to header 2
    headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(focusSpy2).toHaveBeenCalled();

    // End on header 0 moves focus to last header (2)
    headers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(focusSpy2).toHaveBeenCalled();

    // Home on header 2 moves focus to first header (0)
    headers[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(focusSpy0).toHaveBeenCalled();
  });

  it('should defer rendering panel body content when lazy is true until first expanded', () => {
    fixture.componentRef.setInput('contract', {
      id: 'acc-lazy',
      type: 'Accordion',
      props: {
        items: [{ key: 'lazy-1', header: 'Lazy Header', content: 'Lazy Content Inside' }],
        lazy: true,
      },
    } as InteractionContract<AccordionProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    // Before expansion, body text should not be rendered
    expect(root.textContent).not.toContain('Lazy Content Inside');

    // Expand
    const header = root.querySelector('.origo-accordion__header-btn') as HTMLButtonElement;
    header?.click();
    fixture.detectChanges();

    // After expansion, body text should be rendered
    expect(root.textContent).toContain('Lazy Content Inside');
  });
});
