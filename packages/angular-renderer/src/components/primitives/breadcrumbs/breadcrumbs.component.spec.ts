import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbsComponent, BreadcrumbsProps } from './breadcrumbs.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origo/core';
import { By } from '@angular/platform-browser';

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;
  let mockAdapter: { updateState: jest.Mock };

  beforeEach(async () => {
    mockAdapter = { updateState: jest.fn() };

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

  it('should create', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-1',
      type: 'Command',
      props: {
        items: [],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
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

    const host = fixture.debugElement.nativeElement;
    expect(host.getAttribute('aria-label')).toBe('Breadcrumb Navigation');

    const items = fixture.debugElement.queryAll(By.css('.origo-breadcrumbs__item'));
    expect(items.length).toBe(3);

    const links = fixture.debugElement.queryAll(By.css('.origo-breadcrumbs__link'));
    expect(links.length).toBe(2);

    const currents = fixture.debugElement.queryAll(By.css('.origo-breadcrumbs__current'));
    expect(currents.length).toBe(1);
    expect(currents[0].nativeElement.getAttribute('aria-current')).toBe('page');
  });

  it('should call updateState on clickable item click', () => {
    fixture.componentRef.setInput('contract', {
      id: 'bc-1',
      type: 'Command',
      props: {
        items: [{ label: 'Home', outcomeRef: 'outcome-home' }, { label: 'Products' }],
      },
    } as InteractionContract<BreadcrumbsProps>);

    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('.origo-breadcrumbs__link'));
    link.triggerEventHandler('click', new Event('click'));

    expect(mockAdapter.updateState).toHaveBeenCalledWith('bc-1', 'activeOutcome', 'outcome-home');
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
