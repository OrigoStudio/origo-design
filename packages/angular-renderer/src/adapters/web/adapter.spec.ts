import { coerceContractProps, AdapterPipelineService } from './adapter';
import { ASTNode } from '@origo/core';

describe('Web Adapter Utilities', () => {
  describe('coerceContractProps', () => {
    it('should pass through valid properties', () => {
      const input = { name: 'test', count: 42, isActive: true };
      const schema: Record<string, any> = { name: 'string', count: 'number', isActive: 'boolean' };

      const result = coerceContractProps<any>(input, schema);

      expect(result).toEqual({ name: 'test', count: 42, isActive: true });
    });

    it('should coerce types to string', () => {
      const input = { value: 123 };
      const schema: Record<string, any> = { value: 'string' };

      const result = coerceContractProps<any>(input, schema);

      expect(result).toEqual({ value: '123' });
    });

    it('should coerce types to number', () => {
      const input = { value: '42' };
      const schema: Record<string, any> = { value: 'number' };

      const result = coerceContractProps<any>(input, schema);

      expect(result).toEqual({ value: 42 });
    });

    it('should coerce invalid numbers to undefined', () => {
      const input = { value: 'abc' };
      const schema: Record<string, any> = { value: 'number' };

      const result = coerceContractProps<any>(input, schema);

      expect(result).toEqual({ value: undefined });
    });

    it('should handle boolean truthiness and explicit "false" string', () => {
      const schema: Record<string, any> = {
        a: 'boolean',
        b: 'boolean',
        c: 'boolean',
        d: 'boolean',
      };
      const input = { a: 'true', b: 'false', c: 1, d: 0 };

      const result = coerceContractProps<any>(input, schema);

      expect(result).toEqual({ a: true, b: false, c: true, d: false });
    });

    it('should wrap non-arrays in arrays if array expected', () => {
      const schema: Record<string, any> = { items: 'array', existingArray: 'array' };
      const input = { items: 'single', existingArray: [1, 2] };

      const result = coerceContractProps<any>(input, schema);

      expect(result).toEqual({ items: ['single'], existingArray: [1, 2] });
    });

    it('should filter out properties not in the schema when strict mode is true', () => {
      const input = { valid: 'test', invalid: 'hacker' };
      const schema: Record<string, any> = { valid: 'string' };

      const result = coerceContractProps<any>(input, schema, true);

      expect(result).toEqual({ valid: 'test' });
    });

    it('should ignore null/undefined properties without adding them to result in strict mode', () => {
      const input = { present: 'test', missing: null, alsoMissing: undefined };
      const schema: Record<string, any> = {
        present: 'string',
        missing: 'string',
        alsoMissing: 'string',
      };

      const result = coerceContractProps<any>(input, schema, true);

      expect(result).toEqual({ present: 'test' });
      expect(Object.keys(result)).not.toContain('missing');
    });

    it('should preserve aria-* and data-* attributes even in strict mode', () => {
      const input = { valid: 'test', 'aria-label': 'close', 'data-id': '123', invalid: 'drop' };
      const schema: Record<string, any> = { valid: 'string' };

      const result = coerceContractProps<any>(input, schema, true);

      expect(result).toEqual({ valid: 'test', 'aria-label': 'close', 'data-id': '123' });
      expect(result.invalid).toBeUndefined();
    });

    it('should throw error on invalid number in strict mode', () => {
      const input = { value: 'abc' };
      const schema: Record<string, any> = { value: 'number' };

      expect(() => coerceContractProps<any>(input, schema, true)).toThrow();
    });

    it('should not coerce empty string or boolean to number 0', () => {
      const schema: Record<string, any> = { v1: 'number', v2: 'number' };

      const r1 = coerceContractProps<any>({ v1: '' }, schema, false);
      expect(r1.v1).toBeUndefined();

      const r2 = coerceContractProps<any>({ v2: false }, schema, false);
      expect(r2.v2).toBeUndefined();
    });

    it('should handle boolean true for empty strings (HTML attribute presence)', () => {
      const schema: Record<string, any> = { disabled: 'boolean' };
      const input = { disabled: '' };

      const result = coerceContractProps<any>(input, schema);

      expect(result.disabled).toBe(true);
    });

    it('should deeply clone objects and arrays to prevent input mutation', () => {
      const input = { obj: { a: 1 }, arr: [1, 2] };
      const schema: Record<string, any> = { obj: 'object', arr: 'array' };

      const result = coerceContractProps<any>(input, schema);

      expect(result.obj).not.toBe(input.obj);
      expect(result.obj).toEqual(input.obj);
      expect(result.arr).not.toBe(input.arr);
      expect(result.arr).toEqual(input.arr);
    });
  });

  describe('AdapterPipelineService', () => {
    it('should map ASTNode to InteractionContract', () => {
      const service = new AdapterPipelineService();
      const astNode: ASTNode = {
        id: '123',
        type: 'button',
        props: { label: 'Click me' },
        children: [],
      };

      const contract = service.prepareNode(astNode);

      expect(contract).toEqual({
        id: '123',
        type: 'button',
        props: { label: 'Click me' },
        children: [],
      });
    });
  });
});
