import * as fs from 'fs';
import * as path from 'path';

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
  [key: string]: any; // Allow other overrides securely
}

function loadTemplate(name: string): string {
  return fs.readFileSync(path.join(__dirname, `${name}.json.template`), 'utf-8');
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

  let content = loadTemplate('entity');
  content = content.replace(/\{\{id\}\}/g, id);
  content = content.replace(/\{\{name\}\}/g, name);

  if (!content.endsWith('\n')) content += '\n';
  return content;
}

export function generateExtensionTemplate(options: ExtensionOptions = {}): string {
  const id = options.id || 'my-extension';
  const name = options.name || 'My Extension';
  const version = options.version || '1.0.0';

  validateIdentifier(id);
  validateSemver(version);

  let content = loadTemplate('extension');
  content = content.replace(/\{\{id\}\}/g, id);
  content = content.replace(/\{\{name\}\}/g, name);
  content = content.replace(/\{\{version\}\}/g, version);

  if (!content.endsWith('\n')) content += '\n';
  return content;
}

export function generateOrigoConfig(options: OrigoConfigOptions = {}): string {
  const templateStr = loadTemplate('origo');
  const defaults = JSON.parse(templateStr);

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
