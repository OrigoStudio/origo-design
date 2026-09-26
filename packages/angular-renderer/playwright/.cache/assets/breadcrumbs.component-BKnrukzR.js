import {
  ɵ as __getCurrentView,
  a as __domElementStart,
  b as __domListener,
  c as __restoreView,
  d as __nextContext,
  e as __resetView,
  f as __text,
  g as __domElementEnd,
  h as __advance,
  i as __textInterpolate,
  j as __classProp,
  k as __attribute,
  l as __conditionalCreate,
  m as __conditional,
  n as input,
  o as inject,
  D as DomSanitizer,
  p as computed,
  q as __defineComponent,
  r as __repeaterCreate,
  s as __repeaterTrackByIndex,
  t as __repeater,
} from './index-jUtR0za3.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

function BreadcrumbsComponent_For_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = __getCurrentView();
    __domElementStart(0, 'a', 5);
    __domListener(
      'click',
      function BreadcrumbsComponent_For_2_Conditional_1_Template_a_click_0_listener($event) {
        __restoreView(_r1);
        const ctx_r1 = __nextContext();
        const item_r3 = ctx_r1.$implicit;
        const ɵ$index_3_r4 = ctx_r1.$index;
        const ɵ$count_3_r5 = ctx_r1.$count;
        const ctx_r5 = __nextContext();
        return __resetView(ctx_r5.onItemClick($event, item_r3, ɵ$index_3_r4 === ɵ$count_3_r5 - 1));
      }
    );
    __domElementStart(1, 'span');
    __text(2);
    __domElementEnd()();
  }
  if (rf & 2) {
    const item_r3 = __nextContext().$implicit;
    __advance(2);
    __textInterpolate(item_r3.label);
  }
}
function BreadcrumbsComponent_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'span');
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = __nextContext();
    const item_r3 = ctx_r1.$implicit;
    const ɵ$index_3_r4 = ctx_r1.$index;
    const ɵ$count_3_r5 = ctx_r1.$count;
    __classProp('origo-breadcrumbs__current', ɵ$index_3_r4 === ɵ$count_3_r5 - 1);
    __attribute('aria-current', ɵ$index_3_r4 === ɵ$count_3_r5 - 1 ? 'page' : null);
    __advance();
    __textInterpolate(item_r3.label);
  }
}
function BreadcrumbsComponent_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'span', 4);
    __text(1, '/');
    __domElementEnd();
  }
}
function BreadcrumbsComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'li', 1);
    __conditionalCreate(1, BreadcrumbsComponent_For_2_Conditional_1_Template, 3, 1, 'a', 2)(
      2,
      BreadcrumbsComponent_For_2_Conditional_2_Template,
      2,
      4,
      'span',
      3
    );
    __conditionalCreate(3, BreadcrumbsComponent_For_2_Conditional_3_Template, 2, 0, 'span', 4);
    __domElementEnd();
  }
  if (rf & 2) {
    const item_r3 = ctx.$implicit;
    const ɵ$index_3_r4 = ctx.$index;
    const ɵ$count_3_r5 = ctx.$count;
    __advance();
    __conditional(!(ɵ$index_3_r4 === ɵ$count_3_r5 - 1) && item_r3.outcomeRef ? 1 : 2);
    __advance(2);
    __conditional(!(ɵ$index_3_r4 === ɵ$count_3_r5 - 1) ? 3 : -1);
  }
}
class BreadcrumbsComponent {
  static contractSchema = {
    items: 'array',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  experienceAdapter = inject(WebExperienceAdapterService);
  sanitizer = inject(DomSanitizer);
  computedAriaLabel = computed(
    () => {
      const label = this.contract().props?.['aria-label'];
      return label !== void 0 && label !== null ? String(label) : 'Breadcrumbs';
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
        .filter(item => item != null && item.label != null)
        .map(item => {
          return {
            label: String(item.label),
            outcomeRef: item.outcomeRef ? String(item.outcomeRef) : void 0,
          };
        });
    },
    ...(false ? [{ debugName: 'computedItems' }] : /* istanbul ignore next */ [])
  );
  onItemClick(event, item, isLast) {
    if (isLast || !item.outcomeRef) {
      event.preventDefault();
      return;
    }
    this.experienceAdapter.updateState(this.contract().id, 'activeOutcome', item.outcomeRef);
  }
  static ɵfac = function BreadcrumbsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || BreadcrumbsComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: BreadcrumbsComponent,
    selectors: [['origo-breadcrumbs']],
    hostAttrs: ['role', 'navigation'],
    hostVars: 5,
    hostBindings: function BreadcrumbsComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id)('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __classProp('origo-breadcrumbs', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 3,
    vars: 0,
    consts: [
      [1, 'origo-breadcrumbs__list'],
      [1, 'origo-breadcrumbs__item'],
      ['href', 'javascript:void(0)', 1, 'origo-breadcrumbs__link'],
      [3, 'origo-breadcrumbs__current'],
      ['aria-hidden', 'true', 1, 'origo-breadcrumbs__separator'],
      ['href', 'javascript:void(0)', 1, 'origo-breadcrumbs__link', 3, 'click'],
    ],
    template: function BreadcrumbsComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'ol', 0);
        __repeaterCreate(
          1,
          BreadcrumbsComponent_For_2_Template,
          4,
          2,
          'li',
          1,
          __repeaterTrackByIndex
        );
        __domElementEnd();
      }
      if (rf & 2) {
        __advance();
        __repeater(ctx.computedItems());
      }
    },
    styles: [
      ':host {\n  display: block;\n}\n\n.origo-breadcrumbs__list {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  gap: var(--spacing-sm, 8px);\n}\n\n.origo-breadcrumbs__item {\n  display: flex;\n  align-items: center;\n  font-size: 14px;\n}\n\n.origo-breadcrumbs__link {\n  color: var(--color-primary, #1976d2);\n  text-decoration: none;\n}\n.origo-breadcrumbs__link:hover, .origo-breadcrumbs__link:focus-visible {\n  text-decoration: underline;\n  outline-offset: 2px;\n}\n\n.origo-breadcrumbs__current {\n  color: var(--color-text-secondary, #666666);\n  font-weight: 500;\n}\n\n.origo-breadcrumbs__separator {\n  color: var(--color-text-hint, #999999);\n  margin-inline-start: var(--spacing-sm, 8px);\n  user-select: none;\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { BreadcrumbsComponent };
//# sourceMappingURL=breadcrumbs.component-BKnrukzR.js.map
