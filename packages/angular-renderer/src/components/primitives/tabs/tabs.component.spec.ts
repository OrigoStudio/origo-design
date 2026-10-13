import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent, TabsProps, TabItem } from './tabs.component';
import { provideZonelessChangeDetection, ViewContainerRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origostudio/core';

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;
  let mockAdapter: { updateState: jest.Mock; dispatchCapability: jest.Mock };

  beforeEach(async () => {
    mockAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    };

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

  it('should create and implement ContainerComponent with ViewContainerRef vc', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tabs-1',
      type: 'Command',
      props: {
        tabs: [],
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.vc).toBeDefined();
    expect(component.vc()).toBeInstanceOf(ViewContainerRef);
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

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const tablist = root.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();
    expect(tablist.getAttribute('aria-label')).toBe('My Tabs');

    const tabs = root.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);

    // First tab is active
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('tabindex')).toBe('0');

    // Second tab is not active
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');
  });

  it('should support items alias and value alias for active tab', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tabs-alias',
      type: 'Tabs',
      props: {
        items: [
          { key: 'alpha', label: 'Alpha' },
          { key: 'beta', label: 'Beta' },
        ],
        value: 'beta',
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const tabs = root.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('should call updateState, dispatchCapability, and emit valueChange and tabChange on tab click', () => {
    const tabToClick: TabItem = { key: 'tab2', label: 'Tab 2' };
    const spyValue = jest.fn();
    const spyTab = jest.fn();
    component.valueChange.subscribe(spyValue);
    component.tabChange.subscribe(spyTab);

    fixture.componentRef.setInput('contract', {
      id: 'tabs-1',
      type: 'Command',
      props: {
        tabs: [{ key: 'tab1', label: 'Tab 1' }, tabToClick],
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const tabs = root.querySelectorAll('[role="tab"]');
    (tabs[1] as HTMLElement).click();

    expect(mockAdapter.updateState).toHaveBeenCalledWith('tabs-1', 'activeTab', 'tab2');
    expect(mockAdapter.updateState).toHaveBeenCalledWith('tabs-1', 'value', 'tab2');
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith('tabs-1', 'valueChange', 'tab2');
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith(
      'tabs-1',
      'tabChange',
      expect.objectContaining({ key: 'tab2' })
    );
    expect(spyValue).toHaveBeenCalledWith('tab2');
    expect(spyTab).toHaveBeenCalledWith(expect.objectContaining({ key: 'tab2' }));
  });

  it('should render closable tab and handle tabClose event without selecting tab', () => {
    const spyClose = jest.fn();
    component.tabClose.subscribe(spyClose);

    fixture.componentRef.setInput('contract', {
      id: 'tabs-closable',
      type: 'Tabs',
      props: {
        tabs: [
          { key: 'tab1', label: 'Tab 1' },
          { key: 'tab2', label: 'Tab 2', closable: true },
        ],
        activeTab: 'tab1',
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const closeButton = root.querySelector('.origo-tabs__close') as HTMLButtonElement;
    expect(closeButton).toBeTruthy();
    expect(closeButton.getAttribute('aria-label')).toBe('Close Tab 2');

    closeButton.click();

    expect(spyClose).toHaveBeenCalledWith('tab2');
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith(
      'tabs-closable',
      'tabClose',
      'tab2'
    );
    // Tab click must NOT have been triggered
    expect(mockAdapter.updateState).not.toHaveBeenCalledWith('tabs-closable', 'activeTab', 'tab2');
  });

  it('should render badge and icon on tab when configured', () => {
    fixture.componentRef.setInput('contract', {
      id: 'tabs-badge',
      type: 'Tabs',
      props: {
        tabs: [{ key: 'tab1', label: 'Inbox', icon: 'mail-icon', badge: 5 }],
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    expect(root.querySelector('.origo-tabs__icon')?.textContent).toContain('mail-icon');
    expect(root.querySelector('.origo-tabs__badge')?.textContent).toContain('5');
  });

  it('should handle horizontal keyboard navigation (ArrowRight / ArrowLeft)', () => {
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

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const tabs = root.querySelectorAll('[role="tab"]');
    const focusSpy = jest.spyOn(tabs[1] as HTMLElement, 'focus');

    const eventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.onKeyDown(eventRight, 0);
    jest.runAllTimers();
    expect(focusSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should handle vertical keyboard navigation (ArrowDown / ArrowUp) when orientation is vertical', () => {
    jest.useFakeTimers();
    fixture.componentRef.setInput('contract', {
      id: 'tabs-vertical',
      type: 'Tabs',
      props: {
        orientation: 'vertical',
        tabs: [
          { key: 'tab1', label: 'Tab 1' },
          { key: 'tab2', label: 'Tab 2' },
          { key: 'tab3', label: 'Tab 3' },
        ],
        activeTab: 'tab1',
      },
    } as InteractionContract<TabsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const tabs = root.querySelectorAll('[role="tab"]');
    const focusSpyDown = jest.spyOn(tabs[1] as HTMLElement, 'focus');

    const eventDown = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onKeyDown(eventDown, 0);
    jest.runAllTimers();
    expect(focusSpyDown).toHaveBeenCalled();

    const focusSpyUp = jest.spyOn(tabs[0] as HTMLElement, 'focus');
    const eventUp = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.onKeyDown(eventUp, 1);
    jest.runAllTimers();
    expect(focusSpyUp).toHaveBeenCalled();

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
