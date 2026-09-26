import { U as __defineInjectable } from './index-jUtR0za3.js';

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  const cloned = {};
  const typedObj = obj;
  for (const key in typedObj) {
    if (Object.prototype.hasOwnProperty.call(typedObj, key)) {
      cloned[key] = deepClone(typedObj[key]);
    }
  }
  return cloned;
}
/**
 * Validates and coerces runtime properties against a basic schema to ensure
 * primitive components do not crash when given malformed BADL ast properties.
 */
function coerceContractProps(props, schema, strict = false) {
  if (!props || typeof props !== 'object' || Array.isArray(props)) {
    return {};
  }
  const result = {};
  const inputProps = props;
  if (!schema) {
    if (strict) {
      throw new Error('strict mode requires a schema');
    }
    for (const [key, val] of Object.entries(inputProps)) {
      result[key] = deepClone(val);
    }
    return result;
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
      if (Array.isArray(value)) {
        if (strict) throw new Error(`Invalid object for prop '${key}'`);
        continue;
      }
      const obj = typeof value === 'object' && value !== null ? value : {};
      result[key] = deepClone(obj);
    } else {
      result[key] = deepClone(value);
    }
  }
  return result;
}
class AdapterPipelineService {
  prepareNode(node, schema, strict = false, visited = new Set()) {
    if (visited.has(node.id)) {
      return { id: node.id, type: node.type, props: {} };
    }
    visited.add(node.id);
    // Translate the raw Canonical ASTNode into a stateless InteractionContract
    const contract = {
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
  static ɵfac = function AdapterPipelineService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || AdapterPipelineService)();
  };
  static ɵprov = /*@__PURE__*/ __defineInjectable({
    token: AdapterPipelineService,
    factory: AdapterPipelineService.ɵfac,
    providedIn: 'root',
  });
}

export { coerceContractProps as c };
//# sourceMappingURL=adapter-DGKL_Kvx.js.map
