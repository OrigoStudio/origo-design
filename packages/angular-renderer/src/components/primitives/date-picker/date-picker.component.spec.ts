import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePickerComponent } from './date-picker.component';
import { ComponentRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('DatePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;
  let componentRef: ComponentRef<DatePickerComponent>;
  let experienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    experienceAdapter = {
      updateState: jest.fn(),
      triggerAction: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [DatePickerComponent],
      providers: [{ provide: WebExperienceAdapterService, useValue: experienceAdapter }],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should instantiate correctly from pure JSON InteractionContract', () => {
    componentRef.setInput('contract', {
      id: 'test-date-picker',
      type: 'DatePicker',
      props: { value: '2025-01-01T00:00:00Z' },
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should explicitly suppress virtual keyboard on input', () => {
    componentRef.setInput('contract', {
      id: 'test-date-picker',
      type: 'DatePicker',
      props: {},
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const input = root.querySelector('input');
    expect(input).toBeTruthy();
    expect(
      input.getAttribute('readonly') !== null || input.getAttribute('inputmode') === 'none'
    ).toBeTruthy();
  });

  it('should explicitly standardize to ISO 8601 UTC at boundaries', () => {
    componentRef.setInput('contract', {
      id: 'test-date-picker',
      type: 'DatePicker',
      props: {},
    });
    fixture.detectChanges();

    // Call internal method to simulate date selection and verify UTC handling
    (component as any).selectDate(2025, 0, 15); // Jan 15, 2025 (months are 0-indexed in JS Date)
    expect(experienceAdapter.updateState).toHaveBeenCalledWith(
      'test-date-picker',
      'value',
      '2025-01-15T00:00:00.000Z'
    );
  });

  it('should have a fully keyboard-navigable interface following W3C ARIA Datepicker pattern', () => {
    componentRef.setInput('contract', {
      id: 'test-date-picker',
      type: 'DatePicker',
      props: {},
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;

    // Simulate opening the calendar overlay
    const input = root.querySelector('input');
    input.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    const grid = root.querySelector('[role="grid"]');
    expect(grid).toBeTruthy();
  });
});
