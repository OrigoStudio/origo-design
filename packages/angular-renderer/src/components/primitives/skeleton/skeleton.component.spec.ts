import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent, SkeletonProps } from './skeleton.component';
import { InteractionContract } from '@origostudio/core';

describe('SkeletonComponent', () => {
  let component: SkeletonComponent;
  let fixture: ComponentFixture<SkeletonComponent>;

  function createContract(
    props: Partial<SkeletonProps> = {},
    id = 'skeleton-1'
  ): InteractionContract<SkeletonProps> {
    return {
      id,
      type: 'Skeleton',
      props,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create and render with default rectangle shape and shimmer animation', () => {
    fixture.componentRef.setInput('contract', createContract());
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const shadowRoot = fixture.nativeElement.shadowRoot;
    expect(shadowRoot).toBeTruthy();

    const host = fixture.nativeElement;
    expect(host.getAttribute('data-testid')).toBe('skeleton-1');
    expect(host.getAttribute('aria-hidden')).toBe('true');

    expect(component.shape()).toBe('rectangle');
    expect(component.computedWidth()).toBe('100%');
    expect(component.computedHeight()).toBe('1rem');
    expect(component.animation()).toBe('shimmer');

    const skeletonEl = shadowRoot.querySelector('.origo-skeleton');
    expect(skeletonEl).toBeTruthy();
    expect(skeletonEl.classList.contains('origo-skeleton--rectangle')).toBe(true);
    expect(skeletonEl.classList.contains('origo-skeleton--animation-shimmer')).toBe(true);
  });

  it('should render circle shape with 50% border radius and 2.5rem default dimension', () => {
    fixture.componentRef.setInput('contract', createContract({ shape: 'circle' }));
    fixture.detectChanges();

    expect(component.shape()).toBe('circle');
    expect(component.computedWidth()).toBe('2.5rem');
    expect(component.computedHeight()).toBe('2.5rem');
    expect(component.computedBorderRadius()).toBe('50%');

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const skeletonEl = shadowRoot.querySelector('.origo-skeleton');
    expect(skeletonEl.classList.contains('origo-skeleton--circle')).toBe(true);
  });

  it('should allow size property to override width and height', () => {
    fixture.componentRef.setInput('contract', createContract({ size: '4rem' }));
    fixture.detectChanges();

    expect(component.computedWidth()).toBe('4rem');
    expect(component.computedHeight()).toBe('4rem');
  });

  it('should allow custom width, height, and borderRadius', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ width: '200px', height: '30px', borderRadius: '8px' })
    );
    fixture.detectChanges();

    expect(component.computedWidth()).toBe('200px');
    expect(component.computedHeight()).toBe('30px');
    expect(component.computedBorderRadius()).toBe('8px');
  });

  it('should support pulse and none animation modes', () => {
    fixture.componentRef.setInput('contract', createContract({ animation: 'pulse' }));
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const skeletonEl = shadowRoot.querySelector('.origo-skeleton');
    expect(skeletonEl.classList.contains('origo-skeleton--animation-pulse')).toBe(true);

    fixture.componentRef.setInput('contract', createContract({ animation: 'none' }));
    fixture.detectChanges();
    expect(skeletonEl.classList.contains('origo-skeleton--animation-none')).toBe(true);
  });

  it('should support aria-label override rendering role status instead of aria-hidden', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ 'aria-label': 'Loading profile card' })
    );
    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-label')).toBe('Loading profile card');
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });

  it('should be safe with undefined or null contract props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'null-skeleton',
      type: 'Skeleton',
      props: undefined as unknown as SkeletonProps,
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.computedWidth()).toBe('100%');
  });
});
