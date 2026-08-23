import Ajv, { ErrorObject } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import addErrors from 'ajv-errors';
import { parse as parseJSONWithSourceMap } from 'json-source-map';
import * as domainSchema from '../schemas/domain.schema.json';
import * as entitySchema from '../schemas/entity.schema.json';
import * as capabilitySchema from '../schemas/capability.schema.json';
import * as contractSchema from '../schemas/contract.schema.json';
import * as permissionSchema from '../schemas/permission.schema.json';
import * as extensionSchema from '../schemas/extension.schema.json';

export interface ValidatorOptions {
  maxDepth?: number;
}

export interface EnhancedErrorObject extends ErrorObject {
  code?: string;
  context?: {
    line?: number;
    column?: number;
    [key: string]: unknown;
  };
}

export class BADLValidator {
  private ajv: Ajv;
  public errors: EnhancedErrorObject[] | null | undefined = null;

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
    const resolvedCapabilitySchema =
      (capabilitySchema as Record<string, unknown>)['default'] ?? capabilitySchema;
    const resolvedPermissionSchema =
      (permissionSchema as Record<string, unknown>)['default'] ?? permissionSchema;

    const resolvedContractSchema =
      (contractSchema as Record<string, unknown>)['default'] ?? contractSchema;

    const resolvedExtensionSchema =
      (extensionSchema as Record<string, unknown>)['default'] ?? extensionSchema;

    this.ajv.addSchema(
      resolvedCapabilitySchema,
      'https://origo.design/schemas/v1/capability.schema.json'
    );
    this.ajv.addSchema(
      resolvedContractSchema,
      'https://origo.design/schemas/v1/contract.schema.json'
    );
    this.ajv.addSchema(
      resolvedPermissionSchema,
      'https://origo.design/schemas/v1/permission.schema.json'
    );
    this.ajv.addSchema(
      resolvedExtensionSchema,
      'https://origo.design/schemas/v1/extension.schema.json'
    );
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

  private runValidation(schemaUrl: string, data: unknown, options: ValidatorOptions = {}): boolean {
    this.errors = null;
    let parsedData = data;
    let sourceMapPointers: Record<string, unknown> | undefined;

    if (typeof data === 'string') {
      try {
        const parsed = parseJSONWithSourceMap(data);
        parsedData = parsed.data;
        sourceMapPointers = parsed.pointers;
      } catch (err: unknown) {
        let line: number | undefined;
        let column: number | undefined;

        if (err && typeof err === 'object') {
          const errMsg = (err as Error).message || '';
          const match = /line (\d+) column (\d+)/.exec(errMsg);
          if (match) {
            line = parseInt(match[1], 10);
            column = parseInt(match[2], 10);
          }
        }

        this.errors = [
          {
            keyword: 'parse',
            message: (err as Error)?.message || 'Invalid JSON string',
            instancePath: '',
            schemaPath: '',
            params: {},
            code: 'parse',
            context: { line, column },
          },
        ];
        return false;
      }
    }

    if (typeof options.maxDepth === 'number' && options.maxDepth < 0) {
      throw new Error('maxDepth must be >= 0');
    }
    const maxDepth = options.maxDepth ?? 100;
    this.checkCircularDependency(parsedData, 0, maxDepth, new Set());

    const validate = this.ajv.getSchema(schemaUrl);
    if (!validate) {
      throw new Error(`Schema not found: ${schemaUrl}`);
    }

    const isValid = validate(parsedData);

    if (!isValid && validate.errors) {
      this.errors = validate.errors.map(err => {
        const newErr: EnhancedErrorObject = { ...err, code: err.keyword };
        if (sourceMapPointers) {
          const decodedPath = (err.instancePath ?? '').replace(/~1/g, '/').replace(/~0/g, '~');

          let lookupPath = decodedPath;
          if (
            err.keyword === 'additionalProperties' &&
            (err.params as Record<string, unknown>)['additionalProperty']
          ) {
            const additionalProperty = (err.params as Record<string, unknown>)[
              'additionalProperty'
            ] as string;
            const additionalPath = `${decodedPath === '' ? '' : decodedPath}/${additionalProperty.replace(/~/g, '~0').replace(/\//g, '~1')}`;
            if (sourceMapPointers[additionalPath]) {
              lookupPath = additionalPath;
            }
          }

          if (sourceMapPointers[lookupPath] !== undefined) {
            const pointer = sourceMapPointers[lookupPath] as {
              key?: { line: number; column: number };
              value?: { line: number; column: number };
            };
            const loc = pointer.key || pointer.value;
            if (loc != null) {
              newErr.context = {
                line: loc.line + 1,
                column: loc.column + 1,
              };
            }
          }
        }
        return newErr;
      });
    } else {
      this.errors = null;
    }

    return isValid as boolean;
  }

  validateDomain(data: unknown, options: ValidatorOptions = {}): boolean {
    return this.runValidation('https://origo.design/schemas/v1/domain.schema.json', data, options);
  }

  validateEntity(data: unknown, options: ValidatorOptions = {}): boolean {
    return this.runValidation('https://origo.design/schemas/v1/entity.schema.json', data, options);
  }
}

export * from './serializer';
export * from './ast-validator';
