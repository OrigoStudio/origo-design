import {
  H as __element,
  d as __nextContext,
  I as __property,
  K as __elementStart,
  f as __text,
  L as __elementEnd,
  h as __advance,
  i as __textInterpolate,
  n as input,
  M as viewChild,
  V as ViewContainerRef,
  p as computed,
  q as __defineComponent,
  l as __conditionalCreate,
  N as __elementContainer,
  m as __conditional,
  k as __attribute,
  j as __classProp,
  O as __viewQuerySignal,
  P as __queryAdvance,
} from './index-jUtR0za3.js';
import { LabelComponent } from './label.component-Br6ihBTl.js';

const _c0 = ['vc'];
function FormFieldComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    __element(0, 'origo-label', 1);
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext();
    __property('contract', ctx_r0.labelContract());
  }
}
function FormFieldComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    __elementStart(0, 'div', 3);
    __text(1);
    __elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext();
    __advance();
    __textInterpolate(ctx_r0.computedError());
  }
}
function FormFieldComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    __elementStart(0, 'div', 4);
    __text(1);
    __elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext();
    __advance();
    __textInterpolate(ctx_r0.computedHint());
  }
}
class FormFieldComponent {
  static contractSchema = {
    label: 'string',
    error: 'string',
    hint: 'string',
    required: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  vc = viewChild.required('vc', {
    ...(false ? { debugName: 'vc' } : /* istanbul ignore next */ {}),
    read: ViewContainerRef,
  });
  computedLabel = computed(
    () => this.contract().props?.label,
    ...(false ? [{ debugName: 'computedLabel' }] : /* istanbul ignore next */ [])
  );
  computedError = computed(
    () => this.contract().props?.error,
    ...(false ? [{ debugName: 'computedError' }] : /* istanbul ignore next */ [])
  );
  computedHint = computed(
    () => this.contract().props?.hint,
    ...(false ? [{ debugName: 'computedHint' }] : /* istanbul ignore next */ [])
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
  labelContract = computed(
    () => {
      const parentId = this.contract().id;
      const childId = this.contract().children?.[0]?.id;
      return {
        id: `${parentId}-label`,
        type: 'Label',
        props: {
          text: this.computedLabel(),
          required: this.computedRequired(),
          for: childId,
        },
      };
    },
    ...(false ? [{ debugName: 'labelContract' }] : /* istanbul ignore next */ [])
  );
  static ɵfac = function FormFieldComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || FormFieldComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: FormFieldComponent,
    selectors: [['origo-form-field']],
    viewQuery: function FormFieldComponent_Query(rf, ctx) {
      if (rf & 1) {
        __viewQuerySignal(ctx.vc, _c0, 5, ViewContainerRef);
      }
      if (rf & 2) {
        __queryAdvance();
      }
    },
    hostVars: 8,
    hostBindings: function FormFieldComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '')(
          'role',
          ctx.computedAriaLabel() ? 'group' : null
        )('aria-label', ctx.computedAriaLabel())('aria-describedby', ctx.computedAriaDescribedBy());
        __classProp('origo-form-field', true)('has-error', !!ctx.computedError());
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 6,
    vars: 2,
    consts: [
      ['vc', ''],
      [3, 'contract'],
      [1, 'form-field-control'],
      ['role', 'alert', 1, 'form-field-error'],
      [1, 'form-field-hint'],
    ],
    template: function FormFieldComponent_Template(rf, ctx) {
      if (rf & 1) {
        __conditionalCreate(0, FormFieldComponent_Conditional_0_Template, 1, 1, 'origo-label', 1);
        __elementStart(1, 'div', 2);
        __elementContainer(2, null, 0);
        __elementEnd();
        __conditionalCreate(4, FormFieldComponent_Conditional_4_Template, 2, 1, 'div', 3)(
          5,
          FormFieldComponent_Conditional_5_Template,
          2,
          1,
          'div',
          4
        );
      }
      if (rf & 2) {
        __conditional(ctx.computedLabel() ? 0 : -1);
        __advance(4);
        __conditional(ctx.computedError() ? 4 : ctx.computedHint() ? 5 : -1);
      }
    },
    dependencies: [LabelComponent],
    styles: [
      ':host {\n  display: flex;\n  flex-direction: column;\n  box-sizing: border-box;\n  margin-bottom: var(--origo-spacing-container-padding, 16px);\n}\n\n.form-field-control {\n  display: flex;\n  flex-direction: column;\n}\n\n.form-field-error,\n.form-field-hint {\n  font-family: var(--origo-typography-input-font-family, inherit);\n  font-size: var(--origo-typography-input-helper-font-size, 0.875rem);\n  margin-top: var(--origo-spacing-xs, 4px);\n}\n\n.form-field-error {\n  color: var(--origo-color-error, #d32f2f);\n}\n\n.form-field-hint {\n  color: var(--origo-color-text-secondary, #666);\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { FormFieldComponent };
//# sourceMappingURL=form-field.component-Bjh5iy8N.js.map
