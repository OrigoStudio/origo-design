import { CanonicalAST } from '../types/ast';

/**
 * Performs deep semantic validation on the Canonical AST before downstream code generation.
 * Specifically checks for cyclic entity relationships and missing references.
 *
 * @param ast The Canonical AST to validate
 * @throws {Error} If validation fails
 */
export function validateAST(ast: CanonicalAST): void {
  if (!ast || !Array.isArray(ast.domains)) {
    throw new Error('Invalid AST: missing domains array');
  }
  const entityMap = new Map<string, string>();

  // First pass: Collect all entities to ensure unique IDs and for quick lookup
  for (const domain of ast.domains) {
    const entities = Array.isArray(domain.entities) ? domain.entities : [];
    for (const entity of entities) {
      if (entityMap.has(entity.id)) {
        throw new Error(`Duplicate entity ID found: ${entity.id}`);
      }
      entityMap.set(entity.id, entity.name);
    }
  }

  // Second pass: Validate field references and detect cycles
  const adjList = new Map<string, string[]>();

  for (const domain of ast.domains) {
    const entities = Array.isArray(domain.entities) ? domain.entities : [];
    for (const entity of entities) {
      const dependencies: string[] = [];
      const fields = Array.isArray(entity.fields) ? entity.fields : [];
      for (const field of fields) {
        if (field.references) {
          if (!entityMap.has(field.references)) {
            throw new Error(
              `Invalid consumption rule: Entity "${field.references}" referenced by field "${field.id}" does not exist`
            );
          }
          dependencies.push(field.references);
        }
      }
      adjList.set(entity.id, dependencies);
    }
  }

  // Detect cycles using DFS
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function dfs(nodeId: string, path: string[]) {
    if (visiting.has(nodeId)) {
      // Cycle detected: isolate the loop part
      const cycleStartIndex = path.indexOf(nodeId);
      const loop = cycleStartIndex >= 0 ? path.slice(cycleStartIndex) : path;
      const cyclePath = [...loop, nodeId].join(' -> ');
      throw new Error(`Circular dependency detected: ${cyclePath}`);
    }

    if (visited.has(nodeId)) {
      return;
    }

    visiting.add(nodeId);
    path.push(nodeId);

    const deps = adjList.get(nodeId)!;
    for (const dep of deps) {
      dfs(dep, path);
    }

    path.pop();
    visiting.delete(nodeId);
    visited.add(nodeId);
  }

  for (const entityId of entityMap.keys()) {
    if (!visited.has(entityId)) {
      dfs(entityId, []);
    }
  }
}
