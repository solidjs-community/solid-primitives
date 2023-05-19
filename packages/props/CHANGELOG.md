# @solid-primitives/props

## 3.1.6

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 3.1.5

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 3.1.4

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0

## 3.1.3

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/utils@5.5.1

## 3.1.2

### Patch Changes

- e4c7e59c: Improve regex used to extract CSS properties from inline styles.

## 3.1.1

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0

## 3.1.1-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0

## 3.1.0

### Minor Changes

- ddc12685: Add an overload to `combineProps` which allows for passing an options object, with `reverseEventHandlers` option. This option when enabled will cause the event handlers to be called right to left.

### Patch Changes

- Updated dependencies [ddc12685]
  - @solid-primitives/utils@5.3.0

## 3.0.7

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1

## 3.0.6

### Patch Changes

- 0cfb9546: Improve checking event-listener keys

## 3.0.5

### Patch Changes

- 9e444e21: Fix bug with checking for event-listenets on function sources

## 3.0.4

### Patch Changes

- 93a6b4f3: Support function sources in `combineProps`

## 3.0.3

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 3.0.2

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 3.0.1

### Patch Changes

- 27b80ea8: Align the behavior with solid 1.6 mergeProps logic - fixes #235 (combineProps wasn't respecting the check if source is a proxi in mergeProps)
- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0

## 3.0.0

### Major Changes

- 92a8afc4: Move `createCntrolledProp` primitive to a separate package: `@solid-primitives/controlled-props`. This pacakge no longer ships JSX, hence putting it to ssr.noExternal for SSR support is no longer neccessary.

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0

## 2.2.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/utils@3.0.2

## 2.2.1

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0

## Changelog up to version 2.2.0

0.0.100

Initial release

1.0.2

Release initial version with CJS support.

2.0.0 - [PR#127](https://github.com/solidjs-community/solid-primitives/pull/127)

Renamed `createProps` to `createControlledProps`, `createProp` to `createControlledProp` etc. (for all of the primitives focused on testing)

Added `combineProps` primitive

2.1.0

Add support for tuple event handlers and de-dupeing to `combineProps`.

2.1.1

Support for Solid 1.4

2.2.0

Add `filterProps` and `createPropsPredicate` primitives.
