import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { SpikeOverlayService } from './spike-overlay.service';
import { SpikeShadowTriggerComponent } from './shadow-dom-trigger.component';

@Component({
  standalone: true,
  imports: [CommonModule, SpikeShadowTriggerComponent],
  template: `
    <div id="test-wrapper" style="overflow: hidden; max-height: 40px;">
      <origo-spike-shadow-trigger #spikeHost></origo-spike-shadow-trigger>
    </div>
    <ng-template #overlayTemplate>
      <div id="projected-overlay-panel" class="origo-overlay-pane">
        <input id="overlay-input" type="text" />
        <button id="overlay-btn" type="button">Action</button>
      </div>
    </ng-template>
  `,
})
class TestOverlayHostComponent {
  readonly vcr = inject(ViewContainerRef);

  @ViewChild('spikeHost', { static: true })
  spikeHost!: SpikeShadowTriggerComponent;

  @ViewChild('overlayTemplate', { static: true })
  overlayTemplate!: TemplateRef<unknown>;
}

describe('Spike: Overlay & Shadow DOM Substrate', () => {
  let fixture: ComponentFixture<TestOverlayHostComponent>;
  let hostComponent: TestOverlayHostComponent;
  let overlayService: SpikeOverlayService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, TestOverlayHostComponent],
      providers: [SpikeOverlayService],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOverlayHostComponent);
    hostComponent = fixture.componentInstance;
    overlayService = TestBed.inject(SpikeOverlayService);
    fixture.detectChanges();
  });

  afterEach(() => {
    // Cleanup any detached overlay containers
    const containers = document.querySelectorAll('.cdk-overlay-container');
    containers.forEach(c => c.remove());
  });

  it('should instantiate the Shadow DOM trigger component with shadowRoot', () => {
    const triggerEl = fixture.nativeElement.querySelector('origo-spike-shadow-trigger');
    expect(triggerEl).toBeTruthy();
    expect(triggerEl.shadowRoot).toBeTruthy();

    const buttonInShadow = triggerEl.shadowRoot.querySelector('#spike-trigger-button');
    expect(buttonInShadow).toBeTruthy();
    expect(buttonInShadow.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('should escape parent container overflow:hidden when overlay is created', () => {
    const triggerEl = fixture.nativeElement.querySelector('origo-spike-shadow-trigger');
    const buttonInShadow = triggerEl.shadowRoot.querySelector('#spike-trigger-button');

    const overlayInstance = overlayService.create({
      triggerElement: buttonInShadow,
      panelClass: 'custom-spike-panel',
      themeScope: 'theme-dark',
    });

    overlayInstance.open(hostComponent.overlayTemplate, hostComponent.vcr);

    const overlayPane = document.querySelector('.origo-overlay-pane');
    expect(overlayPane).toBeTruthy();

    // Verify overlay is NOT inside the shadowRoot or clipped wrapper
    expect(triggerEl.shadowRoot.contains(overlayPane)).toBe(false);
    expect(fixture.nativeElement.querySelector('#test-wrapper').contains(overlayPane)).toBe(false);

    // Verify overlay IS attached to document.body CDK container
    expect(document.body.contains(overlayPane)).toBe(true);

    overlayInstance.dispose();
  });

  it('should pierce Shadow DOM with getDeepActiveElement()', () => {
    const triggerEl = fixture.nativeElement.querySelector('origo-spike-shadow-trigger');
    const buttonInShadow = triggerEl.shadowRoot.querySelector(
      '#spike-trigger-button'
    ) as HTMLButtonElement;

    buttonInShadow.focus();
    const deepActive = overlayService.getDeepActiveElement();
    expect(deepActive).toBe(buttonInShadow);
  });
});
