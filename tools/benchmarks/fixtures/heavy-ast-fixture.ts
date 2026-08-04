export interface BadlField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  metadata_path: string;
  validation?: Array<{ rule: string; value?: string | number }>;
}

export interface BadlCapability {
  id: string;
  name: string;
  type: 'Command' | 'Query';
  async: boolean;
  preconditions: string[];
  postconditions: string[];
  permissions: string[];
}

export interface BadlEntity {
  id: string;
  name: string;
  domain: string;
  description: string;
  fields: BadlField[];
  capabilities: BadlCapability[];
  contracts: string[];
}

export interface BadlAstPayload {
  schemaVersion: string;
  application: string;
  generatedAt: string;
  entities: BadlEntity[];
}

/**
 * Generates a deterministic heavy BADL AST payload simulating a large enterprise application.
 * @param entityCount Number of entities to generate (default: 500 for NFR-PERF-002 benchmark).
 */
export function generateHeavyAstFixture(entityCount = 500): BadlAstPayload {
  const domains = [
    'Sales',
    'Inventory',
    'Finance',
    'HR',
    'Support',
    'Analytics',
    'Logistics',
    'Marketing',
    'Billing',
    'Compliance',
  ];
  const fieldTemplates = [
    { name: 'id', type: 'string', required: true, rule: 'uuid' },
    { name: 'code', type: 'string', required: true, rule: 'alphanumeric' },
    { name: 'name', type: 'string', required: true, rule: 'max_length:255' },
    { name: 'description', type: 'string', required: false, rule: 'max_length:1000' },
    {
      name: 'status',
      type: 'string',
      required: true,
      rule: 'enum:active,inactive,pending,archived',
    },
    { name: 'category', type: 'string', required: false, rule: 'max_length:100' },
    { name: 'amount', type: 'number', required: false, rule: 'min:0' },
    { name: 'taxRate', type: 'number', required: false, rule: 'range:0,100' },
    { name: 'quantity', type: 'integer', required: false, rule: 'min:0' },
    { name: 'isApproved', type: 'boolean', required: true, rule: 'boolean' },
    { name: 'ownerEmail', type: 'string', required: true, rule: 'email' },
    { name: 'createdAt', type: 'datetime', required: true, rule: 'iso_date' },
    { name: 'updatedAt', type: 'datetime', required: true, rule: 'iso_date' },
    { name: 'version', type: 'integer', required: true, rule: 'min:1' },
    { name: 'metadataJson', type: 'json', required: false, rule: 'valid_json' },
    { name: 'tags', type: 'array', required: false, rule: 'max_items:50' },
    { name: 'priority', type: 'integer', required: false, rule: 'range:1,5' },
    { name: 'externalRef', type: 'string', required: false, rule: 'max_length:100' },
  ];

  const entities: BadlEntity[] = [];

  for (let i = 1; i <= entityCount; i++) {
    const domain = domains[(i - 1) % domains.length];
    const entityName = `${domain}Entity${i}`;

    const fields: BadlField[] = fieldTemplates.map(tmpl => ({
      name: tmpl.name,
      type: tmpl.type,
      label: `${entityName} ${tmpl.name}`,
      required: tmpl.required,
      metadata_path: `${entityName}.${tmpl.name}`,
      validation: [{ rule: tmpl.rule }],
    }));

    const capabilities: BadlCapability[] = [
      {
        id: `cap_create_${i}`,
        name: `Create${entityName}`,
        type: 'Command',
        async: false,
        preconditions: [`User.isAuthenticated()`, `${entityName}.codeIsUnique()`],
        postconditions: [`${entityName}.isPersisted()`, `AuditLog.record('create')`],
        permissions: ['role:admin', 'role:manager'],
      },
      {
        id: `cap_get_${i}`,
        name: `Get${entityName}ById`,
        type: 'Query',
        async: false,
        preconditions: [`User.hasPermission('read')`],
        postconditions: [],
        permissions: ['role:admin', 'role:manager', 'role:user'],
      },
      {
        id: `cap_update_${i}`,
        name: `Update${entityName}`,
        type: 'Command',
        async: true,
        preconditions: [`User.isAuthenticated()`, `${entityName}.exists()`],
        postconditions: [`${entityName}.updatedAt.isCurrent()`],
        permissions: ['role:admin'],
      },
      {
        id: `cap_delete_${i}`,
        name: `Delete${entityName}`,
        type: 'Command',
        async: true,
        preconditions: [`User.isSystemAdmin()`],
        postconditions: [`${entityName}.isSoftDeleted()`],
        permissions: ['role:superadmin'],
      },
      {
        id: `cap_list_${i}`,
        name: `List${entityName}s`,
        type: 'Query',
        async: false,
        preconditions: [],
        postconditions: [],
        permissions: ['role:user'],
      },
    ];

    entities.push({
      id: `ent_${i}`,
      name: entityName,
      domain,
      description: `BADL Enterprise Entity definition for ${entityName} in ${domain} domain`,
      fields,
      capabilities,
      contracts: ['standard-read', 'standard-write', 'destructive-action'],
    });
  }

  return {
    schemaVersion: '1.0.0',
    application: 'HeavyBenchmarkApp',
    generatedAt: '2026-07-31T00:00:00.000Z', // Fixed timestamp for determinism
    entities,
  };
}

/**
 * Recursively counts total AST nodes in a BADL AST payload.
 */
export function countAstNodes(payload: unknown): number {
  if (payload === null || typeof payload !== 'object') {
    return 1;
  }
  let count = 1;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      count += countAstNodes(item);
    }
  } else {
    for (const key of Object.keys(payload as Record<string, unknown>)) {
      count += countAstNodes((payload as Record<string, unknown>)[key]);
    }
  }
  return count;
}
