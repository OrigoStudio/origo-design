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

  it('should render correctly and apply styles', () => {
    fixture.componentRef.setInput('contract', {
      id: 'hbox-1',
      type: 'HBox',
      props: {
        gap: 10,
        alignment: 'center',
        padding: '16px',
      },
    });
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.style.gap).toBe('10px');
    expect(host.style.alignItems).toBe('center');
    expect(host.style.padding).toBe('16px');
  });

  it('should handle missing props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'hbox-2',
      type: 'HBox',
      props: {},
    });
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.style.gap).toBe('');
    expect(host.style.alignItems).toBe('stretch');
    expect(host.style.padding).toBe('');
  });

  it('should expose ViewContainerRef', () => {
    fixture.componentRef.setInput('contract', { id: 'hbox-3', type: 'HBox', props: {} });
    fixture.detectChanges();

    expect(component.vc()).toBeTruthy();
  });
});
