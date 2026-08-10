import { CanonicalAST } from '../types/ast';
import { validateAST } from './ast-validator';

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
    expect(() => validateAST(ast)).not.toThrow();
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
    expect(() => validateAST(ast)).toThrow(
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
    expect(() => validateAST(ast)).toThrow(/Circular dependency detected: entity-1 -> entity-1/);
  });

  it('should throw an error for missing referenced entities', () => {
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
    expect(() => validateAST(ast)).toThrow(
      /Invalid consumption rule: Entity "entity-missing" referenced by field "field-1" does not exist/
    );
  });

  it('should throw an error if multiple domains declare the same entity ID (if unique entity IDs are required globally)', () => {
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
    expect(() => validateAST(ast)).toThrow(/Duplicate entity ID found: entity-1/);
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
    expect(() => validateAST(ast)).toThrow(
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
    expect(() => validateAST(ast)).not.toThrow();
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
    expect(() => validateAST(ast)).not.toThrow();
  });
});
