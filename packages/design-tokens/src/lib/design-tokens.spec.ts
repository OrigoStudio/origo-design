import Ajv2020 from 'ajv/dist/2020';
import baseSchema from '../schemas/base-tokens.schema.json';
import semanticSchema from '../schemas/semantic-tokens.schema.json';
import baseTokens from '../tokens/base.json';
import semanticTokens from '../tokens/semantic.json';

describe('Design Tokens Schema Validation', () => {
  let ajv: Ajv2020;
  let validateBase: ReturnType<Ajv2020['compile']>;
  let validateSemantic: ReturnType<Ajv2020['compile']>;

  beforeEach(() => {
    ajv = new Ajv2020({ strict: false, allErrors: true });
    validateBase = ajv.compile(baseSchema);
    validateSemantic = ajv.compile(semanticSchema);
  });

  it('should validate base tokens successfully', () => {
    const valid = validateBase(baseTokens);
    if (!valid) {
      console.log(validateBase.errors);
    }
    expect(valid).toBe(true);
  });

  it('should validate semantic tokens successfully', () => {
    const valid = validateSemantic(semanticTokens);
    if (!valid) {
      console.log(validateSemantic.errors);
    }
    expect(valid).toBe(true);
  });

  it('should fail if $type is invalid in a base token', () => {
    const invalidToken = {
      color: {
        base: {
          blue: {
            100: {
              $value: '#ffffff',
              $type: 'not-a-valid-type',
            },
          },
        },
      },
    };
    const valid = validateBase(invalidToken);
    expect(valid).toBe(false);
  });

  it('should fail if additional properties are present in a token', () => {
    const invalidToken = {
      color: {
        base: {
          blue: {
            100: {
              $value: '#fff',
              $type: 'color',
              invalidProperty: 'test',
            },
          },
        },
      },
    };
    const valid = validateBase(invalidToken);
    expect(valid).toBe(false);
  });

  it('should fail if a token group uses a reserved keyword as a nested property name', () => {
    const invalidTokenGroup = {
      color: {
        base: {
          validGroup: {
            $value: '#000',
            $type: 'color',
          },
          $value: {
            $value: '#fff',
            $type: 'color',
          },
        },
      },
    };
    const valid = validateBase(invalidTokenGroup);
    expect(valid).toBe(false);
  });

  it('should enforce semantic token $value constraint', () => {
    const invalidSemanticToken = {
      color: {
        surface: {
          primary: {
            $value: '#ffffff', // must be a reference e.g. "{color.base.blue.100}"
            $type: 'color',
          },
        },
      },
    };
    const valid = validateSemantic(invalidSemanticToken);
    expect(valid).toBe(false);
  });

  it('should fail on invalid alias references in semantic tokens', () => {
    // Helper to traverse and validate references exist in baseTokens
    const validateReferences = (obj: unknown) => {
      let isValid = true;
      const traverse = (node: unknown) => {
        if (node && typeof node === 'object' && !Array.isArray(node)) {
          const nodeRecord = node as Record<string, unknown>;
          const val = nodeRecord['$value'];
          if (
            '$value' in node &&
            typeof val === 'string' &&
            val.startsWith('{') &&
            val.endsWith('}')
          ) {
            const path = val.slice(1, -1).split('.');
            let current: unknown = baseTokens;
            // The default export for json files in this TS configuration adds an extra wrapper or behaves directly depending on esModuleInterop
            // For safety, we traverse carefully
            for (const key of path) {
              if (current && typeof current === 'object' && key in current) {
                current = (current as Record<string, unknown>)[key];
              } else {
                isValid = false;
                break;
              }
            }
          } else {
            Object.values(node).forEach(traverse);
          }
        }
      };
      traverse(obj);
      return isValid;
    };

    expect(validateReferences(semanticTokens)).toBe(true);

    const invalidReferenceObj = {
      color: {
        text: {
          primary: {
            $value: '{color.base.nonexistent.100}',
            $type: 'color',
          },
        },
      },
    };

    expect(validateReferences(invalidReferenceObj)).toBe(false);
  });
});
