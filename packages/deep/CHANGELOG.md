# @solid-primitives/deep

## 0.3.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/memo@1.4.0

## 0.2.10

### Patch Changes

- @solid-primitives/memo@1.3.10

## 0.2.9

### Patch Changes

- Updated dependencies [49416e8]
  - @solid-primitives/memo@1.3.9

## 0.2.8

### Patch Changes

- 016fe83: Fix `trackStore` tracking multiple same-object references. (Fixes #582)

## 0.2.7

### Patch Changes

- 74db287: Correct the "homepage" field in package.json
- Updated dependencies [74db287]
  - @solid-primitives/memo@1.3.8

## 0.2.6

### Patch Changes

- @solid-primitives/memo@1.3.7

## 0.2.5

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/memo@1.3.6

## 0.2.4

### Patch Changes

- Updated dependencies [6aa53864]
  - @solid-primitives/memo@1.3.5

## 0.2.3

### Patch Changes

- @solid-primitives/memo@1.3.4

## 0.2.2

### Patch Changes

- @solid-primitives/memo@1.3.3

## 0.2.1

### Patch Changes

- @solid-primitives/memo@1.3.2

## 0.2.0

### Minor Changes

- 04e837cf: Add `captureStoreUpdates` primitive for tracking and capturing updates to a store.

## 0.1.0

### Minor Changes

- 9a307242: - Renames `deepTrack` to `trackDeep` to make it easier to provide similar tracking functions differentiated by the suffix.
  - Slightly improves the performance of `trackDeep` by iterating with `for of` and reusing value type checks.
  - Adds a much more performant alternative - `trackStore` which utilizes memoization and the `$TRACK` symbol to reduce iterating over proxies and traversing unchanged objects.

## 0.0.102

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.0.101

### Patch Changes

- 074961a1: Shorten implementation
