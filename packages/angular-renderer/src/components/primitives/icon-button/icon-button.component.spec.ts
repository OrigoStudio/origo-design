import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { IconButtonComponent } from './icon-button.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('IconButtonComponent', () => {
  let fixture: ComponentFixture<IconButtonComponent>;
  let componentRef: ComponentRef<IconButtonComponent>;
  let experienceAdapter: WebExperienceAdapterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();
    fixture = TestBed.createComponent(IconButtonComponent);
    componentRef = fixture.componentRef;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  it('should instantiate from a pure JSON contract', () => {
    componentRef.setInput('contract', {
      id: 'btn-1',
      type: 'IconButton',
      props: { icon: 'edit', label: 'Edit', loading: false },
    });
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not dispatch when loading is true', () => {
    const spy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    componentRef.setInput('contract', {
      id: 'btn-1',
      type: 'IconButton',
      props: { loading: true },
    });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    (root.querySelector('button') as HTMLButtonElement).click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should dispatch when not loading or disabled', () => {
    const spy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    componentRef.setInput('contract', {
      id: 'btn-1',
      type: 'IconButton',
      props: { loading: false, disabled: false },
    });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    (root.querySelector('button') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledWith('btn-1', 'click');
  });

  it('should apply classes based on rounded, severity, and variant', () => {
    componentRef.setInput('contract', {
      id: 'btn-1',
      type: 'IconButton',
      props: { rounded: true, severity: 'success', variant: 'text' },
    });
    fixture.detectChanges();
    const classes = fixture.nativeElement.classList;
    expect(classes.contains('origo-rounded')).toBe(true);
    expect(classes.contains('origo-severity-success')).toBe(true);
    expect(classes.contains('origo-variant-text')).toBe(true);
  });
});
