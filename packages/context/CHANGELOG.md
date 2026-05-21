# @solid-primitives/context

## 1.0.0

### Major Changes

- Migrate to Solid.js v2.0 (beta.13)

#### Breaking Changes

- **Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.
- `Context` is now used directly as the provider component — `Context.Provider` no longer exists in Solid 2.0. `createContextProvider` and `MultiProvider` both reflect this change.
- `ContextProviderComponent` is now a proper export from `solid-js`; the previous workaround importing from an internal `node_modules` path has been removed.
- `JSX.Element` replaced with `Element` from `solid-js` throughout the public API types.
- `MultiProvider` no longer falls back to accessing `.Provider` on non-function items — contexts passed in `values` must be functions (which all `Context` objects are in Solid 2.0).

## 0.3.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 0.3.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.3.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.2.3

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.2.2

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.2.1

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.2.0

### Minor Changes

- 4135c9bf: Add `MultiProvider` for providing multiple contexts at once.

## 0.1.4

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.1.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.1.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.1.0

0.0.100

Initial release of the context package.
