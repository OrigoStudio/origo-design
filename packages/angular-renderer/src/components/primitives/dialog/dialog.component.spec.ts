import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent],
      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    // Clean up any remaining CDK overlay containers in document.body
    const overlayContainer = document.querySelector('.cdk-overlay-container');
    if (overlayContainer) {
      overlayContainer.innerHTML = '';
    }
  });

  it('should create and render with default contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'dialog-1',
      type: 'Dialog',
      props: {
        header: 'Test Dialog',
        visible: false,
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('dialog-1');
  });

  it('should attach overlay when visible is true', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'dialog-1',
      type: 'Dialog',
      props: {
        header: 'Test Dialog',
        visible: true,
        modal: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const dialogEl = document.querySelector('.origo-dialog') as HTMLElement;
    expect(dialogEl).toBeTruthy();
    expect(dialogEl.getAttribute('role')).toBe('dialog');
    expect(dialogEl.getAttribute('aria-modal')).toBe('true');
    expect(dialogEl.getAttribute('data-testid')).toBe('dialog-1');

    const titleEl = dialogEl.querySelector('.origo-dialog__title');
    expect(titleEl?.textContent?.trim()).toBe('Test Dialog');
  });

  it('should emit close and visibleChange when close button is clicked', async () => {
    let closed = false;
    let visibleChangedVal: boolean | null = null;
    component.close.subscribe(() => (closed = true));
    component.visibleChange.subscribe(val => (visibleChangedVal = val));

    fixture.componentRef.setInput('contract', {
      id: 'dialog-1',
      type: 'Dialog',
      props: {
        header: 'Test Dialog',
        visible: true,
        closable: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const closeBtn = document.querySelector('.origo-dialog__action--close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closed).toBe(true);
    expect(visibleChangedVal).toBe(false);
  });

  it('should close on Escape key when closeOnEscape is true', async () => {
    let closed = false;
    component.close.subscribe(() => (closed = true));

    fixture.componentRef.setInput('contract', {
      id: 'dialog-1',
      type: 'Dialog',
      props: {
        header: 'Escape Dialog',
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

    expect(closed).toBe(true);
  });

  it('should close on backdrop click when dismissableMask is true', async () => {
    let closed = false;
    component.close.subscribe(() => (closed = true));

    fixture.componentRef.setInput('contract', {
      id: 'dialog-1',
      type: 'Dialog',
      props: {
        header: 'Mask Dialog',
        visible: true,
        modal: true,
        dismissableMask: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closed).toBe(true);
  });

  it('should not close on backdrop click when dismissableMask is false', async () => {
    let closed = false;
    component.close.subscribe(() => (closed = true));

    fixture.componentRef.setInput('contract', {
      id: 'dialog-1',
      type: 'Dialog',
      props: {
        header: 'No Mask Dialog',
        visible: true,
        modal: true,
        dismissableMask: false,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closed).toBe(false);
  });

  it('should toggle maximized state and emit maximize/restore', async () => {
    let maximizedVal: boolean | null = null;
    let restored = false;
    component.maximize.subscribe(val => (maximizedVal = val));
    component.restore.subscribe(() => (restored = true));

    fixture.componentRef.setInput('contract', {
      id: 'dialog-1',
      type: 'Dialog',
      props: {
        header: 'Maximizable Dialog',
        visible: true,
        maximizable: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const maxBtn = document.querySelector('.origo-dialog__action--maximize') as HTMLButtonElement;
    expect(maxBtn).toBeTruthy();

    // Toggle maximize
    maxBtn.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(maximizedVal).toBe(true);
    expect(component.isMaximized()).toBe(true);
    const dialogEl = document.querySelector('.origo-dialog');
    expect(dialogEl?.classList.contains('origo-dialog--maximized')).toBe(true);

    // Toggle restore
    maxBtn.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(restored).toBe(true);
    expect(component.isMaximized()).toBe(false);
    expect(dialogEl?.classList.contains('origo-dialog--maximized')).toBe(false);
  });

  it('should implement ContainerComponent and provide viewContainerRef', () => {
    fixture.componentRef.setInput('contract', {
      id: 'dialog-vc',
      type: 'Dialog',
      props: { header: 'VC Dialog', visible: false },
    });
    fixture.detectChanges();
    // Optional vc signal query should be defined
    expect(component.vc).toBeDefined();
  });

  it('should not crash with null or undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'dialog-null',
      type: 'Dialog',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
