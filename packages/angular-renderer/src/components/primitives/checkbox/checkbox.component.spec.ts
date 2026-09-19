import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('CheckboxComponent', () => {
  let component: CheckboxComponent;
  let fixture: ComponentFixture<CheckboxComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
  });

  it('should render correctly with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'checkbox-1',
      type: 'Checkbox',
      props: {
        checked: true,
        label: 'Accept Terms',
      },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl!.id).toBe('checkbox-1');
    expect(inputEl!.checked).toBe(true);

    const labelText = fixture.nativeElement.shadowRoot!.querySelector('.label-text');
    expect(labelText!.textContent).toBe('Accept Terms');
  });

  it('should handle null props gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'checkbox-2',
      type: 'Checkbox',
      props: null,
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
  });

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'checkbox-3',
      type: 'Checkbox',
      props: { disabled: true },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl!.disabled).toBe(true);
  });

  it('should bind ARIA attributes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'checkbox-4',
      type: 'Checkbox',
      props: { 'aria-label': 'My Checkbox' },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl!.getAttribute('aria-label')).toBe('My Checkbox');
  });

  it('should call experienceAdapter.updateState on change', () => {
    fixture.componentRef.setInput('contract', {
      id: 'checkbox-5',
      type: 'Checkbox',
      props: { checked: false },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    inputEl!.checked = true;
    inputEl!.dispatchEvent(new Event('change'));

    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('checkbox-5', 'checked', true);
  });
});
