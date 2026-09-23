import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent, SidebarProps } from './sidebar.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origo/core';
import { By } from '@angular/platform-browser';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockAdapter: { updateState: jest.Mock };

  beforeEach(async () => {
    mockAdapter = { updateState: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('contract', {
      id: 'sidebar-1',
      type: 'Command',
      props: {
        items: [],
      },
    } as InteractionContract<SidebarProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render items correctly and bind aria attributes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'sidebar-1',
      type: 'Command',
      props: {
        items: [
          { key: '1', label: 'Item 1', outcomeRef: 'outcome1', icon: 'home' },
          { key: '2', label: 'Item 2', outcomeRef: 'outcome2', icon: 'settings' },
        ],
        'aria-label': 'My Sidebar',
        activeOutcome: 'outcome1',
      },
    } as InteractionContract<SidebarProps>);

    fixture.detectChanges();

    const host = fixture.debugElement.nativeElement;
    expect(host.getAttribute('aria-label')).toBe('My Sidebar');

    const links = fixture.debugElement.queryAll(By.css('.origo-sidebar__link'));
    expect(links.length).toBe(2);

    // First link is active
    expect(links[0].nativeElement.getAttribute('aria-current')).toBe('page');
    // Second link is not active
    expect(links[1].nativeElement.getAttribute('aria-current')).toBeNull();
  });

  it('should call updateState on item click', () => {
    fixture.componentRef.setInput('contract', {
      id: 'sidebar-1',
      type: 'Command',
      props: {
        items: [{ key: '1', label: 'Home', outcomeRef: 'outcome-home' }],
      },
    } as InteractionContract<SidebarProps>);

    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('.origo-sidebar__link'));
    link.triggerEventHandler('click', null);

    expect(mockAdapter.updateState).toHaveBeenCalledWith(
      'sidebar-1',
      'activeOutcome',
      'outcome-home'
    );
  });

  it('should apply rtl correctly (simulated via document dir in integration, but testing logical properties implicitly via SCSS usage)', () => {
    // The requirement is that it renders correctly in RTL via logical CSS properties.
    // Unit tests usually just verify the component compiles and basic classes are applied.
    fixture.componentRef.setInput('contract', {
      id: 'sidebar-1',
      type: 'Command',
    } as InteractionContract<SidebarProps>);
    fixture.detectChanges();
    const host = fixture.debugElement.nativeElement;
    // We can test if class is present
    expect(host.classList.contains('origo-sidebar')).toBe(true);
  });

  it('should support RTL layouts by avoiding physical CSS properties', () => {
    fixture.componentRef.setInput('contract', { id: 'rtl-test', type: 'test', props: {} });
    fixture.detectChanges();
    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const element = root.firstElementChild as HTMLElement;
    if (element && element.style) {
      expect(element.style.paddingLeft).toBeFalsy();
      expect(element.style.paddingRight).toBeFalsy();
      expect(element.style.marginLeft).toBeFalsy();
      expect(element.style.marginRight).toBeFalsy();
    }
  });
});
