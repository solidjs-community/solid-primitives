# @solid-primitives/utils

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
