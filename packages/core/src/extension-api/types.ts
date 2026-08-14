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
  /** Dependencies on other extensions (map of extension id to semver range) */
  dependencies?: Record<string, string>;
}

export interface ExtensionLifecycle {
  initialize(context?: unknown): Promise<void> | void;
  configure(config?: unknown): Promise<void> | void;
  validate(): Promise<boolean> | boolean;
  activate(): Promise<void> | void;
}
