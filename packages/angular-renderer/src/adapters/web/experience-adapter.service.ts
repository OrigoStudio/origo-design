import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebExperienceAdapterService {
  private _state = signal<Record<string, Record<string, unknown>>>({});

  getState(nodeId: string, property: string): unknown {
    return this._state()[nodeId]?.[property];
  }

  dispatchCapability(nodeId: string, actionName: string, payload?: unknown): void {
    // In Phase 1, this provides the stateless translation boundary (AD-15).
    // Real dispatching logic to the core BADL engine would be wired here.
    console.debug(
      `[ExperienceAdapter] Dispatched capability '${actionName}' for node '${nodeId}'`,
      payload
    );
  }

  updateState(nodeId: string, property: string, value: unknown): void {
    // In Phase 1, this provides the stateless translation boundary (AD-15).
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
}
