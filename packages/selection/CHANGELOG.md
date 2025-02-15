# @solid-primitives/selection

## 0.1.1

### Patch Changes

- 4ddea69: fix: selection contenteditable node detection

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.0.8

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.7

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.0.6

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.0.5

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.0.4

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.0.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.0.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.0.1

0.0.100

Initial release as a Stage-0 primitive.
