import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangePickerComponent } from './date-range-picker.component';
import { ComponentRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('DateRangePickerComponent', () => {
  let component: DateRangePickerComponent;
  let fixture: ComponentFixture<DateRangePickerComponent>;
  let componentRef: ComponentRef<DateRangePickerComponent>;
  let experienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    experienceAdapter = {
      updateState: jest.fn(),
      triggerAction: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [DateRangePickerComponent],
      providers: [{ provide: WebExperienceAdapterService, useValue: experienceAdapter }],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangePickerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should instantiate correctly from pure JSON InteractionContract', () => {
    componentRef.setInput('contract', {
      id: 'test-date-range',
      type: 'DateRangePicker',
      props: { startDate: '2025-01-01T00:00:00Z', endDate: '2025-01-10T00:00:00Z' },
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should explicitly suppress virtual keyboard on inputs', () => {
    componentRef.setInput('contract', {
      id: 'test-date-range',
      type: 'DateRangePicker',
      props: {},
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const inputs = root.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input: Element) => {
      expect(
        input.getAttribute('readonly') !== null || input.getAttribute('inputmode') === 'none'
      ).toBeTruthy();
    });
  });

  it('should explicitly standardize to ISO 8601 UTC at boundaries when selecting a range', () => {
    componentRef.setInput('contract', {
      id: 'test-date-range',
      type: 'DateRangePicker',
      props: {},
    });
    fixture.detectChanges();

    (component as any).selectRange(
      new Date(Date.UTC(2025, 0, 15)),
      new Date(Date.UTC(2025, 0, 20))
    );

    expect(experienceAdapter.updateState).toHaveBeenCalledWith(
      'test-date-range',
      'startDate',
      '2025-01-15T00:00:00.000Z'
    );
    expect(experienceAdapter.updateState).toHaveBeenCalledWith(
      'test-date-range',
      'endDate',
      '2025-01-20T00:00:00.000Z'
    );
  });

  it('should enforce range constraints (start before end)', () => {
    componentRef.setInput('contract', {
      id: 'test-date-range',
      type: 'DateRangePicker',
      props: {},
    });
    fixture.detectChanges();

    // Select end date before start date
    (component as any).selectRange(
      new Date(Date.UTC(2025, 0, 20)),
      new Date(Date.UTC(2025, 0, 15))
    );

    // It should either auto-swap or only set start date. Let's say it auto-swaps.
    expect(experienceAdapter.updateState).toHaveBeenCalledWith(
      'test-date-range',
      'startDate',
      '2025-01-15T00:00:00.000Z'
    );
    expect(experienceAdapter.updateState).toHaveBeenCalledWith(
      'test-date-range',
      'endDate',
      '2025-01-20T00:00:00.000Z'
    );
  });
});
