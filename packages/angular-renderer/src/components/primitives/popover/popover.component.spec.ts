import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PopoverComponent } from './popover.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('PopoverComponent', () => {
  let component: PopoverComponent;
  let fixture: ComponentFixture<PopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverComponent],
      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverComponent);
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
      id: 'popover-1',
      type: 'Popover',
      props: {
        title: 'Popover Title',
        visible: false,
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('popover-1');
  });

  it('should toggle visibility when trigger is clicked', async () => {
    let openEmitted = false;
    let visibleChangedVal: boolean | null = null;
    component.open.subscribe(() => (openEmitted = true));
    component.visibleChange.subscribe(val => (visibleChangedVal = val));

    fixture.componentRef.setInput('contract', {
      id: 'popover-toggle',
      type: 'Popover',
      props: {
        title: 'Toggle Popover',
        visible: false,
      },
    });
    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const trigger = root.querySelector('.origo-popover__trigger-wrapper') as HTMLElement;
    expect(trigger).toBeTruthy();

    trigger.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(openEmitted).toBe(true);
    expect(visibleChangedVal).toBe(true);

    const popoverEl = document.querySelector('.origo-popover');
    expect(popoverEl).toBeTruthy();
    expect(popoverEl?.getAttribute('data-testid')).toBe('popover-toggle');
  });

  it('should display title and close button when configured', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'popover-title-close',
      type: 'Popover',
      props: {
        title: 'Custom Title',
        showClose: true,
        visible: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const popoverEl = document.querySelector('.origo-popover') as HTMLElement;
    expect(popoverEl).toBeTruthy();

    const titleEl = popoverEl.querySelector('.origo-popover__title');
    expect(titleEl?.textContent?.trim()).toBe('Custom Title');

    const closeBtn = popoverEl.querySelector('.origo-popover__close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    let closeEmitted = false;
    component.close.subscribe(() => (closeEmitted = true));
    closeBtn.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closeEmitted).toBe(true);
  });

  it('should close on Escape when closeOnEscape is true', async () => {
    let closeEmitted = false;
    component.close.subscribe(() => (closeEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'popover-esc',
      type: 'Popover',
      props: {
        title: 'Escape Popover',
        visible: true,
        closeOnEscape: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closeEmitted).toBe(true);
  });

  it('should close on outside click when dismissible is true', async () => {
    let closeEmitted = false;
    component.close.subscribe(() => (closeEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'popover-outside',
      type: 'Popover',
      props: {
        title: 'Outside Click Popover',
        visible: true,
        dismissible: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const outsideDiv = document.createElement('div');
    document.body.appendChild(outsideDiv);
    outsideDiv.click();
    document.body.removeChild(outsideDiv);

    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closeEmitted).toBe(true);
  });

  it('should implement ContainerComponent', () => {
    fixture.componentRef.setInput('contract', {
      id: 'popover-vc',
      type: 'Popover',
      props: { title: 'Popover VC', visible: false },
    });
    fixture.detectChanges();
    expect(component.vc).toBeDefined();
  });

  it('should not crash with null or undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'popover-null',
      type: 'Popover',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
