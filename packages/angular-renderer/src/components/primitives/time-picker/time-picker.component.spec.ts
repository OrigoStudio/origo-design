import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimePickerComponent } from './time-picker.component';
import { ComponentRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('TimePickerComponent', () => {
  let component: TimePickerComponent;
  let fixture: ComponentFixture<TimePickerComponent>;
  let componentRef: ComponentRef<TimePickerComponent>;
  let experienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    experienceAdapter = {
      updateState: jest.fn(),
      triggerAction: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [TimePickerComponent],
      providers: [{ provide: WebExperienceAdapterService, useValue: experienceAdapter }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should instantiate correctly from pure JSON InteractionContract', () => {
    componentRef.setInput('contract', {
      id: 'test-time-picker',
      type: 'TimePicker',
      props: { value: '1970-01-01T14:30:00Z', format: '24h' },
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should explicitly suppress virtual keyboard on input', () => {
    componentRef.setInput('contract', {
      id: 'test-time-picker',
      type: 'TimePicker',
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

  it('should handle 12h format selection and output ISO 8601 UTC', () => {
    componentRef.setInput('contract', {
      id: 'test-time-picker',
      type: 'TimePicker',
      props: { format: '12h' },
    });
    fixture.detectChanges();

    component.selectTime(2, 30, 'PM'); // 2:30 PM = 14:30 UTC
    expect(experienceAdapter.updateState).toHaveBeenCalledWith(
      'test-time-picker',
      'value',
      '1970-01-01T14:30:00.000Z'
    );
  });

  it('should have a keyboard-navigable listbox or grid for time selection', () => {
    componentRef.setInput('contract', {
      id: 'test-time-picker',
      type: 'TimePicker',
      props: {},
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;

    const input = root.querySelector('input');
    input.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    const popup = root.querySelector('[role="listbox"]') || root.querySelector('[role="grid"]');
    expect(popup).toBeTruthy();
  });
});
