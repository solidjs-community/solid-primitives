# @solid-primitives/idle

## 0.0.105

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.0.104

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.0.103

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.0.102

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.0.101

### Patch Changes

- e3bdcfa0: Make createIdleTimer options argumnet optional.
