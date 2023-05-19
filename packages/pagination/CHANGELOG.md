# @solid-primitives/pagination

## 0.2.7

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 0.2.6

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 0.2.5

### Patch Changes

- f2f77197: Remove intersection-observer package dependency

## 0.2.4

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0
  - @solid-primitives/intersection-observer@2.0.11

## 0.2.3

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/intersection-observer@2.0.9
  - @solid-primitives/utils@5.5.1

## 0.2.2

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0
  - @solid-primitives/intersection-observer@2.0.8

## 0.2.2-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0
  - @solid-primitives/intersection-observer@2.0.8-beta.0

## 0.2.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/intersection-observer@2.0.7
  - @solid-primitives/utils@5.2.1

## 0.2.0

### Minor Changes

- 46a2ae79: make options reactive, prevent wrong page slice

## 0.1.0

### Minor Changes

- a6277325: added new `createInfiniteScroll` primitive

## 0.0.103

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 0.0.102

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 0.0.101

### Patch Changes

- 6d8ed09b: initial release: pagination
