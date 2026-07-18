# @solid-primitives/script-loader

## 3.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 3.0.0-next.0

### Major Changes

- a874e98: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/script-loader`
  - `isServer` and `spread` now imported from `@solidjs/web` (not `solid-js/web`)
  - `ComponentProps` and `JSX` types now sourced from `@solidjs/web` for correct intrinsic element resolution
  - `splitProps` (removed in Solid 2.0) replaced with plain object extraction
  - Static script attributes applied via `assign` synchronously before reactive src tracking; this means attributes like `type` and `async` are set before the script is appended to the document, which is the correct order for browser loading
  - `createRenderEffect` converted to the split compute/apply pattern required by Solid 2.0; src accessor is tracked in the compute phase and the DOM update applied in the apply phase

## 2.3.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 2.3.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 2.3.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 2.2.0

### Minor Changes

- 7e47dbd: fix events in firefox

## 2.1.2

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 2.1.1

### Patch Changes

- d23dd74: Add type exports for cjs

## 2.1.0

### Minor Changes

- 50c8ab8: fix attributes in hydration

## 2.0.2

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 2.0.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 2.0.0

### Major Changes

- 71433cce: Change `createScriptLoader` API to not return the remove script function - should be done with disposing the owner. React to src changes with createRenderEffect. Apply all passed props using solid's `spread` funcion to the script element.

## 1.1.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.1.2

### Patch Changes

- b662fe9f: Improve package export conditions for SSR (node, workers, deno)

## 1.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.1.0

0.0.100

Initial release.

1.0.2

Release first first with CJS support.

1.0.3

Upgrade to Solid 1.3

1.0.4

Support JS source inclusion.
