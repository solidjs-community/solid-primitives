# @solid-primitives/active-element

## 2.0.16

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1
  - @solid-primitives/event-listener@2.2.14

## 2.0.15

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
  - @solid-primitives/event-listener@2.2.13

## 2.0.14

### Patch Changes

- Updated dependencies [f03c47b0]
  - @solid-primitives/event-listener@2.2.12

## 2.0.13

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1
  - @solid-primitives/event-listener@2.2.11

## 2.0.12

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0
  - @solid-primitives/event-listener@2.2.10

## 2.0.11

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/event-listener@2.2.9
  - @solid-primitives/utils@5.5.1

## 2.0.10

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0
  - @solid-primitives/event-listener@2.2.8

## 2.0.10-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0
  - @solid-primitives/event-listener@2.2.8-beta.0

## 2.0.9

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/event-listener@2.2.7
  - @solid-primitives/utils@5.2.1

## 2.0.8

### Patch Changes

- 646f576a: Add `createHydrateSignal` primitive to utils and fix hydration issues
- Updated dependencies [646f576a]
  - @solid-primitives/utils@5.2.0

## 2.0.7

### Patch Changes

- Updated dependencies [c2866ea6]
- Updated dependencies [c2866ea6]
  - @solid-primitives/event-listener@2.2.6
  - @solid-primitives/utils@5.0.0

## 2.0.6

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/event-listener@2.2.5
  - @solid-primitives/utils@4.0.1

## 2.0.5

### Patch Changes

- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0
  - @solid-primitives/event-listener@2.2.4

## 2.0.4

### Patch Changes

- fccd18e2: Remove console.log-s

## 2.0.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0
  - @solid-primitives/event-listener@2.2.3

## 2.0.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/event-listener@2.2.2
  - @solid-primitives/utils@3.0.2

## 2.0.1

### Patch Changes

- e7870cb: Update deps.

## Changelog up to version 2.0.0

1.0.0

Initial release as a Stage-2 primitive.

1.0.1

Updated event listener and util dependencies.

1.0.2

Updated to Solid 1.3

2.0.0 - **stage-3**

[PR#113](https://github.com/solidjs-community/solid-primitives/pull/113)

Renamed `createIsElementActive` to `createFocusSignal` and `isElementActive` directive to `focus`.

Add `makeActiveElementListener` & `makeFocusListener` non-reactive primitives.

Removed clear() functions from reactive primitives.
