import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressBarComponent, ProgressBarProps } from './progress-bar.component';
import { InteractionContract } from '@origostudio/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let experienceAdapter: WebExperienceAdapterService;

  function createContract(
    props: Partial<ProgressBarProps> = {},
    id = 'progress-1'
  ): InteractionContract<ProgressBarProps> {
    return {
      id,
      type: 'ProgressBar',
      props,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create and render determinate progress with default properties', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 50 }));
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const shadowRoot = fixture.nativeElement.shadowRoot;
    expect(shadowRoot).toBeTruthy();

    const host = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('progressbar');
    expect(host.getAttribute('aria-valuenow')).toBe('50');
    expect(host.getAttribute('aria-valuemin')).toBe('0');
    expect(host.getAttribute('aria-valuemax')).toBe('100');

    expect(component.percentage()).toBe(50);
    const fill = shadowRoot.querySelector('.origo-progress-bar__fill') as HTMLElement;
    expect(fill).toBeTruthy();
    expect(fill.style.inlineSize).toBe('50%');
  });

  it('should safely fallback to safeMax 100 when max is 0 or negative', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 40, max: 0 }));
    fixture.detectChanges();

    expect(component.safeMax()).toBe(100);
    expect(component.percentage()).toBe(40);
  });

  it('should clamp value within 0 and safeMax', () => {
    fixture.componentRef.setInput('contract', createContract({ value: -10, max: 100 }));
    fixture.detectChanges();
    expect(component.clampedValue()).toBe(0);

    fixture.componentRef.setInput('contract', createContract({ value: 150, max: 100 }));
    fixture.detectChanges();
    expect(component.clampedValue()).toBe(100);
  });

  it('should support indeterminate mode omitting aria-valuenow and hiding numeric text', () => {
    fixture.componentRef.setInput('contract', createContract({ mode: 'indeterminate' }));
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('progressbar');
    expect(host.getAttribute('aria-valuenow')).toBeNull();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const valueText = shadowRoot.querySelector('.origo-progress-bar__value');
    expect(valueText).toBeNull();

    const fill = shadowRoot.querySelector('.origo-progress-bar__fill');
    expect(fill.classList.contains('origo-progress-bar__fill--indeterminate')).toBe(true);
  });

  it('should display label and formatted percentage when showValue is true', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 75, label: 'Uploading file', showValue: true })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const labelEl = shadowRoot.querySelector('.origo-progress-bar__label');
    expect(labelEl?.textContent?.trim()).toBe('Uploading file');

    const valueEl = shadowRoot.querySelector('.origo-progress-bar__value');
    expect(valueEl?.textContent?.trim()).toBe('75%');
  });

  it('should emit complete and dispatch capability once when crossing completion boundary, guarded against mount re-emission', () => {
    // Initial mount at 100 should NOT emit complete
    const completeSpy = jest.fn();
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    component.complete.subscribe(completeSpy);

    fixture.componentRef.setInput('contract', createContract({ value: 100, max: 100 }));
    fixture.detectChanges();

    expect(completeSpy).not.toHaveBeenCalled();

    // Reset to 80
    fixture.componentRef.setInput('contract', createContract({ value: 80, max: 100 }));
    fixture.detectChanges();
    expect(completeSpy).not.toHaveBeenCalled();

    // Now transition from 80 to 100 -> should fire once
    fixture.componentRef.setInput('contract', createContract({ value: 100, max: 100 }));
    fixture.detectChanges();
    expect(completeSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith('progress-1', 'complete', { value: 100, max: 100 });

    // Subsequent change at 100 should not re-trigger
    fixture.componentRef.setInput('contract', createContract({ value: 100, max: 100 }));
    fixture.detectChanges();
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });

  it('should support custom severity classes', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 30, severity: 'success' }));
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.classList.contains('origo-progress-bar--severity-success')).toBe(true);
  });

  it('should format value with custom units properly without mathematical corruption', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 50, max: 200, unit: 'MB', showValue: true })
    );
    fixture.detectChanges();

    expect(component.formattedValue()).toBe('50MB');
    expect(component.percentage()).toBe(25);
  });

  it('should omit aria-valuemin, aria-valuenow, and aria-valuemax in indeterminate mode', () => {
    fixture.componentRef.setInput('contract', createContract({ mode: 'indeterminate' }));
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('progressbar');
    expect(host.getAttribute('aria-valuenow')).toBeNull();
    expect(host.getAttribute('aria-valuemin')).toBeNull();
    expect(host.getAttribute('aria-valuemax')).toBeNull();
  });

  it('should support RTL mirroring direction on host', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 40, max: 100 }));
    fixture.nativeElement.setAttribute('dir', 'rtl');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('dir')).toBe('rtl');
    const shadowRoot = fixture.nativeElement.shadowRoot;
    const fillEl = shadowRoot.querySelector('.origo-progress-bar__fill') as HTMLElement;
    expect(fillEl).toBeTruthy();
    expect(fillEl.style.inlineSize).toBe('40%');
  });
});
