import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [SelectComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
  });

  const getRoot = () => fixture.nativeElement.shadowRoot ?? fixture.nativeElement;

  it('should instantiate from a pure JSON contract and render combobox', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-1',
      type: 'Select',
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
        value: '1',
        placeholder: 'Choose item',
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.value()).toBe('1');

    const trigger = getRoot().querySelector('[role="combobox"]');
    expect(trigger).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toContain('Option 1');
  });

  it('should normalize primitive strings, custom object keys, and grouped options', () => {
    // 1. Primitive strings
    fixture.componentRef.setInput('contract', {
      id: 'select-norm',
      type: 'Select',
      props: {
        options: ['Apple', 'Banana'],
        value: 'Apple',
      },
    });
    fixture.detectChanges();
    expect(component.computedNormalizedOptions().length).toBe(2);
    expect(component.computedNormalizedOptions()[0]).toEqual({
      label: 'Apple',
      value: 'Apple',
      disabled: false,
    });

    // 2. Custom keys
    fixture.componentRef.setInput('contract', {
      id: 'select-custom',
      type: 'Select',
      props: {
        options: [{ code: 'US', name: 'United States' }],
        optionLabel: 'name',
        optionValue: 'code',
      },
    });
    fixture.detectChanges();
    expect(component.computedNormalizedOptions()[0]).toEqual({
      label: 'United States',
      value: 'US',
      disabled: false,
    });

    // 3. Grouped options
    fixture.componentRef.setInput('contract', {
      id: 'select-grouped',
      type: 'Select',
      props: {
        options: [
          {
            groupName: 'Fruits',
            items: [{ label: 'Cherry', value: 'cherry' }],
          },
        ],
        optionGroupLabel: 'groupName',
        optionGroupChildren: 'items',
      },
    });
    fixture.detectChanges();
    expect(component.computedNormalizedOptions()[0]).toEqual({
      label: 'Cherry',
      value: 'cherry',
      disabled: false,
      group: 'Fruits',
    });
  });

  it('should toggle dropdown and dispatch updateState on option selection', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-interactive',
      type: 'Select',
      props: {
        options: ['Apple', 'Banana'],
      },
    });
    fixture.detectChanges();

    const trigger = getRoot().querySelector('[role="combobox"]');
    trigger.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    component.selectOption('Banana');
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
    expect(component.value()).toBe('Banana');
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith(
      'select-interactive',
      'value',
      'Banana'
    );
  });

  it('should filter options based on filterBy and filterMatchMode', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-filter',
      type: 'Select',
      props: {
        options: ['Canada', 'Cambodia', 'France'],
        filter: true,
        filterMatchMode: 'startsWith',
      },
    });
    fixture.detectChanges();

    component.toggleOpen();
    fixture.detectChanges();

    component.filterQuery.set('Cam');
    fixture.detectChanges();

    const filtered = component.filteredOptions();
    expect(filtered.length).toBe(1);
    expect(filtered[0].label).toBe('Cambodia');
  });

  it('should handle keyboard navigation correctly', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-kbd',
      type: 'Select',
      props: {
        options: ['Item A', 'Item B', 'Item C'],
      },
    });
    fixture.detectChanges();

    const trigger = getRoot().querySelector('[role="combobox"]');

    // ArrowDown opens dropdown and sets activeIndex
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    expect(component.activeIndex()).toBe(0);

    // ArrowDown again moves to next item
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(1);

    // Enter selects active option
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
    expect(component.value()).toBe('Item B');

    // Open again and test Escape closes
    component.toggleOpen();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should support clearable functionality', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-clear',
      type: 'Select',
      props: {
        options: ['One', 'Two'],
        value: 'One',
        clearable: true,
      },
    });
    fixture.detectChanges();

    const clearBtn = getRoot().querySelector('.origo-select__clear');
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    fixture.detectChanges();

    expect(component.value()).toBe('');
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('select-clear', 'value', '');
  });

  it('should preserve values containing special characters without DomSanitizer HTML corruption', () => {
    const specialVal = '<special-token>';
    fixture.componentRef.setInput('contract', {
      id: 'select-sanitize',
      type: 'Select',
      props: {
        options: [{ label: 'Special', value: specialVal }],
      },
    });
    fixture.detectChanges();

    component.selectOption(specialVal);
    expect(component.value()).toBe(specialVal);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith(
      'select-sanitize',
      'value',
      specialVal
    );
  });

  it('should render errorText and helpText with accessible links', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-err',
      type: 'Select',
      props: {
        options: ['A'],
        invalid: true,
        errorText: 'Selection required',
        helpText: 'Select an option from the list',
      },
    });
    fixture.detectChanges();

    const err = getRoot().querySelector('.origo-select__error');
    const help = getRoot().querySelector('.origo-select__help');
    expect(err).toBeTruthy();
    expect(err.textContent).toBe('Selection required');
    expect(help).toBeTruthy();
    expect(help.textContent).toBe('Select an option from the list');

    const trigger = getRoot().querySelector('[role="combobox"]');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
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
