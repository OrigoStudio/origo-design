import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('TextareaComponent', () => {
  let component: TextareaComponent;
  let fixture: ComponentFixture<TextareaComponent>;
  let mockExperienceAdapter: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockExperienceAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockExperienceAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    component = fixture.componentInstance;
  });

  it('should render correctly with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'textarea-1',
      type: 'Textarea',
      props: {
        value: 'Hello',
        placeholder: 'Enter text',
        rows: 5,
        disabled: true,
        readonly: true,
        required: true,
      },
    });
    fixture.detectChanges();

    const textareaEl = fixture.nativeElement.shadowRoot!.querySelector('textarea');
    expect(textareaEl).toBeTruthy();
    expect(textareaEl!.id).toBe('textarea-1');
    expect(textareaEl!.value).toBe('Hello');
    expect(textareaEl!.getAttribute('placeholder')).toBe('Enter text');
    expect(textareaEl!.getAttribute('rows')).toBe('5');
    expect(textareaEl!.disabled).toBe(true);
    expect(textareaEl!.readOnly).toBe(true);
    expect(textareaEl!.required).toBe(true);
  });

  it('should handle null props gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'textarea-2',
      type: 'Textarea',
      props: null,
    });
    fixture.detectChanges();

    const textareaEl = fixture.nativeElement.shadowRoot!.querySelector('textarea');
    expect(textareaEl).toBeTruthy();
    expect(textareaEl!.getAttribute('rows')).toBe('3'); // default
  });

  it('should bind ARIA attributes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'textarea-4',
      type: 'Textarea',
      props: { 'aria-label': 'My Textarea', 'aria-describedby': 'desc-1' },
    });
    fixture.detectChanges();

    const textareaEl = fixture.nativeElement.shadowRoot!.querySelector('textarea');
    expect(textareaEl!.getAttribute('aria-label')).toBe('My Textarea');
    expect(textareaEl!.getAttribute('aria-describedby')).toBe('desc-1');
  });

  it('should dispatch state update and sanitize on input', () => {
    fixture.componentRef.setInput('contract', {
      id: 'textarea-5',
      type: 'Textarea',
      props: { value: '' },
    });
    fixture.detectChanges();

    const textareaEl = fixture.nativeElement.shadowRoot!.querySelector('textarea');
    textareaEl!.value = '<script>alert("xss")</script>clean text';
    textareaEl!.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('clean text');
    expect(textareaEl!.value).toBe('clean text');
    expect(mockExperienceAdapter.updateState).toHaveBeenCalledWith(
      'textarea-5',
      'value',
      'clean text'
    );
  });
});
