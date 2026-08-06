import Ajv2020 from 'ajv/dist/2020';
import * as schema from '../schemas/design-tokens.schema.json';
import * as baseTokens from '../tokens/base.json';
import * as semanticTokens from '../tokens/semantic.json';

describe('Design Tokens Schema Validation', () => {
  let ajv: Ajv2020;
  let validate: ReturnType<Ajv2020['compile']>;

  beforeEach(() => {
    ajv = new Ajv2020({ strict: false, allErrors: true });
    validate = ajv.compile(schema);
  });

  it('should validate base tokens successfully', () => {
    const valid = validate(baseTokens);
    if (!valid) {
      console.log(validate.errors);
    }
    expect(valid).toBe(true);
  });

  it('should validate semantic tokens successfully', () => {
    const valid = validate(semanticTokens);
    if (!valid) {
      console.log(validate.errors);
    }
    expect(valid).toBe(true);
  });

  it('should fail if $type is invalid in a token', () => {
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
    const valid = validate(invalidToken);
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
    const valid = validate(invalidToken);
    expect(valid).toBe(false);
  });
});
