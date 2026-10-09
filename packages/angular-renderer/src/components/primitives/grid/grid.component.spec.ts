import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contract', { id: 'test', type: 'Grid', props: {} });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide viewContainerRef as vc', () => {
    expect(component.vc()).toBeDefined();
  });

  it('should apply columns from props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test',
      type: 'Grid',
      props: {
        columns: 4,
        gap: '16px',
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const gridEl = root.querySelector('.origo-grid') as HTMLElement;
    expect(gridEl).toBeTruthy();
    expect(gridEl.style.gap).toBe('16px');
    expect(gridEl.style.getPropertyValue('--origo-grid-columns')).toBe('repeat(4, minmax(0, 1fr))');
  });
});
