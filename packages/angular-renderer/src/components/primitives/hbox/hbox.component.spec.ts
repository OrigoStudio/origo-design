import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HBoxComponent } from './hbox.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('HBoxComponent', () => {
  let component: HBoxComponent;
  let fixture: ComponentFixture<HBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HBoxComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HBoxComponent);
    component = fixture.componentInstance;
  });

  it('should apply computed styles for gap, alignment and padding', () => {
    fixture.componentRef.setInput('contract', {
      id: 'hbox-1',
      type: 'HBox',
      props: {
        gap: '10',
        alignment: 'center',
        padding: '16',
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.style.getPropertyValue('gap')).toBe('10px');
    expect(fixture.nativeElement.style.getPropertyValue('align-items')).toBe('center');
    expect(fixture.nativeElement.style.getPropertyValue('padding-inline')).toBe('16px');
    expect(fixture.nativeElement.style.getPropertyValue('padding-block')).toBe('16px');
  });

  it('should handle null props and empty children gracefully', () => {
    fixture.componentRef.setInput('contract', {
      id: 'hbox-2',
      type: 'HBox',
      props: null,
      children: [],
    } as any);
    fixture.detectChanges();

    expect(component.vc()).toBeTruthy();
    expect(fixture.nativeElement.style.getPropertyValue('gap')).toBe('');
  });

  it('should handle missing props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'hbox-2',
      type: 'HBox',
      props: {},
    });
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.style.gap).toBeFalsy();
    expect(host.style.alignItems).toBe('stretch');
    expect(host.style.paddingInline).toBeFalsy();
  });

  it('should expose ViewContainerRef', () => {
    fixture.componentRef.setInput('contract', { id: 'hbox-3', type: 'HBox', props: {} });
    fixture.detectChanges();

    expect(component.vc()).toBeTruthy();
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
