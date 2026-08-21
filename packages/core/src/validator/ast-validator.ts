import { CanonicalAST } from '../types/ast';
import { ValidationError } from '../types/validation';
import { Contract, Capability } from '../types/domain';
import * as semver from 'semver';

export const MAX_AST_DEPTH = 250;

/**
 * Performs deep semantic validation on the Canonical AST before downstream code generation.
 * Specifically checks for cyclic entity relationships and missing references.
 *
 * @param ast The Canonical AST to validate
 * @returns {ValidationError[]} Array of validation errors, or empty array if valid.
 */
export function validateAST(
  ast: CanonicalAST,
  localManifest?: Record<string, string>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!ast || !Array.isArray(ast.domains)) {
    errors.push({ type: 'INVALID_FORMAT', message: 'Invalid AST: missing domains array' });
    return errors;
  }
  const entityDomainMap = new Map<string, string>();
  const extensionIds = new Set<string>();
  const capabilityIds = new Set<string>();
  const contractMap = new Map<string, Contract>();
  const entityCapabilities = new Map<string, Capability[]>();

  // First pass: Collect all entities, capabilities, and contracts to ensure unique IDs and for quick lookup
  for (let dIndex = 0; dIndex < ast.domains.length; dIndex++) {
    const domain = ast.domains[dIndex];
    if (!domain) continue;
    const entities = Array.isArray(domain.entities) ? domain.entities : [];
    for (const entity of entities) {
      if (!entity || !entity.id) continue;
      if (entityDomainMap.has(entity.id)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate entity ID found: ${entity.id}`,
          path: entity.id,
        });
      } else {
        entityDomainMap.set(entity.id, domain.id);
      }
    }

    const capabilities = Array.isArray(domain.capabilities) ? domain.capabilities : [];
    for (let cIndex = 0; cIndex < capabilities.length; cIndex++) {
      const capability = capabilities[cIndex];
      if (!capability || !capability.id) {
        errors.push({
          type: 'INVALID_FORMAT',
          message: `Capability missing id in domain ${domain.id}`,
          path: `domains[${dIndex}].capabilities[${cIndex}]`,
        });
        continue;
      }
      if (capabilityIds.has(capability.id)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate capability ID found: ${capability.id}`,
          path: `domains[${dIndex}].capabilities[${cIndex}].id`,
        });
        continue;
      } else {
        capabilityIds.add(capability.id);
      }

      if (capability.entityId) {
        const existingCaps = entityCapabilities.get(capability.entityId) || [];
        existingCaps.push(capability);
        entityCapabilities.set(capability.entityId, existingCaps);
      }
    }

    const contracts = Array.isArray(domain.contracts) ? domain.contracts : [];
    for (let cIdx = 0; cIdx < contracts.length; cIdx++) {
      const contract = contracts[cIdx];
      if (!contract || !contract.id) {
        errors.push({
          type: 'INVALID_FORMAT',
          message: 'Contract missing id',
          path: `domains[${dIndex}].contracts[${cIdx}]`,
        });
        continue;
      }
      if (contractMap.has(contract.id)) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate contract ID found: ${contract.id}`,
          path: `domains[${dIndex}].contracts[${cIdx}].id`,
        });
      } else {
        contractMap.set(contract.id, contract);
      }
    }

    const extensions = Array.isArray(domain.extensions) ? domain.extensions : [];
    for (let eIdx = 0; eIdx < extensions.length; eIdx++) {
      const ext = extensions[eIdx];
      if (!ext || !ext.id) {
        errors.push({
          type: 'INVALID_FORMAT',
          message: 'Extension missing id',
          path: `domains[${dIndex}].extensions[${eIdx}]`,
        });
        continue;
      }
      if (
        contractMap.has(ext.id) ||
        capabilityIds.has(ext.id) ||
        entityDomainMap.has(ext.id) ||
        extensionIds.has(ext.id)
      ) {
        errors.push({
          type: 'DUPLICATE_ID',
          message: `Duplicate ID found across extensions and other types: ${ext.id}`,
          path: `domains[${dIndex}].extensions[${eIdx}].id`,
        });
      } else {
        extensionIds.add(ext.id);
      }
    }
  }

  // Second pass: Validate field references and detect cycles
  const adjList = new Map<string, string[]>();

  for (let dIndex = 0; dIndex < ast.domains.length; dIndex++) {
    const domain = ast.domains[dIndex];
    if (!domain) continue;
    const entities = Array.isArray(domain.entities) ? domain.entities : [];
    for (let eIndex = 0; eIndex < entities.length; eIndex++) {
      const entity = entities[eIndex];
      if (!entity || !entity.id) continue;
      const dependencies: string[] = [];
      const processFields = (fieldList: any[], depth = 1) => {
        if (depth > MAX_AST_DEPTH) {
          errors.push({
            type: 'MAX_DEPTH_EXCEEDED',
            message: `Maximum AST depth exceeded (${MAX_AST_DEPTH}) in entity fields for ${entity.id}`,
            path: entity.id,
          });
          return;
        }
        for (const field of fieldList) {
          if (!field || typeof field !== 'object') continue;
          if (field.references) {
            if (!entityDomainMap.has(field.references)) {
              errors.push({
                type: 'MISSING_REFERENCE',
                message: `Invalid consumption rule: Entity "${field.references}" referenced by field "${field.id}" does not exist`,
                path: field.id,
              });
            } else {
              dependencies.push(field.references);
            }
          }
          if (Array.isArray(field.fields)) {
            processFields(field.fields, depth + 1);
          }
        }
      };

      const fields = Array.isArray(entity.fields) ? entity.fields : [];
      processFields(fields);
      const existingDeps = adjList.get(entity.id) || [];
      adjList.set(entity.id, [...existingDeps, ...dependencies]);

      if (Array.isArray(entity.implements)) {
        for (const contractId of entity.implements) {
          const contract = contractMap.get(contractId);
          if (!contract) {
            errors.push({
              type: 'MISSING_REFERENCE',
              message: `Entity "${entity.id}" implements missing contract "${contractId}"`,
              path: `domains[${dIndex}].entities[${eIndex}].implements`,
            });
            continue;
          }

          if (Array.isArray(contract.requiredFields)) {
            const flattenFields = (fieldList: any[]): any[] => {
              let res: any[] = [];
              for (const f of fieldList) {
                if (!f) continue;
                res.push(f);
                if (Array.isArray(f.fields)) {
                  res = res.concat(flattenFields(f.fields));
                }
              }
              return res;
            };
            const allEntityFields = flattenFields(entity.fields || []);
            for (const reqField of contract.requiredFields) {
              if (!reqField || typeof reqField !== 'object' || !reqField.name) continue;
              const entityField = allEntityFields.find((f: any) => f.name === reqField.name);
              if (!entityField) {
                errors.push({
                  type: 'CONTRACT_BREACH',
                  message: `Entity "${entity.id}" missing required field "${reqField.name}" for contract "${contract.id}"`,
                  path: `domains[${dIndex}].entities[${eIndex}].implements`,
                });
              } else if (entityField.type !== reqField.type) {
                errors.push({
                  type: 'CONTRACT_BREACH',
                  message: `Entity "${entity.id}" field "${reqField.name}" has type "${entityField.type}" but contract "${contract.id}" requires "${reqField.type}"`,
                  path: `domains[${dIndex}].entities[${eIndex}].fields.${entityField.id}`,
                });
              }
            }
          }

          if (Array.isArray(contract.requiredCapabilities)) {
            const caps = entityCapabilities.get(entity.id) || [];
            for (const reqCap of contract.requiredCapabilities) {
              if (!reqCap || typeof reqCap !== 'object' || !reqCap.name || !reqCap.type) continue;
              const hasCap = caps.some(
                (c: any) => c.name === reqCap.name && c.type === reqCap.type
              );
              if (!hasCap) {
                errors.push({
                  type: 'CONTRACT_BREACH',
                  message: `Entity "${entity.id}" missing required capability "${reqCap.name}" (${reqCap.type}) for contract "${contract.id}"`,
                  path: `domains[${dIndex}].entities[${eIndex}].implements`,
                });
              }
            }
          }
        }
      }
    }

    const capabilities = Array.isArray(domain.capabilities) ? domain.capabilities : [];
    for (let cIndex = 0; cIndex < capabilities.length; cIndex++) {
      const capability = capabilities[cIndex];
      if (!capability || !capability.id) continue;

      const capPath = `domains[${dIndex}].capabilities[${cIndex}]`;
      if (!capability.entityId) {
        errors.push({
          type: 'MISSING_REFERENCE',
          message: `Capability missing entityId: ${capability.id}`,
          path: `${capPath}.entityId`,
        });
        continue;
      }

      const targetDomainId = entityDomainMap.get(capability.entityId);
      if (!targetDomainId) {
        errors.push({
          type: 'MISSING_REFERENCE',
          message: `Invalid capability reference: Entity "${capability.entityId}" referenced by capability "${capability.id}" does not exist`,
          path: `${capPath}.entityId`,
        });
      }

      if (
        !capability.permissions ||
        !Array.isArray(capability.permissions) ||
        capability.permissions.length === 0
      ) {
        errors.push({
          type: 'UNSECURED_CAPABILITY',
          message: `Capability "${capability.id}" is unsecured. Fail-closed policy requires at least one permission.`,
          path: `${capPath}.permissions`,
        });
      } else {
        for (let pIndex = 0; pIndex < capability.permissions.length; pIndex++) {
          const perm = capability.permissions[pIndex];
          if (
            !perm ||
            typeof perm !== 'object' ||
            !perm.role ||
            typeof perm.role !== 'string' ||
            perm.role.trim() === ''
          ) {
            errors.push({
              type: 'INVALID_PERMISSION',
              message: `Capability "${capability.id}" has an invalid permission definition. Role is required.`,
              path: `${capPath}.permissions[${pIndex}]`,
            });
          } else {
            perm.role = perm.role.trim();
            if (perm.access === undefined) {
              perm.access = 'grant';
            }
            if (perm.access !== 'grant' && perm.access !== 'deny') {
              errors.push({
                type: 'INVALID_PERMISSION',
                message: `Capability "${capability.id}" has an invalid access definition. Must be "grant" or "deny".`,
                path: `${capPath}.permissions[${pIndex}].access`,
              });
            }
          }
        }
      }
    }

    const extensions = Array.isArray(domain.extensions) ? domain.extensions : [];
    for (let eIndex = 0; eIndex < extensions.length; eIndex++) {
      const ext = extensions[eIndex];
      if (!ext || !ext.id) continue;

      const extPath = `domains[${dIndex}].extensions[${eIndex}]`;
      if (!Array.isArray(ext.implements) || ext.implements.length === 0) {
        errors.push({
          type: 'MISSING_REFERENCE',
          message: `Extension missing implements contract reference: ${ext.id}`,
          path: `${extPath}.implements`,
        });
      } else {
        for (const imp of ext.implements) {
          if (!contractMap.has(imp)) {
            errors.push({
              type: 'MISSING_REFERENCE',
              message: `Invalid extension reference: Contract "${imp}" referenced by extension "${ext.id}" does not exist`,
              path: `${extPath}.implements`,
            });
          }
        }
      }

      if (localManifest && ext.name && ext.plugin_version_range) {
        const localVersion = localManifest[ext.name];
        if (!localVersion) {
          errors.push({
            type: 'MISSING_MANIFEST_VERSION',
            message: `Local manifest is missing version for extension "${ext.name}"`,
            path: `${extPath}.name`,
          });
        } else if (!semver.valid(localVersion) || !semver.validRange(ext.plugin_version_range)) {
          errors.push({
            type: 'VERSION_MISMATCH',
            message: `Invalid semver format for extension "${ext.name}"`,
            path: `${extPath}.plugin_version_range`,
          });
        } else if (!semver.satisfies(localVersion, ext.plugin_version_range)) {
          errors.push({
            type: 'VERSION_MISMATCH',
            message: `Extension "${ext.name}" requires plugin version "${ext.plugin_version_range}" but local manifest provides "${localVersion}"`,
            path: `${extPath}.plugin_version_range`,
          });
        }
      }
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

  for (const entityId of entityDomainMap.keys()) {
    if (!visited.has(entityId)) {
      dfs(entityId, [], 1);
    }
  }

  return errors;
}
