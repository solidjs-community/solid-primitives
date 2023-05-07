# @solid-primitives/storage

## 1.3.10

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 1.3.9

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0

## 1.3.8

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/utils@5.5.1

## 1.3.7

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0

## 1.3.7-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0

## 1.3.6

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1

## 1.3.5

### Patch Changes

- 51e80d27: Fix: hydration issue

## 1.3.4

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.3.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.3.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.3.1

0.0.100

Initial release

1.0.0

First proper release of storage engine with CJS support.

1.0.7

Patch CJS support.

1.0.10

Minor patch fixed missing types.

1.1.0

Updated to Solid 1.3

1.1.1

Patched peerDependency issue

1.1.2

Added sync option to disable event synching
