# @solid-primitives/trigger

## 1.0.6

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 1.0.5

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0

## 1.0.4

### Patch Changes

- 83843698: Use `!isServer && DEV` for checking development env to support versions prior to 1.6.12
- Updated dependencies [83843698]
  - @solid-primitives/utils@5.5.2

## 1.0.3

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/utils@5.5.1

## 1.0.2

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0

## 1.0.2-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0

## 1.0.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1

## 1.0.0

### Major Changes

- d6167247: Improve `createTriggerCache` and reactive sets/maps by autocleaning signals that aren't being listened to.

## 0.0.4

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 0.0.3

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 0.0.2

### Patch Changes

- 9ed32b38: Moves trigger primitives from utils to @solid-primitives/trigger package. Better utilize WeakMaps for caching triggers.
- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0
