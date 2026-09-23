import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent, TabsProps } from './tabs.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origo/core';
import { By } from '@angular/platform-browser';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;
  let mockAdapter: { updateState: jest.Mock };

  beforeEach(async () => {
    mockAdapter = { updateState: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [TabsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tabs-1',
      type: 'Command',
      props: {
        tabs: [],
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render tabs and bind roles and selected states', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tabs-1',
      type: 'Command',
      props: {
        tabs: [
          { key: 'tab1', label: 'Tab 1' },
          { key: 'tab2', label: 'Tab 2' },
        ],
        'aria-label': 'My Tabs',
        activeTab: 'tab1',
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const tablist = fixture.debugElement.query(By.css('[role="tablist"]'));
    expect(tablist).toBeTruthy();
    expect(tablist.nativeElement.getAttribute('aria-label')).toBe('My Tabs');

    const tabs = fixture.debugElement.queryAll(By.css('[role="tab"]'));
    expect(tabs.length).toBe(2);

    // First tab is active
    expect(tabs[0].nativeElement.getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].nativeElement.getAttribute('tabindex')).toBe('0');

    // Second tab is not active
    expect(tabs[1].nativeElement.getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].nativeElement.getAttribute('tabindex')).toBe('-1');
  });

  it('should call updateState on tab click', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tabs-1',
      type: 'Command',
      props: {
        tabs: [{ key: 'tab1', label: 'Tab 1' }],
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const tab = fixture.debugElement.query(By.css('[role="tab"]'));
    tab.triggerEventHandler('click', null);

    expect(mockAdapter.updateState).toHaveBeenCalledWith('tabs-1', 'activeTab', 'tab1');
  });

  it('should handle keyboard navigation (ArrowRight / ArrowLeft)', () => {
    jest.useFakeTimers();
    fixture.componentRef.setInput('contract', {
      id: 'tabs-1',
      type: 'Command',
      props: {
        tabs: [
          { key: 'tab1', label: 'Tab 1' },
          { key: 'tab2', label: 'Tab 2' },
        ],
        activeTab: 'tab1',
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const tabs = fixture.debugElement.queryAll(By.css('[role="tab"]'));
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    const focusSpy = jest.spyOn(tabs[1].nativeElement, 'focus');

    component.onKeyDown(eventRight, 0);
    jest.runAllTimers();
    expect(focusSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should handle keyboard navigation (RTL)', () => {
    jest.useFakeTimers();
    fixture.componentRef.setInput('contract', {
      id: 'tabs-1',
      type: 'Command',
      props: {
        tabs: [
          { key: 'tab1', label: 'Tab 1' },
          { key: 'tab2', label: 'Tab 2' },
        ],
        activeTab: 'tab1',
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const tabs = fixture.debugElement.queryAll(By.css('[role="tab"]'));
    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    Object.defineProperty(eventRight, 'target', {
      value: document.createElement('div'),
      enumerable: true,
    });

    // Mock getComputedStyle for RTL
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = jest.fn().mockReturnValue({ direction: 'rtl' });

    // In RTL, ArrowRight on index 0 should go left (to the last tab: index 1)
    const focusSpy = jest.spyOn(tabs[1].nativeElement, 'focus');

    component.onKeyDown(eventRight, 0);
    jest.runAllTimers();
    expect(focusSpy).toHaveBeenCalled();

    window.getComputedStyle = originalGetComputedStyle;
    jest.useRealTimers();
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
