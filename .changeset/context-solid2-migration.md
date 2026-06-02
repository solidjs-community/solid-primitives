---
"@solid-primitives/context": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

- `Context` is now used directly as the provider component — `Context.Provider` no longer exists in Solid 2.0. `createContextProvider` and `MultiProvider` both reflect this change.
- `ContextProviderComponent` is now a proper export from `solid-js`; the previous workaround importing from an internal `node_modules` path has been removed.
- `JSX.Element` replaced with `Element` from `solid-js` throughout the public API types, matching Solid 2.0's renderer-neutral type model.
- `MultiProvider` no longer falls back to accessing `.Provider` on non-function items — contexts passed in `values` must be functions (which all `Context` objects now are in Solid 2.0).
