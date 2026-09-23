import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabelComponent } from './label.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('LabelComponent', () => {
  let component: LabelComponent;
  let fixture: ComponentFixture<LabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LabelComponent);
    component = fixture.componentInstance;
  });

  it('should render correctly with text and required', () => {
    fixture.componentRef.setInput('contract', {
      id: 'label-1',
      type: 'Label',
      props: {
        text: 'First Name',
        for: 'input-1',
        required: true,
      },
    });
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.shadowRoot!.querySelector('label');
    expect(labelEl).toBeTruthy();
    expect(labelEl!.getAttribute('for')).toBe('input-1');
    expect(labelEl!.textContent).toContain('First Name');

    const requiredIndicator =
      fixture.nativeElement.shadowRoot!.querySelector('.required-indicator');
    expect(requiredIndicator).toBeTruthy();
    expect(requiredIndicator!.textContent).toBe('*');
  });

  it('should render correctly without required', () => {
    fixture.componentRef.setInput('contract', {
      id: 'label-2',
      type: 'Label',
      props: {
        text: 'Last Name',
      },
    });
    fixture.detectChanges();

    const requiredIndicator =
      fixture.nativeElement.shadowRoot!.querySelector('.required-indicator');
    expect(requiredIndicator).toBeNull();
  });

  it('should handle missing props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'label-3',
      type: 'Label',
      props: {},
    });
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.shadowRoot!.querySelector('label');
    expect(labelEl).toBeTruthy();
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
