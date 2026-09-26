import {
  x as __domElement,
  d as __nextContext,
  v as __domProperty,
  T as __sanitizeHtml,
  a as __domElementStart,
  f as __text,
  g as __domElementEnd,
  h as __advance,
  i as __textInterpolate,
  ɵ as __getCurrentView,
  b as __domListener,
  c as __restoreView,
  e as __resetView,
  l as __conditionalCreate,
  j as __classProp,
  k as __attribute,
  m as __conditional,
  n as input,
  o as inject,
  D as DomSanitizer,
  p as computed,
  S as SecurityContext,
  q as __defineComponent,
  r as __repeaterCreate,
  t as __repeater,
} from './index-jUtR0za3.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

const _forTrack0 = ($index, $item) => $item.key;
function SidebarComponent_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElement(0, 'span', 3);
  }
  if (rf & 2) {
    const item_r2 = __nextContext().$implicit;
    __domProperty('innerHTML', item_r2.icon, __sanitizeHtml);
  }
}
function SidebarComponent_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'span', 4);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const item_r2 = __nextContext().$implicit;
    __advance();
    __textInterpolate(item_r2.label);
  }
}
function SidebarComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = __getCurrentView();
    __domElementStart(0, 'li', 1)(1, 'a', 2);
    __domListener('click', function SidebarComponent_For_2_Template_a_click_1_listener() {
      const item_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(ctx_r2.onItemClick(item_r2));
    })('keydown', function SidebarComponent_For_2_Template_a_keydown_1_listener($event) {
      const ctx_r3 = __restoreView(_r1);
      const item_r2 = ctx_r3.$implicit;
      const ɵ$index_3_r5 = ctx_r3.$index;
      const ctx_r2 = __nextContext();
      return __resetView(ctx_r2.onKeyDown($event, item_r2, ɵ$index_3_r5));
    });
    __conditionalCreate(2, SidebarComponent_For_2_Conditional_2_Template, 1, 1, 'span', 3);
    __conditionalCreate(3, SidebarComponent_For_2_Conditional_3_Template, 2, 1, 'span', 4);
    __domElementEnd()();
  }
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    const ctx_r2 = __nextContext();
    __advance();
    __classProp(
      'origo-sidebar__link--active',
      ctx_r2.computedActiveOutcome() === item_r2.outcomeRef
    );
    __attribute(
      'aria-current',
      ctx_r2.computedActiveOutcome() === item_r2.outcomeRef ? 'page' : null
    )('aria-label', ctx_r2.computedCollapsed() ? item_r2.label : null)(
      'title',
      ctx_r2.computedCollapsed() ? item_r2.label : null
    );
    __advance();
    __conditional(item_r2.icon ? 2 : -1);
    __advance();
    __conditional(!ctx_r2.computedCollapsed() ? 3 : -1);
  }
}
class SidebarComponent {
  static contractSchema = {
    items: 'array',
    collapsed: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  experienceAdapter = inject(WebExperienceAdapterService);
  sanitizer = inject(DomSanitizer);
  computedCollapsed = computed(
    () => !!this.contract().props?.collapsed,
    ...(false ? [{ debugName: 'computedCollapsed' }] : /* istanbul ignore next */ [])
  );
  computedAriaLabel = computed(
    () => {
      const label = this.contract().props?.['aria-label'];
      return label !== void 0 && label !== null ? String(label) : 'Sidebar';
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
  computedItems = computed(
    () => {
      const items = this.contract().props?.items;
      if (!Array.isArray(items)) return [];
      return items
        .filter(
          item => item != null && item.key != null && item.label != null && item.outcomeRef != null
        )
        .map(item => {
          return {
            key: String(item.key),
            label:
              this.sanitizer.sanitize(SecurityContext.HTML, String(item.label)) ||
              String(item.label).replace(/[<>]/g, ''),
            icon: item.icon
              ? this.sanitizer.sanitize(SecurityContext.HTML, String(item.icon)) ||
                String(item.icon).replace(/[<>]/g, '')
              : void 0,
            outcomeRef: String(item.outcomeRef),
          };
        });
    },
    ...(false ? [{ debugName: 'computedItems' }] : /* istanbul ignore next */ [])
  );
  computedActiveOutcome = computed(
    () => this.contract().props?.activeOutcome,
    ...(false ? [{ debugName: 'computedActiveOutcome' }] : /* istanbul ignore next */ [])
  );
  onItemClick(item) {
    if (!item.outcomeRef) return;
    this.experienceAdapter.updateState(this.contract().id, 'activeOutcome', item.outcomeRef);
  }
  onKeyDown(event, item, index) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onItemClick(item);
      return;
    }
    const host = event.target;
    const links = Array.from(
      host.closest('.origo-sidebar__list')?.querySelectorAll('.origo-sidebar__link') || []
    );
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = links[index + 1];
      if (next) next.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = links[index - 1];
      if (prev) prev.focus();
    }
  }
  static ɵfac = function SidebarComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SidebarComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: SidebarComponent,
    selectors: [['origo-sidebar']],
    hostAttrs: ['role', 'navigation'],
    hostVars: 7,
    hostBindings: function SidebarComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id)('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __classProp('origo-sidebar', true)('origo-sidebar--collapsed', ctx.computedCollapsed());
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 3,
    vars: 0,
    consts: [
      [1, 'origo-sidebar__list'],
      [1, 'origo-sidebar__item'],
      ['href', 'javascript:void(0)', 1, 'origo-sidebar__link', 3, 'click', 'keydown'],
      [1, 'origo-sidebar__icon', 3, 'innerHTML'],
      [1, 'origo-sidebar__label'],
    ],
    template: function SidebarComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'ul', 0);
        __repeaterCreate(1, SidebarComponent_For_2_Template, 4, 7, 'li', 1, _forTrack0);
        __domElementEnd();
      }
      if (rf & 2) {
        __advance();
        __repeater(ctx.computedItems());
      }
    },
    styles: [
      ':host {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  width: var(--sidebar-width, 250px);\n  background-color: var(--color-surface, #ffffff);\n  border-inline-end: 1px solid var(--color-border, #e0e0e0);\n  transition: width 0.3s ease;\n  overflow-y: auto;\n  overflow-x: hidden;\n}\n\n:host(.origo-sidebar--collapsed) {\n  width: var(--sidebar-collapsed-width, 64px);\n}\n\n.origo-sidebar__list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  gap: var(--spacing-sm, 4px);\n  padding-block: var(--spacing-md, 16px);\n}\n\n.origo-sidebar__item {\n  display: flex;\n}\n\n.origo-sidebar__link {\n  display: flex;\n  align-items: center;\n  padding-inline: var(--spacing-md, 16px);\n  padding-block: var(--spacing-sm, 8px);\n  text-decoration: none;\n  color: var(--color-text, #333333);\n  width: 100%;\n  border-inline-start: 4px solid transparent;\n  transition: background-color 0.2s, border-color 0.2s;\n}\n.origo-sidebar__link:hover, .origo-sidebar__link:focus-visible {\n  background-color: var(--color-surface-hover, #f5f5f5);\n  outline: none;\n}\n.origo-sidebar__link.origo-sidebar__link--active {\n  background-color: var(--color-primary-light, #e3f2fd);\n  color: var(--color-primary, #1976d2);\n  border-inline-start-color: var(--color-primary, #1976d2);\n  font-weight: 500;\n}\n\n.origo-sidebar__icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  margin-inline-end: var(--spacing-md, 16px);\n  flex-shrink: 0;\n}\n\n.origo-sidebar__label {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { SidebarComponent };
//# sourceMappingURL=sidebar.component-DJrFwiel.js.map
