import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { BannerComponent, BannerProps } from './banner.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('BannerComponent', () => {
  let fixture: ComponentFixture<BannerComponent>;
  let component: BannerComponent;
  let experienceAdapter: WebExperienceAdapterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerComponent],
      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerComponent);
    component = fixture.componentInstance;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllMocks();
  });

  it('should render host with data-testid', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-banner-1',
      type: 'Banner',
      props: {
        title: 'System Notice',
        message: 'Scheduled maintenance tonight',
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-banner-1');
  });

  it('should pierce Shadow DOM and render title, message, and icon for info severity', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-banner-info',
      type: 'Banner',
      props: {
        severity: 'info',
        title: 'System Notice',
        message: 'Scheduled maintenance tonight at 10 PM',
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    expect(shadow).toBeTruthy();

    const bannerBox = shadow.querySelector('.origo-banner');
    expect(bannerBox).toBeTruthy();
    expect(bannerBox.classList.contains('origo-banner--info')).toBe(true);
    expect(bannerBox.classList.contains('origo-banner--fluid')).toBe(true);
    expect(bannerBox.getAttribute('role')).toBe('region');
    expect(bannerBox.getAttribute('aria-live')).toBe('polite');

    const title = shadow.querySelector('.origo-banner__title');
    expect(title?.textContent?.trim()).toBe('System Notice');

    const msg = shadow.querySelector('.origo-banner__message');
    expect(msg?.textContent?.trim()).toBe('Scheduled maintenance tonight at 10 PM');
  });

  it('should assign aria-live="assertive" for error and warning severities', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-banner-err',
      type: 'Banner',
      props: {
        severity: 'error',
        title: 'Outage',
        message: 'Service is down',
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    let bannerBox = shadow.querySelector('.origo-banner');
    expect(bannerBox.classList.contains('origo-banner--error')).toBe(true);
    expect(bannerBox.getAttribute('aria-live')).toBe('assertive');

    fixture.componentRef.setInput('contract', {
      id: 'test-banner-warn',
      type: 'Banner',
      props: {
        severity: 'warn',
        title: 'Warning',
        message: 'High latency',
      },
    });
    fixture.detectChanges();

    bannerBox = shadow.querySelector('.origo-banner');
    expect(bannerBox.classList.contains('origo-banner--warning')).toBe(true);
    expect(bannerBox.getAttribute('aria-live')).toBe('assertive');
  });

  it('should apply sticky host class when sticky is true', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-banner-sticky',
      type: 'Banner',
      props: {
        sticky: true,
        message: 'Sticky banner',
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('origo-banner--sticky')).toBe(true);
  });

  it('should support backwards-compatible "text" property for message', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-banner-text',
      type: 'Banner',
      props: {
        text: 'Announcement text via text prop',
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    const msg = shadow.querySelector('.origo-banner__message');
    expect(msg?.textContent?.trim()).toBe('Announcement text via text prop');
  });

  it('should handle dismissal via close button click and update state', () => {
    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
    let emittedClose = false;
    let emittedVisible: boolean | undefined = undefined;

    component.close.subscribe(() => (emittedClose = true));
    component.visibleChange.subscribe(v => (emittedVisible = v));

    fixture.componentRef.setInput('contract', {
      id: 'test-banner-close',
      type: 'Banner',
      props: {
        title: 'Closable Banner',
        message: 'Click close',
        closable: true,
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    const closeBtn = shadow.querySelector('.origo-banner__close-btn') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('aria-label')).toBe('Close banner');

    closeBtn.click();
    fixture.detectChanges();

    expect(updateStateSpy).toHaveBeenCalledWith('test-banner-close', 'visible', false);
    expect(emittedClose).toBe(true);
    expect(emittedVisible).toBe(false);
    expect(shadow.querySelector('.origo-banner')).toBeNull();
    expect(fixture.nativeElement.classList.contains('origo-banner--hidden')).toBe(true);
  });

  it('should dispatch action and capability when action button is clicked', () => {
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    let emittedAction: { action: string; data?: unknown } | undefined = undefined;
    component.action.subscribe(a => (emittedAction = a));

    fixture.componentRef.setInput('contract', {
      id: 'test-banner-act',
      type: 'Banner',
      props: {
        title: 'New Feature',
        message: 'Try our new dashboard',
        actions: [
          { label: 'Learn More', action: 'learn-more' },
          { label: 'Dismiss', action: 'dismiss', variant: 'secondary' },
        ],
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    const buttons = shadow.querySelectorAll('.origo-banner__action-btn');
    expect(buttons.length).toBe(2);

    (buttons[0] as HTMLButtonElement).click();
    expect(dispatchSpy).toHaveBeenCalledWith('test-banner-act', 'learn-more', {
      label: 'Learn More',
      action: 'learn-more',
    });
    expect(emittedAction).toEqual({
      action: 'learn-more',
      data: { label: 'Learn More', action: 'learn-more' },
    });
  });

  it('should auto-dismiss after life ms duration', () => {
    jest.useFakeTimers();
    try {
      const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');

      fixture.componentRef.setInput('contract', {
        id: 'test-banner-life',
        type: 'Banner',
        props: {
          message: 'Auto dismiss banner',
          life: 2500,
        },
      });
      fixture.detectChanges();

      const shadow = fixture.nativeElement.shadowRoot;
      expect(shadow.querySelector('.origo-banner')).toBeTruthy();

      jest.advanceTimersByTime(1500);
      fixture.detectChanges();
      expect(shadow.querySelector('.origo-banner')).toBeTruthy();

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(updateStateSpy).toHaveBeenCalledWith('test-banner-life', 'visible', false);
      expect(shadow.querySelector('.origo-banner')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('should render custom icon when provided', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-banner-icon',
      type: 'Banner',
      props: {
        icon: '📢',
        message: 'Custom icon banner',
      },
    });
    fixture.detectChanges();

    const customIcon = fixture.nativeElement.shadowRoot.querySelector('.origo-banner__custom-icon');
    expect(customIcon?.textContent?.trim()).toBe('📢');
  });

  it('should safely render without errors when props are null or undefined', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-banner-null',
      type: 'Banner',
      props: undefined as unknown as BannerProps,
    });
    expect(() => fixture.detectChanges()).not.toThrow();

    expect(fixture.nativeElement.shadowRoot.querySelector('.origo-banner')).toBeTruthy();
  });

  it('should safely initialize in SSR server platform without timers', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [BannerComponent],
      providers: [
        provideZonelessChangeDetection(),
        WebExperienceAdapterService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const bannerFixture = TestBed.createComponent(BannerComponent);
    bannerFixture.componentRef.setInput('contract', {
      id: 'ssr-banner',
      type: 'Banner',
      props: { message: 'SSR Banner', life: 1000 },
    });

    expect(() => bannerFixture.detectChanges()).not.toThrow();
  });
});
