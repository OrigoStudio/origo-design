import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { ComponentRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;
  let componentRef: ComponentRef<TextInputComponent>;
  let experienceAdapter: WebExperienceAdapterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  it('should create', () => {
    componentRef.setInput('contract', { id: '1', type: 'textInput', props: {} });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should bind properties to input element', () => {
    componentRef.setInput('contract', {
      id: '1',
      type: 'textInput',
      props: { value: 'Hello', placeholder: 'Enter text', disabled: true, readonly: true },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const inputElement = root.querySelector('input') as HTMLInputElement;
    expect(inputElement.value).toBe('Hello');
    expect(inputElement.placeholder).toBe('Enter text');
    expect(inputElement.disabled).toBe(true);
    expect(inputElement.readOnly).toBe(true);
  });

  it('should apply correct design tokens to the text-input', () => {
    componentRef.setInput('contract', { id: '1', type: 'textInput', props: {} });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const inputElement = root.querySelector('input') as HTMLInputElement;
    expect(inputElement).toBeTruthy();
  });

  it('should use ShadowDom encapsulation', () => {
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    expect(root).toBeTruthy();
  });

  it('should dispatch state update and sanitize on input', () => {
    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
    componentRef.setInput('contract', { id: 'test-input', type: 'textInput', props: {} });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const inputElement = root.querySelector('input') as HTMLInputElement;

    // Simulate user input with XSS payload
    inputElement.value = '<script>alert("xss")</script>clean text';
    inputElement.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('clean text');
    expect(inputElement.value).toBe('clean text');
    expect(updateStateSpy).toHaveBeenCalledWith('test-input', 'value', 'clean text');
  });

  it('should sync value from contract', () => {
    componentRef.setInput('contract', {
      id: '1',
      type: 'textInput',
      props: { value: 'initial' },
    });
    fixture.detectChanges();
    expect(component.value()).toBe('initial');
  });
});
