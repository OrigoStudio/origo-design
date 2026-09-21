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

  it('should render correctly with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-1',
      type: 'Select',
      props: {
        options: [{ value: '1', label: 'Option 1' }],
        value: '1',
        placeholder: 'Select...',
      },
    });
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.shadowRoot!.querySelector('select');
    expect(selectEl).toBeTruthy();
    expect(selectEl!.id).toBe('select-1');

    const options = selectEl!.querySelectorAll('option');
    expect(options.length).toBe(2); // placeholder + 1 option
    expect(options[0].textContent).toBe('Select...');
    expect(options[1].value).toBe('1');
    expect(options[1].textContent).toBe('Option 1');
  });

  it('should handle null props gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-2',
      type: 'Select',
      props: null,
    });
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.shadowRoot!.querySelector('select');
    expect(selectEl).toBeTruthy();
  });

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-3',
      type: 'Select',
      props: { disabled: true },
    });
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.shadowRoot!.querySelector('select');
    expect(selectEl!.disabled).toBe(true);
  });

  it('should bind ARIA attributes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-4',
      type: 'Select',
      props: { 'aria-label': 'My Select', 'aria-describedby': 'desc-1' },
    });
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.shadowRoot!.querySelector('select');
    expect(selectEl!.getAttribute('aria-label')).toBe('My Select');
    expect(selectEl!.getAttribute('aria-describedby')).toBe('desc-1');
  });

  it('should call experienceAdapter.updateState on change', () => {
    fixture.componentRef.setInput('contract', {
      id: 'select-5',
      type: 'Select',
      props: { options: [{ value: 'new-val', label: 'New' }] },
    });
    fixture.detectChanges();

    const selectEl = fixture.nativeElement.shadowRoot!.querySelector('select');
    selectEl!.value = 'new-val';
    selectEl!.dispatchEvent(new Event('change'));

    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('select-5', 'value', 'new-val');
  });
});
