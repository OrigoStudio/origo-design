import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VBoxComponent } from './vbox.component';
import { ComponentRef } from '@angular/core';

describe('VBoxComponent', () => {
  let component: VBoxComponent;
  let fixture: ComponentFixture<VBoxComponent>;
  let componentRef: ComponentRef<VBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VBoxComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    componentRef.setInput('contract', { id: '1', type: 'vbox', props: {} });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should apply padding style correctly', () => {
    componentRef.setInput('contract', { id: '1', type: 'vbox', props: { padding: 16 } });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.style.padding).toBe('16px');
  });

  it('should apply alignment flex-end', () => {
    componentRef.setInput('contract', { id: '1', type: 'vbox', props: { alignment: 'end' } });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.style.alignItems).toBe('flex-end');
  });

  it('should apply string gap correctly', () => {
    componentRef.setInput('contract', { id: '1', type: 'vbox', props: { gap: '1rem' } });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.style.gap).toBe('1rem');
  });
});
