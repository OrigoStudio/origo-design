import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlockUIComponent, BlockUIProps } from './block-ui.component';
import { InteractionContract } from '@origostudio/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';

describe('BlockUIComponent', () => {
  let component: BlockUIComponent;
  let fixture: ComponentFixture<BlockUIComponent>;
  let experienceAdapter: WebExperienceAdapterService;
  let overlayService: OrigoOverlayService;

  function createContract(
    props: Partial<BlockUIProps> = {},
    id = 'block-ui-1'
  ): InteractionContract<BlockUIProps> {
    return {
      id,
      type: 'BlockUI',
      props,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockUIComponent],
      providers: [WebExperienceAdapterService, OrigoOverlayService],
    }).compileComponents();

    fixture = TestBed.createComponent(BlockUIComponent);
    component = fixture.componentInstance;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
    overlayService = TestBed.inject(OrigoOverlayService);
  });

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach(el => el.remove());
  });

  it('should create in unblocked state by default', () => {
    fixture.componentRef.setInput('contract', createContract({ blocked: false }));
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.isBlocked()).toBe(false);

    const host = fixture.nativeElement;
    expect(host.getAttribute('aria-busy')).toBeNull();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const mask = shadowRoot.querySelector('.origo-block-ui__mask');
    expect(mask).toBeNull();
  });

  it('should render local blocking mask with message and spinner when blocked is true', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ blocked: true, message: 'Please wait...', spinner: true })
    );
    fixture.detectChanges();

    expect(component.isBlocked()).toBe(true);

    const host = fixture.nativeElement;
    expect(host.getAttribute('aria-busy')).toBe('true');

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const mask = shadowRoot.querySelector('.origo-block-ui__mask');
    expect(mask).toBeTruthy();

    const content = shadowRoot.querySelector('.origo-block-ui__content');
    expect(content.classList.contains('origo-block-ui__content--blocked')).toBe(true);

    const messageEl = shadowRoot.querySelector('.origo-block-ui__message');
    expect(messageEl?.textContent?.trim()).toBe('Please wait...');

    const spinner = shadowRoot.querySelector('origo-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should recognize loading prop alias for blocked', () => {
    fixture.componentRef.setInput('contract', createContract({ loading: true }));
    fixture.detectChanges();

    expect(component.isBlocked()).toBe(true);
  });

  it('should omit spinner when spinner: false is configured', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ blocked: true, spinner: false, message: 'Saving...' })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const spinner = shadowRoot.querySelector('origo-spinner');
    expect(spinner).toBeNull();

    const messageEl = shadowRoot.querySelector('.origo-block-ui__message');
    expect(messageEl?.textContent?.trim()).toBe('Saving...');
  });

  it('should emit blockedChange and synchronize state on toggle', () => {
    const blockedChangeSpy = jest.fn();
    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    component.blockedChange.subscribe(blockedChangeSpy);

    fixture.componentRef.setInput('contract', createContract({ blocked: false }));
    fixture.detectChanges();

    fixture.componentRef.setInput('contract', createContract({ blocked: true }));
    fixture.detectChanges();

    expect(blockedChangeSpy).toHaveBeenCalledWith(true);
    expect(updateStateSpy).toHaveBeenCalledWith('block-ui-1', 'blocked', true);
    expect(dispatchSpy).toHaveBeenCalledWith('block-ui-1', 'blockedChange', { blocked: true });
  });

  it('should trigger OrigoOverlayService in fullScreen mode with trapFocus', () => {
    const createOverlaySpy = jest.spyOn(overlayService, 'create');

    fixture.componentRef.setInput(
      'contract',
      createContract({ blocked: true, fullScreen: true, message: 'Processing full screen...' })
    );
    fixture.detectChanges();

    expect(component.isFullScreen()).toBe(true);
    expect(createOverlaySpy).toHaveBeenCalledWith(
      expect.objectContaining({
        position: expect.objectContaining({ type: 'global', width: '100vw', height: '100vh' }),
        panelClass: expect.arrayContaining(['origo-overlay-pane--block-ui']),
        trapFocus: true,
      }),
      expect.anything()
    );
  });

  it('should suppress keyboard interactions when locally blocked', () => {
    fixture.componentRef.setInput('contract', createContract({ blocked: true, fullScreen: false }));
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    fixture.nativeElement.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should render fallback sr-only message when spinner is false and message is empty', () => {
    fixture.componentRef.setInput(
      'contract',
      createContract({ blocked: true, spinner: false, message: '' })
    );
    fixture.detectChanges();

    const shadowRoot = fixture.nativeElement.shadowRoot;
    const srOnly = shadowRoot.querySelector('.sr-only');
    expect(srOnly).toBeTruthy();
    expect(srOnly.textContent?.trim()).toBe('Loading...');
  });

  it('should dispose overlay on component destruction', () => {
    const mockDispose = jest.fn();
    jest.spyOn(overlayService, 'create').mockReturnValue({
      open: jest.fn(),
      close: jest.fn(),
      dispose: mockDispose,
    } as any);

    fixture.componentRef.setInput('contract', createContract({ blocked: true, fullScreen: true }));
    fixture.detectChanges();

    fixture.destroy();
    expect(mockDispose).toHaveBeenCalled();
  });

  it('should be safe with undefined or null props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'null-block-ui',
      type: 'BlockUI',
      props: undefined as unknown as BlockUIProps,
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.isBlocked()).toBe(false);
  });
});
