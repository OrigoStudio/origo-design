import { CompilerWorker } from './compiler.worker';

describe('CompilerWorker', () => {
  let worker: CompilerWorker;

  beforeEach(() => {
    worker = new CompilerWorker();
  });

  it('should return an error for empty string', async () => {
    const result = await worker.compile('');
    expect(result.ast).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe('Empty document');
  });

  it('should return syntax errors for invalid JSON', async () => {
    const result = await worker.compile('{ invalid json ');
    expect(result.ast).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].type).toBe('Syntax Error');
  });

  it('should return semantic errors for invalid AST relationships', async () => {
    const astJson = JSON.stringify({
      schemaVersion: '1.0',
      domains: [
        {
          id: 'test-domain',
          name: 'Test',
          version: '1.0.0',
          domain: 'core',
          entities: [
            {
              id: 'test-entity',
              name: 'Test Entity',
              fields: [
                {
                  id: 'field-1',
                  name: 'Ref Field',
                  type: 'string',
                  references: 'non-existent-entity',
                },
              ],
            },
          ],
        },
      ],
    });

    const result = await worker.compile(astJson);
    expect(result.ast).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].type).toBe('Semantic Error');
  });

  it('should return AST for valid input', async () => {
    const astJson = JSON.stringify({
      id: 'test-domain',
      name: 'Test',
      version: '1.0.0',
      domain: 'core',
      entities: [
        {
          id: 'test-entity',
          name: 'Test Entity',
          fields: [],
        },
      ],
    });

    const result = await worker.compile(astJson);
    expect(result.errors).toBeUndefined();
    expect(result.ast).toBeDefined();
    expect(result.ast?.domains[0].id).toBe('test-domain');
  });
});
