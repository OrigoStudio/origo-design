import {
  Component,
  input,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  SecurityContext,
  signal,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { InteractionContract } from '@origo/core';
import { OrigoAdapter } from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface DataGridProps {
  columns?: Array<{ key: string; label: string; sortable?: boolean }>;
  rows?: Array<Record<string, unknown>>;
  pageSize?: number;
  currentPage?: number;
  totalRows?: number;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

@Component({
  selector: 'origo-data-grid',
  standalone: true,
  imports: [JsonPipe],
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-data-grid]': 'true',
    '[attr.data-testid]': 'contract().id',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[attr.aria-describedby]': 'computedAriaDescribedBy()',
  },
})
export class DataGridComponent implements OrigoAdapter<DataGridProps> {
  static readonly contractSchema = {
    columns: 'array',
    rows: 'array',
    pageSize: 'number',
    currentPage: 'number',
    totalRows: 'number',
    disabled: 'boolean',
  };
  static readonly strictContract = false;

  contract = input.required<InteractionContract<DataGridProps>>();

  private experienceAdapter = inject(WebExperienceAdapterService);
  private sanitizer = inject(DomSanitizer);

  // Track sort direction locally for toggling
  sortDir = signal<'asc' | 'desc'>('asc');
  currentSortKey = signal<string | null>(null);

  computedColumns = computed(() => {
    const cols = this.contract().props?.columns;
    return Array.isArray(cols)
      ? cols.filter(c => c != null && c.key != null && c.label != null)
      : [];
  });

  computedRows = computed(() => {
    const rows = this.contract().props?.rows;
    if (!Array.isArray(rows)) return [];
    const validRows = rows.filter(r => r != null);

    const pageSize = this.contract().props?.pageSize;
    let currentPage = this.contract().props?.currentPage;

    if (typeof pageSize !== 'number' || pageSize <= 0) {
      return validRows.slice(0, 100); // no pagination cap if pageSize is invalid, but cap at 100 to prevent huge rendering
    }

    if (typeof currentPage !== 'number' || currentPage < 1) {
      currentPage = 1;
    }

    const startIndex = (currentPage - 1) * pageSize;
    return validRows.slice(startIndex, startIndex + pageSize);
  });

  computedTotalRows = computed(() => {
    const totalRows = this.contract().props?.totalRows;
    if (typeof totalRows === 'number' && totalRows >= 0) return totalRows;
    const rows = this.contract().props?.rows;
    return Array.isArray(rows) ? rows.length : 0;
  });

  computedCurrentPage = computed(() => {
    const cp = this.contract().props?.currentPage;
    return typeof cp === 'number' && cp >= 1 ? cp : 1;
  });

  computedTotalPages = computed(() => {
    const pageSize = this.contract().props?.pageSize;
    if (typeof pageSize !== 'number' || pageSize <= 0) return 1;
    return Math.max(1, Math.ceil(this.computedTotalRows() / pageSize));
  });

  computedDisabled = computed(() => !!this.contract().props?.disabled);

  computedAriaLabel = computed(() => {
    const label = this.contract().props?.['aria-label'];
    return label !== undefined && label !== null ? String(label) : undefined;
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.contract().props?.['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  onSort(key: string) {
    if (this.computedDisabled()) return;

    if (this.currentSortKey() === key) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.currentSortKey.set(key);
      this.sortDir.set('desc');
    }

    this.experienceAdapter.updateState(this.contract().id, 'sortKey', key);
    this.experienceAdapter.updateState(this.contract().id, 'sortDir', this.sortDir());
  }

  onPageChange(page: number) {
    if (this.computedDisabled() || !Number.isInteger(page) || page < 1) return;
    this.experienceAdapter.updateState(this.contract().id, 'currentPage', page);
  }

  onRowSelect(rowId: unknown) {
    if (this.computedDisabled() || rowId == null) return;

    const rawValue = String(rowId);
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, rawValue);
    const sanitizedValue =
      sanitized != null && sanitized !== '' ? sanitized : rawValue.replace(/[<>]/g, '');

    this.experienceAdapter.updateState(this.contract().id, 'selectedRow', sanitizedValue);
  }

  isObject(val: unknown): boolean {
    return typeof val === 'object' && val !== null;
  }
}
