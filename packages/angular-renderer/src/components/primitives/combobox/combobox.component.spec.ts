import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComboboxComponent } from './combobox.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ComboboxComponent', () => {
  let component: ComboboxComponent;
  let fixture: ComponentFixture<ComboboxComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [ComboboxComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ComboboxComponent);
    component = fixture.componentInstance;
  });

  const getRoot = () => fixture.nativeElement.shadowRoot ?? fixture.nativeElement;

  it('should instantiate from a pure JSON contract and render editable combobox', () => {
    fixture.componentRef.setInput('contract', {
      id: 'combo-1',
      type: 'Combobox',
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
        value: 'Custom Value',
        placeholder: 'Enter or select',
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.value()).toBe('Custom Value');

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;
    expect(inputEl).toBeTruthy();
    expect(inputEl.value).toBe('Custom Value');
    expect(inputEl.getAttribute('role')).toBe('combobox');
    expect(inputEl.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('should allow free text input and dispatch updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'combo-text',
      type: 'Combobox',
      props: {
        options: ['Apple', 'Banana'],
      },
    });
    fixture.detectChanges();

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;
    inputEl.value = 'Cherry';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('Cherry');
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('combo-text', 'value', 'Cherry');
  });

  it('should select option from dropdown and dispatch updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'combo-select',
      type: 'Combobox',
      props: {
        options: ['Red', 'Green', 'Blue'],
      },
    });
    fixture.detectChanges();

    component.selectOption('Green');
    fixture.detectChanges();

    expect(component.value()).toBe('Green');
    expect(component.inputValue()).toBe('Green');
    expect(component.isOpen()).toBe(false);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith(
      'combo-select',
      'value',
      'Green'
    );
  });

  it('should sanitize pasted clipboard content to plain text', () => {
    fixture.componentRef.setInput('contract', {
      id: 'combo-paste',
      type: 'Combobox',
      props: {
        options: ['A', 'B'],
      },
    });
    fixture.detectChanges();

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;
    const pasteEvent = Object.assign(new Event('paste', { bubbles: true, cancelable: true }), {
      clipboardData: {
        getData: (format: string) => (format === 'text/plain' ? 'clean text' : '<div>dirty</div>'),
      },
    }) as unknown as ClipboardEvent;

    inputEl.dispatchEvent(pasteEvent);
    fixture.detectChanges();

    expect(inputEl.value).toBe('clean text');
    expect(component.value()).toBe('clean text');
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith(
      'combo-paste',
      'value',
      'clean text'
    );
  });

  it('should support clearable functionality', () => {
    fixture.componentRef.setInput('contract', {
      id: 'combo-clear',
      type: 'Combobox',
      props: {
        options: ['X', 'Y'],
        value: 'X',
        clearable: true,
      },
    });
    fixture.detectChanges();

    const clearBtn = getRoot().querySelector('.origo-combobox__clear');
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    fixture.detectChanges();

    expect(component.value()).toBe('');
    expect(component.inputValue()).toBe('');
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('combo-clear', 'value', '');
  });

  it('should navigate and select options via keyboard', () => {
    fixture.componentRef.setInput('contract', {
      id: 'combo-kbd',
      type: 'Combobox',
      props: {
        options: ['One', 'Two', 'Three'],
      },
    });
    fixture.detectChanges();

    const inputEl = getRoot().querySelector('input') as HTMLInputElement;

    // ArrowDown opens dropdown and highlights first option
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    expect(component.activeIndex()).toBe(0);

    // Enter selects active option
    inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();
    expect(component.value()).toBe('One');
    expect(component.isOpen()).toBe(false);
  });

  it('should support RTL layouts by avoiding physical CSS properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-combo', type: 'Combobox', props: {} });
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
