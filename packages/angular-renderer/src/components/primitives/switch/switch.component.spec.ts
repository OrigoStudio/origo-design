import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwitchComponent } from './switch.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SwitchComponent', () => {
  let component: SwitchComponent;
  let fixture: ComponentFixture<SwitchComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [SwitchComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SwitchComponent);
    component = fixture.componentInstance;
  });

  it('should render switch correctly with contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-1',
      type: 'Switch',
      props: { checked: true, label: 'Airplane Mode' },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl!.getAttribute('role')).toBe('switch');
    expect(inputEl!.checked).toBe(true);

    const labelText = fixture.nativeElement.shadowRoot!.querySelector('.label-text');
    expect(labelText!.textContent).toContain('Airplane Mode');
  });

  it('should handle null props gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-2',
      type: 'Switch',
      props: null,
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl).toBeTruthy();
    expect(inputEl!.checked).toBe(false);
  });

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-3',
      type: 'Switch',
      props: { disabled: true },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    expect(inputEl!.disabled).toBe(true);
  });

  it('should dispatch updateState on toggle', () => {
    fixture.componentRef.setInput('contract', {
      id: 'switch-4',
      type: 'Switch',
      props: { checked: false },
    });
    fixture.detectChanges();

    const inputEl = fixture.nativeElement.shadowRoot!.querySelector('input');
    inputEl!.checked = true;
    inputEl!.dispatchEvent(new Event('change'));

    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('switch-4', 'checked', true);
  });

  it('should enforce RTL compliance via logical properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-switch', type: 'Switch', props: {} });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const element = root.querySelector('label') as HTMLElement;
    expect(element).toBeTruthy();
    const style = window.getComputedStyle(element);
    expect(style.paddingLeft).toBe('');
    expect(style.paddingRight).toBe('');
  });
});
