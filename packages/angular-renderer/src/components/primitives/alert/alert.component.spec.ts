import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { AlertComponent, AlertProps } from './alert.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('AlertComponent', () => {
  let fixture: ComponentFixture<AlertComponent>;
  let component: AlertComponent;
  let experienceAdapter: WebExperienceAdapterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllMocks();
  });

  it('should render host with data-testid', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-alert-1',
      type: 'Alert',
      props: {
        visible: true,
        severity: 'info',
        title: 'Info Title',
        message: 'This is an information message',
        closable: true,
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-alert-1');
  });

  it('should pierce Shadow DOM and render title, message, and icon for info severity', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-alert-1',
      type: 'Alert',
      props: {
        visible: true,
        severity: 'info',
        title: 'Info Title',
        message: 'This is an information message',
        closable: true,
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    expect(shadow).toBeTruthy();

    const alertBox = shadow.querySelector('.origo-alert');
    expect(alertBox).toBeTruthy();
    expect(alertBox.classList.contains('origo-alert--info')).toBe(true);
    expect(alertBox.getAttribute('role')).toBe('status');
    expect(alertBox.getAttribute('aria-live')).toBe('polite');

    const title = shadow.querySelector('.origo-alert__title');
    expect(title?.textContent?.trim()).toBe('Info Title');

    const message = shadow.querySelector('.origo-alert__message');
    expect(message?.textContent?.trim()).toBe('This is an information message');
  });

  it('should assign role="alert" and aria-live="assertive" for error and warning severities', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-alert-err',
      type: 'Alert',
      props: {
        severity: 'error',
        title: 'Error Occurred',
        message: 'Something went wrong',
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    let alertBox = shadow.querySelector('.origo-alert');

    expect(alertBox.classList.contains('origo-alert--error')).toBe(true);
    expect(alertBox.getAttribute('role')).toBe('alert');
    expect(alertBox.getAttribute('aria-live')).toBe('assertive');

    // Test warning
    fixture.componentRef.setInput('contract', {
      id: 'test-alert-warn',
      type: 'Alert',
      props: {
        severity: 'warning',
        message: 'Warning text',
      },
    });
    fixture.detectChanges();

    alertBox = shadow.querySelector('.origo-alert');
    expect(alertBox.classList.contains('origo-alert--warning')).toBe(true);
    expect(alertBox.getAttribute('role')).toBe('alert');
    expect(alertBox.getAttribute('aria-live')).toBe('assertive');
  });

  it('should support backwards-compatible "text" property for message', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-alert-text',
      type: 'Message',
      props: {
        severity: 'success',
        text: 'Action completed successfully via text prop',
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    const message = shadow.querySelector('.origo-alert__message');
    expect(message?.textContent?.trim()).toBe('Action completed successfully via text prop');
  });

  it('should handle dismissal via close button click and update state', () => {
    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
    let emittedClose = false;
    let emittedVisible: boolean | undefined = undefined;

    component.close.subscribe(() => (emittedClose = true));
    component.visibleChange.subscribe(v => (emittedVisible = v));

    fixture.componentRef.setInput('contract', {
      id: 'test-alert-close',
      type: 'Alert',
      props: {
        title: 'Closable Alert',
        message: 'Close me',
        closable: true,
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    const closeBtn = shadow.querySelector('.origo-alert__close-btn') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('aria-label')).toBe('Close alert');

    closeBtn.click();
    fixture.detectChanges();

    expect(updateStateSpy).toHaveBeenCalledWith('test-alert-close', 'visible', false);
    expect(emittedClose).toBe(true);
    expect(emittedVisible).toBe(false);
    expect(shadow.querySelector('.origo-alert')).toBeNull();
    expect(fixture.nativeElement.classList.contains('origo-alert--hidden')).toBe(true);
  });

  it('should dispatch action and capability when action button is clicked', () => {
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    let emittedAction: { action: string; data?: unknown } | undefined = undefined;
    component.action.subscribe(a => (emittedAction = a));

    fixture.componentRef.setInput('contract', {
      id: 'test-alert-act',
      type: 'Alert',
      props: {
        title: 'Needs Action',
        message: 'Please review',
        actions: [
          { label: 'Retry', action: 'retry-op' },
          { label: 'Cancel', action: 'cancel-op', variant: 'secondary' },
        ],
      },
    });
    fixture.detectChanges();

    const shadow = fixture.nativeElement.shadowRoot;
    const buttons = shadow.querySelectorAll('.origo-alert__action-btn');
    expect(buttons.length).toBe(2);

    (buttons[0] as HTMLButtonElement).click();
    expect(dispatchSpy).toHaveBeenCalledWith('test-alert-act', 'retry-op', {
      label: 'Retry',
      action: 'retry-op',
    });
    expect(emittedAction).toEqual({
      action: 'retry-op',
      data: { label: 'Retry', action: 'retry-op' },
    });
  });

  it('should auto-dismiss after life ms duration', () => {
    jest.useFakeTimers();
    try {
      const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');

      fixture.componentRef.setInput('contract', {
        id: 'test-alert-life',
        type: 'Alert',
        props: {
          message: 'Auto dismiss alert',
          life: 2000,
        },
      });
      fixture.detectChanges();

      const shadow = fixture.nativeElement.shadowRoot;
      expect(shadow.querySelector('.origo-alert')).toBeTruthy();

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(shadow.querySelector('.origo-alert')).toBeTruthy();

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();
      expect(updateStateSpy).toHaveBeenCalledWith('test-alert-life', 'visible', false);
      expect(shadow.querySelector('.origo-alert')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('should render custom icon when provided', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-alert-custom-icon',
      type: 'Alert',
      props: {
        icon: '🔔',
        message: 'Custom icon alert',
      },
    });
    fixture.detectChanges();

    const customIcon = fixture.nativeElement.shadowRoot.querySelector('.origo-alert__custom-icon');
    expect(customIcon?.textContent?.trim()).toBe('🔔');
  });

  it('should safely render without errors when props are null or undefined', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-alert-null',
      type: 'Alert',
      props: undefined as unknown as AlertProps,
    });
    expect(() => fixture.detectChanges()).not.toThrow();

    expect(fixture.nativeElement.shadowRoot.querySelector('.origo-alert')).toBeTruthy();
  });

  it('should safely initialize in SSR server platform without timers', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [
        provideZonelessChangeDetection(),
        WebExperienceAdapterService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const alertFixture = TestBed.createComponent(AlertComponent);
    alertFixture.componentRef.setInput('contract', {
      id: 'ssr-alert',
      type: 'Alert',
      props: { message: 'SSR Alert', life: 1000 },
    });

    expect(() => alertFixture.detectChanges()).not.toThrow();
  });
});
