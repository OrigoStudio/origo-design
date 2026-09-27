import {
  n as input,
  z as model,
  p as computed,
  o as inject,
  D as DomSanitizer,
  A as effect,
  B as untracked,
  S as SecurityContext,
  q as __defineComponent,
  a as __domElementStart,
  b as __domListener,
  g as __domElementEnd,
  v as __domProperty,
  k as __attribute,
  j as __classProp,
} from './index-DRoHZv2r.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-CJxHLpWN.js';

class TextareaComponent {
  static contractSchema = {
    value: 'string',
    placeholder: 'string',
    rows: 'number',
    disabled: 'boolean',
    readonly: 'boolean',
    required: 'boolean',
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
  computedRows = computed(
    () => {
      const rows = this.contract().props?.rows;
      return typeof rows === 'number' && rows > 0 ? Math.max(1, Math.round(rows)) : 3;
    },
    ...(false ? [{ debugName: 'computedRows' }] : /* istanbul ignore next */ [])
  );
  computedDisabled = computed(
    () => !!this.contract().props?.disabled,
    ...(false ? [{ debugName: 'computedDisabled' }] : /* istanbul ignore next */ [])
  );
  computedReadonly = computed(
    () => !!this.contract().props?.readonly,
    ...(false ? [{ debugName: 'computedReadonly' }] : /* istanbul ignore next */ [])
  );
  computedRequired = computed(
    () => !!this.contract().props?.required,
    ...(false ? [{ debugName: 'computedRequired' }] : /* istanbul ignore next */ [])
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
  experienceAdapter = inject(WebExperienceAdapterService);
  sanitizer = inject(DomSanitizer);
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
  onInput(event) {
    const target = event.target;
    if (!target || this.computedDisabled() || this.computedReadonly()) return;
    const rawValue = target.value;
    const sanitizedValue =
      this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || '';
    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }
    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
  static ɵfac = function TextareaComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TextareaComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: TextareaComponent,
    selectors: [['origo-textarea']],
    hostVars: 3,
    hostBindings: function TextareaComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id);
        __classProp('origo-textarea', true);
      }
    },
    inputs: { contract: [1, 'contract'], value: [1, 'value'] },
    outputs: { value: 'valueChange' },
    decls: 1,
    vars: 9,
    consts: [[3, 'input', 'id', 'disabled', 'readonly', 'required', 'value']],
    template: function TextareaComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'textarea', 0);
        __domListener(
          'input',
          function TextareaComponent_Template_textarea_input_0_listener($event) {
            return ctx.onInput($event);
          }
        );
        __domElementEnd();
      }
      if (rf & 2) {
        __domProperty('id', ctx.contract().id)('disabled', ctx.computedDisabled())(
          'readOnly',
          ctx.computedReadonly()
        )('required', ctx.computedRequired())('value', ctx.value());
        __attribute('placeholder', ctx.computedPlaceholder())('rows', ctx.computedRows())(
          'aria-label',
          ctx.computedAriaLabel()
        )('aria-describedby', ctx.computedAriaDescribedBy());
      }
    },
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { TextareaComponent };
//# sourceMappingURL=textarea.component-Bpvh81yV.js.map
