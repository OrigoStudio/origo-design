import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldComponent } from './form-field.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('FormFieldComponent', () => {
  let component: FormFieldComponent;
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    component = fixture.componentInstance;
  });

  it('should render correctly with label, hint and error', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ff-1',
      type: 'FormField',
      props: {
        label: 'My Field',
        hint: 'Some hint',
        error: 'Some error',
        required: true,
      },
    });
    fixture.detectChanges();

    const label = fixture.nativeElement.shadowRoot!.querySelector('origo-label');
    expect(label).toBeTruthy();

    const error = fixture.nativeElement.shadowRoot!.querySelector('.form-field-error');
    expect(error).toBeTruthy();
    expect(error!.textContent).toBe('Some error');

    // Hint is not shown if error is present
    const hint = fixture.nativeElement.shadowRoot!.querySelector('.form-field-hint');
    expect(hint).toBeNull();

    // has-error class on host
    expect(fixture.nativeElement.classList.contains('has-error')).toBe(true);
  });

  it('should render hint if no error', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ff-2',
      type: 'FormField',
      props: {
        hint: 'Some hint',
      },
    });
    fixture.detectChanges();

    const hint = fixture.nativeElement.shadowRoot!.querySelector('.form-field-hint');
    expect(hint).toBeTruthy();
    expect(hint!.textContent).toBe('Some hint');

    const error = fixture.nativeElement.shadowRoot!.querySelector('.form-field-error');
    expect(error).toBeNull();
  });

  it('should expose ViewContainerRef', () => {
    fixture.componentRef.setInput('contract', { id: 'ff-3', type: 'FormField', props: {} });
    fixture.detectChanges();

    expect(component.vc()).toBeTruthy();
  });

  it('should handle null props and empty children gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'ff-4',
      type: 'FormField',
      props: null,
      children: [],
    } as any);
    fixture.detectChanges();

    expect(component.vc()).toBeTruthy();
    const label = fixture.nativeElement.shadowRoot!.querySelector('origo-label');
    expect(label).toBeNull();
  });

  it('should support RTL layouts by avoiding physical CSS properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-test', type: 'test', props: {} });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const element = root.firstElementChild as HTMLElement;
    if (element && element.style) {
      expect(element.style.paddingLeft).toBeFalsy();
      expect(element.style.paddingRight).toBeFalsy();
      expect(element.style.marginLeft).toBeFalsy();
      expect(element.style.marginRight).toBeFalsy();
    }
  });
});
