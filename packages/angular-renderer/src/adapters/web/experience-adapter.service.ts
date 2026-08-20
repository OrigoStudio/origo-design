import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebExperienceAdapterService {
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
  }
}
