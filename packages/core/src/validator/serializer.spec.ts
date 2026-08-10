import { CanonicalAST } from '../types/ast';
import { serializeAST } from './serializer';

describe('AST Serializer', () => {
  it('should embed schemaVersion in the root payload', () => {
    const ast: CanonicalAST = {
      schemaVersion: '1.0.0',
      domains: [],
    };

    const result = serializeAST(ast);
    const parsed = JSON.parse(result);
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

    // Cast as any because ast1 and ast2 are structured differently in memory
    const serialized1 = serializeAST(ast1 as any);
    const serialized2 = serializeAST(ast2 as any);

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

    const serialized1 = serializeAST(ast1);
    const serialized2 = serializeAST(ast2);

    expect(serialized1).toBe(serialized2);

    // Ensure it's sorted alphabetically by ID
    const parsed = JSON.parse(serialized1);
    expect(parsed.domains[0].entities[0].id).toBe('entity-a');
    expect(parsed.domains[0].entities[1].id).toBe('entity-b');
  });

  it('should guarantee array sorting by name if id is missing', () => {
    const ast1: any = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1',
          domain: 'example',
          entities: [],
          capabilities: [
            { name: 'Cap B', type: 'Query', entityId: 'e' },
            { name: 'Cap A', type: 'Query', entityId: 'e' },
          ],
        },
      ],
    };

    const ast2: any = {
      schemaVersion: '1.0.0',
      domains: [
        {
          id: 'domain-1',
          name: 'Domain 1',
          version: '1',
          domain: 'example',
          entities: [],
          capabilities: [
            { name: 'Cap A', type: 'Query', entityId: 'e' },
            { name: 'Cap B', type: 'Query', entityId: 'e' },
          ],
        },
      ],
    };

    const serialized1 = serializeAST(ast1);
    const serialized2 = serializeAST(ast2);

    expect(serialized1).toBe(serialized2);

    // Ensure it's sorted alphabetically by name
    const parsed = JSON.parse(serialized1);
    expect(parsed.domains[0].capabilities[0].name).toBe('Cap A');
    expect(parsed.domains[0].capabilities[1].name).toBe('Cap B');
  });

  it('should throw if schemaVersion is missing', () => {
    const ast: any = { domains: [] };
    expect(() => serializeAST(ast)).toThrow('Invalid AST: Missing schemaVersion');
  });

  it('should throw if domains is missing or not an array', () => {
    const ast: any = { schemaVersion: '1.0.0' };
    expect(() => serializeAST(ast)).toThrow('Invalid AST: domains must be an array');
  });

  it('should guarantee array sorting for primitive arrays', () => {
    const ast1: any = { schemaVersion: '1.0.0', domains: [], tags: ['b', 'a', 'c'] };
    const ast2: any = { schemaVersion: '1.0.0', domains: [], tags: ['c', 'b', 'a'] };
    const serialized1 = serializeAST(ast1);
    const serialized2 = serializeAST(ast2);
    expect(serialized1).toBe(serialized2);
    expect(JSON.parse(serialized1).tags).toEqual(['a', 'b', 'c']);
  });

  it('should guarantee array sorting prioritizes id over name', () => {
    const ast1: any = {
      schemaVersion: '1.0.0',
      domains: [],
      items: [
        { id: '2', name: 'A' },
        { id: '1', name: 'B' },
      ],
    };
    // Expected to sort by id ('1' then '2'), so B comes before A
    const serialized = serializeAST(ast1);
    const parsed = JSON.parse(serialized);
    expect(parsed.items[0].id).toBe('1');
    expect(parsed.items[1].id).toBe('2');
  });

  it('should detect and throw on circular references', () => {
    const ast: any = { schemaVersion: '1.0.0', domains: [] };
    ast.self = ast;
    expect(() => serializeAST(ast)).toThrow('Invalid AST: Circular reference detected');
  });

  it('should throw on unsupported types like Date', () => {
    const ast: any = { schemaVersion: '1.0.0', domains: [], date: new Date() };
    expect(() => serializeAST(ast)).toThrow('Invalid AST: Unsupported type Date');
  });
});
