/**
 * Remote module configuration for Module Federation.
 * Used by the loader and remote-configs.json (development, staging, production).
 */
export interface RemoteConfig {
  url: string;
  scope: string;
  module: string;
  cssUrl?: string;
}

/**
 * Environment-keyed remote configs.
 * Keys are remote names; values are configs per environment.
 */
export type RemoteConfigsByEnv = Record<
  string,
  Record<string, RemoteConfig>
>;
