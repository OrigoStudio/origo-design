import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { FloatingActionButtonComponent } from './floating-action-button.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('FloatingActionButtonComponent', () => {
  let fixture: ComponentFixture<FloatingActionButtonComponent>;
  let componentRef: ComponentRef<FloatingActionButtonComponent>;
  let experienceAdapter: WebExperienceAdapterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingActionButtonComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();
    fixture = TestBed.createComponent(FloatingActionButtonComponent);
    componentRef = fixture.componentRef;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  it('should instantiate from a pure JSON contract', () => {
    componentRef.setInput('contract', {
      id: 'fab-1',
      type: 'FloatingActionButton',
      props: { icon: 'add', label: 'Add', loading: false, position: 'bottom-right' },
    });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not dispatch when loading is true', () => {
    const spy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    componentRef.setInput('contract', {
      id: 'fab-1',
      type: 'FloatingActionButton',
      props: { loading: true },
    });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    (root.querySelector('button') as HTMLButtonElement).click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should apply classes based on severity and position', () => {
    componentRef.setInput('contract', {
      id: 'fab-1',
      type: 'FloatingActionButton',
      props: { severity: 'success', position: 'bottom-left' },
    });
    fixture.detectChanges();
    const classes = fixture.nativeElement.classList;
    expect(classes.contains('origo-severity-success')).toBe(true);
    expect(classes.contains('origo-position-bottom-left')).toBe(true);
  });
});
