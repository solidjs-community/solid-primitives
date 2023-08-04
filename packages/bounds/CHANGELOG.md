# @solid-primitives/bounds

## 0.0.115

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1
  - @solid-primitives/event-listener@2.2.14
  - @solid-primitives/resize-observer@2.0.19
  - @solid-primitives/static-store@0.0.5

## 0.0.114

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
  - @solid-primitives/event-listener@2.2.13
  - @solid-primitives/resize-observer@2.0.18
  - @solid-primitives/static-store@0.0.4

## 0.0.113

### Patch Changes

- Updated dependencies [f03c47b0]
  - @solid-primitives/event-listener@2.2.12
  - @solid-primitives/resize-observer@2.0.17

## 0.0.112

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1
  - @solid-primitives/event-listener@2.2.11
  - @solid-primitives/resize-observer@2.0.16
  - @solid-primitives/static-store@0.0.3

## 0.0.111

### Patch Changes

- 2f6d3732: Use the static-store package for creating reactive objects. Minor overall improvements
- Updated dependencies [2f6d3732]
- Updated dependencies [2f6d3732]
  - @solid-primitives/resize-observer@2.0.14
  - @solid-primitives/utils@6.0.0
  - @solid-primitives/event-listener@2.2.10
  - @solid-primitives/static-store@0.0.2

## 0.0.110

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/resize-observer@2.0.13
  - @solid-primitives/event-listener@2.2.9
  - @solid-primitives/utils@5.5.1

## 0.0.109

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0
  - @solid-primitives/event-listener@2.2.8
  - @solid-primitives/resize-observer@2.0.11

## 0.0.109-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0
  - @solid-primitives/event-listener@2.2.8-beta.0
  - @solid-primitives/resize-observer@2.0.11-beta.0

## 0.0.108

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/event-listener@2.2.7
  - @solid-primitives/resize-observer@2.0.10
  - @solid-primitives/utils@5.2.1

## 0.0.107

### Patch Changes

- Updated dependencies [c2866ea6]
- Updated dependencies [c2866ea6]
  - @solid-primitives/event-listener@2.2.6
  - @solid-primitives/utils@5.0.0
  - @solid-primitives/resize-observer@2.0.9

## 0.0.106

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/resize-observer@2.0.8
  - @solid-primitives/event-listener@2.2.5
  - @solid-primitives/utils@4.0.1

## 0.0.105

### Patch Changes

- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0
  - @solid-primitives/event-listener@2.2.4
  - @solid-primitives/resize-observer@2.0.6

## 0.0.104

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0
  - @solid-primitives/event-listener@2.2.3
  - @solid-primitives/resize-observer@2.0.5

## 0.0.102

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/event-listener@2.2.2
  - @solid-primitives/resize-observer@2.0.4
  - @solid-primitives/utils@3.0.2

## 0.0.101

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0
  - @solid-primitives/event-listener@2.2.1
  - @solid-primitives/resize-observer@2.0.3

## Changelog up to version 0.0.100

0.0.100

Initial release as a Stage-0 primitive.
