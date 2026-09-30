import {
  generateEntityTemplate,
  generateOrigoConfig,
  generateExtensionTemplate,
  generateListDetailTemplate,
  generateLoginTemplate,
} from './index';

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

    it('should use default parameters', () => {
      const parsed = JSON.parse(generateEntityTemplate());
      expect(parsed.id).toBe('default-entity-id');
      expect(parsed.name).toBe('DefaultEntityName');
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

    it('should use default parameters', () => {
      const parsed = JSON.parse(generateExtensionTemplate());
      expect(parsed.id).toBe('my-extension');
      expect(parsed.name).toBe('My Extension');
      expect(parsed.version).toBe('1.0.0');
    });
  });

  describe('List-Detail Template', () => {
    it('should generate valid JSON compliant with list-detail pattern', () => {
      const templateJson = generateListDetailTemplate({
        id: 'user-list-detail',
        name: 'UserListDetail',
      });
      const parsed = JSON.parse(templateJson);

      expect(parsed.id).toBe('user-list-detail');
      expect(parsed.name).toBe('UserListDetail');
      expect(parsed.views).toBeDefined();
      expect(parsed.views.length).toBe(2);
    });

    it('should throw on invalid identifiers', () => {
      expect(() => generateListDetailTemplate({ id: 'invalid id!' })).toThrow(/Invalid identifier/);
    });

    it('should use default parameters', () => {
      const parsed = JSON.parse(generateListDetailTemplate());
      expect(parsed.id).toBe('default-list-detail');
      expect(parsed.name).toBe('DefaultListDetail');
    });
  });

  describe('Login Template', () => {
    it('should generate valid JSON with strict security defaults', () => {
      const templateJson = generateLoginTemplate({
        id: 'user-login',
        name: 'UserLogin',
      });
      const parsed = JSON.parse(templateJson);

      expect(parsed.id).toBe('user-login');
      expect(parsed.name).toBe('UserLogin');
      expect(parsed._secure_by_default).toBe(true);

      // Ensure no default passwords/secrets
      const checkSecurity = (obj: unknown) => {
        if (!obj || typeof obj !== 'object') return;
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          const lowerKey = key.toLowerCase();
          if (
            lowerKey === 'password' ||
            lowerKey === 'secret' ||
            lowerKey === 'token' ||
            lowerKey === 'apikey'
          ) {
            if (typeof value === 'string' && value.length > 0) {
              throw new Error(`Found hardcoded secret in ${key}`);
            }
          }
          if (typeof value === 'string' && value.toLowerCase() === 'admin') {
            throw new Error(`Found hardcoded admin role`);
          }
          checkSecurity(value);
        }
      };
      expect(() => checkSecurity(parsed)).not.toThrow();
    });

    it('should use default parameters', () => {
      const parsed = JSON.parse(generateLoginTemplate());
      expect(parsed.id).toBe('default-login');
      expect(parsed.name).toBe('DefaultLogin');
    });

    it('should throw on invalid identifiers', () => {
      expect(() => generateLoginTemplate({ id: 'invalid id!' })).toThrow(/Invalid identifier/);
    });
  });
});
