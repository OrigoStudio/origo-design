/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { BADLValidator } from './index';
import targetPageFixture from '../schemas/__fixtures__/target-page.json';

describe('BADLValidator', () => {
  let validator: BADLValidator;

  beforeEach(() => {
    validator = new BADLValidator();
  });

  describe('Positive Test Cases', () => {
    it('should successfully validate the target-page fixture against Domain schema', () => {
      const isValid = validator.validateDomain(targetPageFixture);
      expect(validator.errors).toBeNull();
      expect(isValid).toBe(true);
    });

    it('should successfully validate a single Entity', () => {
      expect(targetPageFixture.entities.length).toBeGreaterThan(0);
      const entity = targetPageFixture.entities[0];
      const isValid = validator.validateEntity(entity);
      expect(validator.errors).toBeNull();
      expect(isValid).toBe(true);
    });

    it('should fail-closed on undeclared properties (additionalProperties: false)', () => {
      expect(targetPageFixture.entities.length).toBeGreaterThan(0);
      const entity = { ...targetPageFixture.entities[0], extraProp: 'should-fail-validation' };
      const isValid = validator.validateEntity(entity);
      expect(isValid).toBe(false);
      expect(validator.errors).toBeDefined();
      expect(validator.errors?.some(e => e.keyword === 'additionalProperties')).toBe(true);
    });

    it('should successfully validate deeply nested and recursive field definitions', () => {
      const recursiveEntity = {
        id: 'entity-recursive',
        name: 'RecursiveEntity',
        fields: [
          {
            id: 'field-parent',
            name: 'parentField',
            type: 'object',
            label: 'Parent Field',
            validation: ['required'],
            metadata_path: 'parent',
            fields: [
              {
                id: 'field-child',
                name: 'childField',
                type: 'string',
                label: 'Child Field',
                validation: ['required'],
                metadata_path: 'parent.child',
              },
            ],
          },
        ],
      };
      const isValid = validator.validateEntity(recursiveEntity);
      expect(validator.errors).toBeNull();
      expect(isValid).toBe(true);
    });
  });

  describe('Negative Test Cases', () => {
    it('should fail if Domain is missing required properties', () => {
      const { id, ...invalidDomain } = targetPageFixture as any;
      const isValid = validator.validateDomain(invalidDomain);
      expect(isValid).toBe(false);
      expect(validator.errors).toBeDefined();
      expect(validator.errors?.length).toBeGreaterThan(0);
    });

    it('should fail if Entity is missing required field properties', () => {
      const invalidEntity = {
        id: 'entity-invalid',
        name: 'Invalid',
        fields: [
          {
            id: 'field-1',
            name: 'missing-type-and-label',
          },
        ],
      };
      const isValid = validator.validateEntity(invalidEntity);
      expect(isValid).toBe(false);
      expect(validator.errors).toBeDefined();
    });

    it('should fail if Capability uses a non-CRUD+L verb for name', () => {
      const invalidDomain = {
        ...targetPageFixture,
        capabilities: [
          {
            id: 'cap-1',
            name: 'Initialize', // Invalid verb
            description: 'Init',
            type: 'Command',
            entityId: 'entity-1',
            outcome_ref: [],
            preconditions: [],
            postconditions: [],
            permissions: [],
            risk_level: 'low',
            interaction_contract_ref: 'ref',
            async: false,
          },
        ],
      };
      const isValid = validator.validateDomain(invalidDomain);
      expect(isValid).toBe(false);
      expect(validator.errors).toBeDefined();
    });

    it('should fail if Capability is missing required fields', () => {
      const invalidDomain = {
        ...targetPageFixture,
        capabilities: [
          {
            id: 'cap-2',
            name: 'Create', // Valid verb
            // missing other fields
          },
        ],
      };
      const isValid = validator.validateDomain(invalidDomain);
      expect(isValid).toBe(false);
      expect(validator.errors).toBeDefined();
    });

    it('should correctly enforce depth limiting to prevent circular dependency stack overflows', () => {
      // Simulate an infinite circular dependency graph
      interface MockEntity {
        id: string;
        name: string;
        fields: Record<string, unknown>[];
      }
      const objA: MockEntity = { id: 'A', name: 'A', fields: [] };
      const objB: MockEntity = { id: 'B', name: 'B', fields: [] };
      objA.fields.push({
        id: 'field-A1',
        name: 'refToB',
        type: 'object',
        label: 'Ref',
        validation: [],
        metadata_path: 'A.ref',
        // Creating circularity
        circularRef: objB,
      });
      objB.fields.push({
        id: 'field-B1',
        name: 'refToA',
        type: 'object',
        label: 'Ref',
        validation: [],
        metadata_path: 'B.ref',
        // Creating circularity
        circularRef: objA,
      });

      // Instead of relying purely on JSON schema to blow up, BADLValidator should catch deep depths
      expect(() => {
        validator.validateEntity(objA, { maxDepth: 10 });
      }).toThrow('Maximum depth exceeded. Possible circular dependency detected.');
    });

    it('should correctly attach line and column numbers to errors when parsing from a JSON string', () => {
      const invalidJsonString = `{
  "id": "entity-invalid",
  "name": "Invalid",
  "fields": [
    {
      "id": "field-1",
      "name": "missing-type-and-label"
    }
  ]
}`;
      const isValid = validator.validateEntity(invalidJsonString);
      expect(isValid).toBe(false);
      expect(validator.errors).toBeDefined();
      expect(validator.errors?.length).toBeGreaterThan(0);

      const errorWithContext = validator.errors?.find(e => e.context?.line !== undefined);
      expect(errorWithContext).toBeDefined();
      expect(errorWithContext?.context?.line).toBeDefined();
      expect(errorWithContext?.context?.column).toBeDefined();
      expect(errorWithContext?.code).toBeDefined();
    });
  });
});
