import {
  n as input,
  M as viewChild,
  V as ViewContainerRef,
  p as computed,
  q as __defineComponent,
  Q as __domElementContainer,
  x as __domElement,
  k as __attribute,
  R as __styleProp,
  j as __classProp,
  O as __viewQuerySignal,
  P as __queryAdvance,
} from './index-jUtR0za3.js';

const _c0 = ['vc'];
class VBoxComponent {
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
  static ɵfac = function VBoxComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || VBoxComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: VBoxComponent,
    selectors: [['origo-vbox']],
    viewQuery: function VBoxComponent_Query(rf, ctx) {
      if (rf & 1) {
        __viewQuerySignal(ctx.vc, _c0, 5, ViewContainerRef);
      }
      if (rf & 2) {
        __queryAdvance();
      }
    },
    hostVars: 13,
    hostBindings: function VBoxComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '')('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __styleProp('gap', ctx.computedGap())('align-items', ctx.computedAlignment())(
          'padding-inline',
          ctx.computedPadding()
        )('padding-block', ctx.computedPadding());
        __classProp('origo-vbox', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 3,
    vars: 0,
    consts: [['vc', '']],
    template: function VBoxComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementContainer(0, null, 0);
        __domElement(2, 'slot');
      }
    },
    styles: [':host {\n  display: flex;\n  flex-direction: column;\n  box-sizing: border-box;\n}'],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { VBoxComponent };
//# sourceMappingURL=vbox.component-CWurn6QW.js.map
