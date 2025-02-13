# @solid-primitives/audio

## 1.4.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/static-store@0.1.0
  - @solid-primitives/utils@6.3.0

## 1.3.19

### Patch Changes

- Updated dependencies [56d9511]
  - @solid-primitives/static-store@0.0.9

## 1.3.18

### Patch Changes

- b993fff: Set "COMPLETE" state on "ended"

  Improved ssr support by setting the initial duration and volume to zero for `createAudio` to match the server state.

## 1.3.17

### Patch Changes

- 74db287: Correct the "homepage" field in package.json
- Updated dependencies [74db287]
  - @solid-primitives/static-store@0.0.8

## 1.3.16

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3
  - @solid-primitives/static-store@0.0.7

## 1.3.15

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/static-store@0.0.6
  - @solid-primitives/utils@6.2.2

## 1.3.14

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1
  - @solid-primitives/static-store@0.0.5

## 1.3.13

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
  - @solid-primitives/static-store@0.0.4

## 1.3.12

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1
  - @solid-primitives/static-store@0.0.3

## 1.3.11

### Patch Changes

- 2f6d3732: Use the static-store package for creating reactive objects. Minor overall improvements
- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0
  - @solid-primitives/static-store@0.0.2

## 1.3.10

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/utils@5.5.1

## 1.3.9

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0

## 1.3.9-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0

## 1.3.8

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1

## 1.3.7

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 1.3.6

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 1.3.5

### Patch Changes

- 76ea4cef: Handle exceptions thrown during audio playback.

## 1.3.4

### Patch Changes

- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0

## 1.3.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0

## 1.3.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/utils@3.0.2

## 1.3.1

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0

## Changelog up to version 1.3.0

0.0.100

Pulling an early release of the package together and preparing for 1.0.0 release. No changes.

1.0.0

Minor clean-up, added tests and released.

1.0.1

Added testing and support for srcObject.

1.1.6

Added proper SSR and CJS support.

1.1.8

Updated to Solid 1.3.

1.2.0

Major improvements to bring package in line with project standards.

1.3.0

A major refactor of the `audio` package that includes new basic and reactive primitives.
