import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ModalComponent } from './modal.component';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideZonelessChangeDetection(), WebExperienceAdapterService],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    const overlayContainer = document.querySelector('.cdk-overlay-container');
    if (overlayContainer) {
      overlayContainer.innerHTML = '';
    }
  });

  it('should create and render modal component', () => {
    fixture.componentRef.setInput('contract', {
      id: 'modal-1',
      type: 'Modal',
      props: {
        header: 'Test Modal',
        visible: false,
      },
    });
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.getAttribute('data-testid')).toBe('modal-1');
  });

  it('should enforce modal: true invariant even if props specify modal: false', async () => {
    fixture.componentRef.setInput('contract', {
      id: 'modal-invariant',
      type: 'Modal',
      props: {
        header: 'Forced Modal',
        visible: true,
        modal: false, // Invariant test: should be overridden to true
      },
    });
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 10));

    const backdrop = document.querySelector('.origo-overlay-backdrop');
    expect(backdrop).toBeTruthy();

    const dialogEl = document.querySelector('.origo-dialog');
    expect(dialogEl?.getAttribute('aria-modal')).toBe('true');
  });

  it('should propagate close and visibleChange outputs', async () => {
    let closed = false;
    let visibleChangedVal: boolean | null = null;
    component.close.subscribe(() => (closed = true));
    component.visibleChange.subscribe(val => (visibleChangedVal = val));

    fixture.componentRef.setInput('contract', {
      id: 'modal-propagate',
      type: 'Modal',
      props: {
        header: 'Propagate Modal',
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

  it('should implement ContainerComponent', () => {
    fixture.componentRef.setInput('contract', {
      id: 'modal-vc',
      type: 'Modal',
      props: { header: 'Modal VC', visible: false },
    });
    fixture.detectChanges();
    expect(component.vc).toBeDefined();
  });

  it('should not crash with null or undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'modal-null',
      type: 'Modal',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
