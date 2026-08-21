import { CanonicalAST } from '../types/ast';
import { serializeAST } from './serializer';

describe('AST Serializer', () => {
  it('should embed schemaVersion in the root payload', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [],
    };

    const [result, errors] = serializeAST(ast);
    expect(errors).toHaveLength(0);
    const parsed = JSON.parse(result as string);
    expect(parsed.schemaVersion).toBe('1.0.0');
  });

  it('should guarantee deterministic object key ordering', () => {
    const ast1 = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1',
          domain: 'example',
          entities: [],
        },
      ],
    };

    const ast2 = {
      domains: [
        {
          name: 'Domain 1',
          id: 'domain-1',
          domain: 'example',
          version: '1',
          entities: [],
        },
      ],
      schemaVersion: '1.0.0',
    };

    const [serialized1, errors1] = serializeAST(ast1 as unknown as CanonicalAST);
    const [serialized2, errors2] = serializeAST(ast2 as unknown as CanonicalAST);

    expect(errors1).toHaveLength(0);
    expect(errors2).toHaveLength(0);
    expect(serialized1).toBe(serialized2);
  });

  it('should guarantee array sorting by id', () => {
    const ast1: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1',
          domain: 'example',
          entities: [
            {
              id: 'entity-b',
              name: 'Entity B',
              fields: [],
            },
            {
              id: 'entity-a',
              name: 'Entity A',
              fields: [],
            },
          ],
        },
      ],
    };

    const ast2: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1',
          domain: 'example',
          entities: [
            {
              id: 'entity-a',
              name: 'Entity A',
              fields: [],
            },
            {
              id: 'entity-b',
              name: 'Entity B',
              fields: [],
            },
          ],
        },
      ],
    };

    const [serialized1, errors1] = serializeAST(ast1);
    const [serialized2, errors2] = serializeAST(ast2);

    expect(errors1).toHaveLength(0);
    expect(errors2).toHaveLength(0);
    expect(serialized1).toBe(serialized2);

    const parsed = JSON.parse(serialized1 as string);
    expect(parsed.domains[0].entities[0].id).toBe('entity-a');
    expect(parsed.domains[0].entities[1].id).toBe('entity-b');
  });

  it('should guarantee array sorting by name if id is missing', () => {
    const ast1 = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1',
          domain: 'example',
          entities: [
            { name: 'Cap B', type: 'Query' },
            { name: 'Cap A', type: 'Query' },
          ],
          capabilities: [],
        },
      ],
    };

    const ast2 = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1',
          domain: 'example',
          entities: [
            { name: 'Cap A', type: 'Query' },
            { name: 'Cap B', type: 'Query' },
          ],
          capabilities: [],
        },
      ],
    };

    const [serialized1, errors1] = serializeAST(ast1 as unknown as CanonicalAST);
    const [serialized2, errors2] = serializeAST(ast2 as unknown as CanonicalAST);

    expect(errors1).toHaveLength(0);
    expect(errors2).toHaveLength(0);
    expect(serialized1).toBe(serialized2);

    const parsed = JSON.parse(serialized1 as string);
    expect(parsed.domains[0].entities[0].name).toBe('Cap A');
    expect(parsed.domains[0].entities[1].name).toBe('Cap B');
  });

  it('should return errors if schemaVersion is missing', () => {
    const ast = { domains: [] } as unknown as CanonicalAST;
    const [result, errors] = serializeAST(ast);
    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('INVALID_FORMAT');
  });

  it('should return errors if domains is missing or not an array', () => {
    const ast = { schemaVersion: '1.0.0' } as unknown as CanonicalAST;
    const [result, errors] = serializeAST(ast);
    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('INVALID_FORMAT');
  });

  it('should guarantee array sorting for primitive arrays', () => {
    const ast1 = {
      schemaVersion: '1.0.0',
      domains: [],
      tags: ['b', 'a', 'c'],
    } as unknown as CanonicalAST;
    const ast2 = {
      schemaVersion: '1.0.0',
      domains: [],
      tags: ['c', 'b', 'a'],
    } as unknown as CanonicalAST;
    const [serialized1] = serializeAST(ast1);
    const [serialized2] = serializeAST(ast2);
    expect(serialized1).toBe(serialized2);
    expect(JSON.parse(serialized1 as string).tags).toEqual(['a', 'b', 'c']);
  });

  it('should guarantee array sorting prioritizes id over name', () => {
    const ast1 = {
      schemaVersion: '1.0.0',
      domains: [],
      items: [
        { id: '2', name: 'A' },
        { id: '1', name: 'B' },
      ],
    };
    const [serialized] = serializeAST(ast1 as unknown as CanonicalAST);
    const parsed = JSON.parse(serialized as string);
    expect(parsed.items[0].id).toBe('1');
    expect(parsed.items[1].id).toBe('2');
  });

  it('should detect circular references during canonicalization', () => {
    const ast = { schemaVersion: '1.0.0', domains: [] } as unknown as CanonicalAST;
    (ast as any).self = ast;
    const [result, errors] = serializeAST(ast);
    expect(result).toBeNull();
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('CIRCULAR_REFERENCE');
  });

  it('should not mutate the original AST object', () => {
    const ast1: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'test_domain',
          name: 'Test Domain',
          version: '1.0.0',
          domain: 'example',
          entities: [
            { id: 'B_Entity', name: 'B Entity', fields: [] },
            { id: 'A_Entity', name: 'A Entity', fields: [] },
          ],
        },
      ],
    };

    const originalJson = JSON.stringify(ast1);
    serializeAST(ast1);
    expect(JSON.stringify(ast1)).toBe(originalJson);
  });

  it('should return INVALID_TYPE on unsupported types', () => {
    const astWithRegex = {
      schemaVersion: '1.0.0',
      domains: [],
      pattern: /abc/,
    };

    const [result, errors] = serializeAST(astWithRegex as unknown as CanonicalAST);
    expect(result).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].type).toBe('INVALID_TYPE');
  });

  it('should return MAX_DEPTH_EXCEEDED on excessively deep AST structures', () => {
    // Generate an AST that exceeds MAX_AST_DEPTH (250)
    let deepObject: Record<string, unknown> = {
      id: 'deep_entity',
      name: 'Deep Entity',
      fields: [],
    };
    for (let i = 0; i < 260; i++) {
      deepObject = { child: deepObject };
    }

    const deepAst = {
      schemaVersion: '1.0.0',
      domains: [
        { id: 'test_domain', name: 'Test Domain', version: '1.0.0', entities: [deepObject] },
      ],
    };

    const [result, errors] = serializeAST(deepAst as unknown as CanonicalAST);
    expect(result).toBeNull();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].type).toBe('MAX_DEPTH_EXCEEDED');
  });

  it('should canonically serialize nested recursive fields without payload bloat or key corruption', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1.0.0',
          domain: 'example',
          entities: [
            {
              id: 'entity-1',
              name: 'Entity 1',
              fields: [
                {
                  id: 'field-1',
                  name: 'parent',
                  type: 'object',
                  label: 'Parent',
                  validation: ['required'],
                  metadata_path: 'parent',
                  fields: [
                    {
                      id: 'field-1-1',
                      name: 'child',
                      type: 'string',
                      label: 'Child',
                      validation: ['required'],
                      metadata_path: 'parent.child',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const [serialized, errors] = serializeAST(ast);
    expect(errors).toHaveLength(0);
    expect(serialized).not.toBeNull();
    const parsed = JSON.parse(serialized as string);
    expect(parsed.domains[0].entities[0].fields[0].fields[0].id).toBe('field-1-1');
  });
});
