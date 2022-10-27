# @solid-primitives/props

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
