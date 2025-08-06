# @solid-primitives/script-loader

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
