import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { ComponentRef } from '@angular/core';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let componentRef: ComponentRef<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('contract', { id: '1', type: 'button', props: {} });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render label and attributes', () => {
    componentRef.setInput('contract', {
      id: '1',
      type: 'button',
      props: { label: 'Click Me', disabled: true, type: 'submit' },
    });
    fixture.detectChanges();

    const buttonElement = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(buttonElement.textContent?.trim()).toBe('Click Me');
    expect(buttonElement.disabled).toBe(true);
    expect(buttonElement.type).toBe('submit');
  });
});
