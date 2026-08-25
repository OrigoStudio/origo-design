import { generateEntityTemplate, generateOrigoConfig, generateExtensionTemplate } from './index';

describe('Boilerplate Templates', () => {
  describe('Entity Template', () => {
    it('should generate valid JSON compliant with entity schema', () => {
      const templateJson = generateEntityTemplate({
        id: 'user-entity',
        name: 'User',
      });
      const parsed = JSON.parse(templateJson);

      expect(parsed.id).toBe('user-entity');
      expect(parsed.name).toBe('User');
      expect(parsed.fields).toEqual([]);
      expect(parsed.implements).toEqual([]);

      // Should NOT have type or permissions (violates schema additionalProperties: false)
      expect(parsed.type).toBeUndefined();
      expect(parsed.permissions).toBeUndefined();
    });

    it('should throw on invalid identifiers', () => {
      expect(() => generateEntityTemplate({ id: 'invalid id!' })).toThrow(/Invalid identifier/);
    });
  });

  describe('Origo Config Template', () => {
    it('should generate valid JSON with secure default config and RBAC', () => {
      const templateJson = generateOrigoConfig();
      const parsed = JSON.parse(templateJson);

      expect(parsed.version).toBe('1.0');
      expect(parsed.schemas).toBe('./schemas');

      expect(parsed.security.sandboxEnabled).toBe(true);
      expect(parsed.security.allowNetworkAccess).toBe(false);
      expect(parsed.security.allowFileSystemAccess).toBe(false);

      expect(parsed.permissions.read).toEqual(['admin']);
      expect(parsed.permissions.write).toEqual(['admin']);
    });

    it('merges partial options without losing security defaults', () => {
      const templateJson = generateOrigoConfig({
        security: { allowNetworkAccess: true },
        permissions: { read: ['user'] },
      });
      const parsed = JSON.parse(templateJson);

      expect(parsed.security.sandboxEnabled).toBe(true); // Default preserved
      expect(parsed.security.allowNetworkAccess).toBe(true); // Overridden
      expect(parsed.permissions.read).toEqual(['user']); // Overridden
      expect(parsed.permissions.write).toEqual(['admin']); // Default preserved
    });
  });

  describe('Extension Template', () => {
    it('should generate valid JSON compliant with extension schema', () => {
      const templateJson = generateExtensionTemplate();
      const parsed = JSON.parse(templateJson);

      expect(parsed.id).toBe('my-extension');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.extension_type).toBe('plugin');
      expect(parsed.implements).toEqual(['core']);
      expect(parsed.plugin_version_range).toBe('^1.0.0');

      // Should NOT have capabilities or permissions
      expect(parsed.capabilities).toBeUndefined();
      expect(parsed.permissions).toBeUndefined();
    });

    it('should throw on invalid version', () => {
      expect(() => generateExtensionTemplate({ version: 'v1' })).toThrow(/Invalid version/);
    });
  });
});
