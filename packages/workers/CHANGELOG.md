# @solid-primitives/workers

## 0.4.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 0.4.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 0.3.0

### Minor Changes

- a4bb701: fix(workers): export missing types from definitions

## 0.2.7

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.2.6

### Patch Changes

- d23dd74: Add type exports for cjs

## 0.2.5

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.2.4

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.2.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.2.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.2.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.2.0

0.0.100

Initial release as a Stage-1 primitive.

0.0.150

Added signaled workers.

0.0.160

Add CJS and SSR support as well as better building process.

0.1.1

Updated to Solid 1.3
