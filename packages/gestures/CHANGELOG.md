# @solid-primitives/gestures

## 1.1.5

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.1.4

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 1.1.3

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.1.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.1.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.1.0

1.0.0

First ported commit from svelte-gestures.
