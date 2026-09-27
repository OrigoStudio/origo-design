import {
  a as __domElementStart,
  f as __text,
  g as __domElementEnd,
  d as __nextContext,
  h as __advance,
  i as __textInterpolate,
  ɵ as __getCurrentView,
  b as __domListener,
  c as __restoreView,
  e as __resetView,
  l as __conditionalCreate,
  m as __conditional,
  n as input,
  o as inject,
  D as DomSanitizer,
  p as computed,
  S as SecurityContext,
  q as __defineComponent,
  r as __repeaterCreate,
  j as __classProp,
  t as __repeater,
  k as __attribute,
} from './index-DRoHZv2r.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-CJxHLpWN.js';

const _forTrack0 = ($index, $item) => $item['id'] ?? $item['key'] ?? $item['_id'] ?? $index;
function ListComponent_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'div', 4);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const item_r2 = __nextContext().$implicit;
    __advance();
    __textInterpolate(item_r2['title']);
  }
}
function ListComponent_For_2_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'div', 5);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const item_r2 = __nextContext().$implicit;
    __advance();
    __textInterpolate(item_r2['subtitle']);
  }
}
function ListComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = __getCurrentView();
    __domElementStart(0, 'div', 2);
    __domListener('click', function ListComponent_For_2_Template_div_click_0_listener() {
      const item_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(ctx_r2.onItemSelect(item_r2['id'] ?? item_r2['key'] ?? item_r2['_id']));
    })('keydown.enter', function ListComponent_For_2_Template_div_keydown_enter_0_listener() {
      const item_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(ctx_r2.onItemSelect(item_r2['id'] ?? item_r2['key'] ?? item_r2['_id']));
    })('keydown.space', function ListComponent_For_2_Template_div_keydown_space_0_listener() {
      const item_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(ctx_r2.onItemSelect(item_r2['id'] ?? item_r2['key'] ?? item_r2['_id']));
    });
    __domElementStart(1, 'div', 3);
    __conditionalCreate(2, ListComponent_For_2_Conditional_2_Template, 2, 1, 'div', 4);
    __conditionalCreate(3, ListComponent_For_2_Conditional_3_Template, 2, 1, 'div', 5);
    __domElementEnd()();
  }
  if (rf & 2) {
    const item_r2 = ctx.$implicit;
    __advance(2);
    __conditional(
      item_r2['title'] !== void 0 && item_r2['title'] !== null && item_r2['title'] !== '' ? 2 : -1
    );
    __advance();
    __conditional(
      item_r2['subtitle'] !== void 0 && item_r2['subtitle'] !== null && item_r2['subtitle'] !== ''
        ? 3
        : -1
    );
  }
}
class ListComponent {
  static contractSchema = {
    items: 'array',
    maxItems: 'number',
    disabled: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  experienceAdapter = inject(WebExperienceAdapterService);
  sanitizer = inject(DomSanitizer);
  computedItems = computed(
    () => {
      const items = this.contract().props?.items;
      if (!Array.isArray(items)) return [];
      const validItems = items.filter(i => i != null);
      let max = this.contract().props?.maxItems;
      if (typeof max !== 'number' || isNaN(max) || max <= 0) {
        max = 100;
      }
      return validItems.slice(0, max);
    },
    ...(false ? [{ debugName: 'computedItems' }] : /* istanbul ignore next */ [])
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
  onItemSelect(itemId) {
    if (this.computedDisabled() || itemId == null) return;
    const rawValue = String(itemId);
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, rawValue);
    const sanitizedValue =
      sanitized != null && sanitized !== '' ? sanitized : rawValue.replace(/[<>]/g, '');
    this.experienceAdapter.updateState(this.contract().id, 'selectedItem', sanitizedValue);
  }
  static ɵfac = function ListComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ListComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: ListComponent,
    selectors: [['origo-list']],
    hostVars: 6,
    hostBindings: function ListComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id)('role', 'list')(
          'aria-label',
          ctx.computedAriaLabel()
        )('aria-describedby', ctx.computedAriaDescribedBy());
        __classProp('origo-list', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 3,
    vars: 2,
    consts: [
      [1, 'origo-list-container'],
      ['role', 'listitem', 'tabindex', '0', 1, 'origo-list-item'],
      [
        'role',
        'listitem',
        'tabindex',
        '0',
        1,
        'origo-list-item',
        3,
        'click',
        'keydown.enter',
        'keydown.space',
      ],
      [1, 'origo-list-item-content'],
      [1, 'title'],
      [1, 'subtitle'],
    ],
    template: function ListComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'div', 0);
        __repeaterCreate(1, ListComponent_For_2_Template, 4, 2, 'div', 1, _forTrack0);
        __domElementEnd();
      }
      if (rf & 2) {
        __classProp('disabled', ctx.computedDisabled());
        __advance();
        __repeater(ctx.computedItems());
      }
    },
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { ListComponent };
//# sourceMappingURL=list.component-DSP5wzI4.js.map
