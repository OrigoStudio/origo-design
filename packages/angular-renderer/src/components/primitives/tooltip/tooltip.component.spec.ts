import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    const overlayContainer = document.querySelector('.cdk-overlay-container');
    if (overlayContainer) {
      overlayContainer.innerHTML = '';
    }
  });

  it('should create and render trigger wrapper', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tooltip-1',
      type: 'Tooltip',
      props: {
        content: 'Tooltip text',
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('tooltip-1');
  });

  it('should show tooltip on mouseenter and hide on mouseleave with delays', async () => {
    let showEmitted = false;
    let hideEmitted = false;
    component.show.subscribe(() => (showEmitted = true));
    component.hide.subscribe(() => (hideEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'tooltip-hover',
      type: 'Tooltip',
      props: {
        content: 'Hover text',
        showDelay: 20,
        hideDelay: 20,
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;
    expect(trigger).toBeTruthy();

    // Trigger mouseenter
    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    expect(component.isOpen()).toBe(false);

    // Wait for showDelay
    await new Promise(resolve => setTimeout(resolve, 50));
    fixture.detectChanges();

    expect(showEmitted).toBe(true);
    expect(component.isOpen()).toBe(true);
    const tooltipEl = document.querySelector('.origo-tooltip');
    expect(tooltipEl).toBeTruthy();
    expect(tooltipEl?.textContent?.trim()).toBe('Hover text');

    // Trigger mouseleave
    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    expect(component.isOpen()).toBe(true);

    // Wait for hideDelay
    await new Promise(resolve => setTimeout(resolve, 50));
    fixture.detectChanges();

    expect(hideEmitted).toBe(true);
    expect(component.isOpen()).toBe(false);
  });

  it('should show on focusin and hide on focusout', async () => {
    let showEmitted = false;
    let hideEmitted = false;
    component.show.subscribe(() => (showEmitted = true));
    component.hide.subscribe(() => (hideEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'tooltip-focus',
      type: 'Tooltip',
      props: {
        content: 'Focus text',
        showDelay: 0,
        hideDelay: 0,
        trigger: 'focus',
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;

    trigger.dispatchEvent(new FocusEvent('focusin'));
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(showEmitted).toBe(true);
    expect(component.isOpen()).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusout'));
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(hideEmitted).toBe(true);
    expect(component.isOpen()).toBe(false);
  });

  it('should close immediately on Escape key', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'tooltip-esc',
      type: 'Tooltip',
      props: {
        content: 'Escape text',
        showDelay: 0,
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(component.isOpen()).toBe(false);
  });

  it('should not show when disabled is true', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'tooltip-disabled',
      type: 'Tooltip',
      props: {
        content: 'Disabled text',
        disabled: true,
        showDelay: 0,
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('should synchronize aria-describedby on trigger wrapper', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'tooltip-aria',
      type: 'Tooltip',
      props: {
        content: 'Aria text',
        showDelay: 0,
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const trigger = root.querySelector('.origo-tooltip__trigger-wrapper') as HTMLElement;

    expect(trigger.getAttribute('aria-describedby')).toBeNull();

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await new Promise(resolve => setTimeout(resolve, 10));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-describedby')).toBe(component.tooltipId);

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    await new Promise(resolve => setTimeout(resolve, 170));
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('should implement ContainerComponent', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tooltip-vc',
      type: 'Tooltip',
      props: { content: 'Tooltip VC' },
    });
    fixture.detectChanges();
    expect(component.vc).toBeDefined();
  });

  it('should not crash with null or undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tooltip-null',
      type: 'Tooltip',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
