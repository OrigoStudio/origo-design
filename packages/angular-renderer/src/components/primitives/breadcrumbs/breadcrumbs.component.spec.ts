import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbsComponent, BreadcrumbsProps, BreadcrumbItem } from './breadcrumbs.component';
import { provideZonelessChangeDetection, ViewContainerRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origostudio/core';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let mockAdapter: { updateState: jest.Mock; dispatchCapability: jest.Mock };

  beforeEach(async () => {
    mockAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [BreadcrumbsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
  });

  it('should create and implement ContainerComponent with ViewContainerRef vc', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-1',
      type: 'Command',
      props: {
        items: [],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.vc).toBeDefined();
    expect(component.vc()).toBeInstanceOf(ViewContainerRef);
  });

  it('should render items correctly and bind aria attributes', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-1',
      type: 'Command',
      props: {
        items: [
          { label: 'Home', outcomeRef: 'outcome-home' },
          { label: 'Products', outcomeRef: 'outcome-products' },
          { label: 'Shoes' },
        ],
        'aria-label': 'Breadcrumb Navigation',
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();

    const host = fixture.nativeElement;
    expect(host.getAttribute('aria-label')).toBe('Breadcrumb Navigation');

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const items = root.querySelectorAll('.origo-breadcrumbs__item');
    expect(items.length).toBe(3);

    const links = root.querySelectorAll('.origo-breadcrumbs__link');
    expect(links.length).toBe(2);

    const currents = root.querySelectorAll('.origo-breadcrumbs__current');
    expect(currents.length).toBe(1);
    expect(currents[0].getAttribute('aria-current')).toBe('page');
    expect(currents[0].textContent?.trim()).toBe('Shoes');
  });

  it('should render custom home item as first item when provided', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-home',
      type: 'Breadcrumbs',
      props: {
        home: { label: 'Root', icon: 'home-icon', outcomeRef: 'outcome-root' },
        items: [{ label: 'Section', outcomeRef: 'outcome-section' }, { label: 'Detail' }],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const items = root.querySelectorAll('.origo-breadcrumbs__item');
    expect(items.length).toBe(3);

    const homeItem = items[0];
    expect(homeItem.classList.contains('origo-breadcrumbs__item--home')).toBe(true);
    expect(homeItem.textContent).toContain('Root');
    expect(homeItem.textContent).toContain('home-icon');
  });

  it('should render custom separator when specified', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-sep',
      type: 'Breadcrumbs',
      props: {
        separator: '>',
        items: [{ label: 'First', outcomeRef: 'out-1' }, { label: 'Second' }],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const separator = root.querySelector('.origo-breadcrumbs__separator');
    expect(separator).toBeTruthy();
    expect(separator?.textContent?.trim()).toBe('>');
  });

  it('should call updateState, dispatchCapability, and emit itemClick on link click', () => {
    const itemToClick: BreadcrumbItem = { label: 'Home', outcomeRef: 'outcome-home' };
    const spyOutput = jest.fn();
    component.itemClick.subscribe(spyOutput);

    fixture.componentRef.setInput('contract', {
      id: 'bc-1',
      type: 'Command',
      props: {
        items: [itemToClick, { label: 'Products' }],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const link = root.querySelector('.origo-breadcrumbs__link') as
      | HTMLButtonElement
      | HTMLAnchorElement;
    expect(link).toBeTruthy();

    link.click();

    expect(mockAdapter.updateState).toHaveBeenCalledWith('bc-1', 'activeOutcome', 'outcome-home');
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith(
      'bc-1',
      'itemClick',
      expect.objectContaining({
        label: 'Home',
        outcomeRef: 'outcome-home',
      })
    );
    expect(spyOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Home',
        outcomeRef: 'outcome-home',
      })
    );
  });

  it('should prevent navigation and not update state when item is disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-disabled',
      type: 'Breadcrumbs',
      props: {
        items: [
          { label: 'Disabled Home', outcomeRef: 'outcome-home', disabled: true },
          { label: 'Current' },
        ],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const link = root.querySelector('.origo-breadcrumbs__link') as HTMLButtonElement;
    expect(link.disabled).toBe(true);

    link.click();

    expect(mockAdapter.updateState).not.toHaveBeenCalled();
    expect(mockAdapter.dispatchCapability).not.toHaveBeenCalled();
  });

  it('should render semantic button without javascript:void(0) href to satisfy CSP', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-csp',
      type: 'Breadcrumbs',
      props: {
        items: [{ label: 'Safe Link', outcomeRef: 'out-1' }, { label: 'End' }],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const htmlContent = root.innerHTML;
    expect(htmlContent).not.toContain('javascript:void(0)');
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
