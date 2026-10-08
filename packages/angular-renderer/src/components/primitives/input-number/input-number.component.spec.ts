/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputNumberComponent } from './input-number.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('InputNumberComponent', () => {
  let component: InputNumberComponent;
  let fixture: ComponentFixture<InputNumberComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [InputNumberComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNumberComponent);
    component = fixture.componentInstance;
  });

  it('should render correctly with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'input-num-1',
      type: 'InputNumber',
      props: {
        value: 42,
        placeholder: 'Enter a number',
        disabled: true,
        readonly: true,
        required: true,
        min: 0,
        max: 100,
        step: 5,
      },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl!.id).toBe('input-num-1');
    expect(inputEl!.value).toBe('42');
    expect(inputEl!.getAttribute('placeholder')).toBe('Enter a number');
    expect(inputEl!.getAttribute('min')).toBe('0');
    expect(inputEl!.getAttribute('max')).toBe('100');
    expect(inputEl!.getAttribute('step')).toBe('5');
    expect(inputEl!.disabled).toBe(true);
    expect(inputEl!.readOnly).toBe(true);
    expect(inputEl!.required).toBe(true);
  });

  it('should handle null props gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'input-num-2',
      type: 'InputNumber',
      props: null,
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl!.value).toBe('');
  });

  it('should bind ARIA attributes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'input-num-3',
      type: 'InputNumber',
      props: { 'aria-label': 'My Number', 'aria-describedby': 'desc-1', invalid: true },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl!.getAttribute('aria-label')).toBe('My Number');
    expect(inputEl!.getAttribute('aria-describedby')).toBe('desc-1');
    expect(inputEl!.getAttribute('aria-invalid')).toBe('true');
  });

  it('should dispatch state update on valid input', () => {
    fixture.componentRef.setInput('contract', {
      id: 'input-num-4',
      type: 'InputNumber',
      props: { value: 10 },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    inputEl!.value = '25';
    inputEl!.dispatchEvent(new Event('input'));

    expect(component.value()).toBe(25);
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('input-num-4', 'value', 25);
  });

  it('should ignore invalid number inputs', () => {
    fixture.componentRef.setInput('contract', {
      id: 'input-num-5',
      type: 'InputNumber',
      props: { value: 10 },
    });
    fixture.detectChanges();

    // Mock an event where the browser might somehow provide a non-number string,
    // or simulate validity.badInput if we check it.
    component.onInput({
      target: { value: 'not-a-number' } as unknown as HTMLInputElement,
    } as unknown as Event);

    expect(component.value()).toBe(10); // remains unchanged
    expect(mockExperienceAdapter.updateState).not.toHaveBeenCalled();
  });

  it('should apply variant and fluid classes to host', () => {
    fixture.componentRef.setInput('contract', {
      id: 'input-num-6',
      type: 'InputNumber',
      props: { variant: 'filled', fluid: true },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('origo-input-number--filled')).toBe(true);
    expect(fixture.nativeElement.classList.contains('origo-input-number--fluid')).toBe(true);
  });

  it('should render errorText and helpText', () => {
    fixture.componentRef.setInput('contract', {
      id: 'input-num-7',
      type: 'InputNumber',
      props: { errorText: 'Error', helpText: 'Help' },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const errorEl = root.querySelector('.origo-input-number__error');
    const helpEl = root.querySelector('.origo-input-number__help');

    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent?.trim()).toBe('Error');
    expect(helpEl).toBeTruthy();
    expect(helpEl?.textContent?.trim()).toBe('Help');
  });
});
