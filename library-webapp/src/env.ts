// Typed read of the runtime config the platform mounts at /env-config.js.
// Every other module reads configuration through this file, never
// window._env_ directly, and never a build-time env mechanism
// (import.meta.env / process.env) which is undefined in production.

type Env = {
  // OIDC config for the `user-auth` platform-resource dependency
  // (thunder-authentication). Keys are the UPPER_SNAKE of the dependency
  // name, fixed by the platform — never renamed.
  USER_AUTH_CLIENT_ID: string;
  USER_AUTH_ISSUER: string;
  USER_AUTH_JWKS_URL: string;
  USER_AUTH_SCOPES: string;
};

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;
