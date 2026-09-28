import {
  n as input,
  p as computed,
  u as output,
  o as inject,
  q as __defineComponent,
  a as __domElementStart,
  b as __domListener,
  f as __text,
  g as __domElementEnd,
  v as __domProperty,
  k as __attribute,
  h as __advance,
  w as __textInterpolate1,
  j as __classProp,
} from './index-DRoHZv2r.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-CJxHLpWN.js';

class ButtonComponent {
  static contractSchema = {
    label: 'string',
    disabled: 'boolean',
    type: 'string',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  computedLabel = computed(
    () => this.contract().props?.label ?? 'Button',
    ...(false ? [{ debugName: 'computedLabel' }] : /* istanbul ignore next */ [])
  );
  computedDisabled = computed(
    () => !!this.contract().props?.disabled,
    ...(false ? [{ debugName: 'computedDisabled' }] : /* istanbul ignore next */ [])
  );
  computedType = computed(
    () => {
      const type = this.contract().props?.type;
      return type === 'button' || type === 'submit' || type === 'reset' ? type : 'button';
    },
    ...(false ? [{ debugName: 'computedType' }] : /* istanbul ignore next */ [])
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
  action = output();
  experienceAdapter = inject(WebExperienceAdapterService);
  onClick() {
    if (this.computedDisabled()) return;
    const id = this.contract().id;
    if (!id) return;
    this.experienceAdapter.dispatchCapability(id, 'click');
    this.action.emit();
  }
  static ɵfac = function ButtonComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ButtonComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: ButtonComponent,
    selectors: [['origo-button']],
    hostVars: 3,
    hostBindings: function ButtonComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '');
        __classProp('origo-button', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    outputs: { action: 'action' },
    decls: 2,
    vars: 5,
    consts: [[3, 'click', 'type', 'disabled']],
    template: function ButtonComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'button', 0);
        __domListener('click', function ButtonComponent_Template_button_click_0_listener() {
          return ctx.onClick();
        });
        __text(1);
        __domElementEnd();
      }
      if (rf & 2) {
        __domProperty('type', ctx.computedType())('disabled', ctx.computedDisabled());
        __attribute('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __advance();
        __textInterpolate1(' ', ctx.computedLabel(), '\n');
      }
    },
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { ButtonComponent };
//# sourceMappingURL=button.component-Dnc1mP3D.js.map
