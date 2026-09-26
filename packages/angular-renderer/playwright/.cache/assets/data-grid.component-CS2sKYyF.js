import {
  ɵ as __getCurrentView,
  a as __domElementStart,
  b as __domListener,
  c as __restoreView,
  d as __nextContext,
  e as __resetView,
  f as __text,
  g as __domElementEnd,
  j as __classProp,
  k as __attribute,
  h as __advance,
  w as __textInterpolate1,
  C as __pipe,
  i as __textInterpolate,
  E as __pipeBind1,
  r as __repeaterCreate,
  t as __repeater,
  v as __domProperty,
  F as __textInterpolate2,
  n as input,
  o as inject,
  D as DomSanitizer,
  G as signal,
  p as computed,
  S as SecurityContext,
  q as __defineComponent,
  J as JsonPipe,
  l as __conditionalCreate,
  m as __conditional,
} from './index-jUtR0za3.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

const _forTrack0 = ($index, $item) => $item.key;
const _forTrack1 = ($index, $item) => $item['id'] ?? $index;
function DataGridComponent_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = __getCurrentView();
    __domElementStart(0, 'th', 4);
    __domListener('click', function DataGridComponent_For_5_Template_th_click_0_listener() {
      const col_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(col_r2.sortable ? ctx_r2.onSort(col_r2.key) : null);
    })('keydown.enter', function DataGridComponent_For_5_Template_th_keydown_enter_0_listener() {
      const col_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(col_r2.sortable ? ctx_r2.onSort(col_r2.key) : null);
    })('keydown.space', function DataGridComponent_For_5_Template_th_keydown_space_0_listener() {
      const col_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(col_r2.sortable ? ctx_r2.onSort(col_r2.key) : null);
    });
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const col_r2 = ctx.$implicit;
    const ctx_r2 = __nextContext();
    __classProp('sortable', col_r2.sortable);
    __attribute(
      'aria-sort',
      col_r2.sortable && ctx_r2.currentSortKey() === col_r2.key
        ? ctx_r2.sortDir() === 'asc'
          ? 'ascending'
          : 'descending'
        : null
    )('tabindex', col_r2.sortable ? 0 : null)('role', col_r2.sortable ? 'button' : null);
    __advance();
    __textInterpolate1(' ', col_r2.label, ' ');
  }
}
function DataGridComponent_For_8_For_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'td');
    __text(1);
    __pipe(2, 'json');
    __domElementEnd();
  }
  if (rf & 2) {
    const col_r10 = ctx.$implicit;
    const row_r6 = __nextContext().$implicit;
    const ctx_r2 = __nextContext();
    __advance();
    __textInterpolate(
      ctx_r2.isObject(row_r6[col_r10.key])
        ? __pipeBind1(2, 1, row_r6[col_r10.key])
        : row_r6[col_r10.key]
    );
  }
}
function DataGridComponent_For_8_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = __getCurrentView();
    __domElementStart(0, 'tr', 5);
    __domListener('click', function DataGridComponent_For_8_Template_tr_click_0_listener() {
      const ctx_r4 = __restoreView(_r4);
      const row_r6 = ctx_r4.$implicit;
      const $index_r7 = ctx_r4.$index;
      const ctx_r2 = __nextContext();
      return __resetView(
        ctx_r2.onRowSelect(row_r6['id'] ?? row_r6['key'] ?? row_r6['_id'] ?? $index_r7)
      );
    })('keydown.enter', function DataGridComponent_For_8_Template_tr_keydown_enter_0_listener() {
      const ctx_r7 = __restoreView(_r4);
      const row_r6 = ctx_r7.$implicit;
      const $index_r7 = ctx_r7.$index;
      const ctx_r2 = __nextContext();
      return __resetView(
        ctx_r2.onRowSelect(row_r6['id'] ?? row_r6['key'] ?? row_r6['_id'] ?? $index_r7)
      );
    })('keydown.space', function DataGridComponent_For_8_Template_tr_keydown_space_0_listener() {
      const ctx_r8 = __restoreView(_r4);
      const row_r6 = ctx_r8.$implicit;
      const $index_r7 = ctx_r8.$index;
      const ctx_r2 = __nextContext();
      return __resetView(
        ctx_r2.onRowSelect(row_r6['id'] ?? row_r6['key'] ?? row_r6['_id'] ?? $index_r7)
      );
    });
    __repeaterCreate(1, DataGridComponent_For_8_For_2_Template, 3, 3, 'td', null, _forTrack0);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = __nextContext();
    __advance();
    __repeater(ctx_r2.computedColumns());
  }
}
function DataGridComponent_Conditional_9_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = __getCurrentView();
    __domElementStart(0, 'div', 3)(1, 'button', 6);
    __domListener(
      'click',
      function DataGridComponent_Conditional_9_Template_button_click_1_listener() {
        __restoreView(_r11);
        const ctx_r2 = __nextContext();
        return __resetView(ctx_r2.onPageChange(ctx_r2.computedCurrentPage() - 1));
      }
    );
    __text(2, ' Previous ');
    __domElementEnd();
    __domElementStart(3, 'span', 7);
    __text(4);
    __domElementEnd();
    __domElementStart(5, 'button', 8);
    __domListener(
      'click',
      function DataGridComponent_Conditional_9_Template_button_click_5_listener() {
        __restoreView(_r11);
        const ctx_r2 = __nextContext();
        return __resetView(ctx_r2.onPageChange(ctx_r2.computedCurrentPage() + 1));
      }
    );
    __text(6, ' Next ');
    __domElementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = __nextContext();
    __advance();
    __domProperty('disabled', ctx_r2.computedCurrentPage() <= 1 || ctx_r2.computedDisabled());
    __advance(3);
    __textInterpolate2(
      ' Page ',
      ctx_r2.computedCurrentPage(),
      ' of ',
      ctx_r2.computedTotalPages(),
      ' '
    );
    __advance();
    __domProperty(
      'disabled',
      ctx_r2.computedCurrentPage() >= ctx_r2.computedTotalPages() || ctx_r2.computedDisabled()
    );
  }
}
class DataGridComponent {
  static contractSchema = {
    columns: 'array',
    rows: 'array',
    pageSize: 'number',
    currentPage: 'number',
    totalRows: 'number',
    disabled: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  experienceAdapter = inject(WebExperienceAdapterService);
  sanitizer = inject(DomSanitizer);
  // Track sort direction locally for toggling
  sortDir = signal('asc', ...(false ? [{ debugName: 'sortDir' }] : /* istanbul ignore next */ []));
  currentSortKey = signal(
    null,
    ...(false ? [{ debugName: 'currentSortKey' }] : /* istanbul ignore next */ [])
  );
  computedColumns = computed(
    () => {
      const cols = this.contract().props?.columns;
      return Array.isArray(cols)
        ? cols.filter(c => c != null && c.key != null && c.label != null)
        : [];
    },
    ...(false ? [{ debugName: 'computedColumns' }] : /* istanbul ignore next */ [])
  );
  computedRows = computed(
    () => {
      const rows = this.contract().props?.rows;
      if (!Array.isArray(rows)) return [];
      const validRows = rows.filter(r => r != null);
      const pageSize = this.contract().props?.pageSize;
      let currentPage = this.contract().props?.currentPage;
      if (typeof pageSize !== 'number' || pageSize <= 0) {
        return validRows.slice(0, 100);
      }
      if (typeof currentPage !== 'number' || currentPage < 1) {
        currentPage = 1;
      }
      const startIndex = (currentPage - 1) * pageSize;
      return validRows.slice(startIndex, startIndex + pageSize);
    },
    ...(false ? [{ debugName: 'computedRows' }] : /* istanbul ignore next */ [])
  );
  computedTotalRows = computed(
    () => {
      const totalRows = this.contract().props?.totalRows;
      if (typeof totalRows === 'number' && totalRows >= 0) return totalRows;
      const rows = this.contract().props?.rows;
      return Array.isArray(rows) ? rows.length : 0;
    },
    ...(false ? [{ debugName: 'computedTotalRows' }] : /* istanbul ignore next */ [])
  );
  computedCurrentPage = computed(
    () => {
      const cp = this.contract().props?.currentPage;
      return typeof cp === 'number' && cp >= 1 ? cp : 1;
    },
    ...(false ? [{ debugName: 'computedCurrentPage' }] : /* istanbul ignore next */ [])
  );
  computedTotalPages = computed(
    () => {
      const pageSize = this.contract().props?.pageSize;
      if (typeof pageSize !== 'number' || pageSize <= 0) return 1;
      return Math.max(1, Math.ceil(this.computedTotalRows() / pageSize));
    },
    ...(false ? [{ debugName: 'computedTotalPages' }] : /* istanbul ignore next */ [])
  );
  computedDisabled = computed(
    () => !!this.contract().props?.disabled,
    ...(false ? [{ debugName: 'computedDisabled' }] : /* istanbul ignore next */ [])
  );
  computedAriaLabel = computed(
    () => {
      const label = this.contract().props?.['aria-label'];
      return label !== void 0 && label !== null ? String(label) : void 0;
    },
    ...(false ? [{ debugName: 'computedAriaLabel' }] : /* istanbul ignore next */ [])
  );
  computedAriaDescribedBy = computed(
    () => {
      const desc = this.contract().props?.['aria-describedby'];
      return desc !== void 0 && desc !== null ? String(desc) : void 0;
    },
    ...(false ? [{ debugName: 'computedAriaDescribedBy' }] : /* istanbul ignore next */ [])
  );
  onSort(key) {
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
  onPageChange(page) {
    if (this.computedDisabled() || !Number.isInteger(page) || page < 1) return;
    this.experienceAdapter.updateState(this.contract().id, 'currentPage', page);
  }
  onRowSelect(rowId) {
    if (this.computedDisabled() || rowId == null) return;
    const rawValue = String(rowId);
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, rawValue);
    const sanitizedValue =
      sanitized != null && sanitized !== '' ? sanitized : rawValue.replace(/[<>]/g, '');
    this.experienceAdapter.updateState(this.contract().id, 'selectedRow', sanitizedValue);
  }
  isObject(val) {
    return typeof val === 'object' && val !== null;
  }
  static ɵfac = function DataGridComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || DataGridComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: DataGridComponent,
    selectors: [['origo-data-grid']],
    hostVars: 5,
    hostBindings: function DataGridComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id)('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __classProp('origo-data-grid', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 10,
    vars: 4,
    consts: [
      [1, 'origo-data-grid-container'],
      [3, 'sortable'],
      ['tabindex', '0', 'role', 'button'],
      [1, 'origo-data-grid-pagination'],
      [3, 'click', 'keydown.enter', 'keydown.space'],
      ['tabindex', '0', 'role', 'button', 3, 'click', 'keydown.enter', 'keydown.space'],
      ['aria-label', 'Previous Page', 3, 'click', 'disabled'],
      [1, 'page-info'],
      ['aria-label', 'Next Page', 3, 'click', 'disabled'],
    ],
    template: function DataGridComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'div', 0)(1, 'table')(2, 'thead')(3, 'tr');
        __repeaterCreate(4, DataGridComponent_For_5_Template, 2, 6, 'th', 1, _forTrack0);
        __domElementEnd()();
        __domElementStart(6, 'tbody');
        __repeaterCreate(7, DataGridComponent_For_8_Template, 3, 0, 'tr', 2, _forTrack1);
        __domElementEnd()();
        __conditionalCreate(9, DataGridComponent_Conditional_9_Template, 7, 4, 'div', 3);
        __domElementEnd();
      }
      if (rf & 2) {
        __classProp('disabled', ctx.computedDisabled());
        __attribute('aria-describedby', ctx.computedAriaDescribedBy());
        __advance(4);
        __repeater(ctx.computedColumns());
        __advance(3);
        __repeater(ctx.computedRows());
        __advance(2);
        __conditional(ctx.computedTotalRows() > 0 ? 9 : -1);
      }
    },
    dependencies: [JsonPipe],
    styles: [
      ':host {\n  display: block;\n  width: 100%;\n}\n\n.origo-data-grid-container {\n  width: 100%;\n  overflow-x: auto;\n  border-radius: var(--origo-radius-sm, 4px);\n  border: 1px solid var(--origo-color-border-default, #ccc);\n  background-color: var(--origo-color-surface-background, #fff);\n}\n.origo-data-grid-container.disabled {\n  opacity: var(--origo-opacity-disabled, 0.5);\n  pointer-events: none;\n}\n\ntable {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: start;\n}\n\nth,\ntd {\n  padding-inline-start: var(--origo-spacing-container-padding, 16px);\n  padding-inline-end: var(--origo-spacing-container-padding, 16px);\n  padding-block: 12px;\n  border-bottom: 1px solid var(--origo-color-border-default, #ccc);\n  color: var(--origo-color-text-primary, #333);\n}\n\nth {\n  font-family: var(--origo-typography-input-font-family, inherit);\n  font-size: var(--origo-typography-input-font-size, 14px);\n  font-weight: 600;\n  text-align: start;\n}\nth.sortable {\n  cursor: pointer;\n}\nth.sortable:hover {\n  color: var(--origo-color-focus, #0056b3);\n}\n\ntr {\n  cursor: pointer;\n}\ntr:hover {\n  background-color: rgba(0, 0, 0, 0.04);\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { DataGridComponent };
//# sourceMappingURL=data-grid.component-CS2sKYyF.js.map
