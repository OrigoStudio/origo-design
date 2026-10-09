import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DividerComponent } from './divider.component';

describe('DividerComponent', () => {
  let component: DividerComponent;
  let fixture: ComponentFixture<DividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DividerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contract', { id: 'test', type: 'Divider', props: {} });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have separator role', () => {
    expect(fixture.nativeElement.getAttribute('role')).toBe('separator');
  });

  it('should apply orientation and variant from props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test',
      type: 'Divider',
      props: {
        orientation: 'vertical',
        variant: 'dashed',
        thickness: '2px',
        content: 'OR',
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('aria-orientation')).toBe('vertical');
    expect(fixture.nativeElement.classList.contains('origo-divider--vertical')).toBe(true);

    const inner = fixture.nativeElement.querySelector('.origo-divider-inner') as HTMLElement;
    expect(inner.style.getPropertyValue('--origo-divider-variant')).toBe('dashed');
    expect(inner.style.getPropertyValue('--origo-divider-thickness')).toBe('2px');

    const content = fixture.nativeElement.querySelector('.origo-divider-content');
    expect(content).toBeTruthy();
    expect(content.textContent.trim()).toBe('OR');
  });
});
