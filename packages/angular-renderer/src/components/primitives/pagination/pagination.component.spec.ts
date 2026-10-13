import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  PaginationComponent,
  PaginationProps,
  PageChangeEvent,
  RowsChangeEvent,
} from './pagination.component';
import { provideZonelessChangeDetection, ViewContainerRef } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';
import { InteractionContract } from '@origostudio/core';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;
  let mockAdapter: { updateState: jest.Mock; dispatchCapability: jest.Mock };

  beforeEach(async () => {
    mockAdapter = {
      updateState: jest.fn(),
      dispatchCapability: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should create and implement ContainerComponent with ViewContainerRef vc', () => {
    fixture.componentRef.setInput('contract', {
      id: 'pag-1',
      type: 'Pagination',
      props: {
        first: 0,
        rows: 10,
        totalRecords: 100,
      },
    } as InteractionContract<PaginationProps>);

    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.vc).toBeDefined();
    expect(component.vc()).toBeInstanceOf(ViewContainerRef);
  });

  it('should calculate pageCount, pageIndex and render navigation buttons', () => {
    fixture.componentRef.setInput('contract', {
      id: 'pag-1',
      type: 'Pagination',
      props: {
        first: 20,
        rows: 10,
        totalRecords: 100,
        pageLinkSize: 5,
        'aria-label': 'Table pagination',
      },
    } as InteractionContract<PaginationProps>);

    fixture.detectChanges();

    expect(component.pageCount()).toBe(10);
    expect(component.pageIndex()).toBe(2);

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const nav = root.querySelector('nav');
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Table pagination');

    const activePageBtn = root.querySelector('.origo-pagination__page--active');
    expect(activePageBtn).toBeTruthy();
    expect(activePageBtn.getAttribute('aria-current')).toBe('page');
    expect(activePageBtn.textContent?.trim()).toBe('3'); // 0-based index 2 is page 3
  });

  it('should calculate visiblePageLinks window properly centered and bounded', () => {
    fixture.componentRef.setInput('contract', {
      id: 'pag-1',
      type: 'Pagination',
      props: {
        first: 40, // page 4 (0-based)
        rows: 10,
        totalRecords: 100, // 10 pages total
        pageLinkSize: 5,
      },
    } as InteractionContract<PaginationProps>);

    fixture.detectChanges();

    // 0-based pageIndex is 4, window size 5 centered: [2, 3, 4, 5, 6] -> pages 3, 4, 5, 6, 7
    expect(component.visiblePageLinks()).toEqual([2, 3, 4, 5, 6]);

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const pageBtns = root.querySelectorAll('.origo-pagination__page');
    expect(pageBtns.length).toBe(5);
    expect(pageBtns[0].textContent?.trim()).toBe('3');
    expect(pageBtns[4].textContent?.trim()).toBe('7');
  });

  it('should disable first/prev buttons on first page and next/last buttons on last page', () => {
    // First page
    fixture.componentRef.setInput('contract', {
      id: 'pag-1',
      type: 'Pagination',
      props: {
        first: 0,
        rows: 10,
        totalRecords: 50,
      },
    } as InteractionContract<PaginationProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const firstBtn = root.querySelector('.origo-pagination__button--first') as HTMLButtonElement;
    const prevBtn = root.querySelector('.origo-pagination__button--prev') as HTMLButtonElement;
    const nextBtn = root.querySelector('.origo-pagination__button--next') as HTMLButtonElement;
    const lastBtn = root.querySelector('.origo-pagination__button--last') as HTMLButtonElement;

    expect(firstBtn.disabled).toBe(true);
    expect(prevBtn.disabled).toBe(true);
    expect(nextBtn.disabled).toBe(false);
    expect(lastBtn.disabled).toBe(false);

    // Change to last page
    fixture.componentRef.setInput('contract', {
      id: 'pag-1',
      type: 'Pagination',
      props: {
        first: 40,
        rows: 10,
        totalRecords: 50,
      },
    } as InteractionContract<PaginationProps>);

    fixture.detectChanges();

    expect(firstBtn.disabled).toBe(false);
    expect(prevBtn.disabled).toBe(false);
    expect(nextBtn.disabled).toBe(true);
    expect(lastBtn.disabled).toBe(true);
  });

  it('should handle page click and dispatch events and state updates', () => {
    const pageSpy = jest.fn();
    component.pageChange.subscribe(pageSpy);

    fixture.componentRef.setInput('contract', {
      id: 'pag-1',
      type: 'Pagination',
      props: {
        first: 0,
        rows: 10,
        totalRecords: 50,
      },
    } as InteractionContract<PaginationProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const pageBtns = root.querySelectorAll('.origo-pagination__page');
    // Click page 2 (index 1)
    (pageBtns[1] as HTMLButtonElement).click();

    const expectedEvent: PageChangeEvent = {
      page: 1,
      first: 10,
      rows: 10,
      pageCount: 5,
    };

    expect(mockAdapter.updateState).toHaveBeenCalledWith('pag-1', 'first', 10);
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith(
      'pag-1',
      'pageChange',
      expectedEvent
    );
    expect(pageSpy).toHaveBeenCalledWith(expectedEvent);
  });

  it('should handle rows per page dropdown selection', () => {
    const rowsSpy = jest.fn();
    const pageSpy = jest.fn();
    component.rowsChange.subscribe(rowsSpy);
    component.pageChange.subscribe(pageSpy);

    fixture.componentRef.setInput('contract', {
      id: 'pag-1',
      type: 'Pagination',
      props: {
        first: 20,
        rows: 10,
        totalRecords: 100,
        rowsPerPageOptions: [10, 20, 50],
      },
    } as InteractionContract<PaginationProps>);

    fixture.detectChanges();

    const root = fixture.nativeElement.shadowRoot ?? fixture.nativeElement;
    const select = root.querySelector('.origo-pagination__rows-select') as HTMLSelectElement;
    expect(select).toBeTruthy();

    select.value = '20';
    select.dispatchEvent(new Event('change'));

    const expectedRowsEvent: RowsChangeEvent = { rows: 20, first: 0 };
    const expectedPageEvent: PageChangeEvent = {
      page: 0,
      first: 0,
      rows: 20,
      pageCount: 5,
    };

    expect(mockAdapter.updateState).toHaveBeenCalledWith('pag-1', 'rows', 20);
    expect(mockAdapter.updateState).toHaveBeenCalledWith('pag-1', 'first', 0);
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith(
      'pag-1',
      'rowsChange',
      expectedRowsEvent
    );
    expect(mockAdapter.dispatchCapability).toHaveBeenCalledWith(
      'pag-1',
      'pageChange',
      expectedPageEvent
    );
    expect(rowsSpy).toHaveBeenCalledWith(expectedRowsEvent);
    expect(pageSpy).toHaveBeenCalledWith(expectedPageEvent);
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
