import { CanonicalAST } from '../types/ast';
import { ValidationError } from '../types/validation';

export const MAX_AST_DEPTH = 250;

/**
 * Performs deep semantic validation on the Canonical AST before downstream code generation.
 * Specifically checks for cyclic entity relationships and missing references.
 *
 * @param ast The Canonical AST to validate
 * @returns {ValidationError[]} Array of validation errors, or empty array if valid.
 */
export function validateAST(ast: CanonicalAST): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ast || !Array.isArray(ast.domains)) {
    errors.push({ type: 'INVALID_FORMAT', message: 'Invalid AST: missing domains array' });
    return errors;
  }
  const entityMap = new Map<string, string>();

  // First pass: Collect all entities to ensure unique IDs and for quick lookup
  for (const domain of ast.domains) {
    if (!domain) continue;
    const entities = Array.isArray(domain.entities) ? domain.entities : [];
    for (const entity of entities) {
      if (!entity || !entity.id) continue;
      if (entityMap.has(entity.id)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate entity ID found: ${entity.id}`,
          path: entity.id,
        });
      } else {
        entityMap.set(entity.id, entity.name);
      }
    }
  }

  // Second pass: Validate field references and detect cycles
  const adjList = new Map<string, string[]>();

  for (const domain of ast.domains) {
    if (!domain) continue;
    const entities = Array.isArray(domain.entities) ? domain.entities : [];
    for (const entity of entities) {
      if (!entity || !entity.id) continue;
      const dependencies: string[] = [];
      const fields = Array.isArray(entity.fields) ? entity.fields : [];
      for (const field of fields) {
        if (field.references) {
          if (!entityMap.has(field.references)) {
            errors.push({
              type: 'MISSING_REFERENCE',
              message: `Invalid consumption rule: Entity "${field.references}" referenced by field "${field.id}" does not exist`,
              path: field.id,
            });
          } else {
            dependencies.push(field.references);
          }
        }
      }
      const existingDeps = adjList.get(entity.id) || [];
      adjList.set(entity.id, [...existingDeps, ...dependencies]);
    }
  }

  // Detect cycles using DFS
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function dfs(nodeId: string, path: string[], depth: number) {
    if (depth > MAX_AST_DEPTH) {
      errors.push({
        type: 'MAX_DEPTH_EXCEEDED',
        message: `Maximum AST depth exceeded (${MAX_AST_DEPTH}) at entity ${nodeId}`,
        path: [...path, nodeId].join(' -> '),
      });
      return;
    }

    if (visiting.has(nodeId)) {
      // Cycle detected: isolate the loop part
      const cycleStartIndex = path.indexOf(nodeId);
      const loop = cycleStartIndex >= 0 ? path.slice(cycleStartIndex) : path;
      const cyclePath = [...loop, nodeId].join(' -> ');
      errors.push({
        type: 'CIRCULAR_REFERENCE',
        message: `Circular dependency detected: ${cyclePath}`,
        path: cyclePath,
      });
      return;
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    path.push(nodeId);

    const deps = adjList.get(nodeId) || [];
    for (const dep of deps) {
      dfs(dep, path, depth + 1);
    }

    path.pop();
    visiting.delete(nodeId);
    visited.add(nodeId);
  }

  for (const entityId of entityMap.keys()) {
    if (!visited.has(entityId)) {
      dfs(entityId, [], 1);
    }
  }

  return errors;
}
