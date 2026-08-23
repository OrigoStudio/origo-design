import { ExtensionManager, ExtensionState, ExtensionError } from '../extension-manager';
import { ExtensionManifest, ExtensionLifecycle } from '../types';

describe('ExtensionManager', () => {
  let manager: ExtensionManager;

  beforeEach(() => {
    manager = new ExtensionManager();
  });

  const createMockLifecycle = (): ExtensionLifecycle => ({
    initialize: jest.fn(),
    configure: jest.fn(),
    validate: jest.fn().mockReturnValue(true),
    activate: jest.fn(),
  });

  describe('Manifest Validation', () => {
    it('should register a valid manifest', () => {
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test Extension',
        version: '1.0.0',
        type: 'test',
      };

      expect(() => manager.registerExtension(manifest, createMockLifecycle())).not.toThrow();
      expect(manager.getExtensionState('test-ext')).toBe(ExtensionState.REGISTERED);
    });

    it('should throw on missing required fields', () => {
      const manifest = { id: 'test-ext' } as ExtensionManifest;
      expect(() => manager.registerExtension(manifest, createMockLifecycle())).toThrow(
        new ExtensionError('Invalid manifest: missing required fields', 'INVALID_MANIFEST')
      );
    });

    it('should throw on invalid semantic version', () => {
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test',
        version: 'invalid',
        type: 'test',
      };
      expect(() => manager.registerExtension(manifest, createMockLifecycle())).toThrow(
        new ExtensionError('Invalid semver version: invalid', 'INVALID_VERSION')
      );
    });

    it('should throw on invalid grammar range', () => {
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
        grammarRanges: { 'some-grammar': 'invalid-range' },
      };
      expect(() => manager.registerExtension(manifest, createMockLifecycle())).toThrow(
        new ExtensionError(
          'Invalid semver range for grammar some-grammar: invalid-range',
          'INVALID_GRAMMAR_RANGE'
        )
      );
    });

    it('should throw on invalid api range', () => {
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
        apiRanges: { 'core-api': 'invalid-range' },
      } as unknown as ExtensionManifest;
      expect(() => manager.registerExtension(manifest, createMockLifecycle())).toThrow(
        new ExtensionError(
          'Invalid semver range for API core-api: invalid-range',
          'INVALID_API_RANGE'
        )
      );
    });

    it('should throw on duplicate extension registration', () => {
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
      };
      manager.registerExtension(manifest, createMockLifecycle());
      expect(() => manager.registerExtension(manifest, createMockLifecycle())).toThrow(
        new ExtensionError('Extension already registered: test-ext', 'DUPLICATE_EXTENSION')
      );
    });

    it('should throw on null or undefined inputs', () => {
      expect(() =>
        manager.registerExtension(null as unknown as ExtensionManifest, createMockLifecycle())
      ).toThrow(new ExtensionError('Manifest is required', 'INVALID_MANIFEST'));
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
      };
      expect(() =>
        manager.registerExtension(manifest, null as unknown as ExtensionLifecycle)
      ).toThrow(new ExtensionError('Lifecycle is required', 'INVALID_LIFECYCLE'));
    });

    it('should throw on invalid dependencies object', () => {
      const manifest = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
        dependencies: 'not-an-object',
      } as unknown as ExtensionManifest;
      expect(() => manager.registerExtension(manifest, createMockLifecycle())).toThrow(
        new ExtensionError('dependencies must be an object', 'INVALID_MANIFEST')
      );
    });
  });

  describe('Capability Negotiation', () => {
    it('should fail fast if mandatory capability is missing during initialization', async () => {
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
        capabilities: ['test:required-cap'],
      };

      manager.registerExtension(manifest, createMockLifecycle());
      await expect(manager.initializeExtension('test-ext')).rejects.toThrow(
        new ExtensionError('Missing required capability: test:required-cap', 'MISSING_CAPABILITY')
      );
    });

    it('should succeed if mandatory capability is present', async () => {
      const manifest: ExtensionManifest = {
        id: 'test-ext',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
        capabilities: ['test:required-cap'],
      };

      manager.registerCapability('test:required-cap');
      manager.registerExtension(manifest, createMockLifecycle());
      await expect(manager.initializeExtension('test-ext')).resolves.not.toThrow();
    });

    it('should throw on invalid capabilities array', async () => {
      const manifest = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        type: 'test',
        capabilities: 'not-an-array',
      } as unknown as ExtensionManifest;
      manager.registerExtension(manifest, createMockLifecycle());
      await expect(manager.initializeExtension('test')).rejects.toThrow(
        new ExtensionError('Capabilities must be an array', 'INVALID_MANIFEST')
      );
    });
  });

  describe('Dependency Graph Resolution', () => {
    it('should resolve a valid dependency graph in correct order', () => {
      manager.registerExtension(
        { id: 'a', name: 'A', version: '1.0.0', type: 'test', dependencies: { b: '^1.0.0' } },
        createMockLifecycle()
      );
      manager.registerExtension(
        { id: 'b', name: 'B', version: '1.0.0', type: 'test' },
        createMockLifecycle()
      );

      const sorted = manager.resolveDependencyGraph();
      // b should be initialized before a, because a depends on b
      expect(sorted).toEqual(['b', 'a']);
    });

    it('should detect cyclic dependencies and throw', () => {
      manager.registerExtension(
        { id: 'a', name: 'A', version: '1.0.0', type: 'test', dependencies: { b: '^1.0.0' } },
        createMockLifecycle()
      );
      manager.registerExtension(
        { id: 'b', name: 'B', version: '1.0.0', type: 'test', dependencies: { c: '^1.0.0' } },
        createMockLifecycle()
      );
      manager.registerExtension(
        { id: 'c', name: 'C', version: '1.0.0', type: 'test', dependencies: { a: '^1.0.0' } },
        createMockLifecycle()
      );

      expect(() => manager.resolveDependencyGraph()).toThrow(
        new ExtensionError('Cyclic dependency detected: a -> b -> c -> a', 'CYCLIC_DEPENDENCY')
      );
    });

    it('should detect self-referencing cyclic dependencies', () => {
      manager.registerExtension(
        { id: 'a', name: 'A', version: '1.0.0', type: 'test', dependencies: { a: '^1.0.0' } },
        createMockLifecycle()
      );
      expect(() => manager.resolveDependencyGraph()).toThrow(
        new ExtensionError('Cyclic dependency detected: a -> a', 'CYCLIC_DEPENDENCY')
      );
    });

    it('should throw if a dependency is missing', () => {
      manager.registerExtension(
        { id: 'a', name: 'A', version: '1.0.0', type: 'test', dependencies: { missing: '^1.0.0' } },
        createMockLifecycle()
      );

      expect(() => manager.resolveDependencyGraph()).toThrow(
        new ExtensionError('Missing required dependency: missing', 'MISSING_DEPENDENCY')
      );
    });

    it('should throw if dependency version mismatches', () => {
      manager.registerExtension(
        { id: 'a', name: 'A', version: '1.0.0', type: 'test', dependencies: { b: '^2.0.0' } },
        createMockLifecycle()
      );
      manager.registerExtension(
        { id: 'b', name: 'B', version: '1.0.0', type: 'test' },
        createMockLifecycle()
      );

      expect(() => manager.resolveDependencyGraph()).toThrow(
        new ExtensionError(
          'Dependency version mismatch for b. Expected ^2.0.0, got 1.0.0',
          'DEPENDENCY_VERSION_MISMATCH'
        )
      );
    });
  });

  describe('Lifecycle Enforcement', () => {
    const extId = 'test-lifecycle';

    beforeEach(() => {
      manager.registerExtension(
        { id: extId, name: 'Test', version: '1.0.0', type: 'test' },
        createMockLifecycle()
      );
    });

    it('should enforce strict lifecycle order', async () => {
      await expect(manager.configureExtension(extId)).rejects.toThrow(
        new ExtensionError('Cannot configure extension in state REGISTERED', 'INVALID_LIFECYCLE')
      );
      await expect(manager.validateExtension(extId)).rejects.toThrow(
        new ExtensionError('Cannot validate extension in state REGISTERED', 'INVALID_LIFECYCLE')
      );
      await expect(manager.activateExtension(extId)).rejects.toThrow(
        new ExtensionError('Cannot activate extension in state REGISTERED', 'INVALID_LIFECYCLE')
      );

      await manager.initializeExtension(extId);
      expect(manager.getExtensionState(extId)).toBe(ExtensionState.INITIALIZED);

      await expect(manager.validateExtension(extId)).rejects.toThrow(
        'Cannot validate extension in state INITIALIZED'
      );
      await expect(manager.activateExtension(extId)).rejects.toThrow(
        'Cannot activate extension in state INITIALIZED'
      );
      await expect(manager.initializeExtension(extId)).rejects.toThrow(
        'Cannot initialize extension in state INITIALIZED'
      );

      await manager.configureExtension(extId);
      expect(manager.getExtensionState(extId)).toBe(ExtensionState.CONFIGURED);

      await expect(manager.activateExtension(extId)).rejects.toThrow(
        'Cannot activate extension in state CONFIGURED'
      );

      await manager.validateExtension(extId);
      expect(manager.getExtensionState(extId)).toBe(ExtensionState.VALIDATED);

      await manager.activateExtension(extId);
      expect(manager.getExtensionState(extId)).toBe(ExtensionState.ACTIVATED);
    });

    it('should throw if validate fails', async () => {
      const failingLifecycle = {
        initialize: jest.fn(),
        configure: jest.fn(),
        validate: jest.fn().mockReturnValue(false),
        activate: jest.fn(),
      };

      manager.registerExtension(
        { id: 'fail-ext', name: 'Fail', version: '1.0.0', type: 'test' },
        failingLifecycle
      );
      await manager.initializeExtension('fail-ext');
      await manager.configureExtension('fail-ext');

      await expect(manager.validateExtension('fail-ext')).rejects.toThrow(
        new ExtensionError('Extension failed validation: fail-ext', 'VALIDATION_FAILED')
      );
    });

    it('should throw NOT_FOUND for unknown extensions', async () => {
      await expect(manager.initializeExtension('unknown')).rejects.toThrow(
        new ExtensionError('Extension not found: unknown', 'NOT_FOUND')
      );
      await expect(manager.configureExtension('unknown')).rejects.toThrow(
        new ExtensionError('Extension not found: unknown', 'NOT_FOUND')
      );
      await expect(manager.validateExtension('unknown')).rejects.toThrow(
        new ExtensionError('Extension not found: unknown', 'NOT_FOUND')
      );
      await expect(manager.activateExtension('unknown')).rejects.toThrow(
        new ExtensionError('Extension not found: unknown', 'NOT_FOUND')
      );
    });

    it('should throw on async rejection in lifecycle', async () => {
      const rejectingLifecycle = {
        initialize: jest.fn().mockRejectedValue(new Error('Init failed')),
        configure: jest.fn(),
        validate: jest.fn().mockReturnValue(true),
        activate: jest.fn(),
      };
      manager.registerExtension(
        { id: 'fail-ext', name: 'Fail', version: '1.0.0', type: 'test' },
        rejectingLifecycle
      );
      await expect(manager.initializeExtension('fail-ext')).rejects.toThrow('Init failed');
    });

    it('should pass context and config parameters to lifecycle hooks', async () => {
      const lc = createMockLifecycle();
      manager.registerExtension({ id: 'ext', name: 'Ext', version: '1.0.0', type: 'test' }, lc);
      const testContext = { fetch: jest.fn() } as unknown as Record<string, unknown>;
      await manager.initializeExtension('ext', testContext);

      const calledContext = (lc.initialize as jest.Mock).mock.calls[0][0];
      expect(calledContext.fetch).toBeDefined();
      await manager.configureExtension('ext', { someConfig: true });
      expect(lc.configure).toHaveBeenCalledWith({ someConfig: true });
    });
  });

  describe('loadAll', () => {
    it('should load all extensions in topological order', async () => {
      const aLifecycle = createMockLifecycle();
      const bLifecycle = createMockLifecycle();

      manager.registerExtension(
        { id: 'a', name: 'A', version: '1.0.0', type: 'test', dependencies: { b: '^1.0.0' } },
        aLifecycle
      );
      manager.registerExtension({ id: 'b', name: 'B', version: '1.0.0', type: 'test' }, bLifecycle);

      await manager.loadAll();

      expect(manager.getExtensionState('b')).toBe(ExtensionState.ACTIVATED);
      expect(manager.getExtensionState('a')).toBe(ExtensionState.ACTIVATED);

      // Checking that initialization occurred on B before A (B has no dependencies, A depends on B)
      expect(bLifecycle.initialize).toHaveBeenCalled();
      expect(aLifecycle.initialize).toHaveBeenCalled();
    });
  });

  describe('Security and Sandboxing', () => {
    it('should throw if granting undeclared permission', () => {
      manager.registerExtension(
        {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          type: 'test',
          permissions: ['network:fetch'],
        },
        createMockLifecycle()
      );
      expect(() => manager.grantPermission('test', 'fs:read')).toThrow(
        new ExtensionError('Permission not declared in manifest: fs:read', 'UNDECLARED_PERMISSION')
      );
    });

    it('should successfully grant and check declared permission', () => {
      manager.registerExtension(
        {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          type: 'test',
          permissions: ['network:fetch', 'fs:read'],
        },
        createMockLifecycle()
      );
      manager.grantPermission('test', 'network:fetch');
      expect(() => manager.checkPermission('test', 'network:fetch')).not.toThrow();
    });

    it('should throw UNAUTHORIZED_ACCESS if permission is checked but not granted', () => {
      manager.registerExtension(
        {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          type: 'test',
          permissions: ['network:fetch'],
        },
        createMockLifecycle()
      );
      expect(() => manager.checkPermission('test', 'network:fetch')).toThrow(
        new ExtensionError(
          'Unauthorized access: Missing permission network:fetch',
          'UNAUTHORIZED_ACCESS'
        )
      );
    });

    it('should throw NOT_FOUND for unknown extension in grant/check', () => {
      expect(() => manager.grantPermission('unknown', 'network:fetch')).toThrow(
        new ExtensionError('Extension not found: unknown', 'NOT_FOUND')
      );
      expect(() => manager.checkPermission('unknown', 'network:fetch')).toThrow(
        new ExtensionError('Extension not found: unknown', 'NOT_FOUND')
      );
    });

    it('should throw on invalid permissions array in manifest', () => {
      const invalidManifests = [
        { permissions: 'not-an-array' },
        { permissions: [123] },
        { permissions: [null] },
        { permissions: [''] },
        { permissions: ['   '] },
      ];

      for (const invalid of invalidManifests) {
        const manifest = {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          type: 'test',
          ...invalid,
        } as unknown as ExtensionManifest;
        expect(() => manager.registerExtension(manifest, createMockLifecycle())).toThrow(
          new ExtensionError(
            'permissions must be an array of non-empty strings',
            'INVALID_MANIFEST'
          )
        );
      }
    });

    it('should successfully retrieve declared and granted permissions', () => {
      manager.registerExtension(
        {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          type: 'test',
          permissions: ['network:fetch', 'fs:read'],
        },
        createMockLifecycle()
      );
      expect(manager.getDeclaredPermissions('test')).toEqual(['network:fetch', 'fs:read']);
      expect(manager.getGrantedPermissions('test')).toEqual([]);
      manager.grantPermission('test', 'network:fetch');
      expect(manager.getGrantedPermissions('test')).toEqual(['network:fetch']);
      expect(manager.hasPermission('test', 'network:fetch')).toBe(true);
      expect(manager.hasPermission('test', 'fs:read')).toBe(false);
    });

    it('should throw if granting permissions after initialization', async () => {
      manager.registerExtension(
        {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          type: 'test',
          permissions: ['network:fetch'],
        },
        createMockLifecycle()
      );
      manager.grantPermission('test', 'network:fetch');
      await manager.initializeExtension('test', {});
      expect(() => manager.grantPermission('test', 'network:fetch')).toThrow(
        new ExtensionError(
          'Cannot grant permissions after extension initialization (current state: INITIALIZED)',
          'INVALID_LIFECYCLE'
        )
      );
    });

    it('should throw on execution if missing required permissions during lifecycle', async () => {
      manager.registerExtension(
        {
          id: 'test',
          name: 'Test',
          version: '1.0.0',
          type: 'test',
          permissions: ['network:fetch'],
        },
        createMockLifecycle()
      );
      // We haven't granted the 'network' permission
      await expect(manager.initializeExtension('test', {})).rejects.toThrow(
        new ExtensionError(
          'Cannot execute extension test: Missing required permission network:fetch',
          'UNAUTHORIZED_ACCESS'
        )
      );
    });

    it('should proxy the context during initialization and intercept API calls', async () => {
      const lifecycle = createMockLifecycle();
      manager.registerExtension(
        { id: 'test', name: 'Test', version: '1.0.0', type: 'test', permissions: ['fs:read'] },
        lifecycle
      );

      manager.grantPermission('test', 'fs:read');

      const mockReadFile = jest.fn().mockResolvedValue('data');
      const context = {
        readFile: mockReadFile,
        fetch: jest.fn(), // We won't grant this permission
      };

      await manager.initializeExtension('test', context);

      const calledContext = (lifecycle.initialize as jest.Mock).mock.calls[0][0];

      // Should work since we granted fs:read
      await calledContext.readFile('test.txt');
      expect(mockReadFile).toHaveBeenCalledWith('test.txt');

      // Should throw since we didn't grant network:fetch
      expect(() => calledContext.fetch('http://example.com')).toThrow(
        new ExtensionError(
          'Unauthorized access: Missing permission network:fetch',
          'UNAUTHORIZED_ACCESS'
        )
      );
    });
  });
});
