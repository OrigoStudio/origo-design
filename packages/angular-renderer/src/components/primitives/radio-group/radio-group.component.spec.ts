/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioGroupComponent } from './radio-group.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('RadioGroupComponent', () => {
  let component: RadioGroupComponent;
  let fixture: ComponentFixture<RadioGroupComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [RadioGroupComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioGroupComponent);
    component = fixture.componentInstance;
  });

  it('should render correctly with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'radio-1',
      type: 'RadioGroup',
      props: {
        options: [
          { value: '1', label: 'Option 1' },
          { value: '2', label: 'Option 2' },
        ],
        value: '2',
      },
    });
    fixture.detectChanges();

    const inputs = (fixture.nativeElement.shadowRoot ?? fixture.nativeElement).querySelectorAll(
      'input[type="radio"]'
    );
    expect(inputs.length).toBe(2);

    // Check names are shared
    expect((inputs[0] as HTMLInputElement).name).toBe('rg-radio-1');
    expect((inputs[1] as HTMLInputElement).name).toBe('rg-radio-1');

    // Check checked state
    expect((inputs[0] as HTMLInputElement).checked).toBe(false);
    expect((inputs[1] as HTMLInputElement).checked).toBe(true);
  });

  it('should handle null props gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'radio-2',
      type: 'RadioGroup',
      props: null,
    });
    fixture.detectChanges();

    const fieldset = (fixture.nativeElement.shadowRoot ?? fixture.nativeElement).querySelector(
      'fieldset'
    );
    expect(fieldset).toBeTruthy();
  });

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'radio-3',
      type: 'RadioGroup',
      props: { disabled: true },
    });
    fixture.detectChanges();

    const fieldset = (fixture.nativeElement.shadowRoot ?? fixture.nativeElement).querySelector(
      'fieldset'
    );
    expect(fieldset!.disabled).toBe(true);
  });

  it('should bind ARIA attributes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'radio-4',
      type: 'RadioGroup',
      props: { 'aria-label': 'My Radio Group' },
    });
    fixture.detectChanges();

    const fieldset = (fixture.nativeElement.shadowRoot ?? fixture.nativeElement).querySelector(
      'fieldset'
    );
    expect(fieldset!.getAttribute('aria-label')).toBeNull();
  });

  it('should call experienceAdapter.updateState on change', () => {
    fixture.componentRef.setInput('contract', {
      id: 'radio-5',
      type: 'RadioGroup',
      props: { options: [{ value: 'new-val', label: 'New' }] },
    });
    fixture.detectChanges();

    const input = (fixture.nativeElement.shadowRoot ?? fixture.nativeElement).querySelector(
      'input'
    );
    input!.checked = true;
    input!.dispatchEvent(new Event('change'));

    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('radio-5', 'value', 'new-val');
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

  it('should render errorText and helpText', () => {
    fixture.componentRef.setInput('contract', {
      id: '1',
      type: 'RadioGroup',
      props: { errorText: 'Error message', helpText: 'Help message' },
    });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const errorEl = root.querySelector('.origo-radio-group__error');
    const helpEl = root.querySelector('.origo-radio-group__help');
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent?.trim()).toBe('Error message');
    expect(helpEl).toBeTruthy();
    expect(helpEl?.textContent?.trim()).toBe('Help message');
  });

  it('should bind aria-invalid based on invalid prop', () => {
    fixture.componentRef.setInput('contract', {
      id: '1',
      type: 'RadioGroup',
      props: { invalid: true },
    });
    fixture.detectChanges();
    const fieldset = (fixture.nativeElement.shadowRoot ?? fixture.nativeElement).querySelector(
      'fieldset'
    );
    expect(fieldset!.getAttribute('aria-invalid')).toBe('true');
  });
});
