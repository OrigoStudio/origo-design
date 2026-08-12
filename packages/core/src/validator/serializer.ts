import { CanonicalAST } from '../types/ast';
import { validateAST, MAX_AST_DEPTH } from './ast-validator';
import { ValidationError } from '../types/validation';

/**
 * Deep clones and canonically sorts an object/array.
 * Also detects circular references and unsupported types.
 */
function canonicalize(
  obj: unknown,
  seen = new WeakSet(),
  errors: ValidationError[] = [],
  depth = 1
): unknown {
  if (depth > MAX_AST_DEPTH) {
    errors.push({
      type: 'MAX_DEPTH_EXCEEDED',
      message: `Maximum AST depth exceeded (${MAX_AST_DEPTH}) during canonicalization`,
    });
    return null;
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (seen.has(obj)) {
    errors.push({
      type: 'CIRCULAR_REFERENCE',
      message: 'Invalid AST: Circular reference detected during canonicalization',
    });
    return null;
  }

  if (Object.prototype.toString.call(obj) !== '[object Object]' && !Array.isArray(obj)) {
    errors.push({
      type: 'INVALID_TYPE',
      message: `Invalid AST: Unsupported type ${obj.constructor?.name || typeof obj}`,
    });
    return null;
  }

  seen.add(obj);

  if (Array.isArray(obj)) {
    // Process children first
    const mapped = obj.map(item => canonicalize(item, seen, errors, depth + 1));

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
  const objAsRecord = obj as Record<string, unknown>;
  const sortedKeys = Object.keys(objAsRecord).sort();
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    result[key] = canonicalize(objAsRecord[key], seen, errors, depth + 1);
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
 * @throws {ASTValidationError} If validation or canonicalization fails
 */
export function serializeAST(ast: CanonicalAST): [string | null, ValidationError[]] {
  if (!ast || !ast.schemaVersion) {
    return [null, [{ type: 'INVALID_FORMAT', message: 'Invalid AST: Missing schemaVersion' }]];
  }

  if (!Array.isArray(ast.domains)) {
    return [null, [{ type: 'INVALID_FORMAT', message: 'Invalid AST: domains must be an array' }]];
  }

  // Validate semantics before serializing
  const errors = validateAST(ast);
  if (errors.length > 0) {
    return [null, errors];
  }

  const canonicalErrors: ValidationError[] = [];
  const canonical = canonicalize(ast, new WeakSet(), canonicalErrors, 1);

  if (canonicalErrors.length > 0) {
    return [null, canonicalErrors];
  }

  return [JSON.stringify(canonical), []];
}
