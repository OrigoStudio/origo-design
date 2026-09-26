import {
  ɵ as __getCurrentView,
  a as __domElementStart,
  b as __domListener,
  c as __restoreView,
  d as __nextContext,
  e as __resetView,
  g as __domElementEnd,
  f as __text,
  h as __advance,
  v as __domProperty,
  i as __textInterpolate,
  n as input,
  z as model,
  p as computed,
  o as inject,
  A as effect,
  B as untracked,
  q as __defineComponent,
  r as __repeaterCreate,
  k as __attribute,
  t as __repeater,
  j as __classProp,
} from './index-jUtR0za3.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

const _forTrack0 = ($index, $item) => $item.value;
function RadioGroupComponent_For_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = __getCurrentView();
    __domElementStart(0, 'label', 3)(1, 'input', 4);
    __domListener(
      'change',
      function RadioGroupComponent_For_5_Template_input_change_1_listener($event) {
        __restoreView(_r1);
        const ctx_r1 = __nextContext();
        return __resetView(ctx_r1.onChange($event));
      }
    );
    __domElementEnd();
    __domElementStart(2, 'span');
    __text(3);
    __domElementEnd()();
  }
  if (rf & 2) {
    const option_r3 = ctx.$implicit;
    const ɵ$index_8_r4 = ctx.$index;
    const ctx_r1 = __nextContext();
    __advance();
    __domProperty('id', ctx_r1.contract().id + '-' + ɵ$index_8_r4)(
      'name',
      'rg-' + ctx_r1.contract().id
    )('value', option_r3.value)('checked', ctx_r1.value() === option_r3.value)(
      'required',
      ctx_r1.computedRequired()
    );
    __advance(2);
    __textInterpolate(option_r3.label);
  }
}
class RadioGroupComponent {
  static contractSchema = {
    options: 'array',
    value: 'string',
    disabled: 'boolean',
    required: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  value = model('', ...(false ? [{ debugName: 'value' }] : /* istanbul ignore next */ []));
  computedOptions = computed(
    () => {
      const opts = this.contract().props?.options;
      return Array.isArray(opts) ? opts : [];
    },
    ...(false ? [{ debugName: 'computedOptions' }] : /* istanbul ignore next */ [])
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
      const contractVal = this.contract().props?.value;
      const parsedVal = contractVal !== void 0 && contractVal !== null ? String(contractVal) : '';
      untracked(() => {
        if (parsedVal === this.value()) return;
        this.value.set(parsedVal);
      });
    });
  }
  onChange(event) {
    const target = event.target;
    if (!target || !target.checked || this.computedDisabled()) return;
    const rawValue = target.value;
    const sanitizedValue = String(rawValue);
    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
  static ɵfac = function RadioGroupComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || RadioGroupComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: RadioGroupComponent,
    selectors: [['origo-radio-group']],
    hostVars: 3,
    hostBindings: function RadioGroupComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '');
        __classProp('origo-radio-group', true);
      }
    },
    inputs: { contract: [1, 'contract'], value: [1, 'value'] },
    outputs: { value: 'valueChange' },
    decls: 6,
    vars: 3,
    consts: [
      [3, 'disabled'],
      [1, 'visually-hidden'],
      [1, 'radio-options'],
      [1, 'radio-label'],
      ['type', 'radio', 3, 'change', 'id', 'name', 'value', 'checked', 'required'],
    ],
    template: function RadioGroupComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'fieldset', 0)(1, 'legend', 1);
        __text(2);
        __domElementEnd();
        __domElementStart(3, 'div', 2);
        __repeaterCreate(4, RadioGroupComponent_For_5_Template, 4, 6, 'label', 3, _forTrack0);
        __domElementEnd()();
      }
      if (rf & 2) {
        __domProperty('disabled', ctx.computedDisabled());
        __attribute('aria-describedby', ctx.computedAriaDescribedBy());
        __advance(2);
        __textInterpolate(ctx.computedAriaLabel() ?? 'Radio Group');
        __advance(2);
        __repeater(ctx.computedOptions());
      }
    },
    styles: [
      ':host {\n  display: block;\n}\n\nfieldset {\n  border: none;\n  padding: 0;\n  margin: 0;\n}\nfieldset:disabled {\n  opacity: var(--origo-opacity-disabled, 0.5);\n}\nfieldset:disabled .radio-label {\n  cursor: not-allowed;\n}\n\n.visually-hidden {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}\n\n.radio-options {\n  display: flex;\n  flex-direction: column;\n  gap: var(--origo-spacing-container-padding, 8px);\n}\n\n.radio-label {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--origo-spacing-container-padding, 8px);\n  cursor: pointer;\n  font-family: var(--origo-typography-input-font-family, inherit);\n  font-size: var(--origo-typography-input-font-size, 1rem);\n  color: var(--origo-color-text-primary, #333);\n}\n\ninput[type=radio] {\n  margin: 0;\n  accent-color: var(--origo-color-focus, #005fcc);\n}\ninput[type=radio]:focus-visible {\n  outline: 2px solid var(--origo-color-focus, #005fcc);\n  outline-offset: 2px;\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { RadioGroupComponent };
//# sourceMappingURL=radio-group.component-DiVr9QPT.js.map
