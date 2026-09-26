import {
  a as __domElementStart,
  f as __text,
  g as __domElementEnd,
  d as __nextContext,
  h as __advance,
  i as __textInterpolate,
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
  k as __attribute,
  m as __conditional,
} from './index-jUtR0za3.js';
import { c as coerceContractProps } from './adapter-DGKL_Kvx.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

function SwitchComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'span', 2);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext();
    __advance();
    __textInterpolate(ctx_r0.computedLabel());
  }
}
class SwitchComponent {
  static contractSchema = {
    checked: 'boolean',
    label: 'string',
    disabled: 'boolean',
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
  computedAriaLabel = computed(
    () => {
      const v = this.contract().props?.['aria-label'];
      return v !== void 0 && v !== null && String(v).trim() !== '' ? String(v) : void 0;
    },
    ...(false ? [{ debugName: 'computedAriaLabel' }] : /* istanbul ignore next */ [])
  );
  computedAriaDescribedBy = computed(
    () => {
      const v = this.contract().props?.['aria-describedby'];
      return v !== void 0 && v !== null && String(v).trim() !== '' ? String(v) : void 0;
    },
    ...(false ? [{ debugName: 'computedAriaDescribedBy' }] : /* istanbul ignore next */ [])
  );
  experienceAdapter = inject(WebExperienceAdapterService);
  constructor() {
    effect(() => {
      const props = this.contract().props;
      const coerced = props ? coerceContractProps(props, SwitchComponent.contractSchema) : {};
      const contractVal = coerced['checked'] !== void 0 ? !!coerced['checked'] : this.checked();
      untracked(() => {
        if (contractVal === this.checked()) return;
        this.checked.set(contractVal);
      });
    });
  }
  onChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || this.computedDisabled() || !this.contract().id)
      return;
    const isChecked = target.checked;
    this.checked.set(isChecked);
    this.experienceAdapter.updateState(this.contract().id, 'checked', isChecked);
  }
  static ɵfac = function SwitchComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || SwitchComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: SwitchComponent,
    selectors: [['origo-switch']],
    hostVars: 3,
    hostBindings: function SwitchComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '');
        __classProp('origo-switch', true);
      }
    },
    inputs: { contract: [1, 'contract'], checked: [1, 'checked'] },
    outputs: { checked: 'checkedChange' },
    decls: 3,
    vars: 10,
    consts: [
      [3, 'for'],
      ['type', 'checkbox', 'role', 'switch', 3, 'change', 'id', 'checked', 'disabled'],
      [1, 'label-text'],
    ],
    template: function SwitchComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'label', 0)(1, 'input', 1);
        __domListener('change', function SwitchComponent_Template_input_change_1_listener($event) {
          return ctx.onChange($event);
        });
        __domElementEnd();
        __conditionalCreate(2, SwitchComponent_Conditional_2_Template, 2, 1, 'span', 2);
        __domElementEnd();
      }
      if (rf & 2) {
        __classProp('disabled', ctx.computedDisabled());
        __domProperty('htmlFor', ctx.contract().id);
        __advance();
        __domProperty('id', ctx.contract().id)('checked', ctx.checked())(
          'disabled',
          ctx.computedDisabled()
        );
        __attribute('aria-checked', ctx.checked().toString())(
          'aria-label',
          ctx.computedAriaLabel() ?? void 0
        )('aria-describedby', ctx.computedAriaDescribedBy() ?? void 0);
        __advance();
        __conditional(ctx.computedLabel() ? 2 : -1);
      }
    },
    styles: [
      ':host {\n  display: inline-block;\n}\n\nlabel {\n  display: inline-flex;\n  align-items: center;\n  gap: var(--origo-spacing-container-padding, 8px);\n  cursor: pointer;\n  font-family: var(--origo-typography-input-font-family, inherit);\n  font-size: var(--origo-typography-input-font-size, 1rem);\n  color: var(--origo-color-text-primary, #333333);\n}\nlabel.disabled {\n  opacity: var(--origo-opacity-disabled, 0.5);\n  cursor: not-allowed;\n}\n\ninput[type=checkbox][role=switch] {\n  appearance: none;\n  width: var(--origo-switch-track-width, 40px);\n  height: var(--origo-switch-track-height, 22px);\n  background-color: var(--origo-color-surface-variant, #e0e0e0);\n  border-radius: var(--origo-radius-switch-track, 11px);\n  position: relative;\n  outline: none;\n  cursor: pointer;\n  margin: 0;\n  transition: background-color 0.2s ease-in-out;\n}\ninput[type=checkbox][role=switch]:hover:not(:disabled) {\n  background-color: var(--origo-color-surface-variant-hover, #d0d0d0);\n}\ninput[type=checkbox][role=switch]::after {\n  content: "";\n  position: absolute;\n  top: 2px;\n  inset-inline-start: 2px;\n  width: var(--origo-switch-thumb-size, 18px);\n  height: var(--origo-switch-thumb-size, 18px);\n  background-color: var(--origo-color-on-accent, #ffffff);\n  border-radius: 50%;\n  transition: inset-inline-start 0.2s ease-in-out, transform 0.2s ease-in-out;\n}\ninput[type=checkbox][role=switch]:checked {\n  background-color: var(--origo-color-accent, var(--origo-color-primary, #005fcc));\n}\ninput[type=checkbox][role=switch]:checked::after {\n  inset-inline-start: calc(100% - var(--origo-switch-thumb-size, 18px) - 2px);\n}\ninput[type=checkbox][role=switch]:focus-visible {\n  outline: 2px solid var(--origo-color-focus, #005fcc);\n  outline-offset: 2px;\n}\ninput[type=checkbox][role=switch]:disabled {\n  cursor: not-allowed;\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { SwitchComponent };
//# sourceMappingURL=switch.component-ZnvMXXkw.js.map
