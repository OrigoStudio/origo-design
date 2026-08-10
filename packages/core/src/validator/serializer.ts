import { CanonicalAST } from '../types/ast';

/**
 * Deep clones and canonically sorts an object/array.
 * Also detects circular references and unsupported types.
 */
function canonicalize(obj: any, seen = new WeakSet()): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (seen.has(obj)) {
    throw new Error('Invalid AST: Circular reference detected');
  }

  if (obj.constructor && obj.constructor !== Object && !Array.isArray(obj)) {
    throw new Error(`Invalid AST: Unsupported type ${obj.constructor.name}`);
  }

  seen.add(obj);

  if (Array.isArray(obj)) {
    // Process children first
    const mapped = obj.map(item => canonicalize(item, seen));

    // Sort deterministically
    mapped.sort((a, b) => {
      const aIsObj = typeof a === 'object' && a !== null;
      const bIsObj = typeof b === 'object' && b !== null;

      if (aIsObj && bIsObj) {
        if ('id' in a && 'id' in b) {
          const idA = String(a.id);
          const idB = String(b.id);
          return idA < idB ? -1 : idA > idB ? 1 : 0;
        }
        if ('name' in a && 'name' in b) {
          const nameA = String(a.name);
          const nameB = String(b.name);
          return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        }
      }

      // Fallback for primitives, heterogeneous objects, or objects without id/name
      const strA = JSON.stringify(a);
      const strB = JSON.stringify(b);
      return strA < strB ? -1 : strA > strB ? 1 : 0;
    });

    seen.delete(obj);
    return mapped;
  }

  // It is an object, sort its keys
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  for (const key of sortedKeys) {
    result[key] = canonicalize(obj[key], seen);
  }

  seen.delete(obj);
  return result;
}

/**
 * Serializes the parsed memory model into a canonical JSON AST.
 * Enforces `schemaVersion`, stable key ordering, and stable array ordering.
 *
 * @param ast The canonical AST to serialize
 * @returns Byte-for-byte deterministic JSON string
 */
export function serializeAST(ast: CanonicalAST): string {
  if (!ast || !ast.schemaVersion) {
    throw new Error('Invalid AST: Missing schemaVersion');
  }

  if (!Array.isArray(ast.domains)) {
    throw new Error('Invalid AST: domains must be an array');
  }

  const canonical = canonicalize(ast);

  return JSON.stringify(canonical);
}
