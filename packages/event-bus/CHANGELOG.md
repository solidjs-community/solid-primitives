# @solid-primitives/event-bus

## 1.0.6

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 1.0.5

### Patch Changes

- 1edee005: Use immutable helpers from `"utils/immutable"`
- Updated dependencies [1edee005]
- Updated dependencies [6415f2ba]
  - @solid-primitives/utils@6.1.0

## 1.0.4

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0
  - @solid-primitives/immutable@0.1.10

## 1.0.3

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/immutable@0.1.9
  - @solid-primitives/utils@5.5.1

## 1.0.2

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0
  - @solid-primitives/immutable@0.1.8

## 1.0.2-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0
  - @solid-primitives/immutable@0.1.8-beta.0

## 1.0.1

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/immutable@0.1.7
  - @solid-primitives/utils@5.2.1

## 1.0.0

### Major Changes

- 13e93e6e: Simplify the API:

  - Remove createSimpleEmitter (createEventBus has the same functionality now)
  - Remove emit/remove Guards from event buses
  - Remove value signal of createEventBus
  - Replace createEmitter with one that can emit various events. A multi channel functionality similar to createEventHub. When event-bus is a single channel.
  - Add `batchEmits` helper that will wrap passed bus and it's `emit` method with Solids `batch`

## 0.1.6

### Patch Changes

- c2866ea6: Update utils package
- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0
  - @solid-primitives/immutable@0.1.6

## 0.1.5

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/immutable@0.1.5
  - @solid-primitives/utils@4.0.1

## 0.1.4

### Patch Changes

- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0
  - @solid-primitives/immutable@0.1.4

## 0.1.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0
  - @solid-primitives/immutable@0.1.3

## 0.1.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/immutable@0.1.2
  - @solid-primitives/utils@3.0.2

## 0.1.1

### Patch Changes

- e7870cb: Update deps.
- Updated dependencies [e7870cb]
  - @solid-primitives/immutable@0.1.1

## Changelog up to version 0.1.0

0.0.100

Initial release as a Stage-2 primitive.

0.0.112

Minor improvement
