import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { SnackbarComponent } from './snackbar.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';

describe('SnackbarComponent', () => {
  let fixture: ComponentFixture<SnackbarComponent>;
  let component: SnackbarComponent;
  let experienceAdapter: WebExperienceAdapterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, SnackbarComponent],
      providers: [
        provideZonelessChangeDetection(),
        OrigoOverlayService,
        WebExperienceAdapterService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackbarComponent);
    component = fixture.componentInstance;
    experienceAdapter = TestBed.inject(WebExperienceAdapterService);
  });

  afterEach(() => {
    fixture.destroy();
    const containers = document.querySelectorAll('.cdk-overlay-container');
    containers.forEach(c => c.remove());
    jest.clearAllMocks();
  });

  it('should render host with data-testid', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-snackbar-1',
      type: 'Snackbar',
      props: {
        visible: false,
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-snackbar-1');
  });

  it('should mount in document.body when visible is true and display message', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-snackbar-mount',
      type: 'Snackbar',
      props: {
        visible: true,
        message: 'File deleted successfully',
      },
    });
    fixture.detectChanges();

    const portal = document.querySelector('.origo-snackbar');
    expect(portal).toBeTruthy();
    expect(portal?.getAttribute('role')).toBe('status');
    expect(portal?.getAttribute('aria-live')).toBe('polite');

    const msg = document.querySelector('.origo-snackbar__message');
    expect(msg?.textContent?.trim()).toBe('File deleted successfully');
  });

  it('should render action button and handle click event', () => {
    const dispatchSpy = jest.spyOn(experienceAdapter, 'dispatchCapability');
    let actionClicked = false;
    component.actionClick.subscribe(() => (actionClicked = true));

    fixture.componentRef.setInput('contract', {
      id: 'test-snackbar-action',
      type: 'Snackbar',
      props: {
        visible: true,
        message: 'Item archived',
        actionLabel: 'Undo',
      },
    });
    fixture.detectChanges();

    const actionBtn = document.querySelector('.origo-snackbar__action-btn') as HTMLButtonElement;
    expect(actionBtn).toBeTruthy();
    expect(actionBtn.textContent?.trim()).toBe('Undo');

    actionBtn.click();
    fixture.detectChanges();

    expect(actionClicked).toBe(true);
    expect(dispatchSpy).toHaveBeenCalledWith('test-snackbar-action', 'action', {});
    expect(document.querySelector('.origo-snackbar')).toBeNull();
  });

  it('should support "action" as alias for actionLabel', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-snackbar-alias',
      type: 'Snackbar',
      props: {
        visible: true,
        message: 'Changes saved',
        action: 'Retry',
      },
    });
    fixture.detectChanges();

    const actionBtn = document.querySelector('.origo-snackbar__action-btn');
    expect(actionBtn?.textContent?.trim()).toBe('Retry');
  });

  it('should support manual dismissal via close button', () => {
    const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');
    let closed = false;
    component.close.subscribe(() => (closed = true));

    fixture.componentRef.setInput('contract', {
      id: 'test-snackbar-close',
      type: 'Snackbar',
      props: {
        visible: true,
        message: 'Closable message',
        closable: true,
      },
    });
    fixture.detectChanges();

    const closeBtn = document.querySelector('.origo-snackbar__close-btn') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.click();
    fixture.detectChanges();

    expect(closed).toBe(true);
    expect(updateStateSpy).toHaveBeenCalledWith('test-snackbar-close', 'visible', false);
    expect(document.querySelector('.origo-snackbar')).toBeNull();
  });

  it('should auto-dismiss after duration ms timeout', () => {
    jest.useFakeTimers();
    try {
      const updateStateSpy = jest.spyOn(experienceAdapter, 'updateState');

      fixture.componentRef.setInput('contract', {
        id: 'test-snackbar-duration',
        type: 'Snackbar',
        props: {
          visible: true,
          message: 'Transient snackbar',
          duration: 3000,
        },
      });
      fixture.detectChanges();

      expect(document.querySelector('.origo-snackbar')).toBeTruthy();

      jest.advanceTimersByTime(1500);
      fixture.detectChanges();
      expect(document.querySelector('.origo-snackbar')).toBeTruthy();

      jest.advanceTimersByTime(1500);
      fixture.detectChanges();
      expect(updateStateSpy).toHaveBeenCalledWith('test-snackbar-duration', 'visible', false);
      expect(document.querySelector('.origo-snackbar')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('should close on Escape keydown', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-snackbar-esc',
      type: 'Snackbar',
      props: {
        visible: true,
        message: 'Press Escape to close',
      },
    });
    fixture.detectChanges();

    expect(document.querySelector('.origo-snackbar')).toBeTruthy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('.origo-snackbar')).toBeNull();
  });

  it('should apply role="alert", aria-live="assertive", aria-atomic="true", and warning class for warning/error severities', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-snackbar-warn',
      type: 'Snackbar',
      props: {
        visible: true,
        message: 'Storage quota almost full',
        severity: 'warning',
        'aria-describedby': 'quota-desc',
      },
    });
    fixture.detectChanges();

    const portal = document.querySelector('.origo-snackbar');
    expect(portal).toBeTruthy();
    expect(portal?.classList.contains('origo-snackbar--warning')).toBe(true);
    expect(portal?.getAttribute('role')).toBe('alert');
    expect(portal?.getAttribute('aria-live')).toBe('assertive');
    expect(portal?.getAttribute('aria-atomic')).toBe('true');
    expect(portal?.getAttribute('aria-describedby')).toBe('quota-desc');
    expect(portal?.getAttribute('data-testid')).toBe('test-snackbar-warn');
  });

  it('should safely execute without errors on SSR server platform', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [SnackbarComponent],
      providers: [
        provideZonelessChangeDetection(),
        OrigoOverlayService,
        WebExperienceAdapterService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const ssrFixture = TestBed.createComponent(SnackbarComponent);
    ssrFixture.componentRef.setInput('contract', {
      id: 'ssr-snackbar',
      type: 'Snackbar',
      props: { visible: true, message: 'SSR' },
    });

    expect(() => ssrFixture.detectChanges()).not.toThrow();
  });
});
