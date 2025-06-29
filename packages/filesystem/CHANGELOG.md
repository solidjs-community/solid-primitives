# @solid-primitives/filesystem

## 1.3.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 1.3.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 1.3.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.2.2

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.2.1

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.2.0

### Minor Changes

- 15a45a50: filesystem: support for webkitEntries

## 1.1.0

### Minor Changes

- 3525d165: filesystem: rsync utility

## 1.0.0

### Major Changes

- 51b5bec5: improve fail case (return null instead of mock)

## 0.0.101

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
