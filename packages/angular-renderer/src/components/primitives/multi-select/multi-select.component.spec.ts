import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiSelectComponent } from './multi-select.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('MultiSelectComponent', () => {
  let component: MultiSelectComponent;
  let fixture: ComponentFixture<MultiSelectComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [MultiSelectComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectComponent);
    component = fixture.componentInstance;
  });

  const getRoot = () => fixture.nativeElement.shadowRoot ?? fixture.nativeElement;

  it('should instantiate from a pure JSON contract and render multiselect trigger', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ms-1',
      type: 'MultiSelect',
      props: {
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ],
        value: ['a'],
        placeholder: 'Select items',
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.value()).toEqual(['a']);

    const trigger = getRoot().querySelector('[role="combobox"]');
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Option A');
  });

  it('should toggle item selection and dispatch updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ms-toggle',
      type: 'MultiSelect',
      props: {
        options: ['Item 1', 'Item 2', 'Item 3'],
        value: ['Item 1'],
      },
    });
    fixture.detectChanges();

    component.toggleOption('Item 2');
    fixture.detectChanges();

    expect(component.value()).toEqual(['Item 1', 'Item 2']);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('ms-toggle', 'value', [
      'Item 1',
      'Item 2',
    ]);

    // Unselect Item 1
    component.toggleOption('Item 1');
    fixture.detectChanges();

    expect(component.value()).toEqual(['Item 2']);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('ms-toggle', 'value', [
      'Item 2',
    ]);
  });

  it('should toggle all items via toggleAll()', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ms-all',
      type: 'MultiSelect',
      props: {
        options: ['Apple', 'Banana', 'Cherry'],
        value: ['Apple'],
        showToggleAll: true,
      },
    });
    fixture.detectChanges();

    // Toggle all should select all
    component.toggleAll();
    fixture.detectChanges();

    expect(component.value()).toEqual(['Apple', 'Banana', 'Cherry']);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('ms-all', 'value', [
      'Apple',
      'Banana',
      'Cherry',
    ]);

    // Toggle all again should unselect all
    component.toggleAll();
    fixture.detectChanges();

    expect(component.value()).toEqual([]);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('ms-all', 'value', []);
  });

  it('should format labels in comma mode and respect maxSelectedLabels', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ms-label',
      type: 'MultiSelect',
      props: {
        options: ['A', 'B', 'C', 'D'],
        value: ['A', 'B'],
        maxSelectedLabels: 2,
        selectedItemsLabel: '{0} items selected',
      },
    });
    fixture.detectChanges();

    expect(component.displaySummary()).toBe('A, B');

    // Exceed maxSelectedLabels
    fixture.componentRef.setInput('contract', {
      id: 'ms-label',
      type: 'MultiSelect',
      props: {
        options: ['A', 'B', 'C', 'D'],
        value: ['A', 'B', 'C'],
        maxSelectedLabels: 2,
        selectedItemsLabel: '{0} items selected',
      },
    });
    fixture.detectChanges();

    expect(component.displaySummary()).toBe('3 items selected');
  });

  it('should render chips when display="chip" and allow removing chip', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ms-chip',
      type: 'MultiSelect',
      props: {
        options: ['Red', 'Green', 'Blue'],
        value: ['Red', 'Green'],
        display: 'chip',
      },
    });
    fixture.detectChanges();

    const chips = getRoot().querySelectorAll('.origo-multi-select__chip');
    expect(chips.length).toBe(2);
    expect(chips[0].textContent).toContain('Red');

    // Remove first chip
    const removeBtn = chips[0].querySelector('.origo-multi-select__chip-remove');
    expect(removeBtn).toBeTruthy();
    removeBtn.click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['Green']);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('ms-chip', 'value', ['Green']);
  });

  it('should clear selection when clear button clicked', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ms-clear',
      type: 'MultiSelect',
      props: {
        options: ['X', 'Y'],
        value: ['X'],
        clearable: true,
      },
    });
    fixture.detectChanges();

    const clearBtn = getRoot().querySelector('.origo-multi-select__clear');
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    fixture.detectChanges();

    expect(component.value()).toEqual([]);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('ms-clear', 'value', []);
  });

  it('should navigate and toggle options via keyboard', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ms-kbd',
      type: 'MultiSelect',
      props: {
        options: ['One', 'Two', 'Three'],
        value: [],
      },
    });
    fixture.detectChanges();

    const trigger = getRoot().querySelector('[role="combobox"]');

    // ArrowDown opens dropdown
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    expect(component.activeIndex()).toBe(0);

    // Space toggles currently active option
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    fixture.detectChanges();
    expect(component.value()).toEqual(['One']);

    // ArrowDown moves to next
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(1);

    // Enter toggles second option
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(component.value()).toEqual(['One', 'Two']);

    // Escape closes
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should support RTL layouts by avoiding physical CSS properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-ms', type: 'MultiSelect', props: {} });
    fixture.detectChanges();
    const root = getRoot();
    const element = root.firstElementChild as HTMLElement;
    if (element && element.style) {
      expect(element.style.paddingLeft).toBeFalsy();
      expect(element.style.paddingRight).toBeFalsy();
      expect(element.style.marginLeft).toBeFalsy();
      expect(element.style.marginRight).toBeFalsy();
    }
  });
});
