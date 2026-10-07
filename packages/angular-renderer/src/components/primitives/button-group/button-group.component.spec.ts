import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { ButtonGroupComponent } from './button-group.component';

describe('ButtonGroupComponent', () => {
  let fixture: ComponentFixture<ButtonGroupComponent>;
  let componentRef: ComponentRef<ButtonGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonGroupComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ButtonGroupComponent);
    componentRef = fixture.componentRef;
  });

  it('should instantiate from a pure JSON contract', () => {
    componentRef.setInput('contract', {
      id: 'bg-1',
      type: 'ButtonGroup',
      props: { orientation: 'column', attached: true, size: 'large' },
    });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should apply correct classes based on props', () => {
    componentRef.setInput('contract', {
      id: 'bg-1',
      type: 'ButtonGroup',
      props: { orientation: 'column', attached: true, size: 'large' },
    });
    fixture.detectChanges();
    const classes = fixture.nativeElement.classList;
    expect(classes.contains('origo-orientation-column')).toBe(true);
    expect(classes.contains('origo-attached')).toBe(true);
    expect(classes.contains('origo-size-large')).toBe(true);
  });
});
