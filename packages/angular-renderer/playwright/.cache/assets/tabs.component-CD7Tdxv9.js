import {
  ɵ as __getCurrentView,
  a as __domElementStart,
  b as __domListener,
  c as __restoreView,
  d as __nextContext,
  e as __resetView,
  x as __domElement,
  g as __domElementEnd,
  j as __classProp,
  v as __domProperty,
  k as __attribute,
  h as __advance,
  T as __sanitizeHtml,
  n as input,
  o as inject,
  D as DomSanitizer,
  p as computed,
  S as SecurityContext,
  q as __defineComponent,
  r as __repeaterCreate,
  t as __repeater,
  W as __viewQuery,
  X as __queryRefresh,
  Y as __loadQuery,
} from './index-jUtR0za3.js';
import { W as WebExperienceAdapterService } from './experience-adapter.service-DbuWo4Ja.js';

const _c0 = ['tabButton'];
const _forTrack0 = ($index, $item) => $item.key;
function TabsComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = __getCurrentView();
    __domElementStart(0, 'button', 3, 0);
    __domListener('click', function TabsComponent_For_2_Template_button_click_0_listener() {
      const tab_r2 = __restoreView(_r1).$implicit;
      const ctx_r2 = __nextContext();
      return __resetView(ctx_r2.onTabClick(tab_r2));
    })('keydown', function TabsComponent_For_2_Template_button_keydown_0_listener($event) {
      const ɵ$index_3_r4 = __restoreView(_r1).$index;
      const ctx_r2 = __nextContext();
      return __resetView(ctx_r2.onKeyDown($event, ɵ$index_3_r4));
    });
    __domElement(2, 'span', 4);
    __domElementEnd();
  }
  if (rf & 2) {
    const tab_r2 = ctx.$implicit;
    const ɵ$index_3_r4 = ctx.$index;
    const ctx_r2 = __nextContext();
    __classProp('origo-tabs__tab--active', ctx_r2.computedActiveTab() === tab_r2.key);
    __domProperty('disabled', tab_r2.disabled);
    __attribute('aria-selected', ctx_r2.computedActiveTab() === tab_r2.key)(
      'aria-controls',
      'tabpanel-' + tab_r2.key
    )('id', 'tab-' + tab_r2.key)(
      'tabindex',
      ctx_r2.computedActiveTab() === tab_r2.key ||
        (ctx_r2.computedActiveTab() == null && ɵ$index_3_r4 === 0)
        ? 0
        : -1
    );
    __advance(2);
    __domProperty('innerHTML', tab_r2.label, __sanitizeHtml);
  }
}
class TabsComponent {
  static contractSchema = {
    tabs: 'array',
  };
  static strictContract = false;
  contract = input.required(
    ...(false ? [{ debugName: 'contract' }] : /* istanbul ignore next */ [])
  );
  experienceAdapter = inject(WebExperienceAdapterService);
  sanitizer = inject(DomSanitizer);
  tabButtons;
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
  computedTabs = computed(
    () => {
      const tabs = this.contract().props?.tabs;
      if (!Array.isArray(tabs)) return [];
      return tabs
        .filter(tab => tab != null && tab.key != null && tab.label != null)
        .map(tab => {
          return {
            key: String(tab.key),
            label:
              this.sanitizer.sanitize(SecurityContext.HTML, String(tab.label)) ||
              String(tab.label).replace(/[<>]/g, ''),
            disabled: !!tab.disabled,
          };
        });
    },
    ...(false ? [{ debugName: 'computedTabs' }] : /* istanbul ignore next */ [])
  );
  computedActiveTab = computed(
    () => {
      const active = this.contract().props?.activeTab;
      if (active) return active;
      const tabs = this.computedTabs();
      return tabs.length > 0 ? tabs[0].key : void 0;
    },
    ...(false ? [{ debugName: 'computedActiveTab' }] : /* istanbul ignore next */ [])
  );
  onTabClick(tab) {
    if (tab.disabled || !tab.key) return;
    this.experienceAdapter.updateState(this.contract().id, 'activeTab', tab.key);
  }
  onKeyDown(event, index) {
    const tabs = this.computedTabs();
    if (tabs.length === 0) return;
    let nextIndex = index;
    const isRtl =
      typeof window !== 'undefined' && event.target instanceof Element
        ? window.getComputedStyle(event.target).direction === 'rtl'
        : false;
    if (event.key === 'ArrowRight') {
      nextIndex = isRtl ? index - 1 : index + 1;
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      nextIndex = isRtl ? index + 1 : index - 1;
      event.preventDefault();
    } else if (event.key === 'Home') {
      nextIndex = 0;
      event.preventDefault();
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
      event.preventDefault();
    }
    if (nextIndex < 0) nextIndex = tabs.length - 1;
    if (nextIndex >= tabs.length) nextIndex = 0;
    if (nextIndex !== index) {
      setTimeout(() => {
        const buttons = this.tabButtons?.toArray();
        if (buttons && buttons[nextIndex]) {
          buttons[nextIndex].nativeElement.focus();
        }
      });
    }
  }
  static ɵfac = function TabsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || TabsComponent)();
  };
  static ɵcmp = /* @__PURE__ */ __defineComponent({
    type: TabsComponent,
    selectors: [['origo-tabs']],
    viewQuery: function TabsComponent_Query(rf, ctx) {
      if (rf & 1) {
        __viewQuery(_c0, 5);
      }
      if (rf & 2) {
        let _t;
        __queryRefresh((_t = __loadQuery())) && (ctx.tabButtons = _t);
      }
    },
    hostVars: 3,
    hostBindings: function TabsComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        __attribute('data-testid', ctx.contract().id);
        __classProp('origo-tabs', true);
      }
    },
    inputs: { contract: [1, 'contract'] },
    decls: 3,
    vars: 2,
    consts: [
      ['tabButton', ''],
      ['role', 'tablist', 1, 'origo-tabs__list'],
      [
        'type',
        'button',
        'role',
        'tab',
        1,
        'origo-tabs__tab',
        3,
        'origo-tabs__tab--active',
        'disabled',
      ],
      ['type', 'button', 'role', 'tab', 1, 'origo-tabs__tab', 3, 'click', 'keydown', 'disabled'],
      [1, 'origo-tabs__label', 3, 'innerHTML'],
    ],
    template: function TabsComponent_Template(rf, ctx) {
      if (rf & 1) {
        __domElementStart(0, 'div', 1);
        __repeaterCreate(1, TabsComponent_For_2_Template, 3, 8, 'button', 2, _forTrack0);
        __domElementEnd();
      }
      if (rf & 2) {
        __attribute('aria-label', ctx.computedAriaLabel())(
          'aria-describedby',
          ctx.computedAriaDescribedBy()
        );
        __advance();
        __repeater(ctx.computedTabs());
      }
    },
    styles: [
      ':host {\n  display: block;\n  width: 100%;\n}\n\n.origo-tabs__list {\n  display: flex;\n  border-block-end: 1px solid var(--color-border, #e0e0e0);\n  margin: 0;\n  padding: 0;\n  gap: var(--spacing-sm, 8px);\n}\n\n.origo-tabs__tab {\n  background: none;\n  border: none;\n  border-block-end: 2px solid transparent;\n  padding-inline: var(--spacing-md, 16px);\n  padding-block: var(--spacing-sm, 12px);\n  font-family: inherit;\n  font-size: 14px;\n  color: var(--color-text-secondary, #666666);\n  cursor: pointer;\n  transition: all 0.2s ease;\n  white-space: nowrap;\n  outline: none;\n}\n.origo-tabs__tab:hover:not(:disabled) {\n  color: var(--color-text, #333333);\n  background-color: var(--color-surface-hover, #f5f5f5);\n}\n.origo-tabs__tab:focus-visible {\n  background-color: var(--color-surface-hover, #f5f5f5);\n  border-radius: 4px 4px 0 0;\n  box-shadow: inset 0 0 0 2px var(--color-primary, #1976d2);\n}\n.origo-tabs__tab.origo-tabs__tab--active {\n  color: var(--color-primary, #1976d2);\n  border-block-end-color: var(--color-primary, #1976d2);\n  font-weight: 500;\n}\n.origo-tabs__tab:disabled {\n  cursor: not-allowed;\n  opacity: 0.5;\n}',
    ],
    encapsulation: 3,
  });
}
/* @__PURE__ */ (() => {})();

export { TabsComponent };
//# sourceMappingURL=tabs.component-CD7Tdxv9.js.map
