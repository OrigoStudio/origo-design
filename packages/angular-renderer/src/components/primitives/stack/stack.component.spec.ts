import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StackComponent } from './stack.component';

describe('StackComponent', () => {
  let component: StackComponent;
  let fixture: ComponentFixture<StackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StackComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(StackComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contract', { id: 'test', type: 'Stack', props: {} });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide viewContainerRef as vc', () => {
    expect(component.vc()).toBeDefined();
  });

  it('should apply flex properties from props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test',
      type: 'Stack',
      props: {
        direction: 'row',
        gap: '16px',
        align: 'center',
        justify: 'space-between',
        wrap: true,
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const stackEl = root.querySelector('.origo-stack') as HTMLElement;
    expect(stackEl).toBeTruthy();
    expect(stackEl.style.gap).toBe('16px');
    expect(stackEl.style.alignItems).toBe('center');
    expect(stackEl.style.justifyContent).toBe('space-between');
    expect(stackEl.style.getPropertyValue('--origo-stack-direction')).toBe('row');
    expect(stackEl.style.getPropertyValue('--origo-stack-wrap')).toBe('wrap');
  });
});
