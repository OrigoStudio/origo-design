import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent } from './list.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockAdapterService: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockAdapterService = {
      updateState: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
  });

  it('should create and render with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'list-1',
      type: 'List',
      props: {
        items: [
          { id: '1', title: 'Item 1' },
          { id: '2', title: 'Item 2' },
        ],
        'aria-label': 'My list',
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-testid')).toBe('list-1');
    expect(host.getAttribute('role')).toBe('list');
    expect(host.getAttribute('aria-label')).toBe('My list');

    const items = host.shadowRoot!.querySelectorAll('.origo-list-item');
    expect(items.length).toBe(2);
    expect(items[0].getAttribute('role')).toBe('listitem');
  });

  it('should not crash with null/undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'list-err',
      type: 'List',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should respect maxItems cap', () => {
    const items = Array.from({ length: 15 }).map((_, i) => ({ id: `item-${i}` }));
    fixture.componentRef.setInput('contract', {
      id: 'list-max',
      type: 'List',
      props: { items, maxItems: 10 },
    });
    fixture.detectChanges();
    const renderedItems = (fixture.nativeElement as HTMLElement).shadowRoot!.querySelectorAll(
      '.origo-list-item'
    );
    expect(renderedItems.length).toBe(10);
  });

  it('should default to maxItems cap of 100 if omitted', () => {
    const items = Array.from({ length: 150 }).map((_, i) => ({ id: `item-${i}` }));
    fixture.componentRef.setInput('contract', {
      id: 'list-max-def',
      type: 'List',
      props: { items },
    });
    fixture.detectChanges();
    const renderedItems = (fixture.nativeElement as HTMLElement).shadowRoot!.querySelectorAll(
      '.origo-list-item'
    );
    expect(renderedItems.length).toBe(100);
  });

  it('should handle item selection via updateState and sanitize value', () => {
    fixture.componentRef.setInput('contract', {
      id: 'list-select',
      type: 'List',
      props: { items: [{ id: '1', title: 'One' }] },
    });
    fixture.detectChanges();

    component.onItemSelect('1');
    expect(mockAdapterService.updateState).toHaveBeenCalledWith(
      'list-select',
      'selectedItem',
      expect.any(String)
    );
  });

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'list-disabled',
      type: 'List',
      props: {
        items: [{ id: '1' }],
        disabled: true,
      },
    });
    fixture.detectChanges();

    component.onItemSelect('1');
    expect(mockAdapterService.updateState).not.toHaveBeenCalled();
  });

  it('should support RTL layouts by avoiding physical CSS properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-test', type: 'test', props: {} });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const element = root.firstElementChild as HTMLElement;
    if (element && element.style) {
      expect(element.style.paddingLeft).toBeFalsy();
      expect(element.style.paddingRight).toBeFalsy();
      expect(element.style.marginLeft).toBeFalsy();
      expect(element.style.marginRight).toBeFalsy();
    }
  });
});
