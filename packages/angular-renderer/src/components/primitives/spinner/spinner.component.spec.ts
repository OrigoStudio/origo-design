import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { InteractionContract } from '@origostudio/core';
import { SpinnerProps } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  function createContract(
    props: Partial<SpinnerProps> = {},
    id = 'spinner-1'
  ): InteractionContract<SpinnerProps> {
    return {
      id,
      type: 'Spinner',
      props,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create and render with default properties', () => {
    fixture.componentRef.setInput('contract', createContract());
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const shadowRoot = fixture.nativeElement.shadowRoot;
    expect(shadowRoot).toBeTruthy();

    const svg = shadowRoot.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('aria-hidden')).toBe('true');

    const srOnly = shadowRoot.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.textContent?.trim()).toBe('Loading...');

    // Host ARIA
    const hostEl = fixture.nativeElement;
    expect(hostEl.getAttribute('role')).toBe('status');
    expect(hostEl.getAttribute('aria-live')).toBe('polite');
    expect(hostEl.getAttribute('data-testid')).toBe('spinner-1');
  });

  it('should support size variations: small, medium, large, and custom dimensions', () => {
    fixture.componentRef.setInput('contract', createContract({ size: 'small' }));
    fixture.detectChanges();
    expect(component.computedSize()).toBe('1rem');

    fixture.componentRef.setInput('contract', createContract({ size: 'large' }));
    fixture.detectChanges();
    expect(component.computedSize()).toBe('3rem');

    fixture.componentRef.setInput('contract', createContract({ size: '24px' }));
    fixture.detectChanges();
    expect(component.computedSize()).toBe('24px');
  });

  it('should support custom strokeWidth and fill', () => {
    fixture.componentRef.setInput('contract', createContract({ strokeWidth: 6, fill: '#f0f0f0' }));
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const circle = shadowRoot.querySelector('circle');
    expect(circle.getAttribute('stroke-width')).toBe('6');
    expect(circle.getAttribute('fill')).toBe('#f0f0f0');
  });

  it('should support custom label and update screen reader text', () => {
    fixture.componentRef.setInput('contract', createContract({ label: 'Fetching data...' }));
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const srOnly = shadowRoot.querySelector('.sr-only');
    expect(srOnly.textContent?.trim()).toBe('Fetching data...');
  });

  it('should apply color variants (primary, secondary, success, warn, error, contrast)', () => {
    fixture.componentRef.setInput('contract', createContract({ variant: 'success' }));
    fixture.detectChanges();

    expect(component.computedVariantClass()).toBe('origo-spinner--variant-success');
    const host = fixture.nativeElement;
    expect(host.classList.contains('origo-spinner--variant-success')).toBe(true);
  });

  it('should handle fluid layout adaptation', () => {
    fixture.componentRef.setInput('contract', createContract({ fluid: true }));
    fixture.detectChanges();

    expect(component.isFluid()).toBe(true);
    const host = fixture.nativeElement;
    expect(host.classList.contains('origo-spinner--fluid')).toBe(true);
  });

  it('should be safe with empty or null contract props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'null-props-spinner',
      type: 'Spinner',
      props: undefined as unknown as SpinnerProps,
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.computedLabel()).toBe('Loading...');
  });
});
