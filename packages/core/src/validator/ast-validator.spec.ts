import { CanonicalAST } from '../types/ast';
import { validateAST, MAX_AST_DEPTH } from './ast-validator';

describe('AST Validation Engine', () => {
  it('should pass a valid Canonical AST', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'entity-1',
              name: 'User',
              fields: [
                {
                  id: 'field-1',
                  name: 'id',
                  type: 'string',
                  label: 'User ID',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
          ],
        },
      ],
    };
    expect(validateAST(ast)).toEqual([]);
  });

  it('should detect a circular dependency between two entities', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'entity-1',
              name: 'User',
              fields: [
                {
                  id: 'field-1',
                  name: 'profileId',
                  type: 'string',
                  references: 'entity-2',
                  label: 'Profile',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
            {
              id: 'entity-2',
              name: 'Profile',
              fields: [
                {
                  id: 'field-2',
                  name: 'userId',
                  type: 'string',
                  references: 'entity-1',
                  label: 'User',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
          ],
        },
      ],
    };
    const errors = validateAST(ast);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('CIRCULAR_REFERENCE');
    expect(errors[0].message).toMatch(
      /Circular dependency detected: entity-1 -> entity-2 -> entity-1/
    );
  });

  it('should detect a self-referencing circular dependency', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'entity-1',
              name: 'Category',
              fields: [
                {
                  id: 'field-1',
                  name: 'parent',
                  type: 'string',
                  references: 'entity-1',
                  label: 'Parent Category',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
          ],
        },
      ],
    };
    const errors = validateAST(ast);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('CIRCULAR_REFERENCE');
    expect(errors[0].message).toMatch(/Circular dependency detected: entity-1 -> entity-1/);
  });

  it('should report an error for missing referenced entities', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'entity-1',
              name: 'Order',
              fields: [
                {
                  id: 'field-1',
                  name: 'customerId',
                  type: 'string',
                  references: 'entity-missing',
                  label: 'Customer',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
          ],
        },
      ],
    };
    const errors = validateAST(ast);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('MISSING_REFERENCE');
    expect(errors[0].message).toMatch(
      /Invalid consumption rule: Entity "entity-missing" referenced by field "field-1" does not exist/
    );
  });

  it('should report an error for capabilities referencing missing entities', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'entity-1',
              name: 'Order',
              fields: [],
            },
          ],
          capabilities: [
            {
              id: 'cap-1',
              name: 'Create',
              description: 'create',
              type: 'Command',
              entityId: 'entity-missing',
              outcome_ref: [],
              preconditions: [],
              postconditions: [],
              permissions: [{ role: 'admin' }],
              risk_level: 'low',
              interaction_contract_ref: 'ref',
              async: false,
            },
          ],
        },
      ],
    };
    const errors = validateAST(ast);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('MISSING_REFERENCE');
    expect(errors[0].message).toMatch(
      /Invalid capability reference: Entity "entity-missing" referenced by capability "cap-1" does not exist/
    );
  });

  it('should report an error if multiple domains declare the same entity ID', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'entity-1',
              name: 'User',
              fields: [],
            },
          ],
        },
        {
          id: 'domain-2',
          name: 'Auth',
          version: '1.0.0',
          domain: 'auth',
          entities: [
            {
              id: 'entity-1',
              name: 'AnotherUser',
              fields: [],
            },
          ],
        },
      ],
    };
    const errors = validateAST(ast);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('DUPLICATE_ID');
    expect(errors[0].message).toMatch(/Duplicate entity ID found: entity-1/);
  });

  it('should detect a three-node cycle', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'A',
              name: 'A',
              fields: [
                {
                  id: 'f1',
                  name: 'f1',
                  type: 'string',
                  references: 'B',
                  label: 'L',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
            {
              id: 'B',
              name: 'B',
              fields: [
                {
                  id: 'f2',
                  name: 'f2',
                  type: 'string',
                  references: 'C',
                  label: 'L',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
            {
              id: 'C',
              name: 'C',
              fields: [
                {
                  id: 'f3',
                  name: 'f3',
                  type: 'string',
                  references: 'A',
                  label: 'L',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
          ],
        },
      ],
    };
    const errors = validateAST(ast);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('CIRCULAR_REFERENCE');
    expect(errors[0].message).toMatch(
      /Circular dependency detected: A -> B -> C -> A|B -> C -> A -> B|C -> A -> B -> C/
    );
  });

  it('should pass an entity with empty fields array', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'empty-entity',
              name: 'Empty',
              fields: [],
            },
          ],
        },
      ],
    };
    expect(validateAST(ast)).toEqual([]);
  });

  it('should pass a valid diamond dependency graph without false positive cycles', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'Top',
              name: 'Top',
              fields: [
                {
                  id: 'f1',
                  name: 'f1',
                  type: 'string',
                  references: 'Left',
                  label: 'L',
                  validation: [],
                  metadata_path: '',
                },
                {
                  id: 'f2',
                  name: 'f2',
                  type: 'string',
                  references: 'Right',
                  label: 'L',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
            {
              id: 'Left',
              name: 'Left',
              fields: [
                {
                  id: 'f3',
                  name: 'f3',
                  type: 'string',
                  references: 'Bottom',
                  label: 'L',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
            {
              id: 'Right',
              name: 'Right',
              fields: [
                {
                  id: 'f4',
                  name: 'f4',
                  type: 'string',
                  references: 'Bottom',
                  label: 'L',
                  validation: [],
                  metadata_path: '',
                },
              ],
            },
            {
              id: 'Bottom',
              name: 'Bottom',
              fields: [],
            },
          ],
        },
      ],
    };
    expect(validateAST(ast)).toEqual([]);
  });

  it('should report an error when MAX_AST_DEPTH is exceeded', () => {
    const entities = [];
    for (let i = 0; i <= MAX_AST_DEPTH + 1; i++) {
      entities.push({
        id: `e${i}`,
        name: `e${i}`,
        fields: [
          {
            id: `f${i}`,
            name: `f${i}`,
            type: 'string' as const,
            references: `e${i + 1}`,
            label: `f${i}`,
            validation: [],
            metadata_path: '',
          },
        ],
      });
    }
    // Add the last entity that has no references
    entities.push({
      id: `e${MAX_AST_DEPTH + 2}`,
      name: `e${MAX_AST_DEPTH + 2}`,
      fields: [],
    });

    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Core',
          version: '1.0.0',
          domain: 'core',
          entities: entities,
        },
      ],
    };

    const errors = validateAST(ast);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.type === 'MAX_DEPTH_EXCEEDED')).toBe(true);
  });

  describe('Contract Validation', () => {
    it('should pass when entity correctly implements a contract', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            contracts: [
              {
                id: 'contract-1',
                name: 'Renderable',
                requiredFields: [{ name: 'title', type: 'string' }],
                requiredCapabilities: [{ name: 'Read', type: 'Query' }],
              },
            ],
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                implements: ['contract-1'],
                fields: [
                  {
                    id: 'f1',
                    name: 'title',
                    type: 'string',
                    label: 'Title',
                    validation: [],
                    metadata_path: '',
                  },
                ],
              },
            ],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read Article',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [{ role: 'admin' }],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      expect(validateAST(ast)).toEqual([]);
    });

    it('should fail when entity is missing a required contract field', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            contracts: [
              {
                id: 'contract-1',
                name: 'Renderable',
                requiredFields: [{ name: 'title', type: 'string' }],
                requiredCapabilities: [],
              },
            ],
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                implements: ['contract-1'],
                fields: [],
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('CONTRACT_BREACH');
      expect(errors[0].message).toMatch(
        /Entity "entity-1" missing required field "title" for contract "contract-1"/
      );
    });

    it('should fail when entity is missing a required contract capability', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            contracts: [
              {
                id: 'contract-1',
                name: 'Renderable',
                requiredFields: [],
                requiredCapabilities: [{ name: 'Read', type: 'Query' }],
              },
            ],
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                implements: ['contract-1'],
                fields: [],
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('CONTRACT_BREACH');
      expect(errors[0].message).toMatch(
        /Entity "entity-1" missing required capability "Read" \(Query\) for contract "contract-1"/
      );
    });

    it('should fail when entity field has wrong type for contract', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            contracts: [
              {
                id: 'contract-1',
                name: 'Renderable',
                requiredFields: [{ name: 'title', type: 'string' }],
                requiredCapabilities: [],
              },
            ],
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                implements: ['contract-1'],
                fields: [
                  {
                    id: 'f1',
                    name: 'title',
                    type: 'number',
                    label: 'Title',
                    validation: [],
                    metadata_path: '',
                  },
                ],
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('CONTRACT_BREACH');
      expect(errors[0].message).toMatch(
        /Entity "entity-1" field "title" has type "number" but contract "contract-1" requires "string"/
      );
    });

    it('should fail when multiple contracts have the same ID', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            contracts: [
              {
                id: 'contract-1',
                name: 'First',
                requiredFields: [],
                requiredCapabilities: [],
              },
              {
                id: 'contract-1',
                name: 'Duplicate',
                requiredFields: [],
                requiredCapabilities: [],
              },
            ],
            entities: [],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('DUPLICATE_ID');
      expect(errors[0].message).toMatch(/Duplicate contract ID found: contract-1/);
    });

    it('should fail when an entity implements a non-existent contract', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                implements: ['missing-contract'],
                fields: [],
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('MISSING_REFERENCE');
      expect(errors[0].message).toMatch(
        /Entity "entity-1" implements missing contract "missing-contract"/
      );
    });

    it('should pass cross-boundary capability verification', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            contracts: [
              {
                id: 'contract-1',
                name: 'Searchable',
                requiredFields: [],
                requiredCapabilities: [{ name: 'Read', type: 'Query' }],
              },
            ],
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                implements: ['contract-1'],
                fields: [],
              },
            ],
          },
          {
            id: 'domain-2',
            name: 'Search',
            version: '1.0.0',
            domain: 'search',
            entities: [],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Search Article',
                type: 'Query',
                entityId: 'entity-1', // Capability in domain-2 targets entity in domain-1
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [{ role: 'admin' }],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toEqual([]); // Should pass cross-boundary capability check
    });
  });
  describe('Security Validation', () => {
    it('should pass when capability has valid permissions', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                fields: [],
              },
            ],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read Article',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [{ role: 'admin', access: 'grant' }],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      expect(validateAST(ast)).toEqual([]);
    });

    it('should fail with UNSECURED_CAPABILITY when permissions array is empty', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                fields: [],
              },
            ],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read Article',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('UNSECURED_CAPABILITY');
      expect(errors[0].message).toMatch(
        /Capability "cap-1" is unsecured. Fail-closed policy requires at least one permission/
      );
      expect(errors[0].path).toBe('domains[0].capabilities[0].permissions');
    });

    it('should fail with UNSECURED_CAPABILITY when permissions is missing', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                fields: [],
              },
            ],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read Article',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                risk_level: 'low',
                async: false,
              } as any,
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('UNSECURED_CAPABILITY');
    });

    it('should fail with INVALID_PERMISSION when permission is missing role', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [
              {
                id: 'entity-1',
                name: 'Article',
                fields: [],
              },
            ],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read Article',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [{ access: 'grant' } as any],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('INVALID_PERMISSION');
      expect(errors[0].message).toMatch(/invalid permission definition/);
      expect(errors[0].path).toBe('domains[0].capabilities[0].permissions[0]');
    });

    it('should fail with INVALID_PERMISSION when permission is null', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [{ id: 'entity-1', name: 'Article', fields: [] }],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [null as any],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('INVALID_PERMISSION');
      expect(errors[0].message).toMatch(/invalid permission definition/);
    });

    it('should fail with INVALID_PERMISSION when access is invalid', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [{ id: 'entity-1', name: 'Article', fields: [] }],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [{ role: 'admin', access: 'unknown' } as any],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('INVALID_PERMISSION');
      expect(errors[0].message).toMatch(/invalid access definition/);
      expect(errors[0].path).toBe('domains[0].capabilities[0].permissions[0].access');
    });

    it('should trim role strings and default access to grant', () => {
      const ast: CanonicalAST = {
        schemaVersion: '1.0.0',
        domains: [
          {
            id: 'domain-1',
            name: 'Core',
            version: '1.0.0',
            domain: 'core',
            entities: [{ id: 'entity-1', name: 'Article', fields: [] }],
            capabilities: [
              {
                id: 'cap-1',
                name: 'Read',
                description: 'Read',
                type: 'Query',
                entityId: 'entity-1',
                outcome_ref: [],
                preconditions: [],
                postconditions: [],
                permissions: [{ role: ' admin  ' }],
                risk_level: 'low',
                async: false,
              },
            ],
          },
        ],
      };
      const errors = validateAST(ast);
      expect(errors).toHaveLength(0);
      expect(ast.domains[0].capabilities![0].permissions[0].role).toBe('admin');
      expect(ast.domains[0].capabilities![0].permissions[0].access).toBe('grant');
    });
  });
});
