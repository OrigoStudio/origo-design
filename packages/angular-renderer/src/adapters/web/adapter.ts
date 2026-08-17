import { Injectable, ViewContainerRef, Signal, InputSignal } from '@angular/core';
import { ASTNode, InteractionContract } from '@origo/core';

export interface ContainerComponent {
  viewContainerRef?: ViewContainerRef | Signal<ViewContainerRef>;
  vc?: ViewContainerRef | Signal<ViewContainerRef>;
}

export interface OrigoAdapter<TProps = Record<string, unknown>> {
  /**
   * The core interaction contract driving this adapter.
   */
  contract: InputSignal<InteractionContract<TProps>>;
}

/**
 * Validates and coerces runtime properties against a basic schema to ensure
 * primitive components do not crash when given malformed BADL ast properties.
 */
export function coerceContractProps<T>(
  props: unknown,
  schema?: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>,
  strict = false
): T {
  if (!props || typeof props !== 'object' || Array.isArray(props)) {
    return {} as T;
  }

  const result: Record<string, unknown> = {};
  const inputProps = props as Record<string, unknown>;

  // If no schema, just passthrough (or if we want, we can return empty if strict)
  if (!schema) {
    return strict ? ({} as T) : ({ ...inputProps } as T);
  }

  // If not strict, copy all props first, then override with coerced ones
  if (!strict) {
    Object.assign(result, inputProps);
  }

  for (const [key, expectedType] of Object.entries(schema)) {
    const value = inputProps[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (expectedType === 'string') {
      result[key] = String(value);
    } else if (expectedType === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        console.warn(`Invalid number for prop '${key}': ${value}`);
        result[key] = undefined;
      } else {
        result[key] = num;
      }
    } else if (expectedType === 'boolean') {
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        result[key] = !(lower === 'false' || lower === '0' || lower === 'off');
      } else {
        result[key] = Boolean(value);
      }
    } else if (expectedType === 'array') {
      result[key] = Array.isArray(value) ? value : [value];
    } else if (expectedType === 'object') {
      result[key] = typeof value === 'object' && !Array.isArray(value) ? value : {};
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

@Injectable({ providedIn: 'root' })
export class AdapterPipelineService {
  prepareNode(
    node: ASTNode,
    schema?: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>,
    strict = false,
    visited = new Set<string>()
  ): InteractionContract {
    if (visited.has(node.id)) {
      return { id: node.id, type: node.type, props: {} };
    }
    visited.add(node.id);

    // Translate the raw Canonical ASTNode into a stateless InteractionContract
    const contract: InteractionContract = {
      id: node.id,
      type: node.type,
      props: coerceContractProps(node.props, schema, strict),
    };

    if (node.children) {
      contract.children = node.children.map(child =>
        this.prepareNode(child, undefined, strict, visited)
      );
    }

    return contract;
  }
}
