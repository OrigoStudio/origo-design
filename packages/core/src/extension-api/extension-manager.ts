import { ExtensionManifest, ExtensionLifecycle } from './types';
import * as semver from 'semver';

export class ExtensionError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ExtensionError';
  }
}

export enum ExtensionState {
  REGISTERED = 'REGISTERED',
  INITIALIZED = 'INITIALIZED',
  CONFIGURED = 'CONFIGURED',
  VALIDATED = 'VALIDATED',
  ACTIVATED = 'ACTIVATED',
}

export class ExtensionManager {
  private extensions: Map<
    string,
    { manifest: ExtensionManifest; lifecycle: ExtensionLifecycle; state: ExtensionState }
  > = new Map();
  private capabilities: Set<string> = new Set();

  public registerExtension(manifest: ExtensionManifest, lifecycle: ExtensionLifecycle) {
    if (!manifest) throw new ExtensionError('Manifest is required', 'INVALID_MANIFEST');
    if (!lifecycle) throw new ExtensionError('Lifecycle is required', 'INVALID_LIFECYCLE');
    if (this.extensions.has(manifest.id)) {
      throw new ExtensionError(
        `Extension already registered: ${manifest.id}`,
        'DUPLICATE_EXTENSION'
      );
    }
    this.validateManifest(manifest);
    this.extensions.set(manifest.id, { manifest, lifecycle, state: ExtensionState.REGISTERED });
  }

  public registerCapability(capability: string) {
    this.capabilities.add(capability);
  }

  private validateManifest(manifest: ExtensionManifest) {
    if (!manifest.id || !manifest.name || !manifest.version || !manifest.type) {
      throw new ExtensionError('Invalid manifest: missing required fields', 'INVALID_MANIFEST');
    }
    if (!semver.valid(manifest.version)) {
      throw new ExtensionError(`Invalid semver version: ${manifest.version}`, 'INVALID_VERSION');
    }

    if (manifest.grammarRanges) {
      if (typeof manifest.grammarRanges !== 'object' || Array.isArray(manifest.grammarRanges)) {
        throw new ExtensionError('grammarRanges must be an object', 'INVALID_MANIFEST');
      }
      for (const [key, range] of Object.entries(manifest.grammarRanges)) {
        if (typeof range !== 'string' || !semver.validRange(range)) {
          throw new ExtensionError(
            `Invalid semver range for grammar ${key}: ${range}`,
            'INVALID_GRAMMAR_RANGE'
          );
        }
      }
    }

    if (manifest.apiRanges) {
      if (typeof manifest.apiRanges !== 'object' || Array.isArray(manifest.apiRanges)) {
        throw new ExtensionError('apiRanges must be an object', 'INVALID_MANIFEST');
      }
      for (const [key, range] of Object.entries(manifest.apiRanges)) {
        if (typeof range !== 'string' || !semver.validRange(range)) {
          throw new ExtensionError(
            `Invalid semver range for API ${key}: ${range}`,
            'INVALID_API_RANGE'
          );
        }
      }
    }

    if (manifest.dependencies) {
      if (typeof manifest.dependencies !== 'object' || Array.isArray(manifest.dependencies)) {
        throw new ExtensionError('dependencies must be an object', 'INVALID_MANIFEST');
      }
      for (const [key, range] of Object.entries(manifest.dependencies)) {
        if (typeof range !== 'string' || !semver.validRange(range)) {
          throw new ExtensionError(
            `Invalid dependency range for ${key}: ${range}`,
            'INVALID_DEPENDENCY_RANGE'
          );
        }
      }
    }
  }

  private negotiateCapabilities(manifest: ExtensionManifest) {
    if (manifest.capabilities) {
      if (!Array.isArray(manifest.capabilities)) {
        throw new ExtensionError('Capabilities must be an array', 'INVALID_MANIFEST');
      }
      for (const cap of manifest.capabilities) {
        if (!this.capabilities.has(cap)) {
          throw new ExtensionError(`Missing required capability: ${cap}`, 'MISSING_CAPABILITY');
        }
      }
    }
  }

  public resolveDependencyGraph(): string[] {
    const adjList = new Map<string, string[]>();

    for (const [id, { manifest }] of this.extensions.entries()) {
      const deps = manifest.dependencies ? Object.keys(manifest.dependencies) : [];

      for (const [depId, range] of Object.entries(manifest.dependencies || {})) {
        const target = this.extensions.get(depId);
        if (!target) {
          throw new ExtensionError(`Missing required dependency: ${depId}`, 'MISSING_DEPENDENCY');
        }
        if (!semver.satisfies(target.manifest.version, range)) {
          throw new ExtensionError(
            `Dependency version mismatch for ${depId}. Expected ${range}, got ${target.manifest.version}`,
            'DEPENDENCY_VERSION_MISMATCH'
          );
        }
      }

      adjList.set(id, deps);
    }

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const sorted: string[] = [];

    const dfs = (node: string, path: string[]) => {
      if (visiting.has(node)) {
        const cycleStartIndex = path.indexOf(node);
        const loop = cycleStartIndex >= 0 ? path.slice(cycleStartIndex) : path;
        const cyclePath = [...loop, node].join(' -> ');
        throw new ExtensionError(`Cyclic dependency detected: ${cyclePath}`, 'CYCLIC_DEPENDENCY');
      }
      if (visited.has(node)) return;

      visiting.add(node);
      path.push(node);

      const deps = adjList.get(node) || [];
      for (const dep of deps) {
        dfs(dep, path);
      }

      path.pop();
      visiting.delete(node);
      visited.add(node);
      sorted.push(node); // post-order (dependencies added before the node that depends on them)
    };

    for (const id of this.extensions.keys()) {
      if (!visited.has(id)) {
        dfs(id, []);
      }
    }

    return sorted;
  }

  public async initializeExtension(id: string, context?: unknown) {
    const ext = this.extensions.get(id);
    if (!ext) throw new ExtensionError(`Extension not found: ${id}`, 'NOT_FOUND');
    if (ext.state !== ExtensionState.REGISTERED) {
      throw new ExtensionError(
        `Cannot initialize extension in state ${ext.state}`,
        'INVALID_LIFECYCLE'
      );
    }

    this.negotiateCapabilities(ext.manifest);
    await ext.lifecycle.initialize(context);
    ext.state = ExtensionState.INITIALIZED;
  }

  public async configureExtension(id: string, config?: unknown) {
    const ext = this.extensions.get(id);
    if (!ext) throw new ExtensionError(`Extension not found: ${id}`, 'NOT_FOUND');
    if (ext.state !== ExtensionState.INITIALIZED) {
      throw new ExtensionError(
        `Cannot configure extension in state ${ext.state}`,
        'INVALID_LIFECYCLE'
      );
    }

    await ext.lifecycle.configure(config);
    ext.state = ExtensionState.CONFIGURED;
  }

  public async validateExtension(id: string) {
    const ext = this.extensions.get(id);
    if (!ext) throw new ExtensionError(`Extension not found: ${id}`, 'NOT_FOUND');
    if (ext.state !== ExtensionState.CONFIGURED) {
      throw new ExtensionError(
        `Cannot validate extension in state ${ext.state}`,
        'INVALID_LIFECYCLE'
      );
    }

    const isValid = await ext.lifecycle.validate();
    if (!isValid) {
      throw new ExtensionError(`Extension failed validation: ${id}`, 'VALIDATION_FAILED');
    }
    ext.state = ExtensionState.VALIDATED;
  }

  public async activateExtension(id: string) {
    const ext = this.extensions.get(id);
    if (!ext) throw new ExtensionError(`Extension not found: ${id}`, 'NOT_FOUND');
    if (ext.state !== ExtensionState.VALIDATED) {
      throw new ExtensionError(
        `Cannot activate extension in state ${ext.state}`,
        'INVALID_LIFECYCLE'
      );
    }

    await ext.lifecycle.activate();
    ext.state = ExtensionState.ACTIVATED;
  }

  public async loadAll(context?: unknown, config?: unknown) {
    const sortedIds = this.resolveDependencyGraph();

    for (const id of sortedIds) {
      if (this.getExtensionState(id) === ExtensionState.REGISTERED) {
        await this.initializeExtension(id, context);
      }
    }
    for (const id of sortedIds) {
      if (this.getExtensionState(id) === ExtensionState.INITIALIZED) {
        await this.configureExtension(id, config);
      }
    }
    for (const id of sortedIds) {
      if (this.getExtensionState(id) === ExtensionState.CONFIGURED) {
        await this.validateExtension(id);
      }
    }
    for (const id of sortedIds) {
      if (this.getExtensionState(id) === ExtensionState.VALIDATED) {
        await this.activateExtension(id);
      }
    }
  }

  public getExtensionState(id: string): ExtensionState | undefined {
    return this.extensions.get(id)?.state;
  }
}
