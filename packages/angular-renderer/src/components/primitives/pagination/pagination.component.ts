import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
  computed,
  ViewEncapsulation,
  inject,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { InteractionContract } from '@origostudio/core';
import {
  OrigoAdapter,
  ContainerComponent as IContainerComponent,
  coerceContractProps,
} from '../../../adapters/web/adapter';
import { WebExperienceAdapterService } from '../../../adapters/web/experience-adapter.service';

export interface PageChangeEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

export interface RowsChangeEvent {
  rows: number;
  first: number;
}

export interface PaginationProps {
  first?: number;
  rows?: number;
  totalRecords?: number;
  pageLinkSize?: number;
  rowsPerPageOptions?: number[];
  showFirstLastIcon?: boolean;
  showPageLinks?: boolean;
  template?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: string;
  permissions?: Record<string, string>;
  rules?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const PaginationContractSchema: Record<
  keyof PaginationProps,
  'string' | 'number' | 'boolean' | 'array' | 'object'
> = {
  first: 'number',
  rows: 'number',
  totalRecords: 'number',
  pageLinkSize: 'number',
  rowsPerPageOptions: 'array',
  showFirstLastIcon: 'boolean',
  showPageLinks: 'boolean',
  template: 'string',
  disabled: 'boolean',
  size: 'string',
  variant: 'string',
  permissions: 'object',
  rules: 'object',
  metadata: 'object',
  'aria-label': 'string',
  'aria-describedby': 'string',
};

@Component({
  selector: 'origo-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
  host: {
    '[class.origo-pagination]': 'true',
    '[attr.data-testid]': 'contract().id',
  },
})
export class PaginationComponent implements OrigoAdapter<PaginationProps>, IContainerComponent {
  static readonly contractSchema = PaginationContractSchema;
  static readonly strictContract = false;

  contract = input.required<InteractionContract<PaginationProps>>();
  vc = viewChild.required('vc', { read: ViewContainerRef });

  pageChange = output<PageChangeEvent>();
  rowsChange = output<RowsChangeEvent>();

  private experienceAdapter = inject(WebExperienceAdapterService);

  protected props = computed(() =>
    coerceContractProps<PaginationProps>(this.contract().props, PaginationContractSchema)
  );

  computedFirst = computed(() => {
    const f = Number(this.props().first ?? 0);
    return isNaN(f) || f < 0 ? 0 : f;
  });

  computedRows = computed(() => {
    const r = Number(this.props().rows ?? 10);
    return isNaN(r) || r <= 0 ? 10 : r;
  });

  computedTotalRecords = computed(() => {
    const t = Number(this.props().totalRecords ?? 0);
    return isNaN(t) || t < 0 ? 0 : t;
  });

  computedPageLinkSize = computed(() => {
    const s = Number(this.props().pageLinkSize ?? 5);
    return isNaN(s) || s <= 0 ? 5 : s;
  });

  computedRowsPerPageOptions = computed<number[]>(() => {
    const opts = this.props().rowsPerPageOptions;
    if (!Array.isArray(opts)) return [];
    return opts.map(item => Number(item)).filter(n => !isNaN(n) && n > 0);
  });

  computedShowFirstLastIcon = computed(() => {
    return this.props().showFirstLastIcon !== false;
  });

  computedShowPageLinks = computed(() => {
    return this.props().showPageLinks !== false;
  });

  computedDisabled = computed(() => {
    return !!this.props().disabled;
  });

  computedAriaLabel = computed(() => {
    const label = this.props()['aria-label'];
    return label !== undefined && label !== null ? String(label) : 'Pagination';
  });

  computedAriaDescribedBy = computed(() => {
    const desc = this.props()['aria-describedby'];
    return desc !== undefined && desc !== null ? String(desc) : undefined;
  });

  pageCount = computed(() => {
    const rows = this.computedRows();
    const total = this.computedTotalRecords();
    return rows > 0 ? Math.ceil(total / rows) : 0;
  });

  pageIndex = computed(() => {
    const rows = this.computedRows();
    const first = this.computedFirst();
    return rows > 0 ? Math.floor(first / rows) : 0;
  });

  isFirstPage = computed(() => {
    return this.pageIndex() <= 0;
  });

  isLastPage = computed(() => {
    const count = this.pageCount();
    return count === 0 || this.pageIndex() >= count - 1;
  });

  visiblePageLinks = computed<number[]>(() => {
    const totalPages = this.pageCount();
    const linkSize = this.computedPageLinkSize();

    if (totalPages <= 0) return [];
    if (totalPages <= linkSize) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    const current = this.pageIndex();
    const half = Math.floor(linkSize / 2);
    let start = Math.max(0, current - half);
    let end = start + linkSize - 1;

    if (end >= totalPages) {
      end = totalPages - 1;
      start = Math.max(0, end - linkSize + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  changePage(targetIndex: number) {
    if (this.computedDisabled()) return;

    const count = this.pageCount();
    const clampedIndex = Math.max(0, Math.min(targetIndex, Math.max(0, count - 1)));
    if (clampedIndex === this.pageIndex()) return;

    const rows = this.computedRows();
    const first = clampedIndex * rows;

    this.experienceAdapter.updateState(this.contract().id, 'first', first);

    const event: PageChangeEvent = {
      page: clampedIndex,
      first,
      rows,
      pageCount: count,
    };

    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'pageChange', event);
    }

    this.pageChange.emit(event);
  }

  onFirst() {
    this.changePage(0);
  }

  onPrevious() {
    this.changePage(this.pageIndex() - 1);
  }

  onNext() {
    this.changePage(this.pageIndex() + 1);
  }

  onLast() {
    this.changePage(this.pageCount() - 1);
  }

  onPageSelect(pageIndex: number) {
    this.changePage(pageIndex);
  }

  onRowsSelect(event: Event) {
    if (this.computedDisabled()) return;

    const target = event.target as HTMLSelectElement;
    const newRows = Number(target.value);
    if (isNaN(newRows) || newRows <= 0) return;

    this.experienceAdapter.updateState(this.contract().id, 'rows', newRows);
    this.experienceAdapter.updateState(this.contract().id, 'first', 0);

    const rowsEvent: RowsChangeEvent = {
      rows: newRows,
      first: 0,
    };

    const pageCount = newRows > 0 ? Math.ceil(this.computedTotalRecords() / newRows) : 0;
    const pageEvent: PageChangeEvent = {
      page: 0,
      first: 0,
      rows: newRows,
      pageCount,
    };

    const contractId = this.contract().id;
    if (contractId) {
      this.experienceAdapter.dispatchCapability(contractId, 'rowsChange', rowsEvent);
      this.experienceAdapter.dispatchCapability(contractId, 'pageChange', pageEvent);
    }

    this.rowsChange.emit(rowsEvent);
    this.pageChange.emit(pageEvent);
  }
}
