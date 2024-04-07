# @solid-primitives/storage

## 3.2.0

### Minor Changes

- 40380a2: safe sync deserialization
- 407a630: Bugfix for newly introduced sync api. Now BroadcastChannel for `messageSync` should also work as expected.
- c5145af: fix withOptions

## 3.1.0

### Minor Changes

- 713cac6: add forgotten withOptions method to cookieStorage

## 3.0.0

### Major Changes

- bf7605c: storage: new sync API, multiplexing, cookieStorage fixes, withOptions

## 2.1.4

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 2.1.3

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 2.1.2

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 2.1.1

### Patch Changes

- a5f01c30: Loosen solid-start peer dependency

## 2.1.0

### Minor Changes

- 92041fd3: allow providing request getter / cookie setter on the server

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 2.0.0

### Major Changes

- d0453ccf: new makePersisted primitive, deprecated old API

## 1.3.11

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

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
