import {
  a as __domElementStart,
  f as __text,
  g as __domElementEnd,
  n as input,
  z as model,
  p as computed,
  o as inject,
  A as effect,
  B as untracked,
  q as __defineComponent,
  b as __domListener,
  l as __conditionalCreate,
  j as __classProp,
  v as __domProperty,
  h as __advance,
  k as __attribute,
  i as __textInterpolate,
  m as __conditional,
} from './index-jUtR0za3.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

function CheckboxComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'span', 3);
    __text(1, '*');
    __domElementEnd();
  }
}
class CheckboxComponent {
  static contractSchema = {
    checked: 'boolean',
    label: 'string',
    disabled: 'boolean',
    required: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  checked = model(false, ...(false ? [{ debugName: 'checked' }] : /* istanbul ignore next */ []));
  computedLabel = computed(
    () => this.contract().props?.label ?? '',
    ...(false ? [{ debugName: 'computedLabel' }] : /* istanbul ignore next */ [])
  );
  computedDisabled = computed(
    () => !!this.contract().props?.disabled,
    ...(false ? [{ debugName: 'computedDisabled' }] : /* istanbul ignore next */ [])
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
  experienceAdapter = inject(WebExperienceAdapterService);
  constructor() {
    effect(() => {
      const contractVal = !!this.contract().props?.checked;
      untracked(() => {
        if (contractVal === this.checked()) return;
        this.checked.set(contractVal);
      });
    });
  }
  onChange(event) {
    const target = event.target;
    if (!target || this.computedDisabled()) return;
    const isChecked = target.checked;
    this.checked.set(isChecked);
    this.experienceAdapter.updateState(this.contract().id, 'checked', isChecked);
  }
  static ɵfac = function CheckboxComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || CheckboxComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: CheckboxComponent,
    selectors: [['origo-checkbox']],
    hostVars: 3,
    hostBindings: function CheckboxComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '');
        __classProp('origo-checkbox', true);
      }
    },
    inputs: { contract: [1, 'contract'], checked: [1, 'checked'] },
    outputs: { checked: 'checkedChange' },
    decls: 5,
    vars: 11,
    consts: [
      [3, 'for'],
      ['type', 'checkbox', 3, 'change', 'id', 'disabled', 'required', 'checked'],
      [1, 'label-text'],
      ['aria-hidden', 'true', 1, 'required-indicator'],
    ],
    template: function CheckboxComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'label', 0)(1, 'input', 1);
        __domListener(
          'change',
          function CheckboxComponent_Template_input_change_1_listener($event) {
            return ctx.onChange($event);
          }
        );
        __domElementEnd();
        __domElementStart(2, 'span', 2);
        __text(3);
        __domElementEnd();
        __conditionalCreate(4, CheckboxComponent_Conditional_4_Template, 2, 0, 'span', 3);
        __domElementEnd();
      }
      if (rf & 2) {
        __classProp('disabled', ctx.computedDisabled());
        __domProperty('htmlFor', ctx.contract().id);
        __advance();
        __domProperty('id', ctx.contract().id)('disabled', ctx.computedDisabled())(
          'required',
          ctx.computedRequired()
        )('checked', ctx.checked());
        __attribute('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __advance(2);
        __textInterpolate(ctx.computedLabel());
        __advance();
        __conditional(ctx.computedRequired() ? 4 : -1);
      }
    },
    styles: [
      ':host {\n  display: block;\n}\n\nlabel {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--origo-spacing-container-padding, 8px);\n  cursor: pointer;\n  font-family: var(--origo-typography-input-font-family, inherit);\n  font-size: var(--origo-typography-input-font-size, 1rem);\n  color: var(--origo-color-text-primary, #333);\n}\nlabel.disabled {\n  opacity: var(--origo-opacity-disabled, 0.5);\n  cursor: not-allowed;\n}\n\ninput[type=checkbox] {\n  margin: 0;\n  accent-color: var(--origo-color-focus, #005fcc);\n}\ninput[type=checkbox]:focus-visible {\n  outline: 2px solid var(--origo-color-focus, #005fcc);\n  outline-offset: 2px;\n}\ninput[type=checkbox]:disabled {\n  cursor: not-allowed;\n}\n\n.required-indicator {\n  color: var(--origo-color-error, #d32f2f);\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { CheckboxComponent };
//# sourceMappingURL=checkbox.component-CRqJ5qGA.js.map
