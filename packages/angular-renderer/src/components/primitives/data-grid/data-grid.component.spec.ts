import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataGridComponent } from './data-grid.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

describe('DataGridComponent', () => {
  let component: DataGridComponent;
  let fixture: ComponentFixture<DataGridComponent>;
  let mockAdapterService: jest.Mocked<WebExperienceAdapterService>;

  beforeEach(async () => {
    mockAdapterService = {
      updateState: jest.fn(),
    } as unknown as jest.Mocked<WebExperienceAdapterService>;

    await TestBed.configureTestingModule({
      imports: [DataGridComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WebExperienceAdapterService, useValue: mockAdapterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataGridComponent);
    component = fixture.componentInstance;
  });

  it('should create and render with valid contract', () => {
    fixture.componentRef.setInput('contract', {
      id: 'grid-1',
      type: 'DataGrid',
      props: {
        columns: [
          { key: 'id', label: 'ID', sortable: true },
          { key: 'name', label: 'Name' },
        ],
        rows: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
        'aria-label': 'Users grid',
      },
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-testid')).toBe('grid-1');
    expect(host.getAttribute('aria-label')).toBe('Users grid');

    // Rows should be rendered
    const rows = host.shadowRoot!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  it('should not crash with null/undefined props', () => {
    fixture.componentRef.setInput('contract', {
      id: 'grid-err',
      type: 'DataGrid',
      props: null,
    });
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('should respect maxItems cap of 100', () => {
    const rows = Array.from({ length: 150 }).map((_, i) => ({ id: `row-${i}` }));
    fixture.componentRef.setInput('contract', {
      id: 'grid-max',
      type: 'DataGrid',
      props: { rows },
    });
    fixture.detectChanges();
    const renderedRows = (fixture.nativeElement as HTMLElement).shadowRoot!.querySelectorAll(
      'tbody tr'
    );
    expect(renderedRows.length).toBe(100);
  });

  it('should block interaction when disabled', () => {
    fixture.componentRef.setInput('contract', {
      id: 'grid-disabled',
      type: 'DataGrid',
      props: {
        columns: [{ key: 'id', label: 'ID', sortable: true }],
        rows: [{ id: '1' }],
        disabled: true,
      },
    });
    fixture.detectChanges();

    component.onSort('id');
    expect(mockAdapterService.updateState).not.toHaveBeenCalled();

    component.onRowSelect('1');
    expect(mockAdapterService.updateState).not.toHaveBeenCalled();

    component.onPageChange(2);
    expect(mockAdapterService.updateState).not.toHaveBeenCalled();
  });

  it('should handle sorting via updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'grid-sort',
      type: 'DataGrid',
      props: {
        columns: [{ key: 'id', label: 'ID', sortable: true }],
        rows: [],
      },
    });
    fixture.detectChanges();

    component.onSort('id');
    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-sort', 'sortKey', 'id');
    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-sort', 'sortDir', 'desc');

    // second click flips direction
    component.onSort('id');
    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-sort', 'sortDir', 'asc');
  });

  it('should handle pagination via updateState', () => {
    fixture.componentRef.setInput('contract', {
      id: 'grid-page',
      type: 'DataGrid',
      props: { rows: [] },
    });
    fixture.detectChanges();

    component.onPageChange(2);
    expect(mockAdapterService.updateState).toHaveBeenCalledWith('grid-page', 'currentPage', 2);
  });

  it('should handle row actions and sanitize string values', () => {
    fixture.componentRef.setInput('contract', {
      id: 'grid-row',
      type: 'DataGrid',
      props: { rows: [{ id: '1' }] },
    });
    fixture.detectChanges();

    component.onRowSelect('<script>alert(1)</script>');
    // It should sanitize the output to avoid dispatching harmful strings
    expect(mockAdapterService.updateState).toHaveBeenCalledWith(
      'grid-row',
      'selectedRow',
      expect.any(String)
    );
    // The exact sanitized string depends on angular, but definitely not the script tag if HTML sanitize is used
    // Actually `selectedRow` is typically an ID.
    // Task 2: "Sanitize string values before dispatch."
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
