import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { OrigoOverlayService } from './overlay.service';
import { getDeepActiveElement } from './overlay-ref';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div id="wrapper" style="overflow: hidden; height: 30px;">
      <button #triggerBtn id="test-trigger-btn" type="button">Open Overlay</button>
    </div>

    <ng-template #panelTemplate>
      <div id="test-overlay-content">
        <input id="input-first" type="text" />
        <button id="btn-last" type="button">Submit</button>
      </div>
    </ng-template>
  `,
})
class TestHostComponent {
  readonly vcr = inject(ViewContainerRef);

  @ViewChild('triggerBtn', { static: true })
  triggerBtn!: ElementRef<HTMLButtonElement>;

  @ViewChild('panelTemplate', { static: true })
  panelTemplate!: TemplateRef<unknown>;
}

describe('OrigoOverlayService', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let service: OrigoOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, TestHostComponent],
      providers: [OrigoOverlayService],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    service = TestBed.inject(OrigoOverlayService);
    fixture.detectChanges();
  });

  afterEach(() => {
    const containers = document.querySelectorAll('.cdk-overlay-container');
    containers.forEach(c => c.remove());
  });

  it('should be created and indicate browser platform in test environment', () => {
    expect(service).toBeTruthy();
    expect(service.isBrowser).toBe(true);
  });

  it('should create a connected overlay and escape container overflow:hidden', () => {
    const overlayRef = service.create({
      position: {
        type: 'connected',
        target: hostComponent.triggerBtn,
        originX: 'start',
        originY: 'bottom',
      },
      hasBackdrop: false,
      viewContainerRef: hostComponent.vcr,
    });

    overlayRef.open(hostComponent.panelTemplate);
    expect(overlayRef.isOpen).toBe(true);

    const overlayPane = document.querySelector('.origo-overlay-pane');
    expect(overlayPane).toBeTruthy();
    expect(overlayPane?.classList.contains('origo-overlay-pane--connected')).toBe(true);

    // Verify overlay escapes #wrapper
    const wrapper = fixture.nativeElement.querySelector('#wrapper');
    expect(wrapper.contains(overlayPane)).toBe(false);
    expect(document.body.contains(overlayPane)).toBe(true);

    overlayRef.dispose();
    expect(overlayRef.isOpen).toBe(false);
  });

  it('should create a global centered overlay with modal classes', () => {
    const overlayRef = service.create({
      position: {
        type: 'global',
        position: 'center',
        width: '400px',
      },
      hasBackdrop: true,
      themeScope: 'theme-dark',
      viewContainerRef: hostComponent.vcr,
    });

    overlayRef.open(hostComponent.panelTemplate);
    expect(overlayRef.isOpen).toBe(true);

    const overlayPane = document.querySelector('.origo-overlay-pane');
    expect(overlayPane).toBeTruthy();
    expect(overlayPane?.classList.contains('origo-overlay-pane--modal')).toBe(true);
    expect(overlayPane?.classList.contains('theme-dark')).toBe(true);

    const backdrop = document.querySelector('.origo-overlay-backdrop');
    expect(backdrop).toBeTruthy();

    overlayRef.dispose();
  });

  it('should close overlay on outside click without dismissing when clicking inside trigger or panel', () => {
    const overlayRef = service.create({
      position: {
        type: 'connected',
        target: hostComponent.triggerBtn,
      },
      closeOnOutsideClick: true,
      viewContainerRef: hostComponent.vcr,
    });

    overlayRef.open(hostComponent.panelTemplate);
    expect(overlayRef.isOpen).toBe(true);

    // Click inside trigger
    const triggerEl = hostComponent.triggerBtn.nativeElement;
    const triggerClick = new MouseEvent('click', { bubbles: true, composed: true });
    triggerEl.dispatchEvent(triggerClick);
    expect(overlayRef.isOpen).toBe(true);

    // Click inside overlay panel
    const inputEl = document.querySelector('#input-first') as HTMLElement;
    const inputClick = new MouseEvent('click', { bubbles: true, composed: true });
    inputEl.dispatchEvent(inputClick);
    expect(overlayRef.isOpen).toBe(true);

    // Click outside on document body
    const outsideClick = new MouseEvent('click', { bubbles: true, composed: true });
    document.body.dispatchEvent(outsideClick);
    expect(overlayRef.isOpen).toBe(false);

    overlayRef.dispose();
  });

  it('should trap focus within overlay and restore focus to trigger on Escape', () => {
    const triggerEl = hostComponent.triggerBtn.nativeElement;
    triggerEl.focus();

    const overlayRef = service.create({
      position: {
        type: 'connected',
        target: hostComponent.triggerBtn,
      },
      closeOnEscape: true,
      trapFocus: true,
      viewContainerRef: hostComponent.vcr,
    });

    overlayRef.open(hostComponent.panelTemplate);

    const inputFirst = document.querySelector('#input-first') as HTMLInputElement;
    const btnLast = document.querySelector('#btn-last') as HTMLButtonElement;

    // Simulate Tab from last element
    btnLast.focus();
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(inputFirst);

    // Simulate Escape key
    const escEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(escEvent);

    expect(overlayRef.isOpen).toBe(false);
    expect(document.activeElement).toBe(triggerEl);

    overlayRef.dispose();
  });

  it('should safely execute as no-op when in SSR server platform', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [OrigoOverlayService, { provide: PLATFORM_ID, useValue: 'server' }],
    });

    const ssrService = TestBed.inject(OrigoOverlayService);
    expect(ssrService.isBrowser).toBe(false);

    const noopRef = ssrService.create({
      position: { type: 'global', position: 'center' },
    });

    expect(noopRef.isOpen).toBe(false);
    expect(() => {
      noopRef.open();
      noopRef.updatePosition();
      noopRef.close();
      noopRef.dispose();
    }).not.toThrow();
  });

  it('should pierce Shadow DOM with getDeepActiveElement()', () => {
    const hostEl = document.createElement('div');
    const shadow = hostEl.attachShadow({ mode: 'open' });
    const innerBtn = document.createElement('button');
    shadow.appendChild(innerBtn);
    document.body.appendChild(hostEl);

    innerBtn.focus();
    const deepActive = getDeepActiveElement(document);
    expect(deepActive).toBe(innerBtn);

    hostEl.remove();
  });
});
