# @solid-primitives/utils

## 6.2.0

### Minor Changes

- 3c007b92: Add more of common constants to utils

## 6.1.1

### Patch Changes

- 2e0bcedf: Don't call the next createMicrotask callback if cleanup happens

## 6.1.0

### Minor Changes

- 1edee005: Moves the exiting immutable helpers from the `immutable` package to `utils/immutable` submodule.

  The immutable package is replaced with a new `createImmutable` primitive for creating stores derived from immutable structures. (issue #140)

- 6415f2ba: Add `NoInfer` type

## 6.0.0

### Major Changes

- 2f6d3732: Move createStaticStore to a separate `static-store` package.

## 5.5.2

### Patch Changes

- 83843698: Use `!isServer && DEV` for checking development env to support versions prior to 1.6.12

## 5.5.1

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 5.5.0

### Minor Changes

- 464248f7: Add `createHydratableSignal` (deprecated createHydrateSignal) and `createHydratableStore`

## 5.4.0

### Minor Changes

- d6559a32: Export `ResolvedJSXElement` and `ResolvedChildren` types from utils

## 5.4.0-beta.0

### Minor Changes

- d6559a32: Export `ResolvedJSXElement` and `ResolvedChildren` types from utils

## 5.3.0

### Minor Changes

- ddc12685: Add `reverseChain` util as an alternative to `chain`

## 5.2.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 5.2.0

### Minor Changes

- 646f576a: Add `createHydrateSignal` primitive to utils and fix hydration issues

## 5.1.1

### Patch Changes

- 22f78f52: Improve the Narrow type

## 5.1.0

### Minor Changes

- c1538561: Add Narrow type utility.

## 5.0.0

### Major Changes

- c2866ea6: Add `defer`, remove `createProxy` and `forEachEntry`, rename `onRootCleanup` to `tryOnCleanup` and `SetterValue` to `SetterParam`.

## 4.0.1

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 4.0.0

### Major Changes

- 9ed32b38: Moves trigger primitives from utils to @solid-primitives/trigger package. Better utilize WeakMaps for caching triggers.

## 3.1.0

### Minor Changes

- a372d0e7: Remove `warn` and `noop` functions.

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- abb8063c: Remove `forEachEntry` utility

## 3.0.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## 3.0.1

### Patch Changes

- 555e973: add "readonly" to handleDiffArray array arguments

## 3.0.0

### Major Changes

- 73b6a34: rename `until` -> `promise` package & move `raceTimeout` and `promiseTimeout` to `promise` package

## Changelog up to version 2.2.1

0.0.100

First commit of the timer primitive.

0.0.250

Republished version with better ESM support and build tooling.

0.0.260

Added comments for util methods.

0.1.0

Add `/fp` and `/setter` export entries. Add `destore` and `raceTimeout` util. More jsdoc.

0.1.2

Updated to Solid 1.3

0.1.3

Minor upgrades.
