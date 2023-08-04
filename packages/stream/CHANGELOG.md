# @solid-primitives/stream

## 0.6.11

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.6.10

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 0.6.9

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 0.6.8

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0

## 0.6.7

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/utils@5.5.1

## 0.6.6

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0

## 0.6.6-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0

## 0.6.5

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1

## 0.6.4

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 0.6.3

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 0.6.2

### Patch Changes

- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0

## 0.6.1

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0

## 0.6.0

### Minor Changes

- 64569c17: Add `createScreen` primitive

## 0.5.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/utils@3.0.2

## 0.5.0

### Minor Changes

- 1d83f92: added createAmplitudeFromStream

## 0.4.0

### Minor Changes

- 730cfcf: add mute method to stream controls

## 0.3.0

### Minor Changes

- 52d3110: Fix for audio context requiring user interaction.

## Changelog up to version 0.2.0

0.0.100

Initial release.

0.0.180

Released a version with CJS and SSR.

0.1.0

Updated for latest Solid.
