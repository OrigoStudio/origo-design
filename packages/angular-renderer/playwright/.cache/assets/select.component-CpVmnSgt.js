import {
  a as __domElementStart,
  f as __text,
  g as __domElementEnd,
  d as __nextContext,
  h as __advance,
  i as __textInterpolate,
  v as __domProperty,
  n as input,
  z as model,
  p as computed,
  o as inject,
  D as DomSanitizer,
  A as effect,
  B as untracked,
  S as SecurityContext,
  q as __defineComponent,
  b as __domListener,
  l as __conditionalCreate,
  r as __repeaterCreate,
  k as __attribute,
  m as __conditional,
  t as __repeater,
  j as __classProp,
} from './index-jUtR0za3.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

const _forTrack0 = ($index, $item) => $item.value;
function SelectComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'option', 1);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext();
    __advance();
    __textInterpolate(ctx_r0.computedPlaceholder());
  }
}
function SelectComponent_For_3_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'option', 2);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const option_r2 = ctx.$implicit;
    const ctx_r0 = __nextContext();
    __domProperty('value', option_r2.value)('selected', ctx_r0.value() === option_r2.value);
    __advance();
    __textInterpolate(option_r2.label);
  }
}
class SelectComponent {
  static contractSchema = {
    options: 'array',
    value: 'string',
    disabled: 'boolean',
    placeholder: 'string',
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
      return Array.isArray(opts)
        ? opts.filter(o => o != null && o.value != null && o.label != null)
        : [];
    },
    ...(false ? [{ debugName: 'computedOptions' }] : /* istanbul ignore next */ [])
  );
  computedPlaceholder = computed(
    () => this.contract().props?.placeholder ?? '',
    ...(false ? [{ debugName: 'computedPlaceholder' }] : /* istanbul ignore next */ [])
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
  onChange(event) {
    const target = event.target;
    if (!target || this.computedDisabled()) return;
    const rawValue = target.value;
    const sanitizedValue =
      this.sanitizer.sanitize(SecurityContext.HTML, rawValue) || rawValue || '';
    if (target.value !== sanitizedValue) {
      target.value = sanitizedValue;
    }
    this.value.set(sanitizedValue);
    this.experienceAdapter.updateState(this.contract().id, 'value', sanitizedValue);
  }
  static ɵfac = function SelectComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SelectComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: SelectComponent,
    selectors: [['origo-select']],
    hostVars: 3,
    hostBindings: function SelectComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id);
        __classProp('origo-select', true);
      }
    },
    inputs: { contract: [1, 'contract'], value: [1, 'value'] },
    outputs: { value: 'valueChange' },
    decls: 4,
    vars: 6,
    consts: [
      [3, 'change', 'id', 'disabled', 'required'],
      ['value', '', 'disabled', '', 'selected', '', 'hidden', ''],
      [3, 'value', 'selected'],
    ],
    template: function SelectComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'select', 0);
        __domListener('change', function SelectComponent_Template_select_change_0_listener($event) {
          return ctx.onChange($event);
        });
        __conditionalCreate(1, SelectComponent_Conditional_1_Template, 2, 1, 'option', 1);
        __repeaterCreate(2, SelectComponent_For_3_Template, 2, 3, 'option', 2, _forTrack0);
        __domElementEnd();
      }
      if (rf & 2) {
        __domProperty('id', ctx.contract().id)('disabled', ctx.computedDisabled())(
          'required',
          ctx.computedRequired()
        );
        __attribute('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __advance();
        __conditional(ctx.computedPlaceholder() ? 1 : -1);
        __advance();
        __repeater(ctx.computedOptions());
      }
    },
    styles: [
      ':host {\n  display: block;\n}\n\nselect {\n  display: block;\n  width: 100%;\n  font-family: var(--origo-typography-input-font-family, inherit);\n  font-size: var(--origo-typography-input-font-size, 1rem);\n  color: var(--origo-color-text-primary, #333);\n  background-color: var(--origo-color-surface-background, #fff);\n  border: 1px solid var(--origo-color-border-default, #ccc);\n  border-radius: var(--origo-radius-sm, 4px);\n  padding: var(--origo-spacing-container-padding, 8px);\n  box-sizing: border-box;\n}\nselect:focus {\n  outline: 2px solid var(--origo-color-focus, #005fcc);\n  outline-offset: 2px;\n}\nselect:disabled {\n  opacity: var(--origo-opacity-disabled, 0.5);\n  cursor: not-allowed;\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { SelectComponent };
//# sourceMappingURL=select.component-CpVmnSgt.js.map
