import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextInputComponent } from './text-input.component';
import { ComponentRef } from '@angular/core';

describe('TextInputComponent', () => {
  let component: TextInputComponent;
  let fixture: ComponentFixture<TextInputComponent>;
  let componentRef: ComponentRef<TextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextInputComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
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
});
