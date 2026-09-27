import {
  n as input,
  z as model,
  p as computed,
  o as inject,
  A as effect,
  B as untracked,
  q as __defineComponent,
  a as __domElementStart,
  b as __domListener,
  g as __domElementEnd,
  v as __domProperty,
  k as __attribute,
  j as __classProp,
} from './index-DRoHZv2r.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-CJxHLpWN.js';

class TextInputComponent {
  static contractSchema = {
    value: 'string',
    placeholder: 'string',
    disabled: 'boolean',
    readonly: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  value = model('', ...(false ? [{ debugName: 'value' }] : /* istanbul ignore next */ []));
  computedPlaceholder = computed(
    () => this.contract().props?.placeholder ?? '',
    ...(false ? [{ debugName: 'computedPlaceholder' }] : /* istanbul ignore next */ [])
  );
  computedDisabled = computed(
    () => !!this.contract().props?.disabled,
    ...(false ? [{ debugName: 'computedDisabled' }] : /* istanbul ignore next */ [])
  );
  computedReadonly = computed(
    () => !!this.contract().props?.readonly,
    ...(false ? [{ debugName: 'computedReadonly' }] : /* istanbul ignore next */ [])
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
      untracked(() =>
        this.value.set(contractVal !== void 0 && contractVal !== null ? String(contractVal) : '')
      );
    });
  }
  onInput(event) {
    const target = event.target;
    if (!target) return;
    const rawValue = target.value;
    const sanitizedValue = String(rawValue);
    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }
    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
  static ɵfac = function TextInputComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TextInputComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: TextInputComponent,
    selectors: [['origo-text-input']],
    hostVars: 3,
    hostBindings: function TextInputComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '');
        __classProp('origo-text-input', true);
      }
    },
    inputs: { contract: [1, 'contract'], value: [1, 'value'] },
    outputs: { value: 'valueChange' },
    decls: 1,
    vars: 6,
    consts: [['type', 'text', 3, 'input', 'value', 'placeholder', 'disabled', 'readonly']],
    template: function TextInputComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'input', 0);
        __domListener('input', function TextInputComponent_Template_input_input_0_listener($event) {
          return ctx.onInput($event);
        });
        __domElementEnd();
      }
      if (rf & 2) {
        __domProperty('value', ctx.value())('placeholder', ctx.computedPlaceholder())(
          'disabled',
          ctx.computedDisabled()
        )('readOnly', ctx.computedReadonly());
        __attribute('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
      }
    },
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { TextInputComponent };
//# sourceMappingURL=text-input.component-IyHHKpW-.js.map
