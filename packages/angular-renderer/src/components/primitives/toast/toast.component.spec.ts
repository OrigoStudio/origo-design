import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { ToastComponent } from './toast.component';
import { ToastMessage } from './toast.models';
import { OrigoToastService } from './toast.service';
import { OrigoOverlayService } from '../../../lib/overlay/overlay.service';

describe('ToastComponent', () => {
  let fixture: ComponentFixture<ToastComponent>;
  let component: ToastComponent;
  let toastService: OrigoToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, ToastComponent],
      providers: [provideZonelessChangeDetection(), OrigoOverlayService, OrigoToastService],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(OrigoToastService);
  });

  afterEach(() => {
    fixture.destroy();
    toastService.clear();
    const containers = document.querySelectorAll('.cdk-overlay-container');
    containers.forEach(c => c.remove());
    jest.clearAllMocks();
  });

  it('should render host with data-testid', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-toast-1',
      type: 'Toast',
      props: {
        position: 'top-end',
      },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('test-toast-1');
  });

  it('should project toast panel into document.body overlay container', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-toast-portal',
      type: 'Toast',
      props: {
        summary: 'Portal Toast',
        detail: 'Visible in document body',
        severity: 'info',
      },
    });
    fixture.detectChanges();

    const portal = document.querySelector('.origo-toast');
    expect(portal).toBeTruthy();
    expect(portal?.getAttribute('role')).toBe('region');
    expect(portal?.getAttribute('aria-label')).toBe('Notifications');

    const toastItem = document.querySelector('.origo-toast__item');
    expect(toastItem).toBeTruthy();
    expect(toastItem?.classList.contains('origo-toast__item--info')).toBe(true);

    const summary = document.querySelector('.origo-toast__summary');
    expect(summary?.textContent?.trim()).toBe('Portal Toast');

    const detail = document.querySelector('.origo-toast__detail');
    expect(detail?.textContent?.trim()).toBe('Visible in document body');
  });

  it('should stack multiple toast messages vertically', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-toast-stack',
      type: 'Toast',
      props: {
        messages: [
          { severity: 'info', summary: 'Msg 1', detail: 'First' },
          { severity: 'success', summary: 'Msg 2', detail: 'Second' },
          { severity: 'error', summary: 'Msg 3', detail: 'Third' },
        ],
      },
    });
    fixture.detectChanges();

    const items = document.querySelectorAll('.origo-toast__item');
    expect(items.length).toBe(3);
    expect(items[0].classList.contains('origo-toast__item--info')).toBe(true);
    expect(items[1].classList.contains('origo-toast__item--success')).toBe(true);
    expect(items[2].classList.contains('origo-toast__item--error')).toBe(true);
  });

  it('should reflect imperatively dispatched messages from OrigoToastService', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-toast-service-sync',
      type: 'Toast',
      props: {},
    });
    fixture.detectChanges();

    toastService.success('Saved', 'Record updated successfully');
    fixture.detectChanges();

    const summary = document.querySelector('.origo-toast__summary');
    expect(summary?.textContent?.trim()).toBe('Saved');
  });

  it('should dismiss individual toast on close button click and emit close output', () => {
    let closedToast: ToastMessage | undefined = undefined;
    component.close.subscribe(msg => (closedToast = msg));

    fixture.componentRef.setInput('contract', {
      id: 'test-toast-dismiss',
      type: 'Toast',
      props: {
        messages: [{ severity: 'warn', summary: 'To Dismiss', closable: true }],
      },
    });
    fixture.detectChanges();

    const closeBtn = document.querySelector('.origo-toast__close-btn') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();

    closeBtn.click();
    fixture.detectChanges();

    expect(closedToast).toBeTruthy();
    expect((closedToast as unknown as ToastMessage)?.summary).toBe('To Dismiss');
    expect(document.querySelector('.origo-toast__item')).toBeNull();
  });

  it('should pause auto-dismiss timer on mouseenter and resume on mouseleave', () => {
    jest.useFakeTimers();
    try {
      fixture.componentRef.setInput('contract', {
        id: 'test-toast-pause',
        type: 'Toast',
        props: {
          messages: [{ id: 'pause-item-1', summary: 'Pause Me', life: 2000 }],
        },
      });
      fixture.detectChanges();

      const item = document.querySelector('.origo-toast__item') as HTMLElement;
      expect(item).toBeTruthy();

      // Advance 1000ms
      jest.advanceTimersByTime(1000);

      // Mouse enter -> pause
      item.dispatchEvent(new MouseEvent('mouseenter'));

      // Advance another 2000ms while hovered - should NOT dismiss
      jest.advanceTimersByTime(2000);
      fixture.detectChanges();
      expect(document.querySelector('.origo-toast__item')).toBeTruthy();

      // Mouse leave -> resume with remaining 1000ms
      item.dispatchEvent(new MouseEvent('mouseleave'));

      // Advance 500ms -> still present
      jest.advanceTimersByTime(500);
      fixture.detectChanges();
      expect(document.querySelector('.origo-toast__item')).toBeTruthy();

      // Advance remaining 500ms -> dismissed
      jest.advanceTimersByTime(500);
      fixture.detectChanges();
      expect(document.querySelector('.origo-toast__item')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('should suppress duplicate messages when preventDuplicates is true', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-toast-dup',
      type: 'Toast',
      props: {
        preventDuplicates: true,
      },
    });
    fixture.detectChanges();

    component.addToast({ severity: 'info', summary: 'Unique', detail: 'Content' });
    component.addToast({ severity: 'info', summary: 'Unique', detail: 'Content' });
    fixture.detectChanges();

    const items = document.querySelectorAll('.origo-toast__item');
    expect(items.length).toBe(1);
  });

  it('should sync with OrigoToastService emissions and handle clear()', () => {
    fixture.componentRef.setInput('contract', {
      id: 'test-toast-svc',
      type: 'Toast',
      props: {},
    });
    fixture.detectChanges();

    toastService.info('Message 1', 'Detail 1');
    fixture.detectChanges();
    expect(document.querySelectorAll('.origo-toast__item').length).toBe(1);

    // Emitting a second message should not duplicate Message 1
    toastService.success('Message 2', 'Detail 2');
    fixture.detectChanges();
    expect(document.querySelectorAll('.origo-toast__item').length).toBe(2);

    // Calling clear should remove all items and dispose overlay
    toastService.clear();
    fixture.detectChanges();
    expect(document.querySelectorAll('.origo-toast__item').length).toBe(0);
    expect(document.querySelector('.origo-overlay-pane--toast')).toBeNull();
  });

  it('should safely execute without errors on SSR server platform', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        provideZonelessChangeDetection(),
        OrigoOverlayService,
        OrigoToastService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });

    const ssrFixture = TestBed.createComponent(ToastComponent);
    ssrFixture.componentRef.setInput('contract', {
      id: 'ssr-toast',
      type: 'Toast',
      props: { summary: 'SSR Toast' },
    });

    expect(() => ssrFixture.detectChanges()).not.toThrow();
  });
});
