import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DrawerComponent } from './drawer.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('DrawerComponent', () => {
  let component: DrawerComponent;
  let fixture: ComponentFixture<DrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerComponent],
      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    const overlayContainer = document.querySelector('.cdk-overlay-container');
    if (overlayContainer) {
      overlayContainer.innerHTML = '';
    }
  });

  it('should create and render with default contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'drawer-1',
      type: 'Drawer',
      props: {
        header: 'Test Drawer',
        visible: false,
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('drawer-1');
  });

  it('should attach overlay when visible is true with default left position', async () => {
    let openEmitted = false;
    let showEmitted = false;
    component.open.subscribe(() => (openEmitted = true));
    component.show.subscribe(() => (showEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'drawer-left',
      type: 'Drawer',
      props: {
        header: 'Left Drawer',
        visible: true,
        position: 'left',
        modal: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(openEmitted).toBe(true);
    expect(showEmitted).toBe(true);

    const drawerEl = document.querySelector('.origo-drawer') as HTMLElement;
    expect(drawerEl).toBeTruthy();
    expect(drawerEl.getAttribute('role')).toBe('dialog');
    expect(drawerEl.getAttribute('aria-modal')).toBe('true');
    expect(drawerEl.getAttribute('data-testid')).toBe('drawer-left');
    expect(drawerEl.classList.contains('origo-drawer--left')).toBe(true);

    const titleEl = drawerEl.querySelector('.origo-drawer__title');
    expect(titleEl?.textContent?.trim()).toBe('Left Drawer');
  });

  it('should support position right, top, bottom', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'drawer-right',
      type: 'Drawer',
      props: {
        header: 'Right Drawer',
        visible: true,
        position: 'right',
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    let drawerEl = document.querySelector('.origo-drawer');
    expect(drawerEl?.classList.contains('origo-drawer--right')).toBe(true);

    fixture.componentRef.setInput('contract', {
      id: 'drawer-top',
      type: 'Drawer',
      props: {
        header: 'Top Drawer',
        visible: true,
        position: 'top',
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    drawerEl = document.querySelector('.origo-drawer');
    expect(drawerEl?.classList.contains('origo-drawer--top')).toBe(true);

    fixture.componentRef.setInput('contract', {
      id: 'drawer-bottom',
      type: 'Drawer',
      props: {
        header: 'Bottom Drawer',
        visible: true,
        position: 'bottom',
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    drawerEl = document.querySelector('.origo-drawer');
    expect(drawerEl?.classList.contains('origo-drawer--bottom')).toBe(true);
  });

  it('should emit close, hide, and visibleChange when close button is clicked', async () => {
    let closeEmitted = false;
    let hideEmitted = false;
    let visibleVal: boolean | null = null;
    component.close.subscribe(() => (closeEmitted = true));
    component.hide.subscribe(() => (hideEmitted = true));
    component.visibleChange.subscribe(val => (visibleVal = val));

    fixture.componentRef.setInput('contract', {
      id: 'drawer-close-btn',
      type: 'Drawer',
      props: {
        header: 'Closable Drawer',
        visible: true,
        closable: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const closeBtn = document.querySelector('.origo-drawer__close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closeEmitted).toBe(true);
    expect(hideEmitted).toBe(true);
    expect(visibleVal).toBe(false);
  });

  it('should close on Escape key when closeOnEscape is true', async () => {
    let closeEmitted = false;
    component.close.subscribe(() => (closeEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'drawer-esc',
      type: 'Drawer',
      props: {
        header: 'Escape Drawer',
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

  it('should close on backdrop click when dismissible is true', async () => {
    let closeEmitted = false;
    component.close.subscribe(() => (closeEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'drawer-dismissible',
      type: 'Drawer',
      props: {
        header: 'Dismissible Drawer',
        visible: true,
        modal: true,
        dismissible: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closeEmitted).toBe(true);
  });

  it('should not close on backdrop click when dismissible is false', async () => {
    let closeEmitted = false;
    component.close.subscribe(() => (closeEmitted = true));

    fixture.componentRef.setInput('contract', {
      id: 'drawer-non-dismissible',
      type: 'Drawer',
      props: {
        header: 'Non-dismissible Drawer',
        visible: true,
        modal: true,
        dismissible: false,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const backdrop = document.querySelector('.origo-overlay-backdrop') as HTMLElement;
    expect(backdrop).toBeTruthy();
    backdrop.click();
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(closeEmitted).toBe(false);
  });

  it('should render footer when provided', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'drawer-footer',
      type: 'Drawer',
      props: {
        header: 'Drawer With Footer',
        footer: 'Custom Footer Content',
        visible: true,
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const footerEl = document.querySelector('.origo-drawer__footer');
    expect(footerEl?.textContent?.trim()).toBe('Custom Footer Content');
  });

  it('should implement ContainerComponent', () => {
    fixture.componentRef.setInput('contract', {
      id: 'drawer-vc',
      type: 'Drawer',
      props: { header: 'Drawer VC', visible: false },
    });
    fixture.detectChanges();
    expect(component.vc).toBeDefined();
  });

  it('should not crash with null or undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'drawer-null',
      type: 'Drawer',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
