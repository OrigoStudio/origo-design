import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BadgeComponent, BadgeProps } from './badge.component';
import { InteractionContract } from '@origostudio/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

@Component({
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <origo-badge [contract]="contract">
      <button id="target-button">Notifications</button>
    </origo-badge>
  `,
})
class TestBadgeHostComponent {
  contract: InteractionContract<BadgeProps> = {
    id: 'badge-wrapped',
    type: 'Badge',
    props: { value: 5 },
  };
}

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;
  let experienceAdapter: WebExperienceAdapterService;

  function createContract(
    props: Partial<BadgeProps> = {},
    id = 'badge-1'
  ): InteractionContract<BadgeProps> {
    return {
      id,
      type: 'Badge',
      props,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent, TestBadgeHostComponent],
      providers: [WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create and render standalone badge with default properties', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 'NEW' }));
    fixture.detectChanges();

    expect(component).toBeTruthy();
    const shadowRoot = fixture.nativeElement.shadowRoot;
    expect(shadowRoot).toBeTruthy();

    const badgeEl = shadowRoot.querySelector('.origo-badge');
    expect(badgeEl).toBeTruthy();
    expect(badgeEl.textContent?.trim()).toBe('NEW');
    expect(component.hasContent()).toBe(false);

    const wrapper = shadowRoot.querySelector('.origo-badge-wrapper');
    expect(wrapper.classList.contains('origo-badge-wrapper--overlay')).toBe(false);
  });

  it('should format value when exceeding max numeric threshold (99+)', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 120, max: 99 }));
    fixture.detectChanges();

    expect(component.displayValue()).toBe('99+');
    const shadowRoot = fixture.nativeElement.shadowRoot;
    const badgeEl = shadowRoot.querySelector('.origo-badge');
    expect(badgeEl.textContent?.trim()).toBe('99+');
  });

  it('should render dot-only badge when dot is true or value is empty', () => {
    fixture.componentRef.setInput('contract', createContract({ dot: true }));
    fixture.detectChanges();

    expect(component.isDot()).toBe(true);
    const shadowRoot = fixture.nativeElement.shadowRoot;
    const badgeEl = shadowRoot.querySelector('.origo-badge');
    expect(badgeEl.classList.contains('origo-badge--dot')).toBe(true);
    expect(badgeEl.textContent?.trim()).toBe('');
    expect(badgeEl.getAttribute('aria-label')).toBe('Status indicator');
  });

  it('should support severity variants and shapes (circle, rounded, square)', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ value: 3, severity: 'error', shape: 'circle', size: 'small' })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const badgeEl = shadowRoot.querySelector('.origo-badge');
    expect(badgeEl.classList.contains('origo-badge--severity-error')).toBe(true);
    expect(badgeEl.classList.contains('origo-badge--shape-circle')).toBe(true);
    expect(badgeEl.classList.contains('origo-badge--size-small')).toBe(true);
  });

  it('should emit click and dispatch capability when interactive is true', () => {
    const clickSpy = jest.fn();
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    component.click.subscribe(clickSpy);

    fixture.componentRef.setInput('contract', createContract({ value: 5, interactive: true }));
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const badgeEl = shadowRoot.querySelector('.origo-badge') as HTMLElement;
    expect(badgeEl.getAttribute('role')).toBe('button');
    expect(badgeEl.getAttribute('tabindex')).toBe('0');

    badgeEl.click();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith('badge-1', 'click', expect.any(Object));
  });

  it('should position as overlay when wrapping projected content', () => {
    const hostFixture = TestBed.createComponent(TestBadgeHostComponent);
    hostFixture.detectChanges();

    const badgeDebugEl = hostFixture.debugElement.children[0];
    const badgeComp = badgeDebugEl.componentInstance as BadgeComponent;
    const shadowRoot = badgeDebugEl.nativeElement.shadowRoot;

    expect(badgeComp.hasContent()).toBe(true);
    const wrapper = shadowRoot.querySelector('.origo-badge-wrapper');
    expect(wrapper.classList.contains('origo-badge-wrapper--overlay')).toBe(true);
  });

  it('should trigger click output via Enter/Space with synthetic MouseEvent', () => {
    const clickSpy = jest.fn();
    component.click.subscribe(clickSpy);

    fixture.componentRef.setInput('contract', createContract({ value: 12, interactive: true }));
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const badgeEl = shadowRoot.querySelector('.origo-badge') as HTMLElement;

    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    badgeEl.dispatchEvent(event);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const emittedEvent = clickSpy.mock.calls[0][0];
    expect(emittedEvent instanceof MouseEvent).toBe(true);
  });

  it('should support RTL direction on host and wrapper', () => {
    fixture.componentRef.setInput('contract', createContract({ value: 3 }));
    fixture.nativeElement.setAttribute('dir', 'rtl');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('dir')).toBe('rtl');
    const shadowRoot = fixture.nativeElement.shadowRoot;
    const badgeEl = shadowRoot.querySelector('.origo-badge');
    expect(badgeEl).toBeTruthy();
  });
});
