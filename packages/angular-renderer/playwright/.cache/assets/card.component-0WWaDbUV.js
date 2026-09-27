import {
  a as __domElementStart,
  x as __domElement,
  g as __domElementEnd,
  d as __nextContext,
  h as __advance,
  v as __domProperty,
  y as __sanitizeUrl,
  k as __attribute,
  f as __text,
  i as __textInterpolate,
  l as __conditionalCreate,
  m as __conditional,
  n as input,
  o as inject,
  D as DomSanitizer,
  p as computed,
  S as SecurityContext,
  q as __defineComponent,
  j as __classProp,
} from './index-DRoHZv2r.js';

function CardComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'div', 1);
    __domElement(1, 'img', 3);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext();
    __advance();
    __domProperty('src', ctx_r0.computedImageUrl(), __sanitizeUrl);
    __attribute('alt', ctx_r0.computedImageAlt());
  }
}
function CardComponent_Conditional_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'div', 4);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext(2);
    __advance();
    __textInterpolate(ctx_r0.computedTitle());
  }
}
function CardComponent_Conditional_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'div', 5);
    __text(1);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext(2);
    __advance();
    __textInterpolate(ctx_r0.computedSubtitle());
  }
}
function CardComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    __domElementStart(0, 'div', 2);
    __conditionalCreate(1, CardComponent_Conditional_2_Conditional_1_Template, 2, 1, 'div', 4);
    __conditionalCreate(2, CardComponent_Conditional_2_Conditional_2_Template, 2, 1, 'div', 5);
    __domElementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = __nextContext();
    __advance();
    __conditional(ctx_r0.computedTitle() !== void 0 && ctx_r0.computedTitle() !== '' ? 1 : -1);
    __advance();
    __conditional(
      ctx_r0.computedSubtitle() !== void 0 && ctx_r0.computedSubtitle() !== '' ? 2 : -1
    );
  }
}
class CardComponent {
  static contractSchema = {
    title: 'string',
    subtitle: 'string',
    imageUrl: 'string',
    imageAlt: 'string',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  sanitizer = inject(DomSanitizer);
  computedTitle = computed(
    () => {
      const title = this.contract().props?.title;
      return title !== void 0 && title !== null ? String(title) : void 0;
    },
    ...(false ? [{ debugName: 'computedTitle' }] : /* istanbul ignore next */ [])
  );
  computedSubtitle = computed(
    () => {
      const subtitle = this.contract().props?.subtitle;
      return subtitle !== void 0 && subtitle !== null ? String(subtitle) : void 0;
    },
    ...(false ? [{ debugName: 'computedSubtitle' }] : /* istanbul ignore next */ [])
  );
  computedImageUrl = computed(
    () => {
      const url = this.contract().props?.imageUrl;
      if (url === void 0 || url === null || url === '') return void 0;
      const sanitizedUrl = this.sanitizer.sanitize(SecurityContext.URL, String(url));
      return sanitizedUrl || void 0;
    },
    ...(false ? [{ debugName: 'computedImageUrl' }] : /* istanbul ignore next */ [])
  );
  computedImageAlt = computed(
    () => {
      const alt = this.contract().props?.imageAlt;
      return alt !== void 0 && alt !== null ? String(alt) : '';
    },
    ...(false ? [{ debugName: 'computedImageAlt' }] : /* istanbul ignore next */ [])
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
  static ɵfac = function CardComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || CardComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: CardComponent,
    selectors: [['origo-card']],
    hostVars: 5,
    hostBindings: function CardComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id)('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __classProp('origo-card', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 3,
    vars: 2,
    consts: [
      [1, 'origo-card-container'],
      [1, 'origo-card-image'],
      [1, 'origo-card-content'],
      [3, 'src'],
      ['role', 'heading', 'aria-level', '3', 1, 'origo-card-title'],
      [1, 'origo-card-subtitle'],
    ],
    template: function CardComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'div', 0);
        __conditionalCreate(1, CardComponent_Conditional_1_Template, 2, 2, 'div', 1);
        __conditionalCreate(2, CardComponent_Conditional_2_Template, 3, 2, 'div', 2);
        __domElementEnd();
      }
      if (rf & 2) {
        __advance();
        __conditional(ctx.computedImageUrl() ? 1 : -1);
        __advance();
        __conditional(ctx.computedTitle() !== void 0 || ctx.computedSubtitle() !== void 0 ? 2 : -1);
      }
    },
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { CardComponent };
//# sourceMappingURL=card.component-0WWaDbUV.js.map
