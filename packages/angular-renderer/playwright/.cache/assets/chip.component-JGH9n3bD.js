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
  f as __text,
  g as __domElementEnd,
  j as __classProp,
  v as __domProperty,
  k as __attribute,
  h as __advance,
  i as __textInterpolate,
} from './index-jUtR0za3.js';
import { c as coerceContractProps } from './adapter-DGKL_Kvx.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

class ChipComponent {
  static contractSchema = {
    selected: 'boolean',
    label: 'string',
    disabled: 'boolean',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  selected = model(false, ...(false ? [{ debugName: 'selected' }] : /* istanbul ignore next */ []));
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
      const coerced = props ? coerceContractProps(props, ChipComponent.contractSchema) : {};
      const contractVal = coerced['selected'] !== void 0 ? !!coerced['selected'] : this.selected();
      untracked(() => {
        if (contractVal === this.selected()) return;
        this.selected.set(contractVal);
      });
    });
  }
  onClick() {
    if (this.computedDisabled() || !this.contract().id) return;
    const nextSelected = !this.selected();
    this.selected.set(nextSelected);
    this.experienceAdapter.updateState(this.contract().id, 'selected', nextSelected);
  }
  static ɵfac = function ChipComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || ChipComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: ChipComponent,
    selectors: [['origo-chip']],
    hostVars: 3,
    hostBindings: function ChipComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id ?? '');
        __classProp('origo-chip', true);
      }
    },
    inputs: { contract: [1, 'contract'], selected: [1, 'selected'] },
    outputs: { selected: 'selectedChange' },
    decls: 3,
    vars: 8,
    consts: [
      ['type', 'button', 3, 'click', 'id', 'disabled'],
      [1, 'chip-label'],
    ],
    template: function ChipComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'button', 0);
        __domListener('click', function ChipComponent_Template_button_click_0_listener() {
          return ctx.onClick();
        });
        __domElementStart(1, 'span', 1);
        __text(2);
        __domElementEnd()();
      }
      if (rf & 2) {
        __classProp('origo-chip--selected', ctx.selected());
        __domProperty('id', ctx.contract().id)('disabled', ctx.computedDisabled());
        __attribute('aria-pressed', ctx.selected().toString())(
          'aria-label',
          ctx.computedAriaLabel() ?? void 0
        )('aria-describedby', ctx.computedAriaDescribedBy() ?? void 0);
        __advance(2);
        __textInterpolate(ctx.computedLabel());
      }
    },
    styles: [
      ':host {\n  display: inline-block;\n}\n\nbutton {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding-inline: var(--origo-spacing-container-padding, 12px);\n  padding-block: var(--origo-spacing-container-padding-block, 6px);\n  border-radius: var(--origo-radius-chip, 16px);\n  border: var(--origo-border-width, 1px) solid var(--origo-color-border, #cccccc);\n  background-color: var(--origo-color-surface-variant, #f5f5f5);\n  color: var(--origo-color-text-primary, #333333);\n  font-family: var(--origo-typography-button-font-family, inherit);\n  font-size: var(--origo-typography-button-font-size, 0.875rem);\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s ease-in-out;\n}\nbutton:hover:not(:disabled) {\n  background-color: var(--origo-color-surface-variant-hover, #ebebeb);\n}\nbutton.origo-chip--selected {\n  background-color: var(--origo-color-accent, #005fcc);\n  color: var(--origo-color-on-accent, #ffffff);\n  border-color: var(--origo-color-accent, #005fcc);\n}\nbutton:focus-visible {\n  outline: 2px solid var(--origo-color-focus, #005fcc);\n  outline-offset: 2px;\n}\nbutton:disabled {\n  cursor: not-allowed;\n  opacity: var(--origo-opacity-disabled, 0.5);\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { ChipComponent };
//# sourceMappingURL=chip.component-JGH9n3bD.js.map
