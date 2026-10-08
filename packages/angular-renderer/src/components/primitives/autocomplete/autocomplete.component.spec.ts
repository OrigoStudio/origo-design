import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutocompleteComponent } from './autocomplete.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AutocompleteComponent', () => {
  let component: AutocompleteComponent;
  let fixture: ComponentFixture<AutocompleteComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [AutocompleteComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
  });

  const getRoot = () => fixture.nativeElement.shadowRoot ?? fixture.nativeElement;

  it('should instantiate from a pure JSON contract and render autocomplete input', () => {
    fixture.componentRef.setInput('contract', {
      id: 'auto-1',
      type: 'Autocomplete',
      props: {
        suggestions: ['Apple', 'Apricot', 'Avocado'],
        value: 'Apple',
        placeholder: 'Search fruit',
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.value()).toBe('Apple');

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;
    expect(inputEl).toBeTruthy();
    expect(inputEl.value).toBe('Apple');
    expect(inputEl.getAttribute('role')).toBe('combobox');
    expect(inputEl.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('should filter suggestions and open dropdown upon typing after debounce delay', () => {
    jest.useFakeTimers();
    try {
      fixture.componentRef.setInput('contract', {
        id: 'auto-filter',
        type: 'Autocomplete',
        props: {
          suggestions: ['Canada', 'Cameroon', 'Denmark'],
          delay: 150,
          minQueryLength: 2,
        },
      });
      fixture.detectChanges();

      const inputEl = getRoot().querySelector('input') as HTMLInputElement;
      inputEl.value = 'Cam';
      inputEl.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Before delay, dropdown not open
      expect(component.isOpen()).toBe(false);

      jest.advanceTimersByTime(150);
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
      expect(component.filteredSuggestions().length).toBe(1);
      expect(component.filteredSuggestions()[0].label).toBe('Cameroon');
    } finally {
      jest.useRealTimers();
    }
  });

  it('should select suggestion on click and dispatch updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'auto-select',
      type: 'Autocomplete',
      props: {
        suggestions: [
          { label: 'United States', value: 'US' },
          { label: 'United Kingdom', value: 'UK' },
        ],
      },
    });
    fixture.detectChanges();

    component.selectSuggestion({ label: 'United Kingdom', value: 'UK', disabled: false });
    fixture.detectChanges();

    expect(component.value()).toBe('UK');
    expect(component.inputValue()).toBe('United Kingdom');
    expect(component.isOpen()).toBe(false);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('auto-select', 'value', 'UK');
  });

  it('should sanitize clipboard paste event to plain text', () => {
    fixture.componentRef.setInput('contract', {
      id: 'auto-paste',
      type: 'Autocomplete',
      props: {
        suggestions: ['Alpha', 'Beta'],
      },
    });
    fixture.detectChanges();

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;
    const pasteEvent = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
      clipboardData: {
        getData: (format: string) =>
          format === 'text/plain' ? '<script>alert(1)</script>' : '<b>bold</b>',
      },
    }) as unknown as ClipboardEvent;

    inputEl.dispatchEvent(pasteEvent);
    fixture.detectChanges();

    expect(inputEl.value).toBe('<script>alert(1)</script>');
    expect(component.inputValue()).toBe('<script>alert(1)</script>');
  });

  it('should enforce forceSelection on blur', () => {
    fixture.componentRef.setInput('contract', {
      id: 'auto-force',
      type: 'Autocomplete',
      props: {
        suggestions: ['Apple', 'Banana'],
        value: 'Apple',
        forceSelection: true,
      },
    });
    fixture.detectChanges();

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;
    inputEl.value = 'Invalid Fruit';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // User blurs input
    inputEl.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    // Reverted to Apple
    expect(component.inputValue()).toBe('Apple');
    expect(component.value()).toBe('Apple');
  });

  it('should clear selection via clearable button', () => {
    fixture.componentRef.setInput('contract', {
      id: 'auto-clear',
      type: 'Autocomplete',
      props: {
        suggestions: ['Option 1'],
        value: 'Option 1',
        clearable: true,
      },
    });
    fixture.detectChanges();

    const clearBtn = getRoot().querySelector('.origo-autocomplete__clear');
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    fixture.detectChanges();

    expect(component.value()).toBe('');
    expect(component.inputValue()).toBe('');
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('auto-clear', 'value', '');
  });

  it('should navigate suggestions via keyboard', () => {
    fixture.componentRef.setInput('contract', {
      id: 'auto-kbd',
      type: 'Autocomplete',
      props: {
        suggestions: ['One', 'Two', 'Three'],
      },
    });
    fixture.detectChanges();

    component.isOpen.set(true);
    component.query.set('O');
    fixture.detectChanges();

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;

    // ArrowDown navigates
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.activeIndex()).toBe(0);

    // Enter selects active suggestion
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(component.value()).toBe('One');
    expect(component.isOpen()).toBe(false);
  });

  it('should support RTL layouts by avoiding physical CSS properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-auto', type: 'Autocomplete', props: {} });
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
