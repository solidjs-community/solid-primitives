# @solid-primitives/styles

## 0.0.111

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1
  - @solid-primitives/rootless@1.4.2

## 0.0.110

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
  - @solid-primitives/rootless@1.4.1

## 0.0.109

### Patch Changes

- Updated dependencies [2e0bcedf]
- Updated dependencies [5ea65ea9]
  - @solid-primitives/utils@6.1.1
  - @solid-primitives/rootless@1.4.0

## 0.0.108

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0
  - @solid-primitives/rootless@1.3.2

## 0.0.107

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/rootless@1.3.1
  - @solid-primitives/utils@5.5.1

## 0.0.106

### Patch Changes

- 464248f7: Improve behavior of primitives under hydration.
- Updated dependencies [464248f7]
- Updated dependencies [464248f7]
  - @solid-primitives/rootless@1.3.0
  - @solid-primitives/utils@5.5.0

## 0.0.105

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0
  - @solid-primitives/rootless@1.2.6

## 0.0.105-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0
  - @solid-primitives/rootless@1.2.6-beta.0

## 0.0.104

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/rootless@1.2.5
  - @solid-primitives/utils@5.2.1

## 0.0.103

### Patch Changes

- 646f576a: Add `createHydrateSignal` primitive to utils and fix hydration issues
- Updated dependencies [646f576a]
  - @solid-primitives/utils@5.2.0

## 0.0.102

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/rootless@1.2.2

## 0.0.101

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [e36ed229]
- Updated dependencies [b662fe9f]
  - @solid-primitives/rootless@1.2.0
