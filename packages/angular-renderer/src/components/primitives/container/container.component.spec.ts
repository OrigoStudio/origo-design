import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ContainerComponent } from './container.component';

describe('ContainerComponent', () => {
  let component: ContainerComponent;
  let fixture: ComponentFixture<ContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContainerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContainerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('contract', { id: 'test', type: 'Container', props: {} });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide viewContainerRef as vc', () => {
    expect(component.vc()).toBeDefined();
  });

  it('should apply padding and maxWidth from props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test',
      type: 'Container',
      props: {
        padding: '16px',
        maxWidth: '1200px',
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const containerEl = root.querySelector('.origo-container');
    expect(containerEl).toBeTruthy();
    expect(containerEl.style.paddingInline).toBe('16px');
    expect(containerEl.style.paddingBlock).toBe('16px');
    expect(containerEl.style.maxWidth).toBe('1200px');
  });

  it('should apply aria-label if provided', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test',
      type: 'Container',
      props: {
        'aria-label': 'test-label',
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const containerEl = root.querySelector('.origo-container');
    expect(containerEl.getAttribute('aria-label')).toBe('test-label');
  });
});
