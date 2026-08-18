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

function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
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

  if (!schema) {
    for (const [key, val] of Object.entries(inputProps)) {
      if (!strict || key.startsWith('aria-') || key.startsWith('data-')) {
        result[key] = deepClone(val);
      }
    }
    return result as T;
  }

  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith('aria-') || key.startsWith('data-')) {
      result[key] = deepClone(value);
      continue;
    }

    if (!schema[key]) {
      if (!strict) {
        result[key] = deepClone(value);
      }
      continue;
    }

    const expectedType = schema[key];
    if (value === undefined || value === null) {
      continue;
    }

    if (expectedType === 'string') {
      result[key] = String(value);
    } else if (expectedType === 'number') {
      if (value === '' || typeof value === 'boolean') {
        if (strict) throw new Error(`Invalid number for prop '${key}'`);
        continue;
      }
      const num = Number(value);
      if (isNaN(num)) {
        if (strict) throw new Error(`Invalid number for prop '${key}': ${value}`);
        console.warn(`Invalid number for prop '${key}': ${value}`);
      } else {
        result[key] = num;
      }
    } else if (expectedType === 'boolean') {
      if (value === '') {
        result[key] = true;
      } else if (typeof value === 'string') {
        const lower = value.toLowerCase();
        result[key] = !(lower === 'false' || lower === '0' || lower === 'off');
      } else {
        result[key] = Boolean(value);
      }
    } else if (expectedType === 'array') {
      const arr = Array.isArray(value) ? value : [value];
      result[key] = deepClone(arr);
    } else if (expectedType === 'object') {
      const obj = typeof value === 'object' && !Array.isArray(value) ? value : {};
      result[key] = deepClone(obj);
    } else {
      result[key] = deepClone(value);
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
