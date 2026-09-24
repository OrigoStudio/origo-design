import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipComponent } from './chip.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [ChipComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipComponent);
    component = fixture.componentInstance;
  });

  it('should render chip with label and unselected by default', () => {
    fixture.componentRef.setInput('contract', {
      id: 'chip-1',
      type: 'Chip',
      props: { label: 'Angular' },
    });
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
    expect(buttonEl).toBeTruthy();
    expect(buttonEl!.getAttribute('aria-pressed')).toBe('false');
    expect(buttonEl!.textContent).toContain('Angular');
  });

  it('should toggle selection on click and dispatch updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'chip-2',
      type: 'Chip',
      props: { selected: false },
    });
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
    buttonEl!.click();

    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith('chip-2', 'selected', true);
  });

  it('should block click when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'chip-3',
      type: 'Chip',
      props: { disabled: true },
    });
    fixture.detectChanges();

    const buttonEl = fixture.nativeElement.shadowRoot!.querySelector('button');
    expect(buttonEl!.disabled).toBe(true);

    component.onClick();
    expect(mockExperienceAdapter.updateState).not.toHaveBeenCalled();
  });

  it('should enforce RTL compliance via logical properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-chip', type: 'Chip', props: {} });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const element = root.querySelector('button') as HTMLElement;
    expect(element).toBeTruthy();
    expect(element.style.paddingLeft).toBeFalsy();
    expect(element.style.paddingRight).toBeFalsy();
  });
});
