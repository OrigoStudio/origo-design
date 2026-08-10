import Ajv, { ErrorObject } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import * as domainSchema from '../schemas/domain.schema.json';
import * as entitySchema from '../schemas/entity.schema.json';

export interface ValidatorOptions {
  maxDepth?: number;
}

export class BADLValidator {
  private ajv: Ajv;
  public errors: ErrorObject[] | null | undefined = null;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
    });

    addFormats(this.ajv);
    addErrors(this.ajv);

    const resolvedEntitySchema =
      (entitySchema as Record<string, unknown>)['default'] ?? entitySchema;
    const resolvedDomainSchema =
      (domainSchema as Record<string, unknown>)['default'] ?? domainSchema;

    this.ajv.addSchema(resolvedEntitySchema, 'https://origo.design/schemas/v1/entity.schema.json');
    this.ajv.addSchema(resolvedDomainSchema, 'https://origo.design/schemas/v1/domain.schema.json');
  }

  private checkCircularDependency(
    obj: unknown,
    currentDepth: number,
    maxDepth: number,
    visited: Set<unknown>
  ) {
    if (currentDepth > maxDepth) {
      throw new Error('Maximum depth exceeded. Possible circular dependency detected.');
    }

    if (obj && typeof obj === 'object') {
      if (visited.has(obj)) {
        throw new Error('Maximum depth exceeded. Possible circular dependency detected.');
      }
      visited.add(obj);

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          this.checkCircularDependency(
            (obj as Record<string, unknown>)[key],
            currentDepth + 1,
            maxDepth,
            visited
          );
        }
      }
      visited.delete(obj);
    }
  }

  validateDomain(data: unknown, options: ValidatorOptions = {}): boolean {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        this.errors = [
          {
            keyword: 'parse',
            message: 'Invalid JSON string',
            instancePath: '',
            schemaPath: '',
            params: {},
          },
        ];
        return false;
      }
    }
    const maxDepth = options.maxDepth || 100;
    this.checkCircularDependency(data, 0, maxDepth, new Set());

    const validate = this.ajv.getSchema('https://origo.design/schemas/v1/domain.schema.json');
    if (!validate) {
      throw new Error('Domain schema not found');
    }

    const isValid = validate(data);
    this.errors = isValid ? null : validate.errors;
    return isValid as boolean;
  }

  validateEntity(data: unknown, options: ValidatorOptions = {}): boolean {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        this.errors = [
          {
            keyword: 'parse',
            message: 'Invalid JSON string',
            instancePath: '',
            schemaPath: '',
            params: {},
          },
        ];
        return false;
      }
    }
    const maxDepth = options.maxDepth || 100;
    this.checkCircularDependency(data, 0, maxDepth, new Set());

    const validate = this.ajv.getSchema('https://origo.design/schemas/v1/entity.schema.json');
    if (!validate) {
      throw new Error('Entity schema not found');
    }

    const isValid = validate(data);
    this.errors = isValid ? null : validate.errors;
    return isValid as boolean;
  }
}
