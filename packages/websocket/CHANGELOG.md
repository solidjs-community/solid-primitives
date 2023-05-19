# @solid-primitives/websocket

## 1.1.0

### Minor Changes

- eb3e9a2d: ready state signal for websockets

## 1.0.0

### Major Changes

- 01b581ed: websocket: rewrite

## 0.3.7

### Patch Changes

- 43ac489f: Add `WebsocketState` type

## 0.3.6

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.3.5

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.3.4

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.3.3

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.3.2

### Patch Changes

- 1f266d23: Updated the reconnectLimit to avoid reconnection on calling disconnect function

## 0.3.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.3.0

0.0.100

Initial version. Proposed and waiting for feedback.

0.3.0

Fixed package exports.
