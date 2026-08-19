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
      const entity = targetPageFixture.entities[0];
      const isValid = validator.validateEntity(entity);
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
  });
});
