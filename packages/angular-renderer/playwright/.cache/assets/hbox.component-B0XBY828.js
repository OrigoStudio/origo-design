import {
  n as input,
  M as viewChild,
  V as ViewContainerRef,
  p as computed,
  q as __defineComponent,
  Q as __domElementContainer,
  k as __attribute,
  R as __styleProp,
  j as __classProp,
  O as __viewQuerySignal,
  P as __queryAdvance,
} from './index-jUtR0za3.js';

const _c0 = ['vc'];
class HBoxComponent {
  static contractSchema = {
    gap: 'string',
    alignment: 'string',
    padding: 'string',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  vc = viewChild.required('vc', {
    ...(false ? { debugName: 'vc' } : /* istanbul ignore next */ {}),
    read: ViewContainerRef,
  });
  computedGap = computed(
    () => {
      const gap = this.contract().props?.gap;
      if (gap === void 0 || gap === null || gap === '') return void 0;
      const num = Number(gap);
      return !isNaN(num) ? `${num}px` : String(gap);
    },
    ...(false ? [{ debugName: 'computedGap' }] : /* istanbul ignore next */ [])
  );
  computedAlignment = computed(
    () => {
      const align = this.contract().props?.alignment;
      switch (align) {
        case 'start':
          return 'flex-start';
        case 'end':
          return 'flex-end';
        case 'center':
          return 'center';
        case 'stretch':
          return 'stretch';
        default:
          return 'stretch';
      }
    },
    ...(false ? [{ debugName: 'computedAlignment' }] : /* istanbul ignore next */ [])
  );
  computedPadding = computed(
    () => {
      const padding = this.contract().props?.padding;
      if (padding === void 0 || padding === null || padding === '') return void 0;
      const num = Number(padding);
      return !isNaN(num) ? `${num}px` : String(padding);
    },
    ...(false ? [{ debugName: 'computedPadding' }] : /* istanbul ignore next */ [])
  );
  computedAriaLabel = computed(
    () => {
      const label = this.contract().props?.['aria-label'];
      return label !== void 0 && label !== null && String(label).trim() !== ''
        ? String(label)
        : void 0;
    },
    ...(false ? [{ debugName: 'computedAriaLabel' }] : /* istanbul ignore next */ [])
  );
  computedAriaDescribedBy = computed(
    () => {
      const desc = this.contract().props?.['aria-describedby'];
      return desc !== void 0 && desc !== null && String(desc).trim() !== '' ? String(desc) : void 0;
    },
    ...(false ? [{ debugName: 'computedAriaDescribedBy' }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function HBoxComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HBoxComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: HBoxComponent,
    selectors: [['origo-hbox']],
    viewQuery: function HBoxComponent_Query(rf, ctx) {
      if (rf & 1) {
        __viewQuerySignal(ctx.vc, _c0, 5, ViewContainerRef);
      }
      if (rf & 2) {
        __queryAdvance();
      }
    },
    hostVars: 13,
    hostBindings: function HBoxComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '')('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __styleProp('gap', ctx.computedGap())('align-items', ctx.computedAlignment())(
          'padding-inline',
          ctx.computedPadding()
        )('padding-block', ctx.computedPadding());
        __classProp('origo-hbox', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 2,
    vars: 0,
    consts: [['vc', '']],
    template: function HBoxComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementContainer(0, null, 0);
      }
    },
    styles: [':host {\n  display: flex;\n  flex-direction: row;\n  box-sizing: border-box;\n}'],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { HBoxComponent };
//# sourceMappingURL=hbox.component-B0XBY828.js.map
