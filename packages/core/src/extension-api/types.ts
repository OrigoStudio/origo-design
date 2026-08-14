export type CorePermission = 'network:fetch' | 'fs:read' | 'fs:write' | 'env:read';

export interface ExtensionContext {
  fetch?: typeof fetch;
  readFile?: (path: string) => Promise<string>;
  writeFile?: (path: string, data: string) => Promise<void>;
  getEnv?: (key: string) => string | undefined;
  [key: string]: unknown;
}

export interface ExtensionManifest {
  /** The unique identifier of the extension */
  id: string;
  /** Name of the extension */
  name: string;
  /** Semantic version of the extension */
  version: string;
  /** Type of the extension */
  type: string;
  /** Grammar ranges required */
  grammarRanges?: Record<string, string>;
  /** API ranges required */
  apiRanges?: Record<string, string>;
  /** Capabilities required by this extension */
  capabilities?: string[];
  /** Permissions required by this extension for sandbox access */
  permissions?: CorePermission[];
  /** Dependencies on other extensions (map of extension id to semver range) */
  dependencies?: Record<string, string>;
}

export interface ExtensionLifecycle {
  initialize(context?: ExtensionContext): Promise<void> | void;
  configure(config?: unknown): Promise<void> | void;
  validate(): Promise<boolean> | boolean;
  activate(): Promise<void> | void;
}
