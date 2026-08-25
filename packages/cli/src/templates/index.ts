import origoTemplate from './origo.json';
import entityTemplate from './entity.json';
import extensionTemplate from './extension.json';

export interface EntityOptions {
  id?: string;
  name?: string;
}

export interface ExtensionOptions {
  id?: string;
  name?: string;
  version?: string;
}

export interface OrigoConfigOptions {
  version?: string;
  build?: { outDir?: string };
  schemas?: string;
  security?: {
    sandboxEnabled?: boolean;
    allowNetworkAccess?: boolean;
    allowFileSystemAccess?: boolean;
  };
  permissions?: {
    read?: string[];
    write?: string[];
  };
  [key: string]: unknown; // Allow other overrides securely
}

function validateIdentifier(id: string): void {
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid identifier: ${id}. Must match ^[a-zA-Z0-9_-]+$`);
  }
}

function validateSemver(version: string): void {
  if (!version || !/^\d+\.\d+\.\d+/.test(version)) {
    throw new Error(`Invalid version: ${version}. Must be a valid semver.`);
  }
}

export function generateEntityTemplate(options: EntityOptions = {}): string {
  const id = options.id || 'default-entity-id';
  const name = options.name || 'DefaultEntityName';
  validateIdentifier(id);

  const entityObj = {
    ...entityTemplate,
    id,
    name,
  };

  return JSON.stringify(entityObj, null, 2) + '\n';
}

export function generateExtensionTemplate(options: ExtensionOptions = {}): string {
  const id = options.id || 'my-extension';
  const name = options.name || 'My Extension';
  const version = options.version || '1.0.0';

  validateIdentifier(id);
  validateSemver(version);

  const extensionObj = {
    ...extensionTemplate,
    id,
    name,
    version,
  };

  return JSON.stringify(extensionObj, null, 2) + '\n';
}

export function generateOrigoConfig(options: OrigoConfigOptions = {}): string {
  const defaults = origoTemplate;

  const merged = {
    ...defaults,
    ...options,
    build: { ...defaults.build, ...(options.build || {}) },
    security: { ...defaults.security, ...(options.security || {}) },
    permissions: { ...defaults.permissions, ...(options.permissions || {}) },
  };

  try {
    return JSON.stringify(merged, null, 2) + '\n';
  } catch (e) {
    throw new Error(
      `Failed to serialize origo config: ${e instanceof Error ? e.message : String(e)}`
    );
  }
}
