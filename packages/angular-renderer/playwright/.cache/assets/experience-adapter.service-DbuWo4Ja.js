import { G as signal, U as __defineInjectable } from './index-jUtR0za3.js';

class WebExperienceAdapterService {
  _state = signal({}, ...(false ? [{ debugName: '_state' }] : /* istanbul ignore next */ []));
  getState(nodeId, property) {
    return this._state()[nodeId]?.[property];
  }
  dispatchCapability(nodeId, actionName, payload) {
    console.debug(
      `[ExperienceAdapter] Dispatched capability '${actionName}' for node '${nodeId}'`,
      payload
    );
  }
  updateState(nodeId, property, value) {
    console.debug(
      `[ExperienceAdapter] Updated state for node '${nodeId}', property '${property}'`,
      value
    );
    this._state.update(state => ({
      ...state,
      [nodeId]: {
        ...state[nodeId],
        [property]: value,
      },
    }));
  }
  static ɵfac = function WebExperienceAdapterService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || WebExperienceAdapterService)();
  };
  static ɵprov = /* @__PURE__ */ __defineInjectable({
    token: WebExperienceAdapterService,
    factory: WebExperienceAdapterService.ɵfac,
    providedIn: 'root',
  });
}

export { WebExperienceAdapterService as W };
//# sourceMappingURL=experience-adapter.service-DbuWo4Ja.js.map
