import {
  a as __domElementStart,
  f as __text,
  g as __domElementEnd,
  n as input,
  p as computed,
  q as __defineComponent,
  l as __conditionalCreate,
  k as __attribute,
  h as __advance,
  w as __textInterpolate1,
  m as __conditional,
  j as __classProp,
} from './index-jUtR0za3.js';

function LabelComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'span', 0);
    __text(1, '*');
    __domElementEnd();
  }
}
class LabelComponent {
  static contractSchema = {
    text: 'string',
    for: 'string',
    required: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  computedText = computed(
    () => this.contract().props?.text ?? '',
    ...(false ? [{ debugName: 'computedText' }] : /* istanbul ignore next */ [])
  );
  computedFor = computed(
    () => {
      const f = this.contract().props?.for;
      return f !== void 0 && f !== null ? String(f) : void 0;
    },
    ...(false ? [{ debugName: 'computedFor' }] : /* istanbul ignore next */ [])
  );
  computedRequired = computed(
    () => !!this.contract().props?.required,
    ...(false ? [{ debugName: 'computedRequired' }] : /* istanbul ignore next */ [])
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
  static ɵfac = function LabelComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || LabelComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: LabelComponent,
    selectors: [['origo-label']],
    hostVars: 3,
    hostBindings: function LabelComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '');
        __classProp('origo-label', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 3,
    vars: 5,
    consts: [['aria-hidden', 'true', 1, 'required-indicator']],
    template: function LabelComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'label');
        __text(1);
        __conditionalCreate(2, LabelComponent_Conditional_2_Template, 2, 0, 'span', 0);
        __domElementEnd();
      }
      if (rf & 2) {
        __attribute('for', ctx.computedFor())('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __advance();
        __textInterpolate1(' ', ctx.computedText(), ' ');
        __advance();
        __conditional(ctx.computedRequired() ? 2 : -1);
      }
    },
    styles: [
      ':host {\n  display: inline-block;\n}\n\nlabel {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--origo-spacing-xs, 4px);\n  font-family: var(--origo-typography-input-font-family, inherit);\n  font-size: var(--origo-typography-input-font-size, 1rem);\n  color: var(--origo-color-text-primary, #333);\n  margin-bottom: var(--origo-spacing-container-padding, 8px);\n}\n\n.required-indicator {\n  color: var(--origo-color-error, #d32f2f);\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { LabelComponent };
//# sourceMappingURL=label.component-Br6ihBTl.js.map
