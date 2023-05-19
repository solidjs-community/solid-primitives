# @solid-primitives/deep

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
